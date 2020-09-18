import execSh from 'exec-sh';
import path from 'path';
import startQontractServer from '../core';
import { qontractJarPathLocal } from '../../config';

jest.mock('exec-sh');

test('arguments to be passed correctly to Qontract lib', () => {
  const testArgs = ['node', 'index.js', 'stub', '*.qontract', '--data', 'src/mocks', '--host', 'localhost', '--port', '8000'];
  startQontractServer(testArgs);
  expect(execSh.mock.calls[0][0]).toBe(`java -jar ${path.resolve(qontractJarPathLocal)} ${testArgs.slice(2).join(' ')}`);
  expect(execSh).toHaveBeenCalledTimes(1);
});