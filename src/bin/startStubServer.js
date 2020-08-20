#!/usr/bin/env node

const startStubServer = () => {
  const execSh = require('exec-sh');
  const path = require('path');
  const { qontractJarPathLocal } = require('../config');
  const qontractJarPath = path.resolve(qontractJarPathLocal);

  const {argv} = require('yargs');
  const { 'contract-dir': contractDir, 'stub-dir': stubDir, host, port} = argv;
  const contracts = path.resolve(contractDir);
  const stubs = path.resolve(stubDir);

  console.log('starting qontract stub server')
  execSh(
    `java -jar ${qontractJarPath} stub ${contracts} --data ${stubs} --host=${host} --port=${port}`,
    {  },
    err => {
      if (err) {
        console.log('Exit code: ', err.code);
      }
    }
  );  
}

startStubServer();