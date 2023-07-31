import path from 'path';
import callSpecmaticCli from '../command.line';
import { specmaticCoreJarName, specmaticKafkaJarName } from '../../config';
import fs from 'fs';
import { ChildProcess, spawn } from 'child_process';
import { mock as jestMock, mockReset } from 'jest-mock-extended';
import { Readable } from 'stream';

jest.mock('child_process');

const javaProcessMock = jestMock<ChildProcess>();
const readableMock = jestMock<Readable>();
javaProcessMock.stdout = readableMock;
javaProcessMock.stderr = readableMock;

beforeEach(() => {
    jest.resetAllMocks();
});

test('pass all wrapper arguments to the jar', async () => {
    spawn.mockReturnValue(javaProcessMock);

    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    const testArgs = ['node', 'index.js', 'stub', '*.specmatic', '--data', 'src/mocks', '--host', 'localhost', '--port', '8000'];
    callSpecmaticCli(testArgs);
    const specmaticJarPath = path.resolve(__dirname, '..', '..', '..', specmaticCoreJarName);
    expect(spawn.mock.calls[0][1][1]).toBe(`"${path.resolve(specmaticJarPath)}"`);
    expect(spawn.mock.calls[0][1][2]).toBe(testArgs.slice(2).join(" "));
});

test('pass kafka related calls to the kafka jar', async () => {
    spawn.mockReturnValue(javaProcessMock);

    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    const testArgs = ['node', 'index.js', 'kafka', '--host', 'localhost', '--port', '8000'];
    callSpecmaticCli(testArgs);
    const specmaticKafkaJarPath = path.resolve(__dirname, '..', '..', '..', '..', 'specmatic-beta', 'kafka', specmaticKafkaJarName);
    expect(spawn.mock.calls[0][1][1]).toBe(`"${path.resolve(specmaticKafkaJarPath)}"`);
    expect(spawn.mock.calls[0][1][2]).toBe(testArgs.slice(3).join(" "));
});
