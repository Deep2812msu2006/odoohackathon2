import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/appError.js';

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
    recentTripsRaw,
    activitiesGroupedByCategory,
    citiesGroupedByRegion,
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
    prisma.trip.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
        isPublic: true,
        createdAt: true,
        user: { select: { name: true, email: true, profilePhotoUrl: true } },
        _count: { select: { stops: true } },
      },
    }),
    prisma.activity.groupBy({
      by: ['category'],
      _count: { category: true },
    }),
    prisma.city.groupBy({
      by: ['region'],
      _count: { region: true },
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

  // Calculate Category Percentage Distribution
  const categoryBreakdown = activitiesGroupedByCategory.map((c) => ({
    category: c.category,
    count: c._count.category,
    percentage: totalActivities > 0 ? Math.round((c._count.category / totalActivities) * 100) : 0,
  }));

  // Calculate Region Distribution
  const regionBreakdown = citiesGroupedByRegion.map((r) => ({
    region: r.region,
    cityCount: r._count.region,
  }));

  return {
    overview: {
      totalUsers,
      totalTrips,
      publicTrips,
      privateTrips: totalTrips - publicTrips,
      totalShares,
      totalCities,
      totalActivities,
    },
    categoryBreakdown,
    regionBreakdown,
    popularCities: popularCitiesRaw,
    popularActivities,
    recentTrips: recentTripsRaw.map((t) => ({
      id: t.id,
      name: t.name,
      creator: t.user.name,
      creatorEmail: t.user.email,
      stopsCount: t._count.stops,
      isPublic: t.isPublic,
      createdAt: t.createdAt,
    })),
    systemHealth: {
      uptimeSeconds: process.uptime(),
      memoryUsageMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
      timestamp: new Date().toISOString(),
    },
  };
};

export const getAllUsersForAdmin = async () => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      profilePhotoUrl: true,
      role: true,
      createdAt: true,
      _count: { select: { trips: true } },
    },
  });
  return users;
};

export const updateUserRole = async (targetUserId, newRole) => {
  if (!['USER', 'ADMIN'].includes(newRole)) {
    throw new AppError('Invalid user role specified.', 400, 'INVALID_ROLE');
  }

  const user = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!user) throw new AppError('User not found.', 404, 'NOT_FOUND');

  const updatedUser = await prisma.user.update({
    where: { id: targetUserId },
    data: { role: newRole },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};
