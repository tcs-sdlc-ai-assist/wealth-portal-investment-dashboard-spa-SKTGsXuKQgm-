/**
 * Communication preferences settings page with toggle switches
 * Each toggle persists immediately to localStorage via useProfileStore.
 * Uses Framer Motion for toggle animation. Wrapped in PageTransition.
 * Implements SCRUM-20326: Profile & Settings Pages
 * @module CommunicationPreferences
 */

import { useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Mail,
  MessageSquare,
  FileText,
  Megaphone,
  Bell,
} from 'lucide-react';
import { useProfileStore } from '../../hooks/useProfileStore.js';
import { useSkeletonDelay } from '../../hooks/useSkeletonDelay.js';
import { useToast } from '../../context/ToastContext.jsx';
import { PageTransition } from '../../components/shared/PageTransition.jsx';
import { SkeletonLoader } from '../../components/shared/SkeletonLoader.jsx';
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
 * Toggle switch definitions for communication preferences.
 * @type {Array<{ key: string, label: string, description: string, icon: React.ComponentType }>}
 */
const PREFERENCE_TOGGLES = [
  {
    key: 'emailNotifications',
    label: 'Email Notifications',
    description: 'Receive account updates, transaction confirmations, and security alerts via email.',
    icon: Mail,
  },
  {
    key: 'smsAlerts',
    label: 'SMS Alerts',
    description: 'Get real-time text message alerts for important account activity and security events.',
    icon: MessageSquare,
  },
  {
    key: 'monthlyStatements',
    label: 'Monthly Statements',
    description: 'Receive monthly account statements and summaries delivered to your inbox.',
    icon: FileText,
  },
  {
    key: 'marketingEmails',
    label: 'Marketing Communications',
    description: 'Stay informed about new products, services, promotions, and financial insights.',
    icon: Megaphone,
  },
  {
    key: 'pushNotifications',
    label: 'Push Notifications',
    description: 'Enable browser push notifications for real-time account alerts and updates.',
    icon: Bell,
  },
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
 * Communication preferences page component.
 * Renders toggle switches for email notifications, SMS alerts,
 * monthly statements, marketing communications, and push notifications.
 * Each toggle persists immediately to localStorage via useProfileStore.
 *
 * @returns {JSX.Element}
 */
export function CommunicationPreferences() {
  const { profile, updateCommunicationPreferences } = useProfileStore();
  const { addToast } = useToast();
  const loading = useSkeletonDelay();

  /**
   * Handles toggling a communication preference.
   * Persists the change immediately and shows a success toast.
   *
   * @param {string} key - The preference key to toggle
   */
  const handleToggle = useCallback(
    (key) => {
      if (!profile || !profile.communicationPreferences) {
        return;
      }

      const currentValue = profile.communicationPreferences[key] || false;
      const newValue = !currentValue;

      updateCommunicationPreferences({
        [key]: newValue,
      });

      const toggle = PREFERENCE_TOGGLES.find((t) => t.key === key);
      const label = toggle ? toggle.label : key;

      addToast({
        message: `${label} ${newValue ? 'enabled' : 'disabled'}.`,
        type: 'success',
      });
    },
    [profile, updateCommunicationPreferences, addToast],
  );

  if (loading) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <SkeletonLoader variant="text" lines={2} />
          <SkeletonLoader variant="list" rows={5} />
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

  const preferences = profile.communicationPreferences || {};

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
            Communication Preferences
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage how you receive notifications and communications from us.
          </p>
        </motion.div>

        {/* Preferences card */}
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
            <Bell className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Notification Settings
            </h3>
          </div>

          {/* Toggle list */}
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {PREFERENCE_TOGGLES.map((toggle) => {
              const Icon = toggle.icon;
              const isChecked = preferences[toggle.key] === true;

              return (
                <motion.div
                  key={toggle.key}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 24,
                  }}
                  className={classNames(
                    'flex items-center gap-4 px-6 py-4',
                    'hover:bg-gray-50 dark:hover:bg-gray-800/40',
                    'transition-colors duration-150',
                  )}
                >
                  {/* Icon */}
                  <div
                    className={classNames(
                      'flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0',
                      isChecked
                        ? 'bg-indigo-100 dark:bg-indigo-950/30'
                        : 'bg-gray-100 dark:bg-gray-800',
                    )}
                  >
                    <Icon
                      className={classNames(
                        'w-5 h-5',
                        isChecked
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-gray-400 dark:text-gray-500',
                      )}
                    />
                  </div>

                  {/* Label and description */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {toggle.label}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                      {toggle.description}
                    </p>
                  </div>

                  {/* Toggle switch */}
                  <ToggleSwitch
                    checked={isChecked}
                    onChange={() => handleToggle(toggle.key)}
                    label={`Toggle ${toggle.label}`}
                  />
                </motion.div>
              );
            })}
          </div>
        </motion.div>

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
            <Mail className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                About your preferences
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                Changes are saved automatically. You can update your preferences at any time.
                Important security and account alerts may still be sent regardless of your preferences
                to ensure the safety of your account.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </PageTransition>
  );
}

export default CommunicationPreferences;