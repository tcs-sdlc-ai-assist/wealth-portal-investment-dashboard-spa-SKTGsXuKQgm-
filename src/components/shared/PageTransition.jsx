/**
 * Animated page transition wrapper component
 * Provides Framer Motion fade-and-slide-up animation for page transitions.
 * Wraps page content with AnimatePresence and motion.div for consistent
 * enter/exit animations across all page components.
 * Implements SCRUM-20319: Micro-interactions and Page Transitions
 * @module PageTransition
 */

import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import { classNames } from '../../utils/helpers.js';

/**
 * Default animation variants for page transitions.
 * Provides a fade-and-slide-up effect on enter and fade-and-slide-down on exit.
 *
 * @type {Object}
 */
const pageVariants = {
  initial: {
    opacity: 0,
    y: 12,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: -12,
  },
};

/**
 * Default transition configuration for page animations.
 *
 * @type {Object}
 */
const pageTransition = {
  type: 'tween',
  ease: 'easeOut',
  duration: 0.3,
};

/**
 * Animated page transition wrapper component.
 * Wraps page content with Framer Motion's motion.div to provide
 * consistent fade-and-slide-up enter animations and fade-and-slide-down
 * exit animations. Should be used as the outermost wrapper inside each
 * page component.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - The page content to animate
 * @param {string} [props.className] - Additional Tailwind classes for the wrapper
 * @param {string} [props.key] - Unique key for AnimatePresence to detect page changes
 * @returns {JSX.Element}
 *
 * @example
 * function DashboardPage() {
 *   return (
 *     <PageTransition>
 *       <h1>Dashboard</h1>
 *     </PageTransition>
 *   );
 * }
 */
export function PageTransition({ children, className }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        transition={pageTransition}
        className={classNames('w-full', className)}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

PageTransition.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default PageTransition;