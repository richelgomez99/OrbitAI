import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
  sanitizeHtmlInput,
  sanitizeRichText,
  safeString,
  safeText,
  safeEmail,
  safeUuid,
  safeUrl,
  safeInteger,
  safeArray,
  safeTags,
  safeDate,
  containsSuspiciousPatterns,
  formatValidationError,
} from '../validation';

describe('HTML Sanitization', () => {
  describe('sanitizeHtmlInput', () => {
    it('should strip all HTML tags', () => {
      const dirty = '<script>alert("XSS")</script>Hello';
      const clean = sanitizeHtmlInput(dirty);
      expect(clean).toBe('Hello');
      expect(clean).not.toContain('<script>');
    });

    it('should remove event handlers', () => {
      const dirty = '<img src="x" onerror="alert(1)">';
      const clean = sanitizeHtmlInput(dirty);
      expect(clean).not.toContain('onerror');
      expect(clean).not.toContain('alert');
    });

    it('should handle nested tags', () => {
      const dirty = '<div><span><b>Text</b></span></div>';
      const clean = sanitizeHtmlInput(dirty);
      expect(clean).toBe('Text');
    });

    it('should preserve plain text', () => {
      const text = 'This is plain text';
      const clean = sanitizeHtmlInput(text);
      expect(clean).toBe(text);
    });
  });

  describe('sanitizeRichText', () => {
    it('should allow safe formatting tags', () => {
      const input = '<p><strong>Bold</strong> and <em>italic</em></p>';
      const clean = sanitizeRichText(input);
      expect(clean).toContain('<strong>');
      expect(clean).toContain('<em>');
    });

    it('should strip dangerous tags', () => {
      const input = '<p>Safe</p><script>alert("XSS")</script>';
      const clean = sanitizeRichText(input);
      expect(clean).toContain('Safe');
      expect(clean).not.toContain('<script>');
    });

    it('should strip all attributes', () => {
      const input = '<p class="danger" onclick="alert(1)">Text</p>';
      const clean = sanitizeRichText(input);
      expect(clean).not.toContain('class');
      expect(clean).not.toContain('onclick');
    });
  });
});

describe('Validation Schemas', () => {
  describe('safeString', () => {
    it('should accept valid strings', () => {
      const schema = safeString(1, 100);
      const result = schema.parse('Hello World');
      expect(result).toBe('Hello World');
    });

    it('should reject strings that are too long', () => {
      const schema = safeString(1, 10);
      expect(() => schema.parse('A'.repeat(11))).toThrow();
    });

    it('should reject strings that are too short', () => {
      const schema = safeString(5, 100);
      expect(() => schema.parse('Hi')).toThrow();
    });

    it('should sanitize HTML in strings', () => {
      const schema = safeString(1, 100);
      const result = schema.parse('<script>alert("XSS")</script>Test');
      expect(result).not.toContain('<script>');
      expect(result).toContain('Test');
    });

    it('should allow empty strings when configured', () => {
      const schema = safeString(0, 100, true);
      const result = schema.parse('');
      expect(result).toBe('');
    });
  });

  describe('safeEmail', () => {
    it('should accept valid email addresses', () => {
      const emails = [
        'test@example.com',
        'user.name@example.co.uk',
        'user+tag@example.com',
      ];

      emails.forEach((email) => {
        const result = safeEmail.parse(email);
        expect(result).toBe(email.toLowerCase());
      });
    });

    it('should reject invalid email formats', () => {
      const invalid = [
        'not-an-email',
        '@example.com',
        'user@',
        'user @example.com',
      ];

      invalid.forEach((email) => {
        expect(() => safeEmail.parse(email)).toThrow('Invalid email');
      });
    });

    it('should reject emails with HTML content', () => {
      // Email validation happens BEFORE sanitization
      // So malformed input with HTML is correctly rejected
      const dirty = '<script>alert(1)</script>test@example.com';
      expect(() => safeEmail.parse(dirty)).toThrow('Invalid email');
    });

    it('should convert to lowercase', () => {
      const result = safeEmail.parse('Test@Example.COM');
      expect(result).toBe('test@example.com');
    });
  });

  describe('safeUuid', () => {
    it('should accept valid UUIDs', () => {
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';
      const result = safeUuid.parse(validUuid);
      expect(result).toBe(validUuid);
    });

    it('should reject invalid UUIDs', () => {
      const invalid = [
        'not-a-uuid',
        '123456',
        'abc-def-ghi',
      ];

      invalid.forEach((uuid) => {
        expect(() => safeUuid.parse(uuid)).toThrow('Invalid UUID');
      });
    });
  });

  describe('safeUrl', () => {
    it('should accept valid URLs', () => {
      const urls = [
        'https://example.com',
        'http://localhost:3000',
        'https://example.com/path?query=value',
      ];

      urls.forEach((url) => {
        const result = safeUrl.parse(url);
        expect(result).toBe(url);
      });
    });

    it('should reject invalid URLs', () => {
      const invalid = [
        'not a url',
        'just-a-string',
        '/relative/path',
      ];

      invalid.forEach((url) => {
        expect(() => safeUrl.parse(url)).toThrow();
      });
    });

    it('should reject dangerous URL protocols', () => {
      // javascript: protocol should be rejected for security
      expect(() => safeUrl.parse('javascript:alert(1)')).toThrow();
    });
  });

  describe('safeInteger', () => {
    it('should accept valid integers in range', () => {
      const schema = safeInteger(0, 100);
      expect(schema.parse(50)).toBe(50);
      expect(schema.parse(0)).toBe(0);
      expect(schema.parse(100)).toBe(100);
    });

    it('should reject values below minimum', () => {
      const schema = safeInteger(10, 100);
      expect(() => schema.parse(5)).toThrow('at least 10');
    });

    it('should reject values above maximum', () => {
      const schema = safeInteger(0, 100);
      expect(() => schema.parse(101)).toThrow('at most 100');
    });

    it('should reject decimal numbers', () => {
      const schema = safeInteger(0, 100);
      expect(() => schema.parse(50.5)).toThrow('Must be an integer');
    });
  });

  describe('safeArray', () => {
    it('should accept arrays within size limit', () => {
      const schema = safeArray(z.string(), 10);
      const arr = ['a', 'b', 'c'];
      const result = schema.parse(arr);
      expect(result).toEqual(arr);
    });

    it('should reject arrays exceeding size limit', () => {
      const schema = safeArray(z.string(), 5);
      const arr = ['a', 'b', 'c', 'd', 'e', 'f'];
      expect(() => schema.parse(arr)).toThrow('Cannot exceed 5 items');
    });
  });

  describe('safeTags', () => {
    it('should accept valid tag arrays', () => {
      const tags = ['urgent', 'work', 'personal'];
      const result = safeTags.parse(tags);
      expect(result).toEqual(tags);
    });

    it('should reject tags that are too long', () => {
      const tags = ['a'.repeat(51)]; // Exceeds 50 char limit
      expect(() => safeTags.parse(tags)).toThrow();
    });

    it('should reject too many tags', () => {
      const tags = Array(21).fill('tag'); // Exceeds 20 tag limit
      expect(() => safeTags.parse(tags)).toThrow('Cannot exceed 20 items');
    });

    it('should sanitize HTML in tags', () => {
      const tags = ['<script>alert(1)</script>work'];
      const result = safeTags.parse(tags);
      expect(result[0]).not.toContain('<script>');
      expect(result[0]).toContain('work');
    });
  });
});

describe('Security Utilities', () => {
  describe('containsSuspiciousPatterns', () => {
    it('should detect script tags', () => {
      expect(containsSuspiciousPatterns('<script>alert(1)</script>')).toBe(true);
      expect(containsSuspiciousPatterns('<SCRIPT>alert(1)</SCRIPT>')).toBe(true);
    });

    it('should detect javascript: protocol', () => {
      expect(containsSuspiciousPatterns('javascript:alert(1)')).toBe(true);
      expect(containsSuspiciousPatterns('JAVASCRIPT:alert(1)')).toBe(true);
    });

    it('should detect event handlers', () => {
      expect(containsSuspiciousPatterns('onerror=alert(1)')).toBe(true);
      expect(containsSuspiciousPatterns('onclick=alert(1)')).toBe(true);
      expect(containsSuspiciousPatterns('onload=alert(1)')).toBe(true);
    });

    it('should detect iframe tags', () => {
      expect(containsSuspiciousPatterns('<iframe src="evil">')).toBe(true);
    });

    it('should detect eval', () => {
      expect(containsSuspiciousPatterns('eval(malicious_code)')).toBe(true);
    });

    it('should return false for safe content', () => {
      expect(containsSuspiciousPatterns('This is safe text')).toBe(false);
      expect(containsSuspiciousPatterns('Email: user@example.com')).toBe(false);
    });
  });

  describe('formatValidationError', () => {
    it('should format Zod errors into readable messages', () => {
      const schema = z.object({
        email: z.string().email(),
        age: z.number().min(18),
      });

      try {
        schema.parse({ email: 'invalid', age: 10 });
      } catch (error) {
        if (error instanceof z.ZodError) {
          const formatted = formatValidationError(error);
          expect(formatted).toContain('email');
          expect(formatted).toContain('age');
        }
      }
    });
  });
});

describe('XSS Prevention', () => {
  it('should prevent XSS via script injection', () => {
    const malicious = '<img src=x onerror=alert(1)>';
    const clean = sanitizeHtmlInput(malicious);
    expect(clean).not.toContain('onerror');
    expect(clean).not.toContain('alert');
  });

  it('should prevent XSS via event attributes', () => {
    const malicious = '<div onclick="alert(1)">Click me</div>';
    const clean = sanitizeHtmlInput(malicious);
    expect(clean).not.toContain('onclick');
    expect(clean).not.toContain('alert');
  });

  it('should prevent XSS via javascript: URLs', () => {
    const malicious = '<a href="javascript:alert(1)">Click</a>';
    const clean = sanitizeHtmlInput(malicious);
    expect(clean).not.toContain('javascript:');
  });

  it('should prevent XSS via SVG', () => {
    const malicious = '<svg onload=alert(1)>';
    const clean = sanitizeHtmlInput(malicious);
    expect(clean).not.toContain('onload');
  });
});
