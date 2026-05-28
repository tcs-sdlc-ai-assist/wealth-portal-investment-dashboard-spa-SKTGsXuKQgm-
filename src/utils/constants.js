/**
 * Application-wide constants and configuration values
 * @module constants
 */

// ---------------------------------------------------------------------------
// Local-storage keys
// ---------------------------------------------------------------------------

/** @type {string} Key used to persist the list of registered users */
export const USERS_KEY = 'wealth_portal_users';

/** @type {string} Key used to persist the currently authenticated user */
export const CURRENT_USER_KEY = 'wealth_portal_current_user';

/** @type {string} Key used to persist the selected theme (light / dark) */
export const THEME_KEY = 'wealth_portal_theme';

// ---------------------------------------------------------------------------
// Route paths
// ---------------------------------------------------------------------------

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  ACCOUNTS: '/accounts',
  ACCOUNT_DETAIL: '/accounts/:id',
  TRANSACTIONS: '/transactions',
  DOCUMENTS: '/documents',
  PRODUCTS: '/products',
  SETTINGS: '/settings',
  PROFILE: '/profile',
  NOT_FOUND: '*',
};

// ---------------------------------------------------------------------------
// Account types
// ---------------------------------------------------------------------------

export const ACCOUNT_TYPES = {
  CHECKING: 'checking',
  SAVINGS: 'savings',
  INVESTMENT: 'investment',
  RETIREMENT: 'retirement',
  CREDIT: 'credit',
  LOAN: 'loan',
};

export const ACCOUNT_TYPE_LABELS = {
  [ACCOUNT_TYPES.CHECKING]: 'Checking',
  [ACCOUNT_TYPES.SAVINGS]: 'Savings',
  [ACCOUNT_TYPES.INVESTMENT]: 'Investment',
  [ACCOUNT_TYPES.RETIREMENT]: 'Retirement',
  [ACCOUNT_TYPES.CREDIT]: 'Credit',
  [ACCOUNT_TYPES.LOAN]: 'Loan',
};

// ---------------------------------------------------------------------------
// Transaction types
// ---------------------------------------------------------------------------

export const TRANSACTION_TYPES = {
  DEPOSIT: 'deposit',
  WITHDRAWAL: 'withdrawal',
  TRANSFER: 'transfer',
  PAYMENT: 'payment',
  FEE: 'fee',
  INTEREST: 'interest',
  DIVIDEND: 'dividend',
  REFUND: 'refund',
};

export const TRANSACTION_TYPE_LABELS = {
  [TRANSACTION_TYPES.DEPOSIT]: 'Deposit',
  [TRANSACTION_TYPES.WITHDRAWAL]: 'Withdrawal',
  [TRANSACTION_TYPES.TRANSFER]: 'Transfer',
  [TRANSACTION_TYPES.PAYMENT]: 'Payment',
  [TRANSACTION_TYPES.FEE]: 'Fee',
  [TRANSACTION_TYPES.INTEREST]: 'Interest',
  [TRANSACTION_TYPES.DIVIDEND]: 'Dividend',
  [TRANSACTION_TYPES.REFUND]: 'Refund',
};

// ---------------------------------------------------------------------------
// Document categories
// ---------------------------------------------------------------------------

export const DOCUMENT_CATEGORIES = {
  STATEMENT: 'statement',
  TAX: 'tax',
  CONTRACT: 'contract',
  REPORT: 'report',
  NOTICE: 'notice',
  OTHER: 'other',
};

export const DOCUMENT_CATEGORY_LABELS = {
  [DOCUMENT_CATEGORIES.STATEMENT]: 'Statement',
  [DOCUMENT_CATEGORIES.TAX]: 'Tax',
  [DOCUMENT_CATEGORIES.CONTRACT]: 'Contract',
  [DOCUMENT_CATEGORIES.REPORT]: 'Report',
  [DOCUMENT_CATEGORIES.NOTICE]: 'Notice',
  [DOCUMENT_CATEGORIES.OTHER]: 'Other',
};

// ---------------------------------------------------------------------------
// Product categories
// ---------------------------------------------------------------------------

export const PRODUCT_CATEGORIES = {
  BANKING: 'banking',
  INVESTING: 'investing',
  INSURANCE: 'insurance',
  LENDING: 'lending',
  RETIREMENT: 'retirement',
  CREDIT_CARDS: 'credit_cards',
};

export const PRODUCT_CATEGORY_LABELS = {
  [PRODUCT_CATEGORIES.BANKING]: 'Banking',
  [PRODUCT_CATEGORIES.INVESTING]: 'Investing',
  [PRODUCT_CATEGORIES.INSURANCE]: 'Insurance',
  [PRODUCT_CATEGORIES.LENDING]: 'Lending',
  [PRODUCT_CATEGORIES.RETIREMENT]: 'Retirement',
  [PRODUCT_CATEGORIES.CREDIT_CARDS]: 'Credit Cards',
};

// ---------------------------------------------------------------------------
// Theme
// ---------------------------------------------------------------------------

/** @type {'light' | 'dark'} */
export const DEFAULT_THEME = 'light';

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
};

// ---------------------------------------------------------------------------
// Skeleton / loading delay range (ms)
// ---------------------------------------------------------------------------

/** @type {number} Minimum skeleton display time in milliseconds */
export const SKELETON_DELAY_MIN = 400;

/** @type {number} Maximum skeleton display time in milliseconds */
export const SKELETON_DELAY_MAX = 600;

// ---------------------------------------------------------------------------
// Color palette
// ---------------------------------------------------------------------------

export const COLORS = {
  INDIGO: '#4f46e5',
  EMERALD: '#10b981',
  ROSE: '#f43f5e',
  AMBER: '#f59e0b',
  SKY: '#0ea5e9',
  VIOLET: '#8b5cf6',
  TEAL: '#14b8a6',
  ORANGE: '#f97316',
  PINK: '#ec4899',
  CYAN: '#06b6d4',
};

/** Ordered palette useful for chart series */
export const CHART_COLORS = [
  COLORS.INDIGO,
  COLORS.EMERALD,
  COLORS.ROSE,
  COLORS.AMBER,
  COLORS.SKY,
  COLORS.VIOLET,
  COLORS.TEAL,
  COLORS.ORANGE,
  COLORS.PINK,
  COLORS.CYAN,
];

// ---------------------------------------------------------------------------
// Validation rules
// ---------------------------------------------------------------------------

/** @type {number} Minimum password length */
export const PASSWORD_MIN_LENGTH = 8;

/** @type {RegExp} RFC-5322-ish email validation pattern */
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/** @type {RegExp} Accepts common phone formats: +1 (555) 123-4567, 555-123-4567, etc. */
export const PHONE_REGEX = /^\+?[0-9\s\-().]{7,20}$/;

// ---------------------------------------------------------------------------
// Currency & locale defaults (can be overridden via env)
// ---------------------------------------------------------------------------

export const DEFAULT_CURRENCY = import.meta.env.VITE_DEFAULT_CURRENCY || 'USD';
export const DEFAULT_LOCALE = import.meta.env.VITE_DEFAULT_LOCALE || 'en-US';

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';