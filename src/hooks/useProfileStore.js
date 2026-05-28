/**
 * Profile data access hook with field-level granularity
 * Implements SCRUM-20326: Profile & Settings Pages
 * @module useProfileStore
 */

import { useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { validateProfile } from '../utils/validators.js';
import { sumBeneficiaryShares, generateId } from '../utils/helpers.js';

/**
 * @typedef {Object} CommunicationPreferences
 * @property {boolean} emailNotifications
 * @property {boolean} smsAlerts
 * @property {boolean} monthlyStatements
 * @property {boolean} marketingEmails
 * @property {boolean} pushNotifications
 */

/**
 * @typedef {Object} SecuritySettings
 * @property {boolean} twoFactorEnabled
 * @property {string|null} twoFactorMethod
 * @property {boolean} loginAlerts
 * @property {number} sessionTimeout
 * @property {number} trustedDevices
 */

/**
 * @typedef {Object} BankAccount
 * @property {string} id
 * @property {string} bankName
 * @property {string} accountNumber
 * @property {string} routingNumber
 * @property {string} type
 * @property {boolean} isPrimary
 */

/**
 * @typedef {Object} Beneficiary
 * @property {string} id
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} relationship
 * @property {number} share
 * @property {string} dob
 */

/**
 * @typedef {Object} Profile
 * @property {string} id
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} email
 * @property {string} phone
 * @property {string} dob
 * @property {string} accountType
 * @property {string} [avatar]
 * @property {CommunicationPreferences} communicationPreferences
 * @property {SecuritySettings} securitySettings
 * @property {Array<BankAccount>} bankAccounts
 * @property {Array<Beneficiary>} beneficiaries
 * @property {string} costBasisMethod
 */

/**
 * @typedef {Object} ProfileStoreValue
 * @property {function(): Profile|null} getProfile - Returns the profile for the current user
 * @property {function(Object): {success: boolean, errors?: Object}} updateProfile - Updates profile fields for the current user
 * @property {Profile|null} profile - The current user's profile data
 * @property {function(CommunicationPreferences): void} updateCommunicationPreferences - Updates communication preferences
 * @property {function(Object): void} updateSecuritySettings - Updates security settings
 * @property {function(BankAccount): void} addBankAccount - Adds a new bank account
 * @property {function(string): void} removeBankAccount - Removes a bank account by id
 * @property {function(string, Object): void} updateBankAccount - Updates a bank account by id
 * @property {function(string): void} setPrimaryBankAccount - Sets a bank account as primary
 * @property {function(Beneficiary): {success: boolean, error?: string}} addBeneficiary - Adds a new beneficiary
 * @property {function(string): void} removeBeneficiary - Removes a beneficiary by id
 * @property {function(string, Object): {success: boolean, error?: string}} updateBeneficiary - Updates a beneficiary by id
 * @property {function(string): void} setCostBasisMethod - Sets the cost basis method
 * @property {Array<BankAccount>} bankAccounts - The current user's bank accounts
 * @property {Array<Beneficiary>} beneficiaries - The current user's beneficiaries
 * @property {number} totalBeneficiaryShares - Sum of all beneficiary share percentages
 */

/**
 * Default communication preferences for new or missing data.
 *
 * @type {CommunicationPreferences}
 */
const DEFAULT_COMMUNICATION_PREFERENCES = {
  emailNotifications: true,
  smsAlerts: false,
  monthlyStatements: true,
  marketingEmails: false,
  pushNotifications: false,
};

/**
 * Default security settings for new or missing data.
 *
 * @type {SecuritySettings}
 */
const DEFAULT_SECURITY_SETTINGS = {
  twoFactorEnabled: false,
  twoFactorMethod: null,
  loginAlerts: false,
  sessionTimeout: 30,
  trustedDevices: 0,
};

/**
 * Extracts profile-relevant fields from a user object.
 *
 * @param {Object} user - The user object
 * @returns {Profile|null} The extracted profile, or null if user is falsy
 */
function extractProfile(user) {
  if (!user || typeof user !== 'object') {
    return null;
  }

  return {
    id: user.id,
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
    phone: user.phone || '',
    dob: user.dob || '',
    accountType: user.accountType || '',
    avatar: user.avatar || null,
    communicationPreferences: user.communicationPreferences || { ...DEFAULT_COMMUNICATION_PREFERENCES },
    securitySettings: user.securitySettings || { ...DEFAULT_SECURITY_SETTINGS },
    bankAccounts: Array.isArray(user.bankAccounts) ? user.bankAccounts : [],
    beneficiaries: Array.isArray(user.beneficiaries) ? user.beneficiaries : [],
    costBasisMethod: user.costBasisMethod || 'FIFO',
  };
}

/**
 * Custom hook that provides profile data access and mutation
 * for the current user with field-level granularity.
 *
 * @returns {ProfileStoreValue} Profile store methods and state
 * @throws {Error} If used outside of an AuthProvider
 */
export function useProfileStore() {
  const { currentUser, updateUser, allUsers } = useAuth();

  /**
   * Returns the profile for the current user.
   *
   * @returns {Profile|null} The current user's profile data
   */
  const getProfile = useCallback(() => {
    if (!currentUser) {
      return null;
    }

    return extractProfile(currentUser);
  }, [currentUser]);

  /**
   * Updates profile fields for the current user with validation.
   *
   * @param {Object} updates - Partial profile fields to update
   * @param {string} [updates.firstName] - Updated first name
   * @param {string} [updates.lastName] - Updated last name
   * @param {string} [updates.email] - Updated email
   * @param {string} [updates.phone] - Updated phone
   * @param {string} [updates.password] - Updated password
   * @param {string} [updates.confirmPassword] - Password confirmation
   * @param {string} [updates.dob] - Updated date of birth
   * @returns {{ success: boolean, errors?: Object.<string, string> }} Update result
   */
  const updateProfile = useCallback(
    (updates) => {
      if (!currentUser || !updates || typeof updates !== 'object') {
        return { success: false, errors: { general: 'No user or updates provided.' } };
      }

      const currentEmail = currentUser.email || '';
      const validation = validateProfile(updates, allUsers, currentEmail);

      if (!validation.valid) {
        return { success: false, errors: validation.errors };
      }

      const patch = {};

      if (updates.firstName !== undefined) {
        patch.firstName = updates.firstName.trim();
      }

      if (updates.lastName !== undefined) {
        patch.lastName = updates.lastName.trim();
      }

      if (updates.email !== undefined) {
        patch.email = updates.email.trim().toLowerCase();
      }

      if (updates.phone !== undefined) {
        patch.phone = updates.phone.trim();
      }

      if (updates.password !== undefined && updates.password !== '') {
        patch.password = updates.password;
      }

      if (updates.dob !== undefined) {
        patch.dob = updates.dob;
      }

      if (Object.keys(patch).length > 0) {
        updateUser(patch);
      }

      return { success: true };
    },
    [currentUser, updateUser, allUsers],
  );

  /**
   * Updates communication preferences for the current user.
   *
   * @param {CommunicationPreferences} preferences - The updated communication preferences
   */
  const updateCommunicationPreferences = useCallback(
    (preferences) => {
      if (!currentUser || !preferences || typeof preferences !== 'object') {
        return;
      }

      const current = currentUser.communicationPreferences || { ...DEFAULT_COMMUNICATION_PREFERENCES };
      const updated = { ...current, ...preferences };

      updateUser({ communicationPreferences: updated });
    },
    [currentUser, updateUser],
  );

  /**
   * Updates security settings for the current user.
   *
   * @param {Object} settings - Partial security settings to update
   */
  const updateSecuritySettings = useCallback(
    (settings) => {
      if (!currentUser || !settings || typeof settings !== 'object') {
        return;
      }

      const current = currentUser.securitySettings || { ...DEFAULT_SECURITY_SETTINGS };
      const updated = { ...current, ...settings };

      // If two-factor is disabled, clear the method
      if (updated.twoFactorEnabled === false) {
        updated.twoFactorMethod = null;
      }

      updateUser({ securitySettings: updated });
    },
    [currentUser, updateUser],
  );

  /**
   * Adds a new bank account for the current user.
   *
   * @param {Object} bankAccount - The bank account to add
   * @param {string} bankAccount.bankName - Bank name
   * @param {string} bankAccount.accountNumber - Account number (masked)
   * @param {string} bankAccount.routingNumber - Routing number (masked)
   * @param {string} bankAccount.type - Account type (checking, savings)
   * @param {boolean} [bankAccount.isPrimary] - Whether this is the primary account
   */
  const addBankAccount = useCallback(
    (bankAccount) => {
      if (!currentUser || !bankAccount || typeof bankAccount !== 'object') {
        return;
      }

      const currentBanks = Array.isArray(currentUser.bankAccounts) ? currentUser.bankAccounts : [];

      const newAccount = {
        id: generateId(),
        bankName: bankAccount.bankName || '',
        accountNumber: bankAccount.accountNumber || '',
        routingNumber: bankAccount.routingNumber || '',
        type: bankAccount.type || 'checking',
        isPrimary: currentBanks.length === 0 ? true : bankAccount.isPrimary === true,
      };

      // If the new account is primary, unset primary on all others
      let updatedBanks;
      if (newAccount.isPrimary) {
        updatedBanks = currentBanks.map((b) => ({ ...b, isPrimary: false }));
      } else {
        updatedBanks = [...currentBanks];
      }

      updatedBanks.push(newAccount);
      updateUser({ bankAccounts: updatedBanks });
    },
    [currentUser, updateUser],
  );

  /**
   * Removes a bank account by id.
   *
   * @param {string} bankAccountId - The id of the bank account to remove
   */
  const removeBankAccount = useCallback(
    (bankAccountId) => {
      if (!currentUser || !bankAccountId) {
        return;
      }

      const currentBanks = Array.isArray(currentUser.bankAccounts) ? currentUser.bankAccounts : [];
      const filtered = currentBanks.filter((b) => b.id !== bankAccountId);

      // If the removed account was primary and there are remaining accounts, set the first as primary
      const removedAccount = currentBanks.find((b) => b.id === bankAccountId);
      if (removedAccount && removedAccount.isPrimary && filtered.length > 0) {
        filtered[0] = { ...filtered[0], isPrimary: true };
      }

      updateUser({ bankAccounts: filtered });
    },
    [currentUser, updateUser],
  );

  /**
   * Updates a bank account by id.
   *
   * @param {string} bankAccountId - The id of the bank account to update
   * @param {Object} updates - Partial bank account fields to update
   */
  const updateBankAccount = useCallback(
    (bankAccountId, updates) => {
      if (!currentUser || !bankAccountId || !updates || typeof updates !== 'object') {
        return;
      }

      const currentBanks = Array.isArray(currentUser.bankAccounts) ? currentUser.bankAccounts : [];
      const index = currentBanks.findIndex((b) => b.id === bankAccountId);

      if (index === -1) {
        return;
      }

      const updatedBanks = [...currentBanks];
      updatedBanks[index] = { ...updatedBanks[index], ...updates };

      updateUser({ bankAccounts: updatedBanks });
    },
    [currentUser, updateUser],
  );

  /**
   * Sets a bank account as the primary account.
   *
   * @param {string} bankAccountId - The id of the bank account to set as primary
   */
  const setPrimaryBankAccount = useCallback(
    (bankAccountId) => {
      if (!currentUser || !bankAccountId) {
        return;
      }

      const currentBanks = Array.isArray(currentUser.bankAccounts) ? currentUser.bankAccounts : [];
      const updatedBanks = currentBanks.map((b) => ({
        ...b,
        isPrimary: b.id === bankAccountId,
      }));

      updateUser({ bankAccounts: updatedBanks });
    },
    [currentUser, updateUser],
  );

  /**
   * Adds a new beneficiary for the current user.
   * Validates that total shares do not exceed 100%.
   *
   * @param {Object} beneficiary - The beneficiary to add
   * @param {string} beneficiary.firstName - First name
   * @param {string} beneficiary.lastName - Last name
   * @param {string} beneficiary.relationship - Relationship to user
   * @param {number} beneficiary.share - Share percentage
   * @param {string} beneficiary.dob - Date of birth (ISO format)
   * @returns {{ success: boolean, error?: string }} Result
   */
  const addBeneficiary = useCallback(
    (beneficiary) => {
      if (!currentUser || !beneficiary || typeof beneficiary !== 'object') {
        return { success: false, error: 'Invalid beneficiary data.' };
      }

      const currentBeneficiaries = Array.isArray(currentUser.beneficiaries) ? currentUser.beneficiaries : [];
      const currentTotal = sumBeneficiaryShares(currentBeneficiaries);
      const newShare = Number.isFinite(beneficiary.share) ? beneficiary.share : 0;

      if (currentTotal + newShare > 100) {
        return {
          success: false,
          error: `Total shares would exceed 100%. Current total: ${currentTotal}%, available: ${100 - currentTotal}%.`,
        };
      }

      const newBeneficiary = {
        id: generateId(),
        firstName: (beneficiary.firstName || '').trim(),
        lastName: (beneficiary.lastName || '').trim(),
        relationship: beneficiary.relationship || '',
        share: newShare,
        dob: beneficiary.dob || '',
      };

      const updatedBeneficiaries = [...currentBeneficiaries, newBeneficiary];
      updateUser({ beneficiaries: updatedBeneficiaries });

      return { success: true };
    },
    [currentUser, updateUser],
  );

  /**
   * Removes a beneficiary by id.
   *
   * @param {string} beneficiaryId - The id of the beneficiary to remove
   */
  const removeBeneficiary = useCallback(
    (beneficiaryId) => {
      if (!currentUser || !beneficiaryId) {
        return;
      }

      const currentBeneficiaries = Array.isArray(currentUser.beneficiaries) ? currentUser.beneficiaries : [];
      const filtered = currentBeneficiaries.filter((b) => b.id !== beneficiaryId);

      updateUser({ beneficiaries: filtered });
    },
    [currentUser, updateUser],
  );

  /**
   * Updates a beneficiary by id.
   * Validates that total shares do not exceed 100%.
   *
   * @param {string} beneficiaryId - The id of the beneficiary to update
   * @param {Object} updates - Partial beneficiary fields to update
   * @returns {{ success: boolean, error?: string }} Result
   */
  const updateBeneficiary = useCallback(
    (beneficiaryId, updates) => {
      if (!currentUser || !beneficiaryId || !updates || typeof updates !== 'object') {
        return { success: false, error: 'Invalid update data.' };
      }

      const currentBeneficiaries = Array.isArray(currentUser.beneficiaries) ? currentUser.beneficiaries : [];
      const index = currentBeneficiaries.findIndex((b) => b.id === beneficiaryId);

      if (index === -1) {
        return { success: false, error: 'Beneficiary not found.' };
      }

      // If share is being updated, validate total
      if (updates.share !== undefined) {
        const newShare = Number.isFinite(updates.share) ? updates.share : 0;
        const currentShare = Number.isFinite(currentBeneficiaries[index].share) ? currentBeneficiaries[index].share : 0;
        const otherShares = sumBeneficiaryShares(currentBeneficiaries) - currentShare;

        if (otherShares + newShare > 100) {
          return {
            success: false,
            error: `Total shares would exceed 100%. Other beneficiaries total: ${otherShares}%, available: ${100 - otherShares}%.`,
          };
        }
      }

      const updatedBeneficiaries = [...currentBeneficiaries];
      updatedBeneficiaries[index] = { ...updatedBeneficiaries[index], ...updates };

      if (updates.firstName !== undefined) {
        updatedBeneficiaries[index].firstName = (updates.firstName || '').trim();
      }

      if (updates.lastName !== undefined) {
        updatedBeneficiaries[index].lastName = (updates.lastName || '').trim();
      }

      updateUser({ beneficiaries: updatedBeneficiaries });

      return { success: true };
    },
    [currentUser, updateUser],
  );

  /**
   * Sets the cost basis method for the current user.
   *
   * @param {string} method - The cost basis method (e.g., 'FIFO', 'LIFO', 'SpecID', 'Average')
   */
  const setCostBasisMethod = useCallback(
    (method) => {
      if (!currentUser || !method || typeof method !== 'string') {
        return;
      }

      updateUser({ costBasisMethod: method });
    },
    [currentUser, updateUser],
  );

  /** The current user's profile data */
  const profile = useMemo(() => getProfile(), [getProfile]);

  /** The current user's bank accounts */
  const bankAccounts = useMemo(() => {
    if (!currentUser) {
      return [];
    }
    return Array.isArray(currentUser.bankAccounts) ? currentUser.bankAccounts : [];
  }, [currentUser]);

  /** The current user's beneficiaries */
  const beneficiaries = useMemo(() => {
    if (!currentUser) {
      return [];
    }
    return Array.isArray(currentUser.beneficiaries) ? currentUser.beneficiaries : [];
  }, [currentUser]);

  /** Sum of all beneficiary share percentages */
  const totalBeneficiaryShares = useMemo(
    () => sumBeneficiaryShares(beneficiaries),
    [beneficiaries],
  );

  return useMemo(
    () => ({
      getProfile,
      updateProfile,
      profile,
      updateCommunicationPreferences,
      updateSecuritySettings,
      addBankAccount,
      removeBankAccount,
      updateBankAccount,
      setPrimaryBankAccount,
      addBeneficiary,
      removeBeneficiary,
      updateBeneficiary,
      setCostBasisMethod,
      bankAccounts,
      beneficiaries,
      totalBeneficiaryShares,
    }),
    [
      getProfile,
      updateProfile,
      profile,
      updateCommunicationPreferences,
      updateSecuritySettings,
      addBankAccount,
      removeBankAccount,
      updateBankAccount,
      setPrimaryBankAccount,
      addBeneficiary,
      removeBeneficiary,
      updateBeneficiary,
      setCostBasisMethod,
      bankAccounts,
      beneficiaries,
      totalBeneficiaryShares,
    ],
  );
}

export default useProfileStore;