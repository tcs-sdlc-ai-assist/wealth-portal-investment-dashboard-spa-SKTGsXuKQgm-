/**
 * Profile personal information page with inline-editable fields
 * Displays editable form for firstName, lastName, email, phone, DOB, and accountType.
 * Fields are inline-editable with save/cancel. Changes persisted to localStorage via useProfileStore.
 * Shows avatar with initials. Uses SkeletonLoader and PageTransition.
 * Implements SCRUM-20326: Profile & Settings Pages
 * @module ProfilePage
 */

import { useState, useCallback, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  Pencil,
  Check,
  X,
  Save,
  RotateCcw,
  Shield,
  Camera,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useProfileStore } from '../../hooks/useProfileStore.js';
import { useSkeletonDelay } from '../../hooks/useSkeletonDelay.js';
import { useToast } from '../../context/ToastContext.jsx';
import { PageTransition } from '../../components/shared/PageTransition.jsx';
import { SkeletonLoader } from '../../components/shared/SkeletonLoader.jsx';
import { PasswordStrengthMeter } from '../../components/shared/PasswordStrengthMeter.jsx';
import { formatDate } from '../../utils/formatters.js';
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
 * Account type options for the dropdown.
 * @type {Array<{ value: string, label: string }>}
 */
const ACCOUNT_TYPE_OPTIONS = [
  { value: 'Individual', label: 'Individual' },
  { value: 'Joint', label: 'Joint' },
  { value: 'IRA', label: 'IRA' },
];

/**
 * Returns initials from first and last name.
 *
 * @param {string} firstName - The user's first name
 * @param {string} lastName - The user's last name
 * @returns {string} The initials (e.g., "JD")
 */
function getInitials(firstName, lastName) {
  const first = (firstName || '').charAt(0).toUpperCase();
  const last = (lastName || '').charAt(0).toUpperCase();
  return `${first}${last}`;
}

/**
 * Returns the account type badge color classes.
 *
 * @param {string} accountType - The account type string
 * @returns {{ bg: string, text: string }} Tailwind class strings
 */
function getAccountTypeBadgeClasses(accountType) {
  switch (accountType) {
    case 'Individual':
      return {
        bg: 'bg-indigo-100 dark:bg-indigo-950/30',
        text: 'text-indigo-700 dark:text-indigo-300',
      };
    case 'Joint':
      return {
        bg: 'bg-emerald-100 dark:bg-emerald-950/30',
        text: 'text-emerald-700 dark:text-emerald-300',
      };
    case 'IRA':
      return {
        bg: 'bg-amber-100 dark:bg-amber-950/30',
        text: 'text-amber-700 dark:text-amber-300',
      };
    default:
      return {
        bg: 'bg-gray-100 dark:bg-gray-800',
        text: 'text-gray-700 dark:text-gray-300',
      };
  }
}

/**
 * Inline editable field component.
 *
 * @param {Object} props
 * @param {string} props.label - Field label
 * @param {string} props.name - Field name
 * @param {string} props.value - Current display value
 * @param {string} props.editValue - Current edit value
 * @param {boolean} props.isEditing - Whether the field is in edit mode
 * @param {function} props.onEdit - Callback to enter edit mode
 * @param {function} props.onChange - Callback for value change
 * @param {function} props.onSave - Callback to save changes
 * @param {function} props.onCancel - Callback to cancel editing
 * @param {string} [props.type='text'] - Input type
 * @param {string} [props.error] - Error message
 * @param {React.ComponentType} [props.icon] - Icon component
 * @param {React.ReactNode} [props.children] - Custom input element
 * @param {string} [props.displayValue] - Custom display value
 * @returns {JSX.Element}
 */
function InlineEditField({
  label,
  name,
  value,
  editValue,
  isEditing,
  onEdit,
  onChange,
  onSave,
  onCancel,
  type = 'text',
  error,
  icon: Icon,
  children,
  displayValue,
}) {
  const inputRef = useRef(null);

  const handleEdit = useCallback(() => {
    onEdit(name);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 50);
  }, [onEdit, name]);

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        onSave(name);
      }
      if (event.key === 'Escape') {
        onCancel(name);
      }
    },
    [onSave, onCancel, name],
  );

  return (
    <div
      className={classNames(
        'flex items-start gap-4 rounded-lg px-4 py-3.5',
        'border border-transparent',
        isEditing
          ? 'bg-indigo-50/50 dark:bg-indigo-950/10 border-indigo-200/60 dark:border-indigo-800/40'
          : 'hover:bg-gray-50 dark:hover:bg-gray-800/40',
        'transition-colors duration-150',
      )}
    >
      {/* Icon */}
      {Icon && (
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex-shrink-0 mt-0.5">
          <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
          {label}
        </p>

        {isEditing ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {children || (
                <input
                  ref={inputRef}
                  type={type}
                  name={name}
                  value={editValue}
                  onChange={onChange}
                  onKeyDown={handleKeyDown}
                  className={classNames(
                    'block w-full rounded-lg border px-3 py-2 text-sm',
                    'bg-white dark:bg-gray-800',
                    'text-gray-900 dark:text-gray-100',
                    'placeholder-gray-400 dark:placeholder-gray-500',
                    'transition-colors duration-150',
                    'focus:outline-none focus:ring-2 focus:ring-offset-1',
                    'dark:focus:ring-offset-gray-900',
                    error
                      ? 'border-rose-400 dark:border-rose-500 focus:ring-rose-500'
                      : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500',
                  )}
                  aria-invalid={error ? 'true' : 'false'}
                  aria-describedby={error ? `${name}-error` : undefined}
                />
              )}
              <button
                type="button"
                onClick={() => onSave(name)}
                className={classNames(
                  'flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0',
                  'bg-indigo-600 text-white',
                  'hover:bg-indigo-700',
                  'focus:outline-none focus:ring-2 focus:ring-indigo-500',
                  'transition-colors duration-150',
                )}
                aria-label={`Save ${label}`}
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onCancel(name)}
                className={classNames(
                  'flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0',
                  'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
                  'hover:bg-gray-300 dark:hover:bg-gray-600',
                  'focus:outline-none focus:ring-2 focus:ring-gray-400',
                  'transition-colors duration-150',
                )}
                aria-label={`Cancel editing ${label}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {error && (
              <p
                id={`${name}-error`}
                className="text-xs text-rose-600 dark:text-rose-400"
                role="alert"
              >
                {error}
              </p>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {displayValue || value || '—'}
            </p>
            <button
              type="button"
              onClick={handleEdit}
              className={classNames(
                'flex items-center justify-center w-7 h-7 rounded-md flex-shrink-0',
                'text-gray-400 dark:text-gray-500',
                'hover:text-indigo-600 dark:hover:text-indigo-400',
                'hover:bg-indigo-50 dark:hover:bg-indigo-950/20',
                'focus:outline-none focus:ring-2 focus:ring-indigo-500',
                'transition-colors duration-150',
              )}
              aria-label={`Edit ${label}`}
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Profile page component.
 * Displays editable form for firstName, lastName, email, phone, DOB, and accountType.
 * Fields are inline-editable with save/cancel. Changes persisted to localStorage via useProfileStore.
 * Shows avatar with initials.
 *
 * @returns {JSX.Element}
 */
export function ProfilePage() {
  const { currentUser } = useAuth();
  const { profile, updateProfile } = useProfileStore();
  const { addToast } = useToast();
  const loading = useSkeletonDelay();

  const [editingField, setEditingField] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [errors, setErrors] = useState({});

  const initials = useMemo(() => {
    if (!profile) return '';
    return getInitials(profile.firstName, profile.lastName);
  }, [profile]);

  const badgeClasses = useMemo(() => {
    if (!profile) return { bg: '', text: '' };
    return getAccountTypeBadgeClasses(profile.accountType);
  }, [profile]);

  /**
   * Enters edit mode for a field.
   * @param {string} fieldName - The field name to edit
   */
  const handleEdit = useCallback(
    (fieldName) => {
      if (!profile) return;

      setEditingField(fieldName);
      setEditValues((prev) => ({
        ...prev,
        [fieldName]: profile[fieldName] || '',
      }));
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[fieldName];
        return updated;
      });
    },
    [profile],
  );

  /**
   * Handles input change for an editing field.
   * @param {React.ChangeEvent<HTMLInputElement | HTMLSelectElement>} event
   */
  const handleChange = useCallback((event) => {
    const { name, value } = event.target;
    setEditValues((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => {
      const updated = { ...prev };
      delete updated[name];
      return updated;
    });
  }, []);

  /**
   * Saves the edited field value.
   * @param {string} fieldName - The field name to save
   */
  const handleSave = useCallback(
    (fieldName) => {
      if (!profile) return;

      const value = editValues[fieldName];
      const updates = { [fieldName]: value };

      const result = updateProfile(updates);

      if (result.success) {
        setEditingField(null);
        setErrors((prev) => {
          const updated = { ...prev };
          delete updated[fieldName];
          return updated;
        });
        addToast({
          message: 'Profile updated successfully.',
          type: 'success',
        });
      } else {
        if (result.errors) {
          setErrors((prev) => ({ ...prev, ...result.errors }));
        }
        addToast({
          message: result.errors?.[fieldName] || 'Failed to update profile.',
          type: 'error',
        });
      }
    },
    [profile, editValues, updateProfile, addToast],
  );

  /**
   * Cancels editing a field.
   * @param {string} fieldName - The field name to cancel
   */
  const handleCancel = useCallback(
    (fieldName) => {
      setEditingField(null);
      setEditValues((prev) => {
        const updated = { ...prev };
        delete updated[fieldName];
        return updated;
      });
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[fieldName];
        return updated;
      });
    },
    [],
  );

  if (loading) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <SkeletonLoader variant="profile" />
          <SkeletonLoader variant="card" />
          <SkeletonLoader variant="list" rows={6} />
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
            Profile
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your personal information and account details.
          </p>
        </motion.div>

        {/* Avatar and summary card */}
        <motion.div
          variants={itemVariants}
          className={classNames(
            'rounded-xl border p-6',
            'bg-white/80 dark:bg-gray-900/80',
            'backdrop-blur-md',
            'border-gray-200/60 dark:border-gray-700/60',
            'shadow-sm dark:shadow-gray-900/20',
          )}
        >
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={`${profile.firstName} ${profile.lastName}`}
                  className="w-24 h-24 rounded-full border-4 border-indigo-200 dark:border-indigo-800 shadow-md"
                />
              ) : (
                <div
                  className={classNames(
                    'flex items-center justify-center w-24 h-24 rounded-full',
                    'bg-indigo-500 text-white text-2xl font-bold',
                    'border-4 border-indigo-200 dark:border-indigo-800 shadow-md',
                  )}
                  aria-hidden="true"
                >
                  {initials}
                </div>
              )}
              <div
                className={classNames(
                  'absolute bottom-0 right-0 flex items-center justify-center w-8 h-8 rounded-full',
                  'bg-white dark:bg-gray-800',
                  'border-2 border-gray-200 dark:border-gray-700',
                  'shadow-sm',
                )}
              >
                <Camera className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
              </div>
            </div>

            {/* Summary info */}
            <div className="text-center sm:text-left flex-1 min-w-0">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {profile.firstName} {profile.lastName}
              </h2>
              <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400 truncate">
                {profile.email}
              </p>
              <div className="mt-2 flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                <span
                  className={classNames(
                    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                    badgeClasses.bg,
                    badgeClasses.text,
                  )}
                >
                  {profile.accountType}
                </span>
                {currentUser?.lastLoginAt && (
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    Last login: {formatDate(currentUser.lastLoginAt, 'MMM d, yyyy · h:mm a')}
                  </span>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Personal information card */}
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
            <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Personal Information
            </h3>
          </div>

          {/* Fields */}
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {/* First Name */}
            <InlineEditField
              label="First Name"
              name="firstName"
              value={profile.firstName}
              editValue={editValues.firstName ?? profile.firstName}
              isEditing={editingField === 'firstName'}
              onEdit={handleEdit}
              onChange={handleChange}
              onSave={handleSave}
              onCancel={handleCancel}
              error={errors.firstName}
              icon={User}
            />

            {/* Last Name */}
            <InlineEditField
              label="Last Name"
              name="lastName"
              value={profile.lastName}
              editValue={editValues.lastName ?? profile.lastName}
              isEditing={editingField === 'lastName'}
              onEdit={handleEdit}
              onChange={handleChange}
              onSave={handleSave}
              onCancel={handleCancel}
              error={errors.lastName}
              icon={User}
            />

            {/* Email */}
            <InlineEditField
              label="Email Address"
              name="email"
              value={profile.email}
              editValue={editValues.email ?? profile.email}
              isEditing={editingField === 'email'}
              onEdit={handleEdit}
              onChange={handleChange}
              onSave={handleSave}
              onCancel={handleCancel}
              type="email"
              error={errors.email}
              icon={Mail}
            />

            {/* Phone */}
            <InlineEditField
              label="Phone Number"
              name="phone"
              value={profile.phone}
              editValue={editValues.phone ?? profile.phone}
              isEditing={editingField === 'phone'}
              onEdit={handleEdit}
              onChange={handleChange}
              onSave={handleSave}
              onCancel={handleCancel}
              type="tel"
              error={errors.phone}
              icon={Phone}
            />

            {/* Date of Birth */}
            <InlineEditField
              label="Date of Birth"
              name="dob"
              value={profile.dob}
              editValue={editValues.dob ?? profile.dob}
              isEditing={editingField === 'dob'}
              onEdit={handleEdit}
              onChange={handleChange}
              onSave={handleSave}
              onCancel={handleCancel}
              type="date"
              error={errors.dob}
              icon={Calendar}
              displayValue={profile.dob ? formatDate(profile.dob, 'MMMM d, yyyy') : '—'}
            />

            {/* Account Type */}
            <InlineEditField
              label="Account Type"
              name="accountType"
              value={profile.accountType}
              editValue={editValues.accountType ?? profile.accountType}
              isEditing={editingField === 'accountType'}
              onEdit={handleEdit}
              onChange={handleChange}
              onSave={handleSave}
              onCancel={handleCancel}
              error={errors.accountType}
              icon={Briefcase}
            >
              <select
                name="accountType"
                value={editValues.accountType ?? profile.accountType}
                onChange={handleChange}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    handleSave('accountType');
                  }
                  if (event.key === 'Escape') {
                    handleCancel('accountType');
                  }
                }}
                className={classNames(
                  'block w-full rounded-lg border px-3 py-2 text-sm appearance-none',
                  'bg-white dark:bg-gray-800',
                  'text-gray-900 dark:text-gray-100',
                  'transition-colors duration-150',
                  'focus:outline-none focus:ring-2 focus:ring-offset-1',
                  'dark:focus:ring-offset-gray-900',
                  errors.accountType
                    ? 'border-rose-400 dark:border-rose-500 focus:ring-rose-500'
                    : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500',
                )}
                aria-invalid={errors.accountType ? 'true' : 'false'}
              >
                {ACCOUNT_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </InlineEditField>
          </div>
        </motion.div>

        {/* Security quick info card */}
        <motion.div
          variants={itemVariants}
          className={classNames(
            'rounded-xl border p-6',
            'bg-white/80 dark:bg-gray-900/80',
            'backdrop-blur-md',
            'border-gray-200/60 dark:border-gray-700/60',
            'shadow-sm dark:shadow-gray-900/20',
          )}
        >
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Security Overview
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* 2FA Status */}
            <div className="flex items-center gap-3">
              <div
                className={classNames(
                  'w-2.5 h-2.5 rounded-full flex-shrink-0',
                  profile.securitySettings?.twoFactorEnabled
                    ? 'bg-emerald-500'
                    : 'bg-gray-300 dark:bg-gray-600',
                )}
                aria-hidden="true"
              />
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Two-Factor Auth
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {profile.securitySettings?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            </div>

            {/* Session Timeout */}
            <div className="flex items-center gap-3">
              <div
                className="w-2.5 h-2.5 rounded-full bg-indigo-500 flex-shrink-0"
                aria-hidden="true"
              />
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Session Timeout
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {profile.securitySettings?.sessionTimeout || 30} minutes
                </p>
              </div>
            </div>

            {/* Trusted Devices */}
            <div className="flex items-center gap-3">
              <div
                className="w-2.5 h-2.5 rounded-full bg-sky-500 flex-shrink-0"
                aria-hidden="true"
              />
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Trusted Devices
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {profile.securitySettings?.trustedDevices || 0} device{(profile.securitySettings?.trustedDevices || 0) !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Cost Basis Method */}
        <motion.div
          variants={itemVariants}
          className={classNames(
            'rounded-xl border p-6',
            'bg-white/80 dark:bg-gray-900/80',
            'backdrop-blur-md',
            'border-gray-200/60 dark:border-gray-700/60',
            'shadow-sm dark:shadow-gray-900/20',
          )}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                Cost Basis Method
              </p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {profile.costBasisMethod || 'FIFO'}
              </p>
            </div>
            <span
              className={classNames(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                'bg-gray-100 dark:bg-gray-800',
                'text-gray-700 dark:text-gray-300',
              )}
            >
              {profile.costBasisMethod || 'FIFO'}
            </span>
          </div>
        </motion.div>
      </motion.div>
    </PageTransition>
  );
}

export default ProfilePage;