/**
 * Documents data access hook with category grouping and search capabilities
 * Implements SCRUM-20324: Documents Page with Download Simulation
 * @module useDocumentsStore
 */

import { useCallback, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { DOCUMENT_CATEGORY_LABELS } from '../utils/constants.js';

/**
 * @typedef {'all' | 'statement' | 'tax' | 'contract' | 'report' | 'notice' | 'other'} DocumentCategoryFilter
 */

/**
 * @typedef {Object} DocumentFilters
 * @property {DocumentCategoryFilter} category - Document category filter
 * @property {string} searchQuery - Search query for document name
 */

/**
 * @typedef {Object} GroupedDocuments
 * @property {string} category - The category key
 * @property {string} label - The human-readable category label
 * @property {Array<Object>} documents - Documents in this category
 */

/**
 * @typedef {Object} DocumentsStoreValue
 * @property {function(): Array<Object>} getDocuments - Returns all documents for the current user
 * @property {Array<Object>} documents - All documents (unfiltered)
 * @property {Array<Object>} filteredDocuments - Documents after filters applied
 * @property {Array<GroupedDocuments>} groupedDocuments - Filtered documents grouped by category
 * @property {DocumentFilters} filters - Current filter state
 * @property {function(DocumentCategoryFilter): void} setCategoryFilter - Sets the category filter
 * @property {function(string): void} setSearchQuery - Sets the search query
 * @property {function(): void} resetFilters - Resets all filters to defaults
 * @property {Array<string>} availableCategories - Unique document categories present in the data
 * @property {function(string): void} simulateDownload - Simulates downloading a document by id
 */

/**
 * Default filter state.
 *
 * @type {DocumentFilters}
 */
const DEFAULT_FILTERS = {
  category: 'all',
  searchQuery: '',
};

/**
 * Filters documents by category.
 *
 * @param {Array<Object>} documents - The documents array to filter
 * @param {DocumentCategoryFilter} category - The category to filter by
 * @returns {Array<Object>} Filtered documents
 */
function filterByCategory(documents, category) {
  if (!Array.isArray(documents) || documents.length === 0) {
    return [];
  }

  if (!category || category === 'all') {
    return documents;
  }

  return documents.filter((doc) => doc.category === category);
}

/**
 * Filters documents by search query matching against document name.
 *
 * @param {Array<Object>} documents - The documents array to filter
 * @param {string} query - The search query
 * @returns {Array<Object>} Filtered documents
 */
function filterBySearch(documents, query) {
  if (!Array.isArray(documents) || documents.length === 0) {
    return [];
  }

  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return documents;
  }

  const normalised = query.trim().toLowerCase();

  return documents.filter((doc) => {
    const name = (doc.name || '').toLowerCase();
    const category = (doc.category || '').toLowerCase();
    return name.includes(normalised) || category.includes(normalised);
  });
}

/**
 * Sorts documents by date in descending order (most recent first).
 *
 * @param {Array<Object>} documents - The documents array to sort
 * @returns {Array<Object>} A new sorted array
 */
function sortByDateDescending(documents) {
  if (!Array.isArray(documents) || documents.length === 0) {
    return [];
  }

  return [...documents].sort((a, b) => {
    const dateA = a.date ? new Date(a.date).getTime() : 0;
    const dateB = b.date ? new Date(b.date).getTime() : 0;
    return dateB - dateA;
  });
}

/**
 * Groups documents by their category.
 *
 * @param {Array<Object>} documents - The documents array to group
 * @returns {Array<GroupedDocuments>} Documents grouped by category with labels
 */
function groupByCategory(documents) {
  if (!Array.isArray(documents) || documents.length === 0) {
    return [];
  }

  const groups = {};

  for (const doc of documents) {
    const category = doc.category || 'other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(doc);
  }

  return Object.keys(groups)
    .sort()
    .map((category) => ({
      category,
      label: DOCUMENT_CATEGORY_LABELS[category] || category,
      documents: groups[category],
    }));
}

/**
 * Extracts unique document categories from a documents array.
 *
 * @param {Array<Object>} documents - The documents array
 * @returns {Array<string>} Unique category strings
 */
function extractUniqueCategories(documents) {
  if (!Array.isArray(documents) || documents.length === 0) {
    return [];
  }

  const categories = new Set();
  for (const doc of documents) {
    if (doc.category && typeof doc.category === 'string') {
      categories.add(doc.category);
    }
  }

  return Array.from(categories).sort();
}

/**
 * Custom hook that provides documents data access, filtering,
 * grouping, and download simulation for the current user.
 *
 * @returns {DocumentsStoreValue} Documents store methods and state
 * @throws {Error} If used outside of an AuthProvider
 */
export function useDocumentsStore() {
  const { currentUser } = useAuth();

  const [categoryFilter, setCategoryFilter] = useState(DEFAULT_FILTERS.category);
  const [searchQuery, setSearchQuery] = useState(DEFAULT_FILTERS.searchQuery);

  /**
   * Returns all documents for the current user.
   *
   * @returns {Array<Object>} The user's documents array
   */
  const getDocuments = useCallback(() => {
    if (!currentUser) {
      return [];
    }

    return Array.isArray(currentUser.documents) ? currentUser.documents : [];
  }, [currentUser]);

  /**
   * Simulates downloading a document by id.
   * Creates a temporary anchor element to trigger a mock download.
   *
   * @param {string} documentId - The id of the document to download
   */
  const simulateDownload = useCallback(
    (documentId) => {
      if (!currentUser) {
        return;
      }

      const documents = Array.isArray(currentUser.documents) ? currentUser.documents : [];
      const doc = documents.find((d) => d.id === documentId);

      if (!doc) {
        return;
      }

      // Create a simulated text blob for the download
      const content = `Simulated document: ${doc.name}\nCategory: ${doc.category}\nDate: ${doc.date}\nSize: ${doc.size}\n\nThis is a simulated download for demo purposes.`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);

      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${doc.name.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '_')}.txt`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);

      URL.revokeObjectURL(url);
    },
    [currentUser],
  );

  /**
   * Resets all filters to their default values.
   */
  const resetFilters = useCallback(() => {
    setCategoryFilter(DEFAULT_FILTERS.category);
    setSearchQuery(DEFAULT_FILTERS.searchQuery);
  }, []);

  /** All documents for the current user */
  const documents = useMemo(() => getDocuments(), [getDocuments]);

  /** Unique document categories present in the data */
  const availableCategories = useMemo(() => extractUniqueCategories(documents), [documents]);

  /** Current filter state */
  const filters = useMemo(
    () => ({
      category: categoryFilter,
      searchQuery,
    }),
    [categoryFilter, searchQuery],
  );

  /** Documents after applying all filters and sorting by date descending */
  const filteredDocuments = useMemo(() => {
    let result = documents;
    result = filterByCategory(result, categoryFilter);
    result = filterBySearch(result, searchQuery);
    result = sortByDateDescending(result);
    return result;
  }, [documents, categoryFilter, searchQuery]);

  /** Filtered documents grouped by category */
  const groupedDocuments = useMemo(
    () => groupByCategory(filteredDocuments),
    [filteredDocuments],
  );

  return useMemo(
    () => ({
      getDocuments,
      documents,
      filteredDocuments,
      groupedDocuments,
      filters,
      setCategoryFilter,
      setSearchQuery,
      resetFilters,
      availableCategories,
      simulateDownload,
    }),
    [
      getDocuments,
      documents,
      filteredDocuments,
      groupedDocuments,
      filters,
      setCategoryFilter,
      setSearchQuery,
      resetFilters,
      availableCategories,
      simulateDownload,
    ],
  );
}

export default useDocumentsStore;