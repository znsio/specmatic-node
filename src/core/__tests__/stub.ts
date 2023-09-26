import path from 'path';
import { ChildProcess, spawn } from 'child_process';
import { mock as jestMock, mockReset } from 'jest-mock-extended';
import { Readable } from 'stream';
import terminate from 'terminate/promise';

import * as specmatic from '../..';
import { specmaticCoreJarName } from '../../config';
import { Stub } from '..';
import * as shutDown from '../shutdownUtils'


jest.mock('child_process');
jest.mock('terminate');
jest.mock('../shutdownUtils')

const SPECMATIC_JAR_PATH = path.resolve(__dirname, '..', '..', '..', specmaticCoreJarName);
const HOST = 'localhost';
const PORT = 8000;

const javaProcessMock = jestMock<ChildProcess>();
const readableMock = jestMock<Readable>();
javaProcessMock.stdout = readableMock;
javaProcessMock.stderr = readableMock;

const stubUrl = `http://${HOST}:${PORT}`;
const stub = new Stub(HOST, PORT, stubUrl, javaProcessMock);

beforeEach(() => {
    jest.resetAllMocks();
});

test('starts the specmatic stub server', async () => {
    spawn.mockReturnValue(javaProcessMock);
    setTimeout(() => readableMock.on.mock.calls[0][1](`Stub server is running on ${stubUrl}`), 0);

    await expect(specmatic.startStub(HOST, PORT)).resolves.toStrictEqual(stub);

    expect(spawn.mock.calls[0][1][1]).toBe(`"${path.resolve(SPECMATIC_JAR_PATH)}"`);
    expect(spawn.mock.calls[0][1][2]).toBe(`stub --host=${HOST} --port=${PORT}`);
});

test('notifies when start fails due to port not available', async () => {
    spawn.mockReturnValue(javaProcessMock);
    setTimeout(() => readableMock.on.mock.calls[0][1]('Address already in use'), 0);

    await expect(specmatic.startStub(HOST, PORT)).toReject();

    expect(spawn.mock.calls[0][1][1]).toBe(`"${path.resolve(SPECMATIC_JAR_PATH)}"`);
    expect(spawn.mock.calls[0][1][2]).toBe(`stub --host=${HOST} --port=${PORT}`);
});

test('returns host, port and stub url', async () => {
    spawn.mockReturnValue(javaProcessMock);
    const randomPort = 62269;
    const stubUrl = `http://${HOST}:${randomPort}`;
    setTimeout(() => readableMock.on.mock.calls[0][1](`Stub server is running on ${stubUrl}. Ctrl + C to stop.`), 0);

    const stub = new Stub(HOST, randomPort, stubUrl, javaProcessMock);

    await expect(specmatic.startStub(HOST, PORT)).resolves.toStrictEqual(stub);

    expect(spawn.mock.calls[0][1][1]).toBe(`"${path.resolve(SPECMATIC_JAR_PATH)}"`);
    expect(spawn.mock.calls[0][1][2]).toBe(`stub --host=${HOST} --port=${PORT}`);
});

test('fails if stub url is not available in start up message', async () => {
    spawn.mockReturnValue(javaProcessMock);
    setTimeout(() => readableMock.on.mock.calls[0][1](`Stub server is running`), 0);

    await expect(specmatic.startStub(HOST, PORT)).toReject();

    expect(spawn.mock.calls[0][1][1]).toBe(`"${path.resolve(SPECMATIC_JAR_PATH)}"`);
    expect(spawn.mock.calls[0][1][2]).toBe(`stub --host=${HOST} --port=${PORT}`);
});

test('fails if host info is not available in start up message', async () => {
    spawn.mockReturnValue(javaProcessMock);
    const stubUrl = `http://`;
    setTimeout(() => readableMock.on.mock.calls[0][1](`Stub server is running on ${stubUrl}`), 0);

    await expect(specmatic.startStub(HOST, PORT)).toReject();

    expect(spawn.mock.calls[0][1][1]).toBe(`"${path.resolve(SPECMATIC_JAR_PATH)}"`);
    expect(spawn.mock.calls[0][1][2]).toBe(`stub --host=${HOST} --port=${PORT}`);
});

test('fails if port info is not available in start up message', async () => {
    spawn.mockReturnValue(javaProcessMock);
    const stubUrl = `http://${HOST}`;
    setTimeout(() => readableMock.on.mock.calls[0][1](`Stub server is running on ${stubUrl}`), 0);

    await expect(specmatic.startStub(HOST, PORT)).toReject();

    expect(spawn.mock.calls[0][1][1]).toBe(`"${path.resolve(SPECMATIC_JAR_PATH)}"`);
    expect(spawn.mock.calls[0][1][2]).toBe(`stub --host=${HOST} --port=${PORT}`);
});

test('host and port are optional', async () => {
    spawn.mockReturnValue(javaProcessMock);
    setTimeout(() => readableMock.on.mock.calls[0][1](`Stub server is running on ${stubUrl}`), 0);

    await expect(specmatic.startStub()).resolves.toStrictEqual(stub);

    expect(spawn.mock.calls[0][1][1]).toBe(`"${path.resolve(SPECMATIC_JAR_PATH)}"`);
    expect(spawn.mock.calls[0][1][2]).toBe('stub');
});

test('takes additional pass through arguments', async () => {
    spawn.mockReturnValue(javaProcessMock);
    setTimeout(() => readableMock.on.mock.calls[0][1](`Stub server is running on ${stubUrl}`), 0);

    await expect(specmatic.startStub(HOST, PORT, ['p1', 'p2'])).resolves.toStrictEqual(stub);

    expect(spawn.mock.calls[0][1][1]).toBe(`"${path.resolve(SPECMATIC_JAR_PATH)}"`);
    expect(spawn.mock.calls[0][1][2]).toBe(`stub --host=${HOST} --port=${PORT} p1 p2`);
});

test('additional pass through arguments can be string or number', async () => {
    spawn.mockReturnValue(javaProcessMock);
    setTimeout(() => readableMock.on.mock.calls[0][1](`Stub server is running on ${stubUrl}`), 0);

    await expect(specmatic.startStub(HOST, PORT, ['p1', 123])).resolves.toStrictEqual(stub);

    expect(spawn.mock.calls[0][1][1]).toBe(`"${path.resolve(SPECMATIC_JAR_PATH)}"`);
    expect(spawn.mock.calls[0][1][2]).toBe(`stub --host=${HOST} --port=${PORT} p1 123`);
});

test('stopStub method stops any running stub server', async () => {
    shutDown.gracefulShutdown.mockResolvedValue(true);
    specmatic.stopStub(stub);

    expect(readableMock.removeAllListeners).toHaveBeenCalledTimes(2);
    expect(javaProcessMock.removeAllListeners).toHaveBeenCalledTimes(1);
    expect(shutDown.gracefulShutdown).toHaveBeenCalledTimes(1);
});
