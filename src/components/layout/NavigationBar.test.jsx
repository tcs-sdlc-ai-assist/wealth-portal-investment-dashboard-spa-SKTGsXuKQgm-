/**
 * Integration tests for NavigationBar
 * Verifies all nav links render, active route is highlighted, hamburger menu
 * appears on small viewport, profile avatar triggers dropdown, and navigation
 * works correctly.
 * Implements SCRUM-20314: Top Navigation Bar
 * @module NavigationBar.test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '../../context/ThemeContext.jsx';
import { AuthProvider } from '../../context/AuthContext.jsx';
import { ToastProvider } from '../../context/ToastContext.jsx';
import { NavigationBar } from './NavigationBar.jsx';
import { MOCK_USERS } from '../../data/mockData.js';
import { USERS_KEY, CURRENT_USER_KEY, ROUTES } from '../../utils/constants.js';

/**
 * Helper to render NavigationBar with all required providers
 * and a pre-authenticated user.
 *
 * @param {Object} [options]
 * @param {Object} [options.user] - The user to authenticate as (defaults to MOCK_USERS[0])
 * @param {string} [options.initialRoute='/dashboard'] - Initial route for MemoryRouter
 * @returns {Object} render result
 */
function renderNavigationBar(options = {}) {
  const { user = MOCK_USERS[0], initialRoute = '/dashboard' } = options;

  const clonedUsers = JSON.parse(JSON.stringify(MOCK_USERS));
  const clonedUser = JSON.parse(JSON.stringify(user));
  localStorage.setItem(USERS_KEY, JSON.stringify(clonedUsers));
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(clonedUser));

  return render(
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <MemoryRouter initialEntries={[initialRoute]}>
            <NavigationBar />
          </MemoryRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>,
  );
}

/**
 * Helper to render NavigationBar with no authenticated user.
 *
 * @param {Object} [options]
 * @param {string} [options.initialRoute='/login'] - Initial route for MemoryRouter
 * @returns {Object} render result
 */
function renderNavigationBarUnauthenticated(options = {}) {
  const { initialRoute = '/login' } = options;

  localStorage.clear();

  return render(
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <MemoryRouter initialEntries={[initialRoute]}>
            <NavigationBar />
          </MemoryRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>,
  );
}

describe('NavigationBar', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Rendering when authenticated', () => {
    it('renders the navigation bar when user is authenticated', () => {
      renderNavigationBar();

      const nav = screen.getByRole('navigation', { name: 'Main navigation' });
      expect(nav).toBeInTheDocument();
    });

    it('renders the application title / logo', () => {
      renderNavigationBar();

      const logoButton = screen.getByLabelText('Go to dashboard');
      expect(logoButton).toBeInTheDocument();
    });

    it('renders the banner header element', () => {
      renderNavigationBar();

      const banner = screen.getByRole('banner');
      expect(banner).toBeInTheDocument();
    });
  });

  describe('Rendering when unauthenticated', () => {
    it('does not render the navigation bar when user is not authenticated', () => {
      renderNavigationBarUnauthenticated();

      const nav = screen.queryByRole('navigation', { name: 'Main navigation' });
      expect(nav).not.toBeInTheDocument();
    });

    it('does not render the banner when user is not authenticated', () => {
      renderNavigationBarUnauthenticated();

      const banner = screen.queryByRole('banner');
      expect(banner).not.toBeInTheDocument();
    });
  });

  describe('Navigation Links', () => {
    it('renders the Accounts nav link', () => {
      renderNavigationBar();

      const link = screen.getByRole('link', { name: 'Accounts' });
      expect(link).toBeInTheDocument();
    });

    it('renders the Holdings nav link', () => {
      renderNavigationBar();

      const link = screen.getByRole('link', { name: 'Holdings' });
      expect(link).toBeInTheDocument();
    });

    it('renders the Activity nav link', () => {
      renderNavigationBar();

      const link = screen.getByRole('link', { name: 'Activity' });
      expect(link).toBeInTheDocument();
    });

    it('renders the Documents nav link', () => {
      renderNavigationBar();

      const link = screen.getByRole('link', { name: 'Documents' });
      expect(link).toBeInTheDocument();
    });

    it('renders the Products & Services nav link', () => {
      renderNavigationBar();

      const link = screen.getByRole('link', { name: 'Products & Services' });
      expect(link).toBeInTheDocument();
    });

    it('renders all 5 navigation links', () => {
      renderNavigationBar();

      const links = screen.getAllByRole('link');
      expect(links.length).toBe(5);
    });

    it('Accounts link points to the dashboard route', () => {
      renderNavigationBar();

      const link = screen.getByRole('link', { name: 'Accounts' });
      expect(link).toHaveAttribute('href', ROUTES.DASHBOARD);
    });

    it('Holdings link points to the accounts route', () => {
      renderNavigationBar();

      const link = screen.getByRole('link', { name: 'Holdings' });
      expect(link).toHaveAttribute('href', ROUTES.ACCOUNTS);
    });

    it('Activity link points to the transactions route', () => {
      renderNavigationBar();

      const link = screen.getByRole('link', { name: 'Activity' });
      expect(link).toHaveAttribute('href', ROUTES.TRANSACTIONS);
    });

    it('Documents link points to the documents route', () => {
      renderNavigationBar();

      const link = screen.getByRole('link', { name: 'Documents' });
      expect(link).toHaveAttribute('href', ROUTES.DOCUMENTS);
    });

    it('Products & Services link points to the products route', () => {
      renderNavigationBar();

      const link = screen.getByRole('link', { name: 'Products & Services' });
      expect(link).toHaveAttribute('href', ROUTES.PRODUCTS);
    });
  });

  describe('Active Route Highlighting', () => {
    it('marks the Accounts link as current page when on /dashboard', () => {
      renderNavigationBar({ initialRoute: '/dashboard' });

      const link = screen.getByRole('link', { name: 'Accounts' });
      expect(link).toHaveAttribute('aria-current', 'page');
    });

    it('marks the Holdings link as current page when on /accounts', () => {
      renderNavigationBar({ initialRoute: '/accounts' });

      const link = screen.getByRole('link', { name: 'Holdings' });
      expect(link).toHaveAttribute('aria-current', 'page');
    });

    it('marks the Activity link as current page when on /transactions', () => {
      renderNavigationBar({ initialRoute: '/transactions' });

      const link = screen.getByRole('link', { name: 'Activity' });
      expect(link).toHaveAttribute('aria-current', 'page');
    });

    it('marks the Documents link as current page when on /documents', () => {
      renderNavigationBar({ initialRoute: '/documents' });

      const link = screen.getByRole('link', { name: 'Documents' });
      expect(link).toHaveAttribute('aria-current', 'page');
    });

    it('marks the Products & Services link as current page when on /products', () => {
      renderNavigationBar({ initialRoute: '/products' });

      const link = screen.getByRole('link', { name: 'Products & Services' });
      expect(link).toHaveAttribute('aria-current', 'page');
    });

    it('does not mark other links as current page when on /dashboard', () => {
      renderNavigationBar({ initialRoute: '/dashboard' });

      const holdingsLink = screen.getByRole('link', { name: 'Holdings' });
      const activityLink = screen.getByRole('link', { name: 'Activity' });
      const documentsLink = screen.getByRole('link', { name: 'Documents' });
      const productsLink = screen.getByRole('link', { name: 'Products & Services' });

      expect(holdingsLink).not.toHaveAttribute('aria-current');
      expect(activityLink).not.toHaveAttribute('aria-current');
      expect(documentsLink).not.toHaveAttribute('aria-current');
      expect(productsLink).not.toHaveAttribute('aria-current');
    });
  });

  describe('Hamburger Menu Button', () => {
    it('renders the hamburger menu button for mobile', () => {
      renderNavigationBar();

      const hamburgerButton = screen.getByLabelText('Open navigation menu');
      expect(hamburgerButton).toBeInTheDocument();
    });

    it('hamburger button has aria-expanded attribute set to false initially', () => {
      renderNavigationBar();

      const hamburgerButton = screen.getByLabelText('Open navigation menu');
      expect(hamburgerButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('opens the mobile drawer when hamburger button is clicked', async () => {
      const user = userEvent.setup();
      renderNavigationBar();

      const hamburgerButton = screen.getByLabelText('Open navigation menu');
      await user.click(hamburgerButton);

      const drawer = screen.getByRole('dialog', { name: 'Mobile navigation' });
      expect(drawer).toBeInTheDocument();
    });

    it('mobile drawer contains the close button', async () => {
      const user = userEvent.setup();
      renderNavigationBar();

      const hamburgerButton = screen.getByLabelText('Open navigation menu');
      await user.click(hamburgerButton);

      const closeButton = screen.getByLabelText('Close navigation menu');
      expect(closeButton).toBeInTheDocument();
    });

    it('closes the mobile drawer when close button is clicked', async () => {
      const user = userEvent.setup();
      renderNavigationBar();

      const hamburgerButton = screen.getByLabelText('Open navigation menu');
      await user.click(hamburgerButton);

      const closeButton = screen.getByLabelText('Close navigation menu');
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByRole('dialog', { name: 'Mobile navigation' })).not.toBeInTheDocument();
      });
    });

    it('mobile drawer contains all navigation links', async () => {
      const user = userEvent.setup();
      renderNavigationBar();

      const hamburgerButton = screen.getByLabelText('Open navigation menu');
      await user.click(hamburgerButton);

      const drawer = screen.getByRole('dialog', { name: 'Mobile navigation' });

      expect(within(drawer).getByText('Accounts')).toBeInTheDocument();
      expect(within(drawer).getByText('Holdings')).toBeInTheDocument();
      expect(within(drawer).getByText('Activity')).toBeInTheDocument();
      expect(within(drawer).getByText('Documents')).toBeInTheDocument();
      expect(within(drawer).getByText('Products & Services')).toBeInTheDocument();
    });

    it('mobile drawer contains Profile link', async () => {
      const user = userEvent.setup();
      renderNavigationBar();

      const hamburgerButton = screen.getByLabelText('Open navigation menu');
      await user.click(hamburgerButton);

      const drawer = screen.getByRole('dialog', { name: 'Mobile navigation' });
      expect(within(drawer).getByText('Profile')).toBeInTheDocument();
    });

    it('mobile drawer contains Settings link', async () => {
      const user = userEvent.setup();
      renderNavigationBar();

      const hamburgerButton = screen.getByLabelText('Open navigation menu');
      await user.click(hamburgerButton);

      const drawer = screen.getByRole('dialog', { name: 'Mobile navigation' });
      expect(within(drawer).getByText('Settings')).toBeInTheDocument();
    });

    it('mobile drawer contains Log out button', async () => {
      const user = userEvent.setup();
      renderNavigationBar();

      const hamburgerButton = screen.getByLabelText('Open navigation menu');
      await user.click(hamburgerButton);

      const drawer = screen.getByRole('dialog', { name: 'Mobile navigation' });
      expect(within(drawer).getByText('Log out')).toBeInTheDocument();
    });

    it('mobile drawer contains Theme toggle', async () => {
      const user = userEvent.setup();
      renderNavigationBar();

      const hamburgerButton = screen.getByLabelText('Open navigation menu');
      await user.click(hamburgerButton);

      const drawer = screen.getByRole('dialog', { name: 'Mobile navigation' });
      expect(within(drawer).getByText('Theme')).toBeInTheDocument();
    });

    it('mobile drawer displays the application title', async () => {
      const user = userEvent.setup();
      renderNavigationBar();

      const hamburgerButton = screen.getByLabelText('Open navigation menu');
      await user.click(hamburgerButton);

      const drawer = screen.getByRole('dialog', { name: 'Mobile navigation' });
      expect(within(drawer).getByText('Wealth Portal')).toBeInTheDocument();
    });
  });

  describe('Mobile Drawer User Info', () => {
    it('displays the current user name in the mobile drawer', async () => {
      const user = userEvent.setup();
      const mockUser = MOCK_USERS[0];
      renderNavigationBar({ user: mockUser });

      const hamburgerButton = screen.getByLabelText('Open navigation menu');
      await user.click(hamburgerButton);

      const drawer = screen.getByRole('dialog', { name: 'Mobile navigation' });
      expect(
        within(drawer).getByText(`${mockUser.firstName} ${mockUser.lastName}`),
      ).toBeInTheDocument();
    });

    it('displays the current user email in the mobile drawer', async () => {
      const user = userEvent.setup();
      const mockUser = MOCK_USERS[0];
      renderNavigationBar({ user: mockUser });

      const hamburgerButton = screen.getByLabelText('Open navigation menu');
      await user.click(hamburgerButton);

      const drawer = screen.getByRole('dialog', { name: 'Mobile navigation' });
      expect(within(drawer).getByText(mockUser.email)).toBeInTheDocument();
    });

    it('displays the user avatar in the mobile drawer', async () => {
      const user = userEvent.setup();
      const mockUser = MOCK_USERS[0];
      renderNavigationBar({ user: mockUser });

      const hamburgerButton = screen.getByLabelText('Open navigation menu');
      await user.click(hamburgerButton);

      const drawer = screen.getByRole('dialog', { name: 'Mobile navigation' });
      const avatar = within(drawer).getByAlt(`${mockUser.firstName} ${mockUser.lastName}`);
      expect(avatar).toBeInTheDocument();
    });
  });

  describe('Profile Avatar and Dropdown', () => {
    it('renders the profile avatar button', () => {
      renderNavigationBar();

      const profileButton = screen.getByLabelText('Open profile menu');
      expect(profileButton).toBeInTheDocument();
    });

    it('profile button has aria-expanded set to false initially', () => {
      renderNavigationBar();

      const profileButton = screen.getByLabelText('Open profile menu');
      expect(profileButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('profile button has aria-haspopup set to true', () => {
      renderNavigationBar();

      const profileButton = screen.getByLabelText('Open profile menu');
      expect(profileButton).toHaveAttribute('aria-haspopup', 'true');
    });

    it('renders the user avatar image in the profile button', () => {
      const mockUser = MOCK_USERS[0];
      renderNavigationBar({ user: mockUser });

      const profileButton = screen.getByLabelText('Open profile menu');
      const avatar = within(profileButton).getByAlt(
        `${mockUser.firstName} ${mockUser.lastName}`,
      );
      expect(avatar).toBeInTheDocument();
    });

    it('opens the profile dropdown when profile button is clicked', async () => {
      const user = userEvent.setup();
      renderNavigationBar();

      const profileButton = screen.getByLabelText('Open profile menu');
      await user.click(profileButton);

      const menu = screen.getByRole('menu');
      expect(menu).toBeInTheDocument();
    });

    it('profile dropdown contains Profile menu item', async () => {
      const user = userEvent.setup();
      renderNavigationBar();

      const profileButton = screen.getByLabelText('Open profile menu');
      await user.click(profileButton);

      const profileMenuItem = screen.getByRole('menuitem', { name: 'Profile' });
      expect(profileMenuItem).toBeInTheDocument();
    });

    it('profile dropdown contains Settings menu item', async () => {
      const user = userEvent.setup();
      renderNavigationBar();

      const profileButton = screen.getByLabelText('Open profile menu');
      await user.click(profileButton);

      const settingsMenuItem = screen.getByRole('menuitem', { name: 'Settings' });
      expect(settingsMenuItem).toBeInTheDocument();
    });

    it('profile dropdown contains Log out menu item', async () => {
      const user = userEvent.setup();
      renderNavigationBar();

      const profileButton = screen.getByLabelText('Open profile menu');
      await user.click(profileButton);

      const logoutMenuItem = screen.getByRole('menuitem', { name: 'Log out' });
      expect(logoutMenuItem).toBeInTheDocument();
    });

    it('closes the profile dropdown when Escape key is pressed', async () => {
      const user = userEvent.setup();
      renderNavigationBar();

      const profileButton = screen.getByLabelText('Open profile menu');
      await user.click(profileButton);

      expect(screen.getByRole('menu')).toBeInTheDocument();

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      });
    });
  });

  describe('Theme Toggle', () => {
    it('renders the theme toggle button in the navigation bar', () => {
      renderNavigationBar();

      const themeToggle = screen.getByRole('button', {
        name: /Switch to (dark|light) mode/,
      });
      expect(themeToggle).toBeInTheDocument();
    });

    it('toggles theme when theme toggle is clicked', async () => {
      const user = userEvent.setup();
      renderNavigationBar();

      const themeToggle = screen.getByRole('button', {
        name: /Switch to (dark|light) mode/,
      });

      const initialLabel = themeToggle.getAttribute('aria-label');
      await user.click(themeToggle);

      const updatedThemeToggle = screen.getByRole('button', {
        name: /Switch to (dark|light) mode/,
      });
      const updatedLabel = updatedThemeToggle.getAttribute('aria-label');

      expect(updatedLabel).not.toBe(initialLabel);
    });
  });

  describe('Logo / Dashboard Navigation', () => {
    it('renders the logo button with Go to dashboard label', () => {
      renderNavigationBar();

      const logoButton = screen.getByLabelText('Go to dashboard');
      expect(logoButton).toBeInTheDocument();
    });

    it('logo button is focusable', () => {
      renderNavigationBar();

      const logoButton = screen.getByLabelText('Go to dashboard');
      logoButton.focus();
      expect(logoButton).toHaveFocus();
    });
  });

  describe('Spacer Element', () => {
    it('renders a spacer div to offset the fixed header', () => {
      const { container } = renderNavigationBar();

      // The spacer is a div with h-16 class after the header
      const spacer = container.querySelector('div.h-16');
      expect(spacer).toBeInTheDocument();
    });
  });

  describe('Different Users', () => {
    it('renders the correct avatar for Jane Doe', () => {
      const mockUser = MOCK_USERS[0];
      renderNavigationBar({ user: mockUser });

      const profileButton = screen.getByLabelText('Open profile menu');
      const avatar = within(profileButton).getByAlt(
        `${mockUser.firstName} ${mockUser.lastName}`,
      );
      expect(avatar).toBeInTheDocument();
    });

    it('renders the correct avatar for Marcus Chen', () => {
      const mockUser = MOCK_USERS[1];
      renderNavigationBar({ user: mockUser });

      const profileButton = screen.getByLabelText('Open profile menu');
      const avatar = within(profileButton).getByAlt(
        `${mockUser.firstName} ${mockUser.lastName}`,
      );
      expect(avatar).toBeInTheDocument();
    });

    it('renders the correct avatar for Aisha Patel', () => {
      const mockUser = MOCK_USERS[2];
      renderNavigationBar({ user: mockUser });

      const profileButton = screen.getByLabelText('Open profile menu');
      const avatar = within(profileButton).getByAlt(
        `${mockUser.firstName} ${mockUser.lastName}`,
      );
      expect(avatar).toBeInTheDocument();
    });

    it('displays correct user name in mobile drawer for Marcus Chen', async () => {
      const user = userEvent.setup();
      const mockUser = MOCK_USERS[1];
      renderNavigationBar({ user: mockUser });

      const hamburgerButton = screen.getByLabelText('Open navigation menu');
      await user.click(hamburgerButton);

      const drawer = screen.getByRole('dialog', { name: 'Mobile navigation' });
      expect(
        within(drawer).getByText(`${mockUser.firstName} ${mockUser.lastName}`),
      ).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('navigation has proper aria-label', () => {
      renderNavigationBar();

      const nav = screen.getByRole('navigation', { name: 'Main navigation' });
      expect(nav).toHaveAttribute('aria-label', 'Main navigation');
    });

    it('hamburger button has proper aria-label', () => {
      renderNavigationBar();

      const hamburgerButton = screen.getByLabelText('Open navigation menu');
      expect(hamburgerButton).toHaveAttribute('aria-label', 'Open navigation menu');
    });

    it('profile button has proper aria-label', () => {
      renderNavigationBar();

      const profileButton = screen.getByLabelText('Open profile menu');
      expect(profileButton).toHaveAttribute('aria-label', 'Open profile menu');
    });

    it('mobile drawer has role dialog and aria-modal', async () => {
      const user = userEvent.setup();
      renderNavigationBar();

      const hamburgerButton = screen.getByLabelText('Open navigation menu');
      await user.click(hamburgerButton);

      const drawer = screen.getByRole('dialog', { name: 'Mobile navigation' });
      expect(drawer).toHaveAttribute('aria-modal', 'true');
    });

    it('profile dropdown has role menu', async () => {
      const user = userEvent.setup();
      renderNavigationBar();

      const profileButton = screen.getByLabelText('Open profile menu');
      await user.click(profileButton);

      const menu = screen.getByRole('menu');
      expect(menu).toHaveAttribute('aria-orientation', 'vertical');
    });

    it('nav links are focusable via keyboard', () => {
      renderNavigationBar();

      const link = screen.getByRole('link', { name: 'Accounts' });
      link.focus();
      expect(link).toHaveFocus();
    });

    it('hamburger button is focusable via keyboard', () => {
      renderNavigationBar();

      const hamburgerButton = screen.getByLabelText('Open navigation menu');
      hamburgerButton.focus();
      expect(hamburgerButton).toHaveFocus();
    });

    it('profile button is focusable via keyboard', () => {
      renderNavigationBar();

      const profileButton = screen.getByLabelText('Open profile menu');
      profileButton.focus();
      expect(profileButton).toHaveFocus();
    });
  });

  describe('Edge Cases', () => {
    it('renders without crashing for all mock users', () => {
      for (const mockUser of MOCK_USERS) {
        localStorage.clear();

        const clonedUsers = JSON.parse(JSON.stringify(MOCK_USERS));
        const clonedUser = JSON.parse(JSON.stringify(mockUser));
        localStorage.setItem(USERS_KEY, JSON.stringify(clonedUsers));
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(clonedUser));

        const { unmount } = render(
          <ThemeProvider>
            <AuthProvider>
              <ToastProvider>
                <MemoryRouter initialEntries={['/dashboard']}>
                  <NavigationBar />
                </MemoryRouter>
              </ToastProvider>
            </AuthProvider>
          </ThemeProvider>,
        );

        expect(
          screen.getByRole('navigation', { name: 'Main navigation' }),
        ).toBeInTheDocument();

        unmount();
      }
    });

    it('renders correctly on different routes', () => {
      const routes = ['/dashboard', '/accounts', '/transactions', '/documents', '/products'];

      for (const route of routes) {
        localStorage.clear();

        const clonedUsers = JSON.parse(JSON.stringify(MOCK_USERS));
        const clonedUser = JSON.parse(JSON.stringify(MOCK_USERS[0]));
        localStorage.setItem(USERS_KEY, JSON.stringify(clonedUsers));
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(clonedUser));

        const { unmount } = render(
          <ThemeProvider>
            <AuthProvider>
              <ToastProvider>
                <MemoryRouter initialEntries={[route]}>
                  <NavigationBar />
                </MemoryRouter>
              </ToastProvider>
            </AuthProvider>
          </ThemeProvider>,
        );

        expect(
          screen.getByRole('navigation', { name: 'Main navigation' }),
        ).toBeInTheDocument();

        unmount();
      }
    });

    it('closes mobile drawer when escape key is pressed', async () => {
      const user = userEvent.setup();
      renderNavigationBar();

      const hamburgerButton = screen.getByLabelText('Open navigation menu');
      await user.click(hamburgerButton);

      expect(screen.getByRole('dialog', { name: 'Mobile navigation' })).toBeInTheDocument();

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByRole('dialog', { name: 'Mobile navigation' })).not.toBeInTheDocument();
      });
    });
  });
});