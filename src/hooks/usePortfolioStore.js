/**
 * Portfolio data access hook
 * Implements SCRUM-20321: Accounts Dashboard with Smart Insights
 * @module usePortfolioStore
 */

import { useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { calculateGainLoss, calculatePortfolioValue } from '../utils/helpers.js';
import { CHART_COLORS } from '../utils/constants.js';

/**
 * @typedef {Object} PortfolioHolding
 * @property {string} id
 * @property {string} symbol
 * @property {string} name
 * @property {number} qty
 * @property {number} avgCost
 * @property {number} currentPrice
 * @property {number} mktValue
 * @property {number} costBasis
 * @property {number} gainLossDollar
 * @property {number} gainLossPercent
 * @property {boolean} isGain
 * @property {Array<{day: number, value: number}>} sparklineData
 */

/**
 * @typedef {Object} AllocationSlice
 * @property {string} name
 * @property {string} symbol
 * @property {number} value
 * @property {number} percentage
 * @property {string} color
 */

/**
 * @typedef {Object} Portfolio
 * @property {Array<PortfolioHolding>} holdings - User's holdings
 * @property {Array<Object>} accounts - User's accounts
 * @property {number} totalAccountValue - Sum of all account balances
 * @property {number} totalMarketValue - Sum of all holdings market values
 * @property {number} totalCostBasis - Sum of all holdings cost bases
 * @property {number} totalGainLossDollar - Total gain/loss in dollars
 * @property {number} totalGainLossPercent - Total gain/loss as a decimal percentage
 * @property {boolean} isGain - Whether the portfolio is in overall gain
 * @property {Array<AllocationSlice>} allocation - Allocation breakdown for donut chart
 * @property {Array<string>} smartInsights - Generated insight strings
 */

/**
 * @typedef {Object} PortfolioStoreValue
 * @property {function(): Portfolio} getPortfolio - Returns computed portfolio data for the current user
 * @property {function(Object): void} updatePortfolio - Updates portfolio-related data for the current user
 */

/**
 * Computes allocation percentages from holdings for donut chart display.
 *
 * @param {Array<PortfolioHolding>} holdings - The user's holdings
 * @param {number} totalMarketValue - The total market value of all holdings
 * @returns {Array<AllocationSlice>} Allocation slices with percentages and colors
 */
function computeAllocation(holdings, totalMarketValue) {
  if (!Array.isArray(holdings) || holdings.length === 0 || totalMarketValue === 0) {
    return [];
  }

  return holdings.map((holding, index) => {
    const percentage = totalMarketValue !== 0
      ? Math.round((holding.mktValue / totalMarketValue) * 10000) / 10000
      : 0;

    return {
      name: holding.name,
      symbol: holding.symbol,
      value: holding.mktValue,
      percentage,
      color: CHART_COLORS[index % CHART_COLORS.length],
    };
  });
}

/**
 * Generates smart insight strings based on portfolio data.
 *
 * @param {Array<PortfolioHolding>} holdings - The user's holdings
 * @param {Array<Object>} accounts - The user's accounts
 * @param {number} totalGainLossDollar - Total gain/loss in dollars
 * @param {boolean} isGain - Whether the portfolio is in overall gain
 * @returns {Array<string>} Array of insight strings
 */
function generateSmartInsights(holdings, accounts, totalGainLossDollar, isGain) {
  const insights = [];

  if (!Array.isArray(holdings) || holdings.length === 0) {
    insights.push('Add holdings to your portfolio to start tracking performance.');
    return insights;
  }

  // Overall performance insight
  if (isGain) {
    insights.push(`Your portfolio is up $${Math.abs(totalGainLossDollar).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} overall. Keep it up!`);
  } else {
    insights.push(`Your portfolio is down $${Math.abs(totalGainLossDollar).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} overall. Consider reviewing your strategy.`);
  }

  // Top performer insight
  const sortedByGain = [...holdings].sort((a, b) => b.gainLossPercent - a.gainLossPercent);
  const topPerformer = sortedByGain[0];
  if (topPerformer && topPerformer.isGain) {
    const pct = (topPerformer.gainLossPercent * 100).toFixed(2);
    insights.push(`${topPerformer.symbol} is your top performer, up ${pct}%.`);
  }

  // Worst performer insight
  const worstPerformer = sortedByGain[sortedByGain.length - 1];
  if (worstPerformer && !worstPerformer.isGain) {
    const pct = Math.abs(worstPerformer.gainLossPercent * 100).toFixed(2);
    insights.push(`${worstPerformer.symbol} is underperforming, down ${pct}%.`);
  }

  // Diversification insight
  if (holdings.length < 5) {
    insights.push('Consider diversifying — you have fewer than 5 holdings.');
  } else {
    insights.push(`Your portfolio is diversified across ${holdings.length} holdings.`);
  }

  // Account count insight
  if (Array.isArray(accounts) && accounts.length > 0) {
    insights.push(`You have ${accounts.length} account${accounts.length > 1 ? 's' : ''} linked to your profile.`);
  }

  return insights;
}

/**
 * Custom hook that provides portfolio data access and mutation for the current user.
 * Reads holdings and accounts from the authenticated user's data, computes derived
 * values (total market value, gain/loss, allocation percentages, smart insights),
 * and provides an update function.
 *
 * @returns {PortfolioStoreValue} Portfolio store methods
 * @throws {Error} If used outside of an AuthProvider
 */
export function usePortfolioStore() {
  const { currentUser, updateUser } = useAuth();

  /**
   * Returns the computed portfolio data for the current user.
   *
   * @returns {Portfolio} The portfolio data with derived values
   */
  const getPortfolio = useCallback(() => {
    if (!currentUser) {
      return {
        holdings: [],
        accounts: [],
        totalAccountValue: 0,
        totalMarketValue: 0,
        totalCostBasis: 0,
        totalGainLossDollar: 0,
        totalGainLossPercent: 0,
        isGain: false,
        allocation: [],
        smartInsights: ['Log in to view your portfolio.'],
      };
    }

    const holdings = Array.isArray(currentUser.holdings) ? currentUser.holdings : [];
    const accounts = Array.isArray(currentUser.accounts) ? currentUser.accounts : [];

    const totalAccountValue = calculatePortfolioValue(accounts);

    const totalMarketValue = holdings.reduce((sum, h) => {
      const val = Number(h.mktValue);
      return sum + (Number.isFinite(val) ? val : 0);
    }, 0);

    const totalCostBasis = holdings.reduce((sum, h) => {
      const val = Number(h.costBasis);
      return sum + (Number.isFinite(val) ? val : 0);
    }, 0);

    const { amount: totalGainLossDollar, percentage: totalGainLossPercent, isGain } =
      calculateGainLoss(totalMarketValue, totalCostBasis);

    const allocation = computeAllocation(holdings, totalMarketValue);

    const smartInsights = generateSmartInsights(
      holdings,
      accounts,
      totalGainLossDollar,
      isGain,
    );

    return {
      holdings,
      accounts,
      totalAccountValue,
      totalMarketValue: Math.round(totalMarketValue * 100) / 100,
      totalCostBasis: Math.round(totalCostBasis * 100) / 100,
      totalGainLossDollar,
      totalGainLossPercent,
      isGain,
      allocation,
      smartInsights,
    };
  }, [currentUser]);

  /**
   * Updates portfolio-related data for the current user.
   * Accepts partial updates for holdings and/or accounts.
   *
   * @param {Object} updates - Partial portfolio updates
   * @param {Array<PortfolioHolding>} [updates.holdings] - Updated holdings array
   * @param {Array<Object>} [updates.accounts] - Updated accounts array
   */
  const updatePortfolio = useCallback(
    (updates) => {
      if (!currentUser || !updates || typeof updates !== 'object') {
        return;
      }

      const patch = {};

      if (updates.holdings !== undefined) {
        patch.holdings = updates.holdings;
      }

      if (updates.accounts !== undefined) {
        patch.accounts = updates.accounts;
      }

      if (Object.keys(patch).length > 0) {
        updateUser(patch);
      }
    },
    [currentUser, updateUser],
  );

  const portfolio = useMemo(() => getPortfolio(), [getPortfolio]);

  return useMemo(
    () => ({
      getPortfolio,
      updatePortfolio,
      portfolio,
    }),
    [getPortfolio, updatePortfolio, portfolio],
  );
}

export default usePortfolioStore;