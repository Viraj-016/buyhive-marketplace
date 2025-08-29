// src/pages/VendorApplicationSuccessPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const VendorApplicationSuccessPage = () => {
  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-white rounded-2xl shadow-soft p-12">
          {/* Success Icon */}
          <div className="w-24 h-24 bg-green-100 rounded-full mx-auto mb-6 flex items-center justify-center">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <h1 className="font-display font-bold text-3xl text-primary-800 mb-4">
            Application Submitted Successfully!
          </h1>
          
          <p className="text-neutral-600 text-lg mb-8 leading-relaxed">
            Thank you for your interest in becoming a BuyHive vendor. We've received your application 
            and our team will review it within <strong>5-7 business days</strong>.
          </p>

          <div className="bg-cream-100 rounded-xl p-6 mb-8">
            <h2 className="font-display font-semibold text-xl text-primary-800 mb-4">
              What happens next?
            </h2>
            <div className="text-left space-y-4">
              <div className="flex items-start">
                <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                  <span className="text-white text-xs font-bold">1</span>
                </div>
                <p className="text-neutral-700">
                  Our team will review your business information and description
                </p>
              </div>
              <div className="flex items-start">
                <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                  <span className="text-white text-xs font-bold">2</span>
                </div>
                <p className="text-neutral-700">
                  We may contact you via email for additional information if needed
                </p>
              </div>
              <div className="flex items-start">
                <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                  <span className="text-white text-xs font-bold">3</span>
                </div>
                <p className="text-neutral-700">
                  You'll receive an email notification with our approval decision
                </p>
              </div>
              <div className="flex items-start">
                <div className="w-6 h-6 bg-accent-500 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                  <span className="text-white text-xs font-bold">4</span>
                </div>
                <p className="text-neutral-700">
                  <strong>If approved:</strong> We'll send you access to your vendor dashboard to start listing products
                </p>
              </div>
            </div>
          </div>

          {/* Application Status Info */}
          <div className="bg-primary-50 border border-primary-200 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-primary-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="font-semibold text-primary-800">Application Status</h3>
            </div>
            <p className="text-primary-700 text-sm">
              Your application is now <strong>pending review</strong>. You can check your application status 
              by visiting your profile dashboard at any time.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/profile"
              className="bg-primary-800 hover:bg-primary-900 text-cream-100 px-8 py-4 rounded-lg font-semibold transition-colors duration-200"
            >
              View My Profile
            </Link>
            <Link 
              to="/products"
              className="border-2 border-primary-800 text-primary-800 hover:bg-primary-800 hover:text-cream-100 px-8 py-4 rounded-lg font-semibold transition-colors duration-200"
            >
              Browse Products
            </Link>
          </div>

          <div className="mt-8 pt-8 border-t border-cream-200">
            <p className="text-neutral-500 text-sm">
              Questions about your application? Contact our vendor team at{' '}
              <a href="mailto:vendors@buyhive.com" className="text-primary-600 hover:underline">
                vendors@buyhive.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorApplicationSuccessPage;
