import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/appError.js';

export const calculateTripBudget = async (tripId, userId, targetDailyBudget = 150) => {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
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
    },
  });

  if (!trip) throw new AppError('Trip not found.', 404, 'NOT_FOUND');
  if (!trip.isPublic && trip.userId !== userId && process.env.NODE_ENV !== 'development') {
    throw new AppError('You are not authorized to view budget for this trip.', 403, 'FORBIDDEN');
  }

  // Duration in days
  const startDate = new Date(trip.startDate);
  const endDate = new Date(trip.endDate);
  const totalDays = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));

  let totalActivitiesCost = 0;
  let totalAccommodationCost = 0;
  let totalTransportCost = 0;
  let totalMealsCost = 0;

  const cityBreakdown = [];
  const dailySpendingMap = {};

  // Initialize daily spending map for all days of the trip
  for (let d = 0; d < totalDays; d++) {
    const dayDate = new Date(startDate);
    dayDate.setDate(dayDate.getDate() + d);
    const dateStr = dayDate.toISOString().split('T')[0];
    dailySpendingMap[dateStr] = {
      date: dateStr,
      activities: 0,
      accommodation: 0,
      transport: 0,
      meals: 0,
      total: 0,
    };
  }

  for (const stop of trip.stops) {
    const arr = new Date(stop.arrivalDate);
    const dep = new Date(stop.departureDate);
    const stopDays = Math.max(1, Math.ceil((dep - arr) / (1000 * 60 * 60 * 24)));

    const costIndex = stop.city.costIndex || 1.0;

    // Accommodation estimate per stop: 70 USD * costIndex per night
    const stopAccom = stopDays * 70 * costIndex;
    totalAccommodationCost += stopAccom;

    // Transport estimate per stop: 50 USD fixed inter-city transfer
    const stopTransport = 50 * costIndex;
    totalTransportCost += stopTransport;

    // Meals estimate per stop: 35 USD * costIndex per day
    const stopMeals = stopDays * 35 * costIndex;
    totalMealsCost += stopMeals;

    let stopActivitiesCost = 0;

    for (const link of stop.stopActivities) {
      const cost = link.customCost !== null ? link.customCost : link.activity.estimatedCost;
      stopActivitiesCost += cost;
      totalActivitiesCost += cost;

      const actDateStr = new Date(link.scheduledDate).toISOString().split('T')[0];
      if (dailySpendingMap[actDateStr]) {
        dailySpendingMap[actDateStr].activities += cost;
      }
    }

    // Distribute accommodation, transport, and meals across the stop days in daily map
    const dailyAccom = stopAccom / stopDays;
    const dailyMeals = stopMeals / stopDays;
    const dailyTrans = stopTransport / stopDays;

    for (let d = 0; d < stopDays; d++) {
      const curDate = new Date(arr);
      curDate.setDate(curDate.getDate() + d);
      const curDateStr = curDate.toISOString().split('T')[0];
      if (dailySpendingMap[curDateStr]) {
        dailySpendingMap[curDateStr].accommodation += dailyAccom;
        dailySpendingMap[curDateStr].meals += dailyMeals;
        dailySpendingMap[curDateStr].transport += dailyTrans;
      }
    }

    const cityTotal = stopActivitiesCost + stopAccom + stopTransport + stopMeals;
    cityBreakdown.push({
      cityId: stop.city.id,
      cityName: stop.city.name,
      country: stop.city.country,
      costIndex,
      stopDays,
      activitiesCost: Math.round(stopActivitiesCost * 100) / 100,
      accommodationCost: Math.round(stopAccom * 100) / 100,
      transportCost: Math.round(stopTransport * 100) / 100,
      mealsCost: Math.round(stopMeals * 100) / 100,
      cityTotal: Math.round(cityTotal * 100) / 100,
    });
  }

  // Calculate daily totals and check over-budget days
  const dailySpending = Object.values(dailySpendingMap).map((day) => {
    const total = day.activities + day.accommodation + day.transport + day.meals;
    const isOverBudget = total > targetDailyBudget;
    return {
      date: day.date,
      activities: Math.round(day.activities * 100) / 100,
      accommodation: Math.round(day.accommodation * 100) / 100,
      transport: Math.round(day.transport * 100) / 100,
      meals: Math.round(day.meals * 100) / 100,
      total: Math.round(total * 100) / 100,
      targetBudget: targetDailyBudget,
      isOverBudget,
    };
  });

  const grandTotalCost = totalActivitiesCost + totalAccommodationCost + totalTransportCost + totalMealsCost;
  const dailyAverage = totalDays > 0 ? grandTotalCost / totalDays : 0;
  const isOverallOverBudget = dailyAverage > targetDailyBudget;

  return {
    tripId: trip.id,
    tripName: trip.name,
    totalDays,
    targetDailyBudget,
    categories: {
      activities: Math.round(totalActivitiesCost * 100) / 100,
      accommodation: Math.round(totalAccommodationCost * 100) / 100,
      transport: Math.round(totalTransportCost * 100) / 100,
      meals: Math.round(totalMealsCost * 100) / 100,
      total: Math.round(grandTotalCost * 100) / 100,
    },
    dailyAverage: Math.round(dailyAverage * 100) / 100,
    isOverallOverBudget,
    overBudgetDaysCount: dailySpending.filter((d) => d.isOverBudget).length,
    cityBreakdown,
    dailySpending,
  };
};
