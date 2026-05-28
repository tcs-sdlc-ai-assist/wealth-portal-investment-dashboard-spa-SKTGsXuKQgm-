/**
 * Inline sparkline chart component for holdings table
 * Renders a small Recharts LineChart showing 7-day price trend.
 * Line color is emerald-500 for positive trend, rose-500 for negative.
 * Implements SCRUM-20322: Holdings Table with TrendSparkline
 * @module TrendSparkline
 */

import PropTypes from 'prop-types';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { COLORS } from '../../utils/constants.js';

/**
 * Default dimensions for the sparkline chart.
 * @type {{ width: number, height: number }}
 */
const DEFAULT_DIMENSIONS = {
  width: 100,
  height: 32,
};

/**
 * Color constants for trend direction.
 * @type {{ positive: string, negative: string, neutral: string }}
 */
const TREND_COLORS = {
  positive: COLORS.EMERALD,
  negative: COLORS.ROSE,
  neutral: '#9ca3af', // gray-400
};

/**
 * Determines the trend direction from a sparkline data array.
 * Compares the first and last data point values.
 *
 * @param {Array<{ day: number, value: number }>} data - The sparkline data points
 * @returns {'positive' | 'negative' | 'neutral'} The trend direction
 */
function getTrendDirection(data) {
  if (!Array.isArray(data) || data.length < 2) {
    return 'neutral';
  }

  const firstValue = data[0]?.value;
  const lastValue = data[data.length - 1]?.value;

  if (!Number.isFinite(firstValue) || !Number.isFinite(lastValue)) {
    return 'neutral';
  }

  if (lastValue > firstValue) {
    return 'positive';
  }

  if (lastValue < firstValue) {
    return 'negative';
  }

  return 'neutral';
}

/**
 * Returns the stroke color based on trend direction.
 *
 * @param {'positive' | 'negative' | 'neutral'} direction - The trend direction
 * @returns {string} The CSS color string
 */
function getTrendColor(direction) {
  return TREND_COLORS[direction] || TREND_COLORS.neutral;
}

/**
 * Inline sparkline chart component that renders a small Recharts LineChart
 * with no axes, no grid, and no tooltip. Shows a 7-day price trend with
 * color indicating positive (emerald) or negative (rose) direction.
 *
 * @param {Object} props
 * @param {Array<{ day: number, value: number }>} props.data - Array of sparkline data points
 * @param {number} [props.width=100] - Chart width in pixels
 * @param {number} [props.height=32] - Chart height in pixels
 * @param {number} [props.strokeWidth=1.5] - Line stroke width
 * @param {string} [props.className] - Additional classes for the wrapper
 * @returns {JSX.Element|null}
 *
 * @example
 * <TrendSparkline data={holding.sparklineData} />
 *
 * @example
 * <TrendSparkline data={holding.sparklineData} width={120} height={40} />
 */
export function TrendSparkline({
  data,
  width = DEFAULT_DIMENSIONS.width,
  height = DEFAULT_DIMENSIONS.height,
  strokeWidth = 1.5,
  className,
}) {
  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }

  const direction = getTrendDirection(data);
  const color = getTrendColor(direction);

  return (
    <div
      className={className}
      style={{ width, height }}
      role="img"
      aria-label={`Sparkline trend: ${direction}`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={strokeWidth}
            dot={false}
            activeDot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

TrendSparkline.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      day: PropTypes.number,
      value: PropTypes.number,
    }),
  ).isRequired,
  width: PropTypes.number,
  height: PropTypes.number,
  strokeWidth: PropTypes.number,
  className: PropTypes.string,
};

export default TrendSparkline;