/**
 * Authentication route guard component
 * Checks useAuth().isAuthenticated and redirects to /login if not authenticated.
 * Otherwise renders children or an Outlet for nested routes.
 * Implements FR-003: Session Management / Route Protection
 * Implements SCRUM-20313: Session Management
 * @module ProtectedRoute
 */

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROUTES } from '../../utils/constants.js';

/**
 * Route guard component that protects authenticated routes.
 * If the user is not authenticated, redirects to the login page
 * while preserving the attempted location in router state so the
 * user can be redirected back after successful login.
 *
 * If children are provided they are rendered directly; otherwise
 * an <Outlet /> is rendered to support nested route configurations.
 *
 * @param {Object} props
 * @param {React.ReactNode} [props.children] - Optional child elements to render when authenticated
 * @returns {JSX.Element}
 *
 * @example
 * // Usage with children
 * <Route
 *   path="/dashboard"
 *   element={
 *     <ProtectedRoute>
 *       <DashboardPage />
 *     </ProtectedRoute>
 *   }
 * />
 *
 * @example
 * // Usage with nested routes (Outlet)
 * <Route element={<ProtectedRoute />}>
 *   <Route path="/dashboard" element={<DashboardPage />} />
 *   <Route path="/accounts" element={<AccountsPage />} />
 * </Route>
 */
export function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate
        to={ROUTES.LOGIN}
        state={{ from: location }}
        replace
      />
    );
  }

  return children ? children : <Outlet />;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node,
};

export default ProtectedRoute;