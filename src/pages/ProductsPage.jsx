/**
 * Products & Services grid page with category filtering and search
 * Displays a responsive grid of product/service cards with icons,
 * descriptions, features, and hover animations via Framer Motion.
 * Implements SCRUM-20325: Products & Services Grid
 * @module ProductsPage
 */

import { useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  X,
  Filter,
  Star,
  Landmark,
  TrendingUp,
  Shield,
  CreditCard,
  PiggyBank,
  Banknote,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useProductsStore } from '../hooks/useProductsStore.js';
import { useSkeletonDelay } from '../hooks/useSkeletonDelay.js';
import { PageTransition } from '../components/shared/PageTransition.jsx';
import { SkeletonLoader } from '../components/shared/SkeletonLoader.jsx';
import { EmptyState } from '../components/shared/EmptyState.jsx';
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
 * Category filter options.
 * @type {Array<{ value: string, label: string }>}
 */
const CATEGORY_FILTER_OPTIONS = [
  { value: 'all', label: 'All Categories' },
  { value: 'banking', label: 'Banking' },
  { value: 'investing', label: 'Investing' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'lending', label: 'Lending' },
  { value: 'retirement', label: 'Retirement' },
  { value: 'credit_cards', label: 'Credit Cards' },
];

/**
 * Returns the icon component for a given product category.
 *
 * @param {string} category - The product category
 * @returns {React.ComponentType} The Lucide icon component
 */
function getCategoryIcon(category) {
  switch (category) {
    case 'banking':
      return Landmark;
    case 'investing':
      return TrendingUp;
    case 'insurance':
      return Shield;
    case 'lending':
      return Banknote;
    case 'retirement':
      return PiggyBank;
    case 'credit_cards':
      return CreditCard;
    default:
      return Landmark;
  }
}

/**
 * Returns badge color classes for a given product category.
 *
 * @param {string} category - The product category
 * @returns {{ bg: string, text: string, icon: string }} Tailwind class strings
 */
function getCategoryBadgeClasses(category) {
  switch (category) {
    case 'banking':
      return {
        bg: 'bg-indigo-100 dark:bg-indigo-950/30',
        text: 'text-indigo-700 dark:text-indigo-300',
        icon: 'text-indigo-600 dark:text-indigo-400',
      };
    case 'investing':
      return {
        bg: 'bg-emerald-100 dark:bg-emerald-950/30',
        text: 'text-emerald-700 dark:text-emerald-300',
        icon: 'text-emerald-600 dark:text-emerald-400',
      };
    case 'insurance':
      return {
        bg: 'bg-violet-100 dark:bg-violet-950/30',
        text: 'text-violet-700 dark:text-violet-300',
        icon: 'text-violet-600 dark:text-violet-400',
      };
    case 'lending':
      return {
        bg: 'bg-amber-100 dark:bg-amber-950/30',
        text: 'text-amber-700 dark:text-amber-300',
        icon: 'text-amber-600 dark:text-amber-400',
      };
    case 'retirement':
      return {
        bg: 'bg-sky-100 dark:bg-sky-950/30',
        text: 'text-sky-700 dark:text-sky-300',
        icon: 'text-sky-600 dark:text-sky-400',
      };
    case 'credit_cards':
      return {
        bg: 'bg-rose-100 dark:bg-rose-950/30',
        text: 'text-rose-700 dark:text-rose-300',
        icon: 'text-rose-600 dark:text-rose-400',
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
 * Products & Services page component.
 * Renders a filterable, responsive grid of product/service cards with
 * icons, descriptions, features, rate/pricing info, and hover animations.
 * Highlights recommended products with a badge.
 *
 * @returns {JSX.Element}
 */
export function ProductsPage() {
  const {
    products,
    filteredProducts,
    filters,
    setCategoryFilter,
    setSearchQuery,
    resetFilters,
    categoryLabels,
    recommendedProducts,
  } = useProductsStore();

  const loading = useSkeletonDelay();

  /**
   * Handles category filter change.
   * @param {React.ChangeEvent<HTMLSelectElement>} event
   */
  const handleCategoryChange = useCallback(
    (event) => {
      setCategoryFilter(event.target.value);
    },
    [setCategoryFilter],
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
   * Checks if any filters are active.
   * @returns {boolean}
   */
  const hasActiveFilters =
    filters.category !== 'all' || filters.searchQuery !== '';

  if (loading) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <SkeletonLoader variant="text" lines={2} />
          <SkeletonLoader variant="card" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <SkeletonLoader variant="card" count={6} />
          </div>
        </div>
      </PageTransition>
    );
  }

  const hasProducts = products.length > 0;
  const hasResults = filteredProducts.length > 0;

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
            Products & Services
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Explore our range of financial products and services tailored to your needs.
          </p>
        </motion.div>

        {/* Recommended products banner */}
        {recommendedProducts.length > 0 && !hasActiveFilters && (
          <motion.div
            variants={itemVariants}
            className={classNames(
              'rounded-xl border p-5',
              'bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/20 dark:to-gray-900',
              'border-indigo-200/60 dark:border-indigo-800/40',
            )}
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Recommended for You
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {recommendedProducts.map((product) => (
                <span
                  key={product.id}
                  className={classNames(
                    'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium',
                    'bg-indigo-100 dark:bg-indigo-950/40',
                    'text-indigo-700 dark:text-indigo-300',
                  )}
                >
                  <Star className="w-3 h-3" />
                  {product.name}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {hasProducts ? (
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Search input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
                  <input
                    type="text"
                    value={filters.searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Search products…"
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
                    aria-label="Search products"
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

                {/* Category dropdown */}
                <div className="relative">
                  <select
                    value={filters.category}
                    onChange={handleCategoryChange}
                    className={classNames(
                      'block w-full rounded-lg border px-3 py-2.5 text-sm appearance-none',
                      'bg-white dark:bg-gray-800',
                      'text-gray-900 dark:text-gray-100',
                      'border-gray-300 dark:border-gray-600',
                      'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
                      'focus:ring-offset-1 dark:focus:ring-offset-gray-900',
                      'transition-colors duration-150',
                    )}
                    aria-label="Filter by category"
                  >
                    {CATEGORY_FILTER_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Reset filters */}
              {hasActiveFilters && (
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Showing {filteredProducts.length} of {products.length} product{products.length !== 1 ? 's' : ''}
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

            {/* Products grid */}
            <motion.div variants={itemVariants}>
              {hasResults ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProducts.map((product) => {
                    const Icon = getCategoryIcon(product.category);
                    const badgeClasses = getCategoryBadgeClasses(product.category);
                    const categoryLabel = categoryLabels[product.category] || product.category;

                    return (
                      <motion.div
                        key={product.id}
                        whileHover={{ scale: 1.03, y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{
                          type: 'spring',
                          stiffness: 300,
                          damping: 24,
                        }}
                        className={classNames(
                          'relative flex flex-col rounded-xl border p-5',
                          'bg-white/80 dark:bg-gray-900/80',
                          'backdrop-blur-md',
                          'border-gray-200/60 dark:border-gray-700/60',
                          'shadow-sm hover:shadow-lg dark:shadow-gray-900/20 dark:hover:shadow-gray-900/40',
                          'transition-shadow duration-200',
                          'cursor-default',
                        )}
                      >
                        {/* Recommended badge */}
                        {product.recommended && (
                          <div className="absolute top-3 right-3">
                            <span
                              className={classNames(
                                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                                'bg-amber-100 dark:bg-amber-950/30',
                                'text-amber-700 dark:text-amber-300',
                              )}
                            >
                              <Star className="w-3 h-3" />
                              Recommended
                            </span>
                          </div>
                        )}

                        {/* Icon and category */}
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className={classNames(
                              'flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0',
                              badgeClasses.bg,
                            )}
                          >
                            <Icon className={classNames('w-5 h-5', badgeClasses.icon)} />
                          </div>
                          <span
                            className={classNames(
                              'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                              badgeClasses.bg,
                              badgeClasses.text,
                            )}
                          >
                            {categoryLabel}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1.5">
                          {product.name}
                        </h3>

                        {/* Description */}
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-4 flex-1">
                          {product.description}
                        </p>

                        {/* Features */}
                        {Array.isArray(product.features) && product.features.length > 0 && (
                          <ul className="space-y-1.5 mb-4">
                            {product.features.map((feature, index) => (
                              <li
                                key={index}
                                className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-300"
                              >
                                <span
                                  className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0"
                                  aria-hidden="true"
                                />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        )}

                        {/* Rate / Min Investment */}
                        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100 dark:border-gray-800">
                          <div>
                            {product.rate && (
                              <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                                {product.rate}
                              </p>
                            )}
                            {product.minInvestment !== null && product.minInvestment !== undefined && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {product.minInvestment === 0
                                  ? 'No minimum'
                                  : `Min. $${product.minInvestment.toLocaleString('en-US')}`}
                              </p>
                            )}
                            {!product.rate && (product.minInvestment === null || product.minInvestment === undefined) && (
                              <p className="text-xs text-gray-400 dark:text-gray-500">
                                Contact for details
                              </p>
                            )}
                          </div>
                          <div
                            className={classNames(
                              'inline-flex items-center gap-1 text-xs font-medium',
                              'text-indigo-600 dark:text-indigo-400',
                            )}
                          >
                            <span>Learn more</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </div>
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
                    title="No products match your filters"
                    description="Try adjusting your search or category filter."
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
                Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
              </motion.div>
            )}
          </>
        ) : (
          <motion.div variants={itemVariants}>
            <EmptyState
              title="No products available"
              description="Financial products and services will appear here."
            />
          </motion.div>
        )}
      </motion.div>
    </PageTransition>
  );
}

export default ProductsPage;