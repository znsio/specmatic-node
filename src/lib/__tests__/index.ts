import execSh from 'exec-sh';
import fetch from 'node-fetch';
import path from 'path';
import { startStubServer, startTestServer, loadDynamicStub, installSpecmatics } from '../';
import { specmaticJarPathLocal } from '../../config';
import mockStub from '../../../mockStub.json';

jest.mock('exec-sh');
jest.mock('node-fetch');

describe('Testing helper methods', () => {
  const contractsPath = './contracts';
  const stubDataPath = './data';
  const host = 'localhost';
  const port = '8000';

  beforeEach(() => {
    execSh.mockClear();
  });

  test('startStubServer', () => {
    startStubServer(contractsPath, stubDataPath, host, port);
    
    expect(execSh).toHaveBeenCalledTimes(1);
    expect(execSh.mock.calls[0][0])
      .toBe(`java -jar ${path.resolve(specmaticJarPathLocal)} stub ${path.resolve(contractsPath)} --strict --data=${path.resolve(stubDataPath)} --host=${host} --port=${port}`);
  });

  test('startTestServer', () => {
    startTestServer(contractsPath, host, port);

    expect(execSh).toHaveBeenCalledTimes(1);
    expect(execSh.mock.calls[0][0])
      .toBe(`java -jar ${path.resolve(specmaticJarPathLocal)} test ${path.resolve(contractsPath)} --host=${host} --port=${port}`);
  });

  test('installSpecmatics', () => {
    installSpecmatics();

    expect(execSh).toHaveBeenCalledTimes(1);
    expect(execSh.mock.calls[0][0])
      .toBe(`java -jar ${path.resolve(specmaticJarPathLocal)} install`);
  });

  test('loadDynamicStub', () => {
    fetch.mockReturnValue(Promise.resolve("{}"));
    loadDynamicStub(path.resolve('./mockStub.json'));

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch.mock.calls[0][0]).toBe('http://localhost:8000/_specmatic/expectations');
    expect(fetch.mock.calls[0][1]).toMatchObject({
      method: 'POST',
      body: JSON.stringify(mockStub)
    });
  });
});