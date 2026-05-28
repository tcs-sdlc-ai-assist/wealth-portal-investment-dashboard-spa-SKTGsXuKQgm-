/**
 * Mobile responsive navigation drawer component
 * Slides in from the left with Framer Motion animation.
 * Contains all nav links, theme toggle, and logout button.
 * Closes on link click, outside click, or escape key.
 * Includes focus trap and ARIA attributes.
 * Implements SCRUM-20314: Top Navigation Bar
 * Implements SCRUM-20319: Responsive Design
 * @module HamburgerDrawer
 */

import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import {
  X,
  LayoutDashboard,
  Briefcase,
  Activity,
  FileText,
  ShoppingBag,
  LogOut,
  User,
  Settings,
} from 'lucide-react';
import { ThemeToggle } from '../shared/ThemeToggle.jsx';
import { classNames } from '../../utils/helpers.js';
import { ROUTES } from '../../utils/constants.js';

/**
 * Navigation link definitions.
 * @type {Array<{ label: string, path: string, icon: React.ComponentType }>}
 */
const NAV_LINKS = [
  { label: 'Accounts', path: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { label: 'Holdings', path: ROUTES.ACCOUNTS, icon: Briefcase },
  { label: 'Activity', path: ROUTES.TRANSACTIONS, icon: Activity },
  { label: 'Documents', path: ROUTES.DOCUMENTS, icon: FileText },
  { label: 'Products & Services', path: ROUTES.PRODUCTS, icon: ShoppingBag },
];

/**
 * Focusable element selector string for focus trap.
 * @type {string}
 */
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'button:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

/**
 * Drawer animation variants for the mobile hamburger menu.
 * @type {Object}
 */
const drawerVariants = {
  hidden: { x: '-100%', opacity: 0 },
  visible: { x: 0, opacity: 1 },
  exit: { x: '-100%', opacity: 0 },
};

/**
 * Drawer transition configuration.
 * @type {Object}
 */
const drawerTransition = {
  type: 'spring',
  stiffness: 350,
  damping: 30,
};

/**
 * Backdrop animation variants for the mobile drawer overlay.
 * @type {Object}
 */
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

/**
 * Hamburger drawer component for mobile navigation.
 * Slides in from the left with Framer Motion animation, contains all
 * nav links, user info, theme toggle, and logout button. Implements
 * focus trap, escape key close, outside click close, and ARIA attributes.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the drawer is open
 * @param {function} props.onClose - Callback to close the drawer
 * @param {function} props.onNavigate - Callback to navigate to a route
 * @param {function} props.onLogout - Callback to log out
 * @param {Object|null} props.currentUser - The current authenticated user
 * @returns {JSX.Element}
 *
 * @example
 * <HamburgerDrawer
 *   isOpen={isDrawerOpen}
 *   onClose={closeDrawer}
 *   onNavigate={handleNavigate}
 *   onLogout={handleLogout}
 *   currentUser={currentUser}
 * />
 */
export function HamburgerDrawer({ isOpen, onClose, onNavigate, onLogout, currentUser }) {
  const location = useLocation();
  const drawerRef = useRef(null);

  /**
   * Returns all focusable elements within the drawer.
   * @returns {HTMLElement[]}
   */
  const getFocusableElements = useCallback(() => {
    if (!drawerRef.current) {
      return [];
    }
    return Array.from(drawerRef.current.querySelectorAll(FOCUSABLE_SELECTOR));
  }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Handle escape key close and focus trap
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key === 'Tab') {
        const focusableElements = getFocusableElements();
        if (focusableElements.length === 0) {
          event.preventDefault();
          return;
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, getFocusableElements]);

  // Focus the first focusable element when drawer opens
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const timer = setTimeout(() => {
      const focusableElements = getFocusableElements();
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }, 50);

    return () => {
      clearTimeout(timer);
    };
  }, [isOpen, getFocusableElements]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="drawer-backdrop"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={backdropVariants}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer panel */}
          <motion.nav
            key="drawer-panel"
            ref={drawerRef}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={drawerVariants}
            transition={drawerTransition}
            className={classNames(
              'fixed inset-y-0 left-0 z-50 w-72 md:hidden',
              'bg-white/95 dark:bg-gray-900/95',
              'backdrop-blur-lg',
              'border-r border-gray-200/60 dark:border-gray-700/60',
              'shadow-xl dark:shadow-gray-900/50',
              'flex flex-col',
            )}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-700">
              <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                {import.meta.env.VITE_APP_TITLE || 'Wealth Portal'}
              </span>
              <button
                type="button"
                onClick={onClose}
                className={classNames(
                  'rounded-lg p-1.5',
                  'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
                  'hover:bg-gray-100 dark:hover:bg-gray-800',
                  'transition-colors duration-150',
                  'focus:outline-none focus:ring-2 focus:ring-indigo-500',
                )}
                aria-label="Close navigation menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User info */}
            {currentUser && (
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <img
                    src={currentUser.avatar || `https://api.dicebear.com/8.x/avataaars/svg?seed=${currentUser.firstName}`}
                    alt={`${currentUser.firstName} ${currentUser.lastName}`}
                    className="w-10 h-10 rounded-full border-2 border-indigo-200 dark:border-indigo-800"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {currentUser.firstName} {currentUser.lastName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {currentUser.email}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Nav links */}
            <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
              {NAV_LINKS.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;

                return (
                  <button
                    key={link.path}
                    type="button"
                    onClick={() => {
                      onNavigate(link.path);
                      onClose();
                    }}
                    className={classNames(
                      'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium',
                      'transition-colors duration-150',
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
                    )}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className={classNames(
                      'w-5 h-5 flex-shrink-0',
                      isActive
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-gray-400 dark:text-gray-500',
                    )} />
                    <span>{link.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Drawer footer */}
            <div className="border-t border-gray-200 dark:border-gray-700 px-3 py-3 space-y-1">
              <button
                type="button"
                onClick={() => {
                  onNavigate(ROUTES.PROFILE);
                  onClose();
                }}
                className={classNames(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium',
                  'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
                  'transition-colors duration-150',
                )}
              >
                <User className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                <span>Profile</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onNavigate(ROUTES.SETTINGS);
                  onClose();
                }}
                className={classNames(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium',
                  'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
                  'transition-colors duration-150',
                )}
              >
                <Settings className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                <span>Settings</span>
              </button>
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Theme</span>
                <ThemeToggle size="sm" />
              </div>
              <button
                type="button"
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className={classNames(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium',
                  'text-rose-600 dark:text-rose-400',
                  'hover:bg-rose-50 dark:hover:bg-rose-950/20',
                  'transition-colors duration-150',
                )}
              >
                <LogOut className="w-5 h-5" />
                <span>Log out</span>
              </button>
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
}

HamburgerDrawer.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onNavigate: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
  currentUser: PropTypes.shape({
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    email: PropTypes.string,
    avatar: PropTypes.string,
  }),
};

export default HamburgerDrawer;