// src/pages/VendorsPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { vendorsAPI } from '../services/api';

const VendorsPage = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      console.log('Fetching public vendors...');
      const response = await vendorsAPI.getPublicVendors();
      console.log('Vendors response:', response.data);
      
      const vendorsData = response.data.results || response.data;
      setVendors(vendorsData);
      
    } catch (error) {
      console.error('Failed to fetch vendors:', error);
      setError('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading vendors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Header */}
      <div className="bg-white border-b border-cream-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <nav className="text-sm text-neutral-500 mb-2">
            <Link to="/" className="hover:text-primary-600">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-primary-800">Vendors</span>
          </nav>
          <h1 className="font-display font-bold text-4xl text-primary-800">
            Our Vendors
          </h1>
          <p className="text-neutral-600 mt-2">
            Discover amazing products from our trusted vendor partners
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-800">{error}</p>
          </div>
        )}



        {/* Vendors Grid */}
        {vendors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {vendors.map((vendor) => (
              <div key={vendor.id} className="bg-white rounded-2xl shadow-soft hover:shadow-medium transition-all duration-300">
                {/* Vendor Logo */}
                <div className="h-48 bg-gradient-warm rounded-t-2xl flex items-center justify-center overflow-hidden">
                  {vendor.business_logo ? (
                    <img 
                      src={vendor.business_logo}
                      alt={vendor.business_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <div className="w-16 h-16 bg-primary-600 rounded-full mx-auto mb-3 flex items-center justify-center">
                        <span className="text-2xl text-cream-100 font-bold">
                          {vendor.business_name.charAt(0)}
                        </span>
                      </div>
                      <p className="text-primary-600 font-medium">
                        {vendor.business_name}
                      </p>
                    </div>
                  )}
                </div>

                {/* Vendor Info */}
                <div className="p-6">
                  <h3 className="font-display font-bold text-xl text-primary-800 mb-2">
                    {vendor.business_name}
                  </h3>
                  <p className="text-neutral-600 text-sm mb-2">
                    by {vendor.user_name}
                  </p>
                  <p className="text-neutral-700 mb-4 line-clamp-3">
                    {vendor.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-500">
                      Since {new Date(vendor.created_at).getFullYear()}
                    </span>
                    <Link
                      to={`/vendors/${vendor.id}`}
                      className="bg-primary-800 hover:bg-primary-900 text-cream-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                    >
                      View Store
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-neutral-200 rounded-full mx-auto mb-6 flex items-center justify-center">
              <svg className="w-12 h-12 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-display font-semibold text-xl text-primary-800 mb-2">
              No Vendors Found
            </h3>
            <p className="text-neutral-600">
              We're working on bringing great vendors to the platform. Check back soon!
            </p>
          </div>
        )}
                {/* Become a Vendor CTA */}
        
      </div>
      <div className="bg-primary-800 rounded-2xl p-8 mb-8 text-center">
          <h2 className="font-display font-bold text-2xl text-cream-100 mb-4">
            Want to Sell on BuyHive?
          </h2>
          <p className="text-cream-200 mb-6 max-w-2xl mx-auto">
            Join our community of trusted vendors and reach thousands of customers. 
            Apply today and start growing your business with us.
          </p>
          <Link
            to="/vendor/apply"
            className="bg-accent-500 hover:bg-accent-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
          >
            Become a Vendor
          </Link>
        </div>
    </div>
  );
};

export default VendorsPage;
