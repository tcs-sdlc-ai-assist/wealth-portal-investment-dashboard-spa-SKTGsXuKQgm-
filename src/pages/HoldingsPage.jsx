/**
 * Holdings table page with sortable columns, search, trend sparklines,
 * and empty state for users with no holdings.
 * Implements SCRUM-20322: Holdings Table with TrendSparkline
 * @module HoldingsPage
 */

import { useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { useHoldingsStore } from '../hooks/useHoldingsStore.js';
import { useSkeletonDelay } from '../hooks/useSkeletonDelay.js';
import { PageTransition } from '../components/shared/PageTransition.jsx';
import { SkeletonLoader } from '../components/shared/SkeletonLoader.jsx';
import { TrendSparkline } from '../components/shared/TrendSparkline.jsx';
import { EmptyState } from '../components/shared/EmptyState.jsx';
import { formatCurrency, formatPercent, formatNumber } from '../utils/formatters.js';
import { classNames } from '../utils/helpers.js';

/**
 * Container animation variants for staggered children.
 * @type {Object}
 */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

/**
 * Individual item animation variants.
 * @type {Object}
 */
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24,
    },
  },
};

/**
 * Column definitions for the holdings table.
 * @type {Array<{ key: string, label: string, sortable: boolean, align: string, mono: boolean }>}
 */
const COLUMNS = [
  { key: 'symbol', label: 'Symbol', sortable: true, align: 'left', mono: false },
  { key: 'name', label: 'Name', sortable: true, align: 'left', mono: false },
  { key: 'qty', label: 'Qty', sortable: true, align: 'right', mono: true },
  { key: 'avgCost', label: 'Avg Cost', sortable: true, align: 'right', mono: true },
  { key: 'currentPrice', label: 'Price', sortable: true, align: 'right', mono: true },
  { key: 'mktValue', label: 'Mkt Value', sortable: true, align: 'right', mono: true },
  { key: 'gainLossDollar', label: 'Gain/Loss $', sortable: true, align: 'right', mono: true },
  { key: 'gainLossPercent', label: 'Gain/Loss %', sortable: true, align: 'right', mono: true },
  { key: 'sparkline', label: '7-Day Trend', sortable: false, align: 'center', mono: false },
];

/**
 * Returns the sort indicator icon for a column header.
 *
 * @param {string} columnKey - The column key
 * @param {Object} sortConfig - The current sort configuration
 * @returns {JSX.Element}
 */
function SortIndicator({ columnKey, sortConfig }) {
  if (sortConfig.field !== columnKey) {
    return <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />;
  }

  if (sortConfig.direction === 'asc') {
    return <ArrowUp className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />;
  }

  return <ArrowDown className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />;
}

/**
 * Holdings page component.
 * Renders a sortable, searchable table of holdings with trend sparklines,
 * gain/loss coloring, and empty state for users with no holdings.
 *
 * @returns {JSX.Element}
 */
export function HoldingsPage() {
  const {
    holdings,
    filteredHoldings,
    searchQuery,
    setSearchQuery,
    sortConfig,
    handleSort,
    resetFilters,
  } = useHoldingsStore();

  const loading = useSkeletonDelay();

  /**
   * Handles search input change.
   * @param {React.ChangeEvent<HTMLInputElement>} event
   */
  const handleSearchChange = useCallback(
    (event) => {
      setSearchQuery(event.target.value);
    },
    [setSearchQuery],
  );

  /**
   * Clears the search query.
   */
  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, [setSearchQuery]);

  if (loading) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <SkeletonLoader variant="text" lines={2} />
          <SkeletonLoader variant="table" rows={6} cols={5} />
        </div>
      </PageTransition>
    );
  }

  const hasHoldings = holdings.length > 0;
  const hasResults = filteredHoldings.length > 0;

  return (
    <PageTransition>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-6"
      >
        {/* Page header */}
        <motion.div variants={itemVariants}>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            Holdings
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            View and manage your investment holdings.
          </p>
        </motion.div>

        {hasHoldings ? (
          <>
            {/* Search bar */}
            <motion.div variants={itemVariants}>
              <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Search by symbol or name…"
                    className={classNames(
                      'block w-full rounded-lg border pl-9 pr-9 py-2.5 text-sm',
                      'bg-white dark:bg-gray-800',
                      'text-gray-900 dark:text-gray-100',
                      'placeholder-gray-400 dark:placeholder-gray-500',
                      'border-gray-300 dark:border-gray-600',
                      'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
                      'focus:ring-offset-1 dark:focus:ring-offset-gray-900',
                      'transition-colors duration-150',
                    )}
                    aria-label="Search holdings"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors focus:outline-none"
                      aria-label="Clear search"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {(searchQuery || sortConfig.field !== 'mktValue' || sortConfig.direction !== 'desc') && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className={classNames(
                      'inline-flex items-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-medium',
                      'text-gray-600 dark:text-gray-400',
                      'hover:bg-gray-100 dark:hover:bg-gray-800',
                      'border border-gray-300 dark:border-gray-600',
                      'transition-colors duration-150',
                      'focus:outline-none focus:ring-2 focus:ring-indigo-500',
                    )}
                  >
                    Reset
                  </button>
                )}
              </div>
            </motion.div>

            {/* Holdings table */}
            <motion.div
              variants={itemVariants}
              className={classNames(
                'rounded-xl border overflow-hidden',
                'bg-white/80 dark:bg-gray-900/80',
                'backdrop-blur-md',
                'border-gray-200/60 dark:border-gray-700/60',
                'shadow-sm dark:shadow-gray-900/20',
              )}
            >
              {hasResults ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    {/* Table header */}
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/50">
                        {COLUMNS.map((column) => (
                          <th
                            key={column.key}
                            className={classNames(
                              'px-4 py-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap',
                              column.align === 'right'
                                ? 'text-right'
                                : column.align === 'center'
                                  ? 'text-center'
                                  : 'text-left',
                              'text-gray-500 dark:text-gray-400',
                              column.sortable && 'cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-150',
                            )}
                            onClick={column.sortable ? () => handleSort(column.key) : undefined}
                            aria-sort={
                              sortConfig.field === column.key
                                ? sortConfig.direction === 'asc'
                                  ? 'ascending'
                                  : 'descending'
                                : undefined
                            }
                          >
                            <span
                              className={classNames(
                                'inline-flex items-center gap-1',
                                column.align === 'right' && 'justify-end',
                                column.align === 'center' && 'justify-center',
                              )}
                            >
                              <span>{column.label}</span>
                              {column.sortable && (
                                <SortIndicator
                                  columnKey={column.key}
                                  sortConfig={sortConfig}
                                />
                              )}
                            </span>
                          </th>
                        ))}
                      </tr>
                    </thead>

                    {/* Table body */}
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {filteredHoldings.map((holding) => {
                        const isPositive = holding.isGain;
                        const gainLossColorClass = isPositive
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400';

                        return (
                          <tr
                            key={holding.id}
                            className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors duration-100"
                          >
                            {/* Symbol */}
                            <td className="px-4 py-3.5 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                {isPositive ? (
                                  <TrendingUp className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                ) : (
                                  <TrendingDown className="w-4 h-4 text-rose-500 flex-shrink-0" />
                                )}
                                <span className="font-semibold text-gray-900 dark:text-gray-100">
                                  {holding.symbol}
                                </span>
                              </div>
                            </td>

                            {/* Name */}
                            <td className="px-4 py-3.5 whitespace-nowrap text-gray-600 dark:text-gray-300 max-w-[200px] truncate">
                              {holding.name}
                            </td>

                            {/* Qty */}
                            <td className="px-4 py-3.5 whitespace-nowrap text-right font-mono text-gray-900 dark:text-gray-100 tabular-nums">
                              {formatNumber(holding.qty, 0)}
                            </td>

                            {/* Avg Cost */}
                            <td className="px-4 py-3.5 whitespace-nowrap text-right font-mono text-gray-900 dark:text-gray-100 tabular-nums">
                              {formatCurrency(holding.avgCost)}
                            </td>

                            {/* Price */}
                            <td className="px-4 py-3.5 whitespace-nowrap text-right font-mono text-gray-900 dark:text-gray-100 tabular-nums">
                              {formatCurrency(holding.currentPrice)}
                            </td>

                            {/* Mkt Value */}
                            <td className="px-4 py-3.5 whitespace-nowrap text-right font-mono font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
                              {formatCurrency(holding.mktValue)}
                            </td>

                            {/* Gain/Loss $ */}
                            <td
                              className={classNames(
                                'px-4 py-3.5 whitespace-nowrap text-right font-mono font-semibold tabular-nums',
                                gainLossColorClass,
                              )}
                            >
                              {isPositive ? '+' : ''}
                              {formatCurrency(holding.gainLossDollar)}
                            </td>

                            {/* Gain/Loss % */}
                            <td
                              className={classNames(
                                'px-4 py-3.5 whitespace-nowrap text-right font-mono font-semibold tabular-nums',
                                gainLossColorClass,
                              )}
                            >
                              {isPositive ? '+' : ''}
                              {formatPercent(holding.gainLossPercent)}
                            </td>

                            {/* 7-Day Trend */}
                            <td className="px-4 py-3.5 whitespace-nowrap">
                              <div className="flex items-center justify-center">
                                {holding.sparklineData && holding.sparklineData.length > 0 ? (
                                  <TrendSparkline
                                    data={holding.sparklineData}
                                    width={100}
                                    height={32}
                                  />
                                ) : (
                                  <span className="text-xs text-gray-400 dark:text-gray-500">—</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="px-6 py-12">
                  <EmptyState
                    title="No holdings match your search"
                    description={`No results found for "${searchQuery}". Try a different search term.`}
                    actionLabel="Clear Search"
                    onAction={handleClearSearch}
                    compact
                  />
                </div>
              )}
            </motion.div>

            {/* Summary footer */}
            {hasResults && (
              <motion.div
                variants={itemVariants}
                className="text-xs text-gray-500 dark:text-gray-400 text-right"
              >
                Showing {filteredHoldings.length} of {holdings.length} holding{holdings.length !== 1 ? 's' : ''}
              </motion.div>
            )}
          </>
        ) : (
          <motion.div variants={itemVariants}>
            <EmptyState
              title="No holdings yet"
              description="Your investment holdings will appear here once you add positions to your portfolio."
            />
          </motion.div>
        )}
      </motion.div>
    </PageTransition>
  );
}

export default HoldingsPage;