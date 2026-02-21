import { z } from "zod";

export const createSpaceSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  address: z.string().min(5),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().min(4),

  latitude: z.number().refine(val => val >= -90 && val <= 90),
  longitude: z.number().refine(val => val >= -180 && val <= 180),

  pricePerHour: z.number().positive(),
  totalSlots: z.number().int().positive(),
});