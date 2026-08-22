import { z } from 'zod';

export const addStopSchema = z.object({
  body: z.object({
    cityId: z.string().uuid('Invalid city ID format'),
    arrivalDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid arrival date' }),
    departureDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid departure date' }),
    orderIndex: z.number().int().optional(),
    notes: z.string().optional(),
  }).refine((data) => new Date(data.arrivalDate) <= new Date(data.departureDate), {
    message: 'Departure date cannot be before arrival date',
    path: ['departureDate'],
  }),
});

export const updateStopSchema = z.object({
  body: z.object({
    arrivalDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid arrival date' }).optional(),
    departureDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid departure date' }).optional(),
    orderIndex: z.number().int().optional(),
    notes: z.string().optional(),
  }),
});

export const reorderStopsSchema = z.object({
  body: z.object({
    stops: z.array(
      z.object({
        id: z.string().uuid('Invalid stop ID'),
        orderIndex: z.number().int(),
      })
    ).min(1, 'Stops list cannot be empty'),
  }),
});
