/**
 * Empty state illustration component with custom SVG, title, description, and optional CTA
 * Used when tables/lists have no data (activity, holdings for new users).
 * Implements SCRUM-20323: Activity History with Filters and Empty State
 * Implements SCRUM-20322: Holdings Table with TrendSparkline
 * @module EmptyState
 */

import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { classNames } from '../../utils/helpers.js';

/**
 * Inline SVG illustration for empty states.
 * Themed to support both light and dark modes.
 *
 * @param {Object} props
 * @param {string} [props.className] - Additional classes for the SVG wrapper
 * @returns {JSX.Element}
 */
function EmptyIllustration({ className }) {
  return (
    <svg
      className={classNames('w-48 h-48', className)}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Background circle */}
      <circle
        cx="100"
        cy="100"
        r="80"
        className="fill-gray-100 dark:fill-gray-800"
      />

      {/* Document / folder shape */}
      <rect
        x="60"
        y="55"
        width="80"
        height="95"
        rx="8"
        className="fill-white dark:fill-gray-700 stroke-gray-300 dark:stroke-gray-600"
        strokeWidth="2"
      />

      {/* Document lines */}
      <rect
        x="75"
        y="75"
        width="50"
        height="4"
        rx="2"
        className="fill-gray-200 dark:fill-gray-600"
      />
      <rect
        x="75"
        y="87"
        width="40"
        height="4"
        rx="2"
        className="fill-gray-200 dark:fill-gray-600"
      />
      <rect
        x="75"
        y="99"
        width="45"
        height="4"
        rx="2"
        className="fill-gray-200 dark:fill-gray-600"
      />
      <rect
        x="75"
        y="111"
        width="30"
        height="4"
        rx="2"
        className="fill-gray-200 dark:fill-gray-600"
      />

      {/* Magnifying glass */}
      <circle
        cx="135"
        cy="130"
        r="22"
        className="fill-indigo-50 dark:fill-indigo-950/30 stroke-indigo-400 dark:stroke-indigo-500"
        strokeWidth="3"
      />
      <line
        x1="151"
        y1="146"
        x2="165"
        y2="160"
        className="stroke-indigo-400 dark:stroke-indigo-500"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Question mark inside magnifying glass */}
      <text
        x="135"
        y="137"
        textAnchor="middle"
        className="fill-indigo-400 dark:fill-indigo-400"
        fontSize="20"
        fontWeight="600"
        fontFamily="Inter, sans-serif"
      >
        ?
      </text>
    </svg>
  );
}

EmptyIllustration.propTypes = {
  className: PropTypes.string,
};

/**
 * Animation variants for the empty state container.
 * @type {Object}
 */
const containerVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

/**
 * Transition configuration for the empty state animation.
 * @type {Object}
 */
const containerTransition = {
  type: 'spring',
  stiffness: 300,
  damping: 25,
};

/**
 * Reusable empty state component with themed SVG illustration,
 * title, description, and optional call-to-action button.
 * Used when tables or lists have no data to display.
 *
 * @param {Object} props
 * @param {string} [props.title='No data found'] - The empty state title
 * @param {string} [props.description='There are no items to display at this time.'] - The empty state description
 * @param {string} [props.actionLabel] - Optional CTA button label
 * @param {function} [props.onAction] - Optional CTA button click handler
 * @param {React.ReactNode} [props.icon] - Optional custom icon to render instead of the default illustration
 * @param {string} [props.className] - Additional classes for the outer wrapper
 * @param {boolean} [props.compact=false] - Whether to render a compact version with smaller illustration
 * @returns {JSX.Element}
 *
 * @example
 * <EmptyState
 *   title="No transactions yet"
 *   description="Your transaction history will appear here once you make your first transaction."
 *   actionLabel="Make a deposit"
 *   onAction={() => navigate('/deposit')}
 * />
 */
export function EmptyState({
  title = 'No data found',
  description = 'There are no items to display at this time.',
  actionLabel,
  onAction,
  icon,
  className,
  compact = false,
}) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      transition={containerTransition}
      className={classNames(
        'flex flex-col items-center justify-center text-center',
        compact ? 'py-8 px-4' : 'py-16 px-6',
        className,
      )}
    >
      {/* Illustration or custom icon */}
      <div className={classNames('mb-6', compact && 'mb-4')}>
        {icon || (
          <EmptyIllustration
            className={compact ? 'w-32 h-32' : 'w-48 h-48'}
          />
        )}
      </div>

      {/* Title */}
      <h3
        className={classNames(
          'font-semibold text-gray-900 dark:text-gray-100',
          compact ? 'text-base' : 'text-lg',
        )}
      >
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p
          className={classNames(
            'mt-2 text-gray-500 dark:text-gray-400 max-w-md',
            compact ? 'text-sm' : 'text-sm',
          )}
        >
          {description}
        </p>
      )}

      {/* CTA Button */}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className={classNames(
            'mt-6 inline-flex items-center gap-2 rounded-lg px-4 py-2.5',
            'bg-indigo-600 text-white text-sm font-medium',
            'hover:bg-indigo-700 active:bg-indigo-800',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
            'dark:focus:ring-offset-gray-900',
            'transition-colors duration-150',
          )}
        >
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
}

EmptyState.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  actionLabel: PropTypes.string,
  onAction: PropTypes.func,
  icon: PropTypes.node,
  className: PropTypes.string,
  compact: PropTypes.bool,
};

export default EmptyState;