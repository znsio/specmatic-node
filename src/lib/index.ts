import fetch from 'node-fetch';
import path from 'path';
import execSh from 'exec-sh';
import { specmaticJarPathLocal } from '../config';

export const startStubServer = (specmaticDir: string, stubDir: string, host: string, port: string) => {
  const specmaticJarPath = path.resolve(specmaticJarPathLocal);
  const specmatics = path.resolve(specmaticDir + '');
  const stubs = path.resolve(stubDir + '');

  console.log(`java -jar ${specmaticJarPath} stub ${specmatics} --strict --data=${stubs} --host=${host} --port=${port}`)

  console.log('starting specmatic stub server')
  execSh(
    `java -jar ${specmaticJarPath} stub ${specmatics} --strict --data=${stubs} --host=${host} --port=${port}`
  );
}

export const startTestServer = (specmaticDir: string, host: string, port: string) => {
  const specmaticJarPath = path.resolve(specmaticJarPathLocal);
  const specmatics = path.resolve(specmaticDir);

  console.log('running specmatic tests')
  execSh(
    `java -jar ${specmaticJarPath} test ${specmatics} --host=${host} --port=${port}`
  );
}

export const installContracts = () => {
  const specmaticJarPath = path.resolve(specmaticJarPathLocal);

  console.log('installing contracts in local')
  execSh(
    `java -jar ${specmaticJarPath} install`
  );
}

export const loadDynamicStub = (stubPath: string) => {
  const stubResponse = require(path.resolve(stubPath))
  fetch('http://localhost:8000/_specmatic/expectations',
    {
      method: 'POST',
      body: JSON.stringify(stubResponse)
    })
    .then(res => res.json())
    .then(json => console.log(json));
};