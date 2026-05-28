/**
 * Unit tests for data formatting utilities
 * Verifies formatCurrency, formatPercent, formatDate, formatRelativeDate,
 * formatNumber, and getGreeting return correct values for various inputs.
 * @module formatters.test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  formatCurrency,
  formatPercent,
  formatNumber,
  formatDate,
  formatRelativeDate,
  getGreeting,
} from './formatters.js';

describe('formatters', () => {
  describe('formatCurrency', () => {
    it('formats a positive number as USD currency', () => {
      const result = formatCurrency(1234.56);
      expect(result).toBe('$1,234.56');
    });

    it('formats zero as currency', () => {
      const result = formatCurrency(0);
      expect(result).toBe('$0.00');
    });

    it('formats a negative number as currency', () => {
      const result = formatCurrency(-500.99);
      expect(result).toContain('500.99');
    });

    it('formats a large number with grouping separators', () => {
      const result = formatCurrency(1000000);
      expect(result).toBe('$1,000,000.00');
    });

    it('formats a small decimal value', () => {
      const result = formatCurrency(0.01);
      expect(result).toBe('$0.01');
    });

    it('rounds to two decimal places', () => {
      const result = formatCurrency(99.999);
      expect(result).toBe('$100.00');
    });

    it('returns "—" for null', () => {
      expect(formatCurrency(null)).toBe('—');
    });

    it('returns "—" for undefined', () => {
      expect(formatCurrency(undefined)).toBe('—');
    });

    it('returns "—" for NaN', () => {
      expect(formatCurrency(NaN)).toBe('—');
    });

    it('returns "—" for Infinity', () => {
      expect(formatCurrency(Infinity)).toBe('—');
    });

    it('returns "—" for negative Infinity', () => {
      expect(formatCurrency(-Infinity)).toBe('—');
    });

    it('formats with a custom currency code', () => {
      const result = formatCurrency(1234.56, 'EUR', 'en-US');
      expect(result).toContain('1,234.56');
    });

    it('formats with a custom locale', () => {
      const result = formatCurrency(1234.56, 'USD', 'en-US');
      expect(result).toBe('$1,234.56');
    });
  });

  describe('formatPercent', () => {
    it('formats a positive decimal as a percentage', () => {
      const result = formatPercent(0.1234);
      expect(result).toBe('12.34%');
    });

    it('formats zero as a percentage', () => {
      const result = formatPercent(0);
      expect(result).toBe('0.00%');
    });

    it('formats 1 (100%) as a percentage', () => {
      const result = formatPercent(1);
      expect(result).toBe('100.00%');
    });

    it('formats a negative decimal as a percentage', () => {
      const result = formatPercent(-0.05);
      expect(result).toContain('5.00%');
    });

    it('formats a small decimal as a percentage', () => {
      const result = formatPercent(0.001);
      expect(result).toBe('0.10%');
    });

    it('respects custom decimal places', () => {
      const result = formatPercent(0.12345, 3);
      expect(result).toBe('12.345%');
    });

    it('formats with zero decimal places', () => {
      const result = formatPercent(0.1267, 0);
      expect(result).toBe('13%');
    });

    it('returns "—" for null', () => {
      expect(formatPercent(null)).toBe('—');
    });

    it('returns "—" for undefined', () => {
      expect(formatPercent(undefined)).toBe('—');
    });

    it('returns "—" for NaN', () => {
      expect(formatPercent(NaN)).toBe('—');
    });

    it('returns "—" for Infinity', () => {
      expect(formatPercent(Infinity)).toBe('—');
    });
  });

  describe('formatNumber', () => {
    it('formats a number with default zero decimal places', () => {
      const result = formatNumber(1234);
      expect(result).toBe('1,234');
    });

    it('formats a number with specified decimal places', () => {
      const result = formatNumber(1234.5678, 2);
      expect(result).toBe('1,234.57');
    });

    it('formats zero', () => {
      const result = formatNumber(0);
      expect(result).toBe('0');
    });

    it('formats a negative number', () => {
      const result = formatNumber(-999.99, 2);
      expect(result).toContain('999.99');
    });

    it('formats a large number with grouping', () => {
      const result = formatNumber(1000000, 0);
      expect(result).toBe('1,000,000');
    });

    it('returns "—" for null', () => {
      expect(formatNumber(null)).toBe('—');
    });

    it('returns "—" for undefined', () => {
      expect(formatNumber(undefined)).toBe('—');
    });

    it('returns "—" for NaN', () => {
      expect(formatNumber(NaN)).toBe('—');
    });

    it('returns "—" for Infinity', () => {
      expect(formatNumber(Infinity)).toBe('—');
    });
  });

  describe('formatDate', () => {
    it('formats an ISO date string with default pattern', () => {
      const result = formatDate('2024-06-15');
      expect(result).toBe('Jun 15, 2024');
    });

    it('formats an ISO datetime string with default pattern', () => {
      const result = formatDate('2024-06-15T10:30:00.000Z');
      expect(result).toContain('Jun');
      expect(result).toContain('2024');
    });

    it('formats a date with a custom pattern', () => {
      const result = formatDate('2024-01-01', 'yyyy-MM-dd');
      expect(result).toBe('2024-01-01');
    });

    it('formats a date with time pattern', () => {
      const result = formatDate('2024-06-15T14:30:00.000Z', 'MMM d, yyyy');
      expect(result).toContain('Jun');
      expect(result).toContain('2024');
    });

    it('formats a Date object', () => {
      const date = new Date(2024, 0, 15); // Jan 15, 2024
      const result = formatDate(date);
      expect(result).toBe('Jan 15, 2024');
    });

    it('formats a timestamp number', () => {
      const timestamp = new Date(2024, 5, 15).getTime(); // Jun 15, 2024
      const result = formatDate(timestamp);
      expect(result).toBe('Jun 15, 2024');
    });

    it('returns "—" for null', () => {
      expect(formatDate(null)).toBe('—');
    });

    it('returns "—" for undefined', () => {
      expect(formatDate(undefined)).toBe('—');
    });

    it('returns "—" for an empty string', () => {
      expect(formatDate('')).toBe('—');
    });

    it('returns "—" for an invalid date string', () => {
      expect(formatDate('not-a-date')).toBe('—');
    });

    it('returns "—" for an invalid Date object', () => {
      expect(formatDate(new Date('invalid'))).toBe('—');
    });

    it('formats with MMMM d, yyyy pattern', () => {
      const result = formatDate('2024-03-10', 'MMMM d, yyyy');
      expect(result).toBe('March 10, 2024');
    });
  });

  describe('formatRelativeDate', () => {
    it('returns a relative time string for a recent date', () => {
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      const result = formatRelativeDate(fiveMinutesAgo.toISOString());
      expect(result).toContain('minutes ago');
    });

    it('returns a relative time string for a date hours ago', () => {
      const now = new Date();
      const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);
      const result = formatRelativeDate(threeHoursAgo.toISOString());
      expect(result).toContain('hours ago');
    });

    it('returns a relative time string with suffix by default', () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const result = formatRelativeDate(oneHourAgo.toISOString());
      expect(result).toContain('ago');
    });

    it('returns a relative time string without suffix when addSuffix is false', () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const result = formatRelativeDate(oneHourAgo.toISOString(), false);
      expect(result).not.toContain('ago');
    });

    it('handles a Date object input', () => {
      const now = new Date();
      const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
      const result = formatRelativeDate(tenMinutesAgo);
      expect(result).toContain('minutes ago');
    });

    it('handles a timestamp number input', () => {
      const now = Date.now();
      const twentyMinutesAgo = now - 20 * 60 * 1000;
      const result = formatRelativeDate(twentyMinutesAgo);
      expect(result).toContain('minutes ago');
    });

    it('returns "—" for null', () => {
      expect(formatRelativeDate(null)).toBe('—');
    });

    it('returns "—" for undefined', () => {
      expect(formatRelativeDate(undefined)).toBe('—');
    });

    it('returns "—" for an empty string', () => {
      expect(formatRelativeDate('')).toBe('—');
    });

    it('returns "—" for an invalid date string', () => {
      expect(formatRelativeDate('not-a-date')).toBe('—');
    });
  });

  describe('getGreeting', () => {
    let dateSpy;

    afterEach(() => {
      if (dateSpy) {
        dateSpy.mockRestore();
        dateSpy = null;
      }
    });

    it('returns "Good morning" between 5:00 AM and 11:59 AM', () => {
      const mockDate = new Date(2024, 5, 15, 8, 0, 0); // 8:00 AM
      dateSpy = vi.spyOn(global, 'Date').mockImplementation((...args) => {
        if (args.length === 0) {
          return mockDate;
        }
        return new (Function.prototype.bind.apply(
          Date.__proto__.constructor === Function ? globalThis.Date : Date,
          [null, ...args],
        ))();
      });
      // Restore the real Date for internal use but mock new Date()
      dateSpy.mockRestore();
      dateSpy = null;

      // Use a different approach: mock getHours
      const realDate = Date;
      const mockNow = new realDate(2024, 5, 15, 8, 0, 0);
      vi.useFakeTimers();
      vi.setSystemTime(mockNow);

      const result = getGreeting('Jane');
      expect(result).toBe('Good morning, Jane');

      vi.useRealTimers();
    });

    it('returns "Good afternoon" between 12:00 PM and 4:59 PM', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2024, 5, 15, 14, 0, 0)); // 2:00 PM

      const result = getGreeting('Jane');
      expect(result).toBe('Good afternoon, Jane');

      vi.useRealTimers();
    });

    it('returns "Good evening" between 5:00 PM and 8:59 PM', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2024, 5, 15, 19, 0, 0)); // 7:00 PM

      const result = getGreeting('Jane');
      expect(result).toBe('Good evening, Jane');

      vi.useRealTimers();
    });

    it('returns "Good night" between 9:00 PM and 4:59 AM', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2024, 5, 15, 23, 0, 0)); // 11:00 PM

      const result = getGreeting('Jane');
      expect(result).toBe('Good night, Jane');

      vi.useRealTimers();
    });

    it('returns "Good night" at 3:00 AM', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2024, 5, 15, 3, 0, 0)); // 3:00 AM

      const result = getGreeting();
      expect(result).toBe('Good night');

      vi.useRealTimers();
    });

    it('returns "Good morning" at exactly 5:00 AM', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2024, 5, 15, 5, 0, 0));

      const result = getGreeting();
      expect(result).toBe('Good morning');

      vi.useRealTimers();
    });

    it('returns "Good afternoon" at exactly 12:00 PM', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2024, 5, 15, 12, 0, 0));

      const result = getGreeting();
      expect(result).toBe('Good afternoon');

      vi.useRealTimers();
    });

    it('returns "Good evening" at exactly 5:00 PM', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2024, 5, 15, 17, 0, 0));

      const result = getGreeting();
      expect(result).toBe('Good evening');

      vi.useRealTimers();
    });

    it('returns "Good night" at exactly 9:00 PM', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2024, 5, 15, 21, 0, 0));

      const result = getGreeting();
      expect(result).toBe('Good night');

      vi.useRealTimers();
    });

    it('returns greeting without name when name is not provided', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2024, 5, 15, 10, 0, 0));

      const result = getGreeting();
      expect(result).toBe('Good morning');

      vi.useRealTimers();
    });

    it('returns greeting without name when name is null', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2024, 5, 15, 10, 0, 0));

      const result = getGreeting(null);
      expect(result).toBe('Good morning');

      vi.useRealTimers();
    });

    it('returns greeting without name when name is undefined', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2024, 5, 15, 10, 0, 0));

      const result = getGreeting(undefined);
      expect(result).toBe('Good morning');

      vi.useRealTimers();
    });

    it('returns greeting without name when name is an empty string', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2024, 5, 15, 10, 0, 0));

      const result = getGreeting('');
      expect(result).toBe('Good morning');

      vi.useRealTimers();
    });

    it('returns greeting without name when name is whitespace only', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2024, 5, 15, 10, 0, 0));

      const result = getGreeting('   ');
      expect(result).toBe('Good morning');

      vi.useRealTimers();
    });

    it('trims the name in the greeting', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2024, 5, 15, 10, 0, 0));

      const result = getGreeting('  Jane  ');
      expect(result).toBe('Good morning, Jane');

      vi.useRealTimers();
    });

    it('returns greeting without name when name is a non-string value', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2024, 5, 15, 10, 0, 0));

      const result = getGreeting(123);
      expect(result).toBe('Good morning');

      vi.useRealTimers();
    });

    it('returns "Good morning" at 11:59 AM (boundary)', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2024, 5, 15, 11, 59, 59));

      const result = getGreeting();
      expect(result).toBe('Good morning');

      vi.useRealTimers();
    });

    it('returns "Good afternoon" at 4:59 PM (boundary)', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2024, 5, 15, 16, 59, 59));

      const result = getGreeting();
      expect(result).toBe('Good afternoon');

      vi.useRealTimers();
    });

    it('returns "Good evening" at 8:59 PM (boundary)', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2024, 5, 15, 20, 59, 59));

      const result = getGreeting();
      expect(result).toBe('Good evening');

      vi.useRealTimers();
    });

    it('returns "Good night" at midnight (0:00)', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2024, 5, 15, 0, 0, 0));

      const result = getGreeting();
      expect(result).toBe('Good night');

      vi.useRealTimers();
    });

    it('returns "Good night" at 4:59 AM (boundary)', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2024, 5, 15, 4, 59, 59));

      const result = getGreeting();
      expect(result).toBe('Good night');

      vi.useRealTimers();
    });
  });
});