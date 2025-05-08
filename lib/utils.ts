import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { ZodSchema } from 'zod';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Performs data validation against a Zod schema and returns typed results.
 *
 * @param schema - Zod schema definition used for validation rules
 * @param data - Input payload to be validated
 * @param context - Optional identifier for error tracing (helps with debugging)
 * @returns Validated and type-safe data object
 * @throws {Error} When validation constraints are not satisfied
 */
export function validateWithSchema<T>(schema: ZodSchema<T>, data: unknown, context?: string): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errorContext = context ? `[${context}] ` : '';

    throw new Error(`${errorContext}Zod validation failed: ${result.error.errors.map(e => e.message).join('; ')}`);
  }

  return result.data;
}
