import execSh from 'exec-sh';
import path from 'path';
import callSpecmaticCli from '../core';
import { specmaticJarName } from '../../config';
import fs from 'fs';
import { ChildProcess } from 'child_process';
import { mock as jestMock, mockReset } from 'jest-mock-extended';
import { Readable } from 'stream';

jest.mock('exec-sh');
jest.mock('child_process');

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
    execSh.mockReturnValue(javaProcessMock);

    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    const testArgs = ['node', 'index.js', 'stub', '*.specmatic', '--data', 'src/mocks', '--host', 'localhost', '--port', '8000'];
    callSpecmaticCli(testArgs);
    const specmaticJarPath = path.resolve(__dirname, '..', '..', '..', specmaticJarName);
    expect(execSh.mock.calls[0][0]).toBe(`java -jar ${path.resolve(specmaticJarPath)} ${testArgs.slice(2).join(' ')}`);
    expect(execSh).toHaveBeenCalledTimes(1);
});
