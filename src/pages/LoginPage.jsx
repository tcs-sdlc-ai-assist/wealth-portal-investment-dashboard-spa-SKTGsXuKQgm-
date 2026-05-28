/**
 * Mock login page with pre-seeded user card selection
 * Displays a grid of user cards with avatar, name, account type badge,
 * and last login timestamp. Cards scale on hover via Framer Motion.
 * Clicking a card logs in and navigates to /accounts.
 * Implements SCRUM-20315: Mock Login UI
 * @module LoginPage
 */

import { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { ThemeToggle } from '../components/shared/ThemeToggle.jsx';
import { classNames } from '../utils/helpers.js';
import { ROUTES } from '../utils/constants.js';
import { formatRelativeDate } from '../utils/formatters.js';

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
 * Deterministic color palette for avatar backgrounds based on user index.
 * @type {Array<{ bg: string, text: string }>}
 */
const AVATAR_COLORS = [
  { bg: 'bg-indigo-500', text: 'text-white' },
  { bg: 'bg-emerald-500', text: 'text-white' },
  { bg: 'bg-rose-500', text: 'text-white' },
  { bg: 'bg-amber-500', text: 'text-white' },
  { bg: 'bg-sky-500', text: 'text-white' },
  { bg: 'bg-violet-500', text: 'text-white' },
  { bg: 'bg-teal-500', text: 'text-white' },
  { bg: 'bg-orange-500', text: 'text-white' },
];

/**
 * Container animation variants for staggered card reveal.
 * @type {Object}
 */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
    },
  },
};

/**
 * Individual card animation variants.
 * @type {Object}
 */
const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24,
    },
  },
};

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
 * Mock login page component.
 * Displays a grid of pre-seeded user cards. Clicking a card logs in
 * the user and navigates to the accounts page. Includes a theme toggle
 * and a link to the signup page.
 *
 * @returns {JSX.Element}
 */
export function LoginPage() {
  const { allUsers, login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [loadingUserId, setLoadingUserId] = useState(null);

  /**
   * Handles clicking a user card to log in.
   *
   * @param {Object} user - The user object to log in as
   */
  const handleUserSelect = useCallback(
    (user) => {
      if (loadingUserId) {
        return;
      }

      setLoadingUserId(user.id);

      const result = login(user.email, user.password);

      if (result.success) {
        addToast({
          message: `Welcome back, ${user.firstName}!`,
          type: 'success',
        });
        navigate(ROUTES.ACCOUNTS);
      } else {
        addToast({
          message: result.error || 'Login failed. Please try again.',
          type: 'error',
        });
        setLoadingUserId(null);
      }
    },
    [login, navigate, addToast, loadingUserId],
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950/20">
      {/* Theme toggle */}
      <div className="fixed top-4 right-4 z-20">
        <ThemeToggle size="md" />
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={headerVariants}
          className="text-center mb-10 sm:mb-12"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            {import.meta.env.VITE_APP_TITLE || 'Wealth Portal'}
          </h1>
          <p className="mt-3 text-base sm:text-lg text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Select an account to sign in. Choose any of the pre-seeded demo users below.
          </p>
        </motion.div>

        {/* User cards grid */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
        >
          {allUsers.map((user, index) => {
            const initials = getInitials(user.firstName, user.lastName);
            const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length];
            const badgeClasses = getAccountTypeBadgeClasses(user.accountType);
            const isLoading = loadingUserId === user.id;

            return (
              <motion.button
                key={user.id}
                type="button"
                variants={cardVariants}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleUserSelect(user)}
                disabled={loadingUserId !== null}
                className={classNames(
                  'relative flex flex-col items-center gap-3 rounded-xl border p-6',
                  'bg-white/80 dark:bg-gray-900/80',
                  'backdrop-blur-md',
                  'border-gray-200/60 dark:border-gray-700/60',
                  'shadow-sm hover:shadow-lg dark:shadow-gray-900/20 dark:hover:shadow-gray-900/40',
                  'transition-shadow duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
                  'dark:focus:ring-offset-gray-900',
                  'cursor-pointer',
                  'disabled:opacity-60 disabled:cursor-not-allowed',
                  isLoading && 'ring-2 ring-indigo-500',
                )}
                aria-label={`Sign in as ${user.firstName} ${user.lastName}`}
              >
                {/* Avatar circle with initials */}
                <div
                  className={classNames(
                    'flex items-center justify-center w-16 h-16 rounded-full text-xl font-bold',
                    avatarColor.bg,
                    avatarColor.text,
                    'shadow-md',
                  )}
                  aria-hidden="true"
                >
                  {initials}
                </div>

                {/* Name */}
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                    {user.email}
                  </p>
                </div>

                {/* Account type badge */}
                <span
                  className={classNames(
                    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                    badgeClasses.bg,
                    badgeClasses.text,
                  )}
                >
                  {user.accountType}
                </span>

                {/* Last login */}
                {user.lastLoginAt && (
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Last login: {formatRelativeDate(user.lastLoginAt)}
                  </p>
                )}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm">
                    <LogIn className="w-6 h-6 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                  </div>
                )}
              </motion.button>
            );
          })}
        </motion.div>

        {/* Footer: link to signup */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="mt-10 text-center"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Don&apos;t have an account?{' '}
            <Link
              to={ROUTES.REGISTER}
              className={classNames(
                'inline-flex items-center gap-1 font-medium',
                'text-indigo-600 dark:text-indigo-400',
                'hover:text-indigo-700 dark:hover:text-indigo-300',
                'underline underline-offset-2 decoration-indigo-300 dark:decoration-indigo-700',
                'hover:decoration-indigo-500 dark:hover:decoration-indigo-400',
                'transition-colors duration-150',
              )}
            >
              <UserPlus className="w-4 h-4" />
              <span>Create one</span>
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default LoginPage;