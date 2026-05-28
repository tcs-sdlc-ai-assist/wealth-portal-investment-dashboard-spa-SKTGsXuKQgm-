/**
 * Form validation utilities for signup and profile forms
 * @module validators
 */

import { EMAIL_REGEX, PHONE_REGEX, PASSWORD_MIN_LENGTH } from './constants.js';

/**
 * Validates that a value is not empty (after trimming).
 *
 * @param {string} value - The value to check
 * @returns {boolean} True if the value is non-empty
 */
export function isRequired(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Validates an email address against RFC-5322-ish pattern.
 *
 * @param {string} email - The email to validate
 * @returns {boolean} True if the email format is valid
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') {
    return false;
  }
  return EMAIL_REGEX.test(email.trim());
}

/**
 * Checks whether an email already exists in a list of users.
 *
 * @param {string} email - The email to check
 * @param {Array<{email: string}>} existingUsers - Array of user objects with email property
 * @returns {boolean} True if the email already exists
 */
export function emailExists(email, existingUsers) {
  if (!email || !Array.isArray(existingUsers)) {
    return false;
  }
  const normalised = email.trim().toLowerCase();
  return existingUsers.some(
    (user) => user.email && user.email.trim().toLowerCase() === normalised,
  );
}

/**
 * Validates password strength.
 * Requirements:
 * - Minimum 8 characters (configurable via PASSWORD_MIN_LENGTH)
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 *
 * @param {string} password - The password to validate
 * @returns {{ valid: boolean, errors: string[] }} Validation result with specific failure reasons
 */
export function validatePassword(password) {
  const errors = [];

  if (!password || typeof password !== 'string') {
    return { valid: false, errors: ['Password is required.'] };
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    errors.push(`Password must be at least ${PASSWORD_MIN_LENGTH} characters.`);
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter.');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter.');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number.');
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character.');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates that a password string meets all strength requirements.
 *
 * @param {string} password - The password to validate
 * @returns {boolean} True if the password meets all requirements
 */
export function isValidPassword(password) {
  return validatePassword(password).valid;
}

/**
 * Validates a phone number against common formats.
 *
 * @param {string} phone - The phone number to validate
 * @returns {boolean} True if the phone format is valid
 */
export function isValidPhone(phone) {
  if (!phone || typeof phone !== 'string') {
    return false;
  }
  return PHONE_REGEX.test(phone.trim());
}

/**
 * Validates that a date of birth indicates the user is at least a given age.
 *
 * @param {string} dob - The date of birth in ISO format (YYYY-MM-DD)
 * @param {number} [minAge=18] - The minimum required age
 * @returns {boolean} True if the user meets the minimum age requirement
 */
export function isValidDOB(dob, minAge = 18) {
  if (!dob || typeof dob !== 'string') {
    return false;
  }

  const birthDate = new Date(dob);
  if (isNaN(birthDate.getTime())) {
    return false;
  }

  const today = new Date();
  const cutoff = new Date(
    today.getFullYear() - minAge,
    today.getMonth(),
    today.getDate(),
  );

  return birthDate <= cutoff;
}

/**
 * Validates a name field (first name or last name).
 * Must be between 1 and 50 characters after trimming.
 *
 * @param {string} name - The name to validate
 * @param {number} [minLength=1] - Minimum length
 * @param {number} [maxLength=50] - Maximum length
 * @returns {boolean} True if the name length is valid
 */
export function isValidName(name, minLength = 1, maxLength = 50) {
  if (!name || typeof name !== 'string') {
    return false;
  }
  const trimmed = name.trim();
  return trimmed.length >= minLength && trimmed.length <= maxLength;
}

/**
 * Validates an account type against allowed values.
 *
 * @param {string} accountType - The account type to validate
 * @param {string[]} [allowedTypes=['Individual', 'Joint', 'IRA']] - Allowed account types
 * @returns {boolean} True if the account type is valid
 */
export function isValidAccountType(accountType, allowedTypes = ['Individual', 'Joint', 'IRA']) {
  if (!accountType || typeof accountType !== 'string') {
    return false;
  }
  return allowedTypes.includes(accountType);
}

/**
 * Validates all signup form fields and returns field-level errors.
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
 * @param {Array<{email: string}>} [existingUsers=[]] - Existing users for uniqueness check
 * @returns {{ valid: boolean, errors: Object.<string, string> }} Validation result with field-level errors
 */
export function validateSignup(fields, existingUsers = []) {
  const errors = {};

  // First name
  if (!isRequired(fields.firstName)) {
    errors.firstName = 'First name is required.';
  } else if (!isValidName(fields.firstName)) {
    errors.firstName = 'First name must be between 1 and 50 characters.';
  }

  // Last name
  if (!isRequired(fields.lastName)) {
    errors.lastName = 'Last name is required.';
  } else if (!isValidName(fields.lastName)) {
    errors.lastName = 'Last name must be between 1 and 50 characters.';
  }

  // Email
  if (!isRequired(fields.email)) {
    errors.email = 'Email is required.';
  } else if (!isValidEmail(fields.email)) {
    errors.email = 'Please enter a valid email address.';
  } else if (emailExists(fields.email, existingUsers)) {
    errors.email = 'Email already exists.';
  }

  // Phone
  if (!isRequired(fields.phone)) {
    errors.phone = 'Phone number is required.';
  } else if (!isValidPhone(fields.phone)) {
    errors.phone = 'Please enter a valid phone number.';
  }

  // Password
  if (!isRequired(fields.password)) {
    errors.password = 'Password is required.';
  } else {
    const passwordResult = validatePassword(fields.password);
    if (!passwordResult.valid) {
      errors.password = passwordResult.errors[0];
    }
  }

  // Confirm password (optional field — only validate if provided)
  if (fields.confirmPassword !== undefined) {
    if (!isRequired(fields.confirmPassword)) {
      errors.confirmPassword = 'Please confirm your password.';
    } else if (fields.password !== fields.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }
  }

  // Account type
  if (!isRequired(fields.accountType)) {
    errors.accountType = 'Account type is required.';
  } else if (!isValidAccountType(fields.accountType)) {
    errors.accountType = 'Please select a valid account type.';
  }

  // Date of birth
  if (!isRequired(fields.dob)) {
    errors.dob = 'Date of birth is required.';
  } else if (!isValidDOB(fields.dob)) {
    errors.dob = 'You must be at least 18 years old.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates profile update fields. Similar to signup but all fields are optional —
 * only provided (non-undefined) fields are validated.
 *
 * @param {Object} fields - The profile form fields (all optional)
 * @param {string} [fields.firstName] - User's first name
 * @param {string} [fields.lastName] - User's last name
 * @param {string} [fields.email] - User's email address
 * @param {string} [fields.phone] - User's phone number
 * @param {string} [fields.password] - New password (if changing)
 * @param {string} [fields.confirmPassword] - Password confirmation
 * @param {string} [fields.dob] - Date of birth (ISO format)
 * @param {Array<{email: string}>} [existingUsers=[]] - Existing users for uniqueness check
 * @param {string} [currentEmail=''] - The user's current email (excluded from uniqueness check)
 * @returns {{ valid: boolean, errors: Object.<string, string> }} Validation result with field-level errors
 */
export function validateProfile(fields, existingUsers = [], currentEmail = '') {
  const errors = {};

  // First name
  if (fields.firstName !== undefined) {
    if (!isRequired(fields.firstName)) {
      errors.firstName = 'First name is required.';
    } else if (!isValidName(fields.firstName)) {
      errors.firstName = 'First name must be between 1 and 50 characters.';
    }
  }

  // Last name
  if (fields.lastName !== undefined) {
    if (!isRequired(fields.lastName)) {
      errors.lastName = 'Last name is required.';
    } else if (!isValidName(fields.lastName)) {
      errors.lastName = 'Last name must be between 1 and 50 characters.';
    }
  }

  // Email
  if (fields.email !== undefined) {
    if (!isRequired(fields.email)) {
      errors.email = 'Email is required.';
    } else if (!isValidEmail(fields.email)) {
      errors.email = 'Please enter a valid email address.';
    } else {
      const normalised = fields.email.trim().toLowerCase();
      const currentNormalised = currentEmail.trim().toLowerCase();
      if (normalised !== currentNormalised && emailExists(fields.email, existingUsers)) {
        errors.email = 'Email already exists.';
      }
    }
  }

  // Phone
  if (fields.phone !== undefined) {
    if (!isRequired(fields.phone)) {
      errors.phone = 'Phone number is required.';
    } else if (!isValidPhone(fields.phone)) {
      errors.phone = 'Please enter a valid phone number.';
    }
  }

  // Password (only if user is changing it)
  if (fields.password !== undefined && fields.password !== '') {
    const passwordResult = validatePassword(fields.password);
    if (!passwordResult.valid) {
      errors.password = passwordResult.errors[0];
    }

    // Confirm password when changing password
    if (fields.confirmPassword !== undefined) {
      if (fields.password !== fields.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match.';
      }
    }
  }

  // Date of birth
  if (fields.dob !== undefined) {
    if (!isRequired(fields.dob)) {
      errors.dob = 'Date of birth is required.';
    } else if (!isValidDOB(fields.dob)) {
      errors.dob = 'You must be at least 18 years old.';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates a single field by name. Useful for real-time inline validation.
 *
 * @param {string} fieldName - The name of the field to validate
 * @param {*} value - The current value of the field
 * @param {Object} [context={}] - Additional context (e.g., existingUsers, password for confirmPassword check)
 * @returns {string|null} Error message or null if valid
 */
export function validateField(fieldName, value, context = {}) {
  switch (fieldName) {
    case 'firstName':
    case 'lastName': {
      const label = fieldName === 'firstName' ? 'First name' : 'Last name';
      if (!isRequired(value)) return `${label} is required.`;
      if (!isValidName(value)) return `${label} must be between 1 and 50 characters.`;
      return null;
    }

    case 'email': {
      if (!isRequired(value)) return 'Email is required.';
      if (!isValidEmail(value)) return 'Please enter a valid email address.';
      if (context.existingUsers && emailExists(value, context.existingUsers)) {
        return 'Email already exists.';
      }
      return null;
    }

    case 'phone': {
      if (!isRequired(value)) return 'Phone number is required.';
      if (!isValidPhone(value)) return 'Please enter a valid phone number.';
      return null;
    }

    case 'password': {
      if (!isRequired(value)) return 'Password is required.';
      const result = validatePassword(value);
      if (!result.valid) return result.errors[0];
      return null;
    }

    case 'confirmPassword': {
      if (!isRequired(value)) return 'Please confirm your password.';
      if (context.password && value !== context.password) return 'Passwords do not match.';
      return null;
    }

    case 'accountType': {
      if (!isRequired(value)) return 'Account type is required.';
      if (!isValidAccountType(value)) return 'Please select a valid account type.';
      return null;
    }

    case 'dob': {
      if (!isRequired(value)) return 'Date of birth is required.';
      if (!isValidDOB(value)) return 'You must be at least 18 years old.';
      return null;
    }

    default:
      return null;
  }
}