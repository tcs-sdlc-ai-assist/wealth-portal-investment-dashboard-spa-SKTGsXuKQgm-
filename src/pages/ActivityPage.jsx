/**
 * Activity history page with date range, type, and search filters.
 * Shows chronological transaction list with type badges, amounts,
 * and custom empty state when no activity matches.
 * Implements SCRUM-20323: Activity History with Filters and Empty State
 * @module ActivityPage
 */

import { useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  X,
  Filter,
  Calendar,
  ArrowDownCircle,
  ArrowUpCircle,
  RefreshCw,
  CreditCard,
  Banknote,
  TrendingUp,
  Percent,
  RotateCcw,
  DollarSign,
} from 'lucide-react';
import { useActivityStore } from '../hooks/useActivityStore.js';
import { useSkeletonDelay } from '../hooks/useSkeletonDelay.js';
import { PageTransition } from '../components/shared/PageTransition.jsx';
import { SkeletonLoader } from '../components/shared/SkeletonLoader.jsx';
import { EmptyState } from '../components/shared/EmptyState.jsx';
import { formatCurrency, formatDate, formatNumber } from '../utils/formatters.js';
import { classNames } from '../utils/helpers.js';
import { TRANSACTION_TYPE_LABELS } from '../utils/constants.js';

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
 * Transaction type filter options.
 * @type {Array<{ value: string, label: string }>}
 */
const TYPE_FILTER_OPTIONS = [
  { value: 'all', label: 'All Types' },
  { value: 'deposit', label: 'Deposit' },
  { value: 'withdrawal', label: 'Withdrawal' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'payment', label: 'Payment' },
  { value: 'fee', label: 'Fee' },
  { value: 'interest', label: 'Interest' },
  { value: 'dividend', label: 'Dividend' },
  { value: 'refund', label: 'Refund' },
];

/**
 * Returns the icon component for a given transaction type.
 *
 * @param {string} type - The transaction type
 * @returns {React.ComponentType} The Lucide icon component
 */
function getTransactionIcon(type) {
  switch (type) {
    case 'deposit':
      return ArrowDownCircle;
    case 'withdrawal':
      return ArrowUpCircle;
    case 'transfer':
      return RefreshCw;
    case 'payment':
      return CreditCard;
    case 'fee':
      return Percent;
    case 'interest':
      return Banknote;
    case 'dividend':
      return TrendingUp;
    case 'refund':
      return RotateCcw;
    default:
      return DollarSign;
  }
}

/**
 * Returns badge color classes for a given transaction type.
 *
 * @param {string} type - The transaction type
 * @returns {{ bg: string, text: string, icon: string }} Tailwind class strings
 */
function getTypeBadgeClasses(type) {
  switch (type) {
    case 'deposit':
      return {
        bg: 'bg-emerald-100 dark:bg-emerald-950/30',
        text: 'text-emerald-700 dark:text-emerald-300',
        icon: 'text-emerald-600 dark:text-emerald-400',
      };
    case 'withdrawal':
      return {
        bg: 'bg-rose-100 dark:bg-rose-950/30',
        text: 'text-rose-700 dark:text-rose-300',
        icon: 'text-rose-600 dark:text-rose-400',
      };
    case 'transfer':
      return {
        bg: 'bg-sky-100 dark:bg-sky-950/30',
        text: 'text-sky-700 dark:text-sky-300',
        icon: 'text-sky-600 dark:text-sky-400',
      };
    case 'payment':
      return {
        bg: 'bg-indigo-100 dark:bg-indigo-950/30',
        text: 'text-indigo-700 dark:text-indigo-300',
        icon: 'text-indigo-600 dark:text-indigo-400',
      };
    case 'fee':
      return {
        bg: 'bg-amber-100 dark:bg-amber-950/30',
        text: 'text-amber-700 dark:text-amber-300',
        icon: 'text-amber-600 dark:text-amber-400',
      };
    case 'interest':
      return {
        bg: 'bg-teal-100 dark:bg-teal-950/30',
        text: 'text-teal-700 dark:text-teal-300',
        icon: 'text-teal-600 dark:text-teal-400',
      };
    case 'dividend':
      return {
        bg: 'bg-violet-100 dark:bg-violet-950/30',
        text: 'text-violet-700 dark:text-violet-300',
        icon: 'text-violet-600 dark:text-violet-400',
      };
    case 'refund':
      return {
        bg: 'bg-orange-100 dark:bg-orange-950/30',
        text: 'text-orange-700 dark:text-orange-300',
        icon: 'text-orange-600 dark:text-orange-400',
      };
    default:
      return {
        bg: 'bg-gray-100 dark:bg-gray-800',
        text: 'text-gray-700 dark:text-gray-300',
        icon: 'text-gray-600 dark:text-gray-400',
      };
  }
}

/**
 * Returns the amount color class based on whether the amount is positive or negative.
 *
 * @param {number} amount - The transaction amount
 * @returns {string} Tailwind color class
 */
function getAmountColorClass(amount) {
  if (!Number.isFinite(amount)) {
    return 'text-gray-900 dark:text-gray-100';
  }

  if (amount > 0) {
    return 'text-emerald-600 dark:text-emerald-400';
  }

  if (amount < 0) {
    return 'text-rose-600 dark:text-rose-400';
  }

  return 'text-gray-900 dark:text-gray-100';
}

/**
 * Formats the amount with a sign prefix.
 *
 * @param {number} amount - The transaction amount
 * @returns {string} Formatted amount string
 */
function formatSignedAmount(amount) {
  if (!Number.isFinite(amount)) {
    return '—';
  }

  if (amount > 0) {
    return `+${formatCurrency(amount)}`;
  }

  return formatCurrency(amount);
}

/**
 * Activity page component.
 * Renders a filterable, chronological list of transactions with type badges,
 * date range picker, type dropdown, and search input. Shows empty state
 * when no activity matches filters or user has no activity.
 *
 * @returns {JSX.Element}
 */
export function ActivityPage() {
  const {
    activity,
    filteredActivity,
    filters,
    setTypeFilter,
    setSearchQuery,
    setDateRange,
    resetFilters,
    availableTypes,
  } = useActivityStore();

  const loading = useSkeletonDelay();

  /**
   * Handles type filter change.
   * @param {React.ChangeEvent<HTMLSelectElement>} event
   */
  const handleTypeChange = useCallback(
    (event) => {
      setTypeFilter(event.target.value);
    },
    [setTypeFilter],
  );

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

  /**
   * Handles start date change.
   * @param {React.ChangeEvent<HTMLInputElement>} event
   */
  const handleStartDateChange = useCallback(
    (event) => {
      setDateRange((prev) => ({
        ...prev,
        start: event.target.value || null,
      }));
    },
    [setDateRange],
  );

  /**
   * Handles end date change.
   * @param {React.ChangeEvent<HTMLInputElement>} event
   */
  const handleEndDateChange = useCallback(
    (event) => {
      setDateRange((prev) => ({
        ...prev,
        end: event.target.value || null,
      }));
    },
    [setDateRange],
  );

  /**
   * Checks if any filters are active.
   * @returns {boolean}
   */
  const hasActiveFilters =
    filters.type !== 'all' ||
    filters.searchQuery !== '' ||
    filters.dateRange.start !== null ||
    filters.dateRange.end !== null;

  if (loading) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <SkeletonLoader variant="text" lines={2} />
          <SkeletonLoader variant="card" />
          <SkeletonLoader variant="list" rows={6} />
        </div>
      </PageTransition>
    );
  }

  const hasActivity = activity.length > 0;
  const hasResults = filteredActivity.length > 0;

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
            Activity
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            View your transaction history and filter by date, type, or symbol.
          </p>
        </motion.div>

        {hasActivity ? (
          <>
            {/* Filters */}
            <motion.div
              variants={itemVariants}
              className={classNames(
                'rounded-xl border p-4',
                'bg-white/80 dark:bg-gray-900/80',
                'backdrop-blur-md',
                'border-gray-200/60 dark:border-gray-700/60',
                'shadow-sm dark:shadow-gray-900/20',
              )}
            >
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Filters
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Search input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
                  <input
                    type="text"
                    value={filters.searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Search symbol or description…"
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
                    aria-label="Search activity"
                  />
                  {filters.searchQuery && (
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

                {/* Type dropdown */}
                <div className="relative">
                  <select
                    value={filters.type}
                    onChange={handleTypeChange}
                    className={classNames(
                      'block w-full rounded-lg border px-3 py-2.5 text-sm appearance-none',
                      'bg-white dark:bg-gray-800',
                      'text-gray-900 dark:text-gray-100',
                      'border-gray-300 dark:border-gray-600',
                      'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
                      'focus:ring-offset-1 dark:focus:ring-offset-gray-900',
                      'transition-colors duration-150',
                    )}
                    aria-label="Filter by transaction type"
                  >
                    {TYPE_FILTER_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Start date */}
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
                  <input
                    type="date"
                    value={filters.dateRange.start || ''}
                    onChange={handleStartDateChange}
                    className={classNames(
                      'block w-full rounded-lg border pl-9 pr-3 py-2.5 text-sm',
                      'bg-white dark:bg-gray-800',
                      'text-gray-900 dark:text-gray-100',
                      'border-gray-300 dark:border-gray-600',
                      'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
                      'focus:ring-offset-1 dark:focus:ring-offset-gray-900',
                      'transition-colors duration-150',
                    )}
                    aria-label="Start date"
                    placeholder="Start date"
                  />
                </div>

                {/* End date */}
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
                  <input
                    type="date"
                    value={filters.dateRange.end || ''}
                    onChange={handleEndDateChange}
                    className={classNames(
                      'block w-full rounded-lg border pl-9 pr-3 py-2.5 text-sm',
                      'bg-white dark:bg-gray-800',
                      'text-gray-900 dark:text-gray-100',
                      'border-gray-300 dark:border-gray-600',
                      'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
                      'focus:ring-offset-1 dark:focus:ring-offset-gray-900',
                      'transition-colors duration-150',
                    )}
                    aria-label="End date"
                    placeholder="End date"
                  />
                </div>
              </div>

              {/* Reset filters */}
              {hasActiveFilters && (
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Showing {filteredActivity.length} of {activity.length} transaction{activity.length !== 1 ? 's' : ''}
                  </p>
                  <button
                    type="button"
                    onClick={resetFilters}
                    className={classNames(
                      'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium',
                      'text-gray-600 dark:text-gray-400',
                      'hover:bg-gray-100 dark:hover:bg-gray-800',
                      'border border-gray-300 dark:border-gray-600',
                      'transition-colors duration-150',
                      'focus:outline-none focus:ring-2 focus:ring-indigo-500',
                    )}
                  >
                    <X className="w-3 h-3" />
                    Reset Filters
                  </button>
                </div>
              )}
            </motion.div>

            {/* Activity list */}
            <motion.div variants={itemVariants}>
              {hasResults ? (
                <div className="space-y-3">
                  {filteredActivity.map((entry) => {
                    const Icon = getTransactionIcon(entry.type);
                    const badgeClasses = getTypeBadgeClasses(entry.type);
                    const amountColorClass = getAmountColorClass(entry.amount);
                    const typeLabel = TRANSACTION_TYPE_LABELS[entry.type] || entry.type;

                    return (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          type: 'spring',
                          stiffness: 300,
                          damping: 24,
                        }}
                        className={classNames(
                          'flex items-center gap-4 rounded-xl border p-4',
                          'bg-white/80 dark:bg-gray-900/80',
                          'backdrop-blur-md',
                          'border-gray-200/60 dark:border-gray-700/60',
                          'shadow-sm dark:shadow-gray-900/20',
                          'hover:shadow-md dark:hover:shadow-gray-900/30',
                          'transition-shadow duration-200',
                        )}
                      >
                        {/* Icon */}
                        <div
                          className={classNames(
                            'flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0',
                            badgeClasses.bg,
                          )}
                        >
                          <Icon className={classNames('w-5 h-5', badgeClasses.icon)} />
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                              {entry.description}
                            </p>
                            <span
                              className={classNames(
                                'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium flex-shrink-0',
                                badgeClasses.bg,
                                badgeClasses.text,
                              )}
                            >
                              {typeLabel}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1 flex-wrap">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDate(entry.date, 'MMM d, yyyy · h:mm a')}
                            </span>
                            {entry.symbol && (
                              <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                                {entry.symbol}
                              </span>
                            )}
                            {entry.qty && entry.price && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {formatNumber(entry.qty, 0)} × {formatCurrency(entry.price)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Amount */}
                        <div className="flex-shrink-0 text-right">
                          <p
                            className={classNames(
                              'text-sm font-bold tabular-nums',
                              amountColorClass,
                            )}
                          >
                            {formatSignedAmount(entry.amount)}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div
                  className={classNames(
                    'rounded-xl border',
                    'bg-white/80 dark:bg-gray-900/80',
                    'backdrop-blur-md',
                    'border-gray-200/60 dark:border-gray-700/60',
                    'shadow-sm dark:shadow-gray-900/20',
                  )}
                >
                  <EmptyState
                    title="No transactions match your filters"
                    description="Try adjusting your search, date range, or transaction type filter."
                    actionLabel="Reset Filters"
                    onAction={resetFilters}
                    compact
                  />
                </div>
              )}
            </motion.div>

            {/* Summary footer */}
            {hasResults && !hasActiveFilters && (
              <motion.div
                variants={itemVariants}
                className="text-xs text-gray-500 dark:text-gray-400 text-right"
              >
                Showing {filteredActivity.length} transaction{filteredActivity.length !== 1 ? 's' : ''}
              </motion.div>
            )}
          </>
        ) : (
          <motion.div variants={itemVariants}>
            <EmptyState
              title="No activity yet"
              description="Your transaction history will appear here once you make your first transaction."
            />
          </motion.div>
        )}
      </motion.div>
    </PageTransition>
  );
}

export default ActivityPage;