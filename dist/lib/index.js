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

var startStubServer = (specmaticDir, stubDir, host, port) => {
  var specmaticJarPath = _path.default.resolve(_config.specmaticJarPathLocal);

  var specmatics = _path.default.resolve(specmaticDir + '');

  var stubs = _path.default.resolve(stubDir + '');

  console.log("java -jar ".concat(specmaticJarPath, " stub ").concat(specmatics, " --strict --data=").concat(stubs, " --host=").concat(host, " --port=").concat(port));
  console.log('starting specmatic stub server');
  (0, _execSh.default)("java -jar ".concat(specmaticJarPath, " stub ").concat(specmatics, " --strict --data=").concat(stubs, " --host=").concat(host, " --port=").concat(port));
};

exports.startStubServer = startStubServer;

var startTestServer = (specmaticDir, host, port) => {
  var specmaticJarPath = _path.default.resolve(_config.specmaticJarPathLocal);

  var specmatics = _path.default.resolve(specmaticDir);

  console.log('running specmatic tests');
  (0, _execSh.default)("java -jar ".concat(specmaticJarPath, " test ").concat(specmatics, " --host=").concat(host, " --port=").concat(port));
};

exports.startTestServer = startTestServer;

var loadDynamicStub = stubPath => {
  var stubResponse = require(_path.default.resolve(stubPath));

  (0, _nodeFetch.default)('http://localhost:8000/_specmatic/expectations', {
    method: 'POST',
    body: JSON.stringify(stubResponse)
  }).then(res => res.json()).then(json => console.log(json));
};

exports.loadDynamicStub = loadDynamicStub;