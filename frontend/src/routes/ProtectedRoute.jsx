import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Loader from '../components/ui/Loader';
import { selectIsHR } from '../context/authSlice';

const ProtectedRoute = ({ requireHR = false, requireEmployee = false }) => {
  const { isAuthenticated, isInitialized, loading } = useSelector((state) => state.auth);
  const isHR = useSelector(selectIsHR);

  // If checkAuthStatus hasn't completed and we don't have a cached session, show full page loader
  if (!isInitialized && loading) {
    return <Loader fullPage />;
  }

  // If not authenticated, redirect to Login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If HR access required but user is not HR, redirect to employee home
  if (requireHR && !isHR) {
    return <Navigate to="/employee/dashboard" replace />;
  }

  // If employee access required but user is HR, redirect to HR home
  if (requireEmployee && isHR) {
    return <Navigate to="/hr/dashboard" replace />;
  }

  // Render children (the Outlet)
  return <Outlet />;
};

export default ProtectedRoute;
