// src/pages/VendorApplicationPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { vendorsAPI } from '../services/api';

const VendorApplicationPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [vendorStatus, setVendorStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    business_name: '',  // Fixed underscore
    description: '',
    tax_id: '',         // Fixed underscore
    business_logo: null,  // Fixed underscore
    business_license: null  // Fixed underscore
  });

  useEffect(() => {
    if (isAuthenticated) {
      checkVendorStatus();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const checkVendorStatus = async () => {
    try {
      setLoading(true);
      console.log('Checking vendor status...');
      const response = await vendorsAPI.getVendorStatus();
      console.log('Vendor status response:', response.data);
      setVendorStatus(response.data);
    } catch (error) {
      console.error('Failed to check vendor status:', error);
      // If 404 or no vendor profile, user hasn't applied yet
      if (error.response?.status === 404) {
        setVendorStatus({ status: 'not_applied' });  // Fixed underscore
      } else {
        setVendorStatus({ status: 'not_applied' });  // Fixed underscore
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData(prev => ({
        ...prev,
        [name]: files  // Fixed to use files instead of files
      }));
    }
  };

  const validateForm = () => {
    if (!formData.business_name.trim()) {  // Fixed underscore
      setError('Business name is required');
      return false;
    }
    
    if (formData.business_name.trim().length < 2) {  // Fixed underscore
      setError('Business name must be at least 2 characters long');
      return false;
    }
    
    if (!formData.description.trim()) {
      setError('Business description is required');
      return false;
    }
    
    if (formData.description.trim().length < 10) {
      setError('Business description must be at least 10 characters long');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      
      // Create FormData for file uploads
      const applicationData = new FormData();
      applicationData.append('business_name', formData.business_name.trim());  // Fixed underscore
      applicationData.append('description', formData.description.trim());
      
      if (formData.tax_id && formData.tax_id.trim()) {  // Fixed underscore
        applicationData.append('tax_id', formData.tax_id.trim());  // Fixed underscore
      }
      
      if (formData.business_logo) {  // Fixed underscore
        applicationData.append('business_logo', formData.business_logo);  // Fixed underscore
      }
      
      if (formData.business_license) {  // Fixed underscore
        applicationData.append('business_license', formData.business_license);  // Fixed underscore
      }

      console.log('Submitting vendor application...');
      const response = await vendorsAPI.applyToVendor(applicationData);
      console.log('Application submitted successfully:', response.data);
      
      // Refresh status to show the new application state
      await checkVendorStatus();
      
    } catch (error) {
      console.error('Application failed:', error);
      console.error('Error response:', error.response?.data);
      
      if (error.response?.data?.detail) {
        setError(error.response.data.detail);
      } else if (error.response?.data?.business_name) {  // Fixed underscore
        setError('Business name: ' + error.response.data.business_name[0]);  // Fixed underscore
      } else if (error.response?.data?.description) {
        setError('Description: ' + error.response.data.description);  // Fixed array access
      } else {
        setError('Failed to submit application. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'pending':
        return {
          title: 'Application Under Review',
          icon: '⏳',
          color: 'yellow',
          message: 'Your vendor application has been submitted and is currently under review. We\'ll notify you via email once a decision is made.',
        };
      case 'approved':
        return {
          title: 'Congratulations! 🎉',
          icon: '✅',
          color: 'green',
          message: 'Your vendor application has been approved! You can now manage your products and orders.',
          actionText: 'Go to Dashboard',
          actionLink: '/vendor/dashboard'  // Fixed link to vendor dashboard
        };
      case 'rejected':
        return {
          title: 'Application Not Approved',
          icon: '❌',
          color: 'red',
          message: 'Unfortunately, your vendor application was not approved at this time.',
        };
      default:
        return null;
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-full mx-auto mb-6 flex items-center justify-center">
            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="font-display font-semibold text-2xl text-primary-800 mb-4">
            Sign In Required
          </h2>
          <p className="text-neutral-600 mb-6">
            Please sign in to your account to apply as a vendor on our platform.
          </p>
          <Link 
            to="/login"
            state={{ from: '/vendor/apply' }}
            className="bg-primary-800 text-cream-100 px-6 py-3 rounded-lg font-medium hover:bg-primary-900 transition-colors duration-200 mr-4"
          >
            Sign In
          </Link>
          <Link 
            to="/register"
            className="border-2 border-primary-800 text-primary-800 hover:bg-primary-800 hover:text-cream-100 px-6 py-3 rounded-lg font-medium transition-colors duration-200"
          >
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  // Show status page if user has already applied
  if (vendorStatus && vendorStatus.status !== 'not_applied') {  // Fixed underscore
    const statusDisplay = getStatusDisplay(vendorStatus.status);
    
    return (
      <div className="min-h-screen bg-cream-50">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <div className="bg-white rounded-2xl p-8 shadow-soft text-center">
            <div className={`w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center ${
              statusDisplay.color === 'yellow' ? 'bg-yellow-100' :
              statusDisplay.color === 'green' ? 'bg-green-100' :
              statusDisplay.color === 'red' ? 'bg-red-100' : 'bg-neutral-100'
            }`}>
              <span className="text-2xl">{statusDisplay.icon}</span>
            </div>
            
            <h2 className="font-display font-bold text-2xl text-primary-800 mb-4">
              {statusDisplay.title}
            </h2>
            
            <p className="text-neutral-600 mb-6">
              {statusDisplay.message}
            </p>

            {/* Show rejection reason if rejected */}
            {vendorStatus.status === 'rejected' && vendorStatus.rejection_reason && (  // Fixed underscore
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
                <h4 className="font-medium text-red-800 mb-2">Rejection Reason:</h4>
                <p className="text-red-700">
                  {vendorStatus.rejection_reason}  {/* Fixed underscore */}
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="space-x-4">
              {statusDisplay.actionLink && (
                <Link
                  to={statusDisplay.actionLink}
                  className="bg-primary-800 text-cream-100 px-6 py-3 rounded-lg font-medium hover:bg-primary-900 transition-colors duration-200"
                >
                  {statusDisplay.actionText}
                </Link>
              )}
              
              <Link
                to="/vendors"
                className="border-2 border-primary-800 text-primary-800 hover:bg-primary-800 hover:text-cream-100 px-6 py-3 rounded-lg font-medium transition-colors duration-200"
              >
                Browse Vendors
              </Link>
              
              <Link
                to="/products"
                className="border-2 border-neutral-300 text-neutral-700 hover:bg-neutral-100 px-6 py-3 rounded-lg font-medium transition-colors duration-200"
              >
                Shop Products
              </Link>
            </div>

            {/* Show vendor profile info if available */}
            {vendorStatus.business_name && (  // Fixed underscore
              <div className="mt-8 p-4 bg-cream-50 rounded-lg">
                <h4 className="font-medium text-primary-800 mb-2">Your Application Details:</h4>
                <div className="text-sm text-neutral-600 space-y-1">
                  <p><strong>Business Name:</strong> {vendorStatus.business_name}</p>  {/* Fixed underscore */}
                  <p><strong>Applied:</strong> {new Date(vendorStatus.created_at).toLocaleDateString()}</p>  {/* Fixed underscore */}
                  {vendorStatus.updated_at !== vendorStatus.created_at && (  // Fixed underscore
                    <p><strong>Last Updated:</strong> {new Date(vendorStatus.updated_at).toLocaleDateString()}</p>  
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show application form for new applications
  return (
    <div className="min-h-screen bg-cream-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <nav className="text-sm text-neutral-500 mb-4">
            <Link to="/" className="hover:text-primary-600">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/vendors" className="hover:text-primary-600">Vendors</Link>
            <span className="mx-2">/</span>
            <span className="text-primary-800">Apply</span>
          </nav>
          
          <h1 className="font-display font-bold text-4xl text-primary-800 mb-4">
            Become a Vendor
          </h1>
          <p className="text-neutral-600 text-lg max-w-2xl mx-auto">
            Join our marketplace and start selling your products to thousands of customers. 
            Fill out the application below to get started.
          </p>
        </div>

        {/* Application Form */}
        <div className="bg-white rounded-2xl p-8 shadow-soft">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-red-800 font-medium">{error}</span>
                </div>
              </div>
            )}

            {/* Business Name */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Business Name *
              </label>
              <input
                type="text"
                name="business_name"  
                value={formData.business_name} 
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter your business name (e.g., Smith's Electronics)"
                maxLength={255}
              />
              <p className="text-sm text-neutral-500 mt-1">
                This will be your store name visible to customers
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Business Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Describe your business, products, and what makes you unique. Include information about your target market, product categories, and business background..."
                maxLength={2000}
              />
              <p className="text-sm text-neutral-500 mt-1">
                {formData.description.length}/2000 characters - Tell customers about your business
              </p>
            </div>

            {/* Tax ID */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Tax ID / Business Registration Number
              </label>
              <input
                type="text"
                name="tax_id" 
                value={formData.tax_id}  
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Your business tax ID or registration number"
                maxLength={100}
              />
              <p className="text-sm text-neutral-500 mt-1">
                Optional but recommended for faster approval and tax compliance
              </p>
            </div>

            {/* Business Logo */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Business Logo
              </label>
              <input
                type="file"
                name="business_logo"  
                onChange={handleFileChange}
                accept="image/jpeg,image/jpg,image/png,image/gif"
                className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <p className="text-sm text-neutral-500 mt-1">
                Upload your business logo (JPEG, PNG, GIF - max 5MB). This will be displayed on your vendor profile.
              </p>
              {formData.business_logo && (  // Fixed underscore
                <p className="text-sm text-green-600 mt-1">
                  Selected: {formData.business_logo.name}  {/* Fixed underscore */}
                </p>
              )}
            </div>

            {/* Business License */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Business License or Registration Document
              </label>
              <input
                type="file"
                name="business_license" 
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <p className="text-sm text-neutral-500 mt-1">
                Upload your business license or registration document (PDF, DOC, DOCX, JPG, PNG - max 10MB)
              </p>
              {formData.business_license && (  // Fixed underscore
                <p className="text-sm text-green-600 mt-1">
                  Selected: {formData.business_license.name}  {/* Fixed underscore */}
                </p>
              )}
            </div>

            {/* Application Process Info */}
            <div className="bg-cream-50 rounded-lg p-6">
              <h3 className="font-medium text-primary-800 mb-3">📋 Application Process</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-neutral-600">
                <div>
                  <h4 className="font-medium text-primary-700 mb-2">Review Timeline</h4>
                  <ul className="space-y-1">
                    <li>• Applications reviewed within 3-5 business days</li>
                    <li>• Email notification once reviewed</li>
                    <li>• Additional documents may be requested</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-primary-700 mb-2">After Approval</h4>
                  <ul className="space-y-1">
                    <li>• Immediate access to vendor dashboard</li>
                    <li>• Start adding and managing products</li>
                    <li>• Access to order management tools</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Important Information</p>
                  <p>
                    By submitting this application, you agree to our vendor terms and conditions. 
                    All products must comply with our quality standards and marketplace policies. 
                    We reserve the right to review and approve products before they go live.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-primary-800 hover:bg-primary-900 text-cream-100 py-3 px-6 rounded-lg font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Submitting Application...
                  </div>
                ) : (
                  'Submit Vendor Application'
                )}
              </button>
              
              <Link
                to="/vendors"
                className="sm:w-auto border-2 border-neutral-300 text-neutral-700 hover:bg-neutral-100 py-3 px-6 rounded-lg font-semibold transition-colors duration-200 text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VendorApplicationPage;
