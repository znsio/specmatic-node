import execSh from 'exec-sh';
import fetch from 'node-fetch';
import path from 'path';
import { setSpecmaticEnvironment, startStubServer, Environment, startTestServer, runContractTests, loadDynamicStub, printSpecmaticJarVersion, setExpectations, installContracts, installSpecs } from '../';
import { specmaticJarPathLocal, specmatic } from '../../config';
import mockStub from '../../../mockStub.json';


jest.mock('exec-sh');
jest.mock('node-fetch');

const contractsPath = './contracts';
const stubDataPath = './data';
const host = 'localhost';
const port = '8000';


const checkSpecmaticEnvironment = (environmentName: string, environment: Environment) => {
  let flag = false
  try {
    let file = require(path.resolve(specmatic))
    for (let environmentVariable in environment) flag = file.environments[environmentName].variables[environmentVariable] == environment[environmentVariable]
  } catch (e) { }
  return flag
}

beforeEach(() => {
  execSh.mockReset();
  fetch.mockReset();
});

test('startStubServer method starts the specmatic stub server', () => {
  startStubServer(host, port, stubDataPath);

  expect(execSh).toHaveBeenCalledTimes(1);
  expect(execSh.mock.calls[0][0])
    .toBe(`java -jar ${path.resolve(specmaticJarPathLocal)} stub --strict --data=${path.resolve(stubDataPath)} --host=${host} --port=${port}`);
});

test('startStubServer method stubDir is optional', () => {
  startStubServer(host, port);

  expect(execSh).toHaveBeenCalledTimes(1);
  expect(execSh.mock.calls[0][0])
    .toBe(`java -jar ${path.resolve(specmaticJarPathLocal)} stub --strict --host=${host} --port=${port}`);
});

test('startStubServer method host and port are optional', () => {
  startStubServer();

  expect(execSh).toHaveBeenCalledTimes(1);
  expect(execSh.mock.calls[0][0])
    .toBe(`java -jar ${path.resolve(specmaticJarPathLocal)} stub --strict`);
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

test('printSpecmaticJarVersion', () => {
  printSpecmaticJarVersion();

  expect(execSh).toHaveBeenCalledTimes(1);
  expect(execSh.mock.calls[0][0])
    .toBe(`java -jar ${path.resolve(specmaticJarPathLocal)} --version`);
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

test('setSpecmaticEnvironment updates the environment variable value in the specmatic.json file', () => {
  const variableObj1: Record<string, string> = { "key1": "updated-value1", "key2": "updated-value2", "key3": "updated-value3", "key4": "updated-value4" }
  const variableObj2: Record<string, string> = { "key1": "initial-value1", "key2": "initial-value2", "key3": "initial-value3", "key4": "initial-value4" }
  setSpecmaticEnvironment("local", variableObj1)
  expect(checkSpecmaticEnvironment("local", variableObj1)).toBe(true)
  setSpecmaticEnvironment("local", variableObj2)
  expect(checkSpecmaticEnvironment("local", variableObj2)).toBe(true)
});

test('setSpecmaticEnvironment does not updates the environment variable value , when the specified environment name is not present inside specmatic.json file', () => {
  const variableObj1: Record<string, string> = { "key1": "updated-value1", "key2": "updated-value2", "key3": "updated-value3", "key4": "updated-value4" }
  setSpecmaticEnvironment("production", variableObj1)
  expect(checkSpecmaticEnvironment("production", variableObj1)).toBe(false)
});
