import { z } from "zod"

export const stuffDescriptionSchema = z
  .string()
  .trim()
  .min(1, "Description is required")
  .max(500, "Description must be 500 characters or less")

export const createStuffSchema = z.object({
  description: stuffDescriptionSchema,
})

export type CreateStuffInput = z.infer<typeof createStuffSchema>

export const stuffSchema = z.object({
  uuid: z.uuid("Invalid stuff id"),
  userId: z.string(),
  description: stuffDescriptionSchema,
  createdAt: z.date(),
})

export type Stuff = z.infer<typeof stuffSchema>

export const stuffAuthorSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
})

export const stuffWithAuthorSchema = stuffSchema.extend({
  user: stuffAuthorSchema.nullable(),
})

export const listStuffsOutputSchema = z.array(stuffWithAuthorSchema)
export type ListStuffsOutput = z.infer<typeof listStuffsOutputSchema>

export const updateStuffSchema = z.object({
  uuid: z.uuid("Invalid stuff id"),
  description: stuffDescriptionSchema,
})

export type UpdateStuffInput = z.infer<typeof updateStuffSchema>
