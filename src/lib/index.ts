import fetch from 'node-fetch';
import path from 'path';
import execSh from 'exec-sh';
import { specmaticJarPathLocal, specmatic } from '../config';
import fs from 'fs';
import { check } from 'yargs';

type Environment = Record<string, string>

export const setSpecmaticEnvironement = (environmentName: string, environmentVariable: Environment) => {
  console.log("Reading the file from -> ", path.resolve(specmatic))
  let file = null

  try {
    file = require(path.resolve(specmatic))
    for (var x in environmentVariable) file.environments[environmentName].variables[x] = environmentVariable[x]
    fs.writeFileSync(path.resolve(specmatic), JSON.stringify(file, null, 2))
    return checkSpecmaticEnvironment(environmentName, environmentVariable)
  } catch (e) {
    console.log(e.toString())
    return false
  }
}

function checkSpecmaticEnvironment(environmentName: string, environmentVariable: Environment) {
  let flag = true

  let file = require(path.resolve(specmatic))
  for (var x in environmentVariable) {
    if (file.environments[environmentName].variables[x] != environmentVariable[x]) {
      flag = false
    }
  }
  return flag
}

export const startStubServer = (specmaticDir: string, stubDir: string, host: string, port: string) => {
  const specmaticJarPath = path.resolve(specmaticJarPathLocal);
  const specmatics = path.resolve(specmaticDir + '');
  const stubs = path.resolve(stubDir + '');

  console.log(`java -jar ${specmaticJarPath} stub ${specmatics} --strict --data=${stubs} --host=${host} --port=${port}`)

  console.log('Starting specmatic stub server')
  execSh(
    `java -jar ${specmaticJarPath} stub ${specmatics} --strict --data=${stubs} --host=${host} --port=${port}`
  );
}

export const startTestServer = (specmaticDir: string, host: string, port: string) => {
  const specmaticJarPath = path.resolve(specmaticJarPathLocal);
  const specmatics = path.resolve(specmaticDir);

  console.log('Running specmatic tests')
  execSh(
    `java -jar ${specmaticJarPath} test ${specmatics} --host=${host} --port=${port}`
  );
}

export const runContractTests = startTestServer;

export const installContracts = () => {
  const specmaticJarPath = path.resolve(specmaticJarPathLocal);

  console.log('Installing contracts')
  execSh(
    `java -jar ${specmaticJarPath} install`
  );
}

export const installSpecs = installContracts;

export const loadDynamicStub = (stubPath: string, stubServerBaseUrl?: string) => {
  const stubResponse = require(path.resolve(stubPath));

  console.log("setting expectations");
  fetch(`${stubServerBaseUrl ? stubServerBaseUrl : `http://localhost:9000/`}_specmatic/expectations`,
    {
      method: 'POST',
      body: JSON.stringify(stubResponse)
    })
    .then(res => res.json())
    .then(json => console.log(json));
};

export const setExpectations = loadDynamicStub;