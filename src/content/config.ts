import { defineCollection, z } from "astro:content";

const baseSchema = z.object({
    title: z.string(),
    description: z.string().optional(),
    pubDate: z.coerce.date().optional(),
    image: z.string().optional(),
    badge: z.string().optional(),
    draft: z.boolean().default(false),
    categories: z.array(z.string()).optional().default([]),
    tags: z.array(z.string()).optional().default([]),
});

const blogCollection = defineCollection({
    type: "content",
    schema: baseSchema,
});

const notesCollection = defineCollection({
    type: "content",
    schema: baseSchema.extend({
        image: z.string().default('/image/notes-atelier.avif'),
    }),
});

export const collections = {
    blog: blogCollection,
    notes: notesCollection,
};