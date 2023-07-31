import path from 'path';
import { ChildProcess, spawn } from 'child_process';
import { mock as jestMock, mockReset } from 'jest-mock-extended';
import { Readable } from 'stream';
import { copyFileSync, mkdirSync, existsSync } from 'fs';
import fs from 'fs';
import express from 'express';

import * as specmatic from '../..';
import { specmaticCoreJarName } from '../../config';

jest.mock('child_process');

const SPECMATIC_JAR_PATH = path.resolve(__dirname, '..', '..', '..', specmaticCoreJarName);
const CONTRACT_FILE_PATH = './contracts';
const HOST = 'localhost';
const PORT = 8000;

const javaProcessMock = jestMock<ChildProcess>();
const readableMock = jestMock<Readable>();
javaProcessMock.stdout = readableMock;
javaProcessMock.stderr = readableMock;

beforeEach(() => {
    jest.resetAllMocks();
});

test('runs the contract tests', async function () {
    spawn.mockReturnValue(javaProcessMock);
    setTimeout(() => {
        copyReportFile();
        javaProcessMock.on.mock.calls[0][1]()
    }, 0);

    await expect(specmatic.test(HOST, PORT, CONTRACT_FILE_PATH)).resolves.toBeTruthy();

    expect(spawn.mock.calls[0][1][1]).toBe(`"${path.resolve(SPECMATIC_JAR_PATH)}"`);
    expect(spawn.mock.calls[0][1][2]).toBe(`test ${path.resolve(CONTRACT_FILE_PATH)} --junitReportDir=dist/test-report --host=${HOST} --port=${PORT}`);
});

test('takes additional pass through arguments', async () => {
    spawn.mockReturnValue(javaProcessMock);
    setTimeout(() => {
        copyReportFile();
        javaProcessMock.on.mock.calls[0][1]()
    }, 0);

    await expect(specmatic.test(HOST, PORT, CONTRACT_FILE_PATH, ['P1', 'P2'])).resolves.toBeTruthy();

    expect(spawn.mock.calls[0][1][1]).toBe(`"${path.resolve(SPECMATIC_JAR_PATH)}"`);
    expect(spawn.mock.calls[0][1][2]).toBe(`test ${path.resolve(CONTRACT_FILE_PATH)} --junitReportDir=dist/test-report --host=${HOST} --port=${PORT} P1 P2`);
});

test('additional pass through arguments can be string or number', async () => {
    spawn.mockReturnValue(javaProcessMock);
    setTimeout(() => {
        copyReportFile();
        javaProcessMock.on.mock.calls[0][1]()
    }, 0);

    await expect(specmatic.test(HOST, PORT, CONTRACT_FILE_PATH, ['P1', 123])).resolves.toBeTruthy();

    expect(spawn.mock.calls[0][1][1]).toBe(`"${path.resolve(SPECMATIC_JAR_PATH)}"`);
    expect(spawn.mock.calls[0][1][2]).toBe(`test ${path.resolve(CONTRACT_FILE_PATH)} --junitReportDir=dist/test-report --host=${HOST} --port=${PORT} P1 123`);
});

test('runs the contract tests with host and port optional', async function () {
    spawn.mockReturnValue(javaProcessMock);
    setTimeout(() => {
        copyReportFile();
        javaProcessMock.on.mock.calls[0][1]()
    }, 0);

    await expect(specmatic.test()).resolves.toBeTruthy();

    expect(spawn.mock.calls[0][1][1]).toBe(`"${path.resolve(SPECMATIC_JAR_PATH)}"`);
    expect(spawn.mock.calls[0][1][2]).toBe(`test --junitReportDir=dist/test-report`);
});

test('runs the contract tests with contracts path optional', async function () {
    spawn.mockReturnValue(javaProcessMock);
    setTimeout(() => {
        copyReportFile();
        javaProcessMock.on.mock.calls[0][1]()
    }, 0);

    await expect(specmatic.test(HOST, PORT)).resolves.toBeTruthy();

    expect(spawn.mock.calls[0][1][1]).toBe(`"${path.resolve(SPECMATIC_JAR_PATH)}"`);
    expect(spawn.mock.calls[0][1][2]).toBe(`test --junitReportDir=dist/test-report --host=${HOST} --port=${PORT}`);
});

test('runs the contract tests and returns a summary', async function () {
    spawn.mockReturnValue(javaProcessMock);
    setTimeout(() => {
        copyReportFile();
        javaProcessMock.on.mock.calls[0][1]()
    }, 0);

    await expect(specmatic.test()).resolves.toStrictEqual({
        total: 5,
        success: 3,
        failure: 2,
    });
});

test('runs the contract tests and returns a summary with skipped tests count included', async function () {
    spawn.mockReturnValue(javaProcessMock);
    setTimeout(() => {
        copyReportFileWithName('sample-junit-result-skipped.xml');
        javaProcessMock.on.mock.calls[0][1]()
    }, 0);

    await expect(specmatic.test()).resolves.toStrictEqual({
        total: 3,
        success: 2,
        failure: 1,
    });
});

test('runs the contract tests and get summary when there is just one test', async function () {
    spawn.mockReturnValue(javaProcessMock);
    setTimeout(() => {
        copyReportFileWithName('sample-junit-result-single.xml');
        javaProcessMock.on.mock.calls[0][1]()
    }, 0);

    await expect(specmatic.test()).resolves.toStrictEqual({
        total: 1,
        success: 1,
        failure: 0,
    });
});

test('invocation makes sure previous junit report if any is deleted', async function () {
    const spy = jest.spyOn(fs, 'rmSync');
    spawn.mockReturnValue(javaProcessMock);
    setTimeout(() => {
        copyReportFileWithName('sample-junit-result-single.xml');
        javaProcessMock.on.mock.calls[0][1]()
    }, 0);

    await specmatic.test();

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(path.resolve('dist/test-report'), { force: true, recursive: true });
});

test('passes an property indicating api endpoint based on host and port supplied when api coverage is enabled', async () => {
    var app = express();
    app.get('/', () => {});

    spawn.mockReturnValue(javaProcessMock);
    setTimeout(() => {
        copyReportFile();
        javaProcessMock.on.mock.calls[0][1]()
    }, 0);

    await expect(specmatic.testWithApiCoverage(app, HOST, PORT)).resolves.toBeTruthy();

    expect(spawn.mock.calls[0][1][0]).toMatch(/endpointsAPI="http:\/\/.+?:[0-9]+?"/);
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
