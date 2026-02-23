import { z } from "zod";

const EdgeConnectionSchema = z.object({
  id: z.string(),
  question: z.string(),
  detail: z.string().optional(),
  zone: z.string().optional(),
});

export const NodeFrontmatterSchema = z.object({
  id: z.string(),
  title: z.string(),
  zone: z.string(),
  edges: z.object({
    to: z.array(EdgeConnectionSchema).optional().default([]),
  }).optional().default({ to: [] }),
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  tags: z.array(z.string()),
  category: z.enum(["concept", "tool", "practice", "principle"]),
  milestones: z.array(z.string()),
});

const ZoneSchema = z.object({
  id: z.string(),
  title: z.string(),
  coreQuestion: z.string(),
  description: z.string(),
  color: z.string(),
  position: z.object({ x: z.number(), y: z.number() }),
  active: z.boolean(),
});

const ZoneEdgeSchema = z.object({
  from: z.string(),
  to: z.string(),
});

export const ZonesConfigSchema = z.object({
  zones: z.array(ZoneSchema),
  zoneEdges: z.array(ZoneEdgeSchema),
});

export type ValidatedNodeFrontmatter = z.infer<typeof NodeFrontmatterSchema>;
export type ValidatedZonesConfig = z.infer<typeof ZonesConfigSchema>;
