import execSh from 'exec-sh';
import path from 'path';
import { ChildProcess } from 'child_process';
import { mock as jestMock, mockReset } from 'jest-mock-extended';
import { Readable } from 'stream';

import * as specmatic from '../..';
import { specmaticJarName } from '../../config';
import { Stub } from '..';

jest.mock('exec-sh');

const SPECMATIC_JAR_PATH = path.resolve(__dirname, '..', '..', '..', specmaticJarName);
const HOST = 'localhost';
const PORT = 8000;

const javaProcessMock = jestMock<ChildProcess>();
const readableMock = jestMock<Readable>();
javaProcessMock.stdout = readableMock;
javaProcessMock.stderr = readableMock;

const stubUrl = `http://${HOST}:${PORT}`;
const stub = new Stub(HOST, PORT, stubUrl, javaProcessMock);

beforeEach(() => {
    execSh.mockReset();
    mockReset(javaProcessMock);
    mockReset(readableMock);
});

test('starts the specmatic stub server', async () => {
    execSh.mockReturnValue(javaProcessMock);
    setTimeout(() => readableMock.on.mock.calls[0][1](`Stub server is running on ${stubUrl}`), 0);

    await expect(specmatic.startStub(HOST, PORT)).resolves.toStrictEqual(stub);

    expect(execSh).toHaveBeenCalledTimes(1);
    expect(execSh.mock.calls[0][0]).toBe(`java -jar ${path.resolve(SPECMATIC_JAR_PATH)} stub --host=${HOST} --port=${PORT}`);
});

test('notifies when start fails due to port not available', async () => {
    execSh.mockReturnValue(javaProcessMock);
    setTimeout(() => readableMock.on.mock.calls[0][1]('Address already in use'), 0);

    await expect(specmatic.startStub(HOST, PORT)).toReject();

    expect(execSh).toHaveBeenCalledTimes(1);
    expect(execSh.mock.calls[0][0]).toBe(`java -jar ${path.resolve(SPECMATIC_JAR_PATH)} stub --host=${HOST} --port=${PORT}`);
});

test('returns host, port and stub url', async () => {
    execSh.mockReturnValue(javaProcessMock);
    const randomPort = 62269;
    const stubUrl = `http://${HOST}:${randomPort}`;
    setTimeout(() => readableMock.on.mock.calls[0][1](`Stub server is running on ${stubUrl}. Ctrl + C to stop.`), 0);

    const stub = new Stub(HOST, randomPort, stubUrl, javaProcessMock);

    await expect(specmatic.startStub(HOST, PORT)).resolves.toStrictEqual(stub);

    expect(execSh).toHaveBeenCalledTimes(1);
    expect(execSh.mock.calls[0][0]).toBe(`java -jar ${path.resolve(SPECMATIC_JAR_PATH)} stub --host=${HOST} --port=${PORT}`);
});

test('fails if stub url is not available in start up message', async () => {
    execSh.mockReturnValue(javaProcessMock);
    setTimeout(() => readableMock.on.mock.calls[0][1](`Stub server is running`), 0);

    await expect(specmatic.startStub(HOST, PORT)).toReject();

    expect(execSh).toHaveBeenCalledTimes(1);
    expect(execSh.mock.calls[0][0]).toBe(`java -jar ${path.resolve(SPECMATIC_JAR_PATH)} stub --host=${HOST} --port=${PORT}`);
});

test('fails if host info is not available in start up message', async () => {
    execSh.mockReturnValue(javaProcessMock);
    const stubUrl = `http://`;
    setTimeout(() => readableMock.on.mock.calls[0][1](`Stub server is running on ${stubUrl}`), 0);

    await expect(specmatic.startStub(HOST, PORT)).toReject();

    expect(execSh).toHaveBeenCalledTimes(1);
    expect(execSh.mock.calls[0][0]).toBe(`java -jar ${path.resolve(SPECMATIC_JAR_PATH)} stub --host=${HOST} --port=${PORT}`);
});

test('fails if port info is not available in start up message', async () => {
    execSh.mockReturnValue(javaProcessMock);
    const stubUrl = `http://${HOST}`;
    setTimeout(() => readableMock.on.mock.calls[0][1](`Stub server is running on ${stubUrl}`), 0);

    await expect(specmatic.startStub(HOST, PORT)).toReject();

    expect(execSh).toHaveBeenCalledTimes(1);
    expect(execSh.mock.calls[0][0]).toBe(`java -jar ${path.resolve(SPECMATIC_JAR_PATH)} stub --host=${HOST} --port=${PORT}`);
});

test('host and port are optional', async () => {
    execSh.mockReturnValue(javaProcessMock);
    setTimeout(() => readableMock.on.mock.calls[0][1](`Stub server is running on ${stubUrl}`), 0);

    await expect(specmatic.startStub()).resolves.toStrictEqual(stub);

    expect(execSh).toHaveBeenCalledTimes(1);
    expect(execSh.mock.calls[0][0]).toBe(`java -jar ${path.resolve(SPECMATIC_JAR_PATH)} stub`);
});

test('takes additional pass through arguments', async () => {
    execSh.mockReturnValue(javaProcessMock);
    setTimeout(() => readableMock.on.mock.calls[0][1](`Stub server is running on ${stubUrl}`), 0);

    await expect(specmatic.startStub(HOST, PORT, ['p1', 'p2'])).resolves.toStrictEqual(stub);

    expect(execSh).toHaveBeenCalledTimes(1);
    expect(execSh.mock.calls[0][0]).toBe(`java -jar ${path.resolve(SPECMATIC_JAR_PATH)} stub --host=${HOST} --port=${PORT} p1 p2`);
});

test('additional pass through arguments can be string or number', async () => {
    execSh.mockReturnValue(javaProcessMock);
    setTimeout(() => readableMock.on.mock.calls[0][1](`Stub server is running on ${stubUrl}`), 0);

    await expect(specmatic.startStub(HOST, PORT, ['p1', 123])).resolves.toStrictEqual(stub);

    expect(execSh).toHaveBeenCalledTimes(1);
    expect(execSh.mock.calls[0][0]).toBe(`java -jar ${path.resolve(SPECMATIC_JAR_PATH)} stub --host=${HOST} --port=${PORT} p1 123`);
});

test('stopStub method stops any running stub server', () => {
    specmatic.stopStub(stub);

    expect(readableMock.removeAllListeners).toHaveBeenCalledTimes(2);
    expect(javaProcessMock.removeAllListeners).toHaveBeenCalledTimes(1);
    expect(javaProcessMock.kill).toHaveBeenCalledTimes(1);
});
