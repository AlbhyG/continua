import { z } from 'zod'

export const signupSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .transform((e) => e.trim().toLowerCase()),
})

export type SignupInput = z.infer<typeof signupSchema>
