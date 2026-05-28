/**
 * Root application component with routing and providers
 * Wraps app in ThemeProvider, AuthProvider, and ToastProvider.
 * Configures React Router v6 with BrowserRouter for public and protected routes.
 * Uses AnimatePresence with useLocation for page transitions.
 * Implements SCRUM-20313: Session Management
 * Implements SCRUM-20314: Top Navigation Bar
 * Implements SCRUM-20319: Responsive Design
 * @module App
 */

import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { ProtectedRoute } from './components/layout/ProtectedRoute.jsx';
import { AppLayout } from './components/layout/AppLayout.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { SignupPage } from './pages/SignupPage.jsx';
import { AccountsDashboard } from './pages/AccountsDashboard.jsx';
import { HoldingsPage } from './pages/HoldingsPage.jsx';
import { ActivityPage } from './pages/ActivityPage.jsx';
import { DocumentsPage } from './pages/DocumentsPage.jsx';
import { ProductsPage } from './pages/ProductsPage.jsx';
import { ProfilePage } from './pages/profile/ProfilePage.jsx';
import { CommunicationPreferences } from './pages/profile/CommunicationPreferences.jsx';
import { SecurityPage } from './pages/profile/SecurityPage.jsx';
import { BankManagement } from './pages/profile/BankManagement.jsx';
import { BeneficiariesPage } from './pages/profile/BeneficiariesPage.jsx';
import { CostBasisPage } from './pages/profile/CostBasisPage.jsx';
import { NotFoundPage } from './pages/NotFoundPage.jsx';
import { ROUTES } from './utils/constants.js';

/**
 * Animated routes component that uses useLocation for page transitions.
 * Wraps Routes in AnimatePresence keyed by pathname.
 *
 * @returns {JSX.Element}
 */
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public routes */}
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<SignupPage />} />

        {/* Redirect root to dashboard */}
        <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.DASHBOARD} replace />} />

        {/* Protected routes wrapped in AppLayout */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout>
                <AnimatedRoutes.Outlet />
              </AppLayout>
            </ProtectedRoute>
          }
        >
          <Route path={ROUTES.DASHBOARD} element={<AccountsDashboard />} />
          <Route path={ROUTES.ACCOUNTS} element={<HoldingsPage />} />
          <Route path={ROUTES.TRANSACTIONS} element={<ActivityPage />} />
          <Route path={ROUTES.DOCUMENTS} element={<DocumentsPage />} />
          <Route path={ROUTES.PRODUCTS} element={<ProductsPage />} />
          <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
          <Route path="/profile/communication" element={<CommunicationPreferences />} />
          <Route path="/profile/security" element={<SecurityPage />} />
          <Route path="/profile/banks" element={<BankManagement />} />
          <Route path="/profile/beneficiaries" element={<BeneficiariesPage />} />
          <Route path="/profile/cost-basis" element={<CostBasisPage />} />
          <Route path={ROUTES.SETTINGS} element={<CommunicationPreferences />} />
        </Route>

        {/* Catch-all 404 */}
        <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
      </Routes>
    </AnimatePresence>
  );
}

/**
 * Application routes component that renders protected routes
 * using Outlet for nested route rendering within AppLayout.
 *
 * @returns {JSX.Element}
 */
function AppRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public routes */}
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<SignupPage />} />

        {/* Redirect root to dashboard */}
        <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.DASHBOARD} replace />} />

        {/* Protected routes wrapped in ProtectedRoute + AppLayout */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout>
                {null}
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Protected routes with AppLayout */}
        <Route
          path={ROUTES.DASHBOARD}
          element={
            <ProtectedRoute>
              <AppLayout>
                <AccountsDashboard />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ACCOUNTS}
          element={
            <ProtectedRoute>
              <AppLayout>
                <HoldingsPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.TRANSACTIONS}
          element={
            <ProtectedRoute>
              <AppLayout>
                <ActivityPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.DOCUMENTS}
          element={
            <ProtectedRoute>
              <AppLayout>
                <DocumentsPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.PRODUCTS}
          element={
            <ProtectedRoute>
              <AppLayout>
                <ProductsPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.PROFILE}
          element={
            <ProtectedRoute>
              <AppLayout>
                <ProfilePage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/communication"
          element={
            <ProtectedRoute>
              <AppLayout>
                <CommunicationPreferences />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/security"
          element={
            <ProtectedRoute>
              <AppLayout>
                <SecurityPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/banks"
          element={
            <ProtectedRoute>
              <AppLayout>
                <BankManagement />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/beneficiaries"
          element={
            <ProtectedRoute>
              <AppLayout>
                <BeneficiariesPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/cost-basis"
          element={
            <ProtectedRoute>
              <AppLayout>
                <CostBasisPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.SETTINGS}
          element={
            <ProtectedRoute>
              <AppLayout>
                <CommunicationPreferences />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Catch-all 404 */}
        <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
      </Routes>
    </AnimatePresence>
  );
}

/**
 * Root application component.
 * Wraps the entire application in ThemeProvider, AuthProvider, ToastProvider,
 * and BrowserRouter. Renders the application routes.
 *
 * @returns {JSX.Element}
 *
 * @example
 * <App />
 */
export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;