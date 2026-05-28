/**
 * Accounts dashboard page with portfolio overview, smart insights,
 * animated portfolio value ticker, and interactive donut chart.
 * Shows onboarding widget for new users with empty portfolios.
 * Implements SCRUM-20321: Accounts Dashboard with Smart Insights
 * @module AccountsDashboard
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Lightbulb,
  Wallet,
  ArrowRight,
  Landmark,
  PiggyBank,
  CreditCard,
  BarChart3,
  ChevronRight,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useAuth } from '../context/AuthContext.jsx';
import { usePortfolioStore } from '../hooks/usePortfolioStore.js';
import { useSkeletonDelay } from '../hooks/useSkeletonDelay.js';
import { PageTransition } from '../components/shared/PageTransition.jsx';
import { SkeletonLoader } from '../components/shared/SkeletonLoader.jsx';
import { DataTooltip } from '../components/shared/DataTooltip.jsx';
import { EmptyState } from '../components/shared/EmptyState.jsx';
import { getGreeting, formatCurrency, formatPercent } from '../utils/formatters.js';
import { classNames } from '../utils/helpers.js';
import { ROUTES, ACCOUNT_TYPE_LABELS, CHART_COLORS } from '../utils/constants.js';

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
 * Returns the icon component for a given account type.
 *
 * @param {string} type - The account type
 * @returns {React.ComponentType} The Lucide icon component
 */
function getAccountIcon(type) {
  switch (type) {
    case 'checking':
      return Wallet;
    case 'savings':
      return PiggyBank;
    case 'investment':
      return BarChart3;
    case 'retirement':
      return Landmark;
    case 'credit':
    case 'loan':
      return CreditCard;
    default:
      return Wallet;
  }
}

/**
 * Returns badge color classes for a given account type.
 *
 * @param {string} type - The account type
 * @returns {{ bg: string, text: string }} Tailwind class strings
 */
function getAccountBadgeClasses(type) {
  switch (type) {
    case 'checking':
      return { bg: 'bg-indigo-100 dark:bg-indigo-950/30', text: 'text-indigo-700 dark:text-indigo-300' };
    case 'savings':
      return { bg: 'bg-emerald-100 dark:bg-emerald-950/30', text: 'text-emerald-700 dark:text-emerald-300' };
    case 'investment':
      return { bg: 'bg-sky-100 dark:bg-sky-950/30', text: 'text-sky-700 dark:text-sky-300' };
    case 'retirement':
      return { bg: 'bg-violet-100 dark:bg-violet-950/30', text: 'text-violet-700 dark:text-violet-300' };
    case 'credit':
      return { bg: 'bg-rose-100 dark:bg-rose-950/30', text: 'text-rose-700 dark:text-rose-300' };
    case 'loan':
      return { bg: 'bg-amber-100 dark:bg-amber-950/30', text: 'text-amber-700 dark:text-amber-300' };
    default:
      return { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300' };
  }
}

/**
 * Animated number ticker component that counts from 0 to a target value.
 *
 * @param {Object} props
 * @param {number} props.value - The target value to animate to
 * @param {number} [props.duration=1500] - Animation duration in milliseconds
 * @param {string} [props.className] - Additional classes
 * @returns {JSX.Element}
 */
function AnimatedValue({ value, duration = 1500, className }) {
  const [displayValue, setDisplayValue] = useState(0);
  const rafRef = useRef(null);
  const startTimeRef = useRef(null);
  const startValueRef = useRef(0);

  useEffect(() => {
    if (!Number.isFinite(value)) {
      setDisplayValue(0);
      return;
    }

    startValueRef.current = displayValue;
    startTimeRef.current = null;

    function animate(timestamp) {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startValueRef.current + (value - startValueRef.current) * eased;

      setDisplayValue(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    }

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  return (
    <span className={className}>
      {formatCurrency(displayValue)}
    </span>
  );
}

/**
 * Onboarding steps for new users with empty portfolios.
 * @type {Array<{ title: string, description: string, completed: boolean }>}
 */
const ONBOARDING_STEPS = [
  {
    title: 'Complete your profile',
    description: 'Add your personal information and preferences.',
    path: ROUTES.PROFILE,
  },
  {
    title: 'Link a bank account',
    description: 'Connect your bank to fund your portfolio.',
    path: ROUTES.SETTINGS,
  },
  {
    title: 'Explore products',
    description: 'Browse investment products and services.',
    path: ROUTES.PRODUCTS,
  },
];

/**
 * Smart onboarding widget for new users with empty portfolios.
 *
 * @param {Object} props
 * @param {function} props.onNavigate - Callback to navigate to a route
 * @returns {JSX.Element}
 */
function OnboardingWidget({ onNavigate }) {
  return (
    <motion.div
      variants={itemVariants}
      className={classNames(
        'rounded-xl border p-6',
        'bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/20 dark:to-gray-900',
        'border-indigo-200/60 dark:border-indigo-800/40',
      )}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-950/40">
          <Lightbulb className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            Get Started
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Complete these steps to set up your account.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {ONBOARDING_STEPS.map((step, index) => (
          <button
            key={step.title}
            type="button"
            onClick={() => onNavigate(step.path)}
            className={classNames(
              'flex w-full items-center gap-3 rounded-lg px-4 py-3',
              'bg-white/80 dark:bg-gray-800/60',
              'border border-gray-200/60 dark:border-gray-700/40',
              'hover:bg-indigo-50 dark:hover:bg-indigo-950/20',
              'transition-colors duration-150',
              'text-left',
              'focus:outline-none focus:ring-2 focus:ring-indigo-500',
            )}
          >
            <span
              className={classNames(
                'flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold flex-shrink-0',
                'bg-indigo-100 dark:bg-indigo-950/40',
                'text-indigo-600 dark:text-indigo-400',
              )}
            >
              {index + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {step.title}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {step.description}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
          </button>
        ))}
      </div>
    </motion.div>
  );
}

/**
 * Custom center label for the donut chart.
 *
 * @param {Object} props
 * @param {string|null} props.hoveredName - The name of the hovered slice
 * @param {number|null} props.hoveredValue - The value of the hovered slice
 * @param {number|null} props.hoveredPercentage - The percentage of the hovered slice
 * @param {number} props.totalValue - The total portfolio market value
 * @returns {JSX.Element}
 */
function DonutCenterLabel({ hoveredName, hoveredValue, hoveredPercentage, totalValue }) {
  if (hoveredName) {
    return (
      <div className="text-center">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate max-w-[120px]">
          {hoveredName}
        </p>
        <p className="text-lg font-bold text-gray-900 dark:text-gray-100 tabular-nums">
          {formatCurrency(hoveredValue)}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 tabular-nums">
          {hoveredPercentage !== null ? formatPercent(hoveredPercentage) : ''}
        </p>
      </div>
    );
  }

  return (
    <div className="text-center">
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
        Total Value
      </p>
      <p className="text-lg font-bold text-gray-900 dark:text-gray-100 tabular-nums">
        {formatCurrency(totalValue)}
      </p>
    </div>
  );
}

/**
 * Accounts dashboard page component.
 * Shows a dynamic greeting, animated portfolio value, smart insights,
 * interactive donut chart, and account cards. For new users with empty
 * portfolios, shows an onboarding widget.
 *
 * @returns {JSX.Element}
 */
export function AccountsDashboard() {
  const { currentUser } = useAuth();
  const { portfolio } = usePortfolioStore();
  const navigate = useNavigate();
  const loading = useSkeletonDelay();

  const [hoveredSlice, setHoveredSlice] = useState(null);

  const greeting = useMemo(() => {
    return getGreeting(currentUser?.firstName);
  }, [currentUser?.firstName]);

  const hasPortfolio = useMemo(() => {
    return portfolio.holdings.length > 0;
  }, [portfolio.holdings]);

  const hasAccounts = useMemo(() => {
    return portfolio.accounts.length > 0;
  }, [portfolio.accounts]);

  /**
   * Handles navigation to a given route.
   * @param {string} path - The route path
   */
  const handleNavigate = useCallback(
    (path) => {
      navigate(path);
    },
    [navigate],
  );

  /**
   * Handles donut chart slice mouse enter.
   * @param {Object} data - The slice data
   * @param {number} index - The slice index
   */
  const handlePieEnter = useCallback((data, index) => {
    setHoveredSlice({
      name: data.name || data.symbol,
      value: data.value,
      percentage: data.percentage,
      index,
    });
  }, []);

  /**
   * Handles donut chart slice mouse leave.
   */
  const handlePieLeave = useCallback(() => {
    setHoveredSlice(null);
  }, []);

  if (loading) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <SkeletonLoader variant="text" lines={2} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SkeletonLoader variant="card" />
            <SkeletonLoader variant="chart" />
          </div>
          <SkeletonLoader variant="card" count={3} />
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
        {/* Greeting header */}
        <motion.div variants={itemVariants}>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            {greeting}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Here&apos;s an overview of your financial portfolio.
          </p>
        </motion.div>

        {/* Portfolio summary cards */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {/* Total Account Value */}
          <div
            className={classNames(
              'rounded-xl border p-5',
              'bg-white/80 dark:bg-gray-900/80',
              'backdrop-blur-md',
              'border-gray-200/60 dark:border-gray-700/60',
              'shadow-sm dark:shadow-gray-900/20',
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Account Value
              </span>
            </div>
            <AnimatedValue
              value={portfolio.totalAccountValue}
              className="text-xl font-bold text-gray-900 dark:text-gray-100 tabular-nums"
            />
          </div>

          {/* Total Market Value */}
          <div
            className={classNames(
              'rounded-xl border p-5',
              'bg-white/80 dark:bg-gray-900/80',
              'backdrop-blur-md',
              'border-gray-200/60 dark:border-gray-700/60',
              'shadow-sm dark:shadow-gray-900/20',
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Market Value
              </span>
            </div>
            <AnimatedValue
              value={portfolio.totalMarketValue}
              className="text-xl font-bold text-gray-900 dark:text-gray-100 tabular-nums"
            />
          </div>

          {/* Total Gain/Loss */}
          <div
            className={classNames(
              'rounded-xl border p-5',
              'bg-white/80 dark:bg-gray-900/80',
              'backdrop-blur-md',
              'border-gray-200/60 dark:border-gray-700/60',
              'shadow-sm dark:shadow-gray-900/20',
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              {portfolio.isGain ? (
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-rose-500" />
              )}
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Gain / Loss
              </span>
            </div>
            <p
              className={classNames(
                'text-xl font-bold tabular-nums',
                portfolio.isGain
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400',
              )}
            >
              {portfolio.isGain ? '+' : ''}
              {formatCurrency(portfolio.totalGainLossDollar)}
            </p>
            <p
              className={classNames(
                'text-xs tabular-nums mt-0.5',
                portfolio.isGain
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400',
              )}
            >
              {portfolio.isGain ? '+' : ''}
              {formatPercent(portfolio.totalGainLossPercent)}
            </p>
          </div>

          {/* Holdings Count */}
          <div
            className={classNames(
              'rounded-xl border p-5',
              'bg-white/80 dark:bg-gray-900/80',
              'backdrop-blur-md',
              'border-gray-200/60 dark:border-gray-700/60',
              'shadow-sm dark:shadow-gray-900/20',
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <Landmark className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Holdings
              </span>
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-gray-100 tabular-nums">
              {portfolio.holdings.length}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {portfolio.accounts.length} account{portfolio.accounts.length !== 1 ? 's' : ''}
            </p>
          </div>
        </motion.div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Smart Insights */}
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
              <Lightbulb className="w-5 h-5 text-amber-500" />
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                Smart Insights
              </h2>
            </div>

            {portfolio.smartInsights.length > 0 ? (
              <ul className="space-y-3">
                {portfolio.smartInsights.map((insight, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2.5"
                  >
                    <span
                      className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0"
                      aria-hidden="true"
                    />
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      {insight}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No insights available at this time.
              </p>
            )}
          </motion.div>

          {/* Donut Chart - Allocation */}
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                Portfolio Allocation
              </h2>
              {hasPortfolio && (
                <button
                  type="button"
                  onClick={() => handleNavigate(ROUTES.ACCOUNTS)}
                  className={classNames(
                    'inline-flex items-center gap-1 text-xs font-medium',
                    'text-indigo-600 dark:text-indigo-400',
                    'hover:text-indigo-700 dark:hover:text-indigo-300',
                    'transition-colors duration-150',
                  )}
                >
                  <span>View Holdings</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {hasPortfolio ? (
              <div className="relative flex items-center justify-center">
                <div className="w-full" style={{ height: 240 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={portfolio.allocation}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={2}
                        dataKey="value"
                        nameKey="name"
                        onMouseEnter={handlePieEnter}
                        onMouseLeave={handlePieLeave}
                        stroke="none"
                      >
                        {portfolio.allocation.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]}
                            opacity={
                              hoveredSlice !== null && hoveredSlice.index !== index
                                ? 0.5
                                : 1
                            }
                            style={{ transition: 'opacity 0.2s ease' }}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        content={<DataTooltip valueFormat="currency" />}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Center label overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <DonutCenterLabel
                    hoveredName={hoveredSlice?.name || null}
                    hoveredValue={hoveredSlice?.value || null}
                    hoveredPercentage={hoveredSlice?.percentage || null}
                    totalValue={portfolio.totalMarketValue}
                  />
                </div>
              </div>
            ) : (
              <EmptyState
                title="No holdings yet"
                description="Add investments to see your portfolio allocation."
                compact
              />
            )}

            {/* Legend */}
            {hasPortfolio && (
              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
                {portfolio.allocation.map((entry, index) => (
                  <div
                    key={`legend-${index}`}
                    className="flex items-center gap-1.5"
                  >
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor:
                          entry.color || CHART_COLORS[index % CHART_COLORS.length],
                      }}
                      aria-hidden="true"
                    />
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {entry.symbol}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Onboarding widget for new users */}
        {!hasPortfolio && !hasAccounts && (
          <OnboardingWidget onNavigate={handleNavigate} />
        )}

        {/* Account cards */}
        {hasAccounts && (
          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                Your Accounts
              </h2>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {portfolio.accounts.length} account{portfolio.accounts.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {portfolio.accounts.map((account) => {
                const Icon = getAccountIcon(account.type);
                const badgeClasses = getAccountBadgeClasses(account.type);
                const isNegative = account.balance < 0;

                return (
                  <motion.div
                    key={account.id}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className={classNames(
                      'rounded-xl border p-5',
                      'bg-white/80 dark:bg-gray-900/80',
                      'backdrop-blur-md',
                      'border-gray-200/60 dark:border-gray-700/60',
                      'shadow-sm hover:shadow-md dark:shadow-gray-900/20',
                      'transition-shadow duration-200',
                      'cursor-default',
                    )}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={classNames(
                          'flex items-center justify-center w-9 h-9 rounded-lg',
                          badgeClasses.bg,
                        )}
                      >
                        <Icon className={classNames('w-4.5 h-4.5', badgeClasses.text)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {account.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {account.accountNumber}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                          Balance
                        </p>
                        <p
                          className={classNames(
                            'text-lg font-bold tabular-nums',
                            isNegative
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-gray-900 dark:text-gray-100',
                          )}
                        >
                          {formatCurrency(account.balance)}
                        </p>
                      </div>
                      <span
                        className={classNames(
                          'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                          badgeClasses.bg,
                          badgeClasses.text,
                        )}
                      >
                        {ACCOUNT_TYPE_LABELS[account.type] || account.type}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </motion.div>
    </PageTransition>
  );
}

export default AccountsDashboard;