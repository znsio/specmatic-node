#!/usr/bin/env node
import execSh from 'exec-sh';
import path from 'path';
import {argv} from 'yargs';
import { qontractJarPathLocal } from '../config';

const startStubServer = () => {
  const qontractJarPath = path.resolve(qontractJarPathLocal);
  const { qontractDir, stubDir, host, port} = argv;
  const qontracts = path.resolve(qontractDir + '');
  const stubs = path.resolve(stubDir + '');

  console.log('starting qontract stub server')
  execSh(
    `java -jar ${qontractJarPath} stub ${qontracts} --data ${stubs} --host=${host} --port=${port}`,
    {  },
    (err: any) => {
      if (err) {
        console.log('Exit code: ', err.code);
      }
    }
  );  
}

startStubServer();