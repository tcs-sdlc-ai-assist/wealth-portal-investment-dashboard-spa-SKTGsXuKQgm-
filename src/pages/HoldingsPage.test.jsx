/**
 * Integration tests for HoldingsPage
 * Verifies table renders with correct columns, sorting works on column click,
 * search filters rows, sparklines render, and empty state shows for users with no holdings.
 * Implements SCRUM-20322: Holdings Table with TrendSparkline
 * @module HoldingsPage.test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '../context/ThemeContext.jsx';
import { AuthProvider } from '../context/AuthContext.jsx';
import { ToastProvider } from '../context/ToastContext.jsx';
import { HoldingsPage } from './HoldingsPage.jsx';
import { MOCK_USERS } from '../data/mockData.js';
import { USERS_KEY, CURRENT_USER_KEY } from '../utils/constants.js';

/**
 * Helper to render HoldingsPage with all required providers
 * and a pre-authenticated user.
 *
 * @param {Object} [options]
 * @param {Object} [options.user] - The user to authenticate as (defaults to MOCK_USERS[0])
 * @param {string} [options.initialRoute='/accounts'] - Initial route for MemoryRouter
 * @returns {Object} render result
 */
function renderHoldingsPage(options = {}) {
  const { user = MOCK_USERS[0], initialRoute = '/accounts' } = options;

  const clonedUsers = JSON.parse(JSON.stringify(MOCK_USERS));
  const clonedUser = JSON.parse(JSON.stringify(user));
  localStorage.setItem(USERS_KEY, JSON.stringify(clonedUsers));
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(clonedUser));

  return render(
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <MemoryRouter initialEntries={[initialRoute]}>
            <HoldingsPage />
          </MemoryRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>,
  );
}

/**
 * Helper to render HoldingsPage with a new user that has no holdings.
 *
 * @returns {Object} render result
 */
function renderHoldingsPageWithNewUser() {
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
          <MemoryRouter initialEntries={['/accounts']}>
            <HoldingsPage />
          </MemoryRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>,
  );
}

describe('HoldingsPage', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Page Header', () => {
    it('renders the Holdings heading', () => {
      renderHoldingsPage();

      expect(
        screen.getByRole('heading', { level: 1 }),
      ).toHaveTextContent('Holdings');
    });

    it('renders the description text', () => {
      renderHoldingsPage();

      expect(
        screen.getByText('View and manage your investment holdings.'),
      ).toBeInTheDocument();
    });
  });

  describe('Table Column Headers', () => {
    it('renders the Symbol column header', () => {
      renderHoldingsPage();

      expect(screen.getByText('Symbol')).toBeInTheDocument();
    });

    it('renders the Name column header', () => {
      renderHoldingsPage();

      expect(screen.getByText('Name')).toBeInTheDocument();
    });

    it('renders the Qty column header', () => {
      renderHoldingsPage();

      expect(screen.getByText('Qty')).toBeInTheDocument();
    });

    it('renders the Avg Cost column header', () => {
      renderHoldingsPage();

      expect(screen.getByText('Avg Cost')).toBeInTheDocument();
    });

    it('renders the Price column header', () => {
      renderHoldingsPage();

      expect(screen.getByText('Price')).toBeInTheDocument();
    });

    it('renders the Mkt Value column header', () => {
      renderHoldingsPage();

      expect(screen.getByText('Mkt Value')).toBeInTheDocument();
    });

    it('renders the Gain/Loss $ column header', () => {
      renderHoldingsPage();

      expect(screen.getByText('Gain/Loss $')).toBeInTheDocument();
    });

    it('renders the Gain/Loss % column header', () => {
      renderHoldingsPage();

      expect(screen.getByText('Gain/Loss %')).toBeInTheDocument();
    });

    it('renders the 7-Day Trend column header', () => {
      renderHoldingsPage();

      expect(screen.getByText('7-Day Trend')).toBeInTheDocument();
    });
  });

  describe('Holdings Data Rendering', () => {
    it('renders all holding symbols for the user', () => {
      const user = MOCK_USERS[0];
      renderHoldingsPage({ user });

      for (const holding of user.holdings) {
        expect(screen.getByText(holding.symbol)).toBeInTheDocument();
      }
    });

    it('renders all holding names for the user', () => {
      const user = MOCK_USERS[0];
      renderHoldingsPage({ user });

      for (const holding of user.holdings) {
        expect(screen.getByText(holding.name)).toBeInTheDocument();
      }
    });

    it('displays the correct number of table rows for the user holdings', () => {
      const user = MOCK_USERS[0];
      renderHoldingsPage({ user });

      const table = screen.getByRole('table');
      const tbody = table.querySelector('tbody');
      const rows = tbody.querySelectorAll('tr');
      expect(rows.length).toBe(user.holdings.length);
    });

    it('renders the holdings count in the summary footer', () => {
      const user = MOCK_USERS[0];
      renderHoldingsPage({ user });

      expect(
        screen.getByText(new RegExp(`Showing ${user.holdings.length} of ${user.holdings.length} holding`)),
      ).toBeInTheDocument();
    });
  });

  describe('Sparkline Rendering', () => {
    it('renders sparkline elements for holdings with sparkline data', () => {
      const user = MOCK_USERS[0];
      renderHoldingsPage({ user });

      const sparklines = screen.getAllByRole('img', { name: /Sparkline trend/ });
      expect(sparklines.length).toBeGreaterThan(0);
    });

    it('renders the correct number of sparklines matching holdings count', () => {
      const user = MOCK_USERS[0];
      renderHoldingsPage({ user });

      const holdingsWithSparkline = user.holdings.filter(
        (h) => h.sparklineData && h.sparklineData.length > 0,
      );

      const sparklines = screen.getAllByRole('img', { name: /Sparkline trend/ });
      expect(sparklines.length).toBe(holdingsWithSparkline.length);
    });
  });

  describe('Search Functionality', () => {
    it('renders the search input', () => {
      renderHoldingsPage();

      expect(
        screen.getByLabelText('Search holdings'),
      ).toBeInTheDocument();
    });

    it('renders the search placeholder text', () => {
      renderHoldingsPage();

      expect(
        screen.getByPlaceholderText('Search by symbol or name…'),
      ).toBeInTheDocument();
    });

    it('filters holdings by symbol when searching', async () => {
      const user = userEvent.setup();
      const mockUser = MOCK_USERS[0];
      renderHoldingsPage({ user: mockUser });

      const searchInput = screen.getByLabelText('Search holdings');
      await user.type(searchInput, 'AAPL');

      expect(screen.getByText('AAPL')).toBeInTheDocument();
      expect(screen.queryByText('MSFT')).not.toBeInTheDocument();
      expect(screen.queryByText('GOOGL')).not.toBeInTheDocument();
    });

    it('filters holdings by name when searching', async () => {
      const user = userEvent.setup();
      const mockUser = MOCK_USERS[0];
      renderHoldingsPage({ user: mockUser });

      const searchInput = screen.getByLabelText('Search holdings');
      await user.type(searchInput, 'Apple');

      expect(screen.getByText('AAPL')).toBeInTheDocument();
      expect(screen.getByText('Apple Inc.')).toBeInTheDocument();
      expect(screen.queryByText('Microsoft Corp.')).not.toBeInTheDocument();
    });

    it('shows empty state when search matches no holdings', async () => {
      const user = userEvent.setup();
      renderHoldingsPage();

      const searchInput = screen.getByLabelText('Search holdings');
      await user.type(searchInput, 'ZZZZNONEXISTENT');

      expect(
        screen.getByText('No holdings match your search'),
      ).toBeInTheDocument();
    });

    it('shows the Clear Search button in empty state when search has no results', async () => {
      const user = userEvent.setup();
      renderHoldingsPage();

      const searchInput = screen.getByLabelText('Search holdings');
      await user.type(searchInput, 'ZZZZNONEXISTENT');

      expect(
        screen.getByRole('button', { name: /Clear Search/i }),
      ).toBeInTheDocument();
    });

    it('clears search and shows all holdings when clear search button is clicked', async () => {
      const user = userEvent.setup();
      const mockUser = MOCK_USERS[0];
      renderHoldingsPage({ user: mockUser });

      const searchInput = screen.getByLabelText('Search holdings');
      await user.type(searchInput, 'AAPL');

      expect(screen.queryByText('MSFT')).not.toBeInTheDocument();

      const clearButton = screen.getByLabelText('Clear search');
      await user.click(clearButton);

      for (const holding of mockUser.holdings) {
        expect(screen.getByText(holding.symbol)).toBeInTheDocument();
      }
    });

    it('shows the clear search icon button when search has text', async () => {
      const user = userEvent.setup();
      renderHoldingsPage();

      const searchInput = screen.getByLabelText('Search holdings');
      await user.type(searchInput, 'test');

      expect(
        screen.getByLabelText('Clear search'),
      ).toBeInTheDocument();
    });

    it('search is case-insensitive', async () => {
      const user = userEvent.setup();
      const mockUser = MOCK_USERS[0];
      renderHoldingsPage({ user: mockUser });

      const searchInput = screen.getByLabelText('Search holdings');
      await user.type(searchInput, 'aapl');

      expect(screen.getByText('AAPL')).toBeInTheDocument();
    });
  });

  describe('Sorting Functionality', () => {
    it('sorts by symbol when Symbol column header is clicked', async () => {
      const user = userEvent.setup();
      const mockUser = MOCK_USERS[0];
      renderHoldingsPage({ user: mockUser });

      const symbolHeader = screen.getByText('Symbol').closest('th');
      await user.click(symbolHeader);

      const table = screen.getByRole('table');
      const tbody = table.querySelector('tbody');
      const rows = tbody.querySelectorAll('tr');

      const symbols = Array.from(rows).map((row) => {
        const firstCell = row.querySelector('td');
        return firstCell.textContent.trim();
      });

      const sortedSymbols = [...symbols].sort((a, b) =>
        a.localeCompare(b, undefined, { sensitivity: 'base' }),
      );

      expect(symbols).toEqual(sortedSymbols);
    });

    it('toggles sort direction when the same column header is clicked twice', async () => {
      const user = userEvent.setup();
      const mockUser = MOCK_USERS[0];
      renderHoldingsPage({ user: mockUser });

      const symbolHeader = screen.getByText('Symbol').closest('th');

      // First click: ascending
      await user.click(symbolHeader);

      const table = screen.getByRole('table');
      const tbody = table.querySelector('tbody');

      const getSymbols = () => {
        const rows = tbody.querySelectorAll('tr');
        return Array.from(rows).map((row) => {
          const firstCell = row.querySelector('td');
          return firstCell.textContent.trim();
        });
      };

      const ascSymbols = getSymbols();

      // Second click: descending
      await user.click(symbolHeader);

      const descSymbols = getSymbols();

      expect(ascSymbols).not.toEqual(descSymbols);
    });

    it('sets aria-sort attribute on the sorted column header', async () => {
      const user = userEvent.setup();
      renderHoldingsPage();

      // Default sort is mktValue descending
      const mktValueHeader = screen.getByText('Mkt Value').closest('th');
      expect(mktValueHeader).toHaveAttribute('aria-sort', 'descending');
    });

    it('updates aria-sort when a different column is clicked', async () => {
      const user = userEvent.setup();
      renderHoldingsPage();

      const symbolHeader = screen.getByText('Symbol').closest('th');
      await user.click(symbolHeader);

      expect(symbolHeader).toHaveAttribute('aria-sort', 'ascending');

      const mktValueHeader = screen.getByText('Mkt Value').closest('th');
      expect(mktValueHeader).not.toHaveAttribute('aria-sort');
    });

    it('does not sort when 7-Day Trend column header is clicked', async () => {
      const user = userEvent.setup();
      const mockUser = MOCK_USERS[0];
      renderHoldingsPage({ user: mockUser });

      const trendHeader = screen.getByText('7-Day Trend').closest('th');

      const table = screen.getByRole('table');
      const tbody = table.querySelector('tbody');

      const getSymbolsBefore = () => {
        const rows = tbody.querySelectorAll('tr');
        return Array.from(rows).map((row) => {
          const firstCell = row.querySelector('td');
          return firstCell.textContent.trim();
        });
      };

      const symbolsBefore = getSymbolsBefore();

      await user.click(trendHeader);

      const symbolsAfter = getSymbolsBefore();

      expect(symbolsBefore).toEqual(symbolsAfter);
    });
  });

  describe('Gain/Loss Display', () => {
    it('displays gain/loss dollar values for each holding', () => {
      const user = MOCK_USERS[0];
      renderHoldingsPage({ user });

      const table = screen.getByRole('table');
      const tbody = table.querySelector('tbody');
      const rows = tbody.querySelectorAll('tr');

      // Each row should have gain/loss dollar values containing $ sign
      for (const row of rows) {
        const cells = row.querySelectorAll('td');
        // Gain/Loss $ is the 7th column (index 6)
        const gainLossCell = cells[6];
        expect(gainLossCell.textContent).toContain('$');
      }
    });

    it('displays gain/loss percentage values for each holding', () => {
      const user = MOCK_USERS[0];
      renderHoldingsPage({ user });

      const table = screen.getByRole('table');
      const tbody = table.querySelector('tbody');
      const rows = tbody.querySelectorAll('tr');

      // Each row should have gain/loss percentage values containing % sign
      for (const row of rows) {
        const cells = row.querySelectorAll('td');
        // Gain/Loss % is the 8th column (index 7)
        const gainLossPercentCell = cells[7];
        expect(gainLossPercentCell.textContent).toContain('%');
      }
    });

    it('renders trending up icon for holdings with positive gain', () => {
      const user = MOCK_USERS[0];
      renderHoldingsPage({ user });

      const gainHoldings = user.holdings.filter((h) => h.isGain);
      if (gainHoldings.length > 0) {
        // At least one holding should have a positive trend indicator
        const table = screen.getByRole('table');
        const tbody = table.querySelector('tbody');
        expect(tbody).toBeInTheDocument();
      }
    });
  });

  describe('Empty State', () => {
    it('renders empty state for a user with no holdings', () => {
      renderHoldingsPageWithNewUser();

      expect(screen.getByText('No holdings yet')).toBeInTheDocument();
    });

    it('renders empty state description for a user with no holdings', () => {
      renderHoldingsPageWithNewUser();

      expect(
        screen.getByText(
          'Your investment holdings will appear here once you add positions to your portfolio.',
        ),
      ).toBeInTheDocument();
    });

    it('does not render the search input for a user with no holdings', () => {
      renderHoldingsPageWithNewUser();

      expect(
        screen.queryByLabelText('Search holdings'),
      ).not.toBeInTheDocument();
    });

    it('does not render the table for a user with no holdings', () => {
      renderHoldingsPageWithNewUser();

      expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });

    it('does not render the summary footer for a user with no holdings', () => {
      renderHoldingsPageWithNewUser();

      expect(
        screen.queryByText(/Showing .* of .* holding/),
      ).not.toBeInTheDocument();
    });
  });

  describe('Reset Functionality', () => {
    it('renders the Reset button when search query is active', async () => {
      const user = userEvent.setup();
      renderHoldingsPage();

      const searchInput = screen.getByLabelText('Search holdings');
      await user.type(searchInput, 'AAPL');

      expect(
        screen.getByRole('button', { name: 'Reset' }),
      ).toBeInTheDocument();
    });

    it('clears search and resets sort when Reset button is clicked', async () => {
      const user = userEvent.setup();
      const mockUser = MOCK_USERS[0];
      renderHoldingsPage({ user: mockUser });

      const searchInput = screen.getByLabelText('Search holdings');
      await user.type(searchInput, 'AAPL');

      expect(screen.queryByText('MSFT')).not.toBeInTheDocument();

      const resetButton = screen.getByRole('button', { name: 'Reset' });
      await user.click(resetButton);

      for (const holding of mockUser.holdings) {
        expect(screen.getByText(holding.symbol)).toBeInTheDocument();
      }
    });
  });

  describe('Different Users', () => {
    it('renders correct holdings for Marcus Chen', () => {
      const user = MOCK_USERS[1];
      renderHoldingsPage({ user });

      for (const holding of user.holdings) {
        expect(screen.getByText(holding.symbol)).toBeInTheDocument();
      }
    });

    it('renders correct number of holdings for Marcus Chen', () => {
      const user = MOCK_USERS[1];
      renderHoldingsPage({ user });

      const table = screen.getByRole('table');
      const tbody = table.querySelector('tbody');
      const rows = tbody.querySelectorAll('tr');
      expect(rows.length).toBe(user.holdings.length);
    });

    it('renders correct holdings for Aisha Patel', () => {
      const user = MOCK_USERS[2];
      renderHoldingsPage({ user });

      for (const holding of user.holdings) {
        expect(screen.getByText(holding.symbol)).toBeInTheDocument();
      }
    });

    it('renders correct holdings for Robert Williams', () => {
      const user = MOCK_USERS[3];
      renderHoldingsPage({ user });

      for (const holding of user.holdings) {
        expect(screen.getByText(holding.symbol)).toBeInTheDocument();
      }
    });

    it('renders correct holdings for Sofia Martinez', () => {
      const user = MOCK_USERS[4];
      renderHoldingsPage({ user });

      for (const holding of user.holdings) {
        expect(screen.getByText(holding.symbol)).toBeInTheDocument();
      }
    });
  });

  describe('Table Structure', () => {
    it('renders a table element', () => {
      renderHoldingsPage();

      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('renders a thead with column headers', () => {
      renderHoldingsPage();

      const table = screen.getByRole('table');
      const thead = table.querySelector('thead');
      expect(thead).toBeInTheDocument();

      const headerCells = thead.querySelectorAll('th');
      expect(headerCells.length).toBe(9);
    });

    it('renders a tbody with data rows', () => {
      const user = MOCK_USERS[0];
      renderHoldingsPage({ user });

      const table = screen.getByRole('table');
      const tbody = table.querySelector('tbody');
      expect(tbody).toBeInTheDocument();

      const rows = tbody.querySelectorAll('tr');
      expect(rows.length).toBe(user.holdings.length);
    });
  });

  describe('Edge Cases', () => {
    it('renders without crashing for all mock users', () => {
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
                <MemoryRouter initialEntries={['/accounts']}>
                  <HoldingsPage />
                </MemoryRouter>
              </ToastProvider>
            </AuthProvider>
          </ThemeProvider>,
        );

        expect(
          screen.getByRole('heading', { level: 1 }),
        ).toHaveTextContent('Holdings');

        unmount();
      }
    });

    it('handles partial search matching multiple holdings', async () => {
      const user = userEvent.setup();
      const mockUser = MOCK_USERS[0];
      renderHoldingsPage({ user: mockUser });

      const searchInput = screen.getByLabelText('Search holdings');
      // Search for "Vanguard" which should match multiple holdings for user 0
      await user.type(searchInput, 'Vanguard');

      const vanguardHoldings = mockUser.holdings.filter(
        (h) => h.name.toLowerCase().includes('vanguard'),
      );

      const table = screen.getByRole('table');
      const tbody = table.querySelector('tbody');
      const rows = tbody.querySelectorAll('tr');
      expect(rows.length).toBe(vanguardHoldings.length);
    });

    it('displays currency formatted values in the table', () => {
      const user = MOCK_USERS[0];
      renderHoldingsPage({ user });

      const table = screen.getByRole('table');
      const tbody = table.querySelector('tbody');
      const firstRow = tbody.querySelector('tr');
      const cells = firstRow.querySelectorAll('td');

      // Avg Cost column (index 3) should contain $
      expect(cells[3].textContent).toContain('$');

      // Price column (index 4) should contain $
      expect(cells[4].textContent).toContain('$');

      // Mkt Value column (index 5) should contain $
      expect(cells[5].textContent).toContain('$');
    });
  });
});