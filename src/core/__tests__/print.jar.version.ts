import execSh from 'exec-sh';
import path from 'path';
import { ChildProcess } from 'child_process';
import { mock as jestMock, mockReset } from 'jest-mock-extended';
import { Readable } from 'stream';
import * as specmatic from '../..';
import { specmaticCoreJarName } from '../../config';

jest.mock('exec-sh');

const SPECMATIC_JAR_PATH = path.resolve(__dirname, '..', '..', '..', specmaticCoreJarName);

const execShMock = execSh as unknown as jest.Mock;
const javaProcessMock = jestMock<ChildProcess>();
const readableMock = jestMock<Readable>();
javaProcessMock.stdout = readableMock;
javaProcessMock.stderr = readableMock;

beforeEach(() => {
    execShMock.mockReset();
    mockReset(javaProcessMock);
    mockReset(readableMock);
});

test('prints bundled jar version', () => {
    execShMock.mockReturnValue(javaProcessMock);

    specmatic.printJarVersion();

    expect(execSh).toHaveBeenCalledTimes(1);
    expect(execShMock.mock.calls[0][0]).toBe(`java -jar ${path.resolve(SPECMATIC_JAR_PATH)} --version`);
});
