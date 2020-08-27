"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.loadDynamicStub = void 0;

var _nodeFetch = _interopRequireDefault(require("node-fetch"));

var _path = _interopRequireDefault(require("path"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var loadDynamicStub = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(function* (stubPath) {
    var stubResponse = require(_path.default.resolve(stubPath));

    console.log(JSON.stringify(stubResponse));
    (0, _nodeFetch.default)('http://localhost:8000/_qontract/expectations', {
      method: 'POST',
      body: JSON.stringify(stubResponse)
    }).then(res => res.json()).then(json => console.log(json));
  });

  return function loadDynamicStub(_x) {
    return _ref.apply(this, arguments);
  };
}();

exports.loadDynamicStub = loadDynamicStub;