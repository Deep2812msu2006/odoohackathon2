import { z } from 'zod';

export const createTripSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Trip name must be at least 2 characters'),
    description: z.string().optional(),
    startDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid start date' }),
    endDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid end date' }),
    coverPhotoUrl: z.string().optional(),
    isPublic: z.boolean().optional(),
  }).refine((data) => new Date(data.startDate) <= new Date(data.endDate), {
    message: 'Departure date cannot be before arrival date',
    path: ['endDate'],
  }),
});

export const updateTripSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Trip name must be at least 2 characters').optional(),
    description: z.string().optional(),
    startDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid start date' }).optional(),
    endDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid end date' }).optional(),
    coverPhotoUrl: z.string().optional(),
    isPublic: z.boolean().optional(),
  }),
});

export const publishTripSchema = z.object({
  body: z.object({
    isPublic: z.boolean(),
  }),
});

export const aiGenerateTripSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Trip name must be at least 2 characters').optional(),
    cityIds: z.array(z.string().uuid('Invalid City UUID')).min(1, 'At least 1 city is required'),
    startDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid start date' }).optional(),
    durationDays: z.number().int().min(1).max(30).default(7),
    totalBudget: z.number().positive().optional().default(1500),
    preferredCategories: z.array(z.string()).optional(),
    pace: z.enum(['relaxed', 'balanced', 'packed']).optional().default('balanced'),
  }),
});
