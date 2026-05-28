/**
 * Authentication and session state management context provider
 * Implements FR-001: Mock Login UI, FR-002: Signup Page with Validation,
 * FR-003: Session Management, FR-004: Pre-seeded Mock Users
 * @module AuthContext
 */

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { get, set, remove, has } from '../utils/storageAdapter.js';
import { USERS_KEY, CURRENT_USER_KEY } from '../utils/constants.js';
import { MOCK_USERS } from '../data/mockData.js';
import { validateSignup } from '../utils/validators.js';
import { generateId } from '../utils/helpers.js';

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} email
 * @property {string} phone
 * @property {string} password
 * @property {string} dob
 * @property {string} accountType
 * @property {string} [avatar]
 * @property {string} [lastLoginAt]
 * @property {Array} [accounts]
 * @property {Array} [holdings]
 * @property {Array} [activity]
 * @property {Array} [documents]
 * @property {Object} [communicationPreferences]
 * @property {Object} [securitySettings]
 * @property {Array} [bankAccounts]
 * @property {Array} [beneficiaries]
 * @property {string} [costBasisMethod]
 */

/**
 * @typedef {Object} AuthContextValue
 * @property {User|null} currentUser - The currently authenticated user
 * @property {boolean} isAuthenticated - Whether a user is currently authenticated
 * @property {Array<User>} allUsers - All registered users
 * @property {function(string, string): {success: boolean, error?: string}} login - Log in with email and password
 * @property {function(): void} logout - Log out and clear session
 * @property {function(Object): {success: boolean, errors?: Object}} signup - Register a new user
 * @property {function(): User|null} getCurrentUser - Returns the current user
 * @property {function(User): void} setCurrentUser - Sets the current user and persists
 * @property {function(Object): void} updateUser - Updates the current user's data
 * @property {function(): void} resetData - Resets all data and reseeds mock users
 * @property {boolean} isCorrupted - Whether data corruption was detected
 */

/** @type {React.Context<AuthContextValue|null>} */
const AuthContext = createContext(null);

/**
 * Validates that a users array is structurally sound.
 *
 * @param {*} data - The data to validate
 * @returns {boolean} True if the data is a valid users array
 */
function isValidUsersArray(data) {
  if (!Array.isArray(data)) {
    return false;
  }
  return data.every(
    (user) =>
      user &&
      typeof user === 'object' &&
      typeof user.id === 'string' &&
      typeof user.email === 'string',
  );
}

/**
 * Validates that a user object is structurally sound.
 *
 * @param {*} data - The data to validate
 * @returns {boolean} True if the data is a valid user object
 */
function isValidUserObject(data) {
  if (!data || typeof data !== 'object') {
    return false;
  }
  return typeof data.id === 'string' && typeof data.email === 'string';
}

/**
 * Seeds mock users into storage if they are not already present.
 *
 * @returns {Array<User>} The seeded or existing users array
 */
function seedMockUsersIfNeeded() {
  if (has(USERS_KEY)) {
    const stored = get(USERS_KEY, null);
    if (isValidUsersArray(stored)) {
      return stored;
    }
    // Data is corrupted — remove and reseed
    console.warn('[AuthContext] Corrupted users data detected. Reseeding mock users.');
    remove(USERS_KEY);
  }

  // Deep clone mock users to avoid mutating the original
  const cloned = JSON.parse(JSON.stringify(MOCK_USERS));
  set(USERS_KEY, cloned);
  return cloned;
}

/**
 * Loads the current user from storage, validating integrity.
 *
 * @param {Array<User>} users - The current users array for cross-reference
 * @returns {User|null} The current user or null
 */
function loadCurrentUser(users) {
  if (!has(CURRENT_USER_KEY)) {
    return null;
  }

  const stored = get(CURRENT_USER_KEY, null);
  if (!isValidUserObject(stored)) {
    console.warn('[AuthContext] Corrupted currentUser data detected. Clearing session.');
    remove(CURRENT_USER_KEY);
    return null;
  }

  // Cross-reference with users array to get the latest data
  const matched = users.find((u) => u.id === stored.id);
  if (matched) {
    return matched;
  }

  // User no longer exists in users array
  console.warn('[AuthContext] Current user not found in users list. Clearing session.');
  remove(CURRENT_USER_KEY);
  return null;
}

/**
 * AuthProvider component that manages authentication state,
 * seeds mock users, and provides login/logout/signup functionality.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element}
 */
export function AuthProvider({ children }) {
  const [isCorrupted, setIsCorrupted] = useState(false);
  const [allUsers, setAllUsers] = useState(() => {
    try {
      return seedMockUsersIfNeeded();
    } catch (error) {
      console.error('[AuthContext] Failed to seed mock users.', error);
      setIsCorrupted(true);
      return [];
    }
  });

  const [currentUser, setCurrentUserState] = useState(() => {
    try {
      return loadCurrentUser(allUsers);
    } catch (error) {
      console.error('[AuthContext] Failed to load current user.', error);
      return null;
    }
  });

  // Detect corruption on mount
  useEffect(() => {
    try {
      if (has(USERS_KEY)) {
        const stored = get(USERS_KEY, null);
        if (!isValidUsersArray(stored)) {
          setIsCorrupted(true);
        }
      }
    } catch {
      setIsCorrupted(true);
    }
  }, []);

  /**
   * Persists the current user to storage and updates state.
   *
   * @param {User} user - The user to set as current
   */
  const setCurrentUser = useCallback(
    (user) => {
      if (!user) {
        remove(CURRENT_USER_KEY);
        setCurrentUserState(null);
        return;
      }

      const userWithLogin = {
        ...user,
        lastLoginAt: new Date().toISOString(),
      };

      // Update the user in the allUsers array as well
      setAllUsers((prev) => {
        const updated = prev.map((u) =>
          u.id === userWithLogin.id ? userWithLogin : u,
        );
        set(USERS_KEY, updated);
        return updated;
      });

      set(CURRENT_USER_KEY, userWithLogin);
      setCurrentUserState(userWithLogin);
    },
    [],
  );

  /**
   * Returns the current user.
   *
   * @returns {User|null} The current user
   */
  const getCurrentUser = useCallback(() => {
    return currentUser;
  }, [currentUser]);

  /**
   * Logs in a user with email and password.
   *
   * @param {string} email - The user's email
   * @param {string} password - The user's password
   * @returns {{ success: boolean, error?: string }} Login result
   */
  const login = useCallback(
    (email, password) => {
      if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
        return { success: false, error: 'Email and password are required.' };
      }

      const normalised = email.trim().toLowerCase();
      const user = allUsers.find(
        (u) => u.email.toLowerCase() === normalised,
      );

      if (!user) {
        return { success: false, error: 'No account found with this email address.' };
      }

      if (user.password !== password) {
        return { success: false, error: 'Incorrect password. Please try again.' };
      }

      setCurrentUser(user);
      return { success: true };
    },
    [allUsers, setCurrentUser],
  );

  /**
   * Logs out the current user and clears the session.
   */
  const logout = useCallback(() => {
    remove(CURRENT_USER_KEY);
    setCurrentUserState(null);
  }, []);

  /**
   * Registers a new user after validation.
   *
   * @param {Object} fields - The signup form fields
   * @param {string} fields.firstName - User's first name
   * @param {string} fields.lastName - User's last name
   * @param {string} fields.email - User's email address
   * @param {string} fields.phone - User's phone number
   * @param {string} fields.password - User's password
   * @param {string} [fields.confirmPassword] - Password confirmation
   * @param {string} fields.accountType - Account type
   * @param {string} fields.dob - Date of birth (ISO format)
   * @returns {{ success: boolean, errors?: Object.<string, string>, user?: User }} Signup result
   */
  const signup = useCallback(
    (fields) => {
      const validation = validateSignup(fields, allUsers);

      if (!validation.valid) {
        return { success: false, errors: validation.errors };
      }

      const newUser = {
        id: generateId(),
        firstName: fields.firstName.trim(),
        lastName: fields.lastName.trim(),
        email: fields.email.trim().toLowerCase(),
        phone: fields.phone.trim(),
        password: fields.password,
        dob: fields.dob,
        accountType: fields.accountType,
        avatar: `https://api.dicebear.com/8.x/avataaars/svg?seed=${fields.firstName.trim()}`,
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

      const updatedUsers = [...allUsers, newUser];
      set(USERS_KEY, updatedUsers);
      setAllUsers(updatedUsers);

      return { success: true, user: newUser };
    },
    [allUsers],
  );

  /**
   * Updates the current user's data and persists changes.
   *
   * @param {Object} updates - Partial user object with fields to update
   */
  const updateUser = useCallback(
    (updates) => {
      if (!currentUser) {
        return;
      }

      const updatedUser = { ...currentUser, ...updates };

      setAllUsers((prev) => {
        const updated = prev.map((u) =>
          u.id === updatedUser.id ? updatedUser : u,
        );
        set(USERS_KEY, updated);
        return updated;
      });

      set(CURRENT_USER_KEY, updatedUser);
      setCurrentUserState(updatedUser);
    },
    [currentUser],
  );

  /**
   * Resets all data, clears storage, and reseeds mock users.
   */
  const resetData = useCallback(() => {
    remove(USERS_KEY);
    remove(CURRENT_USER_KEY);

    const cloned = JSON.parse(JSON.stringify(MOCK_USERS));
    set(USERS_KEY, cloned);
    setAllUsers(cloned);
    setCurrentUserState(null);
    setIsCorrupted(false);
  }, []);

  const isAuthenticated = currentUser !== null;

  const value = useMemo(
    () => ({
      currentUser,
      isAuthenticated,
      allUsers,
      login,
      logout,
      signup,
      getCurrentUser,
      setCurrentUser,
      updateUser,
      resetData,
      isCorrupted,
    }),
    [
      currentUser,
      isAuthenticated,
      allUsers,
      login,
      logout,
      signup,
      getCurrentUser,
      setCurrentUser,
      updateUser,
      resetData,
      isCorrupted,
    ],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Custom hook to access the authentication context.
 * Must be used within an AuthProvider.
 *
 * @returns {AuthContextValue} The authentication context value
 * @throws {Error} If used outside of an AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }
  return context;
}

export default AuthContext;