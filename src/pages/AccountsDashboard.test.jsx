/**
 * Integration tests for AccountsDashboard
 * Verifies dynamic greeting renders, portfolio value ticker animates,
 * donut chart renders with correct data, smart insights text appears,
 * and new user sees onboarding widget.
 * Implements SCRUM-20321: Accounts Dashboard with Smart Insights
 * @module AccountsDashboard.test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '../context/ThemeContext.jsx';
import { AuthProvider } from '../context/AuthContext.jsx';
import { ToastProvider } from '../context/ToastContext.jsx';
import { AccountsDashboard } from './AccountsDashboard.jsx';
import { MOCK_USERS } from '../data/mockData.js';
import { USERS_KEY, CURRENT_USER_KEY } from '../utils/constants.js';

/**
 * Helper to render AccountsDashboard with all required providers
 * and a pre-authenticated user.
 *
 * @param {Object} [options]
 * @param {Object} [options.user] - The user to authenticate as (defaults to MOCK_USERS[0])
 * @param {string} [options.initialRoute='/dashboard'] - Initial route for MemoryRouter
 * @returns {Object} render result
 */
function renderDashboard(options = {}) {
  const { user = MOCK_USERS[0], initialRoute = '/dashboard' } = options;

  // Seed users and current user into localStorage
  const clonedUsers = JSON.parse(JSON.stringify(MOCK_USERS));
  const clonedUser = JSON.parse(JSON.stringify(user));
  localStorage.setItem(USERS_KEY, JSON.stringify(clonedUsers));
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(clonedUser));

  return render(
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <MemoryRouter initialEntries={[initialRoute]}>
            <AccountsDashboard />
          </MemoryRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>,
  );
}

/**
 * Helper to render AccountsDashboard with a new user that has no
 * holdings, accounts, or activity.
 *
 * @returns {Object} render result
 */
function renderDashboardWithNewUser() {
  const newUser = {
    id: 'usr-new',
    firstName: 'New',
    lastName: 'User',
    email: 'new.user@example.com',
    phone: '+1 (555) 000-0000',
    password: 'NewPass1!',
    dob: '1995-01-01',
    accountType: 'Individual',
    avatar: null,
    lastLoginAt: null,
    accounts: [],
    holdings: [],
    activity: [],
    documents: [],
    communicationPreferences: {
      emailNotifications: true,
      smsAlerts: false,
      monthlyStatements: true,
      marketingEmails: false,
      pushNotifications: false,
    },
    securitySettings: {
      twoFactorEnabled: false,
      twoFactorMethod: null,
      loginAlerts: false,
      sessionTimeout: 30,
      trustedDevices: 0,
    },
    bankAccounts: [],
    beneficiaries: [],
    costBasisMethod: 'FIFO',
  };

  const allUsers = [...JSON.parse(JSON.stringify(MOCK_USERS)), newUser];
  localStorage.setItem(USERS_KEY, JSON.stringify(allUsers));
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));

  return render(
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <MemoryRouter initialEntries={['/dashboard']}>
            <AccountsDashboard />
          </MemoryRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>,
  );
}

describe('AccountsDashboard', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Dynamic Greeting', () => {
    it('renders a greeting with the user first name in the morning', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2024, 5, 15, 9, 0, 0));

      renderDashboard({ user: MOCK_USERS[0] });

      expect(
        screen.getByRole('heading', { level: 1 }),
      ).toHaveTextContent(`Good morning, ${MOCK_USERS[0].firstName}`);

      vi.useRealTimers();
    });

    it('renders a greeting with the user first name in the afternoon', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2024, 5, 15, 14, 0, 0));

      renderDashboard({ user: MOCK_USERS[0] });

      expect(
        screen.getByRole('heading', { level: 1 }),
      ).toHaveTextContent(`Good afternoon, ${MOCK_USERS[0].firstName}`);

      vi.useRealTimers();
    });

    it('renders a greeting with the user first name in the evening', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2024, 5, 15, 19, 0, 0));

      renderDashboard({ user: MOCK_USERS[0] });

      expect(
        screen.getByRole('heading', { level: 1 }),
      ).toHaveTextContent(`Good evening, ${MOCK_USERS[0].firstName}`);

      vi.useRealTimers();
    });

    it('renders a greeting with the user first name at night', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2024, 5, 15, 23, 0, 0));

      renderDashboard({ user: MOCK_USERS[0] });

      expect(
        screen.getByRole('heading', { level: 1 }),
      ).toHaveTextContent(`Good night, ${MOCK_USERS[0].firstName}`);

      vi.useRealTimers();
    });

    it('renders the portfolio overview description text', () => {
      renderDashboard();

      expect(
        screen.getByText(/Here's an overview of your financial portfolio/),
      ).toBeInTheDocument();
    });
  });

  describe('Portfolio Summary Cards', () => {
    it('renders the Account Value label', () => {
      renderDashboard();

      expect(screen.getByText('Account Value')).toBeInTheDocument();
    });

    it('renders the Market Value label', () => {
      renderDashboard();

      expect(screen.getByText('Market Value')).toBeInTheDocument();
    });

    it('renders the Gain / Loss label', () => {
      renderDashboard();

      expect(screen.getByText('Gain / Loss')).toBeInTheDocument();
    });

    it('renders the Holdings count label', () => {
      renderDashboard();

      expect(screen.getByText('Holdings')).toBeInTheDocument();
    });

    it('displays the correct number of holdings for the user', () => {
      const user = MOCK_USERS[0];
      renderDashboard({ user });

      expect(
        screen.getByText(String(user.holdings.length)),
      ).toBeInTheDocument();
    });

    it('displays the correct number of accounts for the user', () => {
      const user = MOCK_USERS[0];
      renderDashboard({ user });

      const accountCountText = `${user.accounts.length} account${user.accounts.length !== 1 ? 's' : ''}`;
      expect(screen.getByText(accountCountText)).toBeInTheDocument();
    });
  });

  describe('Smart Insights', () => {
    it('renders the Smart Insights heading', () => {
      renderDashboard();

      expect(screen.getByText('Smart Insights')).toBeInTheDocument();
    });

    it('displays at least one insight for a user with holdings', () => {
      renderDashboard({ user: MOCK_USERS[0] });

      // The user has holdings, so insights should be generated
      const insightsSection = screen.getByText('Smart Insights').closest('div');
      expect(insightsSection).toBeInTheDocument();

      // Check that at least one insight bullet point is rendered
      const listItems = insightsSection.querySelectorAll('li');
      expect(listItems.length).toBeGreaterThan(0);
    });

    it('displays portfolio performance insight for a user with holdings', () => {
      renderDashboard({ user: MOCK_USERS[0] });

      // The first insight should mention portfolio being up or down
      expect(
        screen.getByText(/Your portfolio is (up|down)/),
      ).toBeInTheDocument();
    });

    it('displays diversification insight', () => {
      const user = MOCK_USERS[0];
      renderDashboard({ user });

      if (user.holdings.length >= 5) {
        expect(
          screen.getByText(/Your portfolio is diversified across/),
        ).toBeInTheDocument();
      } else {
        expect(
          screen.getByText(/Consider diversifying/),
        ).toBeInTheDocument();
      }
    });

    it('displays account count insight', () => {
      const user = MOCK_USERS[0];
      renderDashboard({ user });

      expect(
        screen.getByText(new RegExp(`You have ${user.accounts.length} account`)),
      ).toBeInTheDocument();
    });
  });

  describe('Portfolio Allocation (Donut Chart)', () => {
    it('renders the Portfolio Allocation heading', () => {
      renderDashboard();

      expect(screen.getByText('Portfolio Allocation')).toBeInTheDocument();
    });

    it('renders the View Holdings link for a user with holdings', () => {
      renderDashboard({ user: MOCK_USERS[0] });

      expect(screen.getByText('View Holdings')).toBeInTheDocument();
    });

    it('renders the Total Value center label when no slice is hovered', () => {
      renderDashboard({ user: MOCK_USERS[0] });

      expect(screen.getByText('Total Value')).toBeInTheDocument();
    });

    it('renders legend items for each holding', () => {
      const user = MOCK_USERS[0];
      renderDashboard({ user });

      for (const holding of user.holdings) {
        expect(screen.getByText(holding.symbol)).toBeInTheDocument();
      }
    });

    it('shows empty state when user has no holdings', () => {
      renderDashboardWithNewUser();

      expect(screen.getByText('No holdings yet')).toBeInTheDocument();
      expect(
        screen.getByText('Add investments to see your portfolio allocation.'),
      ).toBeInTheDocument();
    });
  });

  describe('Account Cards', () => {
    it('renders the Your Accounts heading for a user with accounts', () => {
      renderDashboard({ user: MOCK_USERS[0] });

      expect(screen.getByText('Your Accounts')).toBeInTheDocument();
    });

    it('renders account cards for each account', () => {
      const user = MOCK_USERS[0];
      renderDashboard({ user });

      for (const account of user.accounts) {
        expect(screen.getByText(account.name)).toBeInTheDocument();
      }
    });

    it('displays account numbers for each account', () => {
      const user = MOCK_USERS[0];
      renderDashboard({ user });

      for (const account of user.accounts) {
        expect(screen.getByText(account.accountNumber)).toBeInTheDocument();
      }
    });

    it('displays the Balance label for each account card', () => {
      const user = MOCK_USERS[0];
      renderDashboard({ user });

      const balanceLabels = screen.getAllByText('Balance');
      expect(balanceLabels.length).toBe(user.accounts.length);
    });

    it('displays account type badges', () => {
      const user = MOCK_USERS[0];
      renderDashboard({ user });

      // Each account should have a type badge
      const checkingBadges = screen.getAllByText('Checking');
      expect(checkingBadges.length).toBeGreaterThan(0);
    });
  });

  describe('Onboarding Widget for New Users', () => {
    it('renders the Get Started heading for a new user with no portfolio or accounts', () => {
      renderDashboardWithNewUser();

      expect(screen.getByText('Get Started')).toBeInTheDocument();
    });

    it('renders the onboarding description text', () => {
      renderDashboardWithNewUser();

      expect(
        screen.getByText('Complete these steps to set up your account.'),
      ).toBeInTheDocument();
    });

    it('renders all three onboarding steps', () => {
      renderDashboardWithNewUser();

      expect(screen.getByText('Complete your profile')).toBeInTheDocument();
      expect(screen.getByText('Link a bank account')).toBeInTheDocument();
      expect(screen.getByText('Explore products')).toBeInTheDocument();
    });

    it('renders step descriptions', () => {
      renderDashboardWithNewUser();

      expect(
        screen.getByText('Add your personal information and preferences.'),
      ).toBeInTheDocument();
      expect(
        screen.getByText('Connect your bank to fund your portfolio.'),
      ).toBeInTheDocument();
      expect(
        screen.getByText('Browse investment products and services.'),
      ).toBeInTheDocument();
    });

    it('renders step numbers 1, 2, 3', () => {
      renderDashboardWithNewUser();

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('does not render onboarding widget for a user with accounts and holdings', () => {
      renderDashboard({ user: MOCK_USERS[0] });

      expect(screen.queryByText('Get Started')).not.toBeInTheDocument();
    });
  });

  describe('Portfolio Value Ticker Animation', () => {
    it('renders the animated account value element', () => {
      renderDashboard({ user: MOCK_USERS[0] });

      // The Account Value card should contain a formatted currency value
      const accountValueLabel = screen.getByText('Account Value');
      const card = accountValueLabel.closest('div[class*="rounded-xl"]');
      expect(card).toBeInTheDocument();

      // The animated value should contain a dollar sign
      const spans = card.querySelectorAll('span');
      const hasCurrencyValue = Array.from(spans).some(
        (span) => span.textContent && span.textContent.includes('$'),
      );
      expect(hasCurrencyValue).toBe(true);
    });

    it('renders the animated market value element', () => {
      renderDashboard({ user: MOCK_USERS[0] });

      const marketValueLabel = screen.getByText('Market Value');
      const card = marketValueLabel.closest('div[class*="rounded-xl"]');
      expect(card).toBeInTheDocument();

      const spans = card.querySelectorAll('span');
      const hasCurrencyValue = Array.from(spans).some(
        (span) => span.textContent && span.textContent.includes('$'),
      );
      expect(hasCurrencyValue).toBe(true);
    });
  });

  describe('Different Users', () => {
    it('renders correct greeting for Marcus Chen', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2024, 5, 15, 10, 0, 0));

      renderDashboard({ user: MOCK_USERS[1] });

      expect(
        screen.getByRole('heading', { level: 1 }),
      ).toHaveTextContent('Good morning, Marcus');

      vi.useRealTimers();
    });

    it('renders correct number of holdings for Marcus Chen', () => {
      const user = MOCK_USERS[1];
      renderDashboard({ user });

      expect(
        screen.getByText(String(user.holdings.length)),
      ).toBeInTheDocument();
    });

    it('renders correct number of accounts for Aisha Patel', () => {
      const user = MOCK_USERS[2];
      renderDashboard({ user });

      const accountCountText = `${user.accounts.length} account${user.accounts.length !== 1 ? 's' : ''}`;
      expect(screen.getByText(accountCountText)).toBeInTheDocument();
    });

    it('renders holding symbols in legend for Robert Williams', () => {
      const user = MOCK_USERS[3];
      renderDashboard({ user });

      for (const holding of user.holdings) {
        expect(screen.getByText(holding.symbol)).toBeInTheDocument();
      }
    });
  });

  describe('Gain/Loss Display', () => {
    it('renders gain/loss value with correct sign indicator', () => {
      renderDashboard({ user: MOCK_USERS[0] });

      const gainLossLabel = screen.getByText('Gain / Loss');
      const card = gainLossLabel.closest('div[class*="rounded-xl"]');
      expect(card).toBeInTheDocument();

      // Should contain a dollar amount with + or - prefix
      const paragraphs = card.querySelectorAll('p');
      const hasGainLossValue = Array.from(paragraphs).some(
        (p) => p.textContent && (p.textContent.includes('+$') || p.textContent.includes('-$')),
      );
      expect(hasGainLossValue).toBe(true);
    });

    it('renders gain/loss percentage', () => {
      renderDashboard({ user: MOCK_USERS[0] });

      const gainLossLabel = screen.getByText('Gain / Loss');
      const card = gainLossLabel.closest('div[class*="rounded-xl"]');
      expect(card).toBeInTheDocument();

      // Should contain a percentage value
      const paragraphs = card.querySelectorAll('p');
      const hasPercentage = Array.from(paragraphs).some(
        (p) => p.textContent && p.textContent.includes('%'),
      );
      expect(hasPercentage).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('renders without crashing for a user with empty holdings array', () => {
      renderDashboardWithNewUser();

      expect(
        screen.getByRole('heading', { level: 1 }),
      ).toBeInTheDocument();
    });

    it('renders the page heading for all mock users', () => {
      for (const user of MOCK_USERS) {
        localStorage.clear();

        const clonedUsers = JSON.parse(JSON.stringify(MOCK_USERS));
        const clonedUser = JSON.parse(JSON.stringify(user));
        localStorage.setItem(USERS_KEY, JSON.stringify(clonedUsers));
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(clonedUser));

        const { unmount } = render(
          <ThemeProvider>
            <AuthProvider>
              <ToastProvider>
                <MemoryRouter initialEntries={['/dashboard']}>
                  <AccountsDashboard />
                </MemoryRouter>
              </ToastProvider>
            </AuthProvider>
          </ThemeProvider>,
        );

        expect(
          screen.getByRole('heading', { level: 1 }),
        ).toHaveTextContent(new RegExp(user.firstName));

        unmount();
      }
    });
  });
});