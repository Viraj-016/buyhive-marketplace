// src/components/VendorNavigation.jsx - NEW FILE
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { vendorsAPI } from '../../services/api';

const VendorNavigation = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const [vendorStatus, setVendorStatus] = useState(null);
  
  useEffect(() => {
    if (isAuthenticated && user?.is_vendor) {
      checkVendorStatus();
    }
  }, [isAuthenticated, user]);

  const checkVendorStatus = async () => {
    try {
      const response = await vendorsAPI.getVendorStatus();
      setVendorStatus(response.data);
    } catch (error) {
      console.error('Failed to check vendor status:', error);
    }
  };

  // Only show for vendor users
  if (!isAuthenticated || !user?.is_vendor) return null;

  return (
    <div className="bg-primary-800 text-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <span className="text-sm font-medium">Vendor Tools:</span>
            
            <Link 
              to="/vendor/dashboard" 
              className={`text-sm hover:text-accent-300 transition-colors ${
                location.pathname === '/vendor/dashboard' ? 'text-accent-300' : ''
              }`}
            >
              📊 Dashboard
            </Link>
            
            <Link 
              to="/vendor/apply" 
              className={`text-sm hover:text-accent-300 transition-colors ${
                location.pathname === '/vendor/apply' ? 'text-accent-300' : ''
              }`}
            >
              📝 Application Status
            </Link>
            
            <Link 
              to="/vendors" 
              className={`text-sm hover:text-accent-300 transition-colors ${
                location.pathname === '/vendors' ? 'text-accent-300' : ''
              }`}
            >
              🏪 Browse Vendors
            </Link>
          </div>
          
          {vendorStatus && (
            <div className="flex items-center">
              <span className="text-xs bg-primary-700 px-2 py-1 rounded-full">
                Status: {vendorStatus.status}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorNavigation;
