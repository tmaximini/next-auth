"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _callback = _interopRequireDefault(require("../lib/oauth/callback"));

var _callbackHandler = _interopRequireDefault(require("../lib/callback-handler"));

var _cookie = _interopRequireDefault(require("../lib/cookie"));

var _logger = _interopRequireDefault(require("../../lib/logger"));

var _dispatchEvent = _interopRequireDefault(require("../lib/dispatch-event"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var _default = function () {
  var _ref = _asyncToGenerator(function* (req, res, options, done) {
    var {
      provider: providerName,
      providers,
      adapter,
      site,
      secret,
      baseUrl,
      cookies,
      callbackUrl,
      pages,
      jwt,
      events,
      callbacks
    } = options;
    var provider = providers[providerName];
    var {
      type
    } = provider;
    var useJwtSession = options.session.jwt;
    var sessionMaxAge = options.session.maxAge;
    var sessionToken = req.cookies ? req.cookies[cookies.sessionToken.name] : null;

    if (type === 'oauth') {
      try {
        (0, _callback.default)(req, provider, function () {
          var _ref2 = _asyncToGenerator(function* (error, profile, account, OAuthProfile) {
            try {
              if (error) {
                _logger.default.error('CALLBACK_OAUTH_ERROR', error);

                res.status(302).setHeader('Location', "".concat(baseUrl, "/error?error=oAuthCallback"));
                res.end();
                return done();
              }

              _logger.default.debug('OAUTH_CALLBACK_RESPONSE', {
                profile,
                account,
                OAuthProfile
              });

              if (!profile) {
                res.status(302).setHeader('Location', "".concat(baseUrl, "/signin"));
                res.end();
                return done();
              }

              var signinCallbackResponse = yield callbacks.signin(profile, account, OAuthProfile);

              if (signinCallbackResponse === false) {
                res.status(302).setHeader('Location', "".concat(baseUrl, "/error?error=AccessDenied"));
                res.end();
                return done();
              }

              var {
                user,
                session,
                isNewUser
              } = yield (0, _callbackHandler.default)(sessionToken, profile, account, options);

              if (useJwtSession) {
                var defaultJwtPayload = {
                  user,
                  account,
                  isNewUser
                };
                var jwtPayload = yield callbacks.jwt(defaultJwtPayload, OAuthProfile);
                var newEncodedJwt = yield jwt.encode({
                  secret: jwt.secret,
                  token: jwtPayload,
                  maxAge: sessionMaxAge
                });
                var cookieExpires = new Date();
                cookieExpires.setTime(cookieExpires.getTime() + sessionMaxAge * 1000);

                _cookie.default.set(res, cookies.sessionToken.name, newEncodedJwt, _objectSpread({
                  expires: cookieExpires.toISOString()
                }, cookies.sessionToken.options));
              } else {
                _cookie.default.set(res, cookies.sessionToken.name, session.sessionToken, _objectSpread({
                  expires: session.expires || null
                }, cookies.sessionToken.options));
              }

              yield (0, _dispatchEvent.default)(events.signin, {
                user,
                account,
                isNewUser
              });

              if (isNewUser && pages.newUser) {
                res.status(302).setHeader('Location', pages.newUser);
                res.end();
                return done();
              }

              res.status(302).setHeader('Location', callbackUrl || site);
              res.end();
              return done();
            } catch (error) {
              if (error.name === 'AccountNotLinkedError') {
                res.status(302).setHeader('Location', "".concat(baseUrl, "/error?error=OAuthAccountNotLinked"));
              } else if (error.name === 'CreateUserError') {
                res.status(302).setHeader('Location', "".concat(baseUrl, "/error?error=OAuthCreateAccount"));
              } else {
                _logger.default.error('OAUTH_CALLBACK_HANDLER_ERROR', error);

                res.status(302).setHeader('Location', "".concat(baseUrl, "/error?error=Callback"));
              }

              res.end();
              return done();
            }
          });

          return function (_x5, _x6, _x7, _x8) {
            return _ref2.apply(this, arguments);
          };
        }());
      } catch (error) {
        _logger.default.error('OAUTH_CALLBACK_ERROR', error);

        res.status(302).setHeader('Location', "".concat(baseUrl, "/error?error=Callback"));
        res.end();
        return done();
      }
    } else if (type === 'email') {
      try {
        if (!adapter) {
          _logger.default.error('EMAIL_REQUIRES_ADAPTER_ERROR');

          res.status(302).setHeader('Location', "".concat(baseUrl, "/error?error=Configuration"));
          res.end();
          return done();
        }

        var {
          getVerificationRequest,
          deleteVerificationRequest,
          getUserByEmail
        } = yield adapter.getAdapter(options);
        var verificationToken = req.query.token;
        var email = req.query.email;
        var invite = yield getVerificationRequest(email, verificationToken, secret, provider);

        if (!invite) {
          res.status(302).setHeader('Location', "".concat(baseUrl, "/error?error=Verification"));
          res.end();
          return done();
        }

        yield deleteVerificationRequest(email, verificationToken, secret, provider);
        var profile = (yield getUserByEmail(email)) || {
          email
        };
        var account = {
          id: provider.id,
          type: 'email',
          providerAccountId: email
        };
        var signinCallbackResponse = yield callbacks.signin(profile, account, null);

        if (signinCallbackResponse === false) {
          res.status(302).setHeader('Location', "".concat(baseUrl, "/error?error=AccessDenied"));
          res.end();
          return done();
        }

        var {
          user,
          session,
          isNewUser
        } = yield (0, _callbackHandler.default)(sessionToken, profile, account, options);

        if (useJwtSession) {
          var defaultJwtPayload = {
            user,
            account,
            isNewUser
          };
          var jwtPayload = yield callbacks.jwt(defaultJwtPayload);
          var newEncodedJwt = yield jwt.encode({
            secret: jwt.secret,
            token: jwtPayload,
            maxAge: sessionMaxAge
          });
          var cookieExpires = new Date();
          cookieExpires.setTime(cookieExpires.getTime() + sessionMaxAge * 1000);

          _cookie.default.set(res, cookies.sessionToken.name, newEncodedJwt, _objectSpread({
            expires: cookieExpires.toISOString()
          }, cookies.sessionToken.options));
        } else {
          _cookie.default.set(res, cookies.sessionToken.name, session.sessionToken, _objectSpread({
            expires: session.expires || null
          }, cookies.sessionToken.options));
        }

        yield (0, _dispatchEvent.default)(events.signin, {
          user,
          account,
          isNewUser
        });

        if (isNewUser && pages.newUser) {
          res.status(302).setHeader('Location', pages.newUser);
          res.end();
          return done();
        }

        if (callbackUrl) {
          res.status(302).setHeader('Location', callbackUrl);
          res.end();
        } else {
          res.status(302).setHeader('Location', site);
          res.end();
        }

        return done();
      } catch (error) {
        if (error.name === 'CreateUserError') {
          res.status(302).setHeader('Location', "".concat(baseUrl, "/error?error=EmailCreateAccount"));
        } else {
          res.status(302).setHeader('Location', "".concat(baseUrl, "/error?error=Callback"));

          _logger.default.error('CALLBACK_EMAIL_ERROR', error);
        }

        res.end();
        return done();
      }
    } else if (type === 'credentials' && req.method === 'POST') {
      if (!useJwtSession) {
        _logger.default.error('CALLBACK_CREDENTIALS_JWT_ERROR', 'Signin in with credentials is only supported if JSON Web Tokens are enabled');

        res.status(302).setHeader('Location', "".concat(baseUrl, "/error?error=Configuration"));
        res.end();
        return done();
      }

      if (!provider.authorize) {
        _logger.default.error('CALLBACK_CREDENTIALS_HANDLER_ERROR', 'Must define an authorize() handler to use credentials authentication provider');

        res.status(302).setHeader('Location', "".concat(baseUrl, "/error?error=Configuration"));
        res.end();
        return done();
      }

      var credentials = req.body;
      var userObjectReturnedFromAuthorizeHandler;

      try {
        userObjectReturnedFromAuthorizeHandler = yield provider.authorize(credentials);
      } catch (error) {
        res.status(302).setHeader('Location', "".concat(baseUrl, "/error?error=Configuration"));
        res.end();
        return done();
      }

      var _user = userObjectReturnedFromAuthorizeHandler;
      var _account = {
        id: provider.id,
        type: 'credentials'
      };

      if (!_user) {
        res.status(302).setHeader('Location', "".concat(baseUrl, "/error?error=CredentialsSignin&provider=").concat(encodeURIComponent(provider.id)));
        res.end();
        return done();
      }

      var _signinCallbackResponse = yield callbacks.signin(_user, _account, credentials);

      if (_signinCallbackResponse === false) {
        res.status(302).setHeader('Location', "".concat(baseUrl, "/error?error=AccessDenied"));
        res.end();
        return done();
      }

      var _defaultJwtPayload = {
        user: _user,
        account: _account
      };

      var _jwtPayload = yield callbacks.jwt(_defaultJwtPayload);

      var _newEncodedJwt = yield jwt.encode({
        secret: jwt.secret,
        token: _jwtPayload,
        maxAge: sessionMaxAge
      });

      var _cookieExpires = new Date();

      _cookieExpires.setTime(_cookieExpires.getTime() + sessionMaxAge * 1000);

      _cookie.default.set(res, cookies.sessionToken.name, _newEncodedJwt, _objectSpread({
        expires: _cookieExpires.toISOString()
      }, cookies.sessionToken.options));

      yield (0, _dispatchEvent.default)(events.signin, {
        user: _user,
        account: _account
      });

      if (callbackUrl) {
        res.status(302).setHeader('Location', callbackUrl);
        res.end();
      } else {
        res.status(302).setHeader('Location', site);
        res.end();
      }

      return done();
    } else {
      res.status(500).end("Error: Callback for provider type ".concat(type, " not supported"));
      return done();
    }
  });

  return function (_x, _x2, _x3, _x4) {
    return _ref.apply(this, arguments);
  };
}();

exports.default = _default;