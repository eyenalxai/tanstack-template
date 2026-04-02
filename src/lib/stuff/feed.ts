import { z } from "zod"

import { stuffDescriptionSchema } from "@/lib/stuff/forms"

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
