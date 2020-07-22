"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));

var _cryptoJs = _interopRequireDefault(require("crypto-js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var encode = function () {
  var _ref2 = _asyncToGenerator(function* (_ref) {
    var {
      secret,
      key = secret,
      token = {},
      maxAge
    } = _ref;

    if (maxAge) {
      if (token.iat) {
        delete token.iat;
      }

      if (token.exp) {
        delete token.exp;
      }
    }

    var signedToken = _jsonwebtoken.default.sign(token, secret, {
      expiresIn: maxAge
    });

    var encryptedToken = _cryptoJs.default.AES.encrypt(signedToken, key).toString();

    return encryptedToken;
  });

  return function encode(_x) {
    return _ref2.apply(this, arguments);
  };
}();

var decode = function () {
  var _ref4 = _asyncToGenerator(function* (_ref3) {
    var {
      secret,
      key = secret,
      token,
      maxAge,
      verify
    } = _ref3;
    if (!token) return null;

    var decryptedBytes = _cryptoJs.default.AES.decrypt(token, key);

    var decryptedToken = decryptedBytes.toString(_cryptoJs.default.enc.Utf8);

    if (!verify) {
      return decryptedToken;
    }

    var verifiedToken = _jsonwebtoken.default.verify(decryptedToken, secret, {
      maxAge
    });

    return verifiedToken;
  });

  return function decode(_x2) {
    return _ref4.apply(this, arguments);
  };
}();

var getJwt = function () {
  var _ref6 = _asyncToGenerator(function* (_ref5) {
    var {
      req,
      secret,
      cookieName,
      maxAge,
      verify = true
    } = _ref5;
    if (!req || !secret) throw new Error('Must pass { req, secret } to getJWT()');
    var secureCookieName = '__Secure-next-auth.session-token';
    var insecureCookieName = 'next-auth.session-token';
    var cookieValue = cookieName ? req.cookies[cookieName] : req.cookies[secureCookieName] || req.cookies[insecureCookieName];

    if (!cookieValue) {
      return null;
    }

    try {
      return yield decode({
        secret,
        token: cookieValue,
        maxAge,
        verify
      });
    } catch (error) {
      return null;
    }
  });

  return function getJwt(_x3) {
    return _ref6.apply(this, arguments);
  };
}();

var _default = {
  encode,
  decode,
  getJwt
};
exports.default = _default;