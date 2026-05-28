/**
 * Unit tests for form validation utilities
 * Verifies email format validation, password strength checks, phone format,
 * DOB age validation, name length, required field checks, and uniqueness validation.
 * Implements SCRUM-20312: Signup Page with Validation
 * @module validators.test
 */

import { describe, it, expect } from 'vitest';
import {
  isRequired,
  isValidEmail,
  emailExists,
  validatePassword,
  isValidPassword,
  isValidPhone,
  isValidDOB,
  isValidName,
  isValidAccountType,
  validateSignup,
  validateProfile,
  validateField,
} from './validators.js';

describe('validators', () => {
  describe('isRequired', () => {
    it('returns true for a non-empty string', () => {
      expect(isRequired('hello')).toBe(true);
    });

    it('returns true for a string with leading/trailing spaces', () => {
      expect(isRequired('  hello  ')).toBe(true);
    });

    it('returns false for an empty string', () => {
      expect(isRequired('')).toBe(false);
    });

    it('returns false for a string with only whitespace', () => {
      expect(isRequired('   ')).toBe(false);
    });

    it('returns false for null', () => {
      expect(isRequired(null)).toBe(false);
    });

    it('returns false for undefined', () => {
      expect(isRequired(undefined)).toBe(false);
    });

    it('returns false for a number', () => {
      expect(isRequired(123)).toBe(false);
    });

    it('returns false for a boolean', () => {
      expect(isRequired(true)).toBe(false);
    });
  });

  describe('isValidEmail', () => {
    it('returns true for a valid email address', () => {
      expect(isValidEmail('jane.doe@example.com')).toBe(true);
    });

    it('returns true for an email with plus addressing', () => {
      expect(isValidEmail('jane+test@example.com')).toBe(true);
    });

    it('returns true for an email with subdomain', () => {
      expect(isValidEmail('user@mail.example.co.uk')).toBe(true);
    });

    it('returns true for an email with numbers', () => {
      expect(isValidEmail('user123@example.com')).toBe(true);
    });

    it('returns true for an email with underscores and hyphens', () => {
      expect(isValidEmail('user_name-test@example.com')).toBe(true);
    });

    it('returns true for an email with leading/trailing spaces (trimmed)', () => {
      expect(isValidEmail('  jane@example.com  ')).toBe(true);
    });

    it('returns false for an email without @', () => {
      expect(isValidEmail('janeexample.com')).toBe(false);
    });

    it('returns false for an email without domain', () => {
      expect(isValidEmail('jane@')).toBe(false);
    });

    it('returns false for an email without TLD', () => {
      expect(isValidEmail('jane@example')).toBe(false);
    });

    it('returns false for an email with spaces in the middle', () => {
      expect(isValidEmail('jane doe@example.com')).toBe(false);
    });

    it('returns false for an empty string', () => {
      expect(isValidEmail('')).toBe(false);
    });

    it('returns false for null', () => {
      expect(isValidEmail(null)).toBe(false);
    });

    it('returns false for undefined', () => {
      expect(isValidEmail(undefined)).toBe(false);
    });

    it('returns false for a number', () => {
      expect(isValidEmail(12345)).toBe(false);
    });
  });

  describe('emailExists', () => {
    const existingUsers = [
      { email: 'jane.doe@example.com' },
      { email: 'marcus.chen@example.com' },
      { email: 'aisha.patel@example.com' },
    ];

    it('returns true when email exists in the users list (exact match)', () => {
      expect(emailExists('jane.doe@example.com', existingUsers)).toBe(true);
    });

    it('returns true when email exists with different casing', () => {
      expect(emailExists('Jane.Doe@Example.COM', existingUsers)).toBe(true);
    });

    it('returns true when email exists with leading/trailing spaces', () => {
      expect(emailExists('  jane.doe@example.com  ', existingUsers)).toBe(true);
    });

    it('returns false when email does not exist', () => {
      expect(emailExists('nonexistent@example.com', existingUsers)).toBe(false);
    });

    it('returns false for null email', () => {
      expect(emailExists(null, existingUsers)).toBe(false);
    });

    it('returns false for undefined email', () => {
      expect(emailExists(undefined, existingUsers)).toBe(false);
    });

    it('returns false for empty string email', () => {
      expect(emailExists('', existingUsers)).toBe(false);
    });

    it('returns false when existingUsers is null', () => {
      expect(emailExists('jane@example.com', null)).toBe(false);
    });

    it('returns false when existingUsers is not an array', () => {
      expect(emailExists('jane@example.com', 'not an array')).toBe(false);
    });

    it('returns false when existingUsers is an empty array', () => {
      expect(emailExists('jane@example.com', [])).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('returns valid for a strong password meeting all requirements', () => {
      const result = validatePassword('StrongPass1!');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('returns valid for a password with all character types', () => {
      const result = validatePassword('Abcdefg1@');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('returns invalid for a password shorter than 8 characters', () => {
      const result = validatePassword('Ab1!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters.');
    });

    it('returns invalid for a password without uppercase letter', () => {
      const result = validatePassword('lowercase1!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter.');
    });

    it('returns invalid for a password without lowercase letter', () => {
      const result = validatePassword('UPPERCASE1!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one lowercase letter.');
    });

    it('returns invalid for a password without a number', () => {
      const result = validatePassword('NoNumbers!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number.');
    });

    it('returns invalid for a password without a special character', () => {
      const result = validatePassword('NoSpecial1');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one special character.');
    });

    it('returns multiple errors for a very weak password', () => {
      const result = validatePassword('abc');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });

    it('returns invalid for null password', () => {
      const result = validatePassword(null);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password is required.');
    });

    it('returns invalid for undefined password', () => {
      const result = validatePassword(undefined);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password is required.');
    });

    it('returns invalid for empty string password', () => {
      const result = validatePassword('');
      expect(result.valid).toBe(false);
    });

    it('returns invalid for a non-string password', () => {
      const result = validatePassword(12345678);
      expect(result.valid).toBe(false);
    });
  });

  describe('isValidPassword', () => {
    it('returns true for a valid password', () => {
      expect(isValidPassword('Password1!')).toBe(true);
    });

    it('returns false for an invalid password', () => {
      expect(isValidPassword('weak')).toBe(false);
    });

    it('returns false for null', () => {
      expect(isValidPassword(null)).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('returns true for a US phone number with country code', () => {
      expect(isValidPhone('+1 (555) 123-4567')).toBe(true);
    });

    it('returns true for a phone number with dashes', () => {
      expect(isValidPhone('555-123-4567')).toBe(true);
    });

    it('returns true for a phone number with dots', () => {
      expect(isValidPhone('555.123.4567')).toBe(true);
    });

    it('returns true for a phone number with spaces', () => {
      expect(isValidPhone('555 123 4567')).toBe(true);
    });

    it('returns true for a plain numeric phone number', () => {
      expect(isValidPhone('5551234567')).toBe(true);
    });

    it('returns true for an international phone number', () => {
      expect(isValidPhone('+44 20 7946 0958')).toBe(true);
    });

    it('returns false for a phone number that is too short', () => {
      expect(isValidPhone('12345')).toBe(false);
    });

    it('returns false for a phone number with letters', () => {
      expect(isValidPhone('555-ABC-1234')).toBe(false);
    });

    it('returns false for an empty string', () => {
      expect(isValidPhone('')).toBe(false);
    });

    it('returns false for null', () => {
      expect(isValidPhone(null)).toBe(false);
    });

    it('returns false for undefined', () => {
      expect(isValidPhone(undefined)).toBe(false);
    });

    it('returns false for a non-string value', () => {
      expect(isValidPhone(5551234567)).toBe(false);
    });
  });

  describe('isValidDOB', () => {
    it('returns true for a DOB that makes the user over 18', () => {
      expect(isValidDOB('1990-05-15')).toBe(true);
    });

    it('returns true for a DOB that makes the user exactly 18 today or older', () => {
      const today = new Date();
      const eighteenYearsAgo = new Date(
        today.getFullYear() - 18,
        today.getMonth(),
        today.getDate(),
      );
      const dobString = eighteenYearsAgo.toISOString().split('T')[0];
      expect(isValidDOB(dobString)).toBe(true);
    });

    it('returns false for a DOB that makes the user under 18', () => {
      const today = new Date();
      const sixteenYearsAgo = new Date(
        today.getFullYear() - 16,
        today.getMonth(),
        today.getDate(),
      );
      const dobString = sixteenYearsAgo.toISOString().split('T')[0];
      expect(isValidDOB(dobString)).toBe(false);
    });

    it('returns false for a future date', () => {
      const future = new Date();
      future.setFullYear(future.getFullYear() + 1);
      const dobString = future.toISOString().split('T')[0];
      expect(isValidDOB(dobString)).toBe(false);
    });

    it('returns true for a very old DOB', () => {
      expect(isValidDOB('1920-01-01')).toBe(true);
    });

    it('returns false for an invalid date string', () => {
      expect(isValidDOB('not-a-date')).toBe(false);
    });

    it('returns false for an empty string', () => {
      expect(isValidDOB('')).toBe(false);
    });

    it('returns false for null', () => {
      expect(isValidDOB(null)).toBe(false);
    });

    it('returns false for undefined', () => {
      expect(isValidDOB(undefined)).toBe(false);
    });

    it('respects custom minimum age parameter', () => {
      const today = new Date();
      const twentyYearsAgo = new Date(
        today.getFullYear() - 20,
        today.getMonth(),
        today.getDate(),
      );
      const dobString = twentyYearsAgo.toISOString().split('T')[0];
      expect(isValidDOB(dobString, 21)).toBe(false);
      expect(isValidDOB(dobString, 20)).toBe(true);
    });
  });

  describe('isValidName', () => {
    it('returns true for a valid name', () => {
      expect(isValidName('Jane')).toBe(true);
    });

    it('returns true for a single character name', () => {
      expect(isValidName('J')).toBe(true);
    });

    it('returns true for a name with 50 characters', () => {
      expect(isValidName('A'.repeat(50))).toBe(true);
    });

    it('returns true for a name with spaces', () => {
      expect(isValidName('Mary Jane')).toBe(true);
    });

    it('returns true for a name with hyphens', () => {
      expect(isValidName('Mary-Jane')).toBe(true);
    });

    it('returns false for an empty string', () => {
      expect(isValidName('')).toBe(false);
    });

    it('returns false for a string with only whitespace', () => {
      expect(isValidName('   ')).toBe(false);
    });

    it('returns false for a name exceeding 50 characters', () => {
      expect(isValidName('A'.repeat(51))).toBe(false);
    });

    it('returns false for null', () => {
      expect(isValidName(null)).toBe(false);
    });

    it('returns false for undefined', () => {
      expect(isValidName(undefined)).toBe(false);
    });

    it('returns false for a non-string value', () => {
      expect(isValidName(123)).toBe(false);
    });

    it('respects custom min and max length parameters', () => {
      expect(isValidName('AB', 3)).toBe(false);
      expect(isValidName('ABC', 3)).toBe(true);
      expect(isValidName('ABCDE', 1, 4)).toBe(false);
      expect(isValidName('ABCD', 1, 4)).toBe(true);
    });
  });

  describe('isValidAccountType', () => {
    it('returns true for Individual', () => {
      expect(isValidAccountType('Individual')).toBe(true);
    });

    it('returns true for Joint', () => {
      expect(isValidAccountType('Joint')).toBe(true);
    });

    it('returns true for IRA', () => {
      expect(isValidAccountType('IRA')).toBe(true);
    });

    it('returns false for an invalid account type', () => {
      expect(isValidAccountType('Business')).toBe(false);
    });

    it('returns false for an empty string', () => {
      expect(isValidAccountType('')).toBe(false);
    });

    it('returns false for null', () => {
      expect(isValidAccountType(null)).toBe(false);
    });

    it('returns false for undefined', () => {
      expect(isValidAccountType(undefined)).toBe(false);
    });

    it('is case-sensitive', () => {
      expect(isValidAccountType('individual')).toBe(false);
      expect(isValidAccountType('JOINT')).toBe(false);
    });

    it('respects custom allowed types', () => {
      expect(isValidAccountType('Business', ['Business', 'Personal'])).toBe(true);
      expect(isValidAccountType('Individual', ['Business', 'Personal'])).toBe(false);
    });
  });

  describe('validateSignup', () => {
    const existingUsers = [
      { email: 'jane.doe@example.com' },
      { email: 'marcus.chen@example.com' },
    ];

    const validFields = {
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@example.com',
      phone: '+1 (555) 987-6543',
      password: 'SecurePass1!',
      confirmPassword: 'SecurePass1!',
      accountType: 'Individual',
      dob: '1990-01-15',
    };

    it('returns valid for a complete and correct signup form', () => {
      const result = validateSignup(validFields, existingUsers);
      expect(result.valid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    it('returns error for missing first name', () => {
      const result = validateSignup({ ...validFields, firstName: '' }, existingUsers);
      expect(result.valid).toBe(false);
      expect(result.errors.firstName).toBeDefined();
    });

    it('returns error for missing last name', () => {
      const result = validateSignup({ ...validFields, lastName: '' }, existingUsers);
      expect(result.valid).toBe(false);
      expect(result.errors.lastName).toBeDefined();
    });

    it('returns error for missing email', () => {
      const result = validateSignup({ ...validFields, email: '' }, existingUsers);
      expect(result.valid).toBe(false);
      expect(result.errors.email).toBeDefined();
    });

    it('returns error for invalid email format', () => {
      const result = validateSignup({ ...validFields, email: 'invalid-email' }, existingUsers);
      expect(result.valid).toBe(false);
      expect(result.errors.email).toBe('Please enter a valid email address.');
    });

    it('returns error for duplicate email', () => {
      const result = validateSignup({ ...validFields, email: 'jane.doe@example.com' }, existingUsers);
      expect(result.valid).toBe(false);
      expect(result.errors.email).toBe('Email already exists.');
    });

    it('returns error for missing phone', () => {
      const result = validateSignup({ ...validFields, phone: '' }, existingUsers);
      expect(result.valid).toBe(false);
      expect(result.errors.phone).toBeDefined();
    });

    it('returns error for invalid phone format', () => {
      const result = validateSignup({ ...validFields, phone: 'abc' }, existingUsers);
      expect(result.valid).toBe(false);
      expect(result.errors.phone).toBe('Please enter a valid phone number.');
    });

    it('returns error for missing password', () => {
      const result = validateSignup({ ...validFields, password: '' }, existingUsers);
      expect(result.valid).toBe(false);
      expect(result.errors.password).toBeDefined();
    });

    it('returns error for weak password', () => {
      const result = validateSignup({ ...validFields, password: 'weak', confirmPassword: 'weak' }, existingUsers);
      expect(result.valid).toBe(false);
      expect(result.errors.password).toBeDefined();
    });

    it('returns error for mismatched confirm password', () => {
      const result = validateSignup({ ...validFields, confirmPassword: 'DifferentPass1!' }, existingUsers);
      expect(result.valid).toBe(false);
      expect(result.errors.confirmPassword).toBe('Passwords do not match.');
    });

    it('returns error for missing confirm password', () => {
      const result = validateSignup({ ...validFields, confirmPassword: '' }, existingUsers);
      expect(result.valid).toBe(false);
      expect(result.errors.confirmPassword).toBeDefined();
    });

    it('does not validate confirmPassword if not provided (undefined)', () => {
      const fieldsWithoutConfirm = { ...validFields };
      delete fieldsWithoutConfirm.confirmPassword;
      const result = validateSignup(fieldsWithoutConfirm, existingUsers);
      expect(result.valid).toBe(true);
      expect(result.errors.confirmPassword).toBeUndefined();
    });

    it('returns error for missing account type', () => {
      const result = validateSignup({ ...validFields, accountType: '' }, existingUsers);
      expect(result.valid).toBe(false);
      expect(result.errors.accountType).toBeDefined();
    });

    it('returns error for invalid account type', () => {
      const result = validateSignup({ ...validFields, accountType: 'Business' }, existingUsers);
      expect(result.valid).toBe(false);
      expect(result.errors.accountType).toBe('Please select a valid account type.');
    });

    it('returns error for missing DOB', () => {
      const result = validateSignup({ ...validFields, dob: '' }, existingUsers);
      expect(result.valid).toBe(false);
      expect(result.errors.dob).toBeDefined();
    });

    it('returns error for underage DOB', () => {
      const today = new Date();
      const tenYearsAgo = new Date(today.getFullYear() - 10, today.getMonth(), today.getDate());
      const dobString = tenYearsAgo.toISOString().split('T')[0];
      const result = validateSignup({ ...validFields, dob: dobString }, existingUsers);
      expect(result.valid).toBe(false);
      expect(result.errors.dob).toBe('You must be at least 18 years old.');
    });

    it('returns multiple errors for multiple invalid fields', () => {
      const result = validateSignup(
        {
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: '',
          accountType: '',
          dob: '',
        },
        existingUsers,
      );
      expect(result.valid).toBe(false);
      expect(Object.keys(result.errors).length).toBeGreaterThanOrEqual(7);
    });

    it('works with empty existingUsers array', () => {
      const result = validateSignup(validFields, []);
      expect(result.valid).toBe(true);
    });

    it('works with no existingUsers argument', () => {
      const result = validateSignup(validFields);
      expect(result.valid).toBe(true);
    });

    it('returns error for first name exceeding 50 characters', () => {
      const result = validateSignup({ ...validFields, firstName: 'A'.repeat(51) }, existingUsers);
      expect(result.valid).toBe(false);
      expect(result.errors.firstName).toBeDefined();
    });

    it('returns error for last name exceeding 50 characters', () => {
      const result = validateSignup({ ...validFields, lastName: 'B'.repeat(51) }, existingUsers);
      expect(result.valid).toBe(false);
      expect(result.errors.lastName).toBeDefined();
    });
  });

  describe('validateProfile', () => {
    const existingUsers = [
      { email: 'jane.doe@example.com' },
      { email: 'marcus.chen@example.com' },
    ];

    const currentEmail = 'jane.doe@example.com';

    it('returns valid when no fields are provided', () => {
      const result = validateProfile({}, existingUsers, currentEmail);
      expect(result.valid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    it('validates firstName when provided', () => {
      const result = validateProfile({ firstName: '' }, existingUsers, currentEmail);
      expect(result.valid).toBe(false);
      expect(result.errors.firstName).toBeDefined();
    });

    it('returns valid for a valid firstName update', () => {
      const result = validateProfile({ firstName: 'Janet' }, existingUsers, currentEmail);
      expect(result.valid).toBe(true);
    });

    it('validates lastName when provided', () => {
      const result = validateProfile({ lastName: '' }, existingUsers, currentEmail);
      expect(result.valid).toBe(false);
      expect(result.errors.lastName).toBeDefined();
    });

    it('validates email when provided', () => {
      const result = validateProfile({ email: 'invalid' }, existingUsers, currentEmail);
      expect(result.valid).toBe(false);
      expect(result.errors.email).toBeDefined();
    });

    it('allows keeping the same email (current email)', () => {
      const result = validateProfile({ email: 'jane.doe@example.com' }, existingUsers, currentEmail);
      expect(result.valid).toBe(true);
    });

    it('returns error when changing to an existing email', () => {
      const result = validateProfile({ email: 'marcus.chen@example.com' }, existingUsers, currentEmail);
      expect(result.valid).toBe(false);
      expect(result.errors.email).toBe('Email already exists.');
    });

    it('validates phone when provided', () => {
      const result = validateProfile({ phone: 'abc' }, existingUsers, currentEmail);
      expect(result.valid).toBe(false);
      expect(result.errors.phone).toBeDefined();
    });

    it('validates password when provided and non-empty', () => {
      const result = validateProfile({ password: 'weak' }, existingUsers, currentEmail);
      expect(result.valid).toBe(false);
      expect(result.errors.password).toBeDefined();
    });

    it('skips password validation when password is empty string', () => {
      const result = validateProfile({ password: '' }, existingUsers, currentEmail);
      expect(result.valid).toBe(true);
      expect(result.errors.password).toBeUndefined();
    });

    it('validates confirmPassword mismatch when changing password', () => {
      const result = validateProfile(
        { password: 'NewPass1!', confirmPassword: 'DifferentPass1!' },
        existingUsers,
        currentEmail,
      );
      expect(result.valid).toBe(false);
      expect(result.errors.confirmPassword).toBe('Passwords do not match.');
    });

    it('returns valid for matching password and confirmPassword', () => {
      const result = validateProfile(
        { password: 'NewPass1!', confirmPassword: 'NewPass1!' },
        existingUsers,
        currentEmail,
      );
      expect(result.valid).toBe(true);
    });

    it('validates DOB when provided', () => {
      const today = new Date();
      const fiveYearsAgo = new Date(today.getFullYear() - 5, today.getMonth(), today.getDate());
      const dobString = fiveYearsAgo.toISOString().split('T')[0];
      const result = validateProfile({ dob: dobString }, existingUsers, currentEmail);
      expect(result.valid).toBe(false);
      expect(result.errors.dob).toBeDefined();
    });

    it('returns valid for a valid DOB update', () => {
      const result = validateProfile({ dob: '1985-06-15' }, existingUsers, currentEmail);
      expect(result.valid).toBe(true);
    });

    it('does not validate fields that are not provided (undefined)', () => {
      const result = validateProfile(
        { firstName: 'Valid' },
        existingUsers,
        currentEmail,
      );
      expect(result.valid).toBe(true);
      expect(result.errors.lastName).toBeUndefined();
      expect(result.errors.email).toBeUndefined();
      expect(result.errors.phone).toBeUndefined();
    });
  });

  describe('validateField', () => {
    const existingUsers = [
      { email: 'jane.doe@example.com' },
    ];

    describe('firstName', () => {
      it('returns null for a valid first name', () => {
        expect(validateField('firstName', 'Jane')).toBeNull();
      });

      it('returns error for empty first name', () => {
        expect(validateField('firstName', '')).toBe('First name is required.');
      });

      it('returns error for first name exceeding 50 characters', () => {
        expect(validateField('firstName', 'A'.repeat(51))).toBe(
          'First name must be between 1 and 50 characters.',
        );
      });
    });

    describe('lastName', () => {
      it('returns null for a valid last name', () => {
        expect(validateField('lastName', 'Doe')).toBeNull();
      });

      it('returns error for empty last name', () => {
        expect(validateField('lastName', '')).toBe('Last name is required.');
      });

      it('returns error for last name exceeding 50 characters', () => {
        expect(validateField('lastName', 'B'.repeat(51))).toBe(
          'Last name must be between 1 and 50 characters.',
        );
      });
    });

    describe('email', () => {
      it('returns null for a valid email', () => {
        expect(validateField('email', 'new@example.com')).toBeNull();
      });

      it('returns error for empty email', () => {
        expect(validateField('email', '')).toBe('Email is required.');
      });

      it('returns error for invalid email format', () => {
        expect(validateField('email', 'not-an-email')).toBe(
          'Please enter a valid email address.',
        );
      });

      it('returns error for duplicate email when context has existingUsers', () => {
        expect(
          validateField('email', 'jane.doe@example.com', { existingUsers }),
        ).toBe('Email already exists.');
      });

      it('returns null for a unique email when context has existingUsers', () => {
        expect(
          validateField('email', 'unique@example.com', { existingUsers }),
        ).toBeNull();
      });
    });

    describe('phone', () => {
      it('returns null for a valid phone number', () => {
        expect(validateField('phone', '+1 (555) 123-4567')).toBeNull();
      });

      it('returns error for empty phone', () => {
        expect(validateField('phone', '')).toBe('Phone number is required.');
      });

      it('returns error for invalid phone format', () => {
        expect(validateField('phone', 'abc')).toBe(
          'Please enter a valid phone number.',
        );
      });
    });

    describe('password', () => {
      it('returns null for a valid password', () => {
        expect(validateField('password', 'StrongPass1!')).toBeNull();
      });

      it('returns error for empty password', () => {
        expect(validateField('password', '')).toBe('Password is required.');
      });

      it('returns error for weak password', () => {
        const error = validateField('password', 'weak');
        expect(error).toBeDefined();
        expect(typeof error).toBe('string');
      });
    });

    describe('confirmPassword', () => {
      it('returns null when passwords match', () => {
        expect(
          validateField('confirmPassword', 'StrongPass1!', { password: 'StrongPass1!' }),
        ).toBeNull();
      });

      it('returns error for empty confirm password', () => {
        expect(validateField('confirmPassword', '')).toBe(
          'Please confirm your password.',
        );
      });

      it('returns error when passwords do not match', () => {
        expect(
          validateField('confirmPassword', 'Different1!', { password: 'StrongPass1!' }),
        ).toBe('Passwords do not match.');
      });
    });

    describe('accountType', () => {
      it('returns null for a valid account type', () => {
        expect(validateField('accountType', 'Individual')).toBeNull();
      });

      it('returns error for empty account type', () => {
        expect(validateField('accountType', '')).toBe('Account type is required.');
      });

      it('returns error for invalid account type', () => {
        expect(validateField('accountType', 'Business')).toBe(
          'Please select a valid account type.',
        );
      });
    });

    describe('dob', () => {
      it('returns null for a valid DOB', () => {
        expect(validateField('dob', '1990-05-15')).toBeNull();
      });

      it('returns error for empty DOB', () => {
        expect(validateField('dob', '')).toBe('Date of birth is required.');
      });

      it('returns error for underage DOB', () => {
        const today = new Date();
        const tenYearsAgo = new Date(today.getFullYear() - 10, today.getMonth(), today.getDate());
        const dobString = tenYearsAgo.toISOString().split('T')[0];
        expect(validateField('dob', dobString)).toBe(
          'You must be at least 18 years old.',
        );
      });
    });

    describe('unknown field', () => {
      it('returns null for an unknown field name', () => {
        expect(validateField('unknownField', 'any value')).toBeNull();
      });
    });
  });
});