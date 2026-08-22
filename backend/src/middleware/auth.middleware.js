import { verifyToken } from '../utils/jwt.js';
import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/appError.js';

export const protect = async (req, res, next) => {
  try {
    let token = null;

    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('You are not logged in. Please log in to get access.', 401, 'UNAUTHORIZED'));
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return next(new AppError('Invalid or expired authentication token.', 401, 'INVALID_TOKEN'));
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.id },
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

    if (!currentUser) {
      return next(new AppError('The user belonging to this token no longer exists.', 401, 'USER_NOT_FOUND'));
    }

    req.user = currentUser;
    next();
  } catch (err) {
    next(err);
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return next(new AppError('Forbidden: Only Platform Admins can access this admin panel.', 403, 'FORBIDDEN_ADMIN_ONLY'));
  }
  next();
};
