/**
 * Toast notification display component
 * Renders individual toast items with Framer Motion slide-in animation.
 * Supports success, error, info, and warning variants.
 * Implements SCRUM-20312, SCRUM-20324
 * @module Toast
 */

import { useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { classNames } from '../../utils/helpers.js';

/**
 * Default auto-dismiss duration in milliseconds.
 * @type {number}
 */
const DEFAULT_DURATION = 4000;

/**
 * Returns the icon component for a given toast type.
 *
 * @param {Object} props
 * @param {'success' | 'error' | 'info' | 'warning'} props.type - The toast type
 * @returns {JSX.Element} The icon element
 */
function ToastIcon({ type }) {
  const iconClass = 'w-5 h-5 flex-shrink-0';

  switch (type) {
    case 'success':
      return <CheckCircle className={classNames(iconClass, 'text-emerald-500')} />;
    case 'error':
      return <XCircle className={classNames(iconClass, 'text-rose-500')} />;
    case 'warning':
      return <AlertTriangle className={classNames(iconClass, 'text-amber-500')} />;
    case 'info':
    default:
      return <Info className={classNames(iconClass, 'text-indigo-500')} />;
  }
}

ToastIcon.propTypes = {
  type: PropTypes.oneOf(['success', 'error', 'info', 'warning']).isRequired,
};

/**
 * Returns the left border color class for a given toast type.
 *
 * @param {'success' | 'error' | 'info' | 'warning'} type - The toast type
 * @returns {string} Tailwind border color class
 */
function getBorderColor(type) {
  switch (type) {
    case 'success':
      return 'border-l-emerald-500';
    case 'error':
      return 'border-l-rose-500';
    case 'warning':
      return 'border-l-amber-500';
    case 'info':
    default:
      return 'border-l-indigo-500';
  }
}

/**
 * Returns the background highlight class for a given toast type.
 *
 * @param {'success' | 'error' | 'info' | 'warning'} type - The toast type
 * @returns {string} Tailwind background class
 */
function getBackgroundAccent(type) {
  switch (type) {
    case 'success':
      return 'bg-emerald-50 dark:bg-emerald-950/20';
    case 'error':
      return 'bg-rose-50 dark:bg-rose-950/20';
    case 'warning':
      return 'bg-amber-50 dark:bg-amber-950/20';
    case 'info':
    default:
      return 'bg-indigo-50 dark:bg-indigo-950/20';
  }
}

/**
 * Individual toast notification component with hover-pause auto-dismiss
 * and Framer Motion slide-in animation from the bottom-right.
 *
 * @param {Object} props
 * @param {string} props.id - Unique identifier for the toast
 * @param {string} props.message - The toast message
 * @param {'success' | 'error' | 'info' | 'warning'} [props.type='info'] - The type of toast
 * @param {number} [props.duration=4000] - Auto-dismiss duration in milliseconds
 * @param {function} props.onClose - Callback to remove the toast
 * @returns {JSX.Element}
 */
export function Toast({ id, message, type = 'info', duration = DEFAULT_DURATION, onClose }) {
  const timerRef = useRef(null);
  const remainingRef = useRef(duration);
  const startTimeRef = useRef(Date.now());

  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      onClose(id);
    }, remainingRef.current);
  }, [onClose, id]);

  const pauseTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      const elapsed = Date.now() - startTimeRef.current;
      remainingRef.current = Math.max(remainingRef.current - elapsed, 0);
    }
  }, []);

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, [startTimer]);

  const handleMouseEnter = useCallback(() => {
    pauseTimer();
  }, [pauseTimer]);

  const handleMouseLeave = useCallback(() => {
    startTimer();
  }, [startTimer]);

  const handleClose = useCallback(() => {
    onClose(id);
  }, [onClose, id]);

  const borderColor = getBorderColor(type);
  const bgAccent = getBackgroundAccent(type);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="alert"
      className={classNames(
        'pointer-events-auto w-80 max-w-sm rounded-lg border border-l-4',
        borderColor,
        bgAccent,
        'border-gray-200 dark:border-gray-700 shadow-lg dark:shadow-gray-900/40 overflow-hidden',
      )}
    >
      <div className="flex items-start gap-3 p-4">
        <ToastIcon type={type} />
        <p className="flex-1 text-sm text-gray-700 dark:text-gray-200 leading-snug break-words">
          {message}
        </p>
        <button
          type="button"
          onClick={handleClose}
          className="flex-shrink-0 rounded-md p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 dark:focus:ring-offset-gray-900"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

Toast.propTypes = {
  id: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['success', 'error', 'info', 'warning']),
  duration: PropTypes.number,
  onClose: PropTypes.func.isRequired,
};

export default Toast;