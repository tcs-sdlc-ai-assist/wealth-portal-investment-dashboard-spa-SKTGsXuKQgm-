# Wealth Portal

A modern, responsive financial portfolio management dashboard built with React 18 and Vite. Track accounts, holdings, activity, documents, and products with real-time insights, interactive charts, and a polished glassmorphism UI.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Development](#development)
  - [Production Build](#production-build)
  - [Preview](#preview)
  - [Testing](#testing)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Browser Compatibility](#browser-compatibility)
- [License](#license)

---

## Features

### Authentication & Session Management
- Mock login UI with pre-seeded user card selection — avatar initials, full name, email, account type badge, and last login timestamp
- Signup page with full form validation — inline error messages and shake animation on invalid fields
- Session management with `AuthContext` — persists authenticated user to `localStorage`, redirects unauthenticated users to `/login` via `ProtectedRoute` guard
- Five pre-seeded mock users with complete portfolio data
- Password strength meter with segmented bar and requirements checklist

### Navigation & Layout
- Top navigation bar with glassmorphism styling and responsive hamburger drawer for mobile
- Animated active route underline via Framer Motion `layoutId`
- Profile avatar dropdown with links to Profile, Communication Preferences, Security, Bank Management, Beneficiaries, and Cost Basis
- `AppLayout` wrapper with fixed navigation bar and responsive content padding

### Accounts Dashboard
- Dynamic time-based greeting (morning, afternoon, evening, night)
- Animated portfolio value ticker with ease-out cubic easing
- Portfolio summary cards for total account value, market value, gain/loss, and holdings count
- Smart insights engine generating contextual messages based on portfolio performance
- Interactive donut chart (Recharts `PieChart`) for portfolio allocation with hover-to-highlight slices and center label overlay
- Account cards grid with type icons, masked account numbers, and type badges
- Onboarding widget for new users with empty portfolios

### Holdings Table
- Sortable table with nine columns — Symbol, Name, Qty, Avg Cost, Price, Mkt Value, Gain/Loss $, Gain/Loss %, and 7-Day Trend
- Column sort with ascending/descending toggle and `aria-sort` attributes
- Search input filtering by symbol or name (case-insensitive)
- Inline `TrendSparkline` component with directional color coding
- Gain/loss color coding — emerald for gains, rose for losses

### Activity History
- Chronological transaction list with type-specific icons and color-coded badges
- Filter panel with search input, transaction type dropdown, start date picker, and end date picker
- Active filter indicator with result count and reset filters button
- Signed amount formatting with color coding

### Documents
- Documents grouped by category in collapsible sections — Statements, Tax Documents, Contracts, Reports, Notices
- Category headers with document count and animated expand/collapse
- Simulated download with success toast notification
- Filter panel with search input and category dropdown

### Products & Services
- Responsive product card grid with category icons, descriptions, feature bullet lists, and rate/pricing info
- Recommended products banner
- Category filter dropdown and search input
- Hover animations via Framer Motion

### Profile & Settings
- **Personal Information** — inline-editable fields with save/cancel, Enter/Escape keyboard shortcuts, and field-level validation
- **Communication Preferences** — toggle switches with immediate persistence and success toast
- **Security** — password update form with strength meter, two-factor authentication toggle with simulated QR code modal, login alerts toggle, session timeout selector, trusted devices display
- **Bank Management** — linked bank accounts list with add/remove actions and 3-second simulated verification with animated progress bar
- **Beneficiaries** — beneficiary list with add/edit modal, share allocation summary with progress bar
- **Cost Basis Method** — selector for FIFO, LIFO, Specific Identification, and Average Cost with mock tax lot details table

### Theme Support
- Light and dark mode with system preference detection and manual toggle
- Theme preference persisted to `localStorage`
- Framer Motion rotation animation between Sun and Moon icons

### Responsive Design
- Mobile-first responsive layout with Tailwind breakpoints
- Hamburger drawer navigation for mobile, desktop horizontal nav links for `md:` and above
- Responsive grid layouts for dashboard cards, account cards, product cards, and form fields

### Micro-interactions & Transitions
- Page transition animations with fade-and-slide-up enter and fade-and-slide-down exit
- Staggered container animations across all page components
- Card hover scale and lift animations
- Toast notification slide-in with hover-pause auto-dismiss timer
- Animated toggle switches with spring physics

### Skeleton Loaders
- Seven variants — text, card, table, chart, avatar, profile, and list
- Random delay between 400ms and 600ms before content renders

---

## Tech Stack

| Technology | Version | Purpose |
| --- | --- | --- |
| [React](https://react.dev/) | 18.3 | UI component library |
| [Vite](https://vitejs.dev/) | 5.3 | Build tool and dev server |
| [Tailwind CSS](https://tailwindcss.com/) | 3.4 | Utility-first CSS framework |
| [Framer Motion](https://www.framer.com/motion/) | 11.2 | Animation library |
| [Recharts](https://recharts.org/) | 2.12 | Charting library (PieChart, LineChart) |
| [Lucide React](https://lucide.dev/) | 0.395 | Icon library |
| [React Router](https://reactrouter.com/) | 6.23 | Client-side routing |
| [date-fns](https://date-fns.org/) | 3.6 | Date formatting and manipulation |
| [prop-types](https://www.npmjs.com/package/prop-types) | 15.8 | Runtime prop type checking |
| [Vitest](https://vitest.dev/) | 1.6 | Unit and integration testing |
| [Testing Library](https://testing-library.com/) | 16.0 | React component testing utilities |

---

## Folder Structure

```
wealth-portal/
├── index.html                          # HTML entry point
├── package.json                        # Dependencies and scripts
├── vite.config.js                      # Vite build configuration
├── vitest.config.js                    # Vitest test configuration
├── tailwind.config.js                  # Tailwind CSS configuration
├── postcss.config.js                   # PostCSS plugins
├── vercel.json                         # Vercel deployment configuration
├── .env.example                        # Environment variable template
├── src/
│   ├── main.jsx                        # Application entry point
│   ├── App.jsx                         # Root component with routing and providers
│   ├── index.css                       # Global styles and Tailwind directives
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.jsx           # Authenticated page layout wrapper
│   │   │   ├── NavigationBar.jsx       # Main navigation bar
│   │   │   ├── NavigationBar.test.jsx  # Navigation bar tests
│   │   │   ├── HamburgerDrawer.jsx     # Mobile navigation drawer
│   │   │   ├── ProfileDropdown.jsx     # Profile avatar dropdown menu
│   │   │   └── ProtectedRoute.jsx      # Authentication route guard
│   │   └── shared/
│   │       ├── DataTooltip.jsx         # Custom Recharts tooltip
│   │       ├── EmptyState.jsx          # Empty state illustration
│   │       ├── Modal.jsx               # Accessible modal dialog
│   │       ├── PageTransition.jsx      # Page transition wrapper
│   │       ├── PasswordStrengthMeter.jsx # Password strength indicator
│   │       ├── SkeletonLoader.jsx      # Skeleton loading placeholders
│   │       ├── ThemeToggle.jsx         # Light/dark mode toggle
│   │       ├── Toast.jsx               # Toast notification component
│   │       └── TrendSparkline.jsx      # Inline sparkline chart
│   ├── context/
│   │   ├── AuthContext.jsx             # Authentication state provider
│   │   ├── ThemeContext.jsx            # Theme state provider
│   │   └── ToastContext.jsx            # Toast notification provider
│   ├── data/
│   │   └── mockData.js                 # Pre-seeded mock users and products
│   ├── hooks/
│   │   ├── useActivityStore.js         # Activity data with filters
│   │   ├── useDocumentsStore.js        # Documents data with grouping
│   │   ├── useHoldingsStore.js         # Holdings data with sort/search
│   │   ├── usePortfolioStore.js        # Portfolio data with insights
│   │   ├── useProductsStore.js         # Products data with filters
│   │   ├── useProfileStore.js          # Profile data with field-level updates
│   │   └── useSkeletonDelay.js         # Skeleton loader delay hook
│   ├── pages/
│   │   ├── AccountsDashboard.jsx       # Dashboard with portfolio overview
│   │   ├── AccountsDashboard.test.jsx  # Dashboard tests
│   │   ├── ActivityPage.jsx            # Activity history with filters
│   │   ├── DocumentsPage.jsx           # Documents with category grouping
│   │   ├── HoldingsPage.jsx            # Holdings table with sparklines
│   │   ├── HoldingsPage.test.jsx       # Holdings page tests
│   │   ├── LoginPage.jsx               # Mock login with user cards
│   │   ├── LoginPage.test.jsx          # Login page tests
│   │   ├── NotFoundPage.jsx            # 404 page
│   │   ├── ProductsPage.jsx            # Products & services grid
│   │   ├── SignupPage.jsx              # Registration with validation
│   │   └── profile/
│   │       ├── BankManagement.jsx      # Bank account management
│   │       ├── BeneficiariesPage.jsx   # Beneficiaries management
│   │       ├── CommunicationPreferences.jsx # Notification toggles
│   │       ├── CostBasisPage.jsx       # Cost basis method selection
│   │       ├── ProfilePage.jsx         # Personal information
│   │       ├── ProfilePage.test.jsx    # Profile page tests
│   │       └── SecurityPage.jsx        # Security settings
│   ├── test/
│   │   └── setup.js                    # Test setup with storage mocks
│   └── utils/
│       ├── constants.js                # Application-wide constants
│       ├── formatters.js               # Currency, date, number formatters
│       ├── formatters.test.js          # Formatter tests
│       ├── helpers.js                  # General-purpose utilities
│       ├── storageAdapter.js           # Browser storage abstraction
│       ├── storageAdapter.test.js      # Storage adapter tests
│       ├── validators.js               # Form validation utilities
│       └── validators.test.js          # Validator tests
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- [npm](https://www.npmjs.com/) v9 or later

### Installation

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd wealth-portal
npm install
```

### Development

Start the development server with hot module replacement:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

### Production Build

Create an optimized production build:

```bash
npm run build
```

The output is written to the `dist/` directory. The build includes:

- Manual chunk splitting for `vendor` (React, React DOM, React Router), `charts` (Recharts), and `motion` (Framer Motion)
- Chunk size warning limit set to 1000 KB
- Path alias `@` mapped to `src/`

### Preview

Preview the production build locally:

```bash
npm run preview
```

This starts a local static server on `http://localhost:4173`.

### Testing

Run the full test suite:

```bash
npm test
```

Run tests in watch mode during development:

```bash
npm run test:watch
```

The test suite uses [Vitest](https://vitest.dev/) with [jsdom](https://github.com/jsdom/jsdom) environment and [@testing-library/react](https://testing-library.com/docs/react-testing-library/intro/) for component testing.

---

## Environment Variables

Create a `.env` file in the project root (see `.env.example` for reference). All variables are optional and have sensible defaults.

| Variable | Default | Description |
| --- | --- | --- |
| `VITE_APP_TITLE` | `Wealth Portal` | Application title displayed in the browser tab and header |
| `VITE_API_BASE_URL` | `/api` | Base URL for API requests (unused in mock-only mode) |
| `VITE_DEFAULT_DARK_MODE` | `false` | Set to `true` to enable dark mode by default |
| `VITE_DEFAULT_CURRENCY` | `USD` | ISO 4217 currency code for formatting monetary values |
| `VITE_DEFAULT_LOCALE` | `en-US` | BCP 47 locale string for number and date formatting |

> **Note:** Vite inlines environment variables at build time via `import.meta.env`. Changing a variable requires a new build.

---

## Deployment

The project is configured for deployment to [Vercel](https://vercel.com) as a static single-page application.

### Quick Deploy

1. Push your code to a GitHub repository.
2. Import the repository at [vercel.com/new](https://vercel.com/new).
3. Vercel auto-detects the Vite framework. Verify:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
4. Add any environment variables under **Environment Variables**.
5. Click **Deploy**.

### SPA Rewrite

The included `vercel.json` configures a catch-all rewrite so that all routes serve `index.html`, enabling client-side routing with React Router:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Deploy via CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

For more details, see [DEPLOYMENT.md](./DEPLOYMENT.md).

---

## Browser Compatibility

Wealth Portal supports all modern evergreen browsers:

- Chrome 90+
- Firefox 90+
- Safari 15+
- Edge 90+

The application uses modern JavaScript features including optional chaining, nullish coalescing, `crypto.randomUUID()`, and CSS features including `backdrop-filter` for glassmorphism effects.

---

## License

This project is private and proprietary.