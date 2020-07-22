"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _preact = require("preact");

var _preactRenderToString = _interopRequireDefault(require("preact-render-to-string"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = (_ref) => {
  var {
    baseUrl,
    basePath,
    error,
    res
  } = _ref;
  var signinPageUrl = "".concat(baseUrl).concat(basePath, "/signin");
  var statusCode = 200;
  var heading = (0, _preact.h)("h1", null, "Error");
  var message = (0, _preact.h)("p", null, (0, _preact.h)("a", {
    className: "site",
    href: baseUrl
  }, baseUrl.replace(/^https?:\/\//, '')));

  switch (error) {
    case 'Signin':
    case 'OAuthSignin':
    case 'OAuthCallback':
    case 'OAuthCreateAccount':
    case 'EmailCreateAccount':
    case 'Callback':
      heading = (0, _preact.h)("h1", null, "Sign in failed");
      message = (0, _preact.h)("div", null, (0, _preact.h)("div", {
        className: "message"
      }, (0, _preact.h)("p", null, "Try signing with a different account.")), (0, _preact.h)("p", null, (0, _preact.h)("a", {
        className: "button",
        href: signinPageUrl
      }, "Sign in")));
      break;

    case 'OAuthAccountNotLinked':
      statusCode = 403;
      heading = (0, _preact.h)("h1", null, "Sign in failed");
      message = (0, _preact.h)("div", null, (0, _preact.h)("div", {
        className: "message"
      }, (0, _preact.h)("p", null, "An account associated with your email address already exists."), (0, _preact.h)("p", null, "Sign in with the same account you used originally to confirm your identity.")), (0, _preact.h)("p", null, (0, _preact.h)("a", {
        className: "button",
        href: signinPageUrl
      }, "Sign in")));
      break;

    case 'EmailSignin':
      heading = (0, _preact.h)("h1", null, "Sign in failed");
      message = (0, _preact.h)("div", null, (0, _preact.h)("div", {
        className: "message"
      }, (0, _preact.h)("p", null, "Unable to send email.")), (0, _preact.h)("p", null, (0, _preact.h)("a", {
        className: "button",
        href: signinPageUrl
      }, "Sign in")));
      break;

    case 'CredentialsSignin':
      statusCode = 403;
      heading = (0, _preact.h)("h1", null, "Sign in failed");
      message = (0, _preact.h)("div", null, (0, _preact.h)("div", {
        className: "message"
      }, (0, _preact.h)("p", null, "Check the details you provided are correct.")), (0, _preact.h)("p", null, (0, _preact.h)("a", {
        className: "button",
        href: signinPageUrl
      }, "Sign in")));
      break;

    case 'Configuration':
      statusCode = 500;
      heading = (0, _preact.h)("h1", null, "Server error");
      message = (0, _preact.h)("div", null, (0, _preact.h)("div", {
        className: "message"
      }, (0, _preact.h)("p", null, "There is a problem with the server configuration."), (0, _preact.h)("p", null, "Check the server logs for more information.")));
      break;

    case 'AccessDenied':
      statusCode = 403;
      heading = (0, _preact.h)("h1", null, "Access Denied");
      message = (0, _preact.h)("div", null, (0, _preact.h)("div", {
        className: "message"
      }, (0, _preact.h)("p", null, "You do not have permission to sign in."), (0, _preact.h)("p", null, (0, _preact.h)("a", {
        className: "button",
        href: signinPageUrl
      }, "Sign in"))));
      break;

    case 'Verification':
      statusCode = 403;
      heading = (0, _preact.h)("h1", null, "Unable to sign in");
      message = (0, _preact.h)("div", null, (0, _preact.h)("div", {
        className: "message"
      }, (0, _preact.h)("p", null, "The sign in link is no longer valid."), (0, _preact.h)("p", null, "It may have be used already or it may have expired.")), (0, _preact.h)("p", null, (0, _preact.h)("a", {
        className: "button",
        href: signinPageUrl
      }, "Sign in")));
      break;

    default:
  }

  res.status(statusCode);
  return (0, _preactRenderToString.default)((0, _preact.h)("div", {
    className: "error"
  }, heading, message));
};

exports.default = _default;