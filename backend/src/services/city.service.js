import { prisma } from '../config/prisma.js';

export const getCities = async ({ search, country, region, minCost, maxCost, sortBy = 'popularityScore', order = 'desc' }) => {
  const where = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { country: { contains: search, mode: 'insensitive' } },
      { region: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (country) {
    where.country = { equals: country, mode: 'insensitive' };
  }

  if (region) {
    where.region = { equals: region, mode: 'insensitive' };
  }

  if (minCost || maxCost) {
    where.costIndex = {};
    if (minCost) where.costIndex.gte = parseFloat(minCost);
    if (maxCost) where.costIndex.lte = parseFloat(maxCost);
  }

  const orderBy = {};
  if (['name', 'country', 'costIndex', 'popularityScore'].includes(sortBy)) {
    orderBy[sortBy] = order === 'asc' ? 'asc' : 'desc';
  } else {
    orderBy.popularityScore = 'desc';
  }

  const cities = await prisma.city.findMany({
    where,
    orderBy,
    include: {
      _count: {
        select: { activities: true },
      },
    },
  });

  return cities;
};

export const getCityById = async (cityId) => {
  const city = await prisma.city.findUnique({
    where: { id: cityId },
    include: {
      activities: true,
    },
  });
  return city;
};
