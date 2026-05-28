/**
 * Data formatting utilities for currency, percentages, dates, and numbers
 * @module formatters
 */

import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';
import { DEFAULT_CURRENCY, DEFAULT_LOCALE } from './constants.js';

/**
 * Formats a numeric value as a currency string.
 *
 * @param {number} value - The numeric value to format
 * @param {string} [currency=DEFAULT_CURRENCY] - ISO 4217 currency code (e.g., 'USD', 'EUR')
 * @param {string} [locale=DEFAULT_LOCALE] - BCP 47 locale string (e.g., 'en-US')
 * @returns {string} The formatted currency string, or '—' if the value is not a finite number
 */
export function formatCurrency(value, currency = DEFAULT_CURRENCY, locale = DEFAULT_LOCALE) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return '—';
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch (error) {
    console.error('[formatters] Failed to format currency value.', error);
    return '—';
  }
}

/**
 * Formats a numeric value as a percentage string.
 *
 * @param {number} value - The numeric value to format (e.g., 0.1234 for 12.34%)
 * @param {number} [decimalPlaces=2] - Number of decimal places to display
 * @param {string} [locale=DEFAULT_LOCALE] - BCP 47 locale string
 * @returns {string} The formatted percentage string, or '—' if the value is not a finite number
 */
export function formatPercent(value, decimalPlaces = 2, locale = DEFAULT_LOCALE) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return '—';
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    }).format(value);
  } catch (error) {
    console.error('[formatters] Failed to format percentage value.', error);
    return '—';
  }
}

/**
 * Formats a number with locale-aware grouping and decimal separators.
 *
 * @param {number} value - The numeric value to format
 * @param {number} [decimalPlaces=0] - Number of decimal places to display
 * @param {string} [locale=DEFAULT_LOCALE] - BCP 47 locale string
 * @returns {string} The formatted number string, or '—' if the value is not a finite number
 */
export function formatNumber(value, decimalPlaces = 0, locale = DEFAULT_LOCALE) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return '—';
  }

  try {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    }).format(value);
  } catch (error) {
    console.error('[formatters] Failed to format number value.', error);
    return '—';
  }
}

/**
 * Parses a date input into a valid Date object.
 *
 * @param {string | number | Date} dateInput - The date to parse
 * @returns {Date | null} A valid Date object, or null if parsing fails
 */
function parseDate(dateInput) {
  if (!dateInput) {
    return null;
  }

  if (dateInput instanceof Date) {
    return isValid(dateInput) ? dateInput : null;
  }

  if (typeof dateInput === 'string') {
    const parsed = parseISO(dateInput);
    return isValid(parsed) ? parsed : null;
  }

  if (typeof dateInput === 'number') {
    const date = new Date(dateInput);
    return isValid(date) ? date : null;
  }

  return null;
}

/**
 * Formats a date value using a date-fns format pattern.
 *
 * @param {string | number | Date} dateInput - The date to format (ISO string, timestamp, or Date)
 * @param {string} [pattern='MMM d, yyyy'] - A date-fns format pattern
 * @returns {string} The formatted date string, or '—' if the date is invalid
 */
export function formatDate(dateInput, pattern = 'MMM d, yyyy') {
  const date = parseDate(dateInput);
  if (!date) {
    return '—';
  }

  try {
    return format(date, pattern);
  } catch (error) {
    console.error('[formatters] Failed to format date.', error);
    return '—';
  }
}

/**
 * Formats a date as a human-readable relative time string (e.g., "3 hours ago").
 *
 * @param {string | number | Date} dateInput - The date to format (ISO string, timestamp, or Date)
 * @param {boolean} [addSuffix=true] - Whether to add a suffix like "ago" or "in"
 * @returns {string} The relative time string, or '—' if the date is invalid
 */
export function formatRelativeDate(dateInput, addSuffix = true) {
  const date = parseDate(dateInput);
  if (!date) {
    return '—';
  }

  try {
    return formatDistanceToNow(date, { addSuffix });
  } catch (error) {
    console.error('[formatters] Failed to format relative date.', error);
    return '—';
  }
}

/**
 * Returns a time-based greeting message.
 *
 * - 5:00 AM – 11:59 AM → "Good morning"
 * - 12:00 PM – 4:59 PM → "Good afternoon"
 * - 5:00 PM – 8:59 PM → "Good evening"
 * - 9:00 PM – 4:59 AM → "Good night"
 *
 * @param {string} [name] - Optional name to include in the greeting
 * @returns {string} The greeting message
 */
export function getGreeting(name) {
  const hour = new Date().getHours();
  let greeting;

  if (hour >= 5 && hour < 12) {
    greeting = 'Good morning';
  } else if (hour >= 12 && hour < 17) {
    greeting = 'Good afternoon';
  } else if (hour >= 17 && hour < 21) {
    greeting = 'Good evening';
  } else {
    greeting = 'Good night';
  }

  if (name && typeof name === 'string' && name.trim().length > 0) {
    return `${greeting}, ${name.trim()}`;
  }

  return greeting;
}