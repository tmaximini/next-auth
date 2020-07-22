"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _oauth = _interopRequireDefault(require("../lib/signin/oauth"));

var _email = _interopRequireDefault(require("../lib/signin/email"));

var _logger = _interopRequireDefault(require("../../lib/logger"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var _default = function () {
  var _ref = _asyncToGenerator(function* (req, res, options, done) {
    var {
      provider: providerName,
      providers,
      baseUrl,
      csrfTokenVerified,
      adapter,
      callbacks
    } = options;
    var provider = providers[providerName];
    var {
      type
    } = provider;

    if (!type) {
      res.status(500).end("Error: Type not specified for ".concat(provider));
      return done();
    }

    if (type === 'oauth') {
      (0, _oauth.default)(provider, (error, oAuthSigninUrl) => {
        if (error) {
          _logger.default.error('SIGNIN_OAUTH_ERROR', error);

          res.status(302).setHeader('Location', "".concat(baseUrl, "/error?error=oAuthSignin"));
          res.end();
          return done();
        }

        res.status(302).setHeader('Location', oAuthSigninUrl);
        res.end();
        return done();
      });
    } else if (type === 'email' && req.method === 'POST') {
      if (!adapter) {
        _logger.default.error('EMAIL_REQUIRES_ADAPTER_ERROR');

        res.status(302).setHeader('Location', "".concat(baseUrl, "/error?error=Configuration"));
        res.end();
        return done();
      }

      var {
        getUserByEmail
      } = yield adapter.getAdapter(options);
      var email = req.body.email ? req.body.email.toLowerCase() : null;
      var profile = (yield getUserByEmail(email)) || {
        email
      };
      var account = {
        id: provider.id,
        type: 'email',
        providerAccountId: email
      };
      var signinCallbackResponse = yield callbacks.signin(profile, account);

      if (signinCallbackResponse === false) {
        res.status(302).setHeader('Location', "".concat(baseUrl, "/error?error=AccessDenied"));
        res.end();
        return done();
      }

      if (!csrfTokenVerified) {
        res.status(302).setHeader('Location', "".concat(baseUrl, "/signin?email=").concat(encodeURIComponent(email), "&csrf=true"));
        res.end();
        return done();
      }

      try {
        yield (0, _email.default)(email, provider, options);
      } catch (error) {
        _logger.default.error('SIGNIN_EMAIL_ERROR', error);

        res.status(302).setHeader('Location', "".concat(baseUrl, "/error?error=EmailSignin"));
        res.end();
        return done();
      }

      res.status(302).setHeader('Location', "".concat(baseUrl, "/verify-request?provider=").concat(encodeURIComponent(provider.id), "&type=").concat(encodeURIComponent(provider.type)));
      res.end();
      return done();
    } else {
      res.status(302).setHeader('Location', "".concat(baseUrl, "/signin"));
      res.end();
      return done();
    }
  });

  return function (_x, _x2, _x3, _x4) {
    return _ref.apply(this, arguments);
  };
}();

exports.default = _default;