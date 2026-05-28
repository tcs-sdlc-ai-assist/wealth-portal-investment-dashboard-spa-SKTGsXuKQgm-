/**
 * Holdings data access hook with sort/search capabilities
 * Implements SCRUM-20322: Holdings Table with TrendSparkline
 * @module useHoldingsStore
 */

import { useCallback, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { calculateGainLoss, generateSparklineData } from '../utils/helpers.js';

/**
 * @typedef {'symbol' | 'name' | 'qty' | 'avgCost' | 'currentPrice' | 'mktValue' | 'costBasis' | 'gainLossDollar' | 'gainLossPercent'} SortField
 */

/**
 * @typedef {'asc' | 'desc'} SortDirection
 */

/**
 * @typedef {Object} SortConfig
 * @property {SortField} field - The field to sort by
 * @property {SortDirection} direction - The sort direction
 */

/**
 * @typedef {Object} HoldingsStoreValue
 * @property {function(): Array<Object>} getHoldings - Returns all holdings for the current user
 * @property {function(string, Object): void} updateHolding - Updates a specific holding by id
 * @property {Array<Object>} holdings - All holdings (unfiltered, unsorted)
 * @property {Array<Object>} filteredHoldings - Holdings after search and sort applied
 * @property {string} searchQuery - Current search query
 * @property {function(string): void} setSearchQuery - Sets the search query
 * @property {SortConfig} sortConfig - Current sort configuration
 * @property {function(SortField): void} handleSort - Toggles sort on a field
 * @property {function(): void} resetFilters - Resets search and sort to defaults
 */

/**
 * Default sort configuration.
 *
 * @type {SortConfig}
 */
const DEFAULT_SORT_CONFIG = {
  field: 'mktValue',
  direction: 'desc',
};

/**
 * Compares two values for sorting purposes.
 *
 * @param {*} a - First value
 * @param {*} b - Second value
 * @param {SortDirection} direction - Sort direction
 * @returns {number} Comparison result
 */
function compareValues(a, b, direction) {
  if (a === b) return 0;

  if (a === null || a === undefined) return 1;
  if (b === null || b === undefined) return -1;

  let result;

  if (typeof a === 'string' && typeof b === 'string') {
    result = a.localeCompare(b, undefined, { sensitivity: 'base' });
  } else if (typeof a === 'number' && typeof b === 'number') {
    result = a - b;
  } else {
    result = String(a).localeCompare(String(b), undefined, { sensitivity: 'base' });
  }

  return direction === 'asc' ? result : -result;
}

/**
 * Sorts an array of holdings by the specified field and direction.
 *
 * @param {Array<Object>} holdings - The holdings array to sort
 * @param {SortConfig} sortConfig - The sort configuration
 * @returns {Array<Object>} A new sorted array
 */
function sortHoldings(holdings, sortConfig) {
  if (!Array.isArray(holdings) || holdings.length === 0) {
    return [];
  }

  const { field, direction } = sortConfig;

  return [...holdings].sort((a, b) => {
    const valA = a[field];
    const valB = b[field];
    return compareValues(valA, valB, direction);
  });
}

/**
 * Filters holdings by a search query matching against symbol or name.
 *
 * @param {Array<Object>} holdings - The holdings array to filter
 * @param {string} query - The search query
 * @returns {Array<Object>} Filtered holdings
 */
function filterHoldings(holdings, query) {
  if (!Array.isArray(holdings) || holdings.length === 0) {
    return [];
  }

  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return holdings;
  }

  const normalised = query.trim().toLowerCase();

  return holdings.filter((holding) => {
    const symbol = (holding.symbol || '').toLowerCase();
    const name = (holding.name || '').toLowerCase();
    return symbol.includes(normalised) || name.includes(normalised);
  });
}

/**
 * Custom hook that provides holdings data access, sorting, searching,
 * and mutation for the current user.
 *
 * @returns {HoldingsStoreValue} Holdings store methods and state
 * @throws {Error} If used outside of an AuthProvider
 */
export function useHoldingsStore() {
  const { currentUser, updateUser } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState(DEFAULT_SORT_CONFIG);

  /**
   * Returns all holdings for the current user.
   *
   * @returns {Array<Object>} The user's holdings array
   */
  const getHoldings = useCallback(() => {
    if (!currentUser) {
      return [];
    }

    return Array.isArray(currentUser.holdings) ? currentUser.holdings : [];
  }, [currentUser]);

  /**
   * Updates a specific holding by id. Recomputes derived fields
   * (mktValue, costBasis, gainLoss, sparkline) after update.
   *
   * @param {string} holdingId - The id of the holding to update
   * @param {Object} updates - Partial holding object with fields to update
   */
  const updateHolding = useCallback(
    (holdingId, updates) => {
      if (!currentUser || !holdingId || !updates || typeof updates !== 'object') {
        return;
      }

      const holdings = Array.isArray(currentUser.holdings) ? currentUser.holdings : [];
      const index = holdings.findIndex((h) => h.id === holdingId);

      if (index === -1) {
        return;
      }

      const existing = holdings[index];
      const merged = { ...existing, ...updates };

      // Recompute derived fields if quantity, avgCost, or currentPrice changed
      const qty = Number.isFinite(merged.qty) ? merged.qty : 0;
      const avgCost = Number.isFinite(merged.avgCost) ? merged.avgCost : 0;
      const currentPrice = Number.isFinite(merged.currentPrice) ? merged.currentPrice : 0;

      const mktValue = Math.round(qty * currentPrice * 100) / 100;
      const costBasis = Math.round(qty * avgCost * 100) / 100;
      const { amount: gainLossDollar, percentage: gainLossPercent, isGain } =
        calculateGainLoss(mktValue, costBasis);

      // Regenerate sparkline if price changed
      const sparklineData =
        updates.currentPrice !== undefined
          ? generateSparklineData(currentPrice, 0.03)
          : merged.sparklineData;

      const updatedHolding = {
        ...merged,
        mktValue,
        costBasis,
        gainLossDollar,
        gainLossPercent,
        isGain,
        sparklineData,
      };

      const updatedHoldings = [...holdings];
      updatedHoldings[index] = updatedHolding;

      updateUser({ holdings: updatedHoldings });
    },
    [currentUser, updateUser],
  );

  /**
   * Toggles sort on a given field. If already sorting by that field,
   * toggles direction. Otherwise, sets the field with descending direction
   * (ascending for string fields).
   *
   * @param {SortField} field - The field to sort by
   */
  const handleSort = useCallback(
    (field) => {
      setSortConfig((prev) => {
        if (prev.field === field) {
          return {
            field,
            direction: prev.direction === 'asc' ? 'desc' : 'asc',
          };
        }

        // Default direction: ascending for text fields, descending for numeric
        const isTextField = field === 'symbol' || field === 'name';
        return {
          field,
          direction: isTextField ? 'asc' : 'desc',
        };
      });
    },
    [],
  );

  /**
   * Resets search query and sort configuration to defaults.
   */
  const resetFilters = useCallback(() => {
    setSearchQuery('');
    setSortConfig(DEFAULT_SORT_CONFIG);
  }, []);

  /** All holdings for the current user */
  const holdings = useMemo(() => getHoldings(), [getHoldings]);

  /** Holdings after applying search filter and sort */
  const filteredHoldings = useMemo(() => {
    const filtered = filterHoldings(holdings, searchQuery);
    return sortHoldings(filtered, sortConfig);
  }, [holdings, searchQuery, sortConfig]);

  return useMemo(
    () => ({
      getHoldings,
      updateHolding,
      holdings,
      filteredHoldings,
      searchQuery,
      setSearchQuery,
      sortConfig,
      handleSort,
      resetFilters,
    }),
    [
      getHoldings,
      updateHolding,
      holdings,
      filteredHoldings,
      searchQuery,
      sortConfig,
      handleSort,
      resetFilters,
    ],
  );
}

export default useHoldingsStore;