/**
 * Theme state management context provider
 * Implements FR-013: Theme Support and Toggle
 * @module ThemeContext
 */

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { get, set } from '../utils/storageAdapter.js';
import { THEME_KEY, THEMES, DEFAULT_THEME } from '../utils/constants.js';

/**
 * @typedef {'light' | 'dark'} Theme
 */

/**
 * @typedef {Object} ThemeContextValue
 * @property {Theme} theme - The current theme
 * @property {function(): void} toggleTheme - Toggles between light and dark theme
 * @property {function(): Theme} getTheme - Returns the current theme
 * @property {boolean} isDark - Whether the current theme is dark
 */

/** @type {React.Context<ThemeContextValue | null>} */
const ThemeContext = createContext(null);

/**
 * Resolves the initial theme from storage or system preference.
 *
 * @returns {Theme} The resolved initial theme
 */
function resolveInitialTheme() {
  const stored = get(THEME_KEY, null);
  if (stored === THEMES.LIGHT || stored === THEMES.DARK) {
    return stored;
  }

  // Check env override
  const envDefault = import.meta.env.VITE_DEFAULT_DARK_MODE;
  if (envDefault === 'true') {
    return THEMES.DARK;
  }

  // Check system preference
  if (typeof window !== 'undefined' && window.matchMedia) {
    try {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return THEMES.DARK;
      }
    } catch {
      // matchMedia not supported, fall through
    }
  }

  return DEFAULT_THEME;
}

/**
 * Applies or removes the 'dark' class on document.documentElement.
 *
 * @param {Theme} theme - The theme to apply
 */
function applyThemeToDOM(theme) {
  if (typeof document === 'undefined') {
    return;
  }

  const root = document.documentElement;
  if (theme === THEMES.DARK) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

/**
 * ThemeProvider component that manages light/dark theme state,
 * persists preference to storage, and applies the 'dark' class
 * on document.documentElement.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element}
 */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const initial = resolveInitialTheme();
    applyThemeToDOM(initial);
    return initial;
  });

  useEffect(() => {
    applyThemeToDOM(theme);
    set(THEME_KEY, theme);
  }, [theme]);

  /**
   * Toggles between light and dark theme.
   */
  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK));
  }, []);

  /**
   * Returns the current theme.
   *
   * @returns {Theme} The current theme
   */
  const getTheme = useCallback(() => {
    return theme;
  }, [theme]);

  const isDark = theme === THEMES.DARK;

  const value = useMemo(
    () => ({
      theme,
      toggleTheme,
      getTheme,
      isDark,
    }),
    [theme, toggleTheme, getTheme, isDark],
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Custom hook to access the theme context.
 * Must be used within a ThemeProvider.
 *
 * @returns {ThemeContextValue} The theme context value
 * @throws {Error} If used outside of a ThemeProvider
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === null) {
    throw new Error('useTheme must be used within a ThemeProvider.');
  }
  return context;
}

export default ThemeContext;