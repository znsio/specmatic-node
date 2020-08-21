#!/usr/bin/env node

const execSh = require('exec-sh');
const path = require('path');
const {argv} = require('yargs');
const { qontractJarPathLocal } = require('../config');

const runQontractTests = () => {
  const qontractJarPath = path.resolve(qontractJarPathLocal);
  const { qontractDir, host, port} = argv;

  const qontracts = path.resolve(qontractDir);
  
  console.log('running qontract tests')
  execSh(
    `java -jar ${qontractJarPath} test ${qontracts} --host=${host} --port=${port}`,
    {  },
    (err: any) => {
      if (err) {
        console.log('Exit code: ', err.code);
      }
    }
  );  
}

runQontractTests();