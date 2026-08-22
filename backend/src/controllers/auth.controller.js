import * as authService from '../services/auth.service.js';
import { sendSuccess } from '../utils/responseFormatter.js';

export const signup = async (req, res, next) => {
  try {
    const { user, token } = await authService.signup(req.body);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return sendSuccess(res, { user, token }, 201, 'User registered successfully.');
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { user, token } = await authService.login(req.body);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return sendSuccess(res, { user, token }, 200, 'Login successful.');
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    res.clearCookie('token');
    return sendSuccess(res, null, 200, 'Logged out successfully.');
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    return sendSuccess(res, { user: req.user }, 200);
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const result = await authService.resetPassword(req.body);
    return sendSuccess(res, result, 200);
  } catch (err) {
    next(err);
  }
};
