import execSh from 'exec-sh';
import fetch from 'node-fetch';
import path from 'path';
import { startStubServer, startTestServer, runContractTests, loadDynamicStub, setExpectations, installContracts, installSpecs } from '../';
import { specmaticJarPathLocal } from '../../config';
import mockStub from '../../../mockStub.json';

jest.mock('exec-sh');
jest.mock('node-fetch');

const contractsPath = './contracts';
const stubDataPath = './data';
const host = 'localhost';
const port = '8000';

beforeEach(() => {
  execSh.mockReset();
  fetch.mockReset();
});

test('startStubServer method starts the specmatic stub server', () => {
  startStubServer(contractsPath, stubDataPath, host, port);

  expect(execSh).toHaveBeenCalledTimes(1);
  expect(execSh.mock.calls[0][0])
    .toBe(`java -jar ${path.resolve(specmaticJarPathLocal)} stub ${path.resolve(contractsPath)} --strict --data=${path.resolve(stubDataPath)} --host=${host} --port=${port}`);
});

test('startTestServer runs the contract tests', () => {
  startTestServer(contractsPath, host, port);

  expect(execSh).toHaveBeenCalledTimes(1);
  expect(execSh.mock.calls[0][0])
    .toBe(`java -jar ${path.resolve(specmaticJarPathLocal)} test ${path.resolve(contractsPath)} --host=${host} --port=${port}`);
});

test('runContractTests runs the contract tests', () => {
  runContractTests(contractsPath, host, port);

  expect(execSh).toHaveBeenCalledTimes(1);
  expect(execSh.mock.calls[0][0])
    .toBe(`java -jar ${path.resolve(specmaticJarPathLocal)} test ${path.resolve(contractsPath)} --host=${host} --port=${port}`);
});


test('installContracts installs contracts to local', () => {
  installContracts();

  expect(execSh).toHaveBeenCalledTimes(1);
  expect(execSh.mock.calls[0][0])
    .toBe(`java -jar ${path.resolve(specmaticJarPathLocal)} install`);
});

test('installSpecs installs contracts to local', () => {
  installSpecs();

  expect(execSh).toHaveBeenCalledTimes(1);
  expect(execSh.mock.calls[0][0])
    .toBe(`java -jar ${path.resolve(specmaticJarPathLocal)} install`);
});

test('loadDynamicStub with default baseUrl', () => {
  fetch.mockReturnValue(Promise.resolve("{}"));
  loadDynamicStub(path.resolve('./mockStub.json'));

  expect(fetch).toHaveBeenCalledTimes(1);
  expect(fetch.mock.calls[0][0]).toBe('http://localhost:9000/_specmatic/expectations');
  expect(fetch.mock.calls[0][1]).toMatchObject({
    method: 'POST',
    body: JSON.stringify(mockStub)
  });
});

test('setExpectations with default baseUrl', () => {
  fetch.mockReturnValue(Promise.resolve("{}"));
  setExpectations(path.resolve('./mockStub.json'));

  expect(fetch).toHaveBeenCalledTimes(1);
  expect(fetch.mock.calls[0][0]).toBe('http://localhost:9000/_specmatic/expectations');
  expect(fetch.mock.calls[0][1]).toMatchObject({
    method: 'POST',
    body: JSON.stringify(mockStub)
  });
});

test('loadDynamicStub with a different baseUrl for the stub server', () => {
  fetch.mockReturnValue(Promise.resolve("{}"));
  const stubServerBaseUrl = 'http://localhost:8000/'
  loadDynamicStub(path.resolve('./mockStub.json'), stubServerBaseUrl);

  expect(fetch).toHaveBeenCalledTimes(1);
  expect(fetch.mock.calls[0][0]).toBe(`${stubServerBaseUrl}_specmatic/expectations`);
  expect(fetch.mock.calls[0][1]).toMatchObject({
    method: 'POST',
    body: JSON.stringify(mockStub)
  });
});

test('setExpectations with a different baseUrl for the stub server', () => {
  fetch.mockReturnValue(Promise.resolve("{}"));
  const stubServerBaseUrl = 'http://localhost:8000/'
  setExpectations(path.resolve('./mockStub.json'), stubServerBaseUrl);

  expect(fetch).toHaveBeenCalledTimes(1);
  expect(fetch.mock.calls[0][0]).toBe(`${stubServerBaseUrl}_specmatic/expectations`);
  expect(fetch.mock.calls[0][1]).toMatchObject({
    method: 'POST',
    body: JSON.stringify(mockStub)
  });
});
