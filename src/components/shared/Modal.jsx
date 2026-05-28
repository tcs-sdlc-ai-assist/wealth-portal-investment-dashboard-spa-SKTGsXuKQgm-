/**
 * Accessible modal dialog component with Framer Motion animation
 * Provides backdrop blur overlay, focus trap, escape key close,
 * outside click close, ARIA roles, and focus restoration.
 * Implements SCRUM-20326: Profile & Settings Pages
 * @module Modal
 */

import { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import { X } from 'lucide-react';
import { classNames } from '../../utils/helpers.js';

/**
 * Focusable element selector string for focus trap.
 * @type {string}
 */
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'button:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

/**
 * Backdrop overlay animation variants.
 * @type {Object}
 */
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

/**
 * Modal panel animation variants.
 * @type {Object}
 */
const panelVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 16 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 16 },
};

/**
 * Default transition configuration for modal animations.
 * @type {Object}
 */
const panelTransition = {
  type: 'spring',
  stiffness: 400,
  damping: 30,
};

/**
 * Default transition configuration for backdrop animations.
 * @type {Object}
 */
const backdropTransition = {
  duration: 0.2,
  ease: 'easeOut',
};

/**
 * Size class map for modal widths.
 * @type {Object.<string, string>}
 */
const SIZE_CLASSES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  full: 'max-w-full mx-4',
};

/**
 * Reusable accessible modal dialog component.
 * Renders a portal-based modal with Framer Motion animations,
 * backdrop blur overlay, focus trap, escape key close, outside
 * click close, ARIA dialog/modal roles, and focus restoration.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {function} props.onClose - Callback to close the modal
 * @param {React.ReactNode} props.children - Modal body content
 * @param {string} [props.title] - Optional modal title displayed in the header
 * @param {string} [props.description] - Optional description for aria-describedby
 * @param {'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'} [props.size='md'] - Modal width size
 * @param {boolean} [props.showCloseButton=true] - Whether to show the close button in the header
 * @param {boolean} [props.closeOnBackdrop=true] - Whether clicking the backdrop closes the modal
 * @param {boolean} [props.closeOnEscape=true] - Whether pressing Escape closes the modal
 * @param {string} [props.className] - Additional classes for the modal panel
 * @param {React.ReactNode} [props.footer] - Optional footer content rendered below the body
 * @returns {JSX.Element}
 *
 * @example
 * <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Confirm Action">
 *   <p>Are you sure you want to proceed?</p>
 * </Modal>
 */
export function Modal({
  isOpen,
  onClose,
  children,
  title,
  description,
  size = 'md',
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  className,
  footer,
}) {
  const modalRef = useRef(null);
  const previousActiveElementRef = useRef(null);
  const titleId = useRef(`modal-title-${Math.random().toString(36).slice(2, 9)}`);
  const descriptionId = useRef(`modal-desc-${Math.random().toString(36).slice(2, 9)}`);

  /**
   * Returns all focusable elements within the modal.
   * @returns {HTMLElement[]}
   */
  const getFocusableElements = useCallback(() => {
    if (!modalRef.current) {
      return [];
    }
    return Array.from(modalRef.current.querySelectorAll(FOCUSABLE_SELECTOR));
  }, []);

  /**
   * Handles keyboard events for escape key close and focus trap.
   * @param {KeyboardEvent} event
   */
  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === 'Escape' && closeOnEscape) {
        event.stopPropagation();
        onClose();
        return;
      }

      if (event.key === 'Tab') {
        const focusableElements = getFocusableElements();
        if (focusableElements.length === 0) {
          event.preventDefault();
          return;
        }

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
    },
    [closeOnEscape, onClose, getFocusableElements],
  );

  /**
   * Handles backdrop click to close the modal.
   * @param {React.MouseEvent} event
   */
  const handleBackdropClick = useCallback(
    (event) => {
      if (closeOnBackdrop && event.target === event.currentTarget) {
        onClose();
      }
    },
    [closeOnBackdrop, onClose],
  );

  // Save the previously focused element and manage focus on open/close
  useEffect(() => {
    if (isOpen) {
      previousActiveElementRef.current = document.activeElement;

      // Prevent body scroll
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      // Focus the modal after animation
      const timer = setTimeout(() => {
        if (modalRef.current) {
          const focusableElements = getFocusableElements();
          if (focusableElements.length > 0) {
            focusableElements[0].focus();
          } else {
            modalRef.current.focus();
          }
        }
      }, 50);

      return () => {
        clearTimeout(timer);
        document.body.style.overflow = originalOverflow;

        // Restore focus to the previously focused element
        if (
          previousActiveElementRef.current &&
          typeof previousActiveElementRef.current.focus === 'function'
        ) {
          previousActiveElementRef.current.focus();
        }
      };
    }
  }, [isOpen, getFocusableElements]);

  // Attach keydown listener when modal is open
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;

  const modalContent = (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            key="modal-backdrop"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={backdropVariants}
            transition={backdropTransition}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            aria-hidden="true"
            onClick={handleBackdropClick}
          />

          {/* Modal panel */}
          <motion.div
            key="modal-panel"
            ref={modalRef}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={panelVariants}
            transition={panelTransition}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId.current : undefined}
            aria-describedby={description ? descriptionId.current : undefined}
            tabIndex={-1}
            className={classNames(
              'relative z-10 w-full rounded-xl border border-gray-200 dark:border-gray-700',
              'bg-white dark:bg-gray-900 shadow-xl dark:shadow-gray-900/50',
              'flex flex-col max-h-[90vh]',
              sizeClass,
              className,
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                {title && (
                  <h2
                    id={titleId.current}
                    className="text-lg font-semibold text-gray-900 dark:text-gray-100"
                  >
                    {title}
                  </h2>
                )}
                {!title && <div />}
                {showCloseButton && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 dark:focus:ring-offset-gray-900"
                    aria-label="Close modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}

            {/* Description (visually hidden if no title, but available for screen readers) */}
            {description && (
              <p id={descriptionId.current} className="sr-only">
                {description}
              </p>
            )}

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  // Render via portal to document.body
  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(modalContent, document.body);
}

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  description: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', '2xl', 'full']),
  showCloseButton: PropTypes.bool,
  closeOnBackdrop: PropTypes.bool,
  closeOnEscape: PropTypes.bool,
  className: PropTypes.string,
  footer: PropTypes.node,
};

export default Modal;