import { prisma } from '../config/prisma.js';

const CATEGORY_TEMPLATES = {
  food: [
    { title: 'Artisan Food Market Tasting Tour', desc: 'Sample authentic regional delicacies, local cheeses, pastries, and wines with a certified culinary guide.', cost: 65, duration: 2.5, img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80' },
    { title: 'Gourmet Bistro & Chef Tasting Experience', desc: '3-Course signature dinner paired with fine wines and artisanal desserts in a historic bistro.', cost: 85, duration: 3.0, img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&auto=format&fit=crop&q=80' },
    { title: 'Street Food & Local Flavors Walking Tour', desc: 'Explore vibrant food streets, secret bakeries, and traditional coffee roasters.', cost: 45, duration: 2.0, img: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800&auto=format&fit=crop&q=80' },
    { title: 'Cooking Masterclass & Wine Tasting', desc: 'Hands-on culinary class preparing traditional local dishes with a private master chef.', cost: 95, duration: 3.5, img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80' },
  ],
  sightseeing: [
    { title: 'Iconic Landmark Guided Walking Tour', desc: 'Skip-the-line entrance pass and panoramic guided tour of the city\'s most famous monuments.', cost: 50, duration: 3.0, img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format&fit=crop&q=80' },
    { title: 'Panoramic Skydeck & Observatory Pass', desc: '360-degree high-altitude skyline view with sunset cocktail lounge access.', cost: 35, duration: 1.5, img: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&auto=format&fit=crop&q=80' },
    { title: 'Historic Architecture & Heritage Walk', desc: 'Discover ancient palaces, historic squares, and architectural landmarks with an expert guide.', cost: 40, duration: 2.5, img: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&auto=format&fit=crop&q=80' },
    { title: 'Scenic Sunset River & Harbor Cruise', desc: 'Relaxing luxury boat cruise with live acoustic music and panoramic city skyline views.', cost: 60, duration: 2.0, img: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800&auto=format&fit=crop&q=80' },
  ],
  adventure: [
    { title: 'Panoramic Helicopter Flight Experience', desc: 'Soar above the iconic landmarks and coastlines in a VIP luxury helicopter tour.', cost: 180, duration: 1.0, img: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&auto=format&fit=crop&q=80' },
    { title: 'Mountain Summit Hiking & Viewpoint Trail', desc: 'Guided eco-trek through pristine trails to panoramic mountain lookouts.', cost: 55, duration: 4.0, img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80' },
    { title: 'Coastal Kayaking & Sea Cave Exploration', desc: 'Paddle along dramatic cliffs, hidden coves, and crystal sea caves with an expert instructor.', cost: 65, duration: 3.0, img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80' },
  ],
  culture: [
    { title: 'Famous Fine Art Museum & Gallery Tour', desc: 'Guided walkthrough of masterwork art galleries, historical artifacts, and royal collections.', cost: 45, duration: 2.5, img: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&auto=format&fit=crop&q=80' },
    { title: 'Traditional Performing Arts & Gala Concert', desc: 'Evening VIP seats for traditional orchestral, theatrical, or cultural performances.', cost: 75, duration: 2.5, img: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&auto=format&fit=crop&q=80' },
  ],
  nightlife: [
    { title: 'Rooftop Lounge Cocktail & Skyline Night', desc: 'Exclusive VIP lounge access with craft cocktails and panoramic illuminated night views.', cost: 55, duration: 3.0, img: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&auto=format&fit=crop&q=80' },
    { title: 'Illuminated City Night Walk & Jazz Club', desc: 'Guided evening stroll through illuminated plazas followed by live jazz music.', cost: 40, duration: 2.5, img: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&auto=format&fit=crop&q=80' },
  ],
  relaxation: [
    { title: 'Thermal Spa & Botanical Wellness Retreat', desc: 'Full-day pass to natural mineral hot baths, eucalyptus steam rooms, and aromatherapy massage.', cost: 90, duration: 4.0, img: 'https://images.unsplash.com/photo-1529963183134-61a90db47eaf?w=800&auto=format&fit=crop&q=80' },
    { title: 'Tranquil Japanese Zen Garden Stroll', desc: 'Peaceful guided meditation and traditional tea ceremony in historic botanical gardens.', cost: 35, duration: 2.0, img: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800&auto=format&fit=crop&q=80' },
  ],
  shopping: [
    { title: 'Grand Bazaar & Artisan Souvenir Walk', desc: 'Discover hidden artisan workshops, handcrafted leather, jewelry, and antique boutiques.', cost: 30, duration: 2.5, img: 'https://images.unsplash.com/photo-1527838832700-5059252407fa?w=800&auto=format&fit=crop&q=80' },
    { title: 'High-Fashion Designer Promenade Tour', desc: 'Personal styling session and guided tour through premier luxury fashion houses.', cost: 70, duration: 3.0, img: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800&auto=format&fit=crop&q=80' },
  ],
  other: [
    { title: 'Hidden City Gems & Local Secret Spots', desc: 'Uncover secret courtyards, vintage bookshops, and quiet panoramic views off the beaten path.', cost: 35, duration: 2.0, img: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&auto=format&fit=crop&q=80' },
  ],
};

// Helper: Ensure a city has activities for all categories
async function ensureCityCategoryActivities(cityName, searchCategory) {
  let city = await prisma.city.findFirst({
    where: { name: { contains: cityName, mode: 'insensitive' } },
  });

  if (!city) {
    city = await prisma.city.create({
      data: {
        name: cityName.charAt(0).toUpperCase() + cityName.slice(1),
        country: 'Global Destination',
        region: 'Global',
        costIndex: 1.5,
        popularityScore: 9.0,
        imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format&fit=crop&q=80',
      },
    });
  }

  const categoriesToSeed = searchCategory ? [searchCategory] : Object.keys(CATEGORY_TEMPLATES);

  for (const cat of categoriesToSeed) {
    const existing = await prisma.activity.count({
      where: { cityId: city.id, category: cat },
    });

    if (existing === 0) {
      const templates = CATEGORY_TEMPLATES[cat] || CATEGORY_TEMPLATES.other;
      for (const t of templates) {
        await prisma.activity.create({
          data: {
            cityId: city.id,
            name: `${city.name} ${t.title}`,
            description: t.desc,
            category: cat,
            estimatedCost: t.cost,
            durationHours: t.duration,
            imageUrl: t.img,
          },
        });
      }
    }
  }

  return city;
}

export const getActivities = async ({ cityId, category, search, minCost, maxCost, maxDuration }) => {
  const where = {};

  if (cityId) {
    where.cityId = cityId;
  }

  if (category) {
    where.category = category;
  }

  if (search) {
    const trimmedSearch = search.trim();
    where.OR = [
      { name: { contains: trimmedSearch, mode: 'insensitive' } },
      { description: { contains: trimmedSearch, mode: 'insensitive' } },
      { city: { name: { contains: trimmedSearch, mode: 'insensitive' } } },
      { city: { country: { contains: trimmedSearch, mode: 'insensitive' } } },
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

  let activities = await prisma.activity.findMany({
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

  // If search or cityId produced 0 activities, auto-seed and re-query!
  if (activities.length === 0 && (search || cityId)) {
    let targetCityName = search ? search.trim() : null;

    if (cityId) {
      const c = await prisma.city.findUnique({ where: { id: cityId } });
      if (c) targetCityName = c.name;
    }

    if (targetCityName) {
      await ensureCityCategoryActivities(targetCityName, category);

      activities = await prisma.activity.findMany({
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
    }
  }

  return activities;
};
