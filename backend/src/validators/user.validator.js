import { z } from 'zod';

export const updateUserSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    languagePreference: z.string().optional(),
    profilePhotoUrl: z.string().optional(),
  }),
});
