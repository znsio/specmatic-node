#!/usr/bin/env node

const startStubServer = () => {
  const execSh = require('exec-sh');
  const path = require('path');
  const { qontractPath } = require('../config');
  const jarPath = path.resolve(qontractPath);

  const {argv} = require('yargs');
  const { contractPath, host, port} = argv;
  const contracts = path.resolve(contractPath);

  console.log('starting qontract stub server')
  execSh(
    `java -jar ${jarPath} stub ${contracts} --host=${host} --port=${port}`,
    {  },
    err => {
      if (err) {
        console.log('Exit code: ', err.code);
      }
    }
  );  
}

startStubServer();