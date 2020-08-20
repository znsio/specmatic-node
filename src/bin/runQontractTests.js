#!/usr/bin/env node

const runQontractTests = () => {
  const execSh = require('exec-sh');
  const path = require('path');
  const { qontractJarPathLocal } = require('../config');
  const qontractJarPath = path.resolve(qontractJarPathLocal);

  const {argv} = require('yargs');
  const contractPath = path.resolve(argv.contractDir);
  
  console.log('running qontract tests')
  execSh(
    `java -jar ${qontractJarPath} test ${contractPath}`,
    {  },
    err => {
      if (err) {
        console.log('Exit code: ', err.code);
      }
    }
  );  
}

runQontractTests();