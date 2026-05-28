/**
 * Pre-seeded mock data for the Wealth Portal application
 * Implements FR-004: Pre-seeded Mock Users
 * @module mockData
 */

import { generateId, generateSparklineData, calculateGainLoss } from '../utils/helpers.js';
import {
  ACCOUNT_TYPES,
  TRANSACTION_TYPES,
  DOCUMENT_CATEGORIES,
  PRODUCT_CATEGORIES,
} from '../utils/constants.js';

// ---------------------------------------------------------------------------
// Helper – build a holding with computed fields
// ---------------------------------------------------------------------------

/**
 * Creates a holding object with computed market value, gain/loss, and sparkline data.
 *
 * @param {Object} params - Holding parameters
 * @param {string} params.symbol - Ticker symbol
 * @param {string} params.name - Company / fund name
 * @param {number} params.qty - Number of shares
 * @param {number} params.avgCost - Average cost per share
 * @param {number} params.currentPrice - Current market price per share
 * @returns {Object} Fully computed holding object
 */
function createHolding({ symbol, name, qty, avgCost, currentPrice }) {
  const mktValue = Math.round(qty * currentPrice * 100) / 100;
  const costBasis = Math.round(qty * avgCost * 100) / 100;
  const { amount: gainLossDollar, percentage: gainLossPercent, isGain } = calculateGainLoss(mktValue, costBasis);
  const sparklineData = generateSparklineData(currentPrice, 0.03);

  return {
    id: generateId(),
    symbol,
    name,
    qty,
    avgCost,
    currentPrice,
    mktValue,
    costBasis,
    gainLossDollar,
    gainLossPercent,
    isGain,
    sparklineData,
  };
}

/**
 * Creates an activity / transaction entry.
 *
 * @param {Object} params - Activity parameters
 * @param {string} params.date - ISO date string
 * @param {string} params.type - Transaction type from TRANSACTION_TYPES
 * @param {string} params.description - Human-readable description
 * @param {string} [params.symbol] - Ticker symbol (if applicable)
 * @param {number} [params.qty] - Number of shares (if applicable)
 * @param {number} [params.price] - Price per share (if applicable)
 * @param {number} params.amount - Total transaction amount
 * @param {string} [params.accountId] - Related account id
 * @returns {Object} Activity object
 */
function createActivity({ date, type, description, symbol, qty, price, amount, accountId }) {
  return {
    id: generateId(),
    date,
    type,
    description,
    symbol: symbol || null,
    qty: qty || null,
    price: price || null,
    amount,
    accountId: accountId || null,
  };
}

/**
 * Creates a document entry.
 *
 * @param {Object} params - Document parameters
 * @param {string} params.name - Document name
 * @param {string} params.category - Document category from DOCUMENT_CATEGORIES
 * @param {string} params.date - ISO date string
 * @param {string} params.size - Human-readable file size
 * @returns {Object} Document object
 */
function createDocument({ name, category, date, size }) {
  return {
    id: generateId(),
    name,
    category,
    date,
    size,
  };
}

// ---------------------------------------------------------------------------
// Mock Users
// ---------------------------------------------------------------------------

/** @type {Array<Object>} Pre-seeded mock users */
export const MOCK_USERS = [
  // ---- User 1: Jane Doe ----
  {
    id: 'usr-001',
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane.doe@example.com',
    phone: '+1 (555) 123-4567',
    password: 'Password1!',
    dob: '1990-05-15',
    accountType: 'Individual',
    avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=Jane',
    lastLoginAt: '2024-06-10T14:32:00.000Z',
    accounts: [
      {
        id: 'acc-001-chk',
        type: ACCOUNT_TYPES.CHECKING,
        name: 'Primary Checking',
        balance: 12450.75,
        accountNumber: '****4521',
      },
      {
        id: 'acc-001-sav',
        type: ACCOUNT_TYPES.SAVINGS,
        name: 'High-Yield Savings',
        balance: 45200.0,
        accountNumber: '****8832',
      },
      {
        id: 'acc-001-inv',
        type: ACCOUNT_TYPES.INVESTMENT,
        name: 'Brokerage Account',
        balance: 128750.42,
        accountNumber: '****6190',
      },
    ],
    holdings: [
      createHolding({ symbol: 'AAPL', name: 'Apple Inc.', qty: 50, avgCost: 145.0, currentPrice: 195.89 }),
      createHolding({ symbol: 'MSFT', name: 'Microsoft Corp.', qty: 30, avgCost: 280.0, currentPrice: 425.52 }),
      createHolding({ symbol: 'GOOGL', name: 'Alphabet Inc.', qty: 20, avgCost: 120.0, currentPrice: 176.33 }),
      createHolding({ symbol: 'VOO', name: 'Vanguard S&P 500 ETF', qty: 40, avgCost: 380.0, currentPrice: 502.14 }),
      createHolding({ symbol: 'BND', name: 'Vanguard Total Bond ETF', qty: 100, avgCost: 74.5, currentPrice: 72.18 }),
    ],
    activity: [
      createActivity({ date: '2024-06-10T10:15:00.000Z', type: TRANSACTION_TYPES.DEPOSIT, description: 'Direct deposit — Payroll', amount: 4250.0, accountId: 'acc-001-chk' }),
      createActivity({ date: '2024-06-08T14:30:00.000Z', type: TRANSACTION_TYPES.PAYMENT, description: 'Mortgage payment', amount: -2150.0, accountId: 'acc-001-chk' }),
      createActivity({ date: '2024-06-07T09:00:00.000Z', type: TRANSACTION_TYPES.TRANSFER, description: 'Transfer to savings', amount: -1000.0, accountId: 'acc-001-chk' }),
      createActivity({ date: '2024-06-05T11:22:00.000Z', type: TRANSACTION_TYPES.DIVIDEND, description: 'VOO quarterly dividend', symbol: 'VOO', qty: 40, price: 1.56, amount: 62.4, accountId: 'acc-001-inv' }),
      createActivity({ date: '2024-06-03T16:45:00.000Z', type: TRANSACTION_TYPES.WITHDRAWAL, description: 'ATM withdrawal', amount: -200.0, accountId: 'acc-001-chk' }),
      createActivity({ date: '2024-06-01T08:00:00.000Z', type: TRANSACTION_TYPES.INTEREST, description: 'Monthly interest earned', amount: 38.75, accountId: 'acc-001-sav' }),
    ],
    documents: [
      createDocument({ name: 'June 2024 Checking Statement', category: DOCUMENT_CATEGORIES.STATEMENT, date: '2024-06-01', size: '245 KB' }),
      createDocument({ name: 'Q1 2024 Investment Report', category: DOCUMENT_CATEGORIES.REPORT, date: '2024-04-15', size: '1.2 MB' }),
      createDocument({ name: '2023 Tax Form 1099-DIV', category: DOCUMENT_CATEGORIES.TAX, date: '2024-01-31', size: '89 KB' }),
      createDocument({ name: 'Account Agreement', category: DOCUMENT_CATEGORIES.CONTRACT, date: '2023-03-10', size: '512 KB' }),
    ],
    communicationPreferences: {
      emailNotifications: true,
      smsAlerts: true,
      monthlyStatements: true,
      marketingEmails: false,
      pushNotifications: true,
    },
    securitySettings: {
      twoFactorEnabled: true,
      twoFactorMethod: 'authenticator',
      loginAlerts: true,
      sessionTimeout: 30,
      trustedDevices: 2,
    },
    bankAccounts: [
      { id: 'bank-001', bankName: 'Chase Bank', accountNumber: '****4521', routingNumber: '****0021', type: 'checking', isPrimary: true },
      { id: 'bank-002', bankName: 'Ally Bank', accountNumber: '****8832', routingNumber: '****0036', type: 'savings', isPrimary: false },
    ],
    beneficiaries: [
      { id: 'ben-001', firstName: 'John', lastName: 'Doe', relationship: 'Spouse', share: 60, dob: '1988-11-20' },
      { id: 'ben-002', firstName: 'Emily', lastName: 'Doe', relationship: 'Child', share: 40, dob: '2015-03-08' },
    ],
    costBasisMethod: 'FIFO',
  },

  // ---- User 2: Marcus Chen ----
  {
    id: 'usr-002',
    firstName: 'Marcus',
    lastName: 'Chen',
    email: 'marcus.chen@example.com',
    phone: '+1 (555) 234-5678',
    password: 'SecurePass2@',
    dob: '1985-09-22',
    accountType: 'Joint',
    avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=Marcus',
    lastLoginAt: '2024-06-09T08:15:00.000Z',
    accounts: [
      {
        id: 'acc-002-chk',
        type: ACCOUNT_TYPES.CHECKING,
        name: 'Joint Checking',
        balance: 8320.5,
        accountNumber: '****7743',
      },
      {
        id: 'acc-002-inv',
        type: ACCOUNT_TYPES.INVESTMENT,
        name: 'Growth Portfolio',
        balance: 256400.18,
        accountNumber: '****3301',
      },
      {
        id: 'acc-002-ret',
        type: ACCOUNT_TYPES.RETIREMENT,
        name: '401(k)',
        balance: 189750.0,
        accountNumber: '****9912',
      },
    ],
    holdings: [
      createHolding({ symbol: 'NVDA', name: 'NVIDIA Corp.', qty: 45, avgCost: 450.0, currentPrice: 131.88 }),
      createHolding({ symbol: 'AMZN', name: 'Amazon.com Inc.', qty: 60, avgCost: 130.0, currentPrice: 186.49 }),
      createHolding({ symbol: 'TSLA', name: 'Tesla Inc.', qty: 25, avgCost: 200.0, currentPrice: 177.29 }),
      createHolding({ symbol: 'QQQ', name: 'Invesco QQQ Trust', qty: 35, avgCost: 350.0, currentPrice: 480.65 }),
      createHolding({ symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', qty: 80, avgCost: 210.0, currentPrice: 268.42 }),
      createHolding({ symbol: 'SCHD', name: 'Schwab US Dividend Equity ETF', qty: 120, avgCost: 72.0, currentPrice: 79.55 }),
    ],
    activity: [
      createActivity({ date: '2024-06-09T08:00:00.000Z', type: TRANSACTION_TYPES.DEPOSIT, description: 'Wire transfer received', amount: 15000.0, accountId: 'acc-002-inv' }),
      createActivity({ date: '2024-06-07T13:20:00.000Z', type: TRANSACTION_TYPES.PAYMENT, description: 'Buy NVDA x10', symbol: 'NVDA', qty: 10, price: 131.88, amount: -1318.8, accountId: 'acc-002-inv' }),
      createActivity({ date: '2024-06-06T09:45:00.000Z', type: TRANSACTION_TYPES.DIVIDEND, description: 'SCHD dividend', symbol: 'SCHD', qty: 120, price: 0.62, amount: 74.4, accountId: 'acc-002-inv' }),
      createActivity({ date: '2024-06-04T15:10:00.000Z', type: TRANSACTION_TYPES.TRANSFER, description: '401(k) contribution', amount: -1500.0, accountId: 'acc-002-chk' }),
      createActivity({ date: '2024-06-02T10:30:00.000Z', type: TRANSACTION_TYPES.FEE, description: 'Advisory fee — Q2', amount: -125.0, accountId: 'acc-002-inv' }),
    ],
    documents: [
      createDocument({ name: 'June 2024 Joint Statement', category: DOCUMENT_CATEGORIES.STATEMENT, date: '2024-06-01', size: '310 KB' }),
      createDocument({ name: '401(k) Quarterly Summary', category: DOCUMENT_CATEGORIES.REPORT, date: '2024-04-01', size: '890 KB' }),
      createDocument({ name: '2023 Tax Form 1099-B', category: DOCUMENT_CATEGORIES.TAX, date: '2024-02-15', size: '156 KB' }),
      createDocument({ name: 'Joint Account Agreement', category: DOCUMENT_CATEGORIES.CONTRACT, date: '2022-08-20', size: '478 KB' }),
      createDocument({ name: 'Fee Schedule Notice', category: DOCUMENT_CATEGORIES.NOTICE, date: '2024-01-05', size: '67 KB' }),
    ],
    communicationPreferences: {
      emailNotifications: true,
      smsAlerts: false,
      monthlyStatements: true,
      marketingEmails: true,
      pushNotifications: false,
    },
    securitySettings: {
      twoFactorEnabled: true,
      twoFactorMethod: 'sms',
      loginAlerts: true,
      sessionTimeout: 15,
      trustedDevices: 3,
    },
    bankAccounts: [
      { id: 'bank-003', bankName: 'Bank of America', accountNumber: '****7743', routingNumber: '****0115', type: 'checking', isPrimary: true },
    ],
    beneficiaries: [
      { id: 'ben-003', firstName: 'Lisa', lastName: 'Chen', relationship: 'Spouse', share: 50, dob: '1987-04-12' },
      { id: 'ben-004', firstName: 'Kevin', lastName: 'Chen', relationship: 'Child', share: 25, dob: '2012-07-30' },
      { id: 'ben-005', firstName: 'Sophia', lastName: 'Chen', relationship: 'Child', share: 25, dob: '2016-01-18' },
    ],
    costBasisMethod: 'FIFO',
  },

  // ---- User 3: Aisha Patel ----
  {
    id: 'usr-003',
    firstName: 'Aisha',
    lastName: 'Patel',
    email: 'aisha.patel@example.com',
    phone: '+1 (555) 345-6789',
    password: 'MyPass3rd#',
    dob: '1992-12-03',
    accountType: 'Individual',
    avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=Aisha',
    lastLoginAt: '2024-06-11T17:45:00.000Z',
    accounts: [
      {
        id: 'acc-003-chk',
        type: ACCOUNT_TYPES.CHECKING,
        name: 'Personal Checking',
        balance: 5680.25,
        accountNumber: '****2209',
      },
      {
        id: 'acc-003-sav',
        type: ACCOUNT_TYPES.SAVINGS,
        name: 'Emergency Fund',
        balance: 22100.0,
        accountNumber: '****5567',
      },
      {
        id: 'acc-003-inv',
        type: ACCOUNT_TYPES.INVESTMENT,
        name: 'Tech Growth Portfolio',
        balance: 87320.6,
        accountNumber: '****1148',
      },
      {
        id: 'acc-003-crd',
        type: ACCOUNT_TYPES.CREDIT,
        name: 'Platinum Rewards Card',
        balance: -2340.18,
        accountNumber: '****9901',
      },
    ],
    holdings: [
      createHolding({ symbol: 'META', name: 'Meta Platforms Inc.', qty: 35, avgCost: 300.0, currentPrice: 505.75 }),
      createHolding({ symbol: 'AAPL', name: 'Apple Inc.', qty: 40, avgCost: 160.0, currentPrice: 195.89 }),
      createHolding({ symbol: 'CRM', name: 'Salesforce Inc.', qty: 25, avgCost: 210.0, currentPrice: 255.32 }),
      createHolding({ symbol: 'ARKK', name: 'ARK Innovation ETF', qty: 60, avgCost: 55.0, currentPrice: 48.92 }),
    ],
    activity: [
      createActivity({ date: '2024-06-11T17:00:00.000Z', type: TRANSACTION_TYPES.PAYMENT, description: 'Credit card payment', amount: -850.0, accountId: 'acc-003-chk' }),
      createActivity({ date: '2024-06-10T12:00:00.000Z', type: TRANSACTION_TYPES.DEPOSIT, description: 'Freelance payment received', amount: 3200.0, accountId: 'acc-003-chk' }),
      createActivity({ date: '2024-06-08T09:30:00.000Z', type: TRANSACTION_TYPES.PAYMENT, description: 'Buy META x5', symbol: 'META', qty: 5, price: 505.75, amount: -2528.75, accountId: 'acc-003-inv' }),
      createActivity({ date: '2024-06-06T14:15:00.000Z', type: TRANSACTION_TYPES.REFUND, description: 'Subscription refund', amount: 14.99, accountId: 'acc-003-crd' }),
      createActivity({ date: '2024-06-04T08:45:00.000Z', type: TRANSACTION_TYPES.TRANSFER, description: 'Transfer to emergency fund', amount: -500.0, accountId: 'acc-003-chk' }),
      createActivity({ date: '2024-06-01T10:00:00.000Z', type: TRANSACTION_TYPES.INTEREST, description: 'Savings interest', amount: 18.42, accountId: 'acc-003-sav' }),
    ],
    documents: [
      createDocument({ name: 'May 2024 Checking Statement', category: DOCUMENT_CATEGORIES.STATEMENT, date: '2024-06-01', size: '198 KB' }),
      createDocument({ name: 'Credit Card Statement — May', category: DOCUMENT_CATEGORIES.STATEMENT, date: '2024-06-05', size: '175 KB' }),
      createDocument({ name: '2023 Tax Form W-2', category: DOCUMENT_CATEGORIES.TAX, date: '2024-01-25', size: '102 KB' }),
    ],
    communicationPreferences: {
      emailNotifications: true,
      smsAlerts: true,
      monthlyStatements: true,
      marketingEmails: false,
      pushNotifications: true,
    },
    securitySettings: {
      twoFactorEnabled: false,
      twoFactorMethod: null,
      loginAlerts: true,
      sessionTimeout: 30,
      trustedDevices: 1,
    },
    bankAccounts: [
      { id: 'bank-004', bankName: 'Wells Fargo', accountNumber: '****2209', routingNumber: '****0078', type: 'checking', isPrimary: true },
      { id: 'bank-005', bankName: 'Marcus by Goldman Sachs', accountNumber: '****5567', routingNumber: '****0042', type: 'savings', isPrimary: false },
    ],
    beneficiaries: [
      { id: 'ben-006', firstName: 'Raj', lastName: 'Patel', relationship: 'Parent', share: 100, dob: '1960-08-14' },
    ],
    costBasisMethod: 'SpecID',
  },

  // ---- User 4: Robert Williams ----
  {
    id: 'usr-004',
    firstName: 'Robert',
    lastName: 'Williams',
    email: 'robert.williams@example.com',
    phone: '+1 (555) 456-7890',
    password: 'Wealth4Me$',
    dob: '1978-03-28',
    accountType: 'IRA',
    avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=Robert',
    lastLoginAt: '2024-06-08T20:10:00.000Z',
    accounts: [
      {
        id: 'acc-004-chk',
        type: ACCOUNT_TYPES.CHECKING,
        name: 'Business Checking',
        balance: 34500.0,
        accountNumber: '****6678',
      },
      {
        id: 'acc-004-ret',
        type: ACCOUNT_TYPES.RETIREMENT,
        name: 'Traditional IRA',
        balance: 412800.0,
        accountNumber: '****4410',
      },
      {
        id: 'acc-004-inv',
        type: ACCOUNT_TYPES.INVESTMENT,
        name: 'Dividend Income Portfolio',
        balance: 198650.33,
        accountNumber: '****7725',
      },
      {
        id: 'acc-004-loan',
        type: ACCOUNT_TYPES.LOAN,
        name: 'Home Equity Line',
        balance: -45000.0,
        accountNumber: '****3302',
      },
    ],
    holdings: [
      createHolding({ symbol: 'JNJ', name: 'Johnson & Johnson', qty: 100, avgCost: 155.0, currentPrice: 148.22 }),
      createHolding({ symbol: 'PG', name: 'Procter & Gamble', qty: 80, avgCost: 140.0, currentPrice: 170.15 }),
      createHolding({ symbol: 'KO', name: 'Coca-Cola Co.', qty: 150, avgCost: 55.0, currentPrice: 63.78 }),
      createHolding({ symbol: 'VYM', name: 'Vanguard High Dividend Yield ETF', qty: 200, avgCost: 105.0, currentPrice: 118.94 }),
      createHolding({ symbol: 'O', name: 'Realty Income Corp.', qty: 120, avgCost: 60.0, currentPrice: 54.67 }),
      createHolding({ symbol: 'VXUS', name: 'Vanguard Total Intl Stock ETF', qty: 90, avgCost: 55.0, currentPrice: 59.83 }),
      createHolding({ symbol: 'AGG', name: 'iShares Core US Aggregate Bond ETF', qty: 150, avgCost: 100.0, currentPrice: 97.45 }),
    ],
    activity: [
      createActivity({ date: '2024-06-08T18:00:00.000Z', type: TRANSACTION_TYPES.DIVIDEND, description: 'VYM quarterly dividend', symbol: 'VYM', qty: 200, price: 0.85, amount: 170.0, accountId: 'acc-004-inv' }),
      createActivity({ date: '2024-06-07T10:30:00.000Z', type: TRANSACTION_TYPES.DIVIDEND, description: 'KO quarterly dividend', symbol: 'KO', qty: 150, price: 0.485, amount: 72.75, accountId: 'acc-004-inv' }),
      createActivity({ date: '2024-06-05T14:00:00.000Z', type: TRANSACTION_TYPES.DEPOSIT, description: 'IRA contribution', amount: 6500.0, accountId: 'acc-004-ret' }),
      createActivity({ date: '2024-06-03T09:15:00.000Z', type: TRANSACTION_TYPES.PAYMENT, description: 'HELOC interest payment', amount: -312.5, accountId: 'acc-004-loan' }),
      createActivity({ date: '2024-06-01T08:00:00.000Z', type: TRANSACTION_TYPES.DEPOSIT, description: 'Business revenue deposit', amount: 12800.0, accountId: 'acc-004-chk' }),
    ],
    documents: [
      createDocument({ name: 'IRA Annual Statement 2023', category: DOCUMENT_CATEGORIES.STATEMENT, date: '2024-01-15', size: '1.5 MB' }),
      createDocument({ name: 'HELOC Agreement', category: DOCUMENT_CATEGORIES.CONTRACT, date: '2023-06-01', size: '2.1 MB' }),
      createDocument({ name: '2023 Tax Form 1099-R', category: DOCUMENT_CATEGORIES.TAX, date: '2024-02-01', size: '134 KB' }),
      createDocument({ name: '2023 Tax Form 1099-INT', category: DOCUMENT_CATEGORIES.TAX, date: '2024-01-31', size: '78 KB' }),
      createDocument({ name: 'Portfolio Performance Report — Q1 2024', category: DOCUMENT_CATEGORIES.REPORT, date: '2024-04-10', size: '945 KB' }),
      createDocument({ name: 'Rate Change Notice', category: DOCUMENT_CATEGORIES.NOTICE, date: '2024-05-20', size: '45 KB' }),
    ],
    communicationPreferences: {
      emailNotifications: true,
      smsAlerts: true,
      monthlyStatements: true,
      marketingEmails: true,
      pushNotifications: false,
    },
    securitySettings: {
      twoFactorEnabled: true,
      twoFactorMethod: 'authenticator',
      loginAlerts: true,
      sessionTimeout: 60,
      trustedDevices: 4,
    },
    bankAccounts: [
      { id: 'bank-006', bankName: 'Citibank', accountNumber: '****6678', routingNumber: '****0200', type: 'checking', isPrimary: true },
    ],
    beneficiaries: [
      { id: 'ben-007', firstName: 'Sandra', lastName: 'Williams', relationship: 'Spouse', share: 50, dob: '1980-06-10' },
      { id: 'ben-008', firstName: 'Michael', lastName: 'Williams', relationship: 'Child', share: 30, dob: '2005-09-22' },
      { id: 'ben-009', firstName: 'Grace', lastName: 'Williams', relationship: 'Child', share: 20, dob: '2008-12-01' },
    ],
    costBasisMethod: 'Average',
  },

  // ---- User 5: Sofia Martinez ----
  {
    id: 'usr-005',
    firstName: 'Sofia',
    lastName: 'Martinez',
    email: 'sofia.martinez@example.com',
    phone: '+1 (555) 567-8901',
    password: 'Invest5Now!',
    dob: '1995-07-10',
    accountType: 'Individual',
    avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=Sofia',
    lastLoginAt: '2024-06-11T09:20:00.000Z',
    accounts: [
      {
        id: 'acc-005-chk',
        type: ACCOUNT_TYPES.CHECKING,
        name: 'Everyday Checking',
        balance: 3890.42,
        accountNumber: '****1155',
      },
      {
        id: 'acc-005-sav',
        type: ACCOUNT_TYPES.SAVINGS,
        name: 'Vacation Fund',
        balance: 8750.0,
        accountNumber: '****2266',
      },
      {
        id: 'acc-005-inv',
        type: ACCOUNT_TYPES.INVESTMENT,
        name: 'Growth & Income',
        balance: 52180.9,
        accountNumber: '****3377',
      },
      {
        id: 'acc-005-ret',
        type: ACCOUNT_TYPES.RETIREMENT,
        name: 'Roth IRA',
        balance: 34200.0,
        accountNumber: '****4488',
      },
      {
        id: 'acc-005-crd',
        type: ACCOUNT_TYPES.CREDIT,
        name: 'Travel Rewards Card',
        balance: -1120.55,
        accountNumber: '****5599',
      },
    ],
    holdings: [
      createHolding({ symbol: 'SPY', name: 'SPDR S&P 500 ETF', qty: 25, avgCost: 420.0, currentPrice: 540.89 }),
      createHolding({ symbol: 'MSFT', name: 'Microsoft Corp.', qty: 15, avgCost: 310.0, currentPrice: 425.52 }),
      createHolding({ symbol: 'DIS', name: 'Walt Disney Co.', qty: 40, avgCost: 100.0, currentPrice: 102.34 }),
      createHolding({ symbol: 'SOXX', name: 'iShares Semiconductor ETF', qty: 20, avgCost: 480.0, currentPrice: 252.67 }),
      createHolding({ symbol: 'VNQ', name: 'Vanguard Real Estate ETF', qty: 50, avgCost: 82.0, currentPrice: 86.15 }),
    ],
    activity: [
      createActivity({ date: '2024-06-11T09:00:00.000Z', type: TRANSACTION_TYPES.DEPOSIT, description: 'Payroll direct deposit', amount: 3100.0, accountId: 'acc-005-chk' }),
      createActivity({ date: '2024-06-10T16:30:00.000Z', type: TRANSACTION_TYPES.PAYMENT, description: 'Buy SPY x5', symbol: 'SPY', qty: 5, price: 540.89, amount: -2704.45, accountId: 'acc-005-inv' }),
      createActivity({ date: '2024-06-09T11:00:00.000Z', type: TRANSACTION_TYPES.TRANSFER, description: 'Roth IRA contribution', amount: -500.0, accountId: 'acc-005-chk' }),
      createActivity({ date: '2024-06-07T14:20:00.000Z', type: TRANSACTION_TYPES.PAYMENT, description: 'Credit card minimum payment', amount: -35.0, accountId: 'acc-005-chk' }),
      createActivity({ date: '2024-06-05T10:10:00.000Z', type: TRANSACTION_TYPES.DIVIDEND, description: 'VNQ dividend', symbol: 'VNQ', qty: 50, price: 0.38, amount: 19.0, accountId: 'acc-005-inv' }),
      createActivity({ date: '2024-06-03T08:30:00.000Z', type: TRANSACTION_TYPES.INTEREST, description: 'Savings interest earned', amount: 7.29, accountId: 'acc-005-sav' }),
      createActivity({ date: '2024-06-01T12:00:00.000Z', type: TRANSACTION_TYPES.REFUND, description: 'Merchant refund — online order', amount: 49.99, accountId: 'acc-005-crd' }),
    ],
    documents: [
      createDocument({ name: 'May 2024 Checking Statement', category: DOCUMENT_CATEGORIES.STATEMENT, date: '2024-06-01', size: '210 KB' }),
      createDocument({ name: 'Roth IRA Contribution Confirmation', category: DOCUMENT_CATEGORIES.NOTICE, date: '2024-06-09', size: '32 KB' }),
      createDocument({ name: '2023 Tax Form 1099-DIV', category: DOCUMENT_CATEGORIES.TAX, date: '2024-01-28', size: '91 KB' }),
      createDocument({ name: 'Travel Rewards Card Agreement', category: DOCUMENT_CATEGORIES.CONTRACT, date: '2023-11-15', size: '380 KB' }),
    ],
    communicationPreferences: {
      emailNotifications: true,
      smsAlerts: false,
      monthlyStatements: true,
      marketingEmails: false,
      pushNotifications: true,
    },
    securitySettings: {
      twoFactorEnabled: false,
      twoFactorMethod: null,
      loginAlerts: false,
      sessionTimeout: 30,
      trustedDevices: 1,
    },
    bankAccounts: [
      { id: 'bank-007', bankName: 'Capital One', accountNumber: '****1155', routingNumber: '****0065', type: 'checking', isPrimary: true },
      { id: 'bank-008', bankName: 'Discover Bank', accountNumber: '****2266', routingNumber: '****0019', type: 'savings', isPrimary: false },
    ],
    beneficiaries: [
      { id: 'ben-010', firstName: 'Carlos', lastName: 'Martinez', relationship: 'Parent', share: 50, dob: '1965-02-20' },
      { id: 'ben-011', firstName: 'Maria', lastName: 'Martinez', relationship: 'Parent', share: 50, dob: '1968-10-05' },
    ],
    costBasisMethod: 'FIFO',
  },
];

// ---------------------------------------------------------------------------
// Mock Products & Services
// ---------------------------------------------------------------------------

/** @type {Array<Object>} Mock financial products and services */
export const MOCK_PRODUCTS = [
  {
    id: 'prod-001',
    name: 'High-Yield Savings Account',
    category: PRODUCT_CATEGORIES.BANKING,
    description: 'Earn 4.75% APY on your savings with no minimum balance requirement and no monthly fees.',
    features: ['4.75% APY', 'No minimum balance', 'No monthly fees', 'FDIC insured up to $250,000'],
    rate: '4.75% APY',
    minInvestment: null,
    recommended: true,
  },
  {
    id: 'prod-002',
    name: 'Managed Growth Portfolio',
    category: PRODUCT_CATEGORIES.INVESTING,
    description: 'A professionally managed diversified portfolio targeting long-term capital appreciation with moderate risk.',
    features: ['Diversified equity & bond mix', 'Automatic rebalancing', 'Tax-loss harvesting', 'Dedicated advisor'],
    rate: null,
    minInvestment: 25000,
    recommended: true,
  },
  {
    id: 'prod-003',
    name: 'Term Life Insurance',
    category: PRODUCT_CATEGORIES.INSURANCE,
    description: 'Affordable term life coverage with flexible terms from 10 to 30 years. Protect your family\'s financial future.',
    features: ['Coverage from $100K to $5M', 'Fixed premiums', 'No medical exam options', 'Convertible to whole life'],
    rate: 'From $15/month',
    minInvestment: null,
    recommended: false,
  },
  {
    id: 'prod-004',
    name: 'Home Equity Line of Credit',
    category: PRODUCT_CATEGORIES.LENDING,
    description: 'Access your home equity with competitive variable rates. Draw funds as needed during the 10-year draw period.',
    features: ['Rates from 7.25% APR', 'No closing costs', '10-year draw period', 'Interest-only payments available'],
    rate: 'From 7.25% APR',
    minInvestment: null,
    recommended: false,
  },
  {
    id: 'prod-005',
    name: 'Roth IRA',
    category: PRODUCT_CATEGORIES.RETIREMENT,
    description: 'Grow your retirement savings tax-free. Contribute after-tax dollars and enjoy tax-free withdrawals in retirement.',
    features: ['Tax-free growth', 'Tax-free withdrawals', 'No required minimum distributions', 'Wide investment selection'],
    rate: null,
    minInvestment: 0,
    recommended: true,
  },
  {
    id: 'prod-006',
    name: 'Platinum Rewards Credit Card',
    category: PRODUCT_CATEGORIES.CREDIT_CARDS,
    description: 'Earn 3x points on travel and dining, 2x on groceries, and 1x on everything else. No annual fee for the first year.',
    features: ['3x points on travel & dining', '2x points on groceries', '50,000 bonus points offer', 'No foreign transaction fees'],
    rate: '18.99% – 26.99% APR',
    minInvestment: null,
    recommended: true,
  },
  {
    id: 'prod-007',
    name: 'S&P 500 Index Fund',
    category: PRODUCT_CATEGORIES.INVESTING,
    description: 'Low-cost index fund tracking the S&P 500. Ideal for long-term investors seeking broad market exposure.',
    features: ['0.03% expense ratio', 'No minimum investment', 'Automatic dividend reinvestment', 'Tax-efficient'],
    rate: '0.03% expense ratio',
    minInvestment: 0,
    recommended: false,
  },
  {
    id: 'prod-008',
    name: 'Personal Loan',
    category: PRODUCT_CATEGORIES.LENDING,
    description: 'Fixed-rate personal loans from $5,000 to $50,000 with terms of 2 to 7 years. No origination fees.',
    features: ['Fixed rates from 6.99% APR', 'No origination fees', 'Flexible terms', 'Same-day funding available'],
    rate: 'From 6.99% APR',
    minInvestment: null,
    recommended: false,
  },
  {
    id: 'prod-009',
    name: 'Target Date Retirement Fund 2055',
    category: PRODUCT_CATEGORIES.RETIREMENT,
    description: 'Automatically adjusts asset allocation as you approach retirement in 2055. Set it and forget it.',
    features: ['Automatic rebalancing', 'Glide path to conservative allocation', '0.12% expense ratio', 'Diversified global portfolio'],
    rate: '0.12% expense ratio',
    minInvestment: 1000,
    recommended: false,
  },
  {
    id: 'prod-010',
    name: 'Umbrella Insurance',
    category: PRODUCT_CATEGORIES.INSURANCE,
    description: 'Extra liability protection beyond your home and auto insurance limits. Coverage from $1M to $10M.',
    features: ['Coverage from $1M to $10M', 'Affordable premiums', 'Broad liability protection', 'Worldwide coverage'],
    rate: 'From $200/year',
    minInvestment: null,
    recommended: false,
  },
];

// ---------------------------------------------------------------------------
// Quick-access default user (for demo login)
// ---------------------------------------------------------------------------

/** @type {Object} The default demo user for quick login */
export const DEFAULT_DEMO_USER = MOCK_USERS[0];

// ---------------------------------------------------------------------------
// Aggregate helpers
// ---------------------------------------------------------------------------

/**
 * Returns all unique holding symbols across all mock users.
 *
 * @returns {string[]} Array of unique ticker symbols
 */
export function getAllSymbols() {
  const symbols = new Set();
  for (const user of MOCK_USERS) {
    for (const holding of user.holdings) {
      symbols.add(holding.symbol);
    }
  }
  return Array.from(symbols);
}

/**
 * Finds a mock user by email address (case-insensitive).
 *
 * @param {string} email - The email to search for
 * @returns {Object|null} The matching user object, or null
 */
export function findMockUserByEmail(email) {
  if (!email || typeof email !== 'string') {
    return null;
  }
  const normalised = email.trim().toLowerCase();
  return MOCK_USERS.find((u) => u.email.toLowerCase() === normalised) || null;
}

/**
 * Finds a mock user by id.
 *
 * @param {string} id - The user id to search for
 * @returns {Object|null} The matching user object, or null
 */
export function findMockUserById(id) {
  if (!id || typeof id !== 'string') {
    return null;
  }
  return MOCK_USERS.find((u) => u.id === id) || null;
}