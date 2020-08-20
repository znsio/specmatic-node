#!/usr/bin/env node

const startStubServer = () => {
  const execSh = require('exec-sh');
  const path = require('path');
  const { qontractPath } = require('../config');
  const jarPath = path.resolve(qontractPath);
  const [,,args] = process.argv;
  const contractsPath = path.resolve(args);

  console.log('starting qontract stub server')
  execSh(
    `java -jar ${jarPath} stub ${contractsPath}`,
    {  },
    err => {
      if (err) {
        console.log('Exit code: ', err.code);
      }
    }
  );  
}

startStubServer();