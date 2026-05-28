/**
 * General-purpose helper functions
 * @module helpers
 */

import { SKELETON_DELAY_MIN, SKELETON_DELAY_MAX } from './constants.js';

/**
 * Generates a UUID-like identifier string.
 * Uses crypto.randomUUID when available, otherwise falls back to a manual
 * v4-style implementation.
 *
 * @returns {string} A UUID-like string (e.g., "550e8400-e29b-41d4-a716-446655440000")
 */
export function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  // Fallback v4-style UUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Generates an array of 7 data points representing a sparkline trend.
 * Each point contains a `day` index (1–7) and a random `value` that trends
 * around the provided base value with some variance.
 *
 * @param {number} [baseValue=1000] - The central value around which data points fluctuate
 * @param {number} [variance=0.05] - Maximum percentage deviation from the base (0.05 = ±5%)
 * @returns {Array<{day: number, value: number}>} Array of 7 sparkline data points
 */
export function generateSparklineData(baseValue = 1000, variance = 0.05) {
  const data = [];
  let current = baseValue;

  for (let day = 1; day <= 7; day++) {
    const change = current * variance * (Math.random() * 2 - 1);
    current = current + change;
    data.push({
      day,
      value: Math.round(current * 100) / 100,
    });
  }

  return data;
}

/**
 * Calculates the gain or loss between a current value and a cost basis.
 *
 * @param {number} currentValue - The current market value
 * @param {number} costBasis - The original cost / purchase price
 * @returns {{ amount: number, percentage: number, isGain: boolean }} The gain/loss details
 */
export function calculateGainLoss(currentValue, costBasis) {
  if (
    !Number.isFinite(currentValue) ||
    !Number.isFinite(costBasis) ||
    costBasis === 0
  ) {
    return { amount: 0, percentage: 0, isGain: false };
  }

  const amount = currentValue - costBasis;
  const percentage = amount / Math.abs(costBasis);
  const isGain = amount >= 0;

  return {
    amount: Math.round(amount * 100) / 100,
    percentage: Math.round(percentage * 10000) / 10000,
    isGain,
  };
}

/**
 * Calculates the total portfolio value from an array of accounts.
 * Each account is expected to have a numeric `balance` property.
 *
 * @param {Array<{balance: number}>} accounts - Array of account objects
 * @returns {number} The sum of all account balances
 */
export function calculatePortfolioValue(accounts) {
  if (!Array.isArray(accounts) || accounts.length === 0) {
    return 0;
  }

  return accounts.reduce((total, account) => {
    const balance = Number(account.balance);
    return total + (Number.isFinite(balance) ? balance : 0);
  }, 0);
}

/**
 * Sums the share percentages of an array of beneficiaries.
 *
 * @param {Array<{share: number}>} beneficiaries - Array of beneficiary objects with a `share` property
 * @returns {number} The total share percentage (e.g., 100 for fully allocated)
 */
export function sumBeneficiaryShares(beneficiaries) {
  if (!Array.isArray(beneficiaries) || beneficiaries.length === 0) {
    return 0;
  }

  return beneficiaries.reduce((total, beneficiary) => {
    const share = Number(beneficiary.share);
    return total + (Number.isFinite(share) ? share : 0);
  }, 0);
}

/**
 * Creates a debounced version of a function that delays invocation until
 * after `delay` milliseconds have elapsed since the last call.
 *
 * @param {Function} fn - The function to debounce
 * @param {number} [delay=300] - The debounce delay in milliseconds
 * @returns {Function} The debounced function (with a `.cancel()` method)
 */
export function debounce(fn, delay = 300) {
  let timerId = null;

  const debounced = (...args) => {
    if (timerId !== null) {
      clearTimeout(timerId);
    }
    timerId = setTimeout(() => {
      fn(...args);
      timerId = null;
    }, delay);
  };

  /**
   * Cancels any pending debounced invocation.
   */
  debounced.cancel = () => {
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }
  };

  return debounced;
}

/**
 * Merges CSS class names, filtering out falsy values.
 * A lightweight alternative to clsx / classnames.
 *
 * @param {...(string | boolean | null | undefined)} classes - Class names or falsy values
 * @returns {string} The merged class string
 *
 * @example
 * classNames('px-4', isActive && 'bg-indigo-500', undefined, 'text-white');
 * // => "px-4 bg-indigo-500 text-white"
 */
export function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

/**
 * Returns a promise that resolves after a random delay between
 * SKELETON_DELAY_MIN and SKELETON_DELAY_MAX milliseconds.
 * Useful for simulating network latency in mock data scenarios.
 *
 * @param {number} [min=SKELETON_DELAY_MIN] - Minimum delay in milliseconds
 * @param {number} [max=SKELETON_DELAY_MAX] - Maximum delay in milliseconds
 * @returns {Promise<void>} A promise that resolves after the random delay
 */
export function simulateDelay(min = SKELETON_DELAY_MIN, max = SKELETON_DELAY_MAX) {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
}