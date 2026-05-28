/**
 * Documents listing page with category grouping and download simulation
 * Lists documents grouped by category in collapsible sections.
 * Each document row shows name, date, and size. Clicking a row triggers
 * an animated success toast simulating a download.
 * Implements SCRUM-20324: Documents Page with Download Simulation
 * @module DocumentsPage
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  Filter,
  FileText,
  Download,
  ChevronDown,
  ChevronRight,
  File,
  Receipt,
  FileCheck,
  FileWarning,
  ScrollText,
  FolderOpen,
} from 'lucide-react';
import { useDocumentsStore } from '../hooks/useDocumentsStore.js';
import { useSkeletonDelay } from '../hooks/useSkeletonDelay.js';
import { useToast } from '../context/ToastContext.jsx';
import { PageTransition } from '../components/shared/PageTransition.jsx';
import { SkeletonLoader } from '../components/shared/SkeletonLoader.jsx';
import { EmptyState } from '../components/shared/EmptyState.jsx';
import { formatDate } from '../utils/formatters.js';
import { classNames } from '../utils/helpers.js';
import { DOCUMENT_CATEGORY_LABELS } from '../utils/constants.js';

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
 * Collapsible section animation variants.
 * @type {Object}
 */
const collapseVariants = {
  hidden: { height: 0, opacity: 0 },
  visible: {
    height: 'auto',
    opacity: 1,
    transition: {
      height: { type: 'spring', stiffness: 300, damping: 30 },
      opacity: { duration: 0.2 },
    },
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: {
      height: { type: 'spring', stiffness: 300, damping: 30 },
      opacity: { duration: 0.15 },
    },
  },
};

/**
 * Category filter options.
 * @type {Array<{ value: string, label: string }>}
 */
const CATEGORY_FILTER_OPTIONS = [
  { value: 'all', label: 'All Categories' },
  { value: 'statement', label: 'Statements' },
  { value: 'tax', label: 'Tax Documents' },
  { value: 'contract', label: 'Contracts' },
  { value: 'report', label: 'Reports' },
  { value: 'notice', label: 'Notices' },
  { value: 'other', label: 'Other' },
];

/**
 * Returns the icon component for a given document category.
 *
 * @param {string} category - The document category
 * @returns {React.ComponentType} The Lucide icon component
 */
function getCategoryIcon(category) {
  switch (category) {
    case 'statement':
      return Receipt;
    case 'tax':
      return FileCheck;
    case 'contract':
      return ScrollText;
    case 'report':
      return FileText;
    case 'notice':
      return FileWarning;
    default:
      return File;
  }
}

/**
 * Returns badge color classes for a given document category.
 *
 * @param {string} category - The document category
 * @returns {{ bg: string, text: string, icon: string }} Tailwind class strings
 */
function getCategoryBadgeClasses(category) {
  switch (category) {
    case 'statement':
      return {
        bg: 'bg-indigo-100 dark:bg-indigo-950/30',
        text: 'text-indigo-700 dark:text-indigo-300',
        icon: 'text-indigo-600 dark:text-indigo-400',
      };
    case 'tax':
      return {
        bg: 'bg-emerald-100 dark:bg-emerald-950/30',
        text: 'text-emerald-700 dark:text-emerald-300',
        icon: 'text-emerald-600 dark:text-emerald-400',
      };
    case 'contract':
      return {
        bg: 'bg-violet-100 dark:bg-violet-950/30',
        text: 'text-violet-700 dark:text-violet-300',
        icon: 'text-violet-600 dark:text-violet-400',
      };
    case 'report':
      return {
        bg: 'bg-sky-100 dark:bg-sky-950/30',
        text: 'text-sky-700 dark:text-sky-300',
        icon: 'text-sky-600 dark:text-sky-400',
      };
    case 'notice':
      return {
        bg: 'bg-amber-100 dark:bg-amber-950/30',
        text: 'text-amber-700 dark:text-amber-300',
        icon: 'text-amber-600 dark:text-amber-400',
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
 * Documents page component.
 * Renders a filterable, grouped list of documents with collapsible category
 * sections. Clicking a document row triggers a simulated download with a
 * success toast notification.
 *
 * @returns {JSX.Element}
 */
export function DocumentsPage() {
  const {
    documents,
    filteredDocuments,
    groupedDocuments,
    filters,
    setCategoryFilter,
    setSearchQuery,
    resetFilters,
    availableCategories,
    simulateDownload,
  } = useDocumentsStore();

  const { addToast } = useToast();
  const loading = useSkeletonDelay();

  const [expandedCategories, setExpandedCategories] = useState(() => {
    const initial = {};
    CATEGORY_FILTER_OPTIONS.forEach((opt) => {
      if (opt.value !== 'all') {
        initial[opt.value] = true;
      }
    });
    return initial;
  });

  /**
   * Toggles the expanded state of a category section.
   * @param {string} category - The category key to toggle
   */
  const toggleCategory = useCallback((category) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  }, []);

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
   * Handles clicking a document row to simulate download.
   * @param {Object} doc - The document object
   */
  const handleDocumentClick = useCallback(
    (doc) => {
      simulateDownload(doc.id);
      addToast({
        message: `Download started — ${doc.name}`,
        type: 'success',
      });
    },
    [simulateDownload, addToast],
  );

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
          <SkeletonLoader variant="list" rows={6} />
        </div>
      </PageTransition>
    );
  }

  const hasDocuments = documents.length > 0;
  const hasResults = filteredDocuments.length > 0;

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
            Documents
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            View and download your account documents, statements, and tax forms.
          </p>
        </motion.div>

        {hasDocuments ? (
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
                    placeholder="Search documents…"
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
                    aria-label="Search documents"
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
                    Showing {filteredDocuments.length} of {documents.length} document{documents.length !== 1 ? 's' : ''}
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

            {/* Documents grouped by category */}
            <motion.div variants={itemVariants}>
              {hasResults ? (
                <div className="space-y-4">
                  {groupedDocuments.map((group) => {
                    const Icon = getCategoryIcon(group.category);
                    const badgeClasses = getCategoryBadgeClasses(group.category);
                    const isExpanded = expandedCategories[group.category] !== false;

                    return (
                      <div
                        key={group.category}
                        className={classNames(
                          'rounded-xl border overflow-hidden',
                          'bg-white/80 dark:bg-gray-900/80',
                          'backdrop-blur-md',
                          'border-gray-200/60 dark:border-gray-700/60',
                          'shadow-sm dark:shadow-gray-900/20',
                        )}
                      >
                        {/* Category header */}
                        <button
                          type="button"
                          onClick={() => toggleCategory(group.category)}
                          className={classNames(
                            'flex w-full items-center gap-3 px-5 py-4',
                            'hover:bg-gray-50 dark:hover:bg-gray-800/40',
                            'transition-colors duration-150',
                            'focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500',
                          )}
                          aria-expanded={isExpanded}
                          aria-controls={`category-${group.category}`}
                        >
                          <div
                            className={classNames(
                              'flex items-center justify-center w-9 h-9 rounded-lg flex-shrink-0',
                              badgeClasses.bg,
                            )}
                          >
                            <Icon className={classNames('w-5 h-5', badgeClasses.icon)} />
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                              {group.label}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {group.documents.length} document{group.documents.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                          <motion.div
                            animate={{ rotate: isExpanded ? 0 : -90 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                          </motion.div>
                        </button>

                        {/* Category documents */}
                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              id={`category-${group.category}`}
                              initial="hidden"
                              animate="visible"
                              exit="exit"
                              variants={collapseVariants}
                              className="overflow-hidden"
                            >
                              <div className="border-t border-gray-200 dark:border-gray-700">
                                {group.documents.map((doc, docIndex) => (
                                  <motion.button
                                    key={doc.id}
                                    type="button"
                                    onClick={() => handleDocumentClick(doc)}
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                      delay: docIndex * 0.03,
                                      type: 'spring',
                                      stiffness: 300,
                                      damping: 24,
                                    }}
                                    className={classNames(
                                      'flex w-full items-center gap-4 px-5 py-3.5',
                                      'hover:bg-indigo-50/50 dark:hover:bg-indigo-950/10',
                                      'transition-colors duration-150',
                                      'focus:outline-none focus:bg-indigo-50/50 dark:focus:bg-indigo-950/10',
                                      'text-left',
                                      docIndex < group.documents.length - 1 &&
                                        'border-b border-gray-100 dark:border-gray-800',
                                    )}
                                    aria-label={`Download ${doc.name}`}
                                  >
                                    {/* Document icon */}
                                    <FileText className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />

                                    {/* Document details */}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                        {doc.name}
                                      </p>
                                      <div className="flex items-center gap-3 mt-0.5">
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                          {formatDate(doc.date, 'MMM d, yyyy')}
                                        </span>
                                        {doc.size && (
                                          <span className="text-xs text-gray-400 dark:text-gray-500">
                                            {doc.size}
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    {/* Download icon */}
                                    <Download className="w-4 h-4 text-indigo-500 dark:text-indigo-400 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </motion.button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
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
                    title="No documents match your filters"
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
                Showing {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''} across {groupedDocuments.length} categor{groupedDocuments.length !== 1 ? 'ies' : 'y'}
              </motion.div>
            )}
          </>
        ) : (
          <motion.div variants={itemVariants}>
            <EmptyState
              title="No documents yet"
              description="Your account documents, statements, and tax forms will appear here."
              icon={
                <FolderOpen className="w-16 h-16 text-gray-300 dark:text-gray-600" />
              }
            />
          </motion.div>
        )}
      </motion.div>
    </PageTransition>
  );
}

export default DocumentsPage;