import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data
  await prisma.tripShare.deleteMany({});
  await prisma.tripStopActivity.deleteMany({});
  await prisma.tripStop.deleteMany({});
  await prisma.activity.deleteMany({});
  await prisma.city.deleteMany({});
  await prisma.trip.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('🧹 Cleaned existing records.');

  // Create Demo User
  const passwordHash = await bcrypt.hash('Password123!', 10);
  const demoUser = await prisma.user.create({
    data: {
      name: 'Alex Rivera',
      email: 'demo@globetrotter.com',
      passwordHash,
      profilePhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      languagePreference: 'en',
    },
  });

  const secondaryUser = await prisma.user.create({
    data: {
      name: 'Sophia Chen',
      email: 'sophia@globetrotter.com',
      passwordHash,
      profilePhotoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
      languagePreference: 'en',
    },
  });

  console.log('👤 Created demo users.');

  // Seed Cities (15+ cities across 5 continents)
  const citiesData = [
    {
      name: 'Paris',
      country: 'France',
      region: 'Europe',
      costIndex: 1.8,
      popularityScore: 9.8,
      imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format&fit=crop&q=80',
    },
    {
      name: 'Tokyo',
      country: 'Japan',
      region: 'Asia',
      costIndex: 1.6,
      popularityScore: 9.9,
      imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&auto=format&fit=crop&q=80',
    },
    {
      name: 'Rome',
      country: 'Italy',
      region: 'Europe',
      costIndex: 1.5,
      popularityScore: 9.5,
      imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&auto=format&fit=crop&q=80',
    },
    {
      name: 'New York',
      country: 'United States',
      region: 'North America',
      costIndex: 2.2,
      popularityScore: 9.7,
      imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&auto=format&fit=crop&q=80',
    },
    {
      name: 'Kyoto',
      country: 'Japan',
      region: 'Asia',
      costIndex: 1.4,
      popularityScore: 9.3,
      imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&auto=format&fit=crop&q=80',
    },
    {
      name: 'Barcelona',
      country: 'Spain',
      region: 'Europe',
      costIndex: 1.3,
      popularityScore: 9.4,
      imageUrl: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&auto=format&fit=crop&q=80',
    },
    {
      name: 'Cape Town',
      country: 'South Africa',
      region: 'Africa',
      costIndex: 1.1,
      popularityScore: 8.9,
      imageUrl: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=800&auto=format&fit=crop&q=80',
    },
    {
      name: 'Sydney',
      country: 'Australia',
      region: 'Oceania',
      costIndex: 1.7,
      popularityScore: 9.1,
      imageUrl: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&auto=format&fit=crop&q=80',
    },
    {
      name: 'London',
      country: 'United Kingdom',
      region: 'Europe',
      costIndex: 2.0,
      popularityScore: 9.6,
      imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&auto=format&fit=crop&q=80',
    },
    {
      name: 'Bangkok',
      country: 'Thailand',
      region: 'Asia',
      costIndex: 0.8,
      popularityScore: 9.2,
      imageUrl: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&auto=format&fit=crop&q=80',
    },
    {
      name: 'Rio de Janeiro',
      country: 'Brazil',
      region: 'South America',
      costIndex: 1.0,
      popularityScore: 8.8,
      imageUrl: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&auto=format&fit=crop&q=80',
    },
    {
      name: 'Cairo',
      country: 'Egypt',
      region: 'Africa',
      costIndex: 0.7,
      popularityScore: 8.7,
      imageUrl: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=800&auto=format&fit=crop&q=80',
    },
    {
      name: 'Amsterdam',
      country: 'Netherlands',
      region: 'Europe',
      costIndex: 1.6,
      popularityScore: 9.2,
      imageUrl: 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?w=800&auto=format&fit=crop&q=80',
    },
    {
      name: 'Dubrovnik',
      country: 'Croatia',
      region: 'Europe',
      costIndex: 1.2,
      popularityScore: 8.6,
      imageUrl: 'https://images.unsplash.com/photo-1486016006115-74a41448aea2?w=800&auto=format&fit=crop&q=80',
    },
    {
      name: 'Mumbai',
      country: 'India',
      region: 'Asia',
      costIndex: 0.7,
      popularityScore: 8.5,
      imageUrl: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&auto=format&fit=crop&q=80',
    },
    {
      name: 'Reykjavik',
      country: 'Iceland',
      region: 'Europe',
      costIndex: 2.1,
      popularityScore: 8.9,
      imageUrl: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800&auto=format&fit=crop&q=80',
    },
  ];

  const createdCities = {};
  for (const c of citiesData) {
    const city = await prisma.city.create({ data: c });
    createdCities[city.name] = city;
  }
  console.log(`🏙️ Seeded ${Object.keys(createdCities).length} cities.`);

  // Seed Activities (40+ activities across all categories)
  const activitiesData = [
    // Paris
    {
      cityName: 'Paris',
      name: 'Eiffel Tower Summit Tour',
      category: 'sightseeing',
      description: 'Ascend to the top of Paris’ iconic monument for panoramic city views.',
      estimatedCost: 35.0,
      durationHours: 3.0,
      imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format&fit=crop&q=80',
    },
    {
      cityName: 'Paris',
      name: 'Louvre Museum Timed Entry',
      category: 'culture',
      description: 'Explore world-renowned masterpieces including the Mona Lisa and Venus de Milo.',
      estimatedCost: 22.0,
      durationHours: 4.0,
      imageUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&auto=format&fit=crop&q=80',
    },
    {
      cityName: 'Paris',
      name: 'Seine River Evening Dinner Cruise',
      category: 'food',
      description: 'Gourmet 3-course French dining accompanied by live violin music along the illuminated Seine.',
      estimatedCost: 95.0,
      durationHours: 2.5,
      imageUrl: 'https://images.unsplash.com/photo-1509299349698-dd22323b5963?w=800&auto=format&fit=crop&q=80',
    },
    {
      cityName: 'Paris',
      name: 'Le Marais Pastry & Bakery Walk',
      category: 'food',
      description: 'Sample artisan croissants, macarons, and chocolate eclairs in historical bakeries.',
      estimatedCost: 45.0,
      durationHours: 2.0,
      imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80',
    },
    {
      cityName: 'Paris',
      name: 'Montmartre Artists Square & Sacré-Cœur',
      category: 'sightseeing',
      description: 'Wander quaint cobblestone streets and enjoy sunset views over Paris.',
      estimatedCost: 0.0,
      durationHours: 2.5,
      imageUrl: 'https://images.unsplash.com/photo-1522093007474-d86e9bf7ba6f?w=800&auto=format&fit=crop&q=80',
    },

    // Tokyo
    {
      cityName: 'Tokyo',
      name: 'TeamLab Planets Immersive Digital Art',
      category: 'culture',
      description: 'Walk through water and body-immersive digital artwork spaces.',
      estimatedCost: 28.0,
      durationHours: 2.5,
      imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&auto=format&fit=crop&q=80',
    },
    {
      cityName: 'Tokyo',
      name: 'Tsukiji Outer Market Food Tour',
      category: 'food',
      description: 'Taste fresh sashimi, tamagoyaki, and grilled wagyu beef skewers.',
      estimatedCost: 55.0,
      durationHours: 3.0,
      imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&auto=format&fit=crop&q=80',
    },
    {
      cityName: 'Tokyo',
      name: 'Shinjuku Omoide Yokocho Bar Crawl',
      category: 'nightlife',
      description: 'Experience atmospheric alleyway izakayas and local craft sake.',
      estimatedCost: 50.0,
      durationHours: 3.5,
      imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&auto=format&fit=crop&q=80',
    },
    {
      cityName: 'Tokyo',
      name: 'Senso-ji Temple & Asakusa Walking',
      category: 'culture',
      description: 'Tokyo’s oldest Buddhist temple surrounded by traditional souvenir shops.',
      estimatedCost: 0.0,
      durationHours: 2.0,
      imageUrl: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=800&auto=format&fit=crop&q=80',
    },

    // Rome
    {
      cityName: 'Rome',
      name: 'Colosseum & Roman Forum VIP Tour',
      category: 'sightseeing',
      description: 'Skip-the-line access to the arena floor and ancient gladiatorial chambers.',
      estimatedCost: 40.0,
      durationHours: 3.5,
      imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&auto=format&fit=crop&q=80',
    },
    {
      cityName: 'Rome',
      name: 'Vatican Museums & Sistine Chapel',
      category: 'culture',
      description: 'Marvel at Michelangelo’s famous ceiling and papal art collections.',
      estimatedCost: 35.0,
      durationHours: 4.0,
      imageUrl: 'https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=800&auto=format&fit=crop&q=80',
    },
    {
      cityName: 'Rome',
      name: 'Trastevere Pasta & Gelato Masterclass',
      category: 'food',
      description: 'Learn to make hand-rolled tagliatelle, authentic carbonara, and fresh gelato.',
      estimatedCost: 75.0,
      durationHours: 3.0,
      imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&auto=format&fit=crop&q=80',
    },

    // New York
    {
      cityName: 'New York',
      name: 'Broadway Musical Ticket',
      category: 'nightlife',
      description: 'Enjoy world-class theatrical performances in Midtown Manhattan.',
      estimatedCost: 140.0,
      durationHours: 3.0,
      imageUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&auto=format&fit=crop&q=80',
    },
    {
      cityName: 'New York',
      name: 'High Line & Chelsea Market Walk',
      category: 'relaxation',
      description: 'Stroll elevated greenways built on historical rail tracks.',
      estimatedCost: 0.0,
      durationHours: 2.0,
      imageUrl: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800&auto=format&fit=crop&q=80',
    },
    {
      cityName: 'New York',
      name: 'Helicopter Flight over Manhattan Skyline',
      category: 'adventure',
      description: 'Breathtaking aerial views of Lady Liberty, Central Park, and the Empire State Building.',
      estimatedCost: 245.0,
      durationHours: 1.0,
      imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&auto=format&fit=crop&q=80',
    },

    // Kyoto
    {
      cityName: 'Kyoto',
      name: 'Fushimi Inari Torii Gate Sunrise Hike',
      category: 'adventure',
      description: 'Hike through thousands of vermilion torii gates to the mountain summit.',
      estimatedCost: 0.0,
      durationHours: 2.5,
      imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&auto=format&fit=crop&q=80',
    },
    {
      cityName: 'Kyoto',
      name: 'Traditional Matcha Tea Ceremony',
      category: 'culture',
      description: 'Experience zen mindfulness and tea preparation in a historical wooden machiya.',
      estimatedCost: 38.0,
      durationHours: 1.5,
      imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop&q=80',
    },

    // Barcelona
    {
      cityName: 'Barcelona',
      name: 'Sagrada Família Guided Tower Tour',
      category: 'culture',
      description: 'Gaudí’s unfinished masterpiece with light streaming through stained glass windows.',
      estimatedCost: 32.0,
      durationHours: 2.0,
      imageUrl: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&auto=format&fit=crop&q=80',
    },
    {
      cityName: 'Barcelona',
      name: 'Park Güell & Gothic Quarter Sunset Walk',
      category: 'sightseeing',
      description: 'Mosaic dragons, rooftop views, and tapas tastings in historic alleys.',
      estimatedCost: 18.0,
      durationHours: 3.0,
      imageUrl: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&auto=format&fit=crop&q=80',
    },
    {
      cityName: 'Barcelona',
      name: 'Barceloneta Beach Sunset Kayaking',
      category: 'adventure',
      description: 'Paddle along the Mediterranean coast with qualified instructor guides.',
      estimatedCost: 42.0,
      durationHours: 2.0,
      imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
    },

    // Cape Town
    {
      cityName: 'Cape Town',
      name: 'Table Mountain Aerial Cableway',
      category: 'adventure',
      description: 'Ride revolving cable cars to the flat-topped mountain peak.',
      estimatedCost: 25.0,
      durationHours: 3.0,
      imageUrl: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=800&auto=format&fit=crop&q=80',
    },
    {
      cityName: 'Cape Town',
      name: 'Cape Peninsula & Boulders Beach Penguins',
      category: 'sightseeing',
      description: 'Visit the southwesternmost tip of Africa and swim near African penguins.',
      estimatedCost: 65.0,
      durationHours: 7.0,
      imageUrl: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800&auto=format&fit=crop&q=80',
    },

    // Sydney
    {
      cityName: 'Sydney',
      name: 'Sydney Opera House Backstage Tour',
      category: 'culture',
      description: 'Exclusive access to concert halls and dressing rooms of world famous architecture.',
      estimatedCost: 48.0,
      durationHours: 2.0,
      imageUrl: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&auto=format&fit=crop&q=80',
    },
    {
      cityName: 'Sydney',
      name: 'Bondi to Coogee Coastal Walk & Surf',
      category: 'relaxation',
      description: 'Spectacular cliffside oceanside walking trail with beach stops.',
      estimatedCost: 0.0,
      durationHours: 3.0,
      imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
    },

    // London
    {
      cityName: 'London',
      name: 'British Museum Highlight Tour',
      category: 'culture',
      description: 'See the Rosetta Stone, Egyptian Mummies, and Parthenon Sculptures.',
      estimatedCost: 0.0,
      durationHours: 3.0,
      imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&auto=format&fit=crop&q=80',
    },
    {
      cityName: 'London',
      name: 'West End Afternoon Tea & Theatre',
      category: 'food',
      description: 'Traditional scone & finger sandwich high tea followed by a matinee show.',
      estimatedCost: 85.0,
      durationHours: 4.5,
      imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80',
    },

    // Bangkok
    {
      cityName: 'Bangkok',
      name: 'Grand Palace & Wat Phra Kaew',
      category: 'culture',
      description: 'Explore the ceremonial home of Thai Kings and Emerald Buddha.',
      estimatedCost: 15.0,
      durationHours: 3.0,
      imageUrl: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&auto=format&fit=crop&q=80',
    },
    {
      cityName: 'Bangkok',
      name: 'Chinatown Yaowarat Street Food Safari',
      category: 'food',
      description: 'Michelin bib gourmand street noodle stalls and seafood feasts.',
      estimatedCost: 20.0,
      durationHours: 3.0,
      imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80',
    },

    // Rio de Janeiro
    {
      cityName: 'Rio de Janeiro',
      name: 'Christ the Redeemer & Corcovado Train',
      category: 'sightseeing',
      description: 'Cog train through Tijuca forest to the panoramic statue peak.',
      estimatedCost: 28.0,
      durationHours: 3.0,
      imageUrl: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&auto=format&fit=crop&q=80',
    },

    // Cairo
    {
      cityName: 'Cairo',
      name: 'Giza Pyramids & Great Sphinx Camel Trek',
      category: 'sightseeing',
      description: 'Uncover ancient wonders with an Egyptologist guide.',
      estimatedCost: 30.0,
      durationHours: 4.0,
      imageUrl: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=800&auto=format&fit=crop&q=80',
    },

    // Amsterdam
    {
      cityName: 'Amsterdam',
      name: 'Canal Ring Cruise & Van Gogh Museum',
      category: 'culture',
      description: 'Glass-topped boat cruise along UNESCO canals followed by post-impressionist art.',
      estimatedCost: 38.0,
      durationHours: 4.0,
      imageUrl: 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?w=800&auto=format&fit=crop&q=80',
    },

    // Dubrovnik
    {
      cityName: 'Dubrovnik',
      name: 'Ancient City Walls & Game of Thrones Tour',
      category: 'sightseeing',
      description: 'Walk medieval fortifications overlooking the turquoise Adriatic Sea.',
      estimatedCost: 35.0,
      durationHours: 2.5,
      imageUrl: 'https://images.unsplash.com/photo-1486016006115-74a41448aea2?w=800&auto=format&fit=crop&q=80',
    },

    // Mumbai
    {
      cityName: 'Mumbai',
      name: 'Gateway of India & Elephanta Caves Boat',
      category: 'culture',
      description: 'Ferry across Mumbai harbor to rock-cut cave temples.',
      estimatedCost: 12.0,
      durationHours: 5.0,
      imageUrl: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&auto=format&fit=crop&q=80',
    },

    // Reykjavik
    {
      cityName: 'Reykjavik',
      name: 'Golden Circle & Secret Lagoon Thermal Bath',
      category: 'adventure',
      description: 'Geysers, Gullfoss waterfall, and geothermal soaking springs.',
      estimatedCost: 90.0,
      durationHours: 8.0,
      imageUrl: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800&auto=format&fit=crop&q=80',
    },
  ];

  let activityCount = 0;
  for (const act of activitiesData) {
    const city = createdCities[act.cityName];
    if (city) {
      const { cityName, ...actData } = act;
      await prisma.activity.create({
        data: {
          ...actData,
          cityId: city.id,
        },
      });
      activityCount++;
    }
  }

  console.log(`🎯 Seeded ${activityCount} activities.`);

  // Create Demo Sample Trip
  const trip = await prisma.trip.create({
    data: {
      userId: demoUser.id,
      name: 'Grand European Escapade 2026',
      description: 'A multi-city journey across Paris and Rome exploring art, gastronomy, and historic landmarks.',
      startDate: new Date('2026-09-10'),
      endDate: new Date('2026-09-20'),
      coverPhotoUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format&fit=crop&q=80',
      isPublic: true,
      publicSlug: 'grand-european-escapade-2026',
    },
  });

  const stop1 = await prisma.tripStop.create({
    data: {
      tripId: trip.id,
      cityId: createdCities['Paris'].id,
      orderIndex: 0,
      arrivalDate: new Date('2026-09-10'),
      departureDate: new Date('2026-09-15'),
      notes: 'Stay near Le Marais neighborhood. Book museum tickets early.',
    },
  });

  const stop2 = await prisma.tripStop.create({
    data: {
      tripId: trip.id,
      cityId: createdCities['Rome'].id,
      orderIndex: 1,
      arrivalDate: new Date('2026-09-15'),
      departureDate: new Date('2026-09-20'),
      notes: 'Flight from Orly to Fiumicino on Sept 15 afternoon.',
    },
  });

  // Attach activities to stops
  const eiffel = await prisma.activity.findFirst({ where: { name: { contains: 'Eiffel' } } });
  const louvre = await prisma.activity.findFirst({ where: { name: { contains: 'Louvre' } } });
  const colosseum = await prisma.activity.findFirst({ where: { name: { contains: 'Colosseum' } } });

  if (eiffel && stop1) {
    await prisma.tripStopActivity.create({
      data: {
        tripStopId: stop1.id,
        activityId: eiffel.id,
        scheduledDate: new Date('2026-09-11'),
        scheduledTime: '10:00',
        customCost: 35.0,
        orderIndex: 0,
      },
    });
  }

  if (louvre && stop1) {
    await prisma.tripStopActivity.create({
      data: {
        tripStopId: stop1.id,
        activityId: louvre.id,
        scheduledDate: new Date('2026-09-12'),
        scheduledTime: '14:00',
        customCost: 22.0,
        orderIndex: 1,
      },
    });
  }

  if (colosseum && stop2) {
    await prisma.tripStopActivity.create({
      data: {
        tripStopId: stop2.id,
        activityId: colosseum.id,
        scheduledDate: new Date('2026-09-16'),
        scheduledTime: '09:30',
        customCost: 40.0,
        orderIndex: 0,
      },
    });
  }

  console.log('✈️ Seeded demo trip with stops and activities.');
  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
