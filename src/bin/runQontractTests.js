#!/usr/bin/env node

const runQontractTests = () => {
  const execSh = require('exec-sh');
  const path = require('path');
  const jarPath = path.resolve('./node_modules/qontract/qontract.jar');
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