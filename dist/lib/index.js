"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.loadDynamicStub = void 0;

var _nodeFetch = _interopRequireDefault(require("node-fetch"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var loadDynamicStub = () => {
  (0, _nodeFetch.default)('http://localhost:8000/_qontract/expectations', {
    method: 'POST',
    body: '{"http-request": {"method": "GET"}, "http-response": {"status": 200,"body": {"name": "new","type": "new","status": "new","id": "new"}}}'
  }).then(res => res.json()).then(json => console.log(json));
};

exports.loadDynamicStub = loadDynamicStub;