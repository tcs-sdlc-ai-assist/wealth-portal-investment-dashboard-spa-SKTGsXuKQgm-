/**
 * Profile avatar dropdown menu component
 * Triggered by avatar click, shows links to Profile, Communication Preferences,
 * Security, Bank Management, Beneficiaries, Cost Basis, plus Theme Toggle and Logout.
 * Uses glassmorphism styling with backdrop-blur-md and shadow-xl.
 * Closes on outside click or escape key.
 * Implements SCRUM-20317: Profile Dropdown Menu
 * @module ProfileDropdown
 */

import { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import {
  User,
  Settings,
  Shield,
  Landmark,
  Users,
  Calculator,
  Mail,
  LogOut,
} from 'lucide-react';
import { ThemeToggle } from '../shared/ThemeToggle.jsx';
import { classNames } from '../../utils/helpers.js';
import { ROUTES } from '../../utils/constants.js';

/**
 * Focusable element selector string for keyboard navigation.
 * @type {string}
 */
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

/**
 * Profile dropdown animation variants.
 * @type {Object}
 */
const dropdownVariants = {
  hidden: { opacity: 0, scale: 0.95, y: -4 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: -4 },
};

/**
 * Profile dropdown transition configuration.
 * @type {Object}
 */
const dropdownTransition = {
  type: 'spring',
  stiffness: 400,
  damping: 25,
};

/**
 * Menu item definitions for the profile dropdown.
 * @type {Array<{ label: string, path: string, icon: React.ComponentType }>}
 */
const MENU_ITEMS = [
  { label: 'Profile', path: ROUTES.PROFILE, icon: User },
  { label: 'Communication Preferences', path: ROUTES.SETTINGS, icon: Mail },
  { label: 'Security', path: ROUTES.SETTINGS, icon: Shield },
  { label: 'Bank Management', path: ROUTES.SETTINGS, icon: Landmark },
  { label: 'Beneficiaries', path: ROUTES.SETTINGS, icon: Users },
  { label: 'Cost Basis', path: ROUTES.SETTINGS, icon: Calculator },
];

/**
 * Profile dropdown menu component.
 * Renders a glassmorphism-styled dropdown with links to Profile,
 * Communication Preferences, Security, Bank Management, Beneficiaries,
 * Cost Basis, plus Theme Toggle and Logout. Supports keyboard navigation,
 * outside click close, escape key close, and ARIA menu roles.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the dropdown is open
 * @param {function} props.onClose - Callback to close the dropdown
 * @param {function} props.onNavigate - Callback to navigate to a route
 * @param {function} props.onLogout - Callback to log out
 * @returns {JSX.Element}
 *
 * @example
 * <ProfileDropdown
 *   isOpen={isDropdownOpen}
 *   onClose={closeDropdown}
 *   onNavigate={handleNavigate}
 *   onLogout={handleLogout}
 * />
 */
export function ProfileDropdown({ isOpen, onClose, onNavigate, onLogout }) {
  const dropdownRef = useRef(null);

  /**
   * Returns all focusable elements within the dropdown.
   * @returns {HTMLElement[]}
   */
  const getFocusableElements = useCallback(() => {
    if (!dropdownRef.current) {
      return [];
    }
    return Array.from(dropdownRef.current.querySelectorAll(FOCUSABLE_SELECTOR));
  }, []);

  // Handle outside click
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    }

    // Use a slight delay to avoid closing immediately on the same click that opened it
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle escape key and keyboard navigation
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
        return;
      }

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) {
        return;
      }

      const currentIndex = focusableElements.indexOf(document.activeElement);

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        const nextIndex = currentIndex < focusableElements.length - 1 ? currentIndex + 1 : 0;
        focusableElements[nextIndex].focus();
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : focusableElements.length - 1;
        focusableElements[prevIndex].focus();
      }

      if (event.key === 'Tab') {
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

      if (event.key === 'Home') {
        event.preventDefault();
        focusableElements[0].focus();
      }

      if (event.key === 'End') {
        event.preventDefault();
        focusableElements[focusableElements.length - 1].focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, getFocusableElements]);

  // Focus the first menu item when dropdown opens
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
    <div ref={dropdownRef} className="relative">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={dropdownVariants}
            transition={dropdownTransition}
            className={classNames(
              'absolute right-0 top-full mt-2 w-56 rounded-xl border',
              'bg-white/90 dark:bg-gray-900/90',
              'backdrop-blur-md',
              'border-gray-200/60 dark:border-gray-700/60',
              'shadow-xl dark:shadow-gray-900/50',
              'py-1 z-50',
            )}
            role="menu"
            aria-orientation="vertical"
            aria-label="Profile menu"
          >
            {/* Menu items */}
            {MENU_ITEMS.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    onNavigate(item.path);
                    onClose();
                  }}
                  className={classNames(
                    'flex w-full items-center gap-2.5 px-4 py-2 text-sm',
                    'text-gray-700 dark:text-gray-300',
                    'hover:bg-gray-100 dark:hover:bg-gray-800',
                    'focus:bg-gray-100 dark:focus:bg-gray-800',
                    'focus:outline-none',
                    'transition-colors duration-150',
                  )}
                  role="menuitem"
                  tabIndex={-1}
                >
                  <Icon className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Divider */}
            <div className="my-1 border-t border-gray-200 dark:border-gray-700" />

            {/* Theme toggle row */}
            <div
              className={classNames(
                'flex items-center justify-between px-4 py-2',
              )}
              role="menuitem"
            >
              <div className="flex items-center gap-2.5">
                <Settings className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Theme</span>
              </div>
              <ThemeToggle size="sm" />
            </div>

            {/* Divider */}
            <div className="my-1 border-t border-gray-200 dark:border-gray-700" />

            {/* Logout */}
            <button
              type="button"
              onClick={() => {
                onLogout();
                onClose();
              }}
              className={classNames(
                'flex w-full items-center gap-2.5 px-4 py-2 text-sm',
                'text-rose-600 dark:text-rose-400',
                'hover:bg-rose-50 dark:hover:bg-rose-950/20',
                'focus:bg-rose-50 dark:focus:bg-rose-950/20',
                'focus:outline-none',
                'transition-colors duration-150',
              )}
              role="menuitem"
              tabIndex={-1}
            >
              <LogOut className="w-4 h-4 flex-shrink-0" />
              <span>Log out</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

ProfileDropdown.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onNavigate: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
};

export default ProfileDropdown;