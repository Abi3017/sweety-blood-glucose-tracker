import { z } from 'zod';

const email = z
  .string()
  .trim()
  .min(1, 'Please enter your email address.')
  .email('Please enter a valid email address.');

export const PASSWORD_RULES = [
  { test: (v) => v.length >= 8, label: 'At least 8 characters' },
  { test: (v) => /[A-Z]/.test(v), label: 'One uppercase letter' },
  { test: (v) => /[a-z]/.test(v), label: 'One lowercase letter' },
  { test: (v) => /[0-9]/.test(v), label: 'One number' },
  { test: (v) => /[^A-Za-z0-9]/.test(v), label: 'One special character' },
];

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Please enter your password.'),
  rememberMe: z.boolean().optional(),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Please enter your full name.')
      .min(2, 'Name must be at least 2 characters.')
      .max(100, 'Name must be at most 100 characters.'),
    email,
    password: z
      .string()
      .min(1, 'Please enter a password.')
      .min(8, 'Password must be at least 8 characters.')
      .max(72, 'Password must be at most 72 characters.')
      .regex(/[a-z]/, 'Password must contain a lowercase letter.')
      .regex(/[A-Z]/, 'Password must contain an uppercase letter.')
      .regex(/[0-9]/, 'Password must contain a number.')
      .regex(/[^A-Za-z0-9]/, 'Password must contain a special character.'),
    confirmPassword: z.string().min(1, 'Please confirm your password.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });
