/**
 * Theme light/dark toggle button component
 * Uses Lucide Sun/Moon icons with Framer Motion rotation animation on toggle.
 * Implements SCRUM-20318: Theme Support and Toggle
 * @module ThemeToggle
 */

import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.jsx';
import { classNames } from '../../utils/helpers.js';

/**
 * Animation variants for the icon rotation transition.
 * @type {Object}
 */
const iconVariants = {
  initial: {
    opacity: 0,
    rotate: -90,
    scale: 0.5,
  },
  animate: {
    opacity: 1,
    rotate: 0,
    scale: 1,
  },
  exit: {
    opacity: 0,
    rotate: 90,
    scale: 0.5,
  },
};

/**
 * Transition configuration for the icon animation.
 * @type {Object}
 */
const iconTransition = {
  type: 'spring',
  stiffness: 300,
  damping: 20,
};

/**
 * Theme toggle button component that switches between light and dark mode.
 * Renders a Sun icon in dark mode and a Moon icon in light mode with a
 * Framer Motion rotation animation on toggle. Fully accessible with
 * aria-label describing the current action.
 *
 * @param {Object} props
 * @param {string} [props.className] - Additional Tailwind classes for the button
 * @param {'sm' | 'md' | 'lg'} [props.size='md'] - Button size variant
 * @returns {JSX.Element}
 *
 * @example
 * <ThemeToggle />
 *
 * @example
 * <ThemeToggle size="sm" className="ml-2" />
 */
export function ThemeToggle({ className, size = 'md' }) {
  const { isDark, toggleTheme } = useTheme();

  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5',
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const buttonSize = sizeClasses[size] || sizeClasses.md;
  const iconSize = iconSizeClasses[size] || iconSizeClasses.md;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={classNames(
        'relative rounded-lg',
        buttonSize,
        'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
        'hover:bg-gray-100 dark:hover:bg-gray-800',
        'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
        'dark:focus:ring-offset-gray-900',
        'transition-colors duration-150',
        className,
      )}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.span
            key="sun"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={iconVariants}
            transition={iconTransition}
            className="block"
          >
            <Sun className={iconSize} />
          </motion.span>
        ) : (
          <motion.span
            key="moon"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={iconVariants}
            transition={iconTransition}
            className="block"
          >
            <Moon className={iconSize} />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

ThemeToggle.propTypes = {
  className: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
};

export default ThemeToggle;