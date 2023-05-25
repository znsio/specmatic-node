import execSh from 'exec-sh';
import fetch from 'node-fetch';
import path from 'path';
import { ChildProcess } from 'child_process';
import { mock as jestMock } from 'jest-mock-extended';
import { Readable } from 'stream';
import { copyFileSync, mkdirSync, existsSync } from 'fs';

import * as specmatic from '../../';
import { specmaticJarPathLocal } from '../../config';
import mockStub from '../../../test-resources/sample-mock-stub.json';

jest.mock('exec-sh');
jest.mock('node-fetch');

const fetchMock = (fetch as unknown as jest.Mock)

const STUB_PATH = 'test-resources/sample-mock-stub.json';
const CONTRACT_YAML_FILE_PATH = './contracts';
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
});

test('startStub method starts the specmatic stub server', async () => {
    execSh.mockReturnValue(javaProcessMock);

    specmatic.startStub(HOST, PORT, STUB_DIR_PATH).then(javaProcess => {
        expect(javaProcess).toBe(javaProcessMock);
    });

    readableMock.on.mock.calls[0][1]('Stub server is running');

    expect(execSh).toHaveBeenCalledTimes(1);
    expect(execSh.mock.calls[0][0]).toBe(
        `java -jar ${path.resolve(specmaticJarPathLocal)} stub --data=${path.resolve(STUB_DIR_PATH)} --host=${HOST} --port=${PORT}`
    );
});

test('startStub method stubDir is optional', async () => {
    execSh.mockReturnValue(javaProcessMock);

    specmatic.startStub(HOST, PORT).then(javaProcess => {
        expect(javaProcess).toBe(javaProcessMock);
    });

    readableMock.on.mock.calls[0][1]('Stub server is running');

    expect(execSh).toHaveBeenCalledTimes(1);
    expect(execSh.mock.calls[0][0]).toBe(`java -jar ${path.resolve(specmaticJarPathLocal)} stub --host=${HOST} --port=${PORT}`);
});

test('startStub method host and port are optional', async () => {
    execSh.mockReturnValue(javaProcessMock);

    specmatic.startStub().then(javaProcess => {
        expect(javaProcess).toBe(javaProcessMock);
    });

    readableMock.on.mock.calls[0][1]('Stub server is running');

    expect(execSh).toHaveBeenCalledTimes(1);
    expect(execSh.mock.calls[0][0]).toBe(`java -jar ${path.resolve(specmaticJarPathLocal)} stub`);
});

test('stopStub method stops any running stub server', () => {
    specmatic.stopStub(javaProcessMock);

    expect(readableMock.removeAllListeners).toHaveBeenCalledTimes(2);
    expect(javaProcessMock.removeAllListeners).toHaveBeenCalledTimes(1);
    expect(javaProcessMock.kill).toHaveBeenCalledTimes(1);
});

test('test runs the contract tests', function (done) {
    specmatic.test(HOST, PORT, CONTRACT_YAML_FILE_PATH).then(result => {
        expect(result).toBeTruthy();
        done();
    });
    copyReportFile();
    execSh.mock.calls[0][2](); //Execute the callback
    expect(execSh).toHaveBeenCalledTimes(1);
    expect(execSh.mock.calls[0][0]).toBe(
        `java -jar ${path.resolve(specmaticJarPathLocal)} test ${path.resolve(
            CONTRACT_YAML_FILE_PATH
        )} --junitReportDir=dist/test-report --host=${HOST} --port=${PORT}`
    );
});

test('test runs the contract tests with host and port optional', function (done) {
    specmatic.test().then(result => {
        expect(result).toBeTruthy();
        done();
    });
    copyReportFile();
    execSh.mock.calls[0][2](); //Execute the callback
    expect(execSh).toHaveBeenCalledTimes(1);
    expect(execSh.mock.calls[0][0]).toBe(`java -jar ${path.resolve(specmaticJarPathLocal)} test --junitReportDir=dist/test-report`);
});

test('test runs the contract tests with contracts path optional', function (done) {
    specmatic.test(HOST, PORT).then(result => {
        expect(result).toBeTruthy();
        done();
    });
    copyReportFile();
    execSh.mock.calls[0][2](); //Execute the callback
    expect(execSh).toHaveBeenCalledTimes(1);
    expect(execSh.mock.calls[0][0]).toBe(
        `java -jar ${path.resolve(specmaticJarPathLocal)} test --junitReportDir=dist/test-report --host=${HOST} --port=${PORT}`
    );
});

test('test runs the contract tests and get summary', function (done) {
    specmatic.test().then(result => {
        expect(result).not.toBeUndefined();
        expect(result!.total).toBe(5);
        expect(result!.success).toBe(3);
        expect(result!.failure).toBe(2);
        done();
    });
    copyReportFile();
    execSh.mock.calls[0][2](); //Execute the callback
    expect(execSh).toHaveBeenCalledTimes(1);
    expect(execSh.mock.calls[0][0]).toBe(`java -jar ${path.resolve(specmaticJarPathLocal)} test --junitReportDir=dist/test-report`);
});

test('test runs the contract tests and get summary when there is just one test', function (done) {
    specmatic.test().then(result => {
        expect(result).not.toBeUndefined();
        expect(result!.total).toBe(1);
        expect(result!.success).toBe(1);
        expect(result!.failure).toBe(0);
        done();
    });
    copyReportFileWithName('sample-junit-result-single.xml');
    execSh.mock.calls[0][2](); //Execute the callback
    expect(execSh).toHaveBeenCalledTimes(1);
    expect(execSh.mock.calls[0][0]).toBe(`java -jar ${path.resolve(specmaticJarPathLocal)} test --junitReportDir=dist/test-report`);
});

test('test invocation makes sure previous junit report if any is deleted', function (done) {
    copyReportFileWithName('sample-junit-result-single.xml');
    specmatic.test(HOST, PORT).then(result => {
        expect(result).toBeTruthy();
        done();
    });
    expect(existsSync(path.resolve('dist/test-report'))).toBeFalsy();
    copyReportFileWithName('sample-junit-result-single.xml');
    execSh.mock.calls[0][2](); //Execute the callback
});

test('printJarVersion', () => {
    specmatic.printJarVersion();

    expect(execSh).toHaveBeenCalledTimes(1);
    expect(execSh.mock.calls[0][0]).toBe(`java -jar ${path.resolve(specmaticJarPathLocal)} --version`);
});

test('setExpectations with default baseUrl', done => {
    fetchMock.mockReturnValue(Promise.resolve('{}'));
    specmatic.setExpectations(path.resolve(STUB_PATH)).then(result => {
        expect(result).toBeTruthy();
        done();
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe('http://localhost:9000/_specmatic/expectations');
    expect(fetchMock.mock.calls[0][1]).toMatchObject({
        method: 'POST',
        body: JSON.stringify(mockStub),
    });
});

test('setExpectations with a different baseUrl for the stub server', done => {
    fetchMock.mockReturnValue(Promise.resolve('{}'));
    const stubServerBaseUrl = 'http://localhost:8000/';
    specmatic.setExpectations(path.resolve(STUB_PATH), stubServerBaseUrl).then(result => {
        expect(result).toBeTruthy();
        done();
    });

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
