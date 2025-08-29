// src/components/common/LoginPromptModal.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const LoginPromptModal = ({ isOpen, onClose, action = "continue" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-large max-w-md w-full p-8">
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Content */}
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            
            <h3 className="font-display font-semibold text-2xl text-primary-800 mb-3">
              Sign in to {action}
            </h3>
            <p className="text-neutral-600 mb-8">
              Join BuyHive to save items, track orders, and discover personalized recommendations.
            </p>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link 
                to="/login"
                state={{ from: window.location.pathname, message: `Please sign in to ${action.toLowerCase()}.` }}
                className="block w-full bg-primary-800 hover:bg-primary-900 text-cream-100 py-3 px-6 rounded-lg font-medium transition-colors duration-200"
              >
                Sign In
              </Link>
              <Link 
                to="/register"
                state={{ from: window.location.pathname }}
                className="block w-full border-2 border-primary-800 text-primary-800 hover:bg-primary-800 hover:text-cream-100 py-3 px-6 rounded-lg font-medium transition-colors duration-200"
              >
                Create Account
              </Link>
            </div>

            <p className="text-neutral-500 text-sm mt-6">
              Continue browsing without an account, or sign in for the full experience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPromptModal;
