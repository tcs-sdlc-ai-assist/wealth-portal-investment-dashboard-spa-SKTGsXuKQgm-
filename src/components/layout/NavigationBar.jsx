/**
 * Main navigation bar with responsive collapse
 * Fixed top navigation bar with glassmorphism styling, responsive hamburger drawer,
 * animated active route underline, and profile avatar dropdown.
 * Implements SCRUM-20314: Top Navigation Bar
 * Implements SCRUM-20319: Responsive Design
 * @module NavigationBar
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  LayoutDashboard,
  Briefcase,
  Activity,
  FileText,
  ShoppingBag,
  LogOut,
  User,
  Settings,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
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
 * Profile dropdown menu component.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the dropdown is open
 * @param {function} props.onClose - Callback to close the dropdown
 * @param {function} props.onNavigate - Callback to navigate to a route
 * @param {function} props.onLogout - Callback to log out
 * @returns {JSX.Element}
 */
function ProfileDropdown({ isOpen, onClose, onNavigate, onLogout }) {
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

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
              'absolute right-0 top-full mt-2 w-48 rounded-lg border',
              'bg-white/90 dark:bg-gray-900/90',
              'backdrop-blur-md',
              'border-gray-200/60 dark:border-gray-700/60',
              'shadow-lg dark:shadow-gray-900/40',
              'py-1 z-50',
            )}
            role="menu"
            aria-orientation="vertical"
          >
            <button
              type="button"
              onClick={() => {
                onNavigate(ROUTES.PROFILE);
                onClose();
              }}
              className={classNames(
                'flex w-full items-center gap-2.5 px-4 py-2 text-sm',
                'text-gray-700 dark:text-gray-300',
                'hover:bg-gray-100 dark:hover:bg-gray-800',
                'transition-colors duration-150',
              )}
              role="menuitem"
            >
              <User className="w-4 h-4" />
              <span>Profile</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onNavigate(ROUTES.SETTINGS);
                onClose();
              }}
              className={classNames(
                'flex w-full items-center gap-2.5 px-4 py-2 text-sm',
                'text-gray-700 dark:text-gray-300',
                'hover:bg-gray-100 dark:hover:bg-gray-800',
                'transition-colors duration-150',
              )}
              role="menuitem"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
            <div className="my-1 border-t border-gray-200 dark:border-gray-700" />
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
                'transition-colors duration-150',
              )}
              role="menuitem"
            >
              <LogOut className="w-4 h-4" />
              <span>Log out</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Hamburger drawer component for mobile navigation.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the drawer is open
 * @param {function} props.onClose - Callback to close the drawer
 * @param {function} props.onNavigate - Callback to navigate to a route
 * @param {function} props.onLogout - Callback to log out
 * @param {Object|null} props.currentUser - The current authenticated user
 * @returns {JSX.Element}
 */
function HamburgerDrawer({ isOpen, onClose, onNavigate, onLogout, currentUser }) {
  const location = useLocation();

  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

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

/**
 * Main navigation bar component.
 * Fixed top navigation bar with glassmorphism styling, responsive hamburger drawer,
 * animated active route underline via Framer Motion layoutId, and profile avatar dropdown.
 *
 * @returns {JSX.Element}
 *
 * @example
 * <NavigationBar />
 */
export function NavigationBar() {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const profileButtonRef = useRef(null);

  /**
   * Handles navigation to a given route.
   * @param {string} path - The route path to navigate to
   */
  const handleNavigate = useCallback(
    (path) => {
      navigate(path);
    },
    [navigate],
  );

  /**
   * Handles user logout.
   */
  const handleLogout = useCallback(() => {
    logout();
    navigate(ROUTES.LOGIN);
  }, [logout, navigate]);

  /**
   * Opens the mobile drawer.
   */
  const openDrawer = useCallback(() => {
    setIsDrawerOpen(true);
  }, []);

  /**
   * Closes the mobile drawer.
   */
  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  /**
   * Toggles the profile dropdown.
   */
  const toggleDropdown = useCallback(() => {
    setIsDropdownOpen((prev) => !prev);
  }, []);

  /**
   * Closes the profile dropdown.
   */
  const closeDropdown = useCallback(() => {
    setIsDropdownOpen(false);
  }, []);

  // Close drawer on route change
  useEffect(() => {
    setIsDrawerOpen(false);
    setIsDropdownOpen(false);
  }, [location.pathname]);

  // Don't render navigation bar on login/register pages
  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <header
        className={classNames(
          'fixed top-0 left-0 right-0 z-30',
          'bg-white/80 dark:bg-gray-900/80',
          'backdrop-blur-md',
          'border-b border-gray-200/60 dark:border-gray-700/60',
          'shadow-sm dark:shadow-gray-900/20',
        )}
        role="banner"
      >
        <nav
          className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
          role="navigation"
          aria-label="Main navigation"
        >
          {/* Left section: hamburger + logo */}
          <div className="flex items-center gap-3">
            {/* Hamburger button (mobile only) */}
            <button
              type="button"
              onClick={openDrawer}
              className={classNames(
                'rounded-lg p-2 md:hidden',
                'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
                'hover:bg-gray-100 dark:hover:bg-gray-800',
                'transition-colors duration-150',
                'focus:outline-none focus:ring-2 focus:ring-indigo-500',
              )}
              aria-label="Open navigation menu"
              aria-expanded={isDrawerOpen}
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Logo */}
            <button
              type="button"
              onClick={() => handleNavigate(ROUTES.DASHBOARD)}
              className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg px-1"
              aria-label="Go to dashboard"
            >
              <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                {import.meta.env.VITE_APP_TITLE || 'Wealth Portal'}
              </span>
            </button>
          </div>

          {/* Center section: nav links (desktop only) */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = location.pathname === link.path;

              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={classNames(
                    'relative px-3 py-2 text-sm font-medium rounded-lg',
                    'transition-colors duration-150',
                    isActive
                      ? 'text-indigo-700 dark:text-indigo-300'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800',
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span>{link.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full"
                      transition={{
                        type: 'spring',
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}
                </NavLink>
              );
            })}
          </div>

          {/* Right section: theme toggle + profile */}
          <div className="flex items-center gap-2">
            <div className="hidden md:block">
              <ThemeToggle size="sm" />
            </div>

            {/* Profile avatar button */}
            {currentUser && (
              <div className="relative">
                <button
                  ref={profileButtonRef}
                  type="button"
                  onClick={toggleDropdown}
                  className={classNames(
                    'flex items-center gap-2 rounded-lg p-1.5',
                    'hover:bg-gray-100 dark:hover:bg-gray-800',
                    'transition-colors duration-150',
                    'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
                    'dark:focus:ring-offset-gray-900',
                  )}
                  aria-label="Open profile menu"
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="true"
                >
                  <img
                    src={currentUser.avatar || `https://api.dicebear.com/8.x/avataaars/svg?seed=${currentUser.firstName}`}
                    alt={`${currentUser.firstName} ${currentUser.lastName}`}
                    className="w-8 h-8 rounded-full border-2 border-gray-200 dark:border-gray-700"
                  />
                  <span className="hidden lg:block text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[120px] truncate">
                    {currentUser.firstName}
                  </span>
                  <ChevronDown
                    className={classNames(
                      'hidden lg:block w-4 h-4 text-gray-400 transition-transform duration-200',
                      isDropdownOpen && 'rotate-180',
                    )}
                  />
                </button>

                <ProfileDropdown
                  isOpen={isDropdownOpen}
                  onClose={closeDropdown}
                  onNavigate={handleNavigate}
                  onLogout={handleLogout}
                />
              </div>
            )}
          </div>
        </nav>
      </header>

      {/* Mobile drawer */}
      <HamburgerDrawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        currentUser={currentUser}
      />

      {/* Spacer to offset fixed header */}
      <div className="h-16" />
    </>
  );
}

export default NavigationBar;