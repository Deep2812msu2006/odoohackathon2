import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('GlobeTrotter REST API Integration Tests', () => {
  let authToken = '';
  let secondaryAuthToken = '';
  let createdTripId = '';
  let createdStopId = '';
  let publicSlug = '';
  let cityId = '';
  let activityId = '';

  const testEmail = `testuser_${Date.now()}@example.com`;
  const secondaryEmail = `secondary_${Date.now()}@example.com`;

  beforeAll(async () => {
    // 1. Register test user
    const res = await request(app).post('/api/auth/signup').send({
      name: 'Test Explorer',
      email: testEmail,
      password: 'Password123!',
    });
    expect(res.status).toBe(201);
    authToken = res.body.data.token;

    // 2. Register secondary test user for copy trip test
    const secRes = await request(app).post('/api/auth/signup').send({
      name: 'Secondary Explorer',
      email: secondaryEmail,
      password: 'Password123!',
    });
    expect(secRes.status).toBe(201);
    secondaryAuthToken = secRes.body.data.token;

    // 3. Fetch cities to get Paris cityId and an activityId
    const citiesRes = await request(app).get('/api/cities?search=Paris');
    expect(citiesRes.status).toBe(200);
    expect(citiesRes.body.data.cities.length).toBeGreaterThan(0);
    cityId = citiesRes.body.data.cities[0].id;

    const actsRes = await request(app).get(`/api/activities?cityId=${cityId}`);
    expect(actsRes.status).toBe(200);
    expect(actsRes.body.data.activities.length).toBeGreaterThan(0);
    activityId = actsRes.body.data.activities[0].id;
  });

  describe('Authentication Endpoints', () => {
    it('should reject duplicate signup email with 409 DUPLICATE_EMAIL', async () => {
      const res = await request(app).post('/api/auth/signup').send({
        name: 'Test Explorer',
        email: testEmail,
        password: 'Password123!',
      });
      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('DUPLICATE_EMAIL');
    });

    it('should login successfully with valid credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: testEmail,
        password: 'Password123!',
      });
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('token');
    });

    it('should reject login with wrong password', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: testEmail,
        password: 'WrongPassword!',
      });
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });
  });

  describe('Trip Management APIs', () => {
    it('should create a new trip', async () => {
      const res = await request(app)
        .post('/api/trips')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Summer Voyage in Paris',
          description: 'Exploring romantic streets and museums.',
          startDate: '2026-07-01',
          endDate: '2026-07-10',
          isPublic: true,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.trip).toHaveProperty('id');
      createdTripId = res.body.data.trip.id;
      publicSlug = res.body.data.trip.publicSlug;
    });

    it('should reject trip creation if end date is before start date', async () => {
      const res = await request(app)
        .post('/api/trips')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Invalid Trip',
          startDate: '2026-07-10',
          endDate: '2026-07-01',
        });
      expect(res.status).toBe(400);
    });

    it('should fetch user trips', async () => {
      const res = await request(app).get('/api/trips').set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.trips.length).toBeGreaterThan(0);
    });
  });

  describe('Itinerary Stop & Activity Business Rules', () => {
    it('should add a valid stop inside trip dates', async () => {
      const res = await request(app)
        .post(`/api/trips/${createdTripId}/stops`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          cityId,
          arrivalDate: '2026-07-02',
          departureDate: '2026-07-06',
          notes: 'Stay near Louvre.',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.stop).toHaveProperty('id');
      createdStopId = res.body.data.stop.id;
    });

    it('should reject stop addition if dates are outside overall trip dates', async () => {
      const res = await request(app)
        .post(`/api/trips/${createdTripId}/stops`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          cityId,
          arrivalDate: '2026-06-25', // Before trip start July 1
          departureDate: '2026-07-05',
        });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('STOP_DATES_OUT_OF_BOUNDS');
    });

    it('should add activity to stop when scheduled date is inside stop date range', async () => {
      const res = await request(app)
        .post(`/api/trips/${createdTripId}/stops/${createdStopId}/activities`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          activityId,
          scheduledDate: '2026-07-03',
          scheduledTime: '10:00',
          customCost: 40.0,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.activityLink).toHaveProperty('id');
    });
  });

  describe('Budget Engine API', () => {
    it('should calculate budget breakdown and spending totals', async () => {
      const res = await request(app)
        .get(`/api/trips/${createdTripId}/budget?targetDailyBudget=150`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.budget).toHaveProperty('categories');
      expect(res.body.data.budget.categories.activities).toBe(40.0);
    });
  });

  describe('Public Sharing & Transactional Copy Trip', () => {
    it('should allow fetching public trip by slug without auth', async () => {
      const res = await request(app).get(`/api/public/trips/${publicSlug}`);
      expect(res.status).toBe(200);
      expect(res.body.data.trip.name).toBe('Summer Voyage in Paris');
    });

    it('should transactionally copy public trip into secondary user account', async () => {
      const res = await request(app)
        .post(`/api/public/trips/${publicSlug}/copy`)
        .set('Authorization', `Bearer ${secondaryAuthToken}`);

      expect(res.status).toBe(201);
      expect(res.body.data.trip.name).toContain('Copy of Summer Voyage in Paris');
      expect(res.body.data.trip.stops.length).toBe(1);
    });
  });
});
