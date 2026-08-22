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
