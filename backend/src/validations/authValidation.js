const { z } = require('zod');

const email = z
  .string({ required_error: 'Please enter your email address.', invalid_type_error: 'Please enter your email address.' })
  .trim()
  .min(1, 'Please enter your email address.')
  .max(255, 'Email address is too long.')
  .email('Please enter a valid email address.')
  .transform((value) => value.toLowerCase());

/**
 * Password strength: 8–72 characters (bcrypt only uses the first 72 bytes) with at
 * least one uppercase letter, one lowercase letter, one number and one symbol.
 */
const strongPassword = z
  .string({ required_error: 'Please enter a password.', invalid_type_error: 'Please enter a password.' })
  .min(1, 'Please enter a password.')
  .min(8, 'Password must be at least 8 characters.')
  .max(72, 'Password must be at most 72 characters.')
  .regex(/[a-z]/, 'Password must contain a lowercase letter.')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter.')
  .regex(/[0-9]/, 'Password must contain a number.')
  .regex(/[^A-Za-z0-9]/, 'Password must contain a special character.');

const registerSchema = z
  .object({
    name: z
      .string({ required_error: 'Please enter your full name.', invalid_type_error: 'Please enter your full name.' })
      .trim()
      .min(1, 'Please enter your full name.')
      .min(2, 'Name must be at least 2 characters.')
      .max(100, 'Name must be at most 100 characters.'),
    email,
    password: strongPassword,
    confirmPassword: z
      .string({ required_error: 'Please confirm your password.', invalid_type_error: 'Please confirm your password.' })
      .min(1, 'Please confirm your password.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

const loginSchema = z.object({
  email,
  password: z
    .string({ required_error: 'Please enter your password.', invalid_type_error: 'Please enter your password.' })
    .min(1, 'Please enter your password.')
    .max(72, 'Invalid email or password.'),
  rememberMe: z.boolean().optional().default(false),
});

module.exports = { registerSchema, loginSchema };
