import execSh from 'exec-sh';
import fetch from 'node-fetch';
import path from 'path';
import { setSpecmaticEnvironement, startStubServer, startTestServer, runContractTests, loadDynamicStub, setExpectations, installContracts, installSpecs } from '../';
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

test('setSpecmaticEnvVariable updates the environment variable value in the specmatic.json file', () => {
  const variableObj1: Record<string, string> = { "key1": "updated-value1", "key2": "updated-value2", "key3": "updated-value3", "key4": "updated-value4" }
  const variableObj2: Record<string, string> = { "key1": "initial-value1", "key2": "initial-value2", "key3": "initial-value3", "key4": "initial-value4" }

  expect(setSpecmaticEnvironement("variables", variableObj1)).toBe(true)
  expect(setSpecmaticEnvironement("variables", variableObj2)).toBe(true)
});

test('setSpecmaticEnvVariable updates the environment variable value in the specmatic.json file', () => {
  const baseURlObj1: Record<string, string> = { "../../ABC.spec": "updated-value1", "../../XYZ.spec": "updated-value2" }
  const baseURlObj2: Record<string, string> = { "../../ABC.spec": "initial-value1", "../../XYZ.spec": "initial-value2" }

  expect(setSpecmaticEnvironement("baseurls", baseURlObj1)).toBe(true)
  expect(setSpecmaticEnvironement("baseurls", baseURlObj2)).toBe(true)
});
