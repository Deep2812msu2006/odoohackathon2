import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/appError.js';

export const addActivityToStop = async (tripId, stopId, userId, { activityId, scheduledDate, scheduledTime, customCost, orderIndex }) => {
  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) throw new AppError('Trip not found.', 404, 'NOT_FOUND');
  if (trip.userId !== userId) throw new AppError('You are not authorized to edit this trip.', 403, 'FORBIDDEN');

  const stop = await prisma.tripStop.findFirst({
    where: { id: stopId, tripId },
    include: { city: true, stopActivities: true },
  });
  if (!stop) throw new AppError('Stop not found in this trip.', 404, 'NOT_FOUND');

  const activity = await prisma.activity.findUnique({ where: { id: activityId } });
  if (!activity) throw new AppError('Activity not found.', 404, 'NOT_FOUND');

  // Business Logic 1: Activity must belong to the stop's city
  if (activity.cityId !== stop.cityId) {
    throw new AppError(
      `Activity "${activity.name}" belongs to a different city than this stop (${stop.city.name}).`,
      400,
      'CITY_MISMATCH'
    );
  }

  const schedDate = new Date(scheduledDate);

  // Business Logic 2: Scheduled date must fall within the stop's arrival and departure date
  const arr = new Date(stop.arrivalDate);
  const dep = new Date(stop.departureDate);

  // Normalize dates to YYYY-MM-DD for comparison
  const schedStr = schedDate.toISOString().split('T')[0];
  const arrStr = arr.toISOString().split('T')[0];
  const depStr = dep.toISOString().split('T')[0];

  if (schedStr < arrStr || schedStr > depStr) {
    throw new AppError(
      `Scheduled activity date (${schedStr}) must fall between stop dates (${arrStr} to ${depStr}).`,
      400,
      'ACTIVITY_DATE_OUT_OF_BOUNDS'
    );
  }

  const nextOrderIndex = orderIndex !== undefined ? orderIndex : stop.stopActivities.length;

  const activityLink = await prisma.tripStopActivity.create({
    data: {
      tripStopId: stopId,
      activityId,
      scheduledDate: schedDate,
      scheduledTime: scheduledTime || '10:00',
      customCost: customCost !== undefined ? customCost : activity.estimatedCost,
      orderIndex: nextOrderIndex,
    },
    include: {
      activity: true,
    },
  });

  return activityLink;
};

export const updateActivityLink = async (tripId, stopId, activityLinkId, userId, data) => {
  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) throw new AppError('Trip not found.', 404, 'NOT_FOUND');
  if (trip.userId !== userId) throw new AppError('You are not authorized to edit this trip.', 403, 'FORBIDDEN');

  const link = await prisma.tripStopActivity.findFirst({
    where: { id: activityLinkId, tripStopId: stopId },
    include: { tripStop: true },
  });

  if (!link) throw new AppError('Activity link not found in this stop.', 404, 'NOT_FOUND');

  const updateData = { ...data };
  if (data.scheduledDate) {
    const schedDate = new Date(data.scheduledDate);
    const arrStr = link.tripStop.arrivalDate.toISOString().split('T')[0];
    const depStr = link.tripStop.departureDate.toISOString().split('T')[0];
    const schedStr = schedDate.toISOString().split('T')[0];

    if (schedStr < arrStr || schedStr > depStr) {
      throw new AppError(
        `Scheduled date (${schedStr}) must fall between stop dates (${arrStr} to ${depStr}).`,
        400,
        'ACTIVITY_DATE_OUT_OF_BOUNDS'
      );
    }
    updateData.scheduledDate = schedDate;
  }

  const updatedLink = await prisma.tripStopActivity.update({
    where: { id: activityLinkId },
    data: updateData,
    include: { activity: true },
  });

  return updatedLink;
};

export const removeActivityLink = async (tripId, stopId, activityLinkId, userId) => {
  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) throw new AppError('Trip not found.', 404, 'NOT_FOUND');
  if (trip.userId !== userId) throw new AppError('You are not authorized to edit this trip.', 403, 'FORBIDDEN');

  const link = await prisma.tripStopActivity.findFirst({
    where: { id: activityLinkId, tripStopId: stopId },
  });

  if (!link) throw new AppError('Activity link not found in this stop.', 404, 'NOT_FOUND');

  await prisma.tripStopActivity.delete({ where: { id: activityLinkId } });
  return { message: 'Activity removed from stop successfully.' };
};
