"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "loadDynamicStub", {
  enumerable: true,
  get: function get() {
    return _lib.loadDynamicStub;
  }
});

var _download = _interopRequireDefault(require("download"));

var _config = require("./config");

var _lib = require("./lib");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var init = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(function* () {
    console.log('Starting qontract jar download..');
    yield _asyncToGenerator(function* () {
      yield (0, _download.default)(_config.qontractJarPathRemote, '.');
    })();
    console.log('Finished qontract jar download!!');
  });

  return function init() {
    return _ref.apply(this, arguments);
  };
}();

init();