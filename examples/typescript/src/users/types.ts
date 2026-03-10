/**
 * Type definitions for user domain.
 * 
 * All types colocated with domain logic for context optimization.
 * 
 * @module users/types
 */

import { z } from 'zod';

// =============================================================================
// SCHEMAS (Runtime Validation)
// =============================================================================

export const UserSchema = z.object({
  id: z.number().int().positive(),
  email: z.string().email(),
  name: z.string().min(1).max(100),
  role: z.enum(['admin', 'user', 'guest']),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const CreateUserInputSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  role: z.enum(['admin', 'user', 'guest']).default('user'),
});

export const UpdateUserInputSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().min(1).max(100).optional(),
  role: z.enum(['admin', 'user', 'guest']).optional(),
});

// =============================================================================
// TYPES (Compile-Time)
// =============================================================================

export type User = z.infer<typeof UserSchema>;
export type CreateUserInput = z.infer<typeof CreateUserInputSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserInputSchema>;
export type UserRole = User['role'];
