import { prisma } from '../config/prisma.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';
import { AppError } from '../utils/appError.js';

export const signup = async ({ name, email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    throw new AppError('An account with this email address already exists.', 409, 'DUPLICATE_EMAIL');
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      name,
      email: normalizedEmail,
      passwordHash,
    },
    select: {
      id: true,
      name: true,
      email: true,
      profilePhotoUrl: true,
      languagePreference: true,
      role: true,
      createdAt: true,
    },
  });

  const token = generateToken(user.id);
  return { user, token };
};

export const login = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    throw new AppError('Invalid email or password credentials.', 401, 'INVALID_CREDENTIALS');
  }

  const isPasswordValid = await comparePassword(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password credentials.', 401, 'INVALID_CREDENTIALS');
  }

  const token = generateToken(user.id);

  const userProfile = {
    id: user.id,
    name: user.name,
    email: user.email,
    profilePhotoUrl: user.profilePhotoUrl,
    languagePreference: user.languagePreference,
    role: user.role,
    createdAt: user.createdAt,
  };

  return { user: userProfile, token };
};

export const resetPassword = async ({ email, newPassword }) => {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    throw new AppError('No account found with this email address.', 404, 'USER_NOT_FOUND');
  }

  const passwordHash = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  return { message: 'Password reset successfully. You can now log in.' };
};
