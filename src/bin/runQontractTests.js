#!/usr/bin/env node

const runQontractTests = () => {
  const execSh = require('exec-sh');
  const path = require('path');
  const { qontractPath } = require('../config');
  const jarPath = path.resolve(qontractPath);
  const [,,args] = process.argv;
  const contractsPath = path.resolve(args);
  
  console.log('running qontract tests')
  execSh(
    `java -jar ${jarPath} test ${contractsPath}`,
    {  },
    err => {
      if (err) {
        console.log('Exit code: ', err.code);
      }
    }
  );  
}

runQontractTests();