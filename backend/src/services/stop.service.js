import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/appError.js';

export const addStop = async (tripId, userId, { cityId, arrivalDate, departureDate, orderIndex, notes }) => {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: { stops: true },
  });

  if (!trip) throw new AppError('Trip not found.', 404, 'NOT_FOUND');
  if (trip.userId !== userId) throw new AppError('You are not authorized to edit this trip.', 403, 'FORBIDDEN');

  const city = await prisma.city.findUnique({ where: { id: cityId } });
  if (!city) throw new AppError('City not found.', 404, 'NOT_FOUND');

  const arr = new Date(arrivalDate);
  const dep = new Date(departureDate);

  if (arr > dep) {
    throw new AppError('Departure date cannot be before arrival date.', 400, 'INVALID_DATE_RANGE');
  }

  // Validate stop dates fall inside trip dates
  if (arr < trip.startDate || dep > trip.endDate) {
    throw new AppError(
      `Stop dates (${arr.toISOString().split('T')[0]} to ${dep.toISOString().split('T')[0]}) must fall within trip dates (${trip.startDate.toISOString().split('T')[0]} to ${trip.endDate.toISOString().split('T')[0]}).`,
      400,
      'STOP_DATES_OUT_OF_BOUNDS'
    );
  }

  const nextOrderIndex = orderIndex !== undefined ? orderIndex : trip.stops.length;

  const newStop = await prisma.tripStop.create({
    data: {
      tripId,
      cityId,
      arrivalDate: arr,
      departureDate: dep,
      orderIndex: nextOrderIndex,
      notes,
    },
    include: {
      city: true,
      stopActivities: { include: { activity: true } },
    },
  });

  return newStop;
};

export const updateStop = async (tripId, stopId, userId, data) => {
  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) throw new AppError('Trip not found.', 404, 'NOT_FOUND');
  if (trip.userId !== userId) throw new AppError('You are not authorized to edit this trip.', 403, 'FORBIDDEN');

  const stop = await prisma.tripStop.findFirst({
    where: { id: stopId, tripId },
  });
  if (!stop) throw new AppError('Stop not found in this trip.', 404, 'NOT_FOUND');

  const updateData = { ...data };
  if (data.arrivalDate) updateData.arrivalDate = new Date(data.arrivalDate);
  if (data.departureDate) updateData.departureDate = new Date(data.departureDate);

  const arr = updateData.arrivalDate || stop.arrivalDate;
  const dep = updateData.departureDate || stop.departureDate;

  if (arr > dep) {
    throw new AppError('Departure date cannot be before arrival date.', 400, 'INVALID_DATE_RANGE');
  }

  if (arr < trip.startDate || dep > trip.endDate) {
    throw new AppError('Stop dates must fall within the overall trip start and end dates.', 400, 'STOP_DATES_OUT_OF_BOUNDS');
  }

  const updatedStop = await prisma.tripStop.update({
    where: { id: stopId },
    data: updateData,
    include: {
      city: true,
      stopActivities: { include: { activity: true } },
    },
  });

  return updatedStop;
};

export const deleteStop = async (tripId, stopId, userId) => {
  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) throw new AppError('Trip not found.', 404, 'NOT_FOUND');
  if (trip.userId !== userId) throw new AppError('You are not authorized to edit this trip.', 403, 'FORBIDDEN');

  const stop = await prisma.tripStop.findFirst({ where: { id: stopId, tripId } });
  if (!stop) throw new AppError('Stop not found in this trip.', 404, 'NOT_FOUND');

  await prisma.tripStop.delete({ where: { id: stopId } });
  return { message: 'Stop removed from trip successfully.' };
};

export const reorderStops = async (tripId, userId, stopsArray) => {
  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) throw new AppError('Trip not found.', 404, 'NOT_FOUND');
  if (trip.userId !== userId) throw new AppError('You are not authorized to edit this trip.', 403, 'FORBIDDEN');

  // Perform transactional atomic reordering
  await prisma.$transaction(
    stopsArray.map((item) =>
      prisma.tripStop.updateMany({
        where: { id: item.id, tripId },
        data: { orderIndex: item.orderIndex },
      })
    )
  );

  const reorderedStops = await prisma.tripStop.findMany({
    where: { tripId },
    orderBy: { orderIndex: 'asc' },
    include: {
      city: true,
      stopActivities: { include: { activity: true } },
    },
  });

  return reorderedStops;
};
