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

export const generateAiItinerary = async (
  userId,
  { name, cityIds, startDate, durationDays = 7, totalBudget = 1500, preferredCategories = [], pace = 'balanced' }
) => {
  const start = startDate ? new Date(startDate) : new Date();
  const end = new Date(start);
  end.setDate(end.getDate() + (durationDays - 1));

  // 1. Fetch cities from DB
  const cities = await prisma.city.findMany({
    where: { id: { in: cityIds } },
    include: {
      activities: true,
    },
  });

  if (cities.length === 0) {
    throw new AppError('None of the selected cities were found in database.', 404, 'CITIES_NOT_FOUND');
  }

  // Preserve order of cityIds
  const orderedCities = cityIds.map((id) => cities.find((c) => c.id === id)).filter(Boolean);

  const tripName = name || `AI Smart Tour: ${orderedCities.map((c) => c.name).join(' → ')}`;
  const publicSlug = createSlug(tripName);
  const coverPhotoUrl = orderedCities[0]?.imageUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&auto=format&fit=crop&q=80';

  // 2. Calculate days per city stop
  const daysPerCity = Math.max(1, Math.floor(durationDays / orderedCities.length));
  let currentArrival = new Date(start);

  const stopsData = [];
  const activitiesPerDay = pace === 'relaxed' ? 1 : pace === 'packed' ? 3 : 2;
  const timeSlots = ['09:30 AM', '02:00 PM', '06:30 PM'];

  for (let i = 0; i < orderedCities.length; i++) {
    const city = orderedCities[i];
    const isLast = i === orderedCities.length - 1;
    const stayDays = isLast ? Math.max(1, Math.ceil((end - currentArrival) / (1000 * 60 * 60 * 24)) + 1) : daysPerCity;

    const stopDeparture = new Date(currentArrival);
    stopDeparture.setDate(stopDeparture.getDate() + (stayDays - 1));

    // Filter activities by preferred categories if provided
    let availableActivities = city.activities;
    if (preferredCategories.length > 0) {
      const filtered = city.activities.filter((a) => preferredCategories.includes(a.category));
      if (filtered.length > 0) availableActivities = filtered;
    }

    // Schedule stop activities for each day of this city stop
    const stopActivitiesData = [];
    let activityIdx = 0;

    for (let day = 0; day < stayDays; day++) {
      const scheduledDate = new Date(currentArrival);
      scheduledDate.setDate(scheduledDate.getDate() + day);

      for (let act = 0; act < activitiesPerDay; act++) {
        if (availableActivities.length === 0) break;
        const selectedActivity = availableActivities[activityIdx % availableActivities.length];
        activityIdx++;

        const customCost = Math.round(selectedActivity.estimatedCost * city.costIndex);

        stopActivitiesData.push({
          activityId: selectedActivity.id,
          scheduledDate,
          scheduledTime: timeSlots[act % timeSlots.length],
          customCost,
          orderIndex: stopActivitiesData.length,
        });
      }
    }

    stopsData.push({
      cityId: city.id,
      orderIndex: i,
      arrivalDate: new Date(currentArrival),
      departureDate: new Date(stopDeparture),
      notes: `AI Recommended ${stayDays}-Day Exploration of ${city.name}, ${city.country}. (Cost Multiplier: ${city.costIndex}x)`,
      stopActivitiesData,
    });

    currentArrival = new Date(stopDeparture);
    currentArrival.setDate(currentArrival.getDate() + 1);
  }

  // 3. Database persistence
  const newTrip = await prisma.trip.create({
    data: {
      userId,
      name: tripName,
      description: `AI-Optimized ${durationDays}-Day itinerary covering ${orderedCities.map((c) => c.name).join(', ')}. Planned for $${totalBudget} target budget (${pace} pace).`,
      startDate: start,
      endDate: end,
      coverPhotoUrl,
      isPublic: false,
      publicSlug,
    },
  });

  for (const stop of stopsData) {
    const createdStop = await prisma.tripStop.create({
      data: {
        tripId: newTrip.id,
        cityId: stop.cityId,
        orderIndex: stop.orderIndex,
        arrivalDate: stop.arrivalDate,
        departureDate: stop.departureDate,
        notes: stop.notes,
      },
    });

    for (const act of stop.stopActivitiesData) {
      await prisma.tripStopActivity.create({
        data: {
          tripStopId: createdStop.id,
          activityId: act.activityId,
          scheduledDate: act.scheduledDate,
          scheduledTime: act.scheduledTime,
          customCost: act.customCost,
          orderIndex: act.orderIndex,
        },
      });
    }
  }

  return prisma.trip.findUnique({
    where: { id: newTrip.id },
    include: {
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
