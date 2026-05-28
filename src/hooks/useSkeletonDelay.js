/**
 * Custom hook that returns a loading boolean for skeleton loader display.
 * Initially true for a random duration between SKELETON_DELAY_MIN and
 * SKELETON_DELAY_MAX milliseconds, then transitions to false.
 *
 * Implements SCRUM-20320
 * @module useSkeletonDelay
 */

import { useState, useEffect, useRef } from 'react';
import { SKELETON_DELAY_MIN, SKELETON_DELAY_MAX } from '../utils/constants.js';

/**
 * Returns a loading boolean that starts as `true` and becomes `false`
 * after a random delay between `min` and `max` milliseconds.
 * Used by page components to show skeleton loaders before rendering content.
 *
 * @param {number} [min=SKELETON_DELAY_MIN] - Minimum delay in milliseconds
 * @param {number} [max=SKELETON_DELAY_MAX] - Maximum delay in milliseconds
 * @returns {boolean} `true` while the skeleton delay is active, `false` after it completes
 *
 * @example
 * const loading = useSkeletonDelay();
 * if (loading) return <SkeletonLoader />;
 * return <ActualContent />;
 */
export function useSkeletonDelay(min = SKELETON_DELAY_MIN, max = SKELETON_DELAY_MAX) {
  const [loading, setLoading] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;

    timerRef.current = setTimeout(() => {
      setLoading(false);
    }, delay);

    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, [min, max]);

  return loading;
}

export default useSkeletonDelay;