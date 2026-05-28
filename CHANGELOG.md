# Changelog

All notable changes to the **Wealth Portal** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-06-15

### Added

#### Authentication & Session Management
- Mock login UI with pre-seeded user card selection — each card displays avatar initials, full name, email, account type badge, and last login timestamp (SCRUM-20315)
- Signup page with full form validation — collects first name, last name, email, phone, password, confirm password, account type, and date of birth with inline error messages and shake animation on invalid fields (SCRUM-20312)
- Session management with `AuthContext` — persists authenticated user to `localStorage`, redirects unauthenticated users to `/login` via `ProtectedRoute` guard, and preserves attempted location for post-login redirect (SCRUM-20313)
- Five pre-seeded mock users with complete portfolio data — Jane Doe, Marcus Chen, Aisha Patel, Robert Williams, and Sofia Martinez — each with unique accounts, holdings, activity, documents, bank accounts, beneficiaries, and preferences (FR-004)
- Password strength meter component with segmented bar (weak/fair/good/strong) and color coding from rose to emerald, plus optional requirements checklist

#### Navigation & Layout
- Top navigation bar with glassmorphism styling, responsive hamburger drawer for mobile, animated active route underline via Framer Motion `layoutId`, and profile avatar dropdown (SCRUM-20314)
- Hamburger drawer with slide-in animation, focus trap, escape key close, outside click close, ARIA `dialog` role, body scroll lock, and all navigation links plus theme toggle (SCRUM-20319)
- Profile dropdown menu triggered by avatar click — links to Profile, Communication Preferences, Security, Bank Management, Beneficiaries, Cost Basis, plus theme toggle and logout (SCRUM-20317)
- `AppLayout` wrapper component rendering fixed `NavigationBar` at top with responsive content padding below

#### Accounts Dashboard
- Dynamic time-based greeting (morning, afternoon, evening, night) with user first name
- Animated portfolio value ticker counting from zero to target value with ease-out cubic easing
- Portfolio summary cards for total account value, total market value, gain/loss with percentage, and holdings count
- Smart insights engine generating contextual messages based on portfolio performance, top/worst performers, diversification level, and account count (SCRUM-20321)
- Interactive donut chart (Recharts `PieChart`) for portfolio allocation with hover-to-highlight slices, center label overlay showing hovered holding or total value, and color-coded legend
- Account cards grid displaying each account with type icon, name, masked account number, balance, and type badge
- Onboarding widget for new users with empty portfolios — three-step guided setup (complete profile, link bank, explore products)

#### Holdings Table
- Sortable holdings table with nine columns — Symbol, Name, Qty, Avg Cost, Price, Mkt Value, Gain/Loss $, Gain/Loss %, and 7-Day Trend (SCRUM-20322)
- Column sort with ascending/descending toggle, `aria-sort` attributes, and sort indicator icons
- Search input filtering holdings by symbol or name (case-insensitive)
- Inline `TrendSparkline` component rendering a small Recharts `LineChart` with emerald for positive trend and rose for negative trend
- Gain/loss color coding — emerald for gains, rose for losses — applied to both dollar and percentage columns
- Empty state with custom SVG illustration for users with no holdings

#### Activity History
- Chronological transaction list with type-specific icons and color-coded badges for deposit, withdrawal, transfer, payment, fee, interest, dividend, and refund (SCRUM-20323)
- Filter panel with search input (symbol or description), transaction type dropdown, start date picker, and end date picker
- Active filter indicator showing result count with reset filters button
- Signed amount formatting with `+` prefix for positive and color coding (emerald positive, rose negative)
- Empty state for no matching filters and for users with no activity

#### Documents Page
- Documents grouped by category in collapsible sections — Statements, Tax Documents, Contracts, Reports, Notices (SCRUM-20324)
- Category headers with document count, type-specific icons, and animated expand/collapse via Framer Motion
- Document rows displaying name, date, and file size with download icon on hover
- Simulated download on document click — creates a text blob, triggers anchor download, and shows success toast notification
- Filter panel with search input and category dropdown

#### Products & Services
- Responsive product card grid with category icons, descriptions, feature bullet lists, rate/pricing info, and minimum investment details (SCRUM-20325)
- Recommended products banner highlighting starred products
- Category filter dropdown and search input with reset functionality
- Hover animations via Framer Motion `whileHover` and `whileTap`
- Category badge color coding for Banking, Investing, Insurance, Lending, Retirement, and Credit Cards

#### Profile & Settings Module
- **Personal Information** — inline-editable fields for first name, last name, email, phone, date of birth, and account type with save/cancel buttons, Enter/Escape keyboard shortcuts, and field-level validation (SCRUM-20326)
- **Communication Preferences** — toggle switches for email notifications, SMS alerts, monthly statements, marketing communications, and push notifications with immediate persistence and success toast
- **Security** — password update form with current/new/confirm fields, password strength meter with requirements checklist, show/hide password toggles, and form validation; two-factor authentication toggle with simulated QR code modal and method selection (authenticator app or SMS); login alerts toggle; session timeout selector; trusted devices display
- **Bank Management** — linked bank accounts list with verified badge, primary account indicator, set primary and remove actions with confirmation; add bank modal with bank name, routing number, account number, and type fields plus 3-second simulated verification with animated progress bar
- **Beneficiaries** — beneficiary list with initials avatar, relationship badge, date of birth, and share percentage; add/edit modal with validation ensuring total shares do not exceed 100%; share allocation summary with progress bar and fully-allocated indicator; remove with confirmation
- **Cost Basis Method** — selector for FIFO, LIFO, Specific Identification, and Average Cost with detailed explanation text for each method; mock tax lot details table with symbol, purchase date, quantity, cost per share, cost basis, market value, and gain/loss columns

#### Theme Support
- Light and dark mode with system preference detection and manual toggle (SCRUM-20318)
- `ThemeContext` persisting preference to `localStorage` and applying `dark` class on `document.documentElement`
- `ThemeToggle` button with Framer Motion rotation animation between Sun and Moon icons
- Environment variable override via `VITE_DEFAULT_DARK_MODE`

#### Responsive Design
- Mobile-first responsive layout with Tailwind breakpoints `sm:`, `md:`, `lg:`, `xl:` (SCRUM-20319)
- Hamburger drawer navigation for mobile viewports, desktop horizontal nav links for `md:` and above
- Responsive grid layouts for dashboard cards, account cards, product cards, and form fields
- Overflow-x scroll for holdings table on narrow viewports

#### Micro-interactions & Transitions
- Page transition animations via `PageTransition` component with fade-and-slide-up enter and fade-and-slide-down exit (SCRUM-20320)
- Staggered container animations with `containerVariants` and `itemVariants` across all page components
- Card hover scale and lift animations via Framer Motion `whileHover`
- Toast notification slide-in from right with hover-pause auto-dismiss timer
- Animated toggle switches with spring physics for communication and security preferences
- Navigation bar active route underline with `layoutId` shared layout animation

#### Skeleton Loaders
- `SkeletonLoader` component with seven variants — text, card, table, chart, avatar, profile, and list (SCRUM-20320)
- `useSkeletonDelay` hook returning a loading boolean that transitions from `true` to `false` after a random delay between 400ms and 600ms
- Pulse animation on skeleton blocks with dark mode support

#### Shared Components
- `Modal` — accessible dialog with portal rendering, backdrop blur, focus trap, escape key close, outside click close, ARIA roles, focus restoration, and configurable size
- `EmptyState` — themed SVG illustration with title, description, and optional CTA button
- `DataTooltip` — custom Recharts tooltip with glassmorphism styling supporting currency, percent, and number formats
- `Toast` — notification component with success, error, info, and warning variants, auto-dismiss with hover pause, and slide-in animation
- `TrendSparkline` — inline Recharts `LineChart` for 7-day price trend with directional color coding

#### Data Layer
- `storageAdapter` — browser storage abstraction with `localStorage` primary and `sessionStorage` fallback, JSON serialization, quota exceeded handling, and corruption recovery
- `usePortfolioStore` — portfolio data hook computing total values, gain/loss, allocation percentages, and smart insights
- `useHoldingsStore` — holdings data hook with sort, search, and derived field recomputation
- `useActivityStore` — activity data hook with type, search, and date range filters
- `useDocumentsStore` — documents data hook with category grouping, search, and download simulation
- `useProductsStore` — products data hook with category filtering and search
- `useProfileStore` — profile data hook with field-level update, communication preferences, security settings, bank accounts, beneficiaries, and cost basis method management

#### Utilities
- `formatters.js` — currency, percentage, number, date, relative date, and greeting formatters with locale support
- `validators.js` — field-level and form-level validation for signup and profile forms including email uniqueness, password strength, phone format, DOB age check, and name length
- `helpers.js` — UUID generation, sparkline data generation, gain/loss calculation, portfolio value calculation, beneficiary share summation, debounce, and class name merging
- `constants.js` — route paths, storage keys, account types, transaction types, document categories, product categories, theme configuration, color palette, chart colors, validation rules, and locale defaults

#### Testing
- Integration tests for `NavigationBar` — nav link rendering, active route highlighting, hamburger menu open/close, mobile drawer content, profile dropdown, theme toggle, accessibility attributes
- Integration tests for `LoginPage` — user card rendering, card click authentication, theme toggle, signup link, accessibility labels
- Integration tests for `AccountsDashboard` — dynamic greeting by time of day, portfolio summary cards, smart insights, donut chart with legend, account cards, onboarding widget for new users, gain/loss display
- Integration tests for `HoldingsPage` — table column headers, holdings data rendering, sparkline rendering, search filtering, sort functionality with `aria-sort`, gain/loss display, empty state, reset functionality
- Integration tests for `ProfilePage` — field rendering, edit mode entry, save persistence to `localStorage`, cancel revert, Enter/Escape keyboard shortcuts, validation errors with `aria-invalid` and `role="alert"`, security overview, cost basis method, account type editing
- Unit tests for `formatters` — currency, percentage, number, date, relative date, and greeting with edge cases for null, undefined, NaN, Infinity, and boundary times
- Unit tests for `validators` — `isRequired`, `isValidEmail`, `emailExists`, `validatePassword`, `isValidPhone`, `isValidDOB`, `isValidName`, `isValidAccountType`, `validateSignup`, `validateProfile`, `validateField` with comprehensive edge cases
- Unit tests for `storageAdapter` — get/set/remove/clear/has operations, `localStorage` fallback to `sessionStorage`, quota exceeded handling, corrupted JSON recovery, complex data round-trips, both storages unavailable

#### Infrastructure
- Vite 5 build configuration with React plugin, path aliases, manual chunks for vendor/charts/motion, and chunk size warning limit
- Vitest configuration with jsdom environment, global test utilities, and setup file for storage mocks
- Tailwind CSS 3 configuration with custom font families, glassmorphism utilities, animation keyframes, and dark mode via `class` strategy
- PostCSS configuration with Tailwind CSS and Autoprefixer plugins
- Vercel deployment configuration with SPA rewrite rule
- Environment variable support via `.env` with `VITE_APP_TITLE`, `VITE_API_BASE_URL`, `VITE_DEFAULT_DARK_MODE`, `VITE_DEFAULT_CURRENCY`, and `VITE_DEFAULT_LOCALE`