/**
 * Bank account management page with linked bank list and add bank form
 * Add bank form collects bank name, routing number, account number, and account type.
 * On submit, shows 3-second simulated verification delay with progress indicator,
 * then adds bank to list with 'Verified' badge. Banks can be removed.
 * All data persisted to localStorage via useProfileStore.
 * Uses Modal for add form. Wrapped in PageTransition.
 * Implements SCRUM-20326: Profile & Settings Pages
 * @module BankManagement
 */

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Landmark,
  Plus,
  Trash2,
  CheckCircle,
  Star,
  Building2,
  Hash,
  CreditCard,
  Loader2,
} from 'lucide-react';
import { useProfileStore } from '../../hooks/useProfileStore.js';
import { useSkeletonDelay } from '../../hooks/useSkeletonDelay.js';
import { useToast } from '../../context/ToastContext.jsx';
import { PageTransition } from '../../components/shared/PageTransition.jsx';
import { SkeletonLoader } from '../../components/shared/SkeletonLoader.jsx';
import { EmptyState } from '../../components/shared/EmptyState.jsx';
import { Modal } from '../../components/shared/Modal.jsx';
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
 * Account type options for the bank account form.
 * @type {Array<{ value: string, label: string }>}
 */
const BANK_ACCOUNT_TYPE_OPTIONS = [
  { value: '', label: 'Select account type' },
  { value: 'checking', label: 'Checking' },
  { value: 'savings', label: 'Savings' },
];

/**
 * Initial form state for the add bank form.
 * @type {Object}
 */
const INITIAL_FORM_STATE = {
  bankName: '',
  routingNumber: '',
  accountNumber: '',
  type: '',
};

/**
 * Verification duration in milliseconds.
 * @type {number}
 */
const VERIFICATION_DURATION = 3000;

/**
 * Returns badge color classes for a given bank account type.
 *
 * @param {string} type - The bank account type
 * @returns {{ bg: string, text: string }} Tailwind class strings
 */
function getBankTypeBadgeClasses(type) {
  switch (type) {
    case 'checking':
      return {
        bg: 'bg-indigo-100 dark:bg-indigo-950/30',
        text: 'text-indigo-700 dark:text-indigo-300',
      };
    case 'savings':
      return {
        bg: 'bg-emerald-100 dark:bg-emerald-950/30',
        text: 'text-emerald-700 dark:text-emerald-300',
      };
    default:
      return {
        bg: 'bg-gray-100 dark:bg-gray-800',
        text: 'text-gray-700 dark:text-gray-300',
      };
  }
}

/**
 * Masks a string to show only the last 4 characters.
 *
 * @param {string} value - The string to mask
 * @returns {string} The masked string
 */
function maskNumber(value) {
  if (!value || typeof value !== 'string' || value.length <= 4) {
    return value || '';
  }
  return '****' + value.slice(-4);
}

/**
 * Bank management page component.
 * Renders a list of linked bank accounts with add/remove functionality.
 * Add bank form uses a Modal with simulated 3-second verification delay.
 * All data persisted to localStorage via useProfileStore.
 *
 * @returns {JSX.Element}
 */
export function BankManagement() {
  const {
    profile,
    bankAccounts,
    addBankAccount,
    removeBankAccount,
    setPrimaryBankAccount,
  } = useProfileStore();
  const { addToast } = useToast();
  const loading = useSkeletonDelay();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ ...INITIAL_FORM_STATE });
  const [formErrors, setFormErrors] = useState({});
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationProgress, setVerificationProgress] = useState(0);
  const [confirmRemoveId, setConfirmRemoveId] = useState(null);

  /**
   * Opens the add bank modal.
   */
  const handleOpenModal = useCallback(() => {
    setFormData({ ...INITIAL_FORM_STATE });
    setFormErrors({});
    setIsVerifying(false);
    setVerificationProgress(0);
    setIsModalOpen(true);
  }, []);

  /**
   * Closes the add bank modal.
   */
  const handleCloseModal = useCallback(() => {
    if (isVerifying) {
      return;
    }
    setIsModalOpen(false);
    setFormData({ ...INITIAL_FORM_STATE });
    setFormErrors({});
    setVerificationProgress(0);
  }, [isVerifying]);

  /**
   * Handles form input change.
   * @param {React.ChangeEvent<HTMLInputElement | HTMLSelectElement>} event
   */
  const handleChange = useCallback((event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => {
      const updated = { ...prev };
      delete updated[name];
      return updated;
    });
  }, []);

  /**
   * Validates the add bank form.
   *
   * @returns {Object} Object of field names to error messages
   */
  const validateForm = useCallback(() => {
    const errors = {};

    if (!formData.bankName || formData.bankName.trim().length === 0) {
      errors.bankName = 'Bank name is required.';
    } else if (formData.bankName.trim().length < 2) {
      errors.bankName = 'Bank name must be at least 2 characters.';
    }

    if (!formData.routingNumber || formData.routingNumber.trim().length === 0) {
      errors.routingNumber = 'Routing number is required.';
    } else if (!/^\d{9}$/.test(formData.routingNumber.trim())) {
      errors.routingNumber = 'Routing number must be exactly 9 digits.';
    }

    if (!formData.accountNumber || formData.accountNumber.trim().length === 0) {
      errors.accountNumber = 'Account number is required.';
    } else if (!/^\d{4,17}$/.test(formData.accountNumber.trim())) {
      errors.accountNumber = 'Account number must be between 4 and 17 digits.';
    }

    if (!formData.type || formData.type.trim().length === 0) {
      errors.type = 'Account type is required.';
    }

    return errors;
  }, [formData]);

  /**
   * Handles form submission with simulated verification delay.
   * @param {React.FormEvent} event
   */
  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();

      if (isVerifying) {
        return;
      }

      const errors = validateForm();
      setFormErrors(errors);

      if (Object.keys(errors).length > 0) {
        return;
      }

      setIsVerifying(true);
      setVerificationProgress(0);

      const intervalDuration = 50;
      const totalSteps = VERIFICATION_DURATION / intervalDuration;
      let currentStep = 0;

      const progressInterval = setInterval(() => {
        currentStep += 1;
        const progress = Math.min((currentStep / totalSteps) * 100, 100);
        setVerificationProgress(progress);

        if (currentStep >= totalSteps) {
          clearInterval(progressInterval);

          const maskedAccount = maskNumber(formData.accountNumber.trim());
          const maskedRouting = maskNumber(formData.routingNumber.trim());

          addBankAccount({
            bankName: formData.bankName.trim(),
            accountNumber: maskedAccount,
            routingNumber: maskedRouting,
            type: formData.type,
            isPrimary: false,
          });

          setIsVerifying(false);
          setVerificationProgress(0);
          setIsModalOpen(false);
          setFormData({ ...INITIAL_FORM_STATE });
          setFormErrors({});

          addToast({
            message: `${formData.bankName.trim()} account verified and linked successfully.`,
            type: 'success',
          });
        }
      }, intervalDuration);
    },
    [formData, isVerifying, validateForm, addBankAccount, addToast],
  );

  /**
   * Handles removing a bank account.
   * @param {string} bankAccountId - The id of the bank account to remove
   */
  const handleRemove = useCallback(
    (bankAccountId) => {
      const bank = bankAccounts.find((b) => b.id === bankAccountId);
      removeBankAccount(bankAccountId);
      setConfirmRemoveId(null);

      addToast({
        message: `${bank ? bank.bankName : 'Bank account'} has been removed.`,
        type: 'info',
      });
    },
    [bankAccounts, removeBankAccount, addToast],
  );

  /**
   * Handles setting a bank account as primary.
   * @param {string} bankAccountId - The id of the bank account to set as primary
   */
  const handleSetPrimary = useCallback(
    (bankAccountId) => {
      setPrimaryBankAccount(bankAccountId);

      const bank = bankAccounts.find((b) => b.id === bankAccountId);
      addToast({
        message: `${bank ? bank.bankName : 'Bank account'} set as primary.`,
        type: 'success',
      });
    },
    [bankAccounts, setPrimaryBankAccount, addToast],
  );

  if (loading) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <SkeletonLoader variant="text" lines={2} />
          <SkeletonLoader variant="list" rows={3} />
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

  const hasBankAccounts = bankAccounts.length > 0;

  return (
    <PageTransition>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-6"
      >
        {/* Page header */}
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
              Bank Management
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage your linked bank accounts for transfers and payments.
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenModal}
            className={classNames(
              'inline-flex items-center gap-2 rounded-lg px-4 py-2.5',
              'bg-indigo-600 text-white text-sm font-semibold',
              'hover:bg-indigo-700 active:bg-indigo-800',
              'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
              'dark:focus:ring-offset-gray-900',
              'transition-colors duration-150',
            )}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Bank</span>
          </button>
        </motion.div>

        {/* Bank accounts list */}
        {hasBankAccounts ? (
          <motion.div variants={itemVariants} className="space-y-3">
            {bankAccounts.map((bank) => {
              const badgeClasses = getBankTypeBadgeClasses(bank.type);
              const isConfirmingRemove = confirmRemoveId === bank.id;

              return (
                <motion.div
                  key={bank.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 24,
                  }}
                  className={classNames(
                    'flex items-center gap-4 rounded-xl border p-5',
                    'bg-white/80 dark:bg-gray-900/80',
                    'backdrop-blur-md',
                    'border-gray-200/60 dark:border-gray-700/60',
                    'shadow-sm dark:shadow-gray-900/20',
                    'hover:shadow-md dark:hover:shadow-gray-900/30',
                    'transition-shadow duration-200',
                  )}
                >
                  {/* Bank icon */}
                  <div
                    className={classNames(
                      'flex items-center justify-center w-12 h-12 rounded-lg flex-shrink-0',
                      badgeClasses.bg,
                    )}
                  >
                    <Landmark className={classNames('w-6 h-6', badgeClasses.text)} />
                  </div>

                  {/* Bank details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {bank.bankName}
                      </p>
                      {bank.isPrimary && (
                        <span
                          className={classNames(
                            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                            'bg-amber-100 dark:bg-amber-950/30',
                            'text-amber-700 dark:text-amber-300',
                          )}
                        >
                          <Star className="w-3 h-3" />
                          Primary
                        </span>
                      )}
                      <span
                        className={classNames(
                          'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                          'bg-emerald-100 dark:bg-emerald-950/30',
                          'text-emerald-700 dark:text-emerald-300',
                        )}
                      >
                        <CheckCircle className="w-3 h-3" />
                        Verified
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 flex-wrap">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Account: {bank.accountNumber}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Routing: {bank.routingNumber}
                      </span>
                      <span
                        className={classNames(
                          'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                          badgeClasses.bg,
                          badgeClasses.text,
                        )}
                      >
                        {bank.type === 'checking' ? 'Checking' : bank.type === 'savings' ? 'Savings' : bank.type}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!bank.isPrimary && (
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(bank.id)}
                        className={classNames(
                          'rounded-lg px-3 py-1.5 text-xs font-medium',
                          'text-gray-600 dark:text-gray-400',
                          'hover:bg-gray-100 dark:hover:bg-gray-800',
                          'border border-gray-300 dark:border-gray-600',
                          'transition-colors duration-150',
                          'focus:outline-none focus:ring-2 focus:ring-indigo-500',
                        )}
                        aria-label={`Set ${bank.bankName} as primary`}
                      >
                        Set Primary
                      </button>
                    )}

                    {isConfirmingRemove ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleRemove(bank.id)}
                          className={classNames(
                            'rounded-lg px-3 py-1.5 text-xs font-medium',
                            'bg-rose-600 text-white',
                            'hover:bg-rose-700',
                            'transition-colors duration-150',
                            'focus:outline-none focus:ring-2 focus:ring-rose-500',
                          )}
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmRemoveId(null)}
                          className={classNames(
                            'rounded-lg px-3 py-1.5 text-xs font-medium',
                            'text-gray-600 dark:text-gray-400',
                            'hover:bg-gray-100 dark:hover:bg-gray-800',
                            'border border-gray-300 dark:border-gray-600',
                            'transition-colors duration-150',
                            'focus:outline-none focus:ring-2 focus:ring-gray-400',
                          )}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmRemoveId(bank.id)}
                        className={classNames(
                          'flex items-center justify-center w-8 h-8 rounded-lg',
                          'text-gray-400 dark:text-gray-500',
                          'hover:text-rose-600 dark:hover:text-rose-400',
                          'hover:bg-rose-50 dark:hover:bg-rose-950/20',
                          'transition-colors duration-150',
                          'focus:outline-none focus:ring-2 focus:ring-rose-500',
                        )}
                        aria-label={`Remove ${bank.bankName}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div variants={itemVariants}>
            <EmptyState
              title="No bank accounts linked"
              description="Link a bank account to enable transfers and payments."
              actionLabel="Add Bank Account"
              onAction={handleOpenModal}
              icon={
                <Landmark className="w-16 h-16 text-gray-300 dark:text-gray-600" />
              }
            />
          </motion.div>
        )}

        {/* Summary footer */}
        {hasBankAccounts && (
          <motion.div
            variants={itemVariants}
            className="text-xs text-gray-500 dark:text-gray-400 text-right"
          >
            {bankAccounts.length} bank account{bankAccounts.length !== 1 ? 's' : ''} linked
          </motion.div>
        )}

        {/* Info footer */}
        <motion.div
          variants={itemVariants}
          className={classNames(
            'rounded-xl border p-5',
            'bg-indigo-50/50 dark:bg-indigo-950/10',
            'border-indigo-200/60 dark:border-indigo-800/40',
          )}
        >
          <div className="flex items-start gap-3">
            <Landmark className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                About bank accounts
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                Linked bank accounts are used for funding your investment accounts and receiving
                withdrawals. All bank accounts undergo a simulated verification process for demo
                purposes. Your primary bank account will be used as the default for transfers.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Add Bank Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Add Bank Account"
        size="md"
        closeOnBackdrop={!isVerifying}
        closeOnEscape={!isVerifying}
        showCloseButton={!isVerifying}
        footer={
          !isVerifying ? (
            <>
              <button
                type="button"
                onClick={handleCloseModal}
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
                onClick={handleSubmit}
                className={classNames(
                  'rounded-lg px-4 py-2.5 text-sm font-semibold',
                  'bg-indigo-600 text-white',
                  'hover:bg-indigo-700 active:bg-indigo-800',
                  'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
                  'dark:focus:ring-offset-gray-900',
                  'transition-colors duration-150',
                )}
              >
                Verify & Add
              </button>
            </>
          ) : null
        }
      >
        {isVerifying ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-6">
            {/* Spinning loader */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            >
              <Loader2 className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
            </motion.div>

            {/* Status text */}
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Verifying bank account…
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Please wait while we verify your bank details.
              </p>
            </div>

            {/* Progress bar */}
            <div className="w-full max-w-xs">
              <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-indigo-600 dark:bg-indigo-500"
                  initial={{ width: '0%' }}
                  animate={{ width: `${verificationProgress}%` }}
                  transition={{ duration: 0.05, ease: 'linear' }}
                />
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-2 tabular-nums">
                {Math.round(verificationProgress)}%
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Bank Name */}
            <div>
              <label
                htmlFor="bankName"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
              >
                Bank Name
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
                <input
                  id="bankName"
                  name="bankName"
                  type="text"
                  value={formData.bankName}
                  onChange={handleChange}
                  placeholder="e.g., Chase Bank"
                  autoComplete="organization"
                  className={classNames(
                    'block w-full rounded-lg border pl-9 pr-3 py-2.5 text-sm',
                    'bg-white dark:bg-gray-800',
                    'text-gray-900 dark:text-gray-100',
                    'placeholder-gray-400 dark:placeholder-gray-500',
                    'transition-colors duration-150',
                    'focus:outline-none focus:ring-2 focus:ring-offset-1',
                    'dark:focus:ring-offset-gray-900',
                    formErrors.bankName
                      ? 'border-rose-400 dark:border-rose-500 focus:ring-rose-500'
                      : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500',
                  )}
                  aria-invalid={formErrors.bankName ? 'true' : 'false'}
                  aria-describedby={formErrors.bankName ? 'bankName-error' : undefined}
                />
              </div>
              {formErrors.bankName && (
                <p
                  id="bankName-error"
                  className="mt-1.5 text-xs text-rose-600 dark:text-rose-400"
                  role="alert"
                >
                  {formErrors.bankName}
                </p>
              )}
            </div>

            {/* Routing Number */}
            <div>
              <label
                htmlFor="routingNumber"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
              >
                Routing Number
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
                <input
                  id="routingNumber"
                  name="routingNumber"
                  type="text"
                  value={formData.routingNumber}
                  onChange={handleChange}
                  placeholder="9 digits"
                  maxLength={9}
                  inputMode="numeric"
                  className={classNames(
                    'block w-full rounded-lg border pl-9 pr-3 py-2.5 text-sm',
                    'bg-white dark:bg-gray-800',
                    'text-gray-900 dark:text-gray-100',
                    'placeholder-gray-400 dark:placeholder-gray-500',
                    'transition-colors duration-150',
                    'focus:outline-none focus:ring-2 focus:ring-offset-1',
                    'dark:focus:ring-offset-gray-900',
                    formErrors.routingNumber
                      ? 'border-rose-400 dark:border-rose-500 focus:ring-rose-500'
                      : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500',
                  )}
                  aria-invalid={formErrors.routingNumber ? 'true' : 'false'}
                  aria-describedby={formErrors.routingNumber ? 'routingNumber-error' : undefined}
                />
              </div>
              {formErrors.routingNumber && (
                <p
                  id="routingNumber-error"
                  className="mt-1.5 text-xs text-rose-600 dark:text-rose-400"
                  role="alert"
                >
                  {formErrors.routingNumber}
                </p>
              )}
            </div>

            {/* Account Number */}
            <div>
              <label
                htmlFor="accountNumber"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
              >
                Account Number
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
                <input
                  id="accountNumber"
                  name="accountNumber"
                  type="text"
                  value={formData.accountNumber}
                  onChange={handleChange}
                  placeholder="4–17 digits"
                  maxLength={17}
                  inputMode="numeric"
                  className={classNames(
                    'block w-full rounded-lg border pl-9 pr-3 py-2.5 text-sm',
                    'bg-white dark:bg-gray-800',
                    'text-gray-900 dark:text-gray-100',
                    'placeholder-gray-400 dark:placeholder-gray-500',
                    'transition-colors duration-150',
                    'focus:outline-none focus:ring-2 focus:ring-offset-1',
                    'dark:focus:ring-offset-gray-900',
                    formErrors.accountNumber
                      ? 'border-rose-400 dark:border-rose-500 focus:ring-rose-500'
                      : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500',
                  )}
                  aria-invalid={formErrors.accountNumber ? 'true' : 'false'}
                  aria-describedby={formErrors.accountNumber ? 'accountNumber-error' : undefined}
                />
              </div>
              {formErrors.accountNumber && (
                <p
                  id="accountNumber-error"
                  className="mt-1.5 text-xs text-rose-600 dark:text-rose-400"
                  role="alert"
                >
                  {formErrors.accountNumber}
                </p>
              )}
            </div>

            {/* Account Type */}
            <div>
              <label
                htmlFor="type"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
              >
                Account Type
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className={classNames(
                  'block w-full rounded-lg border px-3 py-2.5 text-sm appearance-none',
                  'bg-white dark:bg-gray-800',
                  'text-gray-900 dark:text-gray-100',
                  'transition-colors duration-150',
                  'focus:outline-none focus:ring-2 focus:ring-offset-1',
                  'dark:focus:ring-offset-gray-900',
                  formErrors.type
                    ? 'border-rose-400 dark:border-rose-500 focus:ring-rose-500'
                    : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500',
                )}
                aria-invalid={formErrors.type ? 'true' : 'false'}
                aria-describedby={formErrors.type ? 'type-error' : undefined}
              >
                {BANK_ACCOUNT_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {formErrors.type && (
                <p
                  id="type-error"
                  className="mt-1.5 text-xs text-rose-600 dark:text-rose-400"
                  role="alert"
                >
                  {formErrors.type}
                </p>
              )}
            </div>

            {/* Disclaimer */}
            <div className="flex items-start gap-2 pt-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Your bank account will undergo a simulated verification process for demo purposes.
                No real bank verification will be performed.
              </p>
            </div>
          </form>
        )}
      </Modal>
    </PageTransition>
  );
}

export default BankManagement;