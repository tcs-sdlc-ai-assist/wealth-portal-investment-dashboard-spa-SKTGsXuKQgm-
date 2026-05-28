/**
 * Authenticated page layout wrapper component
 * Renders NavigationBar at top and children content below with proper
 * padding/margin to account for the fixed navigation bar.
 * Wraps children in AnimatePresence for page transitions.
 * Implements SCRUM-20314: Top Navigation Bar
 * Implements SCRUM-20319: Responsive Design
 * @module AppLayout
 */

import { useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import { NavigationBar } from './NavigationBar.jsx';
import { classNames } from '../../utils/helpers.js';

/**
 * Authenticated page layout wrapper component.
 * Renders the NavigationBar fixed at the top and the page content below
 * with responsive horizontal padding. Uses AnimatePresence keyed by
 * the current route pathname to enable page transition animations.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - The page content to render below the navigation bar
 * @param {string} [props.className] - Additional Tailwind classes for the main content area
 * @returns {JSX.Element}
 *
 * @example
 * <AppLayout>
 *   <DashboardPage />
 * </AppLayout>
 */
export function AppLayout({ children, className }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <NavigationBar />

      <main
        className={classNames(
          'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6',
          className,
        )}
      >
        <AnimatePresence mode="wait">
          <div key={location.pathname}>
            {children}
          </div>
        </AnimatePresence>
      </main>
    </div>
  );
}

AppLayout.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default AppLayout;