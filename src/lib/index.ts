import fetch from 'node-fetch';
import path from 'path';
import execSh from 'exec-sh';
import { specmaticJarPathLocal, specmatic } from '../config';
import fs from 'fs';

const specmaticJarPath = path.resolve(specmaticJarPathLocal);
export type Environment = Record<string, string>

export const setSpecmaticEnvironment = (environmentName: string, environment: Environment) => {
  let file = null
  try {
    file = require(path.resolve(specmatic))
    for (let environmentVariable in environment) file.environments[environmentName].variables[environmentVariable] = environment[environmentVariable]
    fs.writeFileSync(path.resolve(specmatic), JSON.stringify(file, null, 2))
  } catch (e) {
    if (e.toString().includes("Cannot find module")) console.log(e.toString(), "\nThe file 'specmatic.json' is not present in the root directory of the project.")
    else console.log(e)
  }
}

export const startStubServer = (specmaticDir: string, stubDir: string, host: string, port: string) => {
  const specmatics = path.resolve(specmaticDir + '');
  const stubs = path.resolve(stubDir + '');

  console.log(`java -jar ${specmaticJarPath} stub ${specmatics} --strict --data=${stubs} --host=${host} --port=${port}`)

  console.log('Starting specmatic stub server')
  execSh(
    `java -jar ${specmaticJarPath} stub ${specmatics} --strict --data=${stubs} --host=${host} --port=${port}`
    , {}, (err: any) => {
      if (err) {
        console.log('Exit code: ', err.code);
        process.exit(err.code);
      }
    });
}

export const startTestServer = (specmaticDir: string, host: string, port: string) => {
  const specmatics = path.resolve(specmaticDir);

  console.log('Running specmatic tests')
  execSh(
    `java -jar ${specmaticJarPath} test ${specmatics} --host=${host} --port=${port}`
    , {}, (err: any) => {
      if (err) {
        console.log('Exit code: ', err.code);
        process.exit(err.code);
      }
    });
}

export const runContractTests = startTestServer;

export const installContracts = () => {
  console.log('Installing contracts')
  execSh(
    `java -jar ${specmaticJarPath} install`
    , {}, (err: any) => {
      if (err) {
        console.log('Exit code: ', err.code);
        process.exit(err.code);
      }
    });
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

export const printSpecmaticJarVersion = () => {
  execSh(
    `java -jar ${specmaticJarPath} --version`
    , {}, (err: any) => {
      if (err) {
        console.log('Exit code: ', err.code);
        process.exit(err.code);
      }
    });
}