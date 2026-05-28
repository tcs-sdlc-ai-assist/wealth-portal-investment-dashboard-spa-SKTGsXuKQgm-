/**
 * Products data access hook with category filtering and search capabilities
 * Implements SCRUM-20325: Products & Services Grid
 * @module useProductsStore
 */

import { useCallback, useMemo, useState } from 'react';
import { MOCK_PRODUCTS } from '../data/mockData.js';
import { PRODUCT_CATEGORY_LABELS } from '../utils/constants.js';

/**
 * @typedef {'all' | 'banking' | 'investing' | 'insurance' | 'lending' | 'retirement' | 'credit_cards'} ProductCategoryFilter
 */

/**
 * @typedef {Object} ProductFilters
 * @property {ProductCategoryFilter} category - Product category filter
 * @property {string} searchQuery - Search query for product name or description
 */

/**
 * @typedef {Object} ProductsStoreValue
 * @property {function(): Array<Object>} getProducts - Returns all products
 * @property {Array<Object>} products - All products (unfiltered)
 * @property {Array<Object>} filteredProducts - Products after filters applied
 * @property {ProductFilters} filters - Current filter state
 * @property {function(ProductCategoryFilter): void} setCategoryFilter - Sets the category filter
 * @property {function(string): void} setSearchQuery - Sets the search query
 * @property {function(): void} resetFilters - Resets all filters to defaults
 * @property {Array<string>} availableCategories - Unique product categories present in the data
 * @property {Object.<string, string>} categoryLabels - Map of category keys to human-readable labels
 * @property {Array<Object>} recommendedProducts - Products marked as recommended
 */

/**
 * Default filter state.
 *
 * @type {ProductFilters}
 */
const DEFAULT_FILTERS = {
  category: 'all',
  searchQuery: '',
};

/**
 * Filters products by category.
 *
 * @param {Array<Object>} products - The products array to filter
 * @param {ProductCategoryFilter} category - The category to filter by
 * @returns {Array<Object>} Filtered products
 */
function filterByCategory(products, category) {
  if (!Array.isArray(products) || products.length === 0) {
    return [];
  }

  if (!category || category === 'all') {
    return products;
  }

  return products.filter((product) => product.category === category);
}

/**
 * Filters products by search query matching against name or description.
 *
 * @param {Array<Object>} products - The products array to filter
 * @param {string} query - The search query
 * @returns {Array<Object>} Filtered products
 */
function filterBySearch(products, query) {
  if (!Array.isArray(products) || products.length === 0) {
    return [];
  }

  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return products;
  }

  const normalised = query.trim().toLowerCase();

  return products.filter((product) => {
    const name = (product.name || '').toLowerCase();
    const description = (product.description || '').toLowerCase();
    const category = (product.category || '').toLowerCase();
    return name.includes(normalised) || description.includes(normalised) || category.includes(normalised);
  });
}

/**
 * Extracts unique product categories from a products array.
 *
 * @param {Array<Object>} products - The products array
 * @returns {Array<string>} Unique category strings
 */
function extractUniqueCategories(products) {
  if (!Array.isArray(products) || products.length === 0) {
    return [];
  }

  const categories = new Set();
  for (const product of products) {
    if (product.category && typeof product.category === 'string') {
      categories.add(product.category);
    }
  }

  return Array.from(categories).sort();
}

/**
 * Custom hook that provides products data access, filtering,
 * and search for the products and services grid.
 *
 * @returns {ProductsStoreValue} Products store methods and state
 */
export function useProductsStore() {
  const [categoryFilter, setCategoryFilter] = useState(DEFAULT_FILTERS.category);
  const [searchQuery, setSearchQuery] = useState(DEFAULT_FILTERS.searchQuery);

  /**
   * Returns all products from mock data.
   *
   * @returns {Array<Object>} The products array
   */
  const getProducts = useCallback(() => {
    return Array.isArray(MOCK_PRODUCTS) ? MOCK_PRODUCTS : [];
  }, []);

  /**
   * Resets all filters to their default values.
   */
  const resetFilters = useCallback(() => {
    setCategoryFilter(DEFAULT_FILTERS.category);
    setSearchQuery(DEFAULT_FILTERS.searchQuery);
  }, []);

  /** All products */
  const products = useMemo(() => getProducts(), [getProducts]);

  /** Unique product categories present in the data */
  const availableCategories = useMemo(() => extractUniqueCategories(products), [products]);

  /** Current filter state */
  const filters = useMemo(
    () => ({
      category: categoryFilter,
      searchQuery,
    }),
    [categoryFilter, searchQuery],
  );

  /** Products after applying all filters */
  const filteredProducts = useMemo(() => {
    let result = products;
    result = filterByCategory(result, categoryFilter);
    result = filterBySearch(result, searchQuery);
    return result;
  }, [products, categoryFilter, searchQuery]);

  /** Products marked as recommended */
  const recommendedProducts = useMemo(() => {
    if (!Array.isArray(products) || products.length === 0) {
      return [];
    }

    return products.filter((product) => product.recommended === true);
  }, [products]);

  return useMemo(
    () => ({
      getProducts,
      products,
      filteredProducts,
      filters,
      setCategoryFilter,
      setSearchQuery,
      resetFilters,
      availableCategories,
      categoryLabels: PRODUCT_CATEGORY_LABELS,
      recommendedProducts,
    }),
    [
      getProducts,
      products,
      filteredProducts,
      filters,
      setCategoryFilter,
      setSearchQuery,
      resetFilters,
      availableCategories,
      recommendedProducts,
    ],
  );
}

export default useProductsStore;