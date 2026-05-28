/**
 * 404 Not Found page with custom SVG illustration and CTA to dashboard
 * Displays a themed illustration, heading, description, and a button
 * linking back to the accounts dashboard. Wrapped in PageTransition.
 * @module NotFoundPage
 */

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home } from 'lucide-react';
import { PageTransition } from '../components/shared/PageTransition.jsx';
import { classNames } from '../utils/helpers.js';
import { ROUTES } from '../utils/constants.js';

/**
 * Container animation variants for staggered children.
 * @type {Object}
 */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
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
 * Custom SVG illustration for the 404 page.
 * Themed to support both light and dark modes.
 *
 * @returns {JSX.Element}
 */
function NotFoundIllustration() {
  return (
    <svg
      className="w-56 h-56 sm:w-64 sm:h-64"
      viewBox="0 0 240 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Background circle */}
      <circle
        cx="120"
        cy="120"
        r="100"
        className="fill-gray-100 dark:fill-gray-800"
      />

      {/* Broken page shape */}
      <rect
        x="70"
        y="45"
        width="100"
        height="130"
        rx="10"
        className="fill-white dark:fill-gray-700 stroke-gray-300 dark:stroke-gray-600"
        strokeWidth="2"
      />

      {/* Torn / zigzag line across the page */}
      <polyline
        points="70,110 90,100 105,115 120,95 135,112 150,98 170,110"
        className="stroke-rose-400 dark:stroke-rose-500"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Document lines (top half) */}
      <rect
        x="88"
        y="65"
        width="64"
        height="5"
        rx="2.5"
        className="fill-gray-200 dark:fill-gray-600"
      />
      <rect
        x="88"
        y="78"
        width="50"
        height="5"
        rx="2.5"
        className="fill-gray-200 dark:fill-gray-600"
      />
      <rect
        x="88"
        y="91"
        width="56"
        height="5"
        rx="2.5"
        className="fill-gray-200 dark:fill-gray-600"
      />

      {/* Document lines (bottom half, faded) */}
      <rect
        x="88"
        y="125"
        width="48"
        height="5"
        rx="2.5"
        className="fill-gray-200/50 dark:fill-gray-600/50"
      />
      <rect
        x="88"
        y="138"
        width="40"
        height="5"
        rx="2.5"
        className="fill-gray-200/50 dark:fill-gray-600/50"
      />
      <rect
        x="88"
        y="151"
        width="52"
        height="5"
        rx="2.5"
        className="fill-gray-200/50 dark:fill-gray-600/50"
      />

      {/* Warning triangle */}
      <path
        d="M120 170 L132 190 L108 190 Z"
        className="fill-amber-100 dark:fill-amber-950/40 stroke-amber-500 dark:stroke-amber-400"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Exclamation mark inside triangle */}
      <line
        x1="120"
        y1="176"
        x2="120"
        y2="183"
        className="stroke-amber-500 dark:stroke-amber-400"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle
        cx="120"
        cy="187"
        r="1"
        className="fill-amber-500 dark:fill-amber-400"
      />

      {/* Floating question marks */}
      <text
        x="55"
        y="75"
        textAnchor="middle"
        className="fill-indigo-300 dark:fill-indigo-600"
        fontSize="18"
        fontWeight="600"
        fontFamily="Inter, sans-serif"
      >
        ?
      </text>
      <text
        x="190"
        y="65"
        textAnchor="middle"
        className="fill-indigo-300 dark:fill-indigo-600"
        fontSize="14"
        fontWeight="600"
        fontFamily="Inter, sans-serif"
      >
        ?
      </text>
      <text
        x="195"
        y="170"
        textAnchor="middle"
        className="fill-indigo-300 dark:fill-indigo-600"
        fontSize="16"
        fontWeight="600"
        fontFamily="Inter, sans-serif"
      >
        ?
      </text>
    </svg>
  );
}

/**
 * 404 Not Found page component.
 * Displays a custom SVG illustration, a "404 — Page Not Found" heading,
 * descriptive text, and a CTA button that navigates to the accounts dashboard.
 * Wrapped in PageTransition for consistent page enter/exit animations.
 *
 * @returns {JSX.Element}
 */
export function NotFoundPage() {
  const navigate = useNavigate();

  /**
   * Navigates to the accounts dashboard.
   */
  const handleGoToDashboard = useCallback(() => {
    navigate(ROUTES.DASHBOARD);
  }, [navigate]);

  return (
    <PageTransition>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="flex flex-col items-center justify-center text-center min-h-[60vh] py-16 px-6"
      >
        {/* Illustration */}
        <motion.div variants={itemVariants} className="mb-8">
          <NotFoundIllustration />
        </motion.div>

        {/* Heading */}
        <motion.h1
          variants={itemVariants}
          className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 tracking-tight"
        >
          404 — Page Not Found
        </motion.h1>

        {/* Description */}
        <motion.p
          variants={itemVariants}
          className="mt-3 text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-md leading-relaxed"
        >
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </motion.p>

        {/* CTA Button */}
        <motion.div variants={itemVariants} className="mt-8">
          <button
            type="button"
            onClick={handleGoToDashboard}
            className={classNames(
              'inline-flex items-center gap-2 rounded-lg px-5 py-3',
              'bg-indigo-600 text-white text-sm font-semibold',
              'hover:bg-indigo-700 active:bg-indigo-800',
              'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
              'dark:focus:ring-offset-gray-900',
              'transition-colors duration-150',
              'shadow-sm hover:shadow-md',
            )}
          >
            <Home className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
        </motion.div>

        {/* Subtle footer text */}
        <motion.p
          variants={itemVariants}
          className="mt-6 text-xs text-gray-400 dark:text-gray-500"
        >
          Error code: 404
        </motion.p>
      </motion.div>
    </PageTransition>
  );
}

export default NotFoundPage;