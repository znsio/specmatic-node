#!/usr/bin/env node
"use strict";

var execSh = require('exec-sh');

var path = require('path');

var {
  argv
} = require('yargs');

var {
  qontractJarPathLocal
} = require('../config');

var runQontractTests = () => {
  var qontractJarPath = path.resolve(qontractJarPathLocal);
  var {
    qontractDir,
    host,
    port
  } = argv;
  var qontracts = path.resolve(qontractDir);
  console.log('running qontract tests');
  execSh("java -jar ".concat(qontractJarPath, " test ").concat(qontracts, " --host=").concat(host, " --port=").concat(port), {}, err => {
    if (err) {
      console.log('Exit code: ', err.code);
    }
  });
};

runQontractTests();