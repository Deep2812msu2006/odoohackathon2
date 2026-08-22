import { prisma } from '../config/prisma.js';

export const getActivities = async ({ cityId, category, search, minCost, maxCost, maxDuration }) => {
  const where = {};

  if (cityId) {
    where.cityId = cityId;
  }

  if (category) {
    where.category = category;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (minCost || maxCost) {
    where.estimatedCost = {};
    if (minCost) where.estimatedCost.gte = parseFloat(minCost);
    if (maxCost) where.estimatedCost.lte = parseFloat(maxCost);
  }

  if (maxDuration) {
    where.durationHours = { lte: parseFloat(maxDuration) };
  }

  const activities = await prisma.activity.findMany({
    where,
    include: {
      city: {
        select: {
          id: true,
          name: true,
          country: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  });

  return activities;
};
