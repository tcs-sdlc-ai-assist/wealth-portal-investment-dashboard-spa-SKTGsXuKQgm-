/**
 * Activity data access hook with filter capabilities
 * Implements SCRUM-20323: Activity History with Filters and Empty State
 * @module useActivityStore
 */

import { useCallback, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { generateId } from '../utils/helpers.js';

/**
 * @typedef {'all' | 'deposit' | 'withdrawal' | 'transfer' | 'payment' | 'fee' | 'interest' | 'dividend' | 'refund'} ActivityTypeFilter
 */

/**
 * @typedef {Object} DateRange
 * @property {string|null} start - ISO date string for range start (inclusive)
 * @property {string|null} end - ISO date string for range end (inclusive)
 */

/**
 * @typedef {Object} ActivityFilters
 * @property {ActivityTypeFilter} type - Transaction type filter
 * @property {string} searchQuery - Search query for symbol or description
 * @property {DateRange} dateRange - Date range filter
 */

/**
 * @typedef {Object} ActivityStoreValue
 * @property {function(): Array<Object>} getActivity - Returns all activity for the current user
 * @property {function(Object): void} addActivity - Adds a new activity entry for the current user
 * @property {Array<Object>} activity - All activity (unfiltered)
 * @property {Array<Object>} filteredActivity - Activity after filters applied
 * @property {ActivityFilters} filters - Current filter state
 * @property {function(ActivityTypeFilter): void} setTypeFilter - Sets the transaction type filter
 * @property {function(string): void} setSearchQuery - Sets the search query
 * @property {function(DateRange): void} setDateRange - Sets the date range filter
 * @property {function(): void} resetFilters - Resets all filters to defaults
 * @property {Array<string>} availableTypes - Unique transaction types present in the activity data
 */

/**
 * Default filter state.
 *
 * @type {ActivityFilters}
 */
const DEFAULT_FILTERS = {
  type: 'all',
  searchQuery: '',
  dateRange: {
    start: null,
    end: null,
  },
};

/**
 * Filters activity entries by transaction type.
 *
 * @param {Array<Object>} activity - The activity array to filter
 * @param {ActivityTypeFilter} type - The transaction type to filter by
 * @returns {Array<Object>} Filtered activity entries
 */
function filterByType(activity, type) {
  if (!Array.isArray(activity) || activity.length === 0) {
    return [];
  }

  if (!type || type === 'all') {
    return activity;
  }

  return activity.filter((entry) => entry.type === type);
}

/**
 * Filters activity entries by search query matching against symbol or description.
 *
 * @param {Array<Object>} activity - The activity array to filter
 * @param {string} query - The search query
 * @returns {Array<Object>} Filtered activity entries
 */
function filterBySearch(activity, query) {
  if (!Array.isArray(activity) || activity.length === 0) {
    return [];
  }

  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return activity;
  }

  const normalised = query.trim().toLowerCase();

  return activity.filter((entry) => {
    const symbol = (entry.symbol || '').toLowerCase();
    const description = (entry.description || '').toLowerCase();
    return symbol.includes(normalised) || description.includes(normalised);
  });
}

/**
 * Filters activity entries by date range.
 *
 * @param {Array<Object>} activity - The activity array to filter
 * @param {DateRange} dateRange - The date range to filter by
 * @returns {Array<Object>} Filtered activity entries
 */
function filterByDateRange(activity, dateRange) {
  if (!Array.isArray(activity) || activity.length === 0) {
    return [];
  }

  if (!dateRange || (!dateRange.start && !dateRange.end)) {
    return activity;
  }

  const startDate = dateRange.start ? new Date(dateRange.start) : null;
  const endDate = dateRange.end ? new Date(dateRange.end) : null;

  // Validate parsed dates
  const validStart = startDate && !isNaN(startDate.getTime()) ? startDate : null;
  const validEnd = endDate && !isNaN(endDate.getTime()) ? endDate : null;

  if (!validStart && !validEnd) {
    return activity;
  }

  // If end date is provided, set it to end of day for inclusive comparison
  if (validEnd) {
    validEnd.setHours(23, 59, 59, 999);
  }

  return activity.filter((entry) => {
    if (!entry.date) {
      return false;
    }

    const entryDate = new Date(entry.date);
    if (isNaN(entryDate.getTime())) {
      return false;
    }

    if (validStart && entryDate < validStart) {
      return false;
    }

    if (validEnd && entryDate > validEnd) {
      return false;
    }

    return true;
  });
}

/**
 * Sorts activity entries by date in descending order (most recent first).
 *
 * @param {Array<Object>} activity - The activity array to sort
 * @returns {Array<Object>} A new sorted array
 */
function sortByDateDescending(activity) {
  if (!Array.isArray(activity) || activity.length === 0) {
    return [];
  }

  return [...activity].sort((a, b) => {
    const dateA = a.date ? new Date(a.date).getTime() : 0;
    const dateB = b.date ? new Date(b.date).getTime() : 0;
    return dateB - dateA;
  });
}

/**
 * Extracts unique transaction types from an activity array.
 *
 * @param {Array<Object>} activity - The activity array
 * @returns {Array<string>} Unique transaction type strings
 */
function extractUniqueTypes(activity) {
  if (!Array.isArray(activity) || activity.length === 0) {
    return [];
  }

  const types = new Set();
  for (const entry of activity) {
    if (entry.type && typeof entry.type === 'string') {
      types.add(entry.type);
    }
  }

  return Array.from(types).sort();
}

/**
 * Custom hook that provides activity data access, filtering,
 * and mutation for the current user.
 *
 * @returns {ActivityStoreValue} Activity store methods and state
 * @throws {Error} If used outside of an AuthProvider
 */
export function useActivityStore() {
  const { currentUser, updateUser } = useAuth();

  const [typeFilter, setTypeFilter] = useState(DEFAULT_FILTERS.type);
  const [searchQuery, setSearchQuery] = useState(DEFAULT_FILTERS.searchQuery);
  const [dateRange, setDateRange] = useState(DEFAULT_FILTERS.dateRange);

  /**
   * Returns all activity for the current user.
   *
   * @returns {Array<Object>} The user's activity array
   */
  const getActivity = useCallback(() => {
    if (!currentUser) {
      return [];
    }

    return Array.isArray(currentUser.activity) ? currentUser.activity : [];
  }, [currentUser]);

  /**
   * Adds a new activity entry for the current user.
   *
   * @param {Object} entry - The activity entry to add
   * @param {string} entry.date - ISO date string
   * @param {string} entry.type - Transaction type from TRANSACTION_TYPES
   * @param {string} entry.description - Human-readable description
   * @param {string} [entry.symbol] - Ticker symbol (if applicable)
   * @param {number} [entry.qty] - Number of shares (if applicable)
   * @param {number} [entry.price] - Price per share (if applicable)
   * @param {number} entry.amount - Total transaction amount
   * @param {string} [entry.accountId] - Related account id
   */
  const addActivity = useCallback(
    (entry) => {
      if (!currentUser || !entry || typeof entry !== 'object') {
        return;
      }

      const newEntry = {
        id: generateId(),
        date: entry.date || new Date().toISOString(),
        type: entry.type || 'payment',
        description: entry.description || '',
        symbol: entry.symbol || null,
        qty: entry.qty || null,
        price: entry.price || null,
        amount: Number.isFinite(entry.amount) ? entry.amount : 0,
        accountId: entry.accountId || null,
      };

      const currentActivity = Array.isArray(currentUser.activity) ? currentUser.activity : [];
      const updatedActivity = [newEntry, ...currentActivity];

      updateUser({ activity: updatedActivity });
    },
    [currentUser, updateUser],
  );

  /**
   * Resets all filters to their default values.
   */
  const resetFilters = useCallback(() => {
    setTypeFilter(DEFAULT_FILTERS.type);
    setSearchQuery(DEFAULT_FILTERS.searchQuery);
    setDateRange(DEFAULT_FILTERS.dateRange);
  }, []);

  /** All activity for the current user */
  const activity = useMemo(() => getActivity(), [getActivity]);

  /** Unique transaction types present in the activity data */
  const availableTypes = useMemo(() => extractUniqueTypes(activity), [activity]);

  /** Current filter state */
  const filters = useMemo(
    () => ({
      type: typeFilter,
      searchQuery,
      dateRange,
    }),
    [typeFilter, searchQuery, dateRange],
  );

  /** Activity after applying all filters and sorting by date descending */
  const filteredActivity = useMemo(() => {
    let result = activity;
    result = filterByType(result, typeFilter);
    result = filterBySearch(result, searchQuery);
    result = filterByDateRange(result, dateRange);
    result = sortByDateDescending(result);
    return result;
  }, [activity, typeFilter, searchQuery, dateRange]);

  return useMemo(
    () => ({
      getActivity,
      addActivity,
      activity,
      filteredActivity,
      filters,
      setTypeFilter,
      setSearchQuery,
      setDateRange,
      resetFilters,
      availableTypes,
    }),
    [
      getActivity,
      addActivity,
      activity,
      filteredActivity,
      filters,
      setTypeFilter,
      setSearchQuery,
      setDateRange,
      resetFilters,
      availableTypes,
    ],
  );
}

export default useActivityStore;