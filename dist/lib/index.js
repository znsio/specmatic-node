"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.loadDynamicStub = exports.startTestServer = exports.startStubServer = void 0;

var _nodeFetch = _interopRequireDefault(require("node-fetch"));

var _path = _interopRequireDefault(require("path"));

var _execSh = _interopRequireDefault(require("exec-sh"));

var _config = require("../config");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var startStubServer = (qontractDir, stubDir, host, port) => {
  var qontractJarPath = _path.default.resolve(_config.qontractJarPathLocal);

  var qontracts = _path.default.resolve(qontractDir + '');

  var stubs = _path.default.resolve(stubDir + '');

  console.log("java -jar ".concat(qontractJarPath, " stub ").concat(qontracts, " --strict --data=").concat(stubs, " --host=").concat(host, " --port=").concat(port));
  console.log('starting qontract stub server');
  (0, _execSh.default)("java -jar ".concat(qontractJarPath, " stub ").concat(qontracts, " --strict --data=").concat(stubs, " --host=").concat(host, " --port=").concat(port), {}, err => {
    if (err) {
      console.log('Exit code: ', err.code);
      process.exit(err.code);
    }
  });
};

exports.startStubServer = startStubServer;

var startTestServer = (qontractDir, host, port) => {
  var qontractJarPath = _path.default.resolve(_config.qontractJarPathLocal);

  var qontracts = _path.default.resolve(qontractDir);

  console.log('running qontract tests');
  (0, _execSh.default)("java -jar ".concat(qontractJarPath, " test ").concat(qontracts, " --host=").concat(host, " --port=").concat(port), {}, err => {
    if (err) {
      console.log('Exit code: ', err.code);
      process.exit(err.code);
    }
  });
};

exports.startTestServer = startTestServer;

var loadDynamicStub = stubPath => {
  var stubResponse = require(_path.default.resolve(stubPath));

  (0, _nodeFetch.default)('http://localhost:8000/_qontract/expectations', {
    method: 'POST',
    body: JSON.stringify(stubResponse)
  }).then(res => res.json()).then(json => console.log(json));
};

exports.loadDynamicStub = loadDynamicStub;