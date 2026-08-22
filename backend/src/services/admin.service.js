import { prisma } from '../config/prisma.js';

export const getAdminAnalytics = async () => {
  const [
    totalUsers,
    totalTrips,
    publicTrips,
    totalShares,
    totalCities,
    totalActivities,
    popularCitiesRaw,
    popularActivitiesRaw,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.trip.count(),
    prisma.trip.count({ where: { isPublic: true } }),
    prisma.tripShare.count(),
    prisma.city.count(),
    prisma.activity.count(),
    prisma.city.findMany({
      orderBy: { popularityScore: 'desc' },
      take: 5,
      select: { id: true, name: true, country: true, region: true, costIndex: true, popularityScore: true, imageUrl: true },
    }),
    prisma.tripStopActivity.groupBy({
      by: ['activityId'],
      _count: { activityId: true },
      orderBy: { _count: { activityId: 'desc' } },
      take: 5,
    }),
  ]);

  // Resolve popular activity details
  const activityIds = popularActivitiesRaw.map((a) => a.activityId);
  const activitiesList = await prisma.activity.findMany({
    where: { id: { in: activityIds } },
    include: { city: { select: { name: true } } },
  });

  const popularActivities = popularActivitiesRaw.map((item) => {
    const act = activitiesList.find((a) => a.id === item.activityId);
    return {
      id: item.activityId,
      name: act ? act.name : 'Unknown Activity',
      cityName: act ? act.city.name : 'Unknown City',
      category: act ? act.category : 'other',
      usageCount: item._count.activityId,
    };
  });

  return {
    overview: {
      totalUsers,
      totalTrips,
      publicTrips,
      totalShares,
      totalCities,
      totalActivities,
    },
    popularCities: popularCitiesRaw,
    popularActivities,
  };
};
