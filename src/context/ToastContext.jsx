/**
 * Toast notification state management context provider
 * Implements SCRUM-20312, SCRUM-20324
 * @module ToastContext
 */

import { createContext, useContext, useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { generateId } from '../utils/helpers.js';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

/**
 * @typedef {'success' | 'error' | 'info' | 'warning'} ToastType
 */

/**
 * @typedef {Object} Toast
 * @property {string} id - Unique identifier for the toast
 * @property {string} message - The toast message
 * @property {ToastType} type - The type of toast
 * @property {number} duration - Auto-dismiss duration in milliseconds
 */

/**
 * @typedef {Object} ToastContextValue
 * @property {function(Object): string} addToast - Adds a new toast notification, returns the toast id
 * @property {function(string): void} removeToast - Removes a toast by id
 */

/** @type {React.Context<ToastContextValue | null>} */
const ToastContext = createContext(null);

/** @type {number} Default auto-dismiss duration in milliseconds */
const DEFAULT_DURATION = 4000;

/**
 * Returns the icon component for a given toast type.
 *
 * @param {ToastType} type - The toast type
 * @returns {JSX.Element} The icon element
 */
function ToastIcon({ type }) {
  const iconClass = 'w-5 h-5 flex-shrink-0';

  switch (type) {
    case 'success':
      return <CheckCircle className={`${iconClass} text-emerald-500`} />;
    case 'error':
      return <XCircle className={`${iconClass} text-rose-500`} />;
    case 'warning':
      return <AlertTriangle className={`${iconClass} text-amber-500`} />;
    case 'info':
    default:
      return <Info className={`${iconClass} text-sky-500`} />;
  }
}

ToastIcon.propTypes = {
  type: PropTypes.oneOf(['success', 'error', 'info', 'warning']).isRequired,
};

/**
 * Returns the border color class for a given toast type.
 *
 * @param {ToastType} type - The toast type
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
      return 'border-l-sky-500';
  }
}

/**
 * Individual toast item component with hover-pause and auto-dismiss.
 *
 * @param {Object} props
 * @param {Toast} props.toast - The toast data
 * @param {function(string): void} props.onRemove - Callback to remove the toast
 * @returns {JSX.Element}
 */
function ToastItem({ toast, onRemove }) {
  const timerRef = useRef(null);
  const remainingRef = useRef(toast.duration);
  const startTimeRef = useRef(Date.now());

  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      onRemove(toast.id);
    }, remainingRef.current);
  }, [onRemove, toast.id]);

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

  const borderColor = getBorderColor(toast.type);

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
      className={`pointer-events-auto w-80 max-w-sm rounded-lg border border-l-4 ${borderColor} bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-lg dark:shadow-gray-900/40 overflow-hidden`}
    >
      <div className="flex items-start gap-3 p-4">
        <ToastIcon type={toast.type} />
        <p className="flex-1 text-sm text-gray-700 dark:text-gray-200 leading-snug break-words">
          {toast.message}
        </p>
        <button
          type="button"
          onClick={() => onRemove(toast.id)}
          className="flex-shrink-0 rounded-md p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 dark:focus:ring-offset-gray-900"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

ToastItem.propTypes = {
  toast: PropTypes.shape({
    id: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['success', 'error', 'info', 'warning']).isRequired,
    duration: PropTypes.number.isRequired,
  }).isRequired,
  onRemove: PropTypes.func.isRequired,
};

/**
 * ToastProvider component that manages toast notification state
 * and renders toasts in a fixed container at the bottom-right.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element}
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  /**
   * Adds a new toast notification.
   *
   * @param {Object} options - Toast options
   * @param {string} options.message - The toast message
   * @param {ToastType} [options.type='info'] - The type of toast
   * @param {number} [options.duration=4000] - Auto-dismiss duration in milliseconds
   * @returns {string} The id of the created toast
   */
  const addToast = useCallback(({ message, type = 'info', duration = DEFAULT_DURATION }) => {
    const id = generateId();
    const toast = {
      id,
      message,
      type,
      duration,
    };

    setToasts((prev) => [...prev, toast]);
    return id;
  }, []);

  /**
   * Removes a toast by its id.
   *
   * @param {string} id - The toast id to remove
   */
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value = useMemo(
    () => ({
      addToast,
      removeToast,
    }),
    [addToast, removeToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="fixed bottom-4 right-4 z-50 flex flex-col-reverse gap-3 pointer-events-none"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

ToastProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Custom hook to access the toast context.
 * Must be used within a ToastProvider.
 *
 * @returns {ToastContextValue} The toast context value
 * @throws {Error} If used outside of a ToastProvider
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (context === null) {
    throw new Error('useToast must be used within a ToastProvider.');
  }
  return context;
}

export default ToastContext;