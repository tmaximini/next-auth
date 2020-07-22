"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = require("react");

var _logger = _interopRequireDefault(require("../lib/logger"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var __NEXTAUTH = {
  site: '',
  basePath: '/api/auth',
  clientMaxAge: 0
};
var __NEXTAUTH_EVENT_LISTENER_ADDED = false;

var setOptions = function setOptions() {
  var {
    site,
    basePath,
    clientMaxAge
  } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  if (site) {
    __NEXTAUTH.site = site;
  }

  if (basePath) {
    __NEXTAUTH.basePath = basePath;
  }

  if (clientMaxAge) {
    __NEXTAUTH.clientMaxAge = clientMaxAge;
  }
};

var getSession = function () {
  var _ref = _asyncToGenerator(function* () {
    var {
      req,
      ctx
    } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    if (!req && ctx.req) {
      req = ctx.req;
    }

    var baseUrl = _baseUrl();

    var options = req ? {
      headers: {
        cookie: req.headers.cookie
      }
    } : {};
    var session = yield _fetchData("".concat(baseUrl, "/session"), options);

    _sendMessage({
      event: 'session',
      data: {
        trigger: 'getSession'
      }
    });

    return session;
  });

  return function getSession() {
    return _ref.apply(this, arguments);
  };
}();

var getProviders = function () {
  var _ref2 = _asyncToGenerator(function* () {
    var baseUrl = _baseUrl();

    return _fetchData("".concat(baseUrl, "/providers"));
  });

  return function getProviders() {
    return _ref2.apply(this, arguments);
  };
}();

var getCsrfToken = function () {
  var _ref3 = _asyncToGenerator(function* () {
    var baseUrl = _baseUrl();

    var data = yield _fetchData("".concat(baseUrl, "/csrf"));
    return data && data.csrfToken ? data.csrfToken : null;
  });

  return function getCsrfToken() {
    return _ref3.apply(this, arguments);
  };
}();

var SessionContext = (0, _react.createContext)();

var useSession = session => {
  var value = (0, _react.useContext)(SessionContext);

  if (value === undefined) {
    return useSessionData(session);
  }

  return value;
};

var useSessionData = session => {
  var clientMaxAge = __NEXTAUTH.clientMaxAge * 1000;
  var [data, setData] = (0, _react.useState)(session);
  var [loading, setLoading] = (0, _react.useState)(true);

  var _getSession = function () {
    var _ref4 = _asyncToGenerator(function* () {
      var sendEvent = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

      try {
        setData(yield getSession());
        setLoading(false);

        if (sendEvent) {
          _sendMessage({
            event: 'session',
            data: {
              trigger: 'useSessionData'
            }
          });
        }

        if (typeof window !== 'undefined' && __NEXTAUTH_EVENT_LISTENER_ADDED === false) {
          __NEXTAUTH_EVENT_LISTENER_ADDED = true;
          window.addEventListener('storage', function () {
            var _ref5 = _asyncToGenerator(function* (event) {
              if (event.key === 'nextauth.message') {
                var message = JSON.parse(event.newValue);

                if (message.event && message.event === 'session' && message.data) {
                  yield _getSession(false);
                }
              }
            });

            return function (_x) {
              return _ref5.apply(this, arguments);
            };
          }());
        }

        if (clientMaxAge > 0) {
          setTimeout(function () {
            var _ref6 = _asyncToGenerator(function* (session) {
              yield _getSession();
            });

            return function (_x2) {
              return _ref6.apply(this, arguments);
            };
          }(), clientMaxAge);
        }
      } catch (error) {
        _logger.default.error('CLIENT_USE_SESSION_ERROR', error);
      }
    });

    return function _getSession() {
      return _ref4.apply(this, arguments);
    };
  }();

  (0, _react.useEffect)(() => {
    _getSession();
  }, []);
  return [data, loading];
};

var signin = function () {
  var _ref7 = _asyncToGenerator(function* (provider, args) {
    var callbackUrl = args && args.callbackUrl ? args.callbackUrl : window.location;

    if (!provider) {
      var baseUrl = _baseUrl();

      window.location = "".concat(baseUrl, "/signin?callbackUrl=").concat(encodeURIComponent(callbackUrl));
      return;
    }

    var providers = yield getProviders();

    if (!providers[provider]) {
      var _baseUrl2 = _baseUrl();

      window.location = "".concat(_baseUrl2, "/signin?callbackUrl=").concat(encodeURIComponent(callbackUrl));
    } else if (providers[provider].type === 'oauth') {
      window.location = "".concat(providers[provider].signinUrl, "?callbackUrl=").concat(encodeURIComponent(callbackUrl));
    } else {
      var options = {
        method: 'post',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: _encodedForm(_objectSpread({
          csrfToken: yield getCsrfToken(),
          callbackUrl: callbackUrl
        }, args))
      };
      var res = yield fetch(providers[provider].signinUrl, options);
      window.location = res.url ? res.url : callbackUrl;
    }
  });

  return function signin(_x3, _x4) {
    return _ref7.apply(this, arguments);
  };
}();

var signout = function () {
  var _ref8 = _asyncToGenerator(function* (args) {
    var callbackUrl = args && args.callbackUrl ? args.callbackUrl : window.location;

    var baseUrl = _baseUrl();

    var options = {
      method: 'post',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: _encodedForm({
        csrfToken: yield getCsrfToken(),
        callbackUrl: callbackUrl
      })
    };
    var res = yield fetch("".concat(baseUrl, "/signout"), options);

    _sendMessage({
      event: 'session',
      data: {
        trigger: 'signout'
      }
    });

    window.location = res.url ? res.url : callbackUrl;
  });

  return function signout(_x5) {
    return _ref8.apply(this, arguments);
  };
}();

var Provider = (_ref9) => {
  var {
    children,
    session,
    options
  } = _ref9;
  setOptions(options);
  return (0, _react.createElement)(SessionContext.Provider, {
    value: useSession(session)
  }, children);
};

var _fetchData = function () {
  var _ref10 = _asyncToGenerator(function* (url) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    try {
      var res = yield fetch(url, options);
      var data = yield res.json();
      return Promise.resolve(Object.keys(data).length > 0 ? data : null);
    } catch (error) {
      _logger.default.error('CLIENT_FETCH_ERROR', url, error);

      return Promise.resolve(null);
    }
  });

  return function _fetchData(_x6) {
    return _ref10.apply(this, arguments);
  };
}();

var _baseUrl = () => "".concat(__NEXTAUTH.site).concat(__NEXTAUTH.basePath);

var _encodedForm = formData => {
  return Object.keys(formData).map(key => {
    return encodeURIComponent(key) + '=' + encodeURIComponent(formData[key]);
  }).join('&');
};

var _sendMessage = message => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('nextauth.message', JSON.stringify(message));
  }
};

var _default = {
  options: setOptions,
  setOptions,
  session: getSession,
  providers: getProviders,
  csrfToken: getCsrfToken,
  getSession,
  getProviders,
  getCsrfToken,
  useSession,
  Provider,
  signin,
  signout
};
exports.default = _default;