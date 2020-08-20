#!/usr/bin/env node

const runQontractTests = () => {
  const execSh = require('exec-sh');
  const path = require('path');
  const { qontractPath } = require('../config');
  const jarPath = path.resolve(qontractPath);

  const {argv} = require('yargs')
  const contractPath = path.resolve(argv.contractPath);
  
  console.log('running qontract tests')
  execSh(
    `java -jar ${jarPath} test ${contractPath}`,
    {  },
    err => {
      if (err) {
        console.log('Exit code: ', err.code);
      }
    }
  );  
}

runQontractTests();