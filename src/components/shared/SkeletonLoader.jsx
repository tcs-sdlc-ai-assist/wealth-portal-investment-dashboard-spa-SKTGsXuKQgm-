/**
 * Animated skeleton loading placeholder component
 * Implements SCRUM-20320: Micro-interactions and Page Transitions
 * @module SkeletonLoader
 */

import PropTypes from 'prop-types';
import { classNames } from '../../utils/helpers.js';

/**
 * Base skeleton block with pulse animation.
 *
 * @param {Object} props
 * @param {string} [props.className] - Additional Tailwind classes
 * @returns {JSX.Element}
 */
function SkeletonBlock({ className }) {
  return (
    <div
      className={classNames(
        'animate-pulse rounded bg-gray-200 dark:bg-gray-700',
        className,
      )}
    />
  );
}

SkeletonBlock.propTypes = {
  className: PropTypes.string,
};

/**
 * Renders a text skeleton with multiple lines of varying widths.
 *
 * @param {Object} props
 * @param {number} [props.lines=3] - Number of text lines to render
 * @returns {JSX.Element}
 */
function TextSkeleton({ lines = 3 }) {
  const widths = ['w-full', 'w-5/6', 'w-4/6', 'w-3/4', 'w-2/3'];

  return (
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, index) => (
        <SkeletonBlock
          key={index}
          className={classNames('h-4', widths[index % widths.length])}
        />
      ))}
    </div>
  );
}

TextSkeleton.propTypes = {
  lines: PropTypes.number,
};

/**
 * Renders a card skeleton with a header area, text lines, and a footer bar.
 *
 * @returns {JSX.Element}
 */
function CardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 space-y-4">
      <div className="flex items-center gap-3">
        <SkeletonBlock className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <SkeletonBlock className="h-4 w-1/3" />
          <SkeletonBlock className="h-3 w-1/4" />
        </div>
      </div>
      <SkeletonBlock className="h-8 w-2/5" />
      <div className="space-y-2">
        <SkeletonBlock className="h-3 w-full" />
        <SkeletonBlock className="h-3 w-5/6" />
      </div>
      <SkeletonBlock className="h-10 w-full rounded-lg" />
    </div>
  );
}

/**
 * Renders a table skeleton with a header row and multiple body rows.
 *
 * @param {Object} props
 * @param {number} [props.rows=5] - Number of table rows to render
 * @param {number} [props.cols=4] - Number of columns per row
 * @returns {JSX.Element}
 */
function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        {Array.from({ length: cols }).map((_, index) => (
          <SkeletonBlock
            key={`header-${index}`}
            className={classNames(
              'h-4',
              index === 0 ? 'w-1/6' : 'flex-1',
            )}
          />
        ))}
      </div>
      {/* Body rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={`row-${rowIndex}`}
          className="flex items-center gap-4 px-6 py-4 border-b border-gray-100 dark:border-gray-800 last:border-b-0"
        >
          {Array.from({ length: cols }).map((_, colIndex) => (
            <SkeletonBlock
              key={`cell-${rowIndex}-${colIndex}`}
              className={classNames(
                'h-4',
                colIndex === 0 ? 'w-1/6' : 'flex-1',
              )}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

TableSkeleton.propTypes = {
  rows: PropTypes.number,
  cols: PropTypes.number,
};

/**
 * Renders a chart skeleton with a title area and a large placeholder.
 *
 * @returns {JSX.Element}
 */
function ChartSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <SkeletonBlock className="h-5 w-1/4" />
        <SkeletonBlock className="h-8 w-24 rounded-lg" />
      </div>
      <SkeletonBlock className="h-48 w-full rounded-lg" />
      <div className="flex items-center justify-center gap-4">
        <SkeletonBlock className="h-3 w-16" />
        <SkeletonBlock className="h-3 w-16" />
        <SkeletonBlock className="h-3 w-16" />
      </div>
    </div>
  );
}

/**
 * Renders an avatar skeleton (circle).
 *
 * @param {Object} props
 * @param {string} [props.size='md'] - Avatar size: 'sm', 'md', 'lg'
 * @returns {JSX.Element}
 */
function AvatarSkeleton({ size = 'md' }) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  return (
    <SkeletonBlock
      className={classNames('rounded-full', sizeClasses[size] || sizeClasses.md)}
    />
  );
}

AvatarSkeleton.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
};

/**
 * Renders a profile skeleton with avatar and text lines.
 *
 * @returns {JSX.Element}
 */
function ProfileSkeleton() {
  return (
    <div className="flex items-center gap-4">
      <SkeletonBlock className="h-16 w-16 rounded-full" />
      <div className="flex-1 space-y-2">
        <SkeletonBlock className="h-5 w-1/3" />
        <SkeletonBlock className="h-4 w-1/4" />
        <SkeletonBlock className="h-3 w-1/5" />
      </div>
    </div>
  );
}

/**
 * Renders a list skeleton with repeated row items.
 *
 * @param {Object} props
 * @param {number} [props.rows=4] - Number of list rows
 * @returns {JSX.Element}
 */
function ListSkeleton({ rows = 4 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4"
        >
          <SkeletonBlock className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <SkeletonBlock className="h-4 w-2/5" />
            <SkeletonBlock className="h-3 w-1/4" />
          </div>
          <SkeletonBlock className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}

ListSkeleton.propTypes = {
  rows: PropTypes.number,
};

/**
 * Map of variant names to their skeleton components.
 *
 * @type {Object.<string, Function>}
 */
const VARIANT_MAP = {
  text: TextSkeleton,
  card: CardSkeleton,
  table: TableSkeleton,
  chart: ChartSkeleton,
  avatar: AvatarSkeleton,
  profile: ProfileSkeleton,
  list: ListSkeleton,
};

/**
 * Reusable skeleton loader component that renders animated pulse placeholders
 * mimicking content shapes. Supports multiple variants and repeat counts.
 *
 * @param {Object} props
 * @param {'text' | 'card' | 'table' | 'chart' | 'avatar' | 'profile' | 'list'} [props.variant='text'] - The skeleton variant to render
 * @param {number} [props.count=1] - Number of skeleton instances to render
 * @param {number} [props.lines=3] - Number of lines for text variant
 * @param {number} [props.rows=5] - Number of rows for table/list variant
 * @param {number} [props.cols=4] - Number of columns for table variant
 * @param {string} [props.size='md'] - Size for avatar variant
 * @param {string} [props.className] - Additional wrapper classes
 * @returns {JSX.Element}
 */
export function SkeletonLoader({
  variant = 'text',
  count = 1,
  lines = 3,
  rows = 5,
  cols = 4,
  size = 'md',
  className,
}) {
  const SkeletonComponent = VARIANT_MAP[variant] || VARIANT_MAP.text;

  const variantProps = {};
  if (variant === 'text') {
    variantProps.lines = lines;
  }
  if (variant === 'table') {
    variantProps.rows = rows;
    variantProps.cols = cols;
  }
  if (variant === 'list') {
    variantProps.rows = rows;
  }
  if (variant === 'avatar') {
    variantProps.size = size;
  }

  if (count === 1) {
    return (
      <div className={className} role="status" aria-label="Loading content">
        <span className="sr-only">Loading…</span>
        <SkeletonComponent {...variantProps} />
      </div>
    );
  }

  return (
    <div
      className={classNames('space-y-4', className)}
      role="status"
      aria-label="Loading content"
    >
      <span className="sr-only">Loading…</span>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonComponent key={index} {...variantProps} />
      ))}
    </div>
  );
}

SkeletonLoader.propTypes = {
  variant: PropTypes.oneOf(['text', 'card', 'table', 'chart', 'avatar', 'profile', 'list']),
  count: PropTypes.number,
  lines: PropTypes.number,
  rows: PropTypes.number,
  cols: PropTypes.number,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
};

export default SkeletonLoader;