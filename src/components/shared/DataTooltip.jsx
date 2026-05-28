/**
 * Custom styled Recharts tooltip component with glassmorphism styling
 * Formats values as currency or percentage based on payload data.
 * Implements SCRUM-20321: Accounts Dashboard with Smart Insights
 * @module DataTooltip
 */

import PropTypes from 'prop-types';
import { classNames } from '../../utils/helpers.js';
import { formatCurrency, formatPercent, formatNumber } from '../../utils/formatters.js';

/**
 * Resolves the formatted display value based on the data point's format hint.
 *
 * @param {number} value - The raw numeric value
 * @param {string} [format='currency'] - The format type: 'currency', 'percent', or 'number'
 * @returns {string} The formatted value string
 */
function resolveFormattedValue(value, format = 'currency') {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return '—';
  }

  switch (format) {
    case 'percent':
      return formatPercent(value);
    case 'number':
      return formatNumber(value, 2);
    case 'currency':
    default:
      return formatCurrency(value);
  }
}

/**
 * Returns a dot element styled with the series color.
 *
 * @param {string} color - The CSS color string
 * @returns {JSX.Element}
 */
function ColorDot({ color }) {
  return (
    <span
      className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
      style={{ backgroundColor: color || '#4f46e5' }}
      aria-hidden="true"
    />
  );
}

ColorDot.propTypes = {
  color: PropTypes.string,
};

/**
 * Custom Recharts tooltip component with glassmorphism styling.
 * Renders a backdrop-blurred tooltip panel with formatted values
 * for each data series in the chart payload.
 *
 * This component is designed to be passed as the `content` prop
 * to Recharts `<Tooltip content={<DataTooltip />} />`.
 *
 * @param {Object} props - Recharts tooltip props (injected automatically)
 * @param {boolean} props.active - Whether the tooltip is currently active/visible
 * @param {Array<Object>} props.payload - Array of data points for the hovered position
 * @param {string|number} [props.label] - The axis label for the hovered position
 * @param {string} [props.labelPrefix] - Optional prefix for the label display
 * @param {string} [props.labelSuffix] - Optional suffix for the label display
 * @param {string} [props.valueFormat='currency'] - Default format for values: 'currency', 'percent', or 'number'
 * @param {string} [props.className] - Additional classes for the tooltip container
 * @returns {JSX.Element|null}
 *
 * @example
 * <Tooltip content={<DataTooltip valueFormat="currency" />} />
 *
 * @example
 * <Tooltip content={<DataTooltip valueFormat="percent" labelPrefix="Day " />} />
 */
export function DataTooltip({
  active,
  payload,
  label,
  labelPrefix = '',
  labelSuffix = '',
  valueFormat = 'currency',
  className,
}) {
  if (!active || !payload || !Array.isArray(payload) || payload.length === 0) {
    return null;
  }

  const displayLabel = label !== null && label !== undefined
    ? `${labelPrefix}${label}${labelSuffix}`
    : null;

  return (
    <div
      className={classNames(
        'rounded-lg px-3 py-2.5 shadow-lg border',
        'bg-white/80 dark:bg-slate-900/80',
        'backdrop-blur-md',
        'border-gray-200/60 dark:border-gray-700/60',
        'text-sm',
        className,
      )}
    >
      {/* Label */}
      {displayLabel && (
        <p className="mb-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
          {displayLabel}
        </p>
      )}

      {/* Data entries */}
      <ul className="space-y-1">
        {payload.map((entry, index) => {
          if (!entry || entry.value === undefined) {
            return null;
          }

          const entryFormat = (entry.payload && entry.payload.format) || valueFormat;
          const formattedValue = resolveFormattedValue(entry.value, entryFormat);
          const seriesName = entry.name || entry.dataKey || `Series ${index + 1}`;

          return (
            <li
              key={`${seriesName}-${index}`}
              className="flex items-center gap-2"
            >
              <ColorDot color={entry.color || entry.stroke || entry.fill} />
              <span className="text-gray-600 dark:text-gray-300 font-normal">
                {seriesName}
              </span>
              <span className="ml-auto font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
                {formattedValue}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

DataTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      value: PropTypes.number,
      dataKey: PropTypes.string,
      color: PropTypes.string,
      stroke: PropTypes.string,
      fill: PropTypes.string,
      payload: PropTypes.object,
    }),
  ),
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  labelPrefix: PropTypes.string,
  labelSuffix: PropTypes.string,
  valueFormat: PropTypes.oneOf(['currency', 'percent', 'number']),
  className: PropTypes.string,
};

export default DataTooltip;