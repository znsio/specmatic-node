import execSh from 'exec-sh';
import fetch from 'node-fetch';
import path from 'path';
import { ChildProcess } from 'child_process';
import { mock as jestMock, mockReset } from 'jest-mock-extended';
import { Readable } from 'stream';
import { copyFileSync, mkdirSync, existsSync } from 'fs';
import fs from 'fs';

import * as specmatic from '../../';
import { specmaticJarName } from '../../config';
import mockStub from '../../../test-resources/sample-mock-stub.json';

jest.mock('exec-sh');
jest.mock('node-fetch');

const fetchMock = fetch as unknown as jest.Mock;

const SPECMATIC_JAR_PATH = path.resolve(__dirname, '..', '..', '..', specmaticJarName);
const STUB_PATH = 'test-resources/sample-mock-stub.json';
const CONTRACT_FILE_PATH = './contracts';
const STUB_DIR_PATH = './data';
const HOST = 'localhost';
const PORT = '8000';

const javaProcessMock = jestMock<ChildProcess>();
const readableMock = jestMock<Readable>();
javaProcessMock.stdout = readableMock;
javaProcessMock.stderr = readableMock;

beforeEach(() => {
    execSh.mockReset();
    fetchMock.mockReset();
    mockReset(javaProcessMock);
    mockReset(readableMock);
});

test('startStub method starts the specmatic stub server', async () => {
    execSh.mockReturnValue(javaProcessMock);
    setTimeout(() => readableMock.on.mock.calls[0][1]('Stub server is running'), 0);

    await expect(specmatic.startStub(HOST, PORT)).resolves.toBe(javaProcessMock);

    expect(execSh).toHaveBeenCalledTimes(1);
    expect(execSh.mock.calls[0][0]).toBe(
        `java -jar ${path.resolve(SPECMATIC_JAR_PATH)} stub --host=${HOST} --port=${PORT}`
    );
});

test('startStub method notifies when start fails due to port not available', async () => {
    execSh.mockReturnValue(javaProcessMock);
    setTimeout(() => readableMock.on.mock.calls[0][1]('Address already in use'), 0);

    await expect(specmatic.startStub(HOST, PORT)).toReject();

    expect(execSh).toHaveBeenCalledTimes(1);
    expect(execSh.mock.calls[0][0]).toBe(
        `java -jar ${path.resolve(SPECMATIC_JAR_PATH)} stub --host=${HOST} --port=${PORT}`
    );
});

test('startStub method host and port are optional', async () => {
    execSh.mockReturnValue(javaProcessMock);
    setTimeout(() => readableMock.on.mock.calls[0][1]('Stub server is running'), 0);

    await expect(specmatic.startStub()).resolves.toBe(javaProcessMock);

    expect(execSh).toHaveBeenCalledTimes(1);
    expect(execSh.mock.calls[0][0]).toBe(`java -jar ${path.resolve(SPECMATIC_JAR_PATH)} stub`);
});

test('startStub method takes additional pass through arguments', async () => {
    execSh.mockReturnValue(javaProcessMock);
    setTimeout(() => readableMock.on.mock.calls[0][1]('Stub server is running'), 0);

    await expect(specmatic.startStub(HOST, PORT, ['p1', 'p2'])).resolves.toBe(javaProcessMock);

    expect(execSh).toHaveBeenCalledTimes(1);
    expect(execSh.mock.calls[0][0]).toBe(`java -jar ${path.resolve(SPECMATIC_JAR_PATH)} stub --host=${HOST} --port=${PORT} p1 p2`);
});

test('startStub method takes additional pass through arguments can be string or number', async () => {
    execSh.mockReturnValue(javaProcessMock);
    setTimeout(() => readableMock.on.mock.calls[0][1]('Stub server is running'), 0);

    await expect(specmatic.startStub(HOST, PORT, ['p1', 123])).resolves.toBe(javaProcessMock);

    expect(execSh).toHaveBeenCalledTimes(1);
    expect(execSh.mock.calls[0][0]).toBe(`java -jar ${path.resolve(SPECMATIC_JAR_PATH)} stub --host=${HOST} --port=${PORT} p1 123`);
});

test('stopStub method stops any running stub server', () => {
    specmatic.stopStub(javaProcessMock);

    expect(readableMock.removeAllListeners).toHaveBeenCalledTimes(2);
    expect(javaProcessMock.removeAllListeners).toHaveBeenCalledTimes(1);
    expect(javaProcessMock.kill).toHaveBeenCalledTimes(1);
});

test('test runs the contract tests', async function () {
    execSh.mockReturnValue(javaProcessMock);
    setTimeout(() => {
        copyReportFile();
        execSh.mock.calls[0][2]();
    }, 0);

    await expect(specmatic.test(HOST, PORT, CONTRACT_FILE_PATH)).resolves.toBeTruthy();

    expect(execSh).toHaveBeenCalledTimes(1);
    expect(execSh.mock.calls[0][0]).toBe(
        `java -jar ${path.resolve(SPECMATIC_JAR_PATH)} test ${path.resolve(
            CONTRACT_FILE_PATH
        )} --junitReportDir=dist/test-report --host=${HOST} --port=${PORT}`
    );
});

test('test takes additional pass through arguments', async () => {
    execSh.mockReturnValue(javaProcessMock);
    setTimeout(() => {
        copyReportFile();
        execSh.mock.calls[0][2]();
    }, 0);

    await expect(specmatic.test(HOST, PORT, CONTRACT_FILE_PATH, ['P1', 'P2'])).resolves.toBeTruthy();

    expect(execSh).toHaveBeenCalledTimes(1);
    expect(execSh.mock.calls[0][0]).toBe(
        `java -jar ${path.resolve(SPECMATIC_JAR_PATH)} test ${path.resolve(
            CONTRACT_FILE_PATH
        )} --junitReportDir=dist/test-report --host=${HOST} --port=${PORT} P1 P2`
    );
});

test('test takes additional pass through arguments can be string or number', async () => {
    execSh.mockReturnValue(javaProcessMock);
    setTimeout(() => {
        copyReportFile();
        execSh.mock.calls[0][2]();
    }, 0);

    await expect(specmatic.test(HOST, PORT, CONTRACT_FILE_PATH, ['P1', 123])).resolves.toBeTruthy();

    expect(execSh).toHaveBeenCalledTimes(1);
    expect(execSh.mock.calls[0][0]).toBe(
        `java -jar ${path.resolve(SPECMATIC_JAR_PATH)} test ${path.resolve(
            CONTRACT_FILE_PATH
        )} --junitReportDir=dist/test-report --host=${HOST} --port=${PORT} P1 123`
    );
});

test('test runs the contract tests with host and port optional', async function () {
    execSh.mockReturnValue(javaProcessMock);
    setTimeout(() => {
        copyReportFile();
        execSh.mock.calls[0][2]();
    }, 0);

    await expect(specmatic.test()).resolves.toBeTruthy();

    expect(execSh).toHaveBeenCalledTimes(1);
    expect(execSh.mock.calls[0][0]).toBe(`java -jar ${path.resolve(SPECMATIC_JAR_PATH)} test --junitReportDir=dist/test-report`);
});

test('test runs the contract tests with contracts path optional', async function () {
    execSh.mockReturnValue(javaProcessMock);
    setTimeout(() => {
        copyReportFile();
        execSh.mock.calls[0][2]();
    }, 0);

    await expect(specmatic.test(HOST, PORT)).resolves.toBeTruthy();

    expect(execSh).toHaveBeenCalledTimes(1);
    expect(execSh.mock.calls[0][0]).toBe(
        `java -jar ${path.resolve(SPECMATIC_JAR_PATH)} test --junitReportDir=dist/test-report --host=${HOST} --port=${PORT}`
    );
});

test('test runs the contract tests and get summary', async function () {
    execSh.mockReturnValue(javaProcessMock);
    setTimeout(() => {
        copyReportFile();
        execSh.mock.calls[0][2]();
    }, 0);

    await expect(specmatic.test()).resolves.toStrictEqual({
        total: 5,
        success: 3,
        failure: 2,
    });
});

test('test runs the contract tests and get summary with skipped tests', async function () {
    execSh.mockReturnValue(javaProcessMock);
    setTimeout(() => {
        copyReportFileWithName('sample-junit-result-skipped.xml');
        execSh.mock.calls[0][2]();
    }, 0);

    await expect(specmatic.test()).resolves.toStrictEqual({
        total: 3,
        success: 2,
        failure: 1,
    });
});

test('test runs the contract tests and get summary when there is just one test', async function () {
    execSh.mockReturnValue(javaProcessMock);
    setTimeout(() => {
        copyReportFileWithName('sample-junit-result-single.xml');
        execSh.mock.calls[0][2]();
    }, 0);

    await expect(specmatic.test()).resolves.toStrictEqual({
        total: 1,
        success: 1,
        failure: 0,
    });
});

test('test invocation makes sure previous junit report if any is deleted', async function () {
    const spy = jest.spyOn(fs, 'rmSync');
    execSh.mockReturnValue(javaProcessMock);
    setTimeout(() => {
        copyReportFileWithName('sample-junit-result-single.xml');
        execSh.mock.calls[0][2]();
    }, 0);

    await specmatic.test();

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(path.resolve('dist/test-report'), { force: true, recursive: true });
});

test('printJarVersion', () => {
    execSh.mockReturnValue(javaProcessMock);

    specmatic.printJarVersion();

    expect(execSh).toHaveBeenCalledTimes(1);
    expect(execSh.mock.calls[0][0]).toBe(`java -jar ${path.resolve(SPECMATIC_JAR_PATH)} --version`);
});

test('setExpectations with default baseUrl', async () => {
    fetchMock.mockReturnValue(Promise.resolve({status: 200}));
    await expect(specmatic.setExpectations(path.resolve(STUB_PATH))).toResolve();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe('http://localhost:9000/_specmatic/expectations');
    expect(fetchMock.mock.calls[0][1]).toMatchObject({
        method: 'POST',
        body: JSON.stringify(mockStub),
    });
});

test('setExpectations with a different baseUrl for the stub server', async () => {
    fetchMock.mockReturnValue(Promise.resolve({status: 200}));
    const stubServerBaseUrl = 'http://localhost:8000/';

    await expect(specmatic.setExpectations(path.resolve(STUB_PATH), stubServerBaseUrl)).toResolve();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe(`${stubServerBaseUrl}_specmatic/expectations`);
    expect(fetchMock.mock.calls[0][1]).toMatchObject({
        method: 'POST',
        body: JSON.stringify(mockStub),
    });
});

test('setExpectations notifies when it fails', async () => {
    fetchMock.mockReturnValue(Promise.reject());

    await expect(specmatic.setExpectations(path.resolve(STUB_PATH))).toReject();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe('http://localhost:9000/_specmatic/expectations');
    expect(fetchMock.mock.calls[0][1]).toMatchObject({
        method: 'POST',
        body: JSON.stringify(mockStub),
    });
});

test('setExpectations notifies as failure when status code is not 200', async () => {
    fetchMock.mockReturnValue(Promise.resolve({status: 400}));
    const stubServerBaseUrl = 'http://localhost:8000/';

    await expect(specmatic.setExpectations(path.resolve(STUB_PATH), stubServerBaseUrl)).toReject();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe(`${stubServerBaseUrl}_specmatic/expectations`);
    expect(fetchMock.mock.calls[0][1]).toMatchObject({
        method: 'POST',
        body: JSON.stringify(mockStub),
    });
});

test('setTestResults invokes the test function', () => {
    const cb = jest.fn();
    copyReportFile();
    specmatic.showTestResults(cb);
    expect(cb).toHaveBeenCalledTimes(5);
    expect(() => cb.mock.calls[0][1]()).not.toThrow();
    expect(() => cb.mock.calls[1][1]()).not.toThrow();
    expect(() => cb.mock.calls[2][1]()).not.toThrow();
    expect(() => cb.mock.calls[3][1]()).toThrow();
    expect(() => cb.mock.calls[4][1]()).toThrow();
});

test('setTestResults works with junit report with generative tests mode', () => {
    const cb = jest.fn();
    copyReportFileWithName('sample-junit-result-generative.xml');
    specmatic.showTestResults(cb);
    expect(cb).toHaveBeenCalledTimes(4);
});

test('setTestResults says "No Name" with junit report where test name cannot be found within system-out tag', () => {
    const cb = jest.fn();
    copyReportFileWithName('sample-junit-result-no-testname.xml');
    specmatic.showTestResults(cb);
    expect(cb).toHaveBeenCalledTimes(1);
    expect(cb).toHaveBeenCalledWith('No Name', expect.any(Function));
});

test('setTestResults says "No Name" with junit report where system-out tag does not exist', () => {
    const cb = jest.fn();
    copyReportFileWithName('sample-junit-result-corrupt.xml');
    specmatic.showTestResults(cb);
    expect(cb).toHaveBeenCalledTimes(1);
    expect(cb).toHaveBeenCalledWith('No Name', expect.any(Function));
});

test('setTestResults with report having skipped tests', () => {
    const cb = jest.fn();
    copyReportFileWithName('sample-junit-result-skipped.xml');
    specmatic.showTestResults(cb);
    expect(cb).toHaveBeenCalledTimes(3);
    expect(() => cb.mock.calls[0][1]()).toThrow();
    expect(() => cb.mock.calls[1][1]()).not.toThrow();
    expect(() => cb.mock.calls[2][1]()).not.toThrow();
});

function copyReportFile() {
    copyReportFileWithName('sample-junit-result-multiple.xml');
}

function copyReportFileWithName(fileName: string) {
    const destDir = path.resolve('dist/test-report');
    if (!existsSync(destDir)) {
        mkdirSync(destDir, { recursive: true });
    }
    const srcPath = path.resolve('test-resources', fileName);
    const destPath = path.resolve(destDir, 'TEST-junit-jupiter.xml');
    copyFileSync(srcPath, destPath);
}
