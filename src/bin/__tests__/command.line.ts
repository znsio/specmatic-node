import execSh from 'exec-sh';
import path from 'path';
import callSpecmaticCli from '../command.line';
import { specmaticCoreJarName, specmaticKafkaJarName } from '../../config';
import fs from 'fs';
import { ChildProcess } from 'child_process';
import { mock as jestMock, mockReset } from 'jest-mock-extended';
import { Readable } from 'stream';

jest.mock('exec-sh');
jest.mock('child_process');

const execShMock = execSh as unknown as jest.Mock;
const javaProcessMock = jestMock<ChildProcess>();
const readableMock = jestMock<Readable>();
javaProcessMock.stdout = readableMock;
javaProcessMock.stderr = readableMock;

beforeEach(() => {
    jest.resetAllMocks();
    mockReset(javaProcessMock);
    mockReset(readableMock);
});

test('pass all wrapper arguments to the jar', async () => {
    execShMock.mockReturnValue(javaProcessMock);

    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    const testArgs = ['node', 'index.js', 'stub', '*.specmatic', '--data', 'src/mocks', '--host', 'localhost', '--port', '8000'];
    callSpecmaticCli(testArgs);
    const specmaticJarPath = path.resolve(__dirname, '..', '..', '..', specmaticCoreJarName);
    expect(execShMock.mock.calls[0][0]).toBe(`java -jar ${path.resolve(specmaticJarPath)} ${testArgs.slice(2).join(' ')}`);
    expect(execSh).toHaveBeenCalledTimes(1);
});

test('pass kafka related calls to the kafka jar', async () => {
    execShMock.mockReturnValue(javaProcessMock);

    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    const testArgs = ['node', 'index.js', 'kafka', '--host', 'localhost', '--port', '8000'];
    callSpecmaticCli(testArgs);
    const specmaticJarPath = path.resolve(__dirname, '..', '..', '..', '..', 'specmatic-beta', 'kafka', specmaticKafkaJarName);
    expect(execShMock.mock.calls[0][0]).toBe(`java -jar ${path.resolve(specmaticJarPath)} ${testArgs.slice(3).join(' ')}`);
    expect(execSh).toHaveBeenCalledTimes(1);
});
