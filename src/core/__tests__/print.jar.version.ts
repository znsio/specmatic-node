import path from 'path';
import { ChildProcess, spawn } from 'child_process';
import { mock as jestMock, mockReset } from 'jest-mock-extended';
import { Readable } from 'stream';
import * as specmatic from '../..';
import { specmaticCoreJarName } from '../../config';

jest.mock('child_process');

const SPECMATIC_JAR_PATH = path.resolve(__dirname, '..', '..', '..', specmaticCoreJarName);

const javaProcessMock = jestMock<ChildProcess>();
const readableMock = jestMock<Readable>();
javaProcessMock.stdout = readableMock;
javaProcessMock.stderr = readableMock;

beforeEach(() => {
    jest.resetAllMocks();
});

test('prints bundled jar version', () => {
    spawn.mockReturnValue(javaProcessMock);

    specmatic.printJarVersion();

    expect(spawn.mock.calls[0][1][1]).toBe(`"${path.resolve(SPECMATIC_JAR_PATH)}"`);
    expect(spawn.mock.calls[0][1][2]).toBe('--version');
});
