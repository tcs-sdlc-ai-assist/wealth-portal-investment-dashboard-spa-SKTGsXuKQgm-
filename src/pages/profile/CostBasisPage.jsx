/**
 * Cost basis method selection page with method explanations and mock tax lot table
 * Allows user to select from FIFO, LIFO, Specific Identification, or Average Cost.
 * Shows explanation text for each method and a mock tax lot details table.
 * Selection persisted to localStorage via useProfileStore.
 * Wrapped in PageTransition.
 * Implements SCRUM-20326: Profile & Settings Pages
 * @module CostBasisPage
 */

import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Calculator,
  CheckCircle,
  Info,
  Layers,
  ArrowDownUp,
  ListOrdered,
  BarChart3,
} from 'lucide-react';
import { useProfileStore } from '../../hooks/useProfileStore.js';
import { useSkeletonDelay } from '../../hooks/useSkeletonDelay.js';
import { useToast } from '../../context/ToastContext.jsx';
import { PageTransition } from '../../components/shared/PageTransition.jsx';
import { SkeletonLoader } from '../../components/shared/SkeletonLoader.jsx';
import { formatCurrency, formatDate, formatNumber } from '../../utils/formatters.js';
import { classNames } from '../../utils/helpers.js';

/**
 * Container animation variants for staggered children.
 * @type {Object}
 */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
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
 * Cost basis method definitions with labels, descriptions, and icons.
 * @type {Array<{ value: string, label: string, description: string, details: string, icon: React.ComponentType }>}
 */
const COST_BASIS_METHODS = [
  {
    value: 'FIFO',
    label: 'First In, First Out (FIFO)',
    description: 'Sells the oldest shares first.',
    details:
      'FIFO assumes the first shares you purchased are the first ones sold. This is the default method used by most brokerages and is generally the simplest to track. In a rising market, FIFO may result in higher capital gains since older shares typically have a lower cost basis.',
    icon: ListOrdered,
  },
  {
    value: 'LIFO',
    label: 'Last In, First Out (LIFO)',
    description: 'Sells the most recently purchased shares first.',
    details:
      'LIFO assumes the most recently purchased shares are sold first. This method can be advantageous in a rising market because newer shares typically have a higher cost basis, potentially resulting in lower capital gains and reduced tax liability.',
    icon: ArrowDownUp,
  },
  {
    value: 'SpecID',
    label: 'Specific Identification',
    description: 'You choose exactly which shares to sell.',
    details:
      'Specific Identification allows you to select the exact tax lots to sell, giving you the most control over your capital gains and losses. This method requires careful record-keeping but offers the greatest flexibility for tax optimization strategies.',
    icon: Layers,
  },
  {
    value: 'Average',
    label: 'Average Cost',
    description: 'Uses the average cost of all shares owned.',
    details:
      'Average Cost calculates the mean purchase price of all shares you own and uses that as the cost basis for any shares sold. This method is commonly used for mutual funds and simplifies record-keeping since you don\'t need to track individual lots.',
    icon: BarChart3,
  },
];

/**
 * Mock tax lot data for demonstration purposes.
 * @type {Array<Object>}
 */
const MOCK_TAX_LOTS = [
  {
    id: 'lot-001',
    symbol: 'AAPL',
    purchaseDate: '2022-03-15',
    quantity: 20,
    costPerShare: 155.42,
    currentPrice: 195.89,
  },
  {
    id: 'lot-002',
    symbol: 'AAPL',
    purchaseDate: '2023-01-10',
    quantity: 15,
    costPerShare: 132.18,
    currentPrice: 195.89,
  },
  {
    id: 'lot-003',
    symbol: 'AAPL',
    purchaseDate: '2023-08-22',
    quantity: 15,
    costPerShare: 178.65,
    currentPrice: 195.89,
  },
  {
    id: 'lot-004',
    symbol: 'MSFT',
    purchaseDate: '2022-06-01',
    quantity: 10,
    costPerShare: 265.30,
    currentPrice: 425.52,
  },
  {
    id: 'lot-005',
    symbol: 'MSFT',
    purchaseDate: '2023-04-18',
    quantity: 20,
    costPerShare: 308.50,
    currentPrice: 425.52,
  },
  {
    id: 'lot-006',
    symbol: 'VOO',
    purchaseDate: '2021-11-05',
    quantity: 25,
    costPerShare: 412.75,
    currentPrice: 502.14,
  },
  {
    id: 'lot-007',
    symbol: 'VOO',
    purchaseDate: '2023-09-12',
    quantity: 15,
    costPerShare: 395.20,
    currentPrice: 502.14,
  },
];

/**
 * Returns badge color classes for a given cost basis method.
 *
 * @param {string} method - The cost basis method value
 * @returns {{ bg: string, text: string, border: string }} Tailwind class strings
 */
function getMethodBadgeClasses(method) {
  switch (method) {
    case 'FIFO':
      return {
        bg: 'bg-indigo-100 dark:bg-indigo-950/30',
        text: 'text-indigo-700 dark:text-indigo-300',
        border: 'border-indigo-200 dark:border-indigo-800',
      };
    case 'LIFO':
      return {
        bg: 'bg-emerald-100 dark:bg-emerald-950/30',
        text: 'text-emerald-700 dark:text-emerald-300',
        border: 'border-emerald-200 dark:border-emerald-800',
      };
    case 'SpecID':
      return {
        bg: 'bg-violet-100 dark:bg-violet-950/30',
        text: 'text-violet-700 dark:text-violet-300',
        border: 'border-violet-200 dark:border-violet-800',
      };
    case 'Average':
      return {
        bg: 'bg-amber-100 dark:bg-amber-950/30',
        text: 'text-amber-700 dark:text-amber-300',
        border: 'border-amber-200 dark:border-amber-800',
      };
    default:
      return {
        bg: 'bg-gray-100 dark:bg-gray-800',
        text: 'text-gray-700 dark:text-gray-300',
        border: 'border-gray-200 dark:border-gray-700',
      };
  }
}

/**
 * Cost basis settings page component.
 * Renders a selector for cost basis method (FIFO, LIFO, Specific Identification,
 * Average Cost) with explanation text for each method and a mock tax lot details table.
 * Selection is persisted to localStorage via useProfileStore.
 *
 * @returns {JSX.Element}
 */
export function CostBasisPage() {
  const { profile, setCostBasisMethod } = useProfileStore();
  const { addToast } = useToast();
  const loading = useSkeletonDelay();

  const currentMethod = useMemo(() => {
    return profile?.costBasisMethod || 'FIFO';
  }, [profile]);

  const selectedMethodDetails = useMemo(() => {
    return COST_BASIS_METHODS.find((m) => m.value === currentMethod) || COST_BASIS_METHODS[0];
  }, [currentMethod]);

  /**
   * Handles selecting a cost basis method.
   * @param {string} method - The cost basis method value
   */
  const handleSelectMethod = useCallback(
    (method) => {
      if (method === currentMethod) {
        return;
      }

      setCostBasisMethod(method);

      const methodDef = COST_BASIS_METHODS.find((m) => m.value === method);
      addToast({
        message: `Cost basis method updated to ${methodDef ? methodDef.label : method}.`,
        type: 'success',
      });
    },
    [currentMethod, setCostBasisMethod, addToast],
  );

  /**
   * Computes gain/loss for a tax lot.
   * @param {Object} lot - The tax lot object
   * @returns {{ gainLoss: number, gainLossPercent: number, isGain: boolean }}
   */
  const computeLotGainLoss = useCallback((lot) => {
    const costBasis = lot.quantity * lot.costPerShare;
    const marketValue = lot.quantity * lot.currentPrice;
    const gainLoss = marketValue - costBasis;
    const gainLossPercent = costBasis !== 0 ? gainLoss / costBasis : 0;
    const isGain = gainLoss >= 0;
    return { gainLoss, gainLossPercent, isGain };
  }, []);

  if (loading) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <SkeletonLoader variant="text" lines={2} />
          <SkeletonLoader variant="card" count={2} />
          <SkeletonLoader variant="table" rows={5} cols={6} />
        </div>
      </PageTransition>
    );
  }

  if (!profile) {
    return (
      <PageTransition>
        <div className="text-center py-16">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No profile data available. Please log in.
          </p>
        </div>
      </PageTransition>
    );
  }

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
            Cost Basis Method
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Choose how the cost basis is calculated when you sell securities.
          </p>
        </motion.div>

        {/* Current method summary */}
        <motion.div
          variants={itemVariants}
          className={classNames(
            'rounded-xl border p-5',
            'bg-white/80 dark:bg-gray-900/80',
            'backdrop-blur-md',
            'border-gray-200/60 dark:border-gray-700/60',
            'shadow-sm dark:shadow-gray-900/20',
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={classNames(
                'flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0',
                getMethodBadgeClasses(currentMethod).bg,
              )}
            >
              <Calculator className={classNames('w-5 h-5', getMethodBadgeClasses(currentMethod).text)} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Current Method
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Your cost basis is currently calculated using the{' '}
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {selectedMethodDetails.label}
                </span>{' '}
                method.
              </p>
            </div>
            <span
              className={classNames(
                'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold',
                getMethodBadgeClasses(currentMethod).bg,
                getMethodBadgeClasses(currentMethod).text,
              )}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              {currentMethod}
            </span>
          </div>
        </motion.div>

        {/* Method selection cards */}
        <motion.div variants={itemVariants}>
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Select a Method
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {COST_BASIS_METHODS.map((method) => {
              const Icon = method.icon;
              const isSelected = currentMethod === method.value;
              const badgeClasses = getMethodBadgeClasses(method.value);

              return (
                <motion.button
                  key={method.value}
                  type="button"
                  onClick={() => handleSelectMethod(method.value)}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 24,
                  }}
                  className={classNames(
                    'relative flex flex-col items-start rounded-xl border p-5 text-left',
                    'transition-all duration-200',
                    'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
                    'dark:focus:ring-offset-gray-900',
                    isSelected
                      ? classNames(
                          'bg-white dark:bg-gray-900',
                          'border-indigo-500 dark:border-indigo-400',
                          'shadow-md dark:shadow-gray-900/30',
                          'ring-2 ring-indigo-500/20 dark:ring-indigo-400/20',
                        )
                      : classNames(
                          'bg-white/80 dark:bg-gray-900/80',
                          'backdrop-blur-md',
                          'border-gray-200/60 dark:border-gray-700/60',
                          'shadow-sm dark:shadow-gray-900/20',
                          'hover:shadow-md dark:hover:shadow-gray-900/30',
                          'hover:border-gray-300 dark:hover:border-gray-600',
                          'cursor-pointer',
                        ),
                  )}
                  aria-pressed={isSelected}
                  aria-label={`Select ${method.label} cost basis method`}
                >
                  {/* Selected indicator */}
                  {isSelected && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                  )}

                  {/* Icon and label */}
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={classNames(
                        'flex items-center justify-center w-9 h-9 rounded-lg flex-shrink-0',
                        isSelected
                          ? 'bg-indigo-100 dark:bg-indigo-950/40'
                          : badgeClasses.bg,
                      )}
                    >
                      <Icon
                        className={classNames(
                          'w-5 h-5',
                          isSelected
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : badgeClasses.text,
                        )}
                      />
                    </div>
                    <span
                      className={classNames(
                        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                        isSelected
                          ? 'bg-indigo-100 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300'
                          : classNames(badgeClasses.bg, badgeClasses.text),
                      )}
                    >
                      {method.value}
                    </span>
                  </div>

                  {/* Title */}
                  <h3
                    className={classNames(
                      'text-sm font-semibold mb-1',
                      isSelected
                        ? 'text-indigo-700 dark:text-indigo-300'
                        : 'text-gray-900 dark:text-gray-100',
                    )}
                  >
                    {method.label}
                  </h3>

                  {/* Short description */}
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    {method.description}
                  </p>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Selected method explanation */}
        <motion.div
          variants={itemVariants}
          className={classNames(
            'rounded-xl border p-6',
            'bg-white/80 dark:bg-gray-900/80',
            'backdrop-blur-md',
            'border-gray-200/60 dark:border-gray-700/60',
            'shadow-sm dark:shadow-gray-900/20',
          )}
        >
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              About {selectedMethodDetails.label}
            </h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            {selectedMethodDetails.details}
          </p>
        </motion.div>

        {/* Mock tax lot details table */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Tax Lot Details
            </h2>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {MOCK_TAX_LOTS.length} lot{MOCK_TAX_LOTS.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div
            className={classNames(
              'rounded-xl border overflow-hidden',
              'bg-white/80 dark:bg-gray-900/80',
              'backdrop-blur-md',
              'border-gray-200/60 dark:border-gray-700/60',
              'shadow-sm dark:shadow-gray-900/20',
            )}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/50">
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-left text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      Symbol
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-left text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      Purchase Date
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-right text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      Qty
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-right text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      Cost/Share
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-right text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      Cost Basis
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-right text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      Mkt Value
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-right text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      Gain/Loss
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {MOCK_TAX_LOTS.map((lot) => {
                    const costBasis = lot.quantity * lot.costPerShare;
                    const marketValue = lot.quantity * lot.currentPrice;
                    const { gainLoss, isGain } = computeLotGainLoss(lot);
                    const gainLossColorClass = isGain
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400';

                    return (
                      <tr
                        key={lot.id}
                        className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors duration-100"
                      >
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="font-semibold text-gray-900 dark:text-gray-100">
                            {lot.symbol}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-gray-600 dark:text-gray-300">
                          {formatDate(lot.purchaseDate, 'MMM d, yyyy')}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-right font-mono text-gray-900 dark:text-gray-100 tabular-nums">
                          {formatNumber(lot.quantity, 0)}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-right font-mono text-gray-900 dark:text-gray-100 tabular-nums">
                          {formatCurrency(lot.costPerShare)}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-right font-mono text-gray-900 dark:text-gray-100 tabular-nums">
                          {formatCurrency(costBasis)}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-right font-mono font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
                          {formatCurrency(marketValue)}
                        </td>
                        <td
                          className={classNames(
                            'px-4 py-3.5 whitespace-nowrap text-right font-mono font-semibold tabular-nums',
                            gainLossColorClass,
                          )}
                        >
                          {isGain ? '+' : ''}
                          {formatCurrency(gainLoss)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* Summary footer */}
        <motion.div
          variants={itemVariants}
          className="text-xs text-gray-500 dark:text-gray-400 text-right"
        >
          Tax lot data shown is for demonstration purposes only.
        </motion.div>

        {/* Info footer */}
        <motion.div
          variants={itemVariants}
          className={classNames(
            'rounded-xl border p-5',
            'bg-indigo-50/50 dark:bg-indigo-950/10',
            'border-indigo-200/60 dark:border-indigo-800/40',
          )}
        >
          <div className="flex items-start gap-3">
            <Calculator className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                About cost basis methods
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                Your cost basis method determines how gains and losses are calculated when you sell
                securities. The method you choose can have significant tax implications. Consult with
                a tax professional to determine the best method for your situation. Changes to your
                cost basis method are saved automatically and apply to future transactions.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </PageTransition>
  );
}

export default CostBasisPage;