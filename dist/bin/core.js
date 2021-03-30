"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _execSh = _interopRequireDefault(require("exec-sh"));

var _path = _interopRequireDefault(require("path"));

var _config = require("../config");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var startSpecmaticServer = args => {
  var specmaticJarPath = _path.default.resolve(_config.specmaticJarPathLocal);

  var cliArgs = (args || process.argv).slice(2).join(' ');
  console.log('starting specmatic server', cliArgs);
  (0, _execSh.default)("java -jar ".concat(specmaticJarPath, " ").concat(cliArgs), {}, err => {
    if (err) {
      console.log('Exit code: ', err.code);
    }
  });
};

var _default = startSpecmaticServer;
exports.default = _default;