import { z } from 'zod';

export const CIConfig = z.object({
  workspaces: z.object({
    include: z.array(z.string()).optional(),
    exclude: z.array(z.string()).optional(),
  }).optional(),
  crates: z.object({
    include: z.array(z.string()).optional(),
    exclude: z.array(z.string()).optional(),
  }).optional(),
  tasks: z.record(z.string(), z.string()).optional()
});
export type TCIConfig = z.infer<typeof CIConfig>;
