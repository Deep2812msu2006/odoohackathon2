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

export const getPublicTripBySlug = async (publicSlug) => {
  const trip = await prisma.trip.findUnique({
    where: { publicSlug },
    include: {
      user: {
        select: { id: true, name: true, profilePhotoUrl: true },
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
      _count: {
        select: { originalShares: true },
      },
    },
  });

  if (!trip || !trip.isPublic) {
    throw new AppError('Public trip not found or link has expired.', 404, 'NOT_FOUND');
  }

  return trip;
};

export const copyTrip = async (publicSlug, requestingUserId) => {
  const originalTrip = await prisma.trip.findUnique({
    where: { publicSlug },
    include: {
      stops: {
        orderBy: { orderIndex: 'asc' },
        include: {
          stopActivities: true,
        },
      },
    },
  });

  if (!originalTrip || !originalTrip.isPublic) {
    throw new AppError('Trip not found or is private.', 404, 'NOT_FOUND');
  }

  const newSlug = createSlug(`Copy of ${originalTrip.name}`);

  // Transactional Copying of complete trip structure
  const copiedTrip = await prisma.$transaction(async (tx) => {
    // 1. Create new Trip
    const newTrip = await tx.trip.create({
      data: {
        userId: requestingUserId,
        name: `Copy of ${originalTrip.name}`,
        description: originalTrip.description,
        startDate: originalTrip.startDate,
        endDate: originalTrip.endDate,
        coverPhotoUrl: originalTrip.coverPhotoUrl,
        isPublic: false,
        publicSlug: newSlug,
      },
    });

    // 2. Copy all stops and linked activities
    for (const stop of originalTrip.stops) {
      const newStop = await tx.tripStop.create({
        data: {
          tripId: newTrip.id,
          cityId: stop.cityId,
          orderIndex: stop.orderIndex,
          arrivalDate: stop.arrivalDate,
          departureDate: stop.departureDate,
          notes: stop.notes,
        },
      });

      for (const actLink of stop.stopActivities) {
        await tx.tripStopActivity.create({
          data: {
            tripStopId: newStop.id,
            activityId: actLink.activityId,
            scheduledDate: actLink.scheduledDate,
            scheduledTime: actLink.scheduledTime,
            customCost: actLink.customCost,
            orderIndex: actLink.orderIndex,
          },
        });
      }
    }

    // 3. Create TripShare tracking record
    await tx.tripShare.create({
      data: {
        originalTripId: originalTrip.id,
        copiedTripId: newTrip.id,
        copiedByUserId: requestingUserId,
      },
    });

    return newTrip;
  });

  // Return complete copied trip structure
  const result = await prisma.trip.findUnique({
    where: { id: copiedTrip.id },
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

  return result;
};
