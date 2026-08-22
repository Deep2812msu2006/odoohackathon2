import * as userService from '../services/user.service.js';
import { sendSuccess } from '../utils/responseFormatter.js';

export const updateProfile = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.profilePhotoUrl = `/uploads/${req.file.filename}`;
    }
    const updatedUser = await userService.updateProfile(req.user.id, data);
    return sendSuccess(res, { user: updatedUser }, 200, 'Profile updated successfully.');
  } catch (err) {
    next(err);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const result = await userService.changePassword(req.user.id, req.body);
    return sendSuccess(res, result, 200, 'Password updated successfully in database.');
  } catch (err) {
    next(err);
  }
};

export const deleteAccount = async (req, res, next) => {
  try {
    const result = await userService.deleteAccount(req.user.id);
    res.clearCookie('token');
    return sendSuccess(res, result, 200);
  } catch (err) {
    next(err);
  }
};
