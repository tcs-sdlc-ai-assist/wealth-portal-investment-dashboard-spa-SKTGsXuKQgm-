# Deployment

This document covers deploying the **Wealth Portal** application to [Vercel](https://vercel.com) as a static single-page application (SPA).

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Build Configuration](#build-configuration)
- [Environment Variables](#environment-variables)
- [Vercel Deployment](#vercel-deployment)
  - [SPA Rewrite Configuration](#spa-rewrite-configuration)
  - [Deploy via Vercel CLI](#deploy-via-vercel-cli)
  - [Deploy via Vercel Dashboard](#deploy-via-vercel-dashboard)
- [Preview Deployments](#preview-deployments)
- [CI/CD with GitHub Integration](#cicd-with-github-integration)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- [npm](https://www.npmjs.com/) v9 or later
- A [Vercel](https://vercel.com) account (free tier is sufficient)
- (Optional) [Vercel CLI](https://vercel.com/docs/cli) installed globally:

  ```
  npm install -g vercel
  ```

---

## Build Configuration

The project uses **Vite 5** as the build tool. The production build is created with:

```
npm run build
```

This outputs static assets to the `dist/` directory. The build includes:

- Manual chunk splitting for `vendor` (React, React DOM, React Router), `charts` (Recharts), and `motion` (Framer Motion)
- Chunk size warning limit set to 1000 KB
- Path alias `@` mapped to `src/`

To preview the production build locally before deploying:

```
npm run preview
```

This starts a local static server serving the `dist/` directory on `http://localhost:4173`.

---

## Environment Variables

The application reads environment variables prefixed with `VITE_` at **build time** via `import.meta.env`. These must be configured in the Vercel project settings or in a local `.env` file during development.

| Variable                  | Required | Default         | Description                                              |
| ------------------------- | -------- | --------------- | -------------------------------------------------------- |
| `VITE_APP_TITLE`          | No       | `Wealth Portal` | Application title displayed in the browser tab and header |
| `VITE_API_BASE_URL`       | No       | `/api`          | Base URL for API requests (unused in mock-only mode)      |
| `VITE_DEFAULT_DARK_MODE`  | No       | `false`         | Set to `true` to enable dark mode by default              |
| `VITE_DEFAULT_CURRENCY`   | No       | `USD`           | ISO 4217 currency code for formatting monetary values     |
| `VITE_DEFAULT_LOCALE`     | No       | `en-US`         | BCP 47 locale string for number and date formatting       |

> **Note:** Because Vite inlines environment variables at build time, changing a variable requires a new build. They are **not** read at runtime from the server environment.

### Setting Environment Variables on Vercel

1. Navigate to your project in the [Vercel Dashboard](https://vercel.com/dashboard).
2. Go to **Settings** → **Environment Variables**.
3. Add each variable with the appropriate value.
4. Select the environments where the variable should apply: **Production**, **Preview**, and/or **Development**.
5. Redeploy for changes to take effect.

---

## Vercel Deployment

### SPA Rewrite Configuration

The project includes a `vercel.json` file at the repository root that configures Vercel to serve `index.html` for all routes. This is required for client-side routing with React Router to work correctly:

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

This ensures that navigating directly to a route like `/dashboard` or `/accounts` returns the SPA shell instead of a 404 error.

### Deploy via Vercel CLI

1. Install dependencies and build the project:

   ```
   npm install
   npm run build
   ```

2. Log in to Vercel (first time only):

   ```
   vercel login
   ```

3. Deploy to a preview URL:

   ```
   vercel
   ```

4. Deploy to production:

   ```
   vercel --prod
   ```

During the first deployment, the CLI will prompt you to configure the project. Use the following settings:

| Setting              | Value        |
| -------------------- | ------------ |
| **Framework Preset** | Vite         |
| **Build Command**    | `npm run build` |
| **Output Directory** | `dist`       |
| **Install Command**  | `npm install`   |

### Deploy via Vercel Dashboard

1. Push your code to a GitHub, GitLab, or Bitbucket repository.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
3. Vercel will auto-detect the Vite framework. Verify the following settings:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
4. Add any required environment variables under **Environment Variables**.
5. Click **Deploy**.

---

## Preview Deployments

Vercel automatically creates a **preview deployment** for every push to a non-production branch and for every pull request. Each preview deployment receives a unique URL (e.g., `https://wealth-portal-abc123.vercel.app`).

Preview deployments:

- Use environment variables scoped to the **Preview** environment in Vercel settings.
- Are ideal for QA review, design review, and stakeholder feedback before merging to production.
- Are automatically updated when new commits are pushed to the same branch or pull request.
- Do not affect the production deployment.

To promote a preview deployment to production via the CLI:

```
vercel promote <deployment-url>
```

---

## CI/CD with GitHub Integration

When you connect your GitHub repository to Vercel, the following automated workflow is enabled:

### Automatic Deployments

| Trigger                          | Deployment Type | URL                                  |
| -------------------------------- | --------------- | ------------------------------------ |
| Push to `main` (or default branch) | **Production**  | Your custom domain or `*.vercel.app` |
| Push to any other branch         | **Preview**     | Unique preview URL per commit        |
| Pull request opened/updated      | **Preview**     | Unique preview URL per PR            |

### Running Tests Before Deployment

To run the test suite before Vercel builds the project, you can configure a custom build command that runs tests first:

1. In the Vercel Dashboard, go to **Settings** → **General** → **Build & Development Settings**.
2. Set the **Build Command** to:

   ```
   npm run test && npm run build
   ```

   This ensures the build only succeeds if all tests pass.

Alternatively, use a GitHub Actions workflow for more control:

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: npm
      - run: npm ci
      - run: npm run test
```

With this workflow, tests run in GitHub Actions independently of the Vercel build. You can configure branch protection rules on GitHub to require the CI workflow to pass before merging.

### Vercel GitHub Integration Features

- **Deployment status checks** appear on pull requests, linking directly to the preview URL.
- **Comments on pull requests** with the preview deployment URL (enabled by default).
- **Automatic aliasing** — the production branch deployment is aliased to your custom domain.
- **Instant rollbacks** — revert to any previous production deployment from the Vercel Dashboard.

---

## Troubleshooting

### Routes return 404 on direct navigation

Ensure `vercel.json` is present at the repository root with the SPA rewrite rule. Without it, Vercel will attempt to serve static files for each route and return 404 for client-side routes.

### Environment variables are not applied

- Verify the variable names are prefixed with `VITE_`.
- Confirm the variables are set for the correct environment (Production, Preview, or Development) in the Vercel Dashboard.
- Redeploy after adding or changing environment variables — Vite inlines them at build time.

### Build fails with out-of-memory error

The default Vercel build environment provides sufficient memory for this project. If you encounter memory issues with larger builds, set the `NODE_OPTIONS` environment variable:

```
NODE_OPTIONS=--max-old-space-size=4096
```

### Tests fail during build

If you configured the build command to run tests (`npm run test && npm run build`), ensure all test dependencies are listed in `devDependencies` in `package.json`. Vercel installs dev dependencies by default during the build step.

### Dark mode flickers on initial load

The `ThemeProvider` reads the stored theme preference from `localStorage` and applies the `dark` class to `document.documentElement` synchronously during initialization. If you experience a flash of the wrong theme, ensure no server-side rendering or pre-rendering is configured — this application is a fully client-side SPA.