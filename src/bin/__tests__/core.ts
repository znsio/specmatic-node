import execSh from 'exec-sh';
import path from 'path';
import callSpecmaticCli from '../core';
import { specmaticJarName, specmaticJarPathLocal } from '../../config';
import fs from 'fs';
import { exec } from 'child_process';

jest.mock('exec-sh');
jest.mock('child_process');
const execMock = exec as unknown as jest.Mock;

beforeEach(() => {
    jest.resetAllMocks();
});

test('pass all wrapper arguments to the jar', async () => {
    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    const testArgs = ['node', 'index.js', 'stub', '*.specmatic', '--data', 'src/mocks', '--host', 'localhost', '--port', '8000'];
    callSpecmaticCli(testArgs);
    const specmaticJarPath = path.resolve(__dirname, '..', '..', '..', specmaticJarName);
    expect(execSh.mock.calls[0][0]).toBe(`java -jar ${path.resolve(specmaticJarPath)} ${testArgs.slice(2).join(' ')}`);
    expect(execSh).toHaveBeenCalledTimes(1);
});

// test('look for jar in specmatic globally installled directory when run from global install', async () => {
//     jest.spyOn(fs, 'existsSync').mockReturnValue(false);
//     const testArgs = ['node', 'index.js', 'stub', '*.specmatic', '--data', 'src/mocks', '--host', 'localhost', '--port', '8000'];
//     const NPM_GLOBAL_PATH = '/npm/global/path';
//     setTimeout(() => {
//         execMock.mock.calls[0][1](0, NPM_GLOBAL_PATH);
//     }, 0);
//     await callSpecmaticCli(testArgs);
//     expect(execSh.mock.calls[0][0]).toBe(`java -jar ${path.resolve(NPM_GLOBAL_PATH, 'specmatic', specmaticJarName)} ${testArgs.slice(2).join(' ')}`);
//     expect(execSh).toHaveBeenCalledTimes(1);
// });
