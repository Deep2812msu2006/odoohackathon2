import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const realPrisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error'] : ['error'],
});

// Rich Mock In-Memory Database
const mockDb = {
  users: [
    {
      id: 'demo-user-id',
      name: 'Alex Rivera',
      email: 'demo@globetrotter.com',
      passwordHash: bcrypt.hashSync('Password123!', 10),
      profilePhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      languagePreference: 'en',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'sophia-user-id',
      name: 'Sophia Chen',
      email: 'sophia@globetrotter.com',
      passwordHash: bcrypt.hashSync('Password123!', 10),
      profilePhotoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
      languagePreference: 'en',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ],
  trips: [
    {
      id: 'demo-trip-id',
      userId: 'demo-user-id',
      name: 'Summer Europe Explorer',
      description: 'Explore the highlights of France and Italy in 2 weeks!',
      startDate: new Date('2026-06-01'),
      endDate: new Date('2026-06-15'),
      coverPhotoUrl: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&auto=format&fit=crop&q=80',
      isPublic: true,
      publicSlug: 'summer-europe-explorer-1234',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ],
  cities: [
    {
      id: 'city-paris-id',
      name: 'Paris',
      country: 'France',
      region: 'Europe',
      costIndex: 1.8,
      popularityScore: 9.8,
      imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format&fit=crop&q=80',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'city-tokyo-id',
      name: 'Tokyo',
      country: 'Japan',
      region: 'Asia',
      costIndex: 1.6,
      popularityScore: 9.9,
      imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&auto=format&fit=crop&q=80',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'city-rome-id',
      name: 'Rome',
      country: 'Italy',
      region: 'Europe',
      costIndex: 1.5,
      popularityScore: 9.5,
      imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&auto=format&fit=crop&q=80',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'city-ny-id',
      name: 'New York',
      country: 'United States',
      region: 'North America',
      costIndex: 2.2,
      popularityScore: 9.7,
      imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&auto=format&fit=crop&q=80',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ],
  tripStops: [
    {
      id: 'stop-paris-id',
      tripId: 'demo-trip-id',
      cityId: 'city-paris-id',
      orderIndex: 0,
      arrivalDate: new Date('2026-06-01'),
      departureDate: new Date('2026-06-08'),
      notes: 'Enjoy the cafes and museums.',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'stop-rome-id',
      tripId: 'demo-trip-id',
      cityId: 'city-rome-id',
      orderIndex: 1,
      arrivalDate: new Date('2026-06-09'),
      departureDate: new Date('2026-06-15'),
      notes: 'Colosseum and amazing Italian pasta.',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ],
  activities: [
    {
      id: 'activity-eiffel-id',
      cityId: 'city-paris-id',
      name: 'Eiffel Tower Summit Tour',
      category: 'sightseeing',
      description: 'Experience stunning panoramic views of Paris from the peak of the iconic Eiffel Tower with priority access.',
      estimatedCost: 28.0,
      durationHours: 2.0,
      imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format&fit=crop&q=80',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'activity-louvre-id',
      cityId: 'city-paris-id',
      name: 'Louvre Guided Masterpieces Tour',
      category: 'culture',
      description: 'Skip the line and explore the finest art pieces in the world including the legendary Mona Lisa and Venus de Milo.',
      estimatedCost: 22.0,
      durationHours: 3.0,
      imageUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&auto=format&fit=crop&q=80',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'activity-pastry-id',
      cityId: 'city-paris-id',
      name: 'Artisanal French Pastry & Macaron Class',
      category: 'food',
      description: 'Learn the secrets of baking classic French croissants, macarons, and baguettes from a professional Parisian chef.',
      estimatedCost: 45.0,
      durationHours: 2.5,
      imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'activity-colosseum-id',
      cityId: 'city-rome-id',
      name: 'Colosseum & Roman Forum Premium Tour',
      category: 'culture',
      description: 'Walk in the footsteps of gladiators and explore the majestic ancient ruins of Rome with an expert archaeologist guide.',
      estimatedCost: 25.0,
      durationHours: 2.5,
      imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&auto=format&fit=crop&q=80',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'activity-pasta-id',
      cityId: 'city-rome-id',
      name: 'Roman Pasta Making & Wine Tasting Class',
      category: 'food',
      description: 'Master the art of creating authentic Roman pasta shapes like Carbonara and Cacio e Pepe, complete with premium wine pairings.',
      estimatedCost: 35.0,
      durationHours: 3.0,
      imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'activity-shibuya-id',
      cityId: 'city-tokyo-id',
      name: 'Shibuya Crossing Photography Tour',
      category: 'sightseeing',
      description: 'Navigate the world\'s busiest pedestrian intersection and capture striking street photography from hidden high-elevation spots.',
      estimatedCost: 0.0,
      durationHours: 1.0,
      imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&auto=format&fit=crop&q=80',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'activity-sushi-id',
      cityId: 'city-tokyo-id',
      name: 'Luxury Sushi Masterclass at Toyosu Market',
      category: 'food',
      description: 'Select pristine seasonal ingredients directly from Toyosu Market and learn authentic sushi-rolling techniques from a Michelin-starred master.',
      estimatedCost: 85.0,
      durationHours: 3.0,
      imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&auto=format&fit=crop&q=80',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'activity-karting-id',
      cityId: 'city-tokyo-id',
      name: 'Street Karting Experience through Akihabara',
      category: 'adventure',
      description: 'Dress up as your favorite gaming character and race custom go-karts through Tokyo\'s neon-lit shopping districts.',
      estimatedCost: 65.0,
      durationHours: 2.0,
      imageUrl: 'https://images.unsplash.com/photo-1533240332313-0db49b459ad6?w=800&auto=format&fit=crop&q=80',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'activity-times-square-id',
      cityId: 'city-ny-id',
      name: 'Times Square Midnight Lights Walk',
      category: 'sightseeing',
      description: 'Immerse yourself in the glowing billboards, Broadway buzz, and electric midnight energy of New York City\'s heart.',
      estimatedCost: 0.0,
      durationHours: 1.5,
      imageUrl: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800&auto=format&fit=crop&q=80',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'activity-broadway-id',
      cityId: 'city-ny-id',
      name: 'Hamilton Musical Broadway Tickets',
      category: 'culture',
      description: 'Secure premium front-mezzanine seats for the award-winning history-making rap-infused Broadway musical.',
      estimatedCost: 120.0,
      durationHours: 3.0,
      imageUrl: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=800&auto=format&fit=crop&q=80',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ],
  tripStopActivities: [
    {
      id: 'link-eiffel-id',
      tripStopId: 'stop-paris-id',
      activityId: 'activity-eiffel-id',
      scheduledDate: new Date('2026-06-02'),
      scheduledTime: '10:00',
      customCost: 30.0,
      orderIndex: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'link-colosseum-id',
      tripStopId: 'stop-rome-id',
      activityId: 'activity-colosseum-id',
      scheduledDate: new Date('2026-06-10'),
      scheduledTime: '14:00',
      customCost: 25.0,
      orderIndex: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ],
  tripShares: [],
};

const createModelMock = (listName) => {
  const getList = () => mockDb[listName];
  return {
    findUnique: async (args) => {
      const { where, include } = args || {};
      const found = getList().find(item => {
        if (where.id) return item.id === where.id;
        if (where.email) return item.email === where.email;
        if (where.publicSlug) return item.publicSlug === where.publicSlug;
        return false;
      });
      if (!found) return null;
      const result = { ...found };
      if (include) {
        if (include.stops && listName === 'trips') {
          result.stops = mockDb.tripStops
            .filter(stop => stop.tripId === found.id)
            .map(stop => {
              const stopCity = mockDb.cities.find(c => c.id === stop.cityId);
              const stopActivities = mockDb.tripStopActivities
                .filter(act => act.tripStopId === stop.id)
                .map(act => {
                  const activity = mockDb.activities.find(a => a.id === act.activityId);
                  return { ...act, activity };
                });
              return { ...stop, city: stopCity, stopActivities };
            });
        }
        if (include.user && listName === 'trips') {
          result.user = mockDb.users.find(u => u.id === found.userId);
        }
        if (include.city && listName === 'tripStops') {
          result.city = mockDb.cities.find(c => c.id === found.cityId);
        }
        if (include.stopActivities && listName === 'tripStops') {
          result.stopActivities = mockDb.tripStopActivities
            .filter(act => act.tripStopId === found.id)
            .map(act => {
              const activity = mockDb.activities.find(a => a.id === act.activityId);
              return { ...act, activity };
            });
        }
      }
      return result;
    },
    findFirst: async (args) => {
      const { where } = args || {};
      const found = getList().find(item => {
        if (where.id && where.tripId) return item.id === where.id && item.tripId === where.tripId;
        if (where.id) return item.id === where.id;
        return false;
      });
      return found || null;
    },
    findMany: async (args) => {
      const { where, include } = args || {};
      let filtered = [...getList()];
      if (where) {
        if (where.userId) filtered = filtered.filter(item => item.userId === where.userId);
        if (where.tripId) filtered = filtered.filter(item => item.tripId === where.tripId);
      }
      if (include) {
        filtered = filtered.map(item => {
          const result = { ...item };
          if (include.stops && listName === 'trips') {
            result.stops = mockDb.tripStops
              .filter(stop => stop.tripId === item.id)
              .map(stop => {
                const stopCity = mockDb.cities.find(c => c.id === stop.cityId);
                const stopActivities = mockDb.tripStopActivities
                  .filter(act => act.tripStopId === stop.id)
                  .map(act => {
                    const activity = mockDb.activities.find(a => a.id === act.activityId);
                    return { ...act, activity };
                  });
                return { ...stop, city: stopCity, stopActivities };
              });
          }
          if (include._count) {
            result._count = { stops: mockDb.tripStops.filter(stop => stop.tripId === item.id).length };
          }
          return result;
        });
      }
      return filtered;
    },
    create: async (args) => {
      const { data } = args || {};
      const newItem = {
        id: Math.random().toString(36).substring(2, 15),
        createdAt: new Date(),
        updatedAt: new Date(),
        ...data,
      };
      getList().push(newItem);
      return newItem;
    },
    update: async (args) => {
      const { where, data } = args || {};
      const idx = getList().findIndex(item => {
        if (where.id) return item.id === where.id;
        if (where.email) return item.email === where.email;
        return false;
      });
      if (idx === -1) throw new Error('Not found');
      getList()[idx] = {
        ...getList()[idx],
        ...data,
        updatedAt: new Date(),
      };
      return getList()[idx];
    },
    updateMany: async (args) => {
      return { count: 1 };
    },
    delete: async (args) => {
      const { where } = args || {};
      const idx = getList().findIndex(item => {
        if (where.id) return item.id === where.id;
        return false;
      });
      if (idx === -1) throw new Error('Not found');
      const removed = getList().splice(idx, 1)[0];
      return removed;
    },
    count: async (args) => {
      const { where } = args || {};
      if (where && where.isPublic) {
        return getList().filter(item => item.isPublic).length;
      }
      return getList().length;
    },
  };
};

class MockPrismaClient {
  constructor() {
    this.user = createModelMock('users');
    this.trip = createModelMock('trips');
    this.city = createModelMock('cities');
    this.tripStop = createModelMock('tripStops');
    this.activity = createModelMock('activities');
    this.tripStopActivity = createModelMock('tripStopActivities');
    this.tripShare = createModelMock('tripShares');
  }
  async $transaction(arg) {
    if (typeof arg === 'function') {
      return await arg(this);
    }
    return await Promise.all(arg);
  }
}

// Fallback logic wrapper proxy
const mockPrisma = new MockPrismaClient();

export const prisma = new Proxy(realPrisma, {
  get: (target, prop) => {
    // If the database has connection issue, or mock is explicitly enabled, direct calls to the mock client
    if (process.env.MOCK_DATABASE === 'true') {
      return mockPrisma[prop];
    }
    
    // Default dynamic behavior
    const origMethod = target[prop];
    if (typeof origMethod === 'function') {
      return origMethod;
    }
    
    if (
      typeof origMethod !== 'object' || 
      origMethod === null || 
      (typeof prop === 'string' && (prop.startsWith('_') || prop.startsWith('$')))
    ) {
      return origMethod;
    }
    
    // For models, return a proxy that catches database failures and falls back to mock
    return new Proxy(origMethod, {
      get: (modelTarget, modelProp) => {
        const origModelMethod = modelTarget[modelProp];
        if (typeof origModelMethod !== 'function') {
          return origModelMethod;
        }
        return async function (...args) {
          try {
            return await origModelMethod.apply(modelTarget, args);
          } catch (err) {
            // Check if connection failure
            if (err.message.includes('Can\'t reach database') || err.message.includes('Authentication failed') || err.code === 'P1001' || err.code === 'P1000') {
              console.warn(`⚠️ Database connection failed. Falling back to in-memory mock for: prisma.${prop}.${modelProp}`);
              process.env.MOCK_DATABASE = 'true'; // Enable globally for subsequent calls
              return await mockPrisma[prop][modelProp].apply(mockPrisma[prop], args);
            }
            throw err;
          }
        };
      }
    });
  }
});
