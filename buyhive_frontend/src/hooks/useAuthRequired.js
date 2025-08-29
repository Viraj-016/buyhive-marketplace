// src/hooks/useAuthRequired.js
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const useAuthRequired = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAuthStore(state => !!state.accessToken);

  const requireAuth = (action, callback) => {
    if (isAuthenticated) {
      // User is authenticated, execute the callback
      if (callback) callback();
      return true;
    } else {
      // User is not authenticated, redirect to login
      navigate('/login', { 
        state: { 
          from: location.pathname,
          message: `Please sign in to ${action.toLowerCase()}.`,
          returnTo: location.pathname
        }
      });
      return false;
    }
  };

  return { isAuthenticated, requireAuth };
};

export default useAuthRequired;
