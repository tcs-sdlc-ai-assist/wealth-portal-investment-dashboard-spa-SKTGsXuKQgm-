/**
 * User registration page with form validation
 * Collects firstName, lastName, email, phone, password, confirmPassword,
 * accountType, and DOB. Validates via validators.js with inline error messages
 * and shake animation via Framer Motion. On valid submit, calls useAuth().signup,
 * shows success toast, and redirects to /login.
 * Implements SCRUM-20312: Signup Page with Validation
 * @module SignupPage
 */

import { useState, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, LogIn, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { ThemeToggle } from '../components/shared/ThemeToggle.jsx';
import { PasswordStrengthMeter } from '../components/shared/PasswordStrengthMeter.jsx';
import { validateField } from '../utils/validators.js';
import { classNames } from '../utils/helpers.js';
import { ROUTES } from '../utils/constants.js';

/**
 * Header animation variants.
 * @type {Object}
 */
const headerVariants = {
  hidden: { opacity: 0, y: -16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25,
    },
  },
};

/**
 * Form container animation variants.
 * @type {Object}
 */
const formVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25,
      delay: 0.1,
    },
  },
};

/**
 * Shake animation variants for error state.
 * @type {Object}
 */
const shakeVariants = {
  shake: {
    x: [0, -8, 8, -6, 6, -3, 3, 0],
    transition: { duration: 0.5 },
  },
  idle: { x: 0 },
};

/**
 * Account type options for the dropdown.
 * @type {Array<{ value: string, label: string }>}
 */
const ACCOUNT_TYPE_OPTIONS = [
  { value: '', label: 'Select account type' },
  { value: 'Individual', label: 'Individual' },
  { value: 'Joint', label: 'Joint' },
  { value: 'IRA', label: 'IRA' },
];

/**
 * Initial form state.
 * @type {Object}
 */
const INITIAL_FORM_STATE = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  accountType: '',
  dob: '',
};

/**
 * Signup page component.
 * Renders a registration form with validation, password strength meter,
 * and animated error feedback. On successful signup, redirects to login.
 *
 * @returns {JSX.Element}
 */
export function SignupPage() {
  const { signup, allUsers } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ ...INITIAL_FORM_STATE });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shakeFields, setShakeFields] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const formRef = useRef(null);

  /**
   * Validates a single field and updates the errors state.
   *
   * @param {string} fieldName - The name of the field to validate
   * @param {string} value - The current value of the field
   * @returns {string|null} The error message or null
   */
  const validateSingleField = useCallback(
    (fieldName, value) => {
      const context = {
        existingUsers: allUsers,
        password: formData.password,
      };

      const error = validateField(fieldName, value, context);

      setErrors((prev) => {
        const updated = { ...prev };
        if (error) {
          updated[fieldName] = error;
        } else {
          delete updated[fieldName];
        }
        return updated;
      });

      return error;
    },
    [allUsers, formData.password],
  );

  /**
   * Handles input change events.
   *
   * @param {React.ChangeEvent<HTMLInputElement | HTMLSelectElement>} event
   */
  const handleChange = useCallback(
    (event) => {
      const { name, value } = event.target;

      setFormData((prev) => ({ ...prev, [name]: value }));

      // Validate on change if the field has been touched
      if (touched[name]) {
        validateSingleField(name, value);
      }

      // Re-validate confirmPassword when password changes
      if (name === 'password' && touched.confirmPassword && formData.confirmPassword) {
        const confirmError = formData.confirmPassword !== value
          ? 'Passwords do not match.'
          : null;
        setErrors((prev) => {
          const updated = { ...prev };
          if (confirmError) {
            updated.confirmPassword = confirmError;
          } else {
            delete updated.confirmPassword;
          }
          return updated;
        });
      }
    },
    [touched, validateSingleField, formData.confirmPassword],
  );

  /**
   * Handles input blur events for field-level validation.
   *
   * @param {React.FocusEvent<HTMLInputElement | HTMLSelectElement>} event
   */
  const handleBlur = useCallback(
    (event) => {
      const { name, value } = event.target;

      setTouched((prev) => ({ ...prev, [name]: true }));
      validateSingleField(name, value);
    },
    [validateSingleField],
  );

  /**
   * Triggers shake animation on fields with errors.
   *
   * @param {Object} fieldErrors - Object of field names to error messages
   */
  const triggerShake = useCallback((fieldErrors) => {
    const shaking = {};
    for (const key of Object.keys(fieldErrors)) {
      shaking[key] = true;
    }
    setShakeFields(shaking);

    setTimeout(() => {
      setShakeFields({});
    }, 600);
  }, []);

  /**
   * Validates all form fields.
   *
   * @returns {Object} Object of field names to error messages
   */
  const validateAllFields = useCallback(() => {
    const context = {
      existingUsers: allUsers,
      password: formData.password,
    };

    const fieldNames = [
      'firstName',
      'lastName',
      'email',
      'phone',
      'password',
      'confirmPassword',
      'accountType',
      'dob',
    ];

    const allErrors = {};

    for (const fieldName of fieldNames) {
      const error = validateField(fieldName, formData[fieldName], context);
      if (error) {
        allErrors[fieldName] = error;
      }
    }

    return allErrors;
  }, [formData, allUsers]);

  /**
   * Handles form submission.
   *
   * @param {React.FormEvent} event
   */
  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();

      if (isSubmitting) {
        return;
      }

      // Mark all fields as touched
      const allTouched = {};
      for (const key of Object.keys(formData)) {
        allTouched[key] = true;
      }
      setTouched(allTouched);

      // Validate all fields
      const allErrors = validateAllFields();
      setErrors(allErrors);

      if (Object.keys(allErrors).length > 0) {
        triggerShake(allErrors);

        // Focus the first field with an error
        const firstErrorField = Object.keys(allErrors)[0];
        const element = formRef.current?.querySelector(`[name="${firstErrorField}"]`);
        if (element) {
          element.focus();
        }

        return;
      }

      setIsSubmitting(true);

      const result = signup({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        accountType: formData.accountType,
        dob: formData.dob,
      });

      if (result.success) {
        addToast({
          message: `Account created successfully! Welcome, ${formData.firstName.trim()}.`,
          type: 'success',
        });
        navigate(ROUTES.LOGIN);
      } else {
        if (result.errors) {
          setErrors(result.errors);
          triggerShake(result.errors);
        }

        addToast({
          message: 'Registration failed. Please fix the errors and try again.',
          type: 'error',
        });

        setIsSubmitting(false);
      }
    },
    [formData, isSubmitting, signup, navigate, addToast, validateAllFields, triggerShake],
  );

  /**
   * Toggles password visibility.
   */
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  /**
   * Toggles confirm password visibility.
   */
  const toggleConfirmPasswordVisibility = useCallback(() => {
    setShowConfirmPassword((prev) => !prev);
  }, []);

  /**
   * Renders a form field with label, input, error message, and shake animation.
   *
   * @param {Object} config - Field configuration
   * @param {string} config.name - Field name
   * @param {string} config.label - Field label
   * @param {string} [config.type='text'] - Input type
   * @param {string} [config.placeholder] - Input placeholder
   * @param {string} [config.autoComplete] - Autocomplete attribute
   * @param {React.ReactNode} [config.suffix] - Suffix element (e.g., password toggle)
   * @param {React.ReactNode} [config.children] - Custom input element (e.g., select)
   * @returns {JSX.Element}
   */
  function renderField({ name, label, type = 'text', placeholder, autoComplete, suffix, children }) {
    const hasError = touched[name] && errors[name];
    const isShaking = shakeFields[name];

    return (
      <motion.div
        key={name}
        variants={shakeVariants}
        animate={isShaking ? 'shake' : 'idle'}
      >
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
        >
          {label}
        </label>
        <div className="relative">
          {children || (
            <input
              id={name}
              name={name}
              type={type}
              value={formData[name]}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder={placeholder}
              autoComplete={autoComplete}
              className={classNames(
                'block w-full rounded-lg border px-3 py-2.5 text-sm',
                'bg-white dark:bg-gray-800',
                'text-gray-900 dark:text-gray-100',
                'placeholder-gray-400 dark:placeholder-gray-500',
                'transition-colors duration-150',
                'focus:outline-none focus:ring-2 focus:ring-offset-1',
                'dark:focus:ring-offset-gray-900',
                hasError
                  ? 'border-rose-400 dark:border-rose-500 focus:ring-rose-500'
                  : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500',
                suffix && 'pr-10',
              )}
              aria-invalid={hasError ? 'true' : 'false'}
              aria-describedby={hasError ? `${name}-error` : undefined}
            />
          )}
          {suffix && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {suffix}
            </div>
          )}
        </div>
        {hasError && (
          <p
            id={`${name}-error`}
            className="mt-1.5 text-xs text-rose-600 dark:text-rose-400"
            role="alert"
          >
            {errors[name]}
          </p>
        )}
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950/20">
      {/* Theme toggle */}
      <div className="fixed top-4 right-4 z-20">
        <ThemeToggle size="md" />
      </div>

      <div className="mx-auto max-w-lg px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={headerVariants}
          className="text-center mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            Create Account
          </h1>
          <p className="mt-3 text-base text-gray-500 dark:text-gray-400">
            Join {import.meta.env.VITE_APP_TITLE || 'Wealth Portal'} to manage your financial portfolio.
          </p>
        </motion.div>

        {/* Form card */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={formVariants}
          className={classNames(
            'rounded-xl border p-6 sm:p-8',
            'bg-white/80 dark:bg-gray-900/80',
            'backdrop-blur-md',
            'border-gray-200/60 dark:border-gray-700/60',
            'shadow-sm dark:shadow-gray-900/20',
          )}
        >
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            noValidate
            className="space-y-5"
          >
            {/* Name row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {renderField({
                name: 'firstName',
                label: 'First Name',
                placeholder: 'Jane',
                autoComplete: 'given-name',
              })}
              {renderField({
                name: 'lastName',
                label: 'Last Name',
                placeholder: 'Doe',
                autoComplete: 'family-name',
              })}
            </div>

            {/* Email */}
            {renderField({
              name: 'email',
              label: 'Email Address',
              type: 'email',
              placeholder: 'jane.doe@example.com',
              autoComplete: 'email',
            })}

            {/* Phone */}
            {renderField({
              name: 'phone',
              label: 'Phone Number',
              type: 'tel',
              placeholder: '+1 (555) 123-4567',
              autoComplete: 'tel',
            })}

            {/* Password */}
            {renderField({
              name: 'password',
              label: 'Password',
              type: showPassword ? 'text' : 'password',
              placeholder: '••••••••',
              autoComplete: 'new-password',
              suffix: (
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              ),
            })}

            {/* Password strength meter */}
            {formData.password && (
              <PasswordStrengthMeter
                password={formData.password}
                showRequirements
                showLabel
              />
            )}

            {/* Confirm Password */}
            {renderField({
              name: 'confirmPassword',
              label: 'Confirm Password',
              type: showConfirmPassword ? 'text' : 'password',
              placeholder: '••••••••',
              autoComplete: 'new-password',
              suffix: (
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors focus:outline-none"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              ),
            })}

            {/* Account Type */}
            {renderField({
              name: 'accountType',
              label: 'Account Type',
              children: (
                <select
                  id="accountType"
                  name="accountType"
                  value={formData.accountType}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={classNames(
                    'block w-full rounded-lg border px-3 py-2.5 text-sm',
                    'bg-white dark:bg-gray-800',
                    'text-gray-900 dark:text-gray-100',
                    'transition-colors duration-150',
                    'focus:outline-none focus:ring-2 focus:ring-offset-1',
                    'dark:focus:ring-offset-gray-900',
                    touched.accountType && errors.accountType
                      ? 'border-rose-400 dark:border-rose-500 focus:ring-rose-500'
                      : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500',
                  )}
                  aria-invalid={touched.accountType && errors.accountType ? 'true' : 'false'}
                  aria-describedby={touched.accountType && errors.accountType ? 'accountType-error' : undefined}
                >
                  {ACCOUNT_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ),
            })}

            {/* Date of Birth */}
            {renderField({
              name: 'dob',
              label: 'Date of Birth',
              type: 'date',
              autoComplete: 'bday',
            })}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={classNames(
                'flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3',
                'bg-indigo-600 text-white text-sm font-semibold',
                'hover:bg-indigo-700 active:bg-indigo-800',
                'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
                'dark:focus:ring-offset-gray-900',
                'transition-colors duration-150',
                'disabled:opacity-60 disabled:cursor-not-allowed',
              )}
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Creating account…</span>
                </span>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Footer: link to login */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{' '}
            <Link
              to={ROUTES.LOGIN}
              className={classNames(
                'inline-flex items-center gap-1 font-medium',
                'text-indigo-600 dark:text-indigo-400',
                'hover:text-indigo-700 dark:hover:text-indigo-300',
                'underline underline-offset-2 decoration-indigo-300 dark:decoration-indigo-700',
                'hover:decoration-indigo-500 dark:hover:decoration-indigo-400',
                'transition-colors duration-150',
              )}
            >
              <LogIn className="w-4 h-4" />
              <span>Sign in</span>
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default SignupPage;