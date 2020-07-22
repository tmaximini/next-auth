"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _auth = _interopRequireDefault(require("./auth0"));

var _apple = _interopRequireDefault(require("./apple"));

var _box = _interopRequireDefault(require("./box"));

var _credentials = _interopRequireDefault(require("./credentials"));

var _battlenet = _interopRequireDefault(require("./battlenet"));

var _cognito = _interopRequireDefault(require("./cognito"));

var _discord = _interopRequireDefault(require("./discord"));

var _email = _interopRequireDefault(require("./email"));

var _facebook = _interopRequireDefault(require("./facebook"));

var _github = _interopRequireDefault(require("./github"));

var _gitlab = _interopRequireDefault(require("./gitlab"));

var _google = _interopRequireDefault(require("./google"));

var _identityServer = _interopRequireDefault(require("./identity-server4"));

var _mixer = _interopRequireDefault(require("./mixer"));

var _okta = _interopRequireDefault(require("./okta"));

var _slack = _interopRequireDefault(require("./slack"));

var _spotify = _interopRequireDefault(require("./spotify"));

var _twitch = _interopRequireDefault(require("./twitch"));

var _twitter = _interopRequireDefault(require("./twitter"));

var _yandex = _interopRequireDefault(require("./yandex"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = {
  Auth0: _auth.default,
  Apple: _apple.default,
  Box: _box.default,
  Credentials: _credentials.default,
  BattleNet: _battlenet.default,
  Cognito: _cognito.default,
  Discord: _discord.default,
  Email: _email.default,
  Facebook: _facebook.default,
  GitHub: _github.default,
  GitLab: _gitlab.default,
  Google: _google.default,
  IdentityServer4: _identityServer.default,
  Mixer: _mixer.default,
  Okta: _okta.default,
  Slack: _slack.default,
  Spotify: _spotify.default,
  Twitter: _twitter.default,
  Twitch: _twitch.default,
  Yandex: _yandex.default
};
exports.default = _default;