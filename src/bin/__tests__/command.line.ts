import path from 'path';
import callSpecmaticCli from '../command.line';
import { specmaticCoreJarName } from '../../config';
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

test('passes arguments to the jar', async () => {
    spawn.mockReturnValue(javaProcessMock);

    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    const testArgs = ['test', '--testBaseURL', 'http://localhost:9000', `--filter=PATH='/todos/add' || STATUS='404'`, '--foo=bar', 1, 2];
    callSpecmaticCli(testArgs);
    const specmaticJarPath = path.resolve(__dirname, '..', '..', '..', specmaticCoreJarName);
    expect(spawn.mock.calls[0][0]).toBe(`java`);
    expect(spawn.mock.calls[0][1]).toEqual([`-jar`, path.resolve(specmaticJarPath), `test`, `--testBaseURL`, `http://localhost:9000`, `--filter=PATH='/todos/add' || STATUS='404'`, `--foo=bar`, `1`, `2`]);
});
