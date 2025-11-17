import sanitizeHtml from 'sanitize-html';
import { z } from 'zod';

/**
 * Input validation and sanitization utilities.
 *
 * Provides comprehensive validation and sanitization to prevent:
 * - SQL injection
 * - XSS attacks
 * - Data corruption
 * - DoS via oversized inputs
 *
 * Following Constitutional Article III: Security Standards
 */

/**
 * Sanitize HTML content, stripping all tags and attributes.
 *
 * @param dirty - Potentially malicious HTML string
 * @returns Sanitized plain text
 */
export function sanitizeHtmlInput(dirty: string): string {
  return sanitizeHtml(dirty, {
    allowedTags: [], // Strip all HTML tags
    allowedAttributes: {}, // Strip all attributes
    disallowedTagsMode: 'discard', // Remove disallowed tags entirely
  });
}

/**
 * Sanitize HTML with basic formatting allowed (for rich text fields).
 *
 * @param dirty - HTML string with potential formatting
 * @returns Sanitized HTML with safe formatting only
 */
export function sanitizeRichText(dirty: string): string {
  return sanitizeHtml(dirty, {
    allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
    allowedAttributes: {}, // No attributes allowed
    disallowedTagsMode: 'discard',
  });
}

/**
 * Validation schemas for common field types.
 * Prevents injection attacks and ensures data integrity.
 */

/**
 * Safe string schema with length limits and HTML sanitization.
 *
 * @param minLength - Minimum length (default: 1)
 * @param maxLength - Maximum length (default: 500)
 * @param allowEmpty - Allow empty strings (default: false)
 */
export const safeString = (
  minLength = 1,
  maxLength = 500,
  allowEmpty = false
) => {
  let schema = z.string()
    .max(maxLength, `Must be ${maxLength} characters or less`);

  if (!allowEmpty) {
    schema = schema.min(minLength, `Must be at least ${minLength} character(s)`);
  }

  return schema.transform((val) => sanitizeHtmlInput(val));
};

/**
 * Safe text schema for longer content (descriptions, notes).
 */
export const safeText = (maxLength = 5000) =>
  z.string()
    .max(maxLength, `Must be ${maxLength} characters or less`)
    .transform((val) => sanitizeHtmlInput(val))
    .optional();

/**
 * Rich text schema with safe HTML formatting allowed.
 */
export const safeRichText = (maxLength = 10000) =>
  z.string()
    .max(maxLength, `Must be ${maxLength} characters or less`)
    .transform((val) => sanitizeRichText(val))
    .optional();

/**
 * Email schema with format validation.
 */
export const safeEmail = z.string()
  .email('Invalid email format')
  .max(254, 'Email must be 254 characters or less') // RFC 5321
  .toLowerCase()
  .transform((val) => sanitizeHtmlInput(val));

/**
 * UUID schema with format validation.
 */
export const safeUuid = z.string()
  .uuid('Invalid UUID format');

/**
 * URL schema with protocol validation.
 * Rejects dangerous protocols like javascript:, data:, vbscript:
 */
export const safeUrl = z.string()
  .url('Invalid URL format')
  .max(2000, 'URL must be 2000 characters or less')
  .refine(
    (url) => {
      const dangerousProtocols = ['javascript:', 'data:', 'vbscript:'];
      const lowerUrl = url.toLowerCase();
      return !dangerousProtocols.some((proto) => lowerUrl.startsWith(proto));
    },
    { message: 'Dangerous URL protocol detected' }
  );

/**
 * Integer schema with range validation.
 */
export const safeInteger = (min = 0, max = Number.MAX_SAFE_INTEGER) =>
  z.number()
    .int('Must be an integer')
    .min(min, `Must be at least ${min}`)
    .max(max, `Must be at most ${max}`);

/**
 * Array schema with size limits.
 */
export const safeArray = <T extends z.ZodTypeAny>(
  itemSchema: T,
  maxItems = 100
) =>
  z.array(itemSchema)
    .max(maxItems, `Cannot exceed ${maxItems} items`);

/**
 * Tag array schema - for task tags, labels, etc.
 */
export const safeTags = safeArray(
  safeString(1, 50),
  20 // Max 20 tags
);

/**
 * Date schema with range validation.
 */
export const safeDate = z.coerce.date();

/**
 * Safe datetime string schema.
 */
export const safeDateTimeString = z.string()
  .datetime('Invalid datetime format');

/**
 * Validation error formatter.
 * Converts Zod errors to user-friendly messages.
 */
export function formatValidationError(error: z.ZodError): string {
  const messages = error.errors.map((err) => {
    const field = err.path.join('.');
    return `${field}: ${err.message}`;
  });

  return messages.join('; ');
}

/**
 * Test if input contains potential XSS patterns.
 * Used for additional security checks.
 */
export function containsSuspiciousPatterns(input: string): boolean {
  const xssPatterns = [
    /<script/i,
    /javascript:/i,
    /onerror=/i,
    /onclick=/i,
    /onload=/i,
    /<iframe/i,
    /eval\(/i,
  ];

  return xssPatterns.some((pattern) => pattern.test(input));
}

/**
 * Example usage in router:
 *
 * ```typescript
 * const taskCreateSchema = z.object({
 *   title: safeString(1, 200),
 *   description: safeText(5000),
 *   priority: z.nativeEnum(Priority),
 *   tags: safeTags,
 *   estimatedMinutes: safeInteger(0, 1440), // Max 24 hours
 * });
 * ```
 */
