import { z } from 'zod'

export const orgSchema = z
  .object({
    orgName: z.string().min(1, 'Organization Name is required'),
    orgEmail: z.string().email('Invalid email'),
    orgType: z.string().min(1, 'Organization Type is required'),
    orgTypeOther: z.string().optional(),
    province: z.string().min(1, 'Province is required'),
    district: z.string().min(1, 'District is required'),
    adminName: z.string().min(1, 'Admin Full Name is required'),
    password: z.string().min(7, 'Password must be at least 7 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ['confirmPassword'],
  })

export const indSchema = z
  .object({
    fullName: z.string().min(1, 'Full Name is required'),
    email: z.string().email('Invalid email'),
    password: z.string().min(7, 'Password must be at least 7 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ['confirmPassword'],
  })
