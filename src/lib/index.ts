import fetch from 'node-fetch';
import path from 'path';
import execSh from 'exec-sh';
import { qontractJarPathLocal } from '../config';

export const startStubServer = (qontractDir: string, stubDir: string, host: string, port: string) => {
  const qontractJarPath = path.resolve(qontractJarPathLocal);
  const qontracts = path.resolve(qontractDir + '');
  const stubs = path.resolve(stubDir + '');

  console.log(`java -jar ${qontractJarPath} stub ${qontracts} --strict --data=${stubs} --host=${host} --port=${port}`)

  console.log('starting qontract stub server')
  execSh(
    `java -jar ${qontractJarPath} stub ${qontracts} --strict --data=${stubs} --host=${host} --port=${port}`,
    {},
    (err: any) => {
      if (err) {
        console.log('Exit code: ', err.code);
        throw new Error(err);
      }
    }
  );
}

export const startTestServer = (qontractDir: string, host: string, port: string) => {
  const qontractJarPath = path.resolve(qontractJarPathLocal);
  const qontracts = path.resolve(qontractDir);

  console.log('running qontract tests')
  execSh(
    `java -jar ${qontractJarPath} test ${qontracts} --host=${host} --port=${port}`,
    {},
    (err: any) => {
      if (err) {
        console.log('Exit code: ', err.code);
        throw new Error(err);
      }
    }
  );
}

export const loadDynamicStub = (stubPath: string) => {
  const stubResponse = require(path.resolve(stubPath))
  fetch('http://localhost:8000/_qontract/expectations',
    {
      method: 'POST',
      body: JSON.stringify(stubResponse)
    })
    .then(res => res.json())
    .then(json => console.log(json));
};