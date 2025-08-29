// src/components/common/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore(state => !!state.accessToken);
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login with the current location as return URL
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
};

export default ProtectedRoute;
