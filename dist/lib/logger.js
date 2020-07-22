"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var logger = {
  error: function error(errorCode) {
    for (var _len = arguments.length, text = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      text[_key - 1] = arguments[_key];
    }

    if (console) {
      !text ? console.error(errorCode) : console.error("[next-auth][error][".concat(errorCode, "]"), text, "\nhttps://next-auth.js.org/errors#".concat(errorCode.toLowerCase()));
    }
  },
  debug: function debug(debugCode) {
    if (process && process.env && process.env._NEXTAUTH_DEBUG) {
      for (var _len2 = arguments.length, text = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        text[_key2 - 1] = arguments[_key2];
      }

      console.log("[next-auth][debug][".concat(debugCode, "]"), text);
    }
  }
};
var _default = logger;
exports.default = _default;