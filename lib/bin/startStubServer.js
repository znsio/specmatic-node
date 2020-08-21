#!/usr/bin/env node
"use strict";

var startStubServer = () => {
  var execSh = require('exec-sh');

  var path = require('path');

  var {
    qontractJarPathLocal
  } = require('../config');

  var qontractJarPath = path.resolve(qontractJarPathLocal);

  var {
    argv
  } = require('yargs');

  var {
    qontractDir,
    stubDir,
    host,
    port
  } = argv;
  var qontracts = path.resolve(qontractDir);
  var stubs = path.resolve(stubDir);
  console.log('starting qontract stub server');
  execSh("java -jar ".concat(qontractJarPath, " stub ").concat(qontracts, " --data ").concat(stubs, " --host=").concat(host, " --port=").concat(port), {}, err => {
    if (err) {
      console.log('Exit code: ', err.code);
    }
  });
};

startStubServer();