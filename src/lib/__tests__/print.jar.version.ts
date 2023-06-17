import execSh from 'exec-sh';
import path from 'path';
import { ChildProcess } from 'child_process';
import { mock as jestMock, mockReset } from 'jest-mock-extended';
import { Readable } from 'stream';
import * as specmatic from '../..';
import { specmaticJarName } from '../../config';

jest.mock('exec-sh');

const SPECMATIC_JAR_PATH = path.resolve(__dirname, '..', '..', '..', specmaticJarName);
const javaProcessMock = jestMock<ChildProcess>();
const readableMock = jestMock<Readable>();
javaProcessMock.stdout = readableMock;
javaProcessMock.stderr = readableMock;

beforeEach(() => {
    execSh.mockReset();
    mockReset(javaProcessMock);
    mockReset(readableMock);
});

test('prints bundled jar version', () => {
    execSh.mockReturnValue(javaProcessMock);

    specmatic.printJarVersion();

    expect(execSh).toHaveBeenCalledTimes(1);
    expect(execSh.mock.calls[0][0]).toBe(`java -jar ${path.resolve(SPECMATIC_JAR_PATH)} --version`);
});
