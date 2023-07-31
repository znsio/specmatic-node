"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.callKafka = exports.callCore = void 0;
var _path = _interopRequireDefault(require("path"));
var _config = require("../config");
var _logger = _interopRequireDefault(require("../common/logger"));
var _child_process = require("child_process");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
var callCore = function callCore(args, done, onOutput) {
  var rootPath = _path["default"].resolve(__dirname, '..', '..');
  var specmaticJarPath = _path["default"].resolve(rootPath, _config.specmaticCoreJarName);
  _logger["default"].debug("CLI: Specmatic jar path: ".concat(specmaticJarPath));
  return callJar(specmaticJarPath, args, done, onOutput);
};
exports.callCore = callCore;
var callKafka = function callKafka(args, done, onOutput) {
  var rootPath = _path["default"].resolve(__dirname, '..', '..', '..', 'specmatic-beta', 'kafka');
  var specmaticJarPath = _path["default"].resolve(rootPath, _config.specmaticKafkaJarName);
  _logger["default"].debug("CLI: Specmatic jar path: ".concat(specmaticJarPath));
  return callJar(specmaticJarPath, args, done, onOutput);
};
exports.callKafka = callKafka;
function callJar(jarPath, args, done, onOutput) {
  var _javaProcess$stdout, _javaProcess$stderr;
  var argsList = [];
  if (process.env['endpointsAPI']) {
    argsList.push("-DendpointsAPI=\"".concat(process.env['endpointsAPI'], "\""));
  }
  argsList = argsList.concat(['-jar', "\"".concat(jarPath, "\""), args]);
  var javaProcess = (0, _child_process.spawn)('java', argsList, {
    stdio: 'pipe',
    stderr: 'pipe',
    shell: true
  });
  (_javaProcess$stdout = javaProcess.stdout) === null || _javaProcess$stdout === void 0 ? void 0 : _javaProcess$stdout.on('data', function (data) {
    onOutput("".concat(data), false);
  });
  (_javaProcess$stderr = javaProcess.stderr) === null || _javaProcess$stderr === void 0 ? void 0 : _javaProcess$stderr.on('data', function (data) {
    onOutput("".concat(data), true);
  });
  javaProcess.on('close', function (code) {
    if (code) {
      done(new Error('Command exited with non zero code: ' + code));
    } else {
      done(null);
    }
  });
  return javaProcess;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJfcGF0aCIsIl9pbnRlcm9wUmVxdWlyZURlZmF1bHQiLCJyZXF1aXJlIiwiX2NvbmZpZyIsIl9sb2dnZXIiLCJfY2hpbGRfcHJvY2VzcyIsIm9iaiIsIl9fZXNNb2R1bGUiLCJjYWxsQ29yZSIsImFyZ3MiLCJkb25lIiwib25PdXRwdXQiLCJyb290UGF0aCIsInBhdGgiLCJyZXNvbHZlIiwiX19kaXJuYW1lIiwic3BlY21hdGljSmFyUGF0aCIsInNwZWNtYXRpY0NvcmVKYXJOYW1lIiwibG9nZ2VyIiwiZGVidWciLCJjb25jYXQiLCJjYWxsSmFyIiwiZXhwb3J0cyIsImNhbGxLYWZrYSIsInNwZWNtYXRpY0thZmthSmFyTmFtZSIsImphclBhdGgiLCJfamF2YVByb2Nlc3Mkc3Rkb3V0IiwiX2phdmFQcm9jZXNzJHN0ZGVyciIsImFyZ3NMaXN0IiwicHJvY2VzcyIsImVudiIsInB1c2giLCJqYXZhUHJvY2VzcyIsInNwYXduIiwic3RkaW8iLCJzdGRlcnIiLCJzaGVsbCIsInN0ZG91dCIsIm9uIiwiZGF0YSIsImNvZGUiLCJFcnJvciJdLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21tb24vcnVubmVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBleGVjU2ggZnJvbSAnZXhlYy1zaCc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IHNwZWNtYXRpY0NvcmVKYXJOYW1lLCBzcGVjbWF0aWNLYWZrYUphck5hbWUgfSBmcm9tICcuLi9jb25maWcnO1xuaW1wb3J0IGxvZ2dlciBmcm9tICcuLi9jb21tb24vbG9nZ2VyJztcbmltcG9ydCB7IENoaWxkUHJvY2Vzcywgc3Bhd24sIFNwYXduT3B0aW9ucyB9IGZyb20gJ2NoaWxkX3Byb2Nlc3MnO1xuXG5jb25zdCBjYWxsQ29yZSA9IChhcmdzOiBzdHJpbmcsIGRvbmU6IChlcnJvcjogYW55KSA9PiB2b2lkLCBvbk91dHB1dDogKG1lc3NhZ2U6IHN0cmluZywgZXJyb3I6IGJvb2xlYW4pID0+IHZvaWQpOiBDaGlsZFByb2Nlc3MgPT4ge1xuICAgIGNvbnN0IHJvb3RQYXRoID0gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uJywgJy4uJyk7XG4gICAgY29uc3Qgc3BlY21hdGljSmFyUGF0aCA9IHBhdGgucmVzb2x2ZShyb290UGF0aCwgc3BlY21hdGljQ29yZUphck5hbWUpO1xuICAgIGxvZ2dlci5kZWJ1ZyhgQ0xJOiBTcGVjbWF0aWMgamFyIHBhdGg6ICR7c3BlY21hdGljSmFyUGF0aH1gKTtcbiAgICByZXR1cm4gY2FsbEphcihzcGVjbWF0aWNKYXJQYXRoLCBhcmdzLCBkb25lLCBvbk91dHB1dCk7XG59O1xuXG5jb25zdCBjYWxsS2Fma2EgPSAoYXJnczogc3RyaW5nLCBkb25lOiAoZXJyb3I6IGFueSkgPT4gdm9pZCwgb25PdXRwdXQ6IChtZXNzYWdlOiBzdHJpbmcsIGVycm9yOiBib29sZWFuKSA9PiB2b2lkKTogQ2hpbGRQcm9jZXNzID0+IHtcbiAgICBjb25zdCByb290UGF0aCA9IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLicsICcuLicsICcuLicsICdzcGVjbWF0aWMtYmV0YScsICdrYWZrYScpO1xuICAgIGNvbnN0IHNwZWNtYXRpY0phclBhdGggPSBwYXRoLnJlc29sdmUocm9vdFBhdGgsIHNwZWNtYXRpY0thZmthSmFyTmFtZSk7XG4gICAgbG9nZ2VyLmRlYnVnKGBDTEk6IFNwZWNtYXRpYyBqYXIgcGF0aDogJHtzcGVjbWF0aWNKYXJQYXRofWApO1xuICAgIHJldHVybiBjYWxsSmFyKHNwZWNtYXRpY0phclBhdGgsIGFyZ3MsIGRvbmUsIG9uT3V0cHV0KTtcbn07XG5cbmZ1bmN0aW9uIGNhbGxKYXIoamFyUGF0aDogc3RyaW5nLCBhcmdzOiBzdHJpbmcsIGRvbmU6IChlcnJvcjogYW55KSA9PiB2b2lkLCBvbk91dHB1dDogKG1lc3NhZ2U6IHN0cmluZywgZXJyb3I6IGJvb2xlYW4pID0+IHZvaWQpIHtcbiAgICBsZXQgYXJnc0xpc3QgPSBbXTtcbiAgICBpZiAocHJvY2Vzcy5lbnZbJ2VuZHBvaW50c0FQSSddKSB7XG4gICAgICAgIGFyZ3NMaXN0LnB1c2goYC1EZW5kcG9pbnRzQVBJPVwiJHtwcm9jZXNzLmVudlsnZW5kcG9pbnRzQVBJJ119XCJgKTtcbiAgICB9XG4gICAgYXJnc0xpc3QgPSBhcmdzTGlzdC5jb25jYXQoWyctamFyJywgYFwiJHtqYXJQYXRofVwiYCwgYXJnc10pO1xuICAgIGNvbnN0IGphdmFQcm9jZXNzOiBDaGlsZFByb2Nlc3MgPSBzcGF3bignamF2YScsIGFyZ3NMaXN0LCB7IHN0ZGlvOiAncGlwZScsIHN0ZGVycjogJ3BpcGUnLCBzaGVsbDogdHJ1ZSB9IGFzIFNwYXduT3B0aW9ucyk7XG4gICAgamF2YVByb2Nlc3Muc3Rkb3V0Py5vbignZGF0YScsIGZ1bmN0aW9uIChkYXRhOiBTdHJpbmcpIHtcbiAgICAgICAgb25PdXRwdXQoYCR7ZGF0YX1gLCBmYWxzZSk7XG4gICAgfSk7XG4gICAgamF2YVByb2Nlc3Muc3RkZXJyPy5vbignZGF0YScsIGZ1bmN0aW9uIChkYXRhOiBTdHJpbmcpIHtcbiAgICAgICAgb25PdXRwdXQoYCR7ZGF0YX1gLCB0cnVlKTtcbiAgICB9KTtcbiAgICBqYXZhUHJvY2Vzcy5vbignY2xvc2UnLCBmdW5jdGlvbiAoY29kZTpudW1iZXIpIHtcbiAgICAgICAgaWYgKGNvZGUpIHtcbiAgICAgICAgICAgIGRvbmUobmV3IEVycm9yKCdDb21tYW5kIGV4aXRlZCB3aXRoIG5vbiB6ZXJvIGNvZGU6ICcgKyBjb2RlKSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRvbmUobnVsbCk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gamF2YVByb2Nlc3M7XG59XG5cbmV4cG9ydCB7IGNhbGxDb3JlLCBjYWxsS2Fma2EgfTtcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQ0EsSUFBQUEsS0FBQSxHQUFBQyxzQkFBQSxDQUFBQyxPQUFBO0FBQ0EsSUFBQUMsT0FBQSxHQUFBRCxPQUFBO0FBQ0EsSUFBQUUsT0FB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