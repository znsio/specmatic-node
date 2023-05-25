import execSh from 'exec-sh';
import path from 'path';
import callSpecmaticCli from '../core';
import { specmaticJarPathLocal } from '../../config';

jest.mock('exec-sh');

test('arguments to be passed correctly to Specmatic lib', () => {
    const testArgs = ['node', 'index.js', 'stub', '*.specmatic', '--data', 'src/mocks', '--host', 'localhost', '--port', '8000'];
    callSpecmaticCli(testArgs);
    expect(execSh.mock.calls[0][0]).toBe(`java -jar ${path.resolve(specmaticJarPathLocal)} ${testArgs.slice(2).join(' ')}`);
    expect(execSh).toHaveBeenCalledTimes(1);
});
