import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const writing = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/writing' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    category: z.enum(['Blog', 'Research', 'Pattern', 'Architecture', 'Strategy', 'Consulting']),
    tags: z.array(z.string()).default([]),
    cover: z.string().optional(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

const timeline = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/timeline' }),
  schema: z.object({
    order: z.number(),
    year: z.string(),
    range: z.string(),
    title: z.string(),
    org: z.string(),
    location: z.string(),
    summary: z.string(),
    highlights: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
  }),
});

const competencies = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/competencies' }),
  schema: z.object({
    order: z.number(),
    area: z.string(),
    scope: z.string(),
  }),
});

const education = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/education' }),
  schema: z.object({
    order: z.number(),
    period: z.string(),
    program: z.string(),
    school: z.string(),
  }),
});

const offerings = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/offerings' }),
  schema: z.object({
    order: z.number(),
    title: z.string(),
    detail: z.string(),
  }),
});

export const collections = { writing, timeline, competencies, education, offerings };

