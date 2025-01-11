import { z } from 'zod'

export const schemaSettings = (updateNow: boolean) =>
  z.object({
    currentPassword: z.string().min(1, { message: 'Required' }).optional(),
    newPassword: z
      .string()
      .min(1)
      .min(8)
      .max(20)
      .refine((data) => {
        const invalidPassword = /^([a-z]*|[A-Z]*|[0-9]*|[^a-zA-Z0-9]*)$/
        return !invalidPassword.test(data)
      })
      .optional(),
    confirmPassword: z.string().optional(),
    realName: z
      .string()
      .regex(/^[a-zA-Z\s]+$/, { message: 'Only English Allowed' })
      .optional(),
    studentId: updateNow
      ? z.string().regex(/^\d{10}$/, { message: 'Only 10 numbers' })
      : z.string().optional()
  })
