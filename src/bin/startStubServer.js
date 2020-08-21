#!/usr/bin/env node

const startStubServer = () => {
  const execSh = require('exec-sh');
  const path = require('path');
  const { qontractJarPathLocal } = require('../config');
  const qontractJarPath = path.resolve(qontractJarPathLocal);

  const {argv} = require('yargs');
  const { qontractDir, stubDir, host, port} = argv;
  
  const qontracts = path.resolve(qontractDir);
  const stubs = path.resolve(stubDir);

  console.log('starting qontract stub server')
  execSh(
    `java -jar ${qontractJarPath} stub ${qontracts} --data ${stubs} --host=${host} --port=${port}`,
    {  },
    err => {
      if (err) {
        console.log('Exit code: ', err.code);
      }
    }
  );  
}

startStubServer();