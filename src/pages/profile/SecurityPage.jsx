/**
 * Security settings page with password update form and 2FA toggle
 * Password update validates strength and match, shows success toast.
 * 2FA toggle shows simulated QR code modal. All changes persisted to localStorage.
 * Wrapped in PageTransition.
 * Implements SCRUM-20326: Profile & Settings Pages
 * @module SecurityPage
 */

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Lock,
  Eye,
  EyeOff,
  Smartphone,
  Key,
  AlertTriangle,
  CheckCircle,
  Monitor,
  Clock,
} from 'lucide-react';
import { useProfileStore } from '../../hooks/useProfileStore.js';
import { useSkeletonDelay } from '../../hooks/useSkeletonDelay.js';
import { useToast } from '../../context/ToastContext.jsx';
import { PageTransition } from '../../components/shared/PageTransition.jsx';
import { SkeletonLoader } from '../../components/shared/SkeletonLoader.jsx';
import { PasswordStrengthMeter } from '../../components/shared/PasswordStrengthMeter.jsx';
import { Modal } from '../../components/shared/Modal.jsx';
import { validatePassword } from '../../utils/validators.js';
import { classNames } from '../../utils/helpers.js';

/**
 * Container animation variants for staggered children.
 * @type {Object}
 */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

/**
 * Individual item animation variants.
 * @type {Object}
 */
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24,
    },
  },
};

/**
 * Initial password form state.
 * @type {Object}
 */
const INITIAL_PASSWORD_FORM = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

/**
 * Two-factor authentication method options.
 * @type {Array<{ value: string, label: string, description: string, icon: React.ComponentType }>}
 */
const TWO_FACTOR_METHODS = [
  {
    value: 'authenticator',
    label: 'Authenticator App',
    description: 'Use an authenticator app like Google Authenticator or Authy to generate verification codes.',
    icon: Smartphone,
  },
  {
    value: 'sms',
    label: 'SMS Verification',
    description: 'Receive a verification code via text message to your registered phone number.',
    icon: Key,
  },
];

/**
 * Session timeout options in minutes.
 * @type {Array<{ value: number, label: string }>}
 */
const SESSION_TIMEOUT_OPTIONS = [
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 60, label: '1 hour' },
  { value: 120, label: '2 hours' },
];

/**
 * Animated toggle switch component.
 *
 * @param {Object} props
 * @param {boolean} props.checked - Whether the toggle is on
 * @param {function} props.onChange - Callback when the toggle is clicked
 * @param {string} props.label - Accessible label for the toggle
 * @returns {JSX.Element}
 */
function ToggleSwitch({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={classNames(
        'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent',
        'transition-colors duration-200 ease-in-out',
        'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
        'dark:focus:ring-offset-gray-900',
        checked
          ? 'bg-indigo-600'
          : 'bg-gray-200 dark:bg-gray-700',
      )}
    >
      <motion.span
        layout
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 30,
        }}
        className={classNames(
          'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0',
          'transform',
        )}
        style={{
          translateX: checked ? 20 : 0,
        }}
        aria-hidden="true"
      />
    </button>
  );
}

/**
 * Simulated QR code SVG component for 2FA setup.
 *
 * @returns {JSX.Element}
 */
function SimulatedQRCode() {
  return (
    <svg
      className="w-48 h-48 mx-auto"
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Simulated QR code for two-factor authentication setup"
    >
      {/* Background */}
      <rect width="200" height="200" rx="8" className="fill-white dark:fill-gray-800" />

      {/* QR-like pattern */}
      {/* Top-left finder */}
      <rect x="16" y="16" width="48" height="48" rx="4" className="fill-gray-900 dark:fill-gray-100" />
      <rect x="22" y="22" width="36" height="36" rx="2" className="fill-white dark:fill-gray-800" />
      <rect x="28" y="28" width="24" height="24" rx="2" className="fill-gray-900 dark:fill-gray-100" />

      {/* Top-right finder */}
      <rect x="136" y="16" width="48" height="48" rx="4" className="fill-gray-900 dark:fill-gray-100" />
      <rect x="142" y="22" width="36" height="36" rx="2" className="fill-white dark:fill-gray-800" />
      <rect x="148" y="28" width="24" height="24" rx="2" className="fill-gray-900 dark:fill-gray-100" />

      {/* Bottom-left finder */}
      <rect x="16" y="136" width="48" height="48" rx="4" className="fill-gray-900 dark:fill-gray-100" />
      <rect x="22" y="142" width="36" height="36" rx="2" className="fill-white dark:fill-gray-800" />
      <rect x="28" y="148" width="24" height="24" rx="2" className="fill-gray-900 dark:fill-gray-100" />

      {/* Data modules (simulated) */}
      <rect x="76" y="16" width="8" height="8" className="fill-gray-900 dark:fill-gray-100" />
      <rect x="92" y="16" width="8" height="8" className="fill-gray-900 dark:fill-gray-100" />
      <rect x="108" y="16" width="8" height="8" className="fill-gray-900 dark:fill-gray-100" />
      <rect x="76" y="32" width="8" height="8" className="fill-gray-900 dark:fill-gray-100" />
      <rect x="108" y="32" width="8" height="8" className="fill-gray-900 dark:fill-gray-100" />
      <rect x="76" y="48" width="8" height="8" className="fill-gray-900 dark:fill-gray-100" />
      <rect x="92" y="48" width="8" height="8" className="fill-gray-900 dark:fill-gray-100" />

      <rect x="76" y="76" width="8" height="8" className="fill-gray-900 dark:fill-gray-100" />
      <rect x="92" y="76" width="8" height="8" className="fill-gray-900 dark:fill-gray-100" />
      <rect x="108" y="76" width="8" height="8" className="fill-gray-900 dark:fill-gray-100" />
      <rect x="76" y="92" width="8" height="8" className="fill-gray-900 dark:fill-gray-100" />
      <rect x="92" y="92" width="8" height="8" className="fill-gray-900 dark:fill-gray-100" />
      <rect x="108" y="92" width="8" height="8" className="fill-gray-900 dark:fill-gray-100" />
      <rect x="76" y="108" width="8" height="8" className="fill-gray-900 dark:fill-gray-100" />
      <rect x="108" y="108" width="8" height="8" className="fill-gray-900 dark:fill-gray-100" />

      <rect x="136" y="76" width="8" height="8" className="fill-gray-900 dark:fill-gray-100" />
      <rect x="152" y="76" width="8" height="8" className="fill-gray-900 dark:fill-gray-100" />
      <rect x="168" y="76" width="8" height="8" className="fill-gray-900 dark:fill-gray-100" />
      <rect x="136" y="92" width="8" height="8" className="fill-gray-900 dark:fill-gray-100" />
      <rect x="168" y="92" width="8" height="8" className="fill-gray-900 dark:fill-gray-100" />
      <rect x="136" y="108" width="8" height="8" className="fill-gray-900 dark:fill-gray-100" />
      <rect x="152" y="108" width="8" height="8" className="fill-gray-900 dark:fill-gray-100" />
      <rect x="168" y="108" width="8" height="8" className="fill-gray-900 dark:fill-gray-100" />

      <rect x="76" y="136" width="8" height="8" className="fill-gray-900 dark:fill-gray-100" />
      <rect x="92" y="136" width="8" height="8" className="fill-gray-900 dark:fill-gray-100" />
      <rect x="108" y="136" width="8" height="8" className="fill-gray-900 dark:fill-gray-100" />
      <rect x="136" y="136" width="8" height="8" className="fill-gray-900 dark:fill-gray-100" />
      <rect x="152" y="136" width="8" height="8" className="fill-gray-900 dark:fill-gray-100" />
      <rect x="168" y="136" width="8" height="8" className="fill-gray-900 dark:fill-gray-100" />
      <rect x="76" y="152" width="8" height="8" className="fill-gray-900 dark:fill-gray-100" />
      <rect x="108" y="152" width="8" height="8" className="fill-gray-900 dark:fill-gray-100" />
      <rect x="136" y="152" width="8" height="8" className="fill-gray-900 dark:fill-gray-100" />
      <rect x="168" y="152" width="8" height="8" className="fill-gray-900 dark:fill-gray-100" />
      <rect x="76" y="168" width="8" height="8" className="fill-gray-900 dark:fill-gray-100" />
      <rect x="92" y="168" width="8" height="8" className="fill-gray-900 dark:fill-gray-100" />
      <rect x="108" y="168" width="8" height="8" className="fill-gray-900 dark:fill-gray-100" />
      <rect x="152" y="168" width="8" height="8" className="fill-gray-900 dark:fill-gray-100" />

      {/* Timing patterns */}
      <rect x="16" y="76" width="8" height="8" className="fill-gray-900 dark:fill-gray-100" />
      <rect x="32" y="76" width="8" height="8" className="fill-gray-900 dark:fill-gray-100" />
      <rect x="48" y="76" width="8" height="8" className="fill-gray-900 dark:fill-gray-100" />
    </svg>
  );
}

/**
 * Security settings page component.
 * Renders a password update form with strength meter, 2FA toggle with
 * simulated QR code modal, login alerts toggle, and session timeout selector.
 * All changes are persisted to localStorage via useProfileStore.
 *
 * @returns {JSX.Element}
 */
export function SecurityPage() {
  const { profile, updateProfile, updateSecuritySettings } = useProfileStore();
  const { addToast } = useToast();
  const loading = useSkeletonDelay();

  const [passwordForm, setPasswordForm] = useState({ ...INITIAL_PASSWORD_FORM });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [selectedTwoFactorMethod, setSelectedTwoFactorMethod] = useState(null);

  /**
   * Handles password form input change.
   * @param {React.ChangeEvent<HTMLInputElement>} event
   */
  const handlePasswordChange = useCallback((event) => {
    const { name, value } = event.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    setPasswordErrors((prev) => {
      const updated = { ...prev };
      delete updated[name];
      return updated;
    });
  }, []);

  /**
   * Validates and submits the password update form.
   * @param {React.FormEvent} event
   */
  const handlePasswordSubmit = useCallback(
    (event) => {
      event.preventDefault();

      if (isSubmittingPassword) {
        return;
      }

      const errors = {};

      // Validate current password
      if (!passwordForm.currentPassword || passwordForm.currentPassword.trim().length === 0) {
        errors.currentPassword = 'Current password is required.';
      }

      // Validate new password
      if (!passwordForm.newPassword || passwordForm.newPassword.trim().length === 0) {
        errors.newPassword = 'New password is required.';
      } else {
        const passwordResult = validatePassword(passwordForm.newPassword);
        if (!passwordResult.valid) {
          errors.newPassword = passwordResult.errors[0];
        }
      }

      // Validate confirm password
      if (!passwordForm.confirmPassword || passwordForm.confirmPassword.trim().length === 0) {
        errors.confirmPassword = 'Please confirm your new password.';
      } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match.';
      }

      // Check current password matches (simulated)
      if (!errors.currentPassword && profile) {
        // In a real app, this would be a server-side check
        // For demo, we compare against the stored password
        const storedPassword = profile.id
          ? (() => {
              // Access the password from the auth context indirectly
              // Since profile doesn't expose password, we do a simulated check
              return null;
            })()
          : null;

        // For the demo, we accept any non-empty current password
        // In production, this would validate against the server
      }

      if (Object.keys(errors).length > 0) {
        setPasswordErrors(errors);
        return;
      }

      setIsSubmittingPassword(true);

      // Simulate a brief delay for UX
      setTimeout(() => {
        const result = updateProfile({
          password: passwordForm.newPassword,
          confirmPassword: passwordForm.confirmPassword,
        });

        if (result.success) {
          setPasswordForm({ ...INITIAL_PASSWORD_FORM });
          setPasswordErrors({});
          addToast({
            message: 'Password updated successfully.',
            type: 'success',
          });
        } else {
          if (result.errors) {
            setPasswordErrors(result.errors);
          }
          addToast({
            message: result.errors?.password || 'Failed to update password.',
            type: 'error',
          });
        }

        setIsSubmittingPassword(false);
      }, 500);
    },
    [passwordForm, isSubmittingPassword, profile, updateProfile, addToast],
  );

  /**
   * Handles toggling two-factor authentication.
   * If enabling, opens the QR code modal. If disabling, disables immediately.
   */
  const handleToggleTwoFactor = useCallback(() => {
    if (!profile || !profile.securitySettings) {
      return;
    }

    const isCurrentlyEnabled = profile.securitySettings.twoFactorEnabled;

    if (isCurrentlyEnabled) {
      // Disable 2FA
      updateSecuritySettings({
        twoFactorEnabled: false,
        twoFactorMethod: null,
      });
      addToast({
        message: 'Two-factor authentication has been disabled.',
        type: 'info',
      });
    } else {
      // Show method selection / QR modal
      setSelectedTwoFactorMethod('authenticator');
      setIsQRModalOpen(true);
    }
  }, [profile, updateSecuritySettings, addToast]);

  /**
   * Confirms enabling 2FA with the selected method.
   */
  const handleConfirmTwoFactor = useCallback(() => {
    if (!selectedTwoFactorMethod) {
      return;
    }

    updateSecuritySettings({
      twoFactorEnabled: true,
      twoFactorMethod: selectedTwoFactorMethod,
    });

    setIsQRModalOpen(false);
    setSelectedTwoFactorMethod(null);

    addToast({
      message: 'Two-factor authentication has been enabled.',
      type: 'success',
    });
  }, [selectedTwoFactorMethod, updateSecuritySettings, addToast]);

  /**
   * Closes the QR code modal without enabling 2FA.
   */
  const handleCloseQRModal = useCallback(() => {
    setIsQRModalOpen(false);
    setSelectedTwoFactorMethod(null);
  }, []);

  /**
   * Handles toggling login alerts.
   */
  const handleToggleLoginAlerts = useCallback(() => {
    if (!profile || !profile.securitySettings) {
      return;
    }

    const newValue = !profile.securitySettings.loginAlerts;
    updateSecuritySettings({ loginAlerts: newValue });

    addToast({
      message: `Login alerts ${newValue ? 'enabled' : 'disabled'}.`,
      type: 'success',
    });
  }, [profile, updateSecuritySettings, addToast]);

  /**
   * Handles session timeout change.
   * @param {React.ChangeEvent<HTMLSelectElement>} event
   */
  const handleSessionTimeoutChange = useCallback(
    (event) => {
      const value = parseInt(event.target.value, 10);
      if (!Number.isFinite(value)) {
        return;
      }

      updateSecuritySettings({ sessionTimeout: value });

      addToast({
        message: `Session timeout updated to ${value} minutes.`,
        type: 'success',
      });
    },
    [updateSecuritySettings, addToast],
  );

  if (loading) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <SkeletonLoader variant="text" lines={2} />
          <SkeletonLoader variant="card" />
          <SkeletonLoader variant="list" rows={4} />
        </div>
      </PageTransition>
    );
  }

  if (!profile) {
    return (
      <PageTransition>
        <div className="text-center py-16">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No profile data available. Please log in.
          </p>
        </div>
      </PageTransition>
    );
  }

  const securitySettings = profile.securitySettings || {};

  return (
    <PageTransition>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-6"
      >
        {/* Page header */}
        <motion.div variants={itemVariants}>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            Security
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your password, two-factor authentication, and security preferences.
          </p>
        </motion.div>

        {/* Password update card */}
        <motion.div
          variants={itemVariants}
          className={classNames(
            'rounded-xl border overflow-hidden',
            'bg-white/80 dark:bg-gray-900/80',
            'backdrop-blur-md',
            'border-gray-200/60 dark:border-gray-700/60',
            'shadow-sm dark:shadow-gray-900/20',
          )}
        >
          {/* Section header */}
          <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/50">
            <Lock className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Change Password
            </h3>
          </div>

          {/* Password form */}
          <form onSubmit={handlePasswordSubmit} noValidate className="p-6 space-y-5">
            {/* Current Password */}
            <div>
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
              >
                Current Password
              </label>
              <div className="relative">
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={classNames(
                    'block w-full rounded-lg border px-3 py-2.5 text-sm pr-10',
                    'bg-white dark:bg-gray-800',
                    'text-gray-900 dark:text-gray-100',
                    'placeholder-gray-400 dark:placeholder-gray-500',
                    'transition-colors duration-150',
                    'focus:outline-none focus:ring-2 focus:ring-offset-1',
                    'dark:focus:ring-offset-gray-900',
                    passwordErrors.currentPassword
                      ? 'border-rose-400 dark:border-rose-500 focus:ring-rose-500'
                      : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500',
                  )}
                  aria-invalid={passwordErrors.currentPassword ? 'true' : 'false'}
                  aria-describedby={passwordErrors.currentPassword ? 'currentPassword-error' : undefined}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword((prev) => !prev)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors focus:outline-none"
                    aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}
                    tabIndex={-1}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              {passwordErrors.currentPassword && (
                <p
                  id="currentPassword-error"
                  className="mt-1.5 text-xs text-rose-600 dark:text-rose-400"
                  role="alert"
                >
                  {passwordErrors.currentPassword}
                </p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className={classNames(
                    'block w-full rounded-lg border px-3 py-2.5 text-sm pr-10',
                    'bg-white dark:bg-gray-800',
                    'text-gray-900 dark:text-gray-100',
                    'placeholder-gray-400 dark:placeholder-gray-500',
                    'transition-colors duration-150',
                    'focus:outline-none focus:ring-2 focus:ring-offset-1',
                    'dark:focus:ring-offset-gray-900',
                    passwordErrors.newPassword
                      ? 'border-rose-400 dark:border-rose-500 focus:ring-rose-500'
                      : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500',
                  )}
                  aria-invalid={passwordErrors.newPassword ? 'true' : 'false'}
                  aria-describedby={passwordErrors.newPassword ? 'newPassword-error' : undefined}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors focus:outline-none"
                    aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                    tabIndex={-1}
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              {passwordErrors.newPassword && (
                <p
                  id="newPassword-error"
                  className="mt-1.5 text-xs text-rose-600 dark:text-rose-400"
                  role="alert"
                >
                  {passwordErrors.newPassword}
                </p>
              )}

              {/* Password strength meter */}
              {passwordForm.newPassword && (
                <div className="mt-2">
                  <PasswordStrengthMeter
                    password={passwordForm.newPassword}
                    showRequirements
                    showLabel
                  />
                </div>
              )}
            </div>

            {/* Confirm New Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className={classNames(
                    'block w-full rounded-lg border px-3 py-2.5 text-sm pr-10',
                    'bg-white dark:bg-gray-800',
                    'text-gray-900 dark:text-gray-100',
                    'placeholder-gray-400 dark:placeholder-gray-500',
                    'transition-colors duration-150',
                    'focus:outline-none focus:ring-2 focus:ring-offset-1',
                    'dark:focus:ring-offset-gray-900',
                    passwordErrors.confirmPassword
                      ? 'border-rose-400 dark:border-rose-500 focus:ring-rose-500'
                      : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500',
                  )}
                  aria-invalid={passwordErrors.confirmPassword ? 'true' : 'false'}
                  aria-describedby={passwordErrors.confirmPassword ? 'confirmPassword-error' : undefined}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors focus:outline-none"
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              {passwordErrors.confirmPassword && (
                <p
                  id="confirmPassword-error"
                  className="mt-1.5 text-xs text-rose-600 dark:text-rose-400"
                  role="alert"
                >
                  {passwordErrors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmittingPassword}
                className={classNames(
                  'inline-flex items-center gap-2 rounded-lg px-4 py-2.5',
                  'bg-indigo-600 text-white text-sm font-semibold',
                  'hover:bg-indigo-700 active:bg-indigo-800',
                  'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
                  'dark:focus:ring-offset-gray-900',
                  'transition-colors duration-150',
                  'disabled:opacity-60 disabled:cursor-not-allowed',
                )}
              >
                {isSubmittingPassword ? (
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
                    <span>Updating…</span>
                  </span>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Update Password</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Two-Factor Authentication card */}
        <motion.div
          variants={itemVariants}
          className={classNames(
            'rounded-xl border overflow-hidden',
            'bg-white/80 dark:bg-gray-900/80',
            'backdrop-blur-md',
            'border-gray-200/60 dark:border-gray-700/60',
            'shadow-sm dark:shadow-gray-900/20',
          )}
        >
          {/* Section header */}
          <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/50">
            <Shield className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Two-Factor Authentication
            </h3>
          </div>

          <div className="p-6">
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div
                className={classNames(
                  'flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0',
                  securitySettings.twoFactorEnabled
                    ? 'bg-emerald-100 dark:bg-emerald-950/30'
                    : 'bg-gray-100 dark:bg-gray-800',
                )}
              >
                <Shield
                  className={classNames(
                    'w-5 h-5',
                    securitySettings.twoFactorEnabled
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-gray-400 dark:text-gray-500',
                  )}
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Two-Factor Authentication
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                      Add an extra layer of security to your account by requiring a verification code in addition to your password.
                    </p>
                  </div>
                  <ToggleSwitch
                    checked={securitySettings.twoFactorEnabled === true}
                    onChange={handleToggleTwoFactor}
                    label="Toggle two-factor authentication"
                  />
                </div>

                {/* Current 2FA status */}
                {securitySettings.twoFactorEnabled && securitySettings.twoFactorMethod && (
                  <div className="mt-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      Enabled via {securitySettings.twoFactorMethod === 'authenticator' ? 'Authenticator App' : 'SMS Verification'}
                    </span>
                  </div>
                )}

                {!securitySettings.twoFactorEnabled && (
                  <div className="mt-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                      Not enabled — your account is less secure
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Additional Security Settings card */}
        <motion.div
          variants={itemVariants}
          className={classNames(
            'rounded-xl border overflow-hidden',
            'bg-white/80 dark:bg-gray-900/80',
            'backdrop-blur-md',
            'border-gray-200/60 dark:border-gray-700/60',
            'shadow-sm dark:shadow-gray-900/20',
          )}
        >
          {/* Section header */}
          <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/50">
            <Key className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Security Preferences
            </h3>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {/* Login Alerts */}
            <div
              className={classNames(
                'flex items-center gap-4 px-6 py-4',
                'hover:bg-gray-50 dark:hover:bg-gray-800/40',
                'transition-colors duration-150',
              )}
            >
              <div
                className={classNames(
                  'flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0',
                  securitySettings.loginAlerts
                    ? 'bg-indigo-100 dark:bg-indigo-950/30'
                    : 'bg-gray-100 dark:bg-gray-800',
                )}
              >
                <AlertTriangle
                  className={classNames(
                    'w-5 h-5',
                    securitySettings.loginAlerts
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-gray-400 dark:text-gray-500',
                  )}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Login Alerts
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                  Receive notifications when your account is accessed from a new device or location.
                </p>
              </div>
              <ToggleSwitch
                checked={securitySettings.loginAlerts === true}
                onChange={handleToggleLoginAlerts}
                label="Toggle login alerts"
              />
            </div>

            {/* Session Timeout */}
            <div
              className={classNames(
                'flex items-center gap-4 px-6 py-4',
                'hover:bg-gray-50 dark:hover:bg-gray-800/40',
                'transition-colors duration-150',
              )}
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                <Clock className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Session Timeout
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                  Automatically log out after a period of inactivity.
                </p>
              </div>
              <select
                value={securitySettings.sessionTimeout || 30}
                onChange={handleSessionTimeoutChange}
                className={classNames(
                  'rounded-lg border px-3 py-2 text-sm appearance-none',
                  'bg-white dark:bg-gray-800',
                  'text-gray-900 dark:text-gray-100',
                  'border-gray-300 dark:border-gray-600',
                  'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
                  'focus:ring-offset-1 dark:focus:ring-offset-gray-900',
                  'transition-colors duration-150',
                )}
                aria-label="Session timeout duration"
              >
                {SESSION_TIMEOUT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Trusted Devices */}
            <div
              className={classNames(
                'flex items-center gap-4 px-6 py-4',
                'hover:bg-gray-50 dark:hover:bg-gray-800/40',
                'transition-colors duration-150',
              )}
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                <Monitor className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Trusted Devices
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                  Devices that have been verified and trusted for account access.
                </p>
              </div>
              <span
                className={classNames(
                  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                  'bg-gray-100 dark:bg-gray-800',
                  'text-gray-700 dark:text-gray-300',
                )}
              >
                {securitySettings.trustedDevices || 0} device{(securitySettings.trustedDevices || 0) !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Security info footer */}
        <motion.div
          variants={itemVariants}
          className={classNames(
            'rounded-xl border p-5',
            'bg-indigo-50/50 dark:bg-indigo-950/10',
            'border-indigo-200/60 dark:border-indigo-800/40',
          )}
        >
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Security recommendations
              </p>
              <ul className="mt-2 space-y-1.5">
                <li className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  <span
                    className={classNames(
                      'inline-block w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0',
                      securitySettings.twoFactorEnabled ? 'bg-emerald-500' : 'bg-amber-500',
                    )}
                    aria-hidden="true"
                  />
                  <span>
                    {securitySettings.twoFactorEnabled
                      ? 'Two-factor authentication is enabled — great!'
                      : 'Enable two-factor authentication for enhanced security.'}
                  </span>
                </li>
                <li className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  <span
                    className={classNames(
                      'inline-block w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0',
                      securitySettings.loginAlerts ? 'bg-emerald-500' : 'bg-amber-500',
                    )}
                    aria-hidden="true"
                  />
                  <span>
                    {securitySettings.loginAlerts
                      ? 'Login alerts are active — you\'ll be notified of suspicious activity.'
                      : 'Turn on login alerts to be notified of new sign-ins.'}
                  </span>
                </li>
                <li className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0"
                    aria-hidden="true"
                  />
                  <span>Use a unique, strong password and change it regularly.</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* 2FA Setup Modal */}
      <Modal
        isOpen={isQRModalOpen}
        onClose={handleCloseQRModal}
        title="Set Up Two-Factor Authentication"
        size="md"
        footer={
          <>
            <button
              type="button"
              onClick={handleCloseQRModal}
              className={classNames(
                'rounded-lg px-4 py-2.5 text-sm font-medium',
                'text-gray-700 dark:text-gray-300',
                'bg-gray-100 dark:bg-gray-800',
                'hover:bg-gray-200 dark:hover:bg-gray-700',
                'focus:outline-none focus:ring-2 focus:ring-gray-400',
                'transition-colors duration-150',
              )}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmTwoFactor}
              className={classNames(
                'rounded-lg px-4 py-2.5 text-sm font-semibold',
                'bg-indigo-600 text-white',
                'hover:bg-indigo-700 active:bg-indigo-800',
                'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
                'dark:focus:ring-offset-gray-900',
                'transition-colors duration-150',
              )}
            >
              Enable 2FA
            </button>
          </>
        }
      >
        <div className="space-y-6">
          {/* Method selection */}
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
              Choose a verification method
            </p>
            <div className="space-y-2">
              {TWO_FACTOR_METHODS.map((method) => {
                const Icon = method.icon;
                const isSelected = selectedTwoFactorMethod === method.value;

                return (
                  <button
                    key={method.value}
                    type="button"
                    onClick={() => setSelectedTwoFactorMethod(method.value)}
                    className={classNames(
                      'flex w-full items-start gap-3 rounded-lg border p-4 text-left',
                      'transition-colors duration-150',
                      'focus:outline-none focus:ring-2 focus:ring-indigo-500',
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20'
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/40',
                    )}
                  >
                    <div
                      className={classNames(
                        'flex items-center justify-center w-9 h-9 rounded-lg flex-shrink-0',
                        isSelected
                          ? 'bg-indigo-100 dark:bg-indigo-950/40'
                          : 'bg-gray-100 dark:bg-gray-800',
                      )}
                    >
                      <Icon
                        className={classNames(
                          'w-5 h-5',
                          isSelected
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : 'text-gray-400 dark:text-gray-500',
                        )}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={classNames(
                          'text-sm font-medium',
                          isSelected
                            ? 'text-indigo-700 dark:text-indigo-300'
                            : 'text-gray-900 dark:text-gray-100',
                        )}
                      >
                        {method.label}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                        {method.description}
                      </p>
                    </div>
                    <div
                      className={classNames(
                        'flex items-center justify-center w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5',
                        isSelected
                          ? 'border-indigo-600 bg-indigo-600'
                          : 'border-gray-300 dark:border-gray-600',
                      )}
                    >
                      {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* QR Code (shown for authenticator method) */}
          {selectedTwoFactorMethod === 'authenticator' && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Scan this QR code with your authenticator app
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                  Open your authenticator app and scan the QR code below to add your account.
                </p>
              </div>

              <div
                className={classNames(
                  'rounded-lg border p-4',
                  'bg-gray-50 dark:bg-gray-800/50',
                  'border-gray-200 dark:border-gray-700',
                )}
              >
                <SimulatedQRCode />
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Can&apos;t scan? Use this setup key:
                </p>
                <p className="mt-1 text-sm font-mono font-medium text-gray-900 dark:text-gray-100 tracking-wider select-all">
                  JBSW Y3DP EHPK 3PXP
                </p>
              </div>
            </div>
          )}

          {/* SMS method info */}
          {selectedTwoFactorMethod === 'sms' && (
            <div
              className={classNames(
                'rounded-lg border p-4',
                'bg-gray-50 dark:bg-gray-800/50',
                'border-gray-200 dark:border-gray-700',
              )}
            >
              <div className="flex items-start gap-3">
                <Smartphone className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    SMS verification will be sent to your phone
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                    A verification code will be sent to your registered phone number each time you sign in.
                    Standard messaging rates may apply.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              This is a simulated two-factor authentication setup for demo purposes.
              No actual 2FA verification will be performed.
            </p>
          </div>
        </div>
      </Modal>
    </PageTransition>
  );
}

export default SecurityPage;