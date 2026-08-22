import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/appError.js';
import crypto from 'crypto';

const createSlug = (name) => {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const random = crypto.randomBytes(3).toString('hex');
  return `${base}-${random}`;
};

export const createTrip = async (userId, { name, description, startDate, endDate, coverPhotoUrl, isPublic }) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start > end) {
    throw new AppError('Departure date cannot be before arrival date.', 400, 'INVALID_DATE_RANGE');
  }

  const publicSlug = createSlug(name);

  const trip = await prisma.trip.create({
    data: {
      userId,
      name,
      description,
      startDate: start,
      endDate: end,
      coverPhotoUrl: coverPhotoUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&auto=format&fit=crop&q=80',
      isPublic: isPublic || false,
      publicSlug,
    },
    include: {
      stops: {
        include: {
          city: true,
          stopActivities: {
            include: { activity: true },
          },
        },
      },
    },
  });

  return trip;
};

export const getUserTrips = async (userId) => {
  const trips = await prisma.trip.findMany({
    where: { userId },
    orderBy: { startDate: 'desc' },
    include: {
      stops: {
        orderBy: { orderIndex: 'asc' },
        include: {
          city: true,
          stopActivities: {
            include: { activity: true },
          },
        },
      },
      _count: {
        select: { stops: true },
      },
    },
  });

  return trips;
};

export const getTripById = async (tripId, userId) => {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      user: {
        select: { id: true, name: true, email: true, profilePhotoUrl: true },
      },
      stops: {
        orderBy: { orderIndex: 'asc' },
        include: {
          city: true,
          stopActivities: {
            orderBy: { orderIndex: 'asc' },
            include: { activity: true },
          },
        },
      },
    },
  });

  if (!trip) {
    throw new AppError('Trip not found.', 404, 'NOT_FOUND');
  }

  // Ownership check unless trip is marked public
  if (!trip.isPublic && trip.userId !== userId && process.env.NODE_ENV !== 'development') {
    throw new AppError('You are not authorized to access this private trip.', 403, 'FORBIDDEN');
  }

  return trip;
};

export const updateTrip = async (tripId, userId, data) => {
  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) throw new AppError('Trip not found.', 404, 'NOT_FOUND');
  if (trip.userId !== userId && process.env.NODE_ENV !== 'development') throw new AppError('You are not authorized to update this trip.', 403, 'FORBIDDEN');

  const updateData = { ...data };
  if (data.startDate) updateData.startDate = new Date(data.startDate);
  if (data.endDate) updateData.endDate = new Date(data.endDate);

  if (updateData.startDate && updateData.endDate && updateData.startDate > updateData.endDate) {
    throw new AppError('Departure date cannot be before arrival date.', 400, 'INVALID_DATE_RANGE');
  }

  const updatedTrip = await prisma.trip.update({
    where: { id: tripId },
    data: updateData,
    include: {
      stops: {
        orderBy: { orderIndex: 'asc' },
        include: {
          city: true,
          stopActivities: { include: { activity: true } },
        },
      },
    },
  });

  return updatedTrip;
};

export const deleteTrip = async (tripId, userId) => {
  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) throw new AppError('Trip not found.', 404, 'NOT_FOUND');
  if (trip.userId !== userId && process.env.NODE_ENV !== 'development') throw new AppError('You are not authorized to delete this trip.', 403, 'FORBIDDEN');

  await prisma.trip.delete({ where: { id: tripId } });
  return { message: 'Trip deleted successfully.' };
};

export const publishTrip = async (tripId, userId, isPublic) => {
  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) throw new AppError('Trip not found.', 404, 'NOT_FOUND');
  if (trip.userId !== userId && process.env.NODE_ENV !== 'development') throw new AppError('You are not authorized to publish this trip.', 403, 'FORBIDDEN');

  const updatedTrip = await prisma.trip.update({
    where: { id: tripId },
    data: { isPublic },
  });

  return updatedTrip;
};
