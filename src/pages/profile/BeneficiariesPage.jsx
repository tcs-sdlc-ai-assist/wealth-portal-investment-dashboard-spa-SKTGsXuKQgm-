/**
 * Beneficiaries management page with list, add/edit/remove functionality
 * Validates that all shares sum to exactly 100% before saving.
 * All data persisted to localStorage via useProfileStore.
 * Uses Modal for add/edit form. Wrapped in PageTransition.
 * Implements SCRUM-20326: Profile & Settings Pages
 * @module BeneficiariesPage
 */

import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Plus,
  Trash2,
  Pencil,
  UserPlus,
  Heart,
  Calendar,
  Percent,
  AlertTriangle,
  CheckCircle,
  PieChart,
} from 'lucide-react';
import { useProfileStore } from '../../hooks/useProfileStore.js';
import { useSkeletonDelay } from '../../hooks/useSkeletonDelay.js';
import { useToast } from '../../context/ToastContext.jsx';
import { PageTransition } from '../../components/shared/PageTransition.jsx';
import { SkeletonLoader } from '../../components/shared/SkeletonLoader.jsx';
import { EmptyState } from '../../components/shared/EmptyState.jsx';
import { Modal } from '../../components/shared/Modal.jsx';
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
 * Relationship options for the beneficiary form.
 * @type {Array<{ value: string, label: string }>}
 */
const RELATIONSHIP_OPTIONS = [
  { value: '', label: 'Select relationship' },
  { value: 'Spouse', label: 'Spouse' },
  { value: 'Child', label: 'Child' },
  { value: 'Parent', label: 'Parent' },
  { value: 'Sibling', label: 'Sibling' },
  { value: 'Grandchild', label: 'Grandchild' },
  { value: 'Other', label: 'Other' },
];

/**
 * Initial form state for the add/edit beneficiary form.
 * @type {Object}
 */
const INITIAL_FORM_STATE = {
  firstName: '',
  lastName: '',
  relationship: '',
  share: '',
  dob: '',
};

/**
 * Returns badge color classes for a given relationship.
 *
 * @param {string} relationship - The beneficiary relationship
 * @returns {{ bg: string, text: string }} Tailwind class strings
 */
function getRelationshipBadgeClasses(relationship) {
  switch (relationship) {
    case 'Spouse':
      return {
        bg: 'bg-rose-100 dark:bg-rose-950/30',
        text: 'text-rose-700 dark:text-rose-300',
      };
    case 'Child':
      return {
        bg: 'bg-sky-100 dark:bg-sky-950/30',
        text: 'text-sky-700 dark:text-sky-300',
      };
    case 'Parent':
      return {
        bg: 'bg-violet-100 dark:bg-violet-950/30',
        text: 'text-violet-700 dark:text-violet-300',
      };
    case 'Sibling':
      return {
        bg: 'bg-amber-100 dark:bg-amber-950/30',
        text: 'text-amber-700 dark:text-amber-300',
      };
    case 'Grandchild':
      return {
        bg: 'bg-teal-100 dark:bg-teal-950/30',
        text: 'text-teal-700 dark:text-teal-300',
      };
    default:
      return {
        bg: 'bg-gray-100 dark:bg-gray-800',
        text: 'text-gray-700 dark:text-gray-300',
      };
  }
}

/**
 * Beneficiaries management page component.
 * Renders a list of beneficiaries with add/edit/remove functionality.
 * Add/edit form uses a Modal. Validates that all shares sum to exactly 100%.
 * All data persisted to localStorage via useProfileStore.
 *
 * @returns {JSX.Element}
 */
export function BeneficiariesPage() {
  const {
    profile,
    beneficiaries,
    totalBeneficiaryShares,
    addBeneficiary,
    removeBeneficiary,
    updateBeneficiary,
  } = useProfileStore();
  const { addToast } = useToast();
  const loading = useSkeletonDelay();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBeneficiaryId, setEditingBeneficiaryId] = useState(null);
  const [formData, setFormData] = useState({ ...INITIAL_FORM_STATE });
  const [formErrors, setFormErrors] = useState({});
  const [confirmRemoveId, setConfirmRemoveId] = useState(null);

  /**
   * The available share percentage for a new or edited beneficiary.
   * @type {number}
   */
  const availableShare = useMemo(() => {
    if (editingBeneficiaryId) {
      const currentBeneficiary = beneficiaries.find((b) => b.id === editingBeneficiaryId);
      const currentShare = currentBeneficiary && Number.isFinite(currentBeneficiary.share) ? currentBeneficiary.share : 0;
      return 100 - totalBeneficiaryShares + currentShare;
    }
    return 100 - totalBeneficiaryShares;
  }, [editingBeneficiaryId, beneficiaries, totalBeneficiaryShares]);

  /**
   * Whether the total shares equal exactly 100%.
   * @type {boolean}
   */
  const isFullyAllocated = useMemo(() => {
    return totalBeneficiaryShares === 100;
  }, [totalBeneficiaryShares]);

  /**
   * Opens the add beneficiary modal.
   */
  const handleOpenAddModal = useCallback(() => {
    setFormData({ ...INITIAL_FORM_STATE });
    setFormErrors({});
    setEditingBeneficiaryId(null);
    setIsModalOpen(true);
  }, []);

  /**
   * Opens the edit beneficiary modal.
   * @param {Object} beneficiary - The beneficiary to edit
   */
  const handleOpenEditModal = useCallback((beneficiary) => {
    setFormData({
      firstName: beneficiary.firstName || '',
      lastName: beneficiary.lastName || '',
      relationship: beneficiary.relationship || '',
      share: beneficiary.share !== undefined && beneficiary.share !== null ? String(beneficiary.share) : '',
      dob: beneficiary.dob || '',
    });
    setFormErrors({});
    setEditingBeneficiaryId(beneficiary.id);
    setIsModalOpen(true);
  }, []);

  /**
   * Closes the modal.
   */
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setFormData({ ...INITIAL_FORM_STATE });
    setFormErrors({});
    setEditingBeneficiaryId(null);
  }, []);

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
   * Validates the beneficiary form.
   *
   * @returns {Object} Object of field names to error messages
   */
  const validateForm = useCallback(() => {
    const errors = {};

    if (!formData.firstName || formData.firstName.trim().length === 0) {
      errors.firstName = 'First name is required.';
    } else if (formData.firstName.trim().length < 1 || formData.firstName.trim().length > 50) {
      errors.firstName = 'First name must be between 1 and 50 characters.';
    }

    if (!formData.lastName || formData.lastName.trim().length === 0) {
      errors.lastName = 'Last name is required.';
    } else if (formData.lastName.trim().length < 1 || formData.lastName.trim().length > 50) {
      errors.lastName = 'Last name must be between 1 and 50 characters.';
    }

    if (!formData.relationship || formData.relationship.trim().length === 0) {
      errors.relationship = 'Relationship is required.';
    }

    if (!formData.share || formData.share.trim().length === 0) {
      errors.share = 'Share percentage is required.';
    } else {
      const shareValue = parseFloat(formData.share);
      if (!Number.isFinite(shareValue) || shareValue <= 0) {
        errors.share = 'Share must be a positive number.';
      } else if (shareValue > 100) {
        errors.share = 'Share cannot exceed 100%.';
      } else if (shareValue > availableShare) {
        errors.share = `Share cannot exceed ${availableShare}%. Available: ${availableShare}%.`;
      }
    }

    if (!formData.dob || formData.dob.trim().length === 0) {
      errors.dob = 'Date of birth is required.';
    } else {
      const birthDate = new Date(formData.dob);
      if (isNaN(birthDate.getTime())) {
        errors.dob = 'Please enter a valid date.';
      }
    }

    return errors;
  }, [formData, availableShare]);

  /**
   * Handles form submission for add or edit.
   * @param {React.FormEvent} event
   */
  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();

      const errors = validateForm();
      setFormErrors(errors);

      if (Object.keys(errors).length > 0) {
        return;
      }

      const shareValue = parseFloat(formData.share);

      if (editingBeneficiaryId) {
        // Update existing beneficiary
        const result = updateBeneficiary(editingBeneficiaryId, {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          relationship: formData.relationship,
          share: shareValue,
          dob: formData.dob,
        });

        if (result.success) {
          setIsModalOpen(false);
          setFormData({ ...INITIAL_FORM_STATE });
          setFormErrors({});
          setEditingBeneficiaryId(null);

          addToast({
            message: `${formData.firstName.trim()} ${formData.lastName.trim()} updated successfully.`,
            type: 'success',
          });
        } else {
          addToast({
            message: result.error || 'Failed to update beneficiary.',
            type: 'error',
          });
        }
      } else {
        // Add new beneficiary
        const result = addBeneficiary({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          relationship: formData.relationship,
          share: shareValue,
          dob: formData.dob,
        });

        if (result.success) {
          setIsModalOpen(false);
          setFormData({ ...INITIAL_FORM_STATE });
          setFormErrors({});

          addToast({
            message: `${formData.firstName.trim()} ${formData.lastName.trim()} added as beneficiary.`,
            type: 'success',
          });
        } else {
          addToast({
            message: result.error || 'Failed to add beneficiary.',
            type: 'error',
          });
        }
      }
    },
    [formData, editingBeneficiaryId, validateForm, addBeneficiary, updateBeneficiary, addToast],
  );

  /**
   * Handles removing a beneficiary.
   * @param {string} beneficiaryId - The id of the beneficiary to remove
   */
  const handleRemove = useCallback(
    (beneficiaryId) => {
      const beneficiary = beneficiaries.find((b) => b.id === beneficiaryId);
      removeBeneficiary(beneficiaryId);
      setConfirmRemoveId(null);

      addToast({
        message: `${beneficiary ? `${beneficiary.firstName} ${beneficiary.lastName}` : 'Beneficiary'} has been removed.`,
        type: 'info',
      });
    },
    [beneficiaries, removeBeneficiary, addToast],
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

  const hasBeneficiaries = beneficiaries.length > 0;

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
              Beneficiaries
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage the beneficiaries for your accounts.
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenAddModal}
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
            <span className="hidden sm:inline">Add Beneficiary</span>
          </button>
        </motion.div>

        {/* Share allocation summary */}
        {hasBeneficiaries && (
          <motion.div
            variants={itemVariants}
            className={classNames(
              'rounded-xl border p-5',
              isFullyAllocated
                ? 'bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-200/60 dark:border-emerald-800/40'
                : 'bg-amber-50/50 dark:bg-amber-950/10 border-amber-200/60 dark:border-amber-800/40',
            )}
          >
            <div className="flex items-center gap-3">
              {isFullyAllocated ? (
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {isFullyAllocated
                    ? 'Shares are fully allocated at 100%.'
                    : `Total shares: ${totalBeneficiaryShares}% — ${100 - totalBeneficiaryShares}% remaining.`}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {isFullyAllocated
                    ? 'All beneficiary shares sum to exactly 100%.'
                    : 'Beneficiary shares should sum to 100% for complete allocation.'}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <PieChart
                  className={classNames(
                    'w-5 h-5',
                    isFullyAllocated
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-amber-600 dark:text-amber-400',
                  )}
                />
                <span
                  className={classNames(
                    'text-lg font-bold tabular-nums',
                    isFullyAllocated
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-amber-600 dark:text-amber-400',
                  )}
                >
                  {totalBeneficiaryShares}%
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-3">
              <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <div
                  className={classNames(
                    'h-full rounded-full transition-all duration-500',
                    isFullyAllocated
                      ? 'bg-emerald-500'
                      : totalBeneficiaryShares > 100
                        ? 'bg-rose-500'
                        : 'bg-amber-500',
                  )}
                  style={{ width: `${Math.min(totalBeneficiaryShares, 100)}%` }}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Beneficiaries list */}
        {hasBeneficiaries ? (
          <motion.div variants={itemVariants} className="space-y-3">
            {beneficiaries.map((beneficiary) => {
              const badgeClasses = getRelationshipBadgeClasses(beneficiary.relationship);
              const isConfirmingRemove = confirmRemoveId === beneficiary.id;

              return (
                <motion.div
                  key={beneficiary.id}
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
                  {/* Avatar */}
                  <div
                    className={classNames(
                      'flex items-center justify-center w-12 h-12 rounded-full flex-shrink-0',
                      'bg-indigo-100 dark:bg-indigo-950/30',
                      'text-indigo-600 dark:text-indigo-400',
                      'text-sm font-bold',
                    )}
                    aria-hidden="true"
                  >
                    {(beneficiary.firstName || '').charAt(0).toUpperCase()}
                    {(beneficiary.lastName || '').charAt(0).toUpperCase()}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {beneficiary.firstName} {beneficiary.lastName}
                      </p>
                      <span
                        className={classNames(
                          'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                          badgeClasses.bg,
                          badgeClasses.text,
                        )}
                      >
                        <Heart className="w-3 h-3" />
                        {beneficiary.relationship}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 flex-wrap">
                      {beneficiary.dob && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          DOB: {formatDate(beneficiary.dob, 'MMM d, yyyy')}
                        </span>
                      )}
                      <span
                        className={classNames(
                          'inline-flex items-center gap-1 text-xs font-semibold tabular-nums',
                          'text-indigo-600 dark:text-indigo-400',
                        )}
                      >
                        <Percent className="w-3 h-3" />
                        {beneficiary.share}% share
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(beneficiary)}
                      className={classNames(
                        'flex items-center justify-center w-8 h-8 rounded-lg',
                        'text-gray-400 dark:text-gray-500',
                        'hover:text-indigo-600 dark:hover:text-indigo-400',
                        'hover:bg-indigo-50 dark:hover:bg-indigo-950/20',
                        'transition-colors duration-150',
                        'focus:outline-none focus:ring-2 focus:ring-indigo-500',
                      )}
                      aria-label={`Edit ${beneficiary.firstName} ${beneficiary.lastName}`}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

                    {isConfirmingRemove ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleRemove(beneficiary.id)}
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
                        onClick={() => setConfirmRemoveId(beneficiary.id)}
                        className={classNames(
                          'flex items-center justify-center w-8 h-8 rounded-lg',
                          'text-gray-400 dark:text-gray-500',
                          'hover:text-rose-600 dark:hover:text-rose-400',
                          'hover:bg-rose-50 dark:hover:bg-rose-950/20',
                          'transition-colors duration-150',
                          'focus:outline-none focus:ring-2 focus:ring-rose-500',
                        )}
                        aria-label={`Remove ${beneficiary.firstName} ${beneficiary.lastName}`}
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
              title="No beneficiaries added"
              description="Add beneficiaries to designate how your accounts should be distributed."
              actionLabel="Add Beneficiary"
              onAction={handleOpenAddModal}
              icon={
                <Users className="w-16 h-16 text-gray-300 dark:text-gray-600" />
              }
            />
          </motion.div>
        )}

        {/* Summary footer */}
        {hasBeneficiaries && (
          <motion.div
            variants={itemVariants}
            className="text-xs text-gray-500 dark:text-gray-400 text-right"
          >
            {beneficiaries.length} beneficiar{beneficiaries.length !== 1 ? 'ies' : 'y'} · {totalBeneficiaryShares}% allocated
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
            <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                About beneficiaries
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                Beneficiaries are the individuals who will receive the assets in your accounts.
                Share percentages should sum to 100% for complete allocation. You can add, edit,
                or remove beneficiaries at any time. Changes are saved automatically.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Add/Edit Beneficiary Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingBeneficiaryId ? 'Edit Beneficiary' : 'Add Beneficiary'}
        size="md"
        footer={
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
              {editingBeneficiaryId ? 'Save Changes' : 'Add Beneficiary'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* First Name */}
          <div>
            <label
              htmlFor="beneficiary-firstName"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
            >
              First Name
            </label>
            <div className="relative">
              <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
              <input
                id="beneficiary-firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="e.g., John"
                autoComplete="given-name"
                className={classNames(
                  'block w-full rounded-lg border pl-9 pr-3 py-2.5 text-sm',
                  'bg-white dark:bg-gray-800',
                  'text-gray-900 dark:text-gray-100',
                  'placeholder-gray-400 dark:placeholder-gray-500',
                  'transition-colors duration-150',
                  'focus:outline-none focus:ring-2 focus:ring-offset-1',
                  'dark:focus:ring-offset-gray-900',
                  formErrors.firstName
                    ? 'border-rose-400 dark:border-rose-500 focus:ring-rose-500'
                    : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500',
                )}
                aria-invalid={formErrors.firstName ? 'true' : 'false'}
                aria-describedby={formErrors.firstName ? 'beneficiary-firstName-error' : undefined}
              />
            </div>
            {formErrors.firstName && (
              <p
                id="beneficiary-firstName-error"
                className="mt-1.5 text-xs text-rose-600 dark:text-rose-400"
                role="alert"
              >
                {formErrors.firstName}
              </p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label
              htmlFor="beneficiary-lastName"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Last Name
            </label>
            <div className="relative">
              <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
              <input
                id="beneficiary-lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="e.g., Doe"
                autoComplete="family-name"
                className={classNames(
                  'block w-full rounded-lg border pl-9 pr-3 py-2.5 text-sm',
                  'bg-white dark:bg-gray-800',
                  'text-gray-900 dark:text-gray-100',
                  'placeholder-gray-400 dark:placeholder-gray-500',
                  'transition-colors duration-150',
                  'focus:outline-none focus:ring-2 focus:ring-offset-1',
                  'dark:focus:ring-offset-gray-900',
                  formErrors.lastName
                    ? 'border-rose-400 dark:border-rose-500 focus:ring-rose-500'
                    : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500',
                )}
                aria-invalid={formErrors.lastName ? 'true' : 'false'}
                aria-describedby={formErrors.lastName ? 'beneficiary-lastName-error' : undefined}
              />
            </div>
            {formErrors.lastName && (
              <p
                id="beneficiary-lastName-error"
                className="mt-1.5 text-xs text-rose-600 dark:text-rose-400"
                role="alert"
              >
                {formErrors.lastName}
              </p>
            )}
          </div>

          {/* Relationship */}
          <div>
            <label
              htmlFor="beneficiary-relationship"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Relationship
            </label>
            <select
              id="beneficiary-relationship"
              name="relationship"
              value={formData.relationship}
              onChange={handleChange}
              className={classNames(
                'block w-full rounded-lg border px-3 py-2.5 text-sm appearance-none',
                'bg-white dark:bg-gray-800',
                'text-gray-900 dark:text-gray-100',
                'transition-colors duration-150',
                'focus:outline-none focus:ring-2 focus:ring-offset-1',
                'dark:focus:ring-offset-gray-900',
                formErrors.relationship
                  ? 'border-rose-400 dark:border-rose-500 focus:ring-rose-500'
                  : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500',
              )}
              aria-invalid={formErrors.relationship ? 'true' : 'false'}
              aria-describedby={formErrors.relationship ? 'beneficiary-relationship-error' : undefined}
            >
              {RELATIONSHIP_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {formErrors.relationship && (
              <p
                id="beneficiary-relationship-error"
                className="mt-1.5 text-xs text-rose-600 dark:text-rose-400"
                role="alert"
              >
                {formErrors.relationship}
              </p>
            )}
          </div>

          {/* Date of Birth */}
          <div>
            <label
              htmlFor="beneficiary-dob"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Date of Birth
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
              <input
                id="beneficiary-dob"
                name="dob"
                type="date"
                value={formData.dob}
                onChange={handleChange}
                autoComplete="bday"
                className={classNames(
                  'block w-full rounded-lg border pl-9 pr-3 py-2.5 text-sm',
                  'bg-white dark:bg-gray-800',
                  'text-gray-900 dark:text-gray-100',
                  'transition-colors duration-150',
                  'focus:outline-none focus:ring-2 focus:ring-offset-1',
                  'dark:focus:ring-offset-gray-900',
                  formErrors.dob
                    ? 'border-rose-400 dark:border-rose-500 focus:ring-rose-500'
                    : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500',
                )}
                aria-invalid={formErrors.dob ? 'true' : 'false'}
                aria-describedby={formErrors.dob ? 'beneficiary-dob-error' : undefined}
              />
            </div>
            {formErrors.dob && (
              <p
                id="beneficiary-dob-error"
                className="mt-1.5 text-xs text-rose-600 dark:text-rose-400"
                role="alert"
              >
                {formErrors.dob}
              </p>
            )}
          </div>

          {/* Share Percentage */}
          <div>
            <label
              htmlFor="beneficiary-share"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Share Percentage
            </label>
            <div className="relative">
              <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
              <input
                id="beneficiary-share"
                name="share"
                type="number"
                min="1"
                max="100"
                step="1"
                value={formData.share}
                onChange={handleChange}
                placeholder={`Max ${availableShare}%`}
                inputMode="numeric"
                className={classNames(
                  'block w-full rounded-lg border pl-9 pr-3 py-2.5 text-sm',
                  'bg-white dark:bg-gray-800',
                  'text-gray-900 dark:text-gray-100',
                  'placeholder-gray-400 dark:placeholder-gray-500',
                  'transition-colors duration-150',
                  'focus:outline-none focus:ring-2 focus:ring-offset-1',
                  'dark:focus:ring-offset-gray-900',
                  formErrors.share
                    ? 'border-rose-400 dark:border-rose-500 focus:ring-rose-500'
                    : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500',
                )}
                aria-invalid={formErrors.share ? 'true' : 'false'}
                aria-describedby={formErrors.share ? 'beneficiary-share-error' : undefined}
              />
            </div>
            {formErrors.share && (
              <p
                id="beneficiary-share-error"
                className="mt-1.5 text-xs text-rose-600 dark:text-rose-400"
                role="alert"
              >
                {formErrors.share}
              </p>
            )}
            <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
              Available: {availableShare}% of 100%
            </p>
          </div>

          {/* Info note */}
          <div className="flex items-start gap-2 pt-2">
            <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Beneficiary shares should sum to 100% for complete allocation.
              You can adjust shares at any time.
            </p>
          </div>
        </form>
      </Modal>
    </PageTransition>
  );
}

export default BeneficiariesPage;