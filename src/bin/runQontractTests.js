#!/usr/bin/env node

const runQontractTests = () => {
  const execSh = require('exec-sh');
  const path = require('path');
  const { qontractJarPathLocal } = require('../config');
  const qontractJarPath = path.resolve(qontractJarPathLocal);

  const {argv} = require('yargs');
  const { qontractDir, host, port} = argv;

  const qontracts = path.resolve(qontractDir);
  
  console.log('running qontract tests')
  execSh(
    `java -jar ${qontractJarPath} test ${qontracts} --host=${host} --port=${port}`,
    {  },
    err => {
      if (err) {
        console.log('Exit code: ', err.code);
      }
    }
  );  
}

runQontractTests();