import { z } from "zod";

export const createServerGroupSchema = z.object({
  name: z.string().min(2, "Group name must be at least 2 characters"),
  description: z.string().optional(),
  serverCount: z.number().int().nonnegative().optional(),
});

export const updateServerGroupSchema = createServerGroupSchema.partial();
