import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email({ message: 'Enter a valid email address.' }),
  password: z.string().min(1, { message: 'Enter your password.' })
});

export type LoginPayload = z.infer<typeof loginSchema>;

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
}
