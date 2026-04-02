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

export const updateStuffSchema = z.object({
  uuid: z.uuid("Invalid stuff id"),
  description: stuffDescriptionSchema,
})

export type UpdateStuffInput = z.infer<typeof updateStuffSchema>
