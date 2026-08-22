import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/appError.js';

export const updateProfile = async (userId, data) => {
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      profilePhotoUrl: true,
      languagePreference: true,
      role: true,
      updatedAt: true,
    },
  });
  return updatedUser;
};

export const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError('User account not found.', 404, 'NOT_FOUND');
  }

  // 1. Verify current password matches existing hash in PostgreSQL
  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isMatch) {
    throw new AppError('Current password is incorrect.', 400, 'INVALID_CURRENT_PASSWORD');
  }

  // 2. Hash new password
  const newPasswordHash = await bcrypt.hash(newPassword, 10);

  // 3. Update passwordHash in PostgreSQL database
  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash: newPasswordHash,
    },
  });

  return { message: 'Password updated successfully in database!' };
};

export const deleteAccount = async (userId) => {
  await prisma.user.delete({
    where: { id: userId },
  });
  return { message: 'Account and associated data deleted successfully.' };
};
