#!/usr/bin/env node
"use strict";

var _execSh = _interopRequireDefault(require("exec-sh"));

var _path = _interopRequireDefault(require("path"));

var _yargs = require("yargs");

var _config = require("../config");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var startStubServer = () => {
  var qontractJarPath = _path.default.resolve(_config.qontractJarPathLocal);

  var {
    qontractDir,
    stubDir,
    host,
    port
  } = _yargs.argv;

  var qontracts = _path.default.resolve(qontractDir + '');

  var stubs = _path.default.resolve(stubDir + '');

  console.log("java -jar ".concat(qontractJarPath, " stub ").concat(qontracts, " --strict --data=").concat(stubs, " --host=").concat(host, " --port=").concat(port));
  console.log('starting qontract stub server');
  (0, _execSh.default)("java -jar ".concat(qontractJarPath, " stub ").concat(qontracts, " --strict --data=").concat(stubs, " --host=").concat(host, " --port=").concat(port), {}, err => {
    if (err) {
      console.log('Exit code: ', err.code);
    }
  });
};

startStubServer();