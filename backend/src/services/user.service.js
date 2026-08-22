import { prisma } from '../config/prisma.js';

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
      updatedAt: true,
    },
  });
  return updatedUser;
};

export const deleteAccount = async (userId) => {
  await prisma.user.delete({
    where: { id: userId },
  });
  return { message: 'Account and associated data deleted successfully.' };
};
