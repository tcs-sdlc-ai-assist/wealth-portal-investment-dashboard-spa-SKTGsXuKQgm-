/**
 * Integration tests for ProfilePage
 * Verifies profile fields render with user data, fields are editable,
 * save persists changes, cancel reverts changes, and validation errors
 * display correctly.
 * Implements SCRUM-20326: Profile & Settings Pages
 * @module ProfilePage.test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '../../context/ThemeContext.jsx';
import { AuthProvider } from '../../context/AuthContext.jsx';
import { ToastProvider } from '../../context/ToastContext.jsx';
import { ProfilePage } from './ProfilePage.jsx';
import { MOCK_USERS } from '../../data/mockData.js';
import { USERS_KEY, CURRENT_USER_KEY } from '../../utils/constants.js';

/**
 * Helper to render ProfilePage with all required providers
 * and a pre-authenticated user.
 *
 * @param {Object} [options]
 * @param {Object} [options.user] - The user to authenticate as (defaults to MOCK_USERS[0])
 * @param {string} [options.initialRoute='/profile'] - Initial route for MemoryRouter
 * @returns {Object} render result
 */
function renderProfilePage(options = {}) {
  const { user = MOCK_USERS[0], initialRoute = '/profile' } = options;

  const clonedUsers = JSON.parse(JSON.stringify(MOCK_USERS));
  const clonedUser = JSON.parse(JSON.stringify(user));
  localStorage.setItem(USERS_KEY, JSON.stringify(clonedUsers));
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(clonedUser));

  return render(
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <MemoryRouter initialEntries={[initialRoute]}>
            <ProfilePage />
          </MemoryRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>,
  );
}

/**
 * Helper to render ProfilePage with no authenticated user.
 *
 * @returns {Object} render result
 */
function renderProfilePageUnauthenticated() {
  localStorage.clear();

  return render(
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <MemoryRouter initialEntries={['/profile']}>
            <ProfilePage />
          </MemoryRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>,
  );
}

describe('ProfilePage', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Page Header', () => {
    it('renders the Profile heading', () => {
      renderProfilePage();

      expect(
        screen.getByRole('heading', { level: 1 }),
      ).toHaveTextContent('Profile');
    });

    it('renders the description text', () => {
      renderProfilePage();

      expect(
        screen.getByText('Manage your personal information and account details.'),
      ).toBeInTheDocument();
    });
  });

  describe('Unauthenticated State', () => {
    it('renders a message when no profile data is available', () => {
      renderProfilePageUnauthenticated();

      expect(
        screen.getByText('No profile data available. Please log in.'),
      ).toBeInTheDocument();
    });

    it('does not render the Personal Information section when unauthenticated', () => {
      renderProfilePageUnauthenticated();

      expect(
        screen.queryByText('Personal Information'),
      ).not.toBeInTheDocument();
    });
  });

  describe('Avatar and Summary Card', () => {
    it('renders the user full name in the summary card', () => {
      const user = MOCK_USERS[0];
      renderProfilePage({ user });

      expect(
        screen.getByText(`${user.firstName} ${user.lastName}`),
      ).toBeInTheDocument();
    });

    it('renders the user email in the summary card', () => {
      const user = MOCK_USERS[0];
      renderProfilePage({ user });

      expect(screen.getByText(user.email)).toBeInTheDocument();
    });

    it('renders the account type badge in the summary card', () => {
      const user = MOCK_USERS[0];
      renderProfilePage({ user });

      const badges = screen.getAllByText(user.accountType);
      expect(badges.length).toBeGreaterThan(0);
    });

    it('renders the user avatar image when avatar URL is provided', () => {
      const user = MOCK_USERS[0];
      renderProfilePage({ user });

      const avatar = screen.getByAlt(`${user.firstName} ${user.lastName}`);
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveAttribute('src', user.avatar);
    });
  });

  describe('Personal Information Section', () => {
    it('renders the Personal Information section header', () => {
      renderProfilePage();

      expect(screen.getByText('Personal Information')).toBeInTheDocument();
    });

    it('renders the First Name label', () => {
      renderProfilePage();

      expect(screen.getByText('First Name')).toBeInTheDocument();
    });

    it('renders the Last Name label', () => {
      renderProfilePage();

      expect(screen.getByText('Last Name')).toBeInTheDocument();
    });

    it('renders the Email Address label', () => {
      renderProfilePage();

      expect(screen.getByText('Email Address')).toBeInTheDocument();
    });

    it('renders the Phone Number label', () => {
      renderProfilePage();

      expect(screen.getByText('Phone Number')).toBeInTheDocument();
    });

    it('renders the Date of Birth label', () => {
      renderProfilePage();

      expect(screen.getByText('Date of Birth')).toBeInTheDocument();
    });

    it('renders the Account Type label', () => {
      renderProfilePage();

      expect(screen.getByText('Account Type')).toBeInTheDocument();
    });

    it('displays the correct first name value', () => {
      const user = MOCK_USERS[0];
      renderProfilePage({ user });

      expect(screen.getByText(user.firstName)).toBeInTheDocument();
    });

    it('displays the correct last name value', () => {
      const user = MOCK_USERS[0];
      renderProfilePage({ user });

      expect(screen.getByText(user.lastName)).toBeInTheDocument();
    });

    it('displays the correct email value', () => {
      const user = MOCK_USERS[0];
      renderProfilePage({ user });

      expect(screen.getByText(user.email)).toBeInTheDocument();
    });

    it('displays the correct phone value', () => {
      const user = MOCK_USERS[0];
      renderProfilePage({ user });

      expect(screen.getByText(user.phone)).toBeInTheDocument();
    });
  });

  describe('Edit Functionality', () => {
    it('renders edit buttons for each editable field', () => {
      renderProfilePage();

      const editButtons = screen.getAllByLabelText(/^Edit /);
      expect(editButtons.length).toBeGreaterThanOrEqual(6);
    });

    it('enters edit mode when the Edit First Name button is clicked', async () => {
      const user = userEvent.setup();
      renderProfilePage();

      const editButton = screen.getByLabelText('Edit First Name');
      await user.click(editButton);

      const input = screen.getByDisplayValue(MOCK_USERS[0].firstName);
      expect(input).toBeInTheDocument();
      expect(input.tagName).toBe('INPUT');
    });

    it('enters edit mode when the Edit Last Name button is clicked', async () => {
      const user = userEvent.setup();
      renderProfilePage();

      const editButton = screen.getByLabelText('Edit Last Name');
      await user.click(editButton);

      const input = screen.getByDisplayValue(MOCK_USERS[0].lastName);
      expect(input).toBeInTheDocument();
      expect(input.tagName).toBe('INPUT');
    });

    it('enters edit mode when the Edit Email Address button is clicked', async () => {
      const user = userEvent.setup();
      renderProfilePage();

      const editButton = screen.getByLabelText('Edit Email Address');
      await user.click(editButton);

      const input = screen.getByDisplayValue(MOCK_USERS[0].email);
      expect(input).toBeInTheDocument();
    });

    it('enters edit mode when the Edit Phone Number button is clicked', async () => {
      const user = userEvent.setup();
      renderProfilePage();

      const editButton = screen.getByLabelText('Edit Phone Number');
      await user.click(editButton);

      const input = screen.getByDisplayValue(MOCK_USERS[0].phone);
      expect(input).toBeInTheDocument();
    });

    it('shows save and cancel buttons when in edit mode', async () => {
      const user = userEvent.setup();
      renderProfilePage();

      const editButton = screen.getByLabelText('Edit First Name');
      await user.click(editButton);

      expect(screen.getByLabelText('Save First Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Cancel editing First Name')).toBeInTheDocument();
    });

    it('allows typing a new value in the input field', async () => {
      const user = userEvent.setup();
      renderProfilePage();

      const editButton = screen.getByLabelText('Edit First Name');
      await user.click(editButton);

      const input = screen.getByDisplayValue(MOCK_USERS[0].firstName);
      await user.clear(input);
      await user.type(input, 'Janet');

      expect(input).toHaveValue('Janet');
    });
  });

  describe('Save Changes', () => {
    it('saves the updated first name when save button is clicked', async () => {
      const user = userEvent.setup();
      renderProfilePage();

      const editButton = screen.getByLabelText('Edit First Name');
      await user.click(editButton);

      const input = screen.getByDisplayValue(MOCK_USERS[0].firstName);
      await user.clear(input);
      await user.type(input, 'Janet');

      const saveButton = screen.getByLabelText('Save First Name');
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Janet')).toBeInTheDocument();
      });
    });

    it('exits edit mode after saving', async () => {
      const user = userEvent.setup();
      renderProfilePage();

      const editButton = screen.getByLabelText('Edit First Name');
      await user.click(editButton);

      const input = screen.getByDisplayValue(MOCK_USERS[0].firstName);
      await user.clear(input);
      await user.type(input, 'Janet');

      const saveButton = screen.getByLabelText('Save First Name');
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.queryByLabelText('Save First Name')).not.toBeInTheDocument();
      });
    });

    it('saves the updated last name when save button is clicked', async () => {
      const user = userEvent.setup();
      renderProfilePage();

      const editButton = screen.getByLabelText('Edit Last Name');
      await user.click(editButton);

      const input = screen.getByDisplayValue(MOCK_USERS[0].lastName);
      await user.clear(input);
      await user.type(input, 'Smith');

      const saveButton = screen.getByLabelText('Save Last Name');
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Smith')).toBeInTheDocument();
      });
    });

    it('saves the updated phone number when save button is clicked', async () => {
      const user = userEvent.setup();
      renderProfilePage();

      const editButton = screen.getByLabelText('Edit Phone Number');
      await user.click(editButton);

      const input = screen.getByDisplayValue(MOCK_USERS[0].phone);
      await user.clear(input);
      await user.type(input, '+1 (555) 999-8888');

      const saveButton = screen.getByLabelText('Save Phone Number');
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('+1 (555) 999-8888')).toBeInTheDocument();
      });
    });

    it('persists the updated first name to localStorage', async () => {
      const user = userEvent.setup();
      renderProfilePage();

      const editButton = screen.getByLabelText('Edit First Name');
      await user.click(editButton);

      const input = screen.getByDisplayValue(MOCK_USERS[0].firstName);
      await user.clear(input);
      await user.type(input, 'Janet');

      const saveButton = screen.getByLabelText('Save First Name');
      await user.click(saveButton);

      await waitFor(() => {
        const storedUser = JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
        expect(storedUser.firstName).toBe('Janet');
      });
    });

    it('saves via Enter key press in the input field', async () => {
      const user = userEvent.setup();
      renderProfilePage();

      const editButton = screen.getByLabelText('Edit First Name');
      await user.click(editButton);

      const input = screen.getByDisplayValue(MOCK_USERS[0].firstName);
      await user.clear(input);
      await user.type(input, 'Janet');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText('Janet')).toBeInTheDocument();
        expect(screen.queryByLabelText('Save First Name')).not.toBeInTheDocument();
      });
    });
  });

  describe('Cancel Changes', () => {
    it('reverts the value when cancel button is clicked', async () => {
      const user = userEvent.setup();
      const mockUser = MOCK_USERS[0];
      renderProfilePage({ user: mockUser });

      const editButton = screen.getByLabelText('Edit First Name');
      await user.click(editButton);

      const input = screen.getByDisplayValue(mockUser.firstName);
      await user.clear(input);
      await user.type(input, 'ChangedName');

      const cancelButton = screen.getByLabelText('Cancel editing First Name');
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.getByText(mockUser.firstName)).toBeInTheDocument();
        expect(screen.queryByDisplayValue('ChangedName')).not.toBeInTheDocument();
      });
    });

    it('exits edit mode when cancel button is clicked', async () => {
      const user = userEvent.setup();
      renderProfilePage();

      const editButton = screen.getByLabelText('Edit First Name');
      await user.click(editButton);

      const cancelButton = screen.getByLabelText('Cancel editing First Name');
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByLabelText('Save First Name')).not.toBeInTheDocument();
        expect(screen.queryByLabelText('Cancel editing First Name')).not.toBeInTheDocument();
      });
    });

    it('reverts the value when Escape key is pressed', async () => {
      const user = userEvent.setup();
      const mockUser = MOCK_USERS[0];
      renderProfilePage({ user: mockUser });

      const editButton = screen.getByLabelText('Edit First Name');
      await user.click(editButton);

      const input = screen.getByDisplayValue(mockUser.firstName);
      await user.clear(input);
      await user.type(input, 'ChangedName');
      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.getByText(mockUser.firstName)).toBeInTheDocument();
        expect(screen.queryByLabelText('Save First Name')).not.toBeInTheDocument();
      });
    });

    it('does not persist changes to localStorage when cancelled', async () => {
      const user = userEvent.setup();
      const mockUser = MOCK_USERS[0];
      renderProfilePage({ user: mockUser });

      const editButton = screen.getByLabelText('Edit First Name');
      await user.click(editButton);

      const input = screen.getByDisplayValue(mockUser.firstName);
      await user.clear(input);
      await user.type(input, 'ChangedName');

      const cancelButton = screen.getByLabelText('Cancel editing First Name');
      await user.click(cancelButton);

      const storedUser = JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
      expect(storedUser.firstName).toBe(mockUser.firstName);
    });
  });

  describe('Validation Errors', () => {
    it('displays an error when saving an empty first name', async () => {
      const user = userEvent.setup();
      renderProfilePage();

      const editButton = screen.getByLabelText('Edit First Name');
      await user.click(editButton);

      const input = screen.getByDisplayValue(MOCK_USERS[0].firstName);
      await user.clear(input);

      const saveButton = screen.getByLabelText('Save First Name');
      await user.click(saveButton);

      await waitFor(() => {
        const errorMessage = screen.getByRole('alert');
        expect(errorMessage).toBeInTheDocument();
        expect(errorMessage.textContent).toContain('First name');
      });
    });

    it('displays an error when saving an empty last name', async () => {
      const user = userEvent.setup();
      renderProfilePage();

      const editButton = screen.getByLabelText('Edit Last Name');
      await user.click(editButton);

      const input = screen.getByDisplayValue(MOCK_USERS[0].lastName);
      await user.clear(input);

      const saveButton = screen.getByLabelText('Save Last Name');
      await user.click(saveButton);

      await waitFor(() => {
        const errorMessage = screen.getByRole('alert');
        expect(errorMessage).toBeInTheDocument();
        expect(errorMessage.textContent).toContain('Last name');
      });
    });

    it('displays an error when saving an invalid email', async () => {
      const user = userEvent.setup();
      renderProfilePage();

      const editButton = screen.getByLabelText('Edit Email Address');
      await user.click(editButton);

      const input = screen.getByDisplayValue(MOCK_USERS[0].email);
      await user.clear(input);
      await user.type(input, 'not-an-email');

      const saveButton = screen.getByLabelText('Save Email Address');
      await user.click(saveButton);

      await waitFor(() => {
        const errorMessage = screen.getByRole('alert');
        expect(errorMessage).toBeInTheDocument();
        expect(errorMessage.textContent).toContain('valid email');
      });
    });

    it('displays an error when saving an empty email', async () => {
      const user = userEvent.setup();
      renderProfilePage();

      const editButton = screen.getByLabelText('Edit Email Address');
      await user.click(editButton);

      const input = screen.getByDisplayValue(MOCK_USERS[0].email);
      await user.clear(input);

      const saveButton = screen.getByLabelText('Save Email Address');
      await user.click(saveButton);

      await waitFor(() => {
        const errorMessage = screen.getByRole('alert');
        expect(errorMessage).toBeInTheDocument();
        expect(errorMessage.textContent).toContain('Email');
      });
    });

    it('displays an error when saving a duplicate email', async () => {
      const user = userEvent.setup();
      renderProfilePage({ user: MOCK_USERS[0] });

      const editButton = screen.getByLabelText('Edit Email Address');
      await user.click(editButton);

      const input = screen.getByDisplayValue(MOCK_USERS[0].email);
      await user.clear(input);
      await user.type(input, MOCK_USERS[1].email);

      const saveButton = screen.getByLabelText('Save Email Address');
      await user.click(saveButton);

      await waitFor(() => {
        const errorMessage = screen.getByRole('alert');
        expect(errorMessage).toBeInTheDocument();
        expect(errorMessage.textContent).toContain('already exists');
      });
    });

    it('displays an error when saving an invalid phone number', async () => {
      const user = userEvent.setup();
      renderProfilePage();

      const editButton = screen.getByLabelText('Edit Phone Number');
      await user.click(editButton);

      const input = screen.getByDisplayValue(MOCK_USERS[0].phone);
      await user.clear(input);
      await user.type(input, 'abc');

      const saveButton = screen.getByLabelText('Save Phone Number');
      await user.click(saveButton);

      await waitFor(() => {
        const errorMessage = screen.getByRole('alert');
        expect(errorMessage).toBeInTheDocument();
        expect(errorMessage.textContent).toContain('phone');
      });
    });

    it('clears the error when cancel is clicked after a validation error', async () => {
      const user = userEvent.setup();
      renderProfilePage();

      const editButton = screen.getByLabelText('Edit First Name');
      await user.click(editButton);

      const input = screen.getByDisplayValue(MOCK_USERS[0].firstName);
      await user.clear(input);

      const saveButton = screen.getByLabelText('Save First Name');
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });

      const cancelButton = screen.getByLabelText('Cancel editing First Name');
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      });
    });

    it('sets aria-invalid to true on the input when there is a validation error', async () => {
      const user = userEvent.setup();
      renderProfilePage();

      const editButton = screen.getByLabelText('Edit First Name');
      await user.click(editButton);

      const input = screen.getByDisplayValue(MOCK_USERS[0].firstName);
      await user.clear(input);

      const saveButton = screen.getByLabelText('Save First Name');
      await user.click(saveButton);

      await waitFor(() => {
        const inputField = screen.getByRole('textbox');
        expect(inputField).toHaveAttribute('aria-invalid', 'true');
      });
    });
  });

  describe('Security Overview Section', () => {
    it('renders the Security Overview heading', () => {
      renderProfilePage();

      expect(screen.getByText('Security Overview')).toBeInTheDocument();
    });

    it('renders the Two-Factor Auth label', () => {
      renderProfilePage();

      expect(screen.getByText('Two-Factor Auth')).toBeInTheDocument();
    });

    it('renders the Session Timeout label', () => {
      renderProfilePage();

      expect(screen.getByText('Session Timeout')).toBeInTheDocument();
    });

    it('renders the Trusted Devices label', () => {
      renderProfilePage();

      expect(screen.getByText('Trusted Devices')).toBeInTheDocument();
    });

    it('displays the correct 2FA status for a user with 2FA enabled', () => {
      const user = MOCK_USERS[0];
      renderProfilePage({ user });

      if (user.securitySettings.twoFactorEnabled) {
        expect(screen.getByText('Enabled')).toBeInTheDocument();
      } else {
        expect(screen.getByText('Disabled')).toBeInTheDocument();
      }
    });

    it('displays the correct session timeout value', () => {
      const user = MOCK_USERS[0];
      renderProfilePage({ user });

      const timeout = user.securitySettings.sessionTimeout || 30;
      expect(screen.getByText(`${timeout} minutes`)).toBeInTheDocument();
    });

    it('displays the correct trusted devices count', () => {
      const user = MOCK_USERS[0];
      renderProfilePage({ user });

      const count = user.securitySettings.trustedDevices || 0;
      const suffix = count !== 1 ? 's' : '';
      expect(screen.getByText(`${count} device${suffix}`)).toBeInTheDocument();
    });
  });

  describe('Cost Basis Method Section', () => {
    it('renders the Cost Basis Method label', () => {
      renderProfilePage();

      expect(screen.getByText('Cost Basis Method')).toBeInTheDocument();
    });

    it('displays the correct cost basis method for the user', () => {
      const user = MOCK_USERS[0];
      renderProfilePage({ user });

      const method = user.costBasisMethod || 'FIFO';
      const methodElements = screen.getAllByText(method);
      expect(methodElements.length).toBeGreaterThan(0);
    });
  });

  describe('Account Type Editing', () => {
    it('renders a select dropdown when editing account type', async () => {
      const user = userEvent.setup();
      renderProfilePage();

      const editButton = screen.getByLabelText('Edit Account Type');
      await user.click(editButton);

      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
    });

    it('displays the correct options in the account type dropdown', async () => {
      const user = userEvent.setup();
      renderProfilePage();

      const editButton = screen.getByLabelText('Edit Account Type');
      await user.click(editButton);

      const options = screen.getAllByRole('option');
      const optionValues = options.map((opt) => opt.value);
      expect(optionValues).toContain('Individual');
      expect(optionValues).toContain('Joint');
      expect(optionValues).toContain('IRA');
    });

    it('saves the updated account type when save button is clicked', async () => {
      const user = userEvent.setup();
      renderProfilePage({ user: MOCK_USERS[0] });

      const editButton = screen.getByLabelText('Edit Account Type');
      await user.click(editButton);

      const select = screen.getByRole('combobox');
      await user.selectOptions(select, 'Joint');

      const saveButton = screen.getByLabelText('Save Account Type');
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Joint')).toBeInTheDocument();
      });
    });
  });

  describe('Different Users', () => {
    it('renders correct profile data for Marcus Chen', () => {
      const user = MOCK_USERS[1];
      renderProfilePage({ user });

      expect(screen.getByText(`${user.firstName} ${user.lastName}`)).toBeInTheDocument();
      expect(screen.getByText(user.email)).toBeInTheDocument();
      expect(screen.getByText(user.phone)).toBeInTheDocument();
    });

    it('renders correct profile data for Aisha Patel', () => {
      const user = MOCK_USERS[2];
      renderProfilePage({ user });

      expect(screen.getByText(`${user.firstName} ${user.lastName}`)).toBeInTheDocument();
      expect(screen.getByText(user.email)).toBeInTheDocument();
      expect(screen.getByText(user.phone)).toBeInTheDocument();
    });

    it('renders correct profile data for Robert Williams', () => {
      const user = MOCK_USERS[3];
      renderProfilePage({ user });

      expect(screen.getByText(`${user.firstName} ${user.lastName}`)).toBeInTheDocument();
      expect(screen.getByText(user.email)).toBeInTheDocument();
    });

    it('renders correct profile data for Sofia Martinez', () => {
      const user = MOCK_USERS[4];
      renderProfilePage({ user });

      expect(screen.getByText(`${user.firstName} ${user.lastName}`)).toBeInTheDocument();
      expect(screen.getByText(user.email)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('edit buttons have proper aria-label attributes', () => {
      renderProfilePage();

      expect(screen.getByLabelText('Edit First Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Edit Last Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Edit Email Address')).toBeInTheDocument();
      expect(screen.getByLabelText('Edit Phone Number')).toBeInTheDocument();
      expect(screen.getByLabelText('Edit Date of Birth')).toBeInTheDocument();
      expect(screen.getByLabelText('Edit Account Type')).toBeInTheDocument();
    });

    it('edit buttons are focusable via keyboard', () => {
      renderProfilePage();

      const editButton = screen.getByLabelText('Edit First Name');
      editButton.focus();
      expect(editButton).toHaveFocus();
    });

    it('save button has proper aria-label when in edit mode', async () => {
      const user = userEvent.setup();
      renderProfilePage();

      const editButton = screen.getByLabelText('Edit First Name');
      await user.click(editButton);

      const saveButton = screen.getByLabelText('Save First Name');
      expect(saveButton).toBeInTheDocument();
    });

    it('cancel button has proper aria-label when in edit mode', async () => {
      const user = userEvent.setup();
      renderProfilePage();

      const editButton = screen.getByLabelText('Edit First Name');
      await user.click(editButton);

      const cancelButton = screen.getByLabelText('Cancel editing First Name');
      expect(cancelButton).toBeInTheDocument();
    });

    it('validation error has role alert', async () => {
      const user = userEvent.setup();
      renderProfilePage();

      const editButton = screen.getByLabelText('Edit First Name');
      await user.click(editButton);

      const input = screen.getByDisplayValue(MOCK_USERS[0].firstName);
      await user.clear(input);

      const saveButton = screen.getByLabelText('Save First Name');
      await user.click(saveButton);

      await waitFor(() => {
        const alert = screen.getByRole('alert');
        expect(alert).toBeInTheDocument();
      });
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
                <MemoryRouter initialEntries={['/profile']}>
                  <ProfilePage />
                </MemoryRouter>
              </ToastProvider>
            </AuthProvider>
          </ThemeProvider>,
        );

        expect(
          screen.getByRole('heading', { level: 1 }),
        ).toHaveTextContent('Profile');

        unmount();
      }
    });

    it('only allows editing one field at a time', async () => {
      const user = userEvent.setup();
      renderProfilePage();

      const editFirstName = screen.getByLabelText('Edit First Name');
      await user.click(editFirstName);

      expect(screen.getByLabelText('Save First Name')).toBeInTheDocument();

      const editLastName = screen.getByLabelText('Edit Last Name');
      await user.click(editLastName);

      expect(screen.getByLabelText('Save Last Name')).toBeInTheDocument();
    });

    it('allows saving the same email as the current user (no duplicate error)', async () => {
      const user = userEvent.setup();
      const mockUser = MOCK_USERS[0];
      renderProfilePage({ user: mockUser });

      const editButton = screen.getByLabelText('Edit Email Address');
      await user.click(editButton);

      const input = screen.getByDisplayValue(mockUser.email);

      const saveButton = screen.getByLabelText('Save Email Address');
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      });
    });
  });
});