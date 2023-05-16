import execSh from 'exec-sh';
import fetch from 'node-fetch';
import path from 'path';
import { ChildProcess } from 'child_process';
import { mock as jestMock } from 'jest-mock-extended';
import { Readable } from 'stream';

import * as specmatic from '../';
import { startStub, stopStub, printJarVersion, setExpectations } from '../';
import { specmaticJarPathLocal } from '../../config';
import mockStub from '../../../sample-mock-stub.json';

jest.mock('exec-sh');
jest.mock('node-fetch');

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
    fetch.mockReset();
});

test('startStub method starts the specmatic stub server', async () => {
    execSh.mockReturnValue(javaProcessMock);

    startStub(HOST, PORT, STUB_DIR_PATH).then(javaProcess => {
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

    startStub(HOST, PORT).then(javaProcess => {
        expect(javaProcess).toBe(javaProcessMock);
    });

    readableMock.on.mock.calls[0][1]('Stub server is running');

    expect(execSh).toHaveBeenCalledTimes(1);
    expect(execSh.mock.calls[0][0]).toBe(`java -jar ${path.resolve(specmaticJarPathLocal)} stub --host=${HOST} --port=${PORT}`);
});

test('startStub method host and port are optional', async () => {
    execSh.mockReturnValue(javaProcessMock);

    startStub().then(javaProcess => {
        expect(javaProcess).toBe(javaProcessMock);
    });

    readableMock.on.mock.calls[0][1]('Stub server is running');

    expect(execSh).toHaveBeenCalledTimes(1);
    expect(execSh.mock.calls[0][0]).toBe(`java -jar ${path.resolve(specmaticJarPathLocal)} stub`);
});

test('stopStub method stops any running stub server', () => {
    stopStub(javaProcessMock);

    expect(readableMock.removeAllListeners).toHaveBeenCalledTimes(2);
    expect(javaProcessMock.removeAllListeners).toHaveBeenCalledTimes(1);
    expect(javaProcessMock.kill).toHaveBeenCalledTimes(1);
});

test('test runs the contract tests', function (done) {
    specmatic.test(HOST, PORT, CONTRACT_YAML_FILE_PATH).then(result => {
        expect(result).toBeTruthy();
        done();
    });
    execSh.mock.calls[0][2](); //Execute the callback
    expect(execSh).toHaveBeenCalledTimes(1);
    expect(execSh.mock.calls[0][0]).toBe(
        `java -jar ${path.resolve(specmaticJarPathLocal)} test ${path.resolve(CONTRACT_YAML_FILE_PATH)} --host=${HOST} --port=${PORT}`
    );
});

test('test runs the contract tests with host and port optional', function (done) {
    specmatic.test().then(result => {
        expect(result).toBeTruthy();
        done();
    });
    execSh.mock.calls[0][2](); //Execute the callback
    expect(execSh).toHaveBeenCalledTimes(1);
    expect(execSh.mock.calls[0][0]).toBe(`java -jar ${path.resolve(specmaticJarPathLocal)} test`);
});

test('test runs the contract tests with contracts path optional', function (done) {
    specmatic.test(HOST, PORT).then(result => {
        expect(result).toBeTruthy();
        done();
    });
    execSh.mock.calls[0][2](); //Execute the callback
    expect(execSh).toHaveBeenCalledTimes(1);
    expect(execSh.mock.calls[0][0]).toBe(`java -jar ${path.resolve(specmaticJarPathLocal)} test --host=${HOST} --port=${PORT}`);
});

test('printJarVersion', () => {
    printJarVersion();

    expect(execSh).toHaveBeenCalledTimes(1);
    expect(execSh.mock.calls[0][0]).toBe(`java -jar ${path.resolve(specmaticJarPathLocal)} --version`);
});

test('setExpectations with default baseUrl', done => {
    fetch.mockReturnValue(Promise.resolve('{}'));
    setExpectations(path.resolve('./sample-mock-stub.json')).then(result => {
        expect(result).toBeTruthy();
        done();
    });

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch.mock.calls[0][0]).toBe('http://localhost:9000/_specmatic/expectations');
    expect(fetch.mock.calls[0][1]).toMatchObject({
        method: 'POST',
        body: JSON.stringify(mockStub),
    });
});

test('setExpectations with a different baseUrl for the stub server', done => {
    fetch.mockReturnValue(Promise.resolve('{}'));
    const stubServerBaseUrl = 'http://localhost:8000/';
    setExpectations(path.resolve('./sample-mock-stub.json'), stubServerBaseUrl).then(result => {
        expect(result).toBeTruthy();
        done();
    });

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch.mock.calls[0][0]).toBe(`${stubServerBaseUrl}_specmatic/expectations`);
    expect(fetch.mock.calls[0][1]).toMatchObject({
        method: 'POST',
        body: JSON.stringify(mockStub),
    });
});
