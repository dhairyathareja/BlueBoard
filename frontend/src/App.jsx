import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuthStatus, selectIsHR } from './context/authSlice';

// Layouts (loaded eagerly since they frame every page)
import HRLayout from './components/layout/HRLayout';
import EmployeeLayout from './components/layout/EmployeeLayout';

// Route Guards
import ProtectedRoute from './routes/ProtectedRoute';

// Shared loader for suspense fallback
import Loader from './components/ui/Loader';

// Lazy-loaded Pages — code-split for optimal bundle size
const Login = lazy(() => import('./pages/auth/Login'));

const HRDashboard = lazy(() => import('./pages/hr/Dashboard'));
const Employees = lazy(() => import('./pages/hr/Employees'));
const EmployeeDetails = lazy(() => import('./pages/hr/EmployeeDetails'));
const Roles = lazy(() => import('./pages/hr/Roles'));
const AWSProfiles = lazy(() => import('./pages/hr/AWSProfiles'));
const Documents = lazy(() => import('./pages/hr/Documents'));
const Settings = lazy(() => import('./pages/hr/Settings'));

const EmployeeDashboard = lazy(() => import('./pages/employee/Dashboard'));
const MyDocuments = lazy(() => import('./pages/employee/MyDocuments'));
const AWSDetails = lazy(() => import('./pages/employee/AWSDetails'));
const Profile = lazy(() => import('./pages/employee/Profile'));

const App = () => {
  const dispatch = useDispatch();
  const { isInitialized, isAuthenticated } = useSelector((state) => state.auth);
  const isHR = useSelector(selectIsHR);

  useEffect(() => {
    dispatch(checkAuthStatus());
  }, [dispatch]);

  // Show a full-page loader while auth state is being resolved
  if (!isInitialized) {
    return <Loader fullPage />;
  }

  return (
    <Suspense fallback={<Loader fullPage />}>
      <Routes>
        {/* Public Route — Login */}
        <Route path="/login" element={<Login />} />

        {/* HR Protected Routes */}
        <Route element={<ProtectedRoute requireHR />}>
          <Route element={<HRLayout />}>
            <Route path="/hr/dashboard" element={<HRDashboard />} />
            <Route path="/hr/employees" element={<Employees />} />
            <Route path="/hr/employees/:id" element={<EmployeeDetails />} />
            <Route path="/hr/roles" element={<Roles />} />
            <Route path="/hr/aws-profiles" element={<AWSProfiles />} />
            <Route path="/hr/documents" element={<Documents />} />
            <Route path="/hr/settings" element={<Settings />} />
          </Route>
        </Route>

        {/* Employee Protected Routes */}
        <Route element={<ProtectedRoute requireEmployee />}>
          <Route element={<EmployeeLayout />}>
            <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
            <Route path="/employee/documents" element={<MyDocuments />} />
            <Route path="/employee/aws-details" element={<AWSDetails />} />
            <Route path="/employee/profile" element={<Profile />} />
          </Route>
        </Route>

        {/* Catch-all Redirect */}
        <Route
          path="*"
          element={
            isAuthenticated ? (
              <Navigate to={isHR ? '/hr/dashboard' : '/employee/dashboard'} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Suspense>
  );
};

export default App;
