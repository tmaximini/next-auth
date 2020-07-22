"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _typeorm = require("typeorm");

var _crypto = require("crypto");

var _errors = require("../../lib/errors");

var _config = _interopRequireDefault(require("./lib/config"));

var _transform = _interopRequireDefault(require("./lib/transform"));

var _models = _interopRequireDefault(require("./models"));

var _logger = _interopRequireDefault(require("../../lib/logger"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Adapter = function Adapter(typeOrmConfig) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var typeOrmConfigObject = typeof typeOrmConfig === 'string' ? _config.default.parseConnectionString(typeOrmConfig) : typeOrmConfig;
  var {
    models: customModels = {}
  } = options;
  var models = {
    User: customModels.User ? customModels.User : _models.default.User,
    Account: customModels.Account ? customModels.Account : _models.default.Account,
    Session: customModels.Session ? customModels.Session : _models.default.Session,
    VerificationRequest: customModels.VerificationRequest ? customModels.VerificationRequest : _models.default.VerificationRequest
  };
  (0, _transform.default)(typeOrmConfigObject, models, options);

  var config = _config.default.loadConfig(typeOrmConfigObject, _objectSpread(_objectSpread({}, options), {}, {
    models
  }));

  var User = models.User.model;
  var Account = models.Account.model;
  var Session = models.Session.model;
  var VerificationRequest = models.VerificationRequest.model;
  var connection = null;

  function getAdapter(_x) {
    return _getAdapter.apply(this, arguments);
  }

  function _getAdapter() {
    _getAdapter = _asyncToGenerator(function* (appOptions) {
      function _connect() {
        return _connect2.apply(this, arguments);
      }

      function _connect2() {
        _connect2 = _asyncToGenerator(function* () {
          connection = (0, _typeorm.getConnection)(config.name);

          if (!connection.isConnected) {
            connection = yield connection.connect();
          }
        });
        return _connect2.apply(this, arguments);
      }

      if (!connection) {
        try {
          connection = yield (0, _typeorm.createConnection)(config);
        } catch (error) {
          if (error.name === 'AlreadyHasActiveConnectionError') {
            yield _connect();
          } else {
            _logger.default.error('ADAPTER_CONNECTION_ERROR', error);
          }
        }
      } else {
        yield _connect();
      }

      function debugMessage(debugCode) {
        if (appOptions && appOptions.debug) {
          for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            args[_key - 1] = arguments[_key];
          }

          _logger.default.debug("TYPEORM_".concat(debugCode), ...args);
        }
      }

      var idKey = 'id';
      var ObjectId;

      if (config.type === 'mongodb') {
        idKey = '_id';
        var mongodb = yield Promise.resolve().then(() => _interopRequireWildcard(require('mongodb')));
        ObjectId = mongodb.ObjectId;
      }

      if (appOptions && (!appOptions.session || !appOptions.session.maxAge)) {
        debugMessage('GET_ADAPTER', 'Session expiry not configured (defaulting to 30 days');
      }

      var defaultSessionMaxAge = 30 * 24 * 60 * 60 * 1000;
      var sessionMaxAge = appOptions && appOptions.session && appOptions.session.maxAge ? appOptions.session.maxAge * 1000 : defaultSessionMaxAge;
      var sessionUpdateAge = appOptions && appOptions.session && appOptions.session.updateAge ? appOptions.session.updateAge * 1000 : 0;

      function createUser(_x2) {
        return _createUser.apply(this, arguments);
      }

      function _createUser() {
        _createUser = _asyncToGenerator(function* (profile) {
          debugMessage('CREATE_USER', profile);

          try {
            var user = new User(profile.name, profile.email, profile.image, profile.emailVerified);
            return yield (0, _typeorm.getManager)().save(user);
          } catch (error) {
            _logger.default.error('CREATE_USER_ERROR', error);

            return Promise.reject(new _errors.CreateUserError(error));
          }
        });
        return _createUser.apply(this, arguments);
      }

      function getUser(_x3) {
        return _getUser.apply(this, arguments);
      }

      function _getUser() {
        _getUser = _asyncToGenerator(function* (id) {
          debugMessage('GET_USER', id);

          if (ObjectId && !(id instanceof ObjectId)) {
            id = ObjectId(id);
          }

          try {
            return connection.getRepository(User).findOne({
              [idKey]: id
            });
          } catch (error) {
            _logger.default.error('GET_USER_BY_ID_ERROR', error);

            return Promise.reject(new Error('GET_USER_BY_ID_ERROR', error));
          }
        });
        return _getUser.apply(this, arguments);
      }

      function getUserByEmail(_x4) {
        return _getUserByEmail.apply(this, arguments);
      }

      function _getUserByEmail() {
        _getUserByEmail = _asyncToGenerator(function* (email) {
          debugMessage('GET_USER_BY_EMAIL', email);

          try {
            if (!email) {
              return Promise.resolve(null);
            }

            return connection.getRepository(User).findOne({
              email
            });
          } catch (error) {
            _logger.default.error('GET_USER_BY_EMAIL_ERROR', error);

            return Promise.reject(new Error('GET_USER_BY_EMAIL_ERROR', error));
          }
        });
        return _getUserByEmail.apply(this, arguments);
      }

      function getUserByProviderAccountId(_x5, _x6) {
        return _getUserByProviderAccountId.apply(this, arguments);
      }

      function _getUserByProviderAccountId() {
        _getUserByProviderAccountId = _asyncToGenerator(function* (providerId, providerAccountId) {
          debugMessage('GET_USER_BY_PROVIDER_ACCOUNT_ID', providerId, providerAccountId);

          try {
            var account = yield connection.getRepository(Account).findOne({
              providerId,
              providerAccountId
            });

            if (!account) {
              return null;
            }

            return connection.getRepository(User).findOne({
              [idKey]: account.userId
            });
          } catch (error) {
            _logger.default.error('GET_USER_BY_PROVIDER_ACCOUNT_ID_ERROR', error);

            return Promise.reject(new Error('GET_USER_BY_PROVIDER_ACCOUNT_ID_ERROR', error));
          }
        });
        return _getUserByProviderAccountId.apply(this, arguments);
      }

      function updateUser(_x7) {
        return _updateUser.apply(this, arguments);
      }

      function _updateUser() {
        _updateUser = _asyncToGenerator(function* (user) {
          debugMessage('UPDATE_USER', user);
          return (0, _typeorm.getManager)().save(user);
        });
        return _updateUser.apply(this, arguments);
      }

      function deleteUser(_x8) {
        return _deleteUser.apply(this, arguments);
      }

      function _deleteUser() {
        _deleteUser = _asyncToGenerator(function* (userId) {
          debugMessage('DELETE_USER', userId);
          return false;
        });
        return _deleteUser.apply(this, arguments);
      }

      function linkAccount(_x9, _x10, _x11, _x12, _x13, _x14, _x15) {
        return _linkAccount.apply(this, arguments);
      }

      function _linkAccount() {
        _linkAccount = _asyncToGenerator(function* (userId, providerId, providerType, providerAccountId, refreshToken, accessToken, accessTokenExpires) {
          debugMessage('LINK_ACCOUNT', userId, providerId, providerType, providerAccountId, refreshToken, accessToken, accessTokenExpires);

          try {
            var account = new Account(userId, providerId, providerType, providerAccountId, refreshToken, accessToken, accessTokenExpires);
            return (0, _typeorm.getManager)().save(account);
          } catch (error) {
            _logger.default.error('LINK_ACCOUNT_ERROR', error);

            return Promise.reject(new Error('LINK_ACCOUNT_ERROR', error));
          }
        });
        return _linkAccount.apply(this, arguments);
      }

      function unlinkAccount(_x16, _x17, _x18) {
        return _unlinkAccount.apply(this, arguments);
      }

      function _unlinkAccount() {
        _unlinkAccount = _asyncToGenerator(function* (userId, providerId, providerAccountId) {
          debugMessage('UNLINK_ACCOUNT', userId, providerId, providerAccountId);
          return false;
        });
        return _unlinkAccount.apply(this, arguments);
      }

      function createSession(_x19) {
        return _createSession.apply(this, arguments);
      }

      function _createSession() {
        _createSession = _asyncToGenerator(function* (user) {
          debugMessage('CREATE_SESSION', user);

          try {
            var expires = null;

            if (sessionMaxAge) {
              var dateExpires = new Date();
              dateExpires.setTime(dateExpires.getTime() + sessionMaxAge);
              expires = dateExpires;
            }

            var session = new Session(user.id, expires);
            return (0, _typeorm.getManager)().save(session);
          } catch (error) {
            _logger.default.error('CREATE_SESSION_ERROR', error);

            return Promise.reject(new Error('CREATE_SESSION_ERROR', error));
          }
        });
        return _createSession.apply(this, arguments);
      }

      function getSession(_x20) {
        return _getSession.apply(this, arguments);
      }

      function _getSession() {
        _getSession = _asyncToGenerator(function* (sessionToken) {
          debugMessage('GET_SESSION', sessionToken);

          try {
            var session = yield connection.getRepository(Session).findOne({
              sessionToken
            });

            if (session && session.expires && new Date() > new Date(session.expires)) {
              return null;
            }

            return session;
          } catch (error) {
            _logger.default.error('GET_SESSION_ERROR', error);

            return Promise.reject(new Error('GET_SESSION_ERROR', error));
          }
        });
        return _getSession.apply(this, arguments);
      }

      function updateSession(_x21, _x22) {
        return _updateSession.apply(this, arguments);
      }

      function _updateSession() {
        _updateSession = _asyncToGenerator(function* (session, force) {
          debugMessage('UPDATE_SESSION', session);

          try {
            if (sessionMaxAge && (sessionUpdateAge || sessionUpdateAge === 0) && session.expires) {
              var dateSessionIsDueToBeUpdated = new Date(session.expires);
              dateSessionIsDueToBeUpdated.setTime(dateSessionIsDueToBeUpdated.getTime() - sessionMaxAge);
              dateSessionIsDueToBeUpdated.setTime(dateSessionIsDueToBeUpdated.getTime() + sessionUpdateAge);

              if (new Date() > dateSessionIsDueToBeUpdated) {
                var newExpiryDate = new Date();
                newExpiryDate.setTime(newExpiryDate.getTime() + sessionMaxAge);
                session.expires = newExpiryDate;
              } else if (!force) {
                return null;
              }
            } else {
              if (!force) {
                return null;
              }
            }

            return (0, _typeorm.getManager)().save(session);
          } catch (error) {
            _logger.default.error('UPDATE_SESSION_ERROR', error);

            return Promise.reject(new Error('UPDATE_SESSION_ERROR', error));
          }
        });
        return _updateSession.apply(this, arguments);
      }

      function deleteSession(_x23) {
        return _deleteSession.apply(this, arguments);
      }

      function _deleteSession() {
        _deleteSession = _asyncToGenerator(function* (sessionToken) {
          debugMessage('DELETE_SESSION', sessionToken);

          try {
            return yield connection.getRepository(Session).delete({
              sessionToken
            });
          } catch (error) {
            _logger.default.error('DELETE_SESSION_ERROR', error);

            return Promise.reject(new Error('DELETE_SESSION_ERROR', error));
          }
        });
        return _deleteSession.apply(this, arguments);
      }

      function createVerificationRequest(_x24, _x25, _x26, _x27, _x28) {
        return _createVerificationRequest.apply(this, arguments);
      }

      function _createVerificationRequest() {
        _createVerificationRequest = _asyncToGenerator(function* (identifier, url, token, secret, provider) {
          debugMessage('CREATE_VERIFICATION_REQUEST', identifier);

          try {
            var {
              site
            } = appOptions;
            var {
              sendVerificationRequest,
              maxAge
            } = provider;
            var hashedToken = (0, _crypto.createHash)('sha256').update("".concat(token).concat(secret)).digest('hex');
            var expires = null;

            if (maxAge) {
              var dateExpires = new Date();
              dateExpires.setTime(dateExpires.getTime() + maxAge * 1000);
              expires = dateExpires;
            }

            var newVerificationRequest = new VerificationRequest(identifier, hashedToken, expires);
            var verificationRequest = yield (0, _typeorm.getManager)().save(newVerificationRequest);
            yield sendVerificationRequest({
              identifier,
              url,
              token,
              site,
              provider
            });
            return verificationRequest;
          } catch (error) {
            _logger.default.error('CREATE_VERIFICATION_REQUEST_ERROR', error);

            return Promise.reject(new Error('CREATE_VERIFICATION_REQUEST_ERROR', error));
          }
        });
        return _createVerificationRequest.apply(this, arguments);
      }

      function getVerificationRequest(_x29, _x30, _x31, _x32) {
        return _getVerificationRequest.apply(this, arguments);
      }

      function _getVerificationRequest() {
        _getVerificationRequest = _asyncToGenerator(function* (identifier, token, secret, provider) {
          debugMessage('GET_VERIFICATION_REQUEST', identifier, token);

          try {
            var hashedToken = (0, _crypto.createHash)('sha256').update("".concat(token).concat(secret)).digest('hex');
            var verificationRequest = yield connection.getRepository(VerificationRequest).findOne({
              identifier,
              token: hashedToken
            });

            if (verificationRequest && verificationRequest.expires && new Date() > new Date(verificationRequest.expires)) {
              yield connection.getRepository(VerificationRequest).delete({
                token: hashedToken
              });
              return null;
            }

            return verificationRequest;
          } catch (error) {
            _logger.default.error('GET_VERIFICATION_REQUEST_ERROR', error);

            return Promise.reject(new Error('GET_VERIFICATION_REQUEST_ERROR', error));
          }
        });
        return _getVerificationRequest.apply(this, arguments);
      }

      function deleteVerificationRequest(_x33, _x34, _x35, _x36) {
        return _deleteVerificationRequest.apply(this, arguments);
      }

      function _deleteVerificationRequest() {
        _deleteVerificationRequest = _asyncToGenerator(function* (identifier, token, secret, provider) {
          debugMessage('DELETE_VERIFICATION', identifier, token);

          try {
            var hashedToken = (0, _crypto.createHash)('sha256').update("".concat(token).concat(secret)).digest('hex');
            yield connection.getRepository(VerificationRequest).delete({
              token: hashedToken
            });
          } catch (error) {
            _logger.default.error('DELETE_VERIFICATION_REQUEST_ERROR', error);

            return Promise.reject(new Error('DELETE_VERIFICATION_REQUEST_ERROR', error));
          }
        });
        return _deleteVerificationRequest.apply(this, arguments);
      }

      return Promise.resolve({
        createUser,
        getUser,
        getUserByEmail,
        getUserByProviderAccountId,
        updateUser,
        deleteUser,
        linkAccount,
        unlinkAccount,
        createSession,
        getSession,
        updateSession,
        deleteSession,
        createVerificationRequest,
        getVerificationRequest,
        deleteVerificationRequest
      });
    });
    return _getAdapter.apply(this, arguments);
  }

  return {
    getAdapter
  };
};

var _default = {
  Adapter,
  Models: _models.default
};
exports.default = _default;