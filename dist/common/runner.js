"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.callKafka = exports.callCore = void 0;
var _execSh = _interopRequireDefault(require("exec-sh"));
var _path = _interopRequireDefault(require("path"));
var _config = require("../config");
var _logger = _interopRequireDefault(require("../common/logger"));
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
  var java = 'java';
  if (process.env['endpointsAPI']) {
    java = "".concat(java, " -DendpointsAPI=\"").concat(process.env['endpointsAPI'], "\"");
  }
  var javaProcess = (0, _execSh["default"])("".concat(java, " -jar \"").concat(jarPath, "\" ").concat(args), {
    stdio: 'pipe',
    stderr: 'pipe'
  }, done);
  (_javaProcess$stdout = javaProcess.stdout) === null || _javaProcess$stdout === void 0 ? void 0 : _javaProcess$stdout.on('data', function (data) {
    onOutput("".concat(data), false);
  });
  (_javaProcess$stderr = javaProcess.stderr) === null || _javaProcess$stderr === void 0 ? void 0 : _javaProcess$stderr.on('data', function (data) {
    onOutput("".concat(data), true);
  });
  return javaProcess;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJfZXhlY1NoIiwiX2ludGVyb3BSZXF1aXJlRGVmYXVsdCIsInJlcXVpcmUiLCJfcGF0aCIsIl9jb25maWciLCJfbG9nZ2VyIiwib2JqIiwiX19lc01vZHVsZSIsImNhbGxDb3JlIiwiYXJncyIsImRvbmUiLCJvbk91dHB1dCIsInJvb3RQYXRoIiwicGF0aCIsInJlc29sdmUiLCJfX2Rpcm5hbWUiLCJzcGVjbWF0aWNKYXJQYXRoIiwic3BlY21hdGljQ29yZUphck5hbWUiLCJsb2dnZXIiLCJkZWJ1ZyIsImNvbmNhdCIsImNhbGxKYXIiLCJleHBvcnRzIiwiY2FsbEthZmthIiwic3BlY21hdGljS2Fma2FKYXJOYW1lIiwiamFyUGF0aCIsIl9qYXZhUHJvY2VzcyRzdGRvdXQiLCJfamF2YVByb2Nlc3Mkc3RkZXJyIiwiamF2YSIsInByb2Nlc3MiLCJlbnYiLCJqYXZhUHJvY2VzcyIsImV4ZWNTaCIsInN0ZGlvIiwic3RkZXJyIiwic3Rkb3V0Iiwib24iLCJkYXRhIl0sInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbW1vbi9ydW5uZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGV4ZWNTaCBmcm9tICdleGVjLXNoJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgc3BlY21hdGljQ29yZUphck5hbWUsIHNwZWNtYXRpY0thZmthSmFyTmFtZSB9IGZyb20gJy4uL2NvbmZpZyc7XG5pbXBvcnQgbG9nZ2VyIGZyb20gJy4uL2NvbW1vbi9sb2dnZXInO1xuaW1wb3J0IHsgQ2hpbGRQcm9jZXNzIH0gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5cbmNvbnN0IGNhbGxDb3JlID0gKGFyZ3M6IHN0cmluZywgZG9uZTogKGVycm9yOiBhbnkpID0+IHZvaWQsIG9uT3V0cHV0OiAobWVzc2FnZTogc3RyaW5nLCBlcnJvcjogYm9vbGVhbikgPT4gdm9pZCk6IENoaWxkUHJvY2VzcyA9PiB7XG4gICAgY29uc3Qgcm9vdFBhdGggPSBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4nLCAnLi4nKTtcbiAgICBjb25zdCBzcGVjbWF0aWNKYXJQYXRoID0gcGF0aC5yZXNvbHZlKHJvb3RQYXRoLCBzcGVjbWF0aWNDb3JlSmFyTmFtZSk7XG4gICAgbG9nZ2VyLmRlYnVnKGBDTEk6IFNwZWNtYXRpYyBqYXIgcGF0aDogJHtzcGVjbWF0aWNKYXJQYXRofWApO1xuICAgIHJldHVybiBjYWxsSmFyKHNwZWNtYXRpY0phclBhdGgsIGFyZ3MsIGRvbmUsIG9uT3V0cHV0KTtcbn07XG5cbmNvbnN0IGNhbGxLYWZrYSA9IChhcmdzOiBzdHJpbmcsIGRvbmU6IChlcnJvcjogYW55KSA9PiB2b2lkLCBvbk91dHB1dDogKG1lc3NhZ2U6IHN0cmluZywgZXJyb3I6IGJvb2xlYW4pID0+IHZvaWQpOiBDaGlsZFByb2Nlc3MgPT4ge1xuICAgIGNvbnN0IHJvb3RQYXRoID0gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uJywgJy4uJywgJy4uJywgJ3NwZWNtYXRpYy1iZXRhJywgJ2thZmthJyk7XG4gICAgY29uc3Qgc3BlY21hdGljSmFyUGF0aCA9IHBhdGgucmVzb2x2ZShyb290UGF0aCwgc3BlY21hdGljS2Fma2FKYXJOYW1lKTtcbiAgICBsb2dnZXIuZGVidWcoYENMSTogU3BlY21hdGljIGphciBwYXRoOiAke3NwZWNtYXRpY0phclBhdGh9YCk7XG4gICAgcmV0dXJuIGNhbGxKYXIoc3BlY21hdGljSmFyUGF0aCwgYXJncywgZG9uZSwgb25PdXRwdXQpO1xufTtcblxuZnVuY3Rpb24gY2FsbEphcihqYXJQYXRoOiBzdHJpbmcsIGFyZ3M6IHN0cmluZywgZG9uZTogKGVycm9yOiBhbnkpID0+IHZvaWQsIG9uT3V0cHV0OiAobWVzc2FnZTogc3RyaW5nLCBlcnJvcjogYm9vbGVhbikgPT4gdm9pZCkge1xuICAgIGxldCBqYXZhID0gJ2phdmEnO1xuICAgIGlmIChwcm9jZXNzLmVudlsnZW5kcG9pbnRzQVBJJ10pIHtcbiAgICAgICAgamF2YSA9IGAke2phdmF9IC1EZW5kcG9pbnRzQVBJPVwiJHtwcm9jZXNzLmVudlsnZW5kcG9pbnRzQVBJJ119XCJgO1xuICAgIH1cbiAgICBjb25zdCBqYXZhUHJvY2VzcyA9IGV4ZWNTaChgJHtqYXZhfSAtamFyIFwiJHtqYXJQYXRofVwiICR7YXJnc31gLCB7IHN0ZGlvOiAncGlwZScsIHN0ZGVycjogJ3BpcGUnIH0sIGRvbmUpO1xuICAgIGphdmFQcm9jZXNzLnN0ZG91dD8ub24oJ2RhdGEnLCBmdW5jdGlvbiAoZGF0YTogU3RyaW5nKSB7XG4gICAgICAgIG9uT3V0cHV0KGAke2RhdGF9YCwgZmFsc2UpO1xuICAgIH0pO1xuICAgIGphdmFQcm9jZXNzLnN0ZGVycj8ub24oJ2RhdGEnLCBmdW5jdGlvbiAoZGF0YTogU3RyaW5nKSB7XG4gICAgICAgIG9uT3V0cHV0KGAke2RhdGF9YCwgdHJ1ZSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGphdmFQcm9jZXNzO1xufVxuXG5leHBvcnQgeyBjYWxsQ29yZSwgY2FsbEthZmthIH07XG4iXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLElBQUFBLE9BQUEsR0FBQUMsc0JBQUEsQ0FBQUMsT0FBQTtBQUNBLElBQUFDLEtBQUEsR0FBQUYsc0JBQUEsQ0FBQUMsT0FBQTtBQUNBLElBQUFFLE9BQUEsR0FBQUYsT0FBQTtBQUNBLElBQUFHLE9BQUEsR0FBQUosc0JBQUEsQ0FBQUMsT0FBQTtBQUFzQyxTQUFBRCx1QkFBQUssR0FBQSxXQUFBQSxHQUFBLElBQUFBLEdBQUEsQ0FBQUMsVUFBQSxHQUFBRCxHQUFBLGdCQUFBQSxHQUFBO0FBR3RDLElBQU1FLFFBQVEsR0FBRyxTQUFYQSxRQUFRQSxDQUFJQyxJQUFZLEVBQUVDLElBQTBCLEVBQUVDLFFBQW1ELEVBQW1CO0VBQzlILElBQU1DLFFBQVEsR0FBR0MsZ0JBQUksQ0FBQ0MsT0FBTyxDQUFDQyxTQUFTLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQztFQUNwRCxJQUFNQyxnQkFBZ0IsR0FBR0gsZ0JBQUksQ0FBQ0MsT0FBTyxDQUFDRixRQUFRLEVBQUVLLDRCQUFvQixDQUFDO0VBQ3JFQyxrQkFBTSxDQUFDQyxLQUFLLDZCQUFBQyxNQUFBLENBQTZCSixnQkFBZ0IsQ0FBRSxDQUFDO0VBQzVELE9BQU9LLE9BQU8sQ0FBQ0wsZ0JBQWdCLEVBQUVQLElBQUksRUFBRUMsSUFBSSxFQUFFQyxRQUFRLENBQUM7QUFDMUQsQ0FBQztBQUFDVyxPQUFBLENBQUFkLFFBQUEsR0FBQUEsUUFBQTtBQUVGLElBQU1lLFNBQVMsR0FBRyxTQUFaQSxTQUFTQSxDQUFJZCxJQUFZLEVBQUVDLElBQTBCLEVBQUVDLFFBQW1ELEVBQW1CO0VBQy9ILElBQU1DLFFBQVEsR0FBR0MsZ0JBQUksQ0FBQ0MsT0FBTyxDQUFDQyxTQUFTLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsZ0JBQWdCLEVBQUUsT0FBTyxDQUFDO0VBQ3JGLElBQU1DLGdCQUFnQixHQUFHSCxnQkFBSSxDQUFDQyxPQUFPLENBQUNGLFFBQVEsRUFBRVksNkJBQXFCLENBQUM7RUFDdEVOLGtCQUFNLENBQUNDLEtBQUssNkJBQUFDLE1BQUEsQ0FBNkJKLGdCQUFnQixDQUFFLENBQUM7RUFDNUQsT0FBT0ssT0FBTyxDQUFDTCxnQkFBZ0IsRUFBRVAsSUFBSSxFQUFFQyxJQUFJLEVBQUVDLFFBQVEsQ0FBQztBQUMxRCxDQUFDO0FBQUNXLE9BQUEsQ0FBQUMsU0FBQSxHQUFBQSxTQUFBO0FBRUYsU0FBU0YsT0FBT0EsQ0FBQ0ksT0FBZSxFQUFFaEIsSUFBWSxFQUFFQyxJQUEwQixFQUFFQyxRQUFtRCxFQUFFO0VBQUEsSUFBQWUsbUJBQUEsRUFBQUMsbUJBQUE7RUFDN0gsSUFBSUMsSUFBSSxHQUFHLE1BQU07RUFDakIsSUFBSUMsT0FBTyxDQUFDQyxHQUFHLENBQUMsY0FBYyxDQUFDLEVBQUU7SUFDN0JGLElBQUksTUFBQVIsTUFBQSxDQUFNUSxJQUFJLHdCQUFBUixNQUFBLENBQW9CUyxPQUFPLENBQUNDLEdBQUcsQ0FBQyxjQUFjLENBQUMsT0FBRztFQUNwRTtFQUNBLElBQU1DLFdBQVcsR0FBRyxJQUFBQyxrQkFBTSxLQUFBWixNQUFBLENBQUlRLElBQUksY0FBQVIsTUFBQSxDQUFVSyxPQUFPLFNBQUFMLE1BQUEsQ0FBS1gsSUFBSSxHQUFJO0lBQUV3QixLQUFLLEVBQUUsTUFBTTtJQUFFQyxNQUFNLEVBQUU7RUFBTyxDQUFDLEVBQUV4QixJQUFJLENBQUM7RUFDeEcsQ0FBQWdCLG1CQUFBLEdBQUFLLFdBQVcsQ0FBQ0ksTUFBTSxjQUFBVCxtQkFBQSx1QkFBbEJBLG1CQUFBLENBQW9CVSxFQUFFLENBQUMsTUFBTSxFQUFFLFVBQVVDLElBQVksRUFBRTtJQUNuRDFCLFFBQVEsSUFBQVMsTUFBQSxDQUFJaUIsSUFBSSxHQUFJLEtBQUssQ0FBQztFQUM5QixDQUFDLENBQUM7RUFDRixDQUFBVixtQkFBQSxHQUFBSSxXQUFXLENBQUNHLE1BQU0sY0FBQVAsbUJBQUEsdUJBQWxCQSxtQkFBQSxDQUFvQlMsRUFBRSxDQUFDLE1BQU0sRUFBRSxVQUFVQyxJQUFZLEVBQUU7SUFDbkQxQixRQUFRLElBQUFTLE1BQUEsQ0FBSWlCLElBQUksR0FBSSxJQUFJLENBQUM7RUFDN0IsQ0FBQyxDQUFDO0VBQ0YsT0FBT04sV0FBVztBQUN0QiJ9