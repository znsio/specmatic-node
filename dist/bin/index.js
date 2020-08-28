#!/usr/bin/env node
"use strict";

var _execSh = _interopRequireDefault(require("exec-sh"));

var _path = _interopRequireDefault(require("path"));

var _config = require("../config");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var startStubServer = () => {
  var qontractJarPath = _path.default.resolve(_config.qontractJarPathLocal);

  var args = process.argv.reduce((acc, arg, currentIndex) => {
    if (currentIndex === 0 || currentIndex === 1) {
      return '';
    }

    return acc + ' ' + arg;
  });
  console.log("java -jar ".concat(qontractJarPath, " ").concat(args));
  console.log('starting qontract stub server');
  (0, _execSh.default)("java -jar ".concat(qontractJarPath, " ").concat(args), {}, err => {
    if (err) {
      console.log('Exit code: ', err.code);
    }
  });
};

startStubServer();