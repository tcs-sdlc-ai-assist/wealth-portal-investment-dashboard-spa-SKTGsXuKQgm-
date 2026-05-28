/**
 * Visual password strength indicator component
 * Shows a segmented bar (weak/fair/good/strong) with color coding (rose → amber → emerald).
 * Calculates strength based on length, uppercase, lowercase, numbers, and special characters.
 * Implements SCRUM-20312: Mock Login UI, SCRUM-20326: Profile & Settings Pages
 * @module PasswordStrengthMeter
 */

import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { classNames } from '../../utils/helpers.js';
import { PASSWORD_MIN_LENGTH } from '../../utils/constants.js';

/**
 * Strength level definitions with labels and colors.
 * @type {Array<{ label: string, color: string, bgColor: string, textColor: string }>}
 */
const STRENGTH_LEVELS = [
  {
    label: 'Weak',
    color: 'bg-rose-500',
    bgColor: 'bg-rose-500/20 dark:bg-rose-500/10',
    textColor: 'text-rose-600 dark:text-rose-400',
  },
  {
    label: 'Fair',
    color: 'bg-amber-500',
    bgColor: 'bg-amber-500/20 dark:bg-amber-500/10',
    textColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    label: 'Good',
    color: 'bg-emerald-400',
    bgColor: 'bg-emerald-400/20 dark:bg-emerald-400/10',
    textColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    label: 'Strong',
    color: 'bg-emerald-500',
    bgColor: 'bg-emerald-500/20 dark:bg-emerald-500/10',
    textColor: 'text-emerald-700 dark:text-emerald-300',
  },
];

/**
 * Total number of strength segments displayed in the bar.
 * @type {number}
 */
const TOTAL_SEGMENTS = 4;

/**
 * Calculates a password strength score from 0 to 4 based on multiple criteria.
 *
 * Criteria evaluated:
 * - Length meets minimum requirement (PASSWORD_MIN_LENGTH)
 * - Contains at least one uppercase letter
 * - Contains at least one lowercase letter
 * - Contains at least one digit
 * - Contains at least one special character
 *
 * @param {string} password - The password string to evaluate
 * @returns {number} A score from 0 to 4
 */
function calculateStrengthScore(password) {
  if (!password || typeof password !== 'string' || password.length === 0) {
    return 0;
  }

  let score = 0;

  // Check length
  if (password.length >= PASSWORD_MIN_LENGTH) {
    score += 1;
  }

  // Check uppercase
  if (/[A-Z]/.test(password)) {
    score += 1;
  }

  // Check lowercase
  if (/[a-z]/.test(password)) {
    score += 1;
  }

  // Check numbers
  if (/[0-9]/.test(password)) {
    score += 1;
  }

  // Check special characters
  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1;
  }

  // Map 0–5 score to 0–4 strength level
  if (score <= 1) {
    return 0;
  }

  if (score === 2) {
    return 1;
  }

  if (score === 3) {
    return 2;
  }

  if (score === 4) {
    return 3;
  }

  // score === 5
  return 3;
}

/**
 * Returns the strength level object for a given score.
 *
 * @param {number} score - The strength score (0–3)
 * @returns {{ label: string, color: string, bgColor: string, textColor: string }} The strength level definition
 */
function getStrengthLevel(score) {
  if (score < 0 || score >= STRENGTH_LEVELS.length) {
    return STRENGTH_LEVELS[0];
  }

  return STRENGTH_LEVELS[score];
}

/**
 * Returns a list of requirement objects indicating which criteria are met.
 *
 * @param {string} password - The password string to evaluate
 * @returns {Array<{ label: string, met: boolean }>} Array of requirement status objects
 */
function getRequirements(password) {
  const pwd = password || '';

  return [
    {
      label: `At least ${PASSWORD_MIN_LENGTH} characters`,
      met: pwd.length >= PASSWORD_MIN_LENGTH,
    },
    {
      label: 'One uppercase letter',
      met: /[A-Z]/.test(pwd),
    },
    {
      label: 'One lowercase letter',
      met: /[a-z]/.test(pwd),
    },
    {
      label: 'One number',
      met: /[0-9]/.test(pwd),
    },
    {
      label: 'One special character',
      met: /[^A-Za-z0-9]/.test(pwd),
    },
  ];
}

/**
 * Visual password strength indicator component.
 * Displays a segmented bar that fills and changes color based on
 * password strength (weak → fair → good → strong). Optionally shows
 * a checklist of individual requirements.
 *
 * @param {Object} props
 * @param {string} props.password - The password string to evaluate
 * @param {boolean} [props.showRequirements=false] - Whether to display the requirements checklist
 * @param {boolean} [props.showLabel=true] - Whether to display the strength label text
 * @param {string} [props.className] - Additional classes for the outer wrapper
 * @returns {JSX.Element|null}
 *
 * @example
 * <PasswordStrengthMeter password={password} />
 *
 * @example
 * <PasswordStrengthMeter password={password} showRequirements showLabel />
 */
export function PasswordStrengthMeter({
  password,
  showRequirements = false,
  showLabel = true,
  className,
}) {
  const score = useMemo(() => calculateStrengthScore(password), [password]);
  const level = useMemo(() => getStrengthLevel(score), [score]);
  const requirements = useMemo(() => getRequirements(password), [password]);

  // Don't render anything if password is empty
  if (!password || typeof password !== 'string' || password.length === 0) {
    return null;
  }

  return (
    <div className={classNames('space-y-2', className)}>
      {/* Strength bar */}
      <div className="flex items-center gap-1.5">
        {Array.from({ length: TOTAL_SEGMENTS }).map((_, index) => (
          <div
            key={index}
            className={classNames(
              'h-1.5 flex-1 rounded-full transition-colors duration-300',
              index <= score ? level.color : 'bg-gray-200 dark:bg-gray-700',
            )}
          />
        ))}
      </div>

      {/* Strength label */}
      {showLabel && (
        <p
          className={classNames(
            'text-xs font-medium transition-colors duration-300',
            level.textColor,
          )}
        >
          {level.label}
        </p>
      )}

      {/* Requirements checklist */}
      {showRequirements && (
        <ul className="space-y-1 mt-2">
          {requirements.map((req) => (
            <li
              key={req.label}
              className={classNames(
                'flex items-center gap-2 text-xs transition-colors duration-200',
                req.met
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-gray-400 dark:text-gray-500',
              )}
            >
              <span
                className={classNames(
                  'inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors duration-200',
                  req.met
                    ? 'bg-emerald-500'
                    : 'bg-gray-300 dark:bg-gray-600',
                )}
                aria-hidden="true"
              />
              <span>{req.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

PasswordStrengthMeter.propTypes = {
  password: PropTypes.string,
  showRequirements: PropTypes.bool,
  showLabel: PropTypes.bool,
  className: PropTypes.string,
};

export default PasswordStrengthMeter;