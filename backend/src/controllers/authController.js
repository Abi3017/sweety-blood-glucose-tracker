const jwt = require('jsonwebtoken');
const env = require('../config/env');
const authService = require('../services/authService');
const { sendSuccess } = require('../utils/apiResponse');

function baseCookieOptions() {
  return {
    httpOnly: true, // not readable from JavaScript, so XSS cannot steal the token
    secure: env.cookieSecure, // HTTPS only (on by default in production)
    sameSite: 'strict', // never sent on cross-site requests
    path: '/',
  };
}

/**
 * Sets the auth cookie. With "remember me" it persists until the JWT expires;
 * otherwise it is a session cookie cleared when the browser closes.
 */
function setAuthCookie(res, token, rememberMe) {
  const options = baseCookieOptions();
  if (rememberMe) {
    const { exp } = jwt.decode(token);
    options.expires = new Date(exp * 1000);
  }
  res.cookie(env.authCookieName, token, options);
}

async function register(req, res) {
  const { user, token } = await authService.register(req.validated.body);
  setAuthCookie(res, token, false);
  return sendSuccess(res, { statusCode: 201, message: 'Account created successfully.', data: { user } });
}

async function login(req, res) {
  const { rememberMe, ...credentials } = req.validated.body;
  const { user, token } = await authService.login(credentials);
  setAuthCookie(res, token, rememberMe);
  return sendSuccess(res, { message: 'Logged in successfully.', data: { user } });
}

async function logout(req, res) {
  res.clearCookie(env.authCookieName, baseCookieOptions());
  return sendSuccess(res, { message: 'Logged out successfully.' });
}

async function me(req, res) {
  const user = await authService.getProfile(req.user.id);
  return sendSuccess(res, { data: { user } });
}

module.exports = { register, login, logout, me };
