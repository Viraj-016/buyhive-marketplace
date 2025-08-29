// src/components/common/ProtectedAction.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import LoginPromptModal from './LoginPromptModal';

const ProtectedAction = ({
  children,
  action = "continue shopping",
  onAction,
  useModal = true,
  redirectToLogin = false,
  fallback
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, setReturnUrl } = useAuthStore();
  const [showModal, setShowModal] = useState(false);

  const handleClick = (e) => {
    if (isAuthenticated()) {
      // User is authenticated, execute the action
      if (onAction) {
        onAction(e);
      }
    } else {
      // User is not authenticated
      e.preventDefault();
      
      if (redirectToLogin) {
        // Set return URL and redirect to login
        setReturnUrl(location.pathname);
        navigate('/login');
      } else if (useModal) {
        // Show login modal
        setShowModal(true);
      } else if (fallback) {
        // Execute fallback function
        fallback(e);
      }
    }
  };

  // Clone children and add onClick handler
  const childrenWithHandler = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        onClick: handleClick
      });
    }
    return child;
  });

  return (
    <>
      {childrenWithHandler}
      <LoginPromptModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        action={action}
      />
    </>
  );
};

export default ProtectedAction;
