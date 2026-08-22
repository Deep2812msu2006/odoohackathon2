import { z } from 'zod';

export const addActivitySchema = z.object({
  body: z.object({
    activityId: z.string().uuid('Invalid activity ID'),
    scheduledDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid scheduled date' }),
    scheduledTime: z.string().optional(),
    customCost: z.number().min(0, 'Cost must be non-negative').optional(),
    orderIndex: z.number().int().optional(),
  }),
});

export const updateActivityLinkSchema = z.object({
  body: z.object({
    scheduledDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid scheduled date' }).optional(),
    scheduledTime: z.string().optional(),
    customCost: z.number().min(0, 'Cost must be non-negative').optional(),
    orderIndex: z.number().int().optional(),
  }),
});
