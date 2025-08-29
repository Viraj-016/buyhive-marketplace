// src/pages/VendorProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { vendorsAPI, productsAPI } from '../services/api';

const VendorProfilePage = () => {
  const { id } = useParams(); // Vendor ID from URL
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (id) {
      fetchVendorData();
    }
  }, [id]);

  useEffect(() => {
    if (vendor) {
      fetchVendorProducts();
    }
  }, [vendor, currentPage]);

  const fetchVendorData = async () => {
    try {
      setLoading(true);
      console.log('Fetching vendor details for ID:', id);
      
      // Get vendor from public list (since there's no individual detail endpoint)
      const vendorsResponse = await vendorsAPI.getPublicVendors();
      const vendorsData = vendorsResponse.data.results || vendorsResponse.data;
      
      const vendorData = vendorsData.find(v => v.id === parseInt(id));
      
      if (vendorData) {
        console.log('Vendor found:', vendorData);
        setVendor(vendorData);
      } else {
        setError('Vendor not found');
      }
      
    } catch (error) {
      console.error('Failed to fetch vendor:', error);
      setError('Failed to load vendor information');
    } finally {
      setLoading(false);
    }
  };

  const fetchVendorProducts = async () => {
    try {
      setProductsLoading(true);
      console.log('Fetching products for vendor:', vendor.business_name);
      
      // Filter products by vendor using the existing products API
      const response = await productsAPI.list({ 
        vendor: id,
        page: currentPage 
      });
      
      console.log('Vendor products response:', response.data);
      
      const productsData = response.data.results || response.data;
      setProducts(Array.isArray(productsData) ? productsData : []);
      
      // Handle pagination
      if (response.data.count && response.data.results) {
        setTotalPages(Math.ceil(response.data.count / (response.data.results.length || 12)));
      }
      
    } catch (error) {
      console.error('Failed to fetch vendor products:', error);
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  const formatPrice = (price) => {
    return parseFloat(price || 0).toFixed(2);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading vendor profile...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-6 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="font-display font-semibold text-2xl text-primary-800 mb-4">
            {error}
          </h2>
          <div className="space-x-4">
            <Link 
              to="/vendors"
              className="bg-primary-800 text-cream-100 px-6 py-3 rounded-lg font-medium hover:bg-primary-900 transition-colors duration-200"
            >
              Back to Vendors
            </Link>
            <button
              onClick={fetchVendorData}
              className="border-2 border-primary-800 text-primary-800 hover:bg-primary-800 hover:text-cream-100 px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return null;
  }

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Vendor Header */}
      <div className="bg-white border-b border-cream-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <nav className="text-sm text-neutral-500 mb-6">
            <Link to="/" className="hover:text-primary-600">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/vendors" className="hover:text-primary-600">Vendors</Link>
            <span className="mx-2">/</span>
            <span className="text-primary-800">{vendor.business_name}</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-start lg:gap-8">
            {/* Vendor Logo */}
            <div className="flex-shrink-0 mb-6 lg:mb-0">
              <div className="w-32 h-32 lg:w-40 lg:h-40 bg-gradient-warm rounded-2xl flex items-center justify-center overflow-hidden shadow-soft">
                {vendor.business_logo ? (
                  <img 
                    src={vendor.business_logo}
                    alt={vendor.business_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary-600 rounded-full mx-auto mb-2 flex items-center justify-center">
                      <span className="text-2xl text-cream-100 font-bold">
                        {vendor.business_name.charAt(0)}
                      </span>
                    </div>
                    <p className="text-primary-600 font-medium text-sm">
                      {vendor.business_name}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Vendor Info */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                <div>
                  <h1 className="font-display font-bold text-4xl text-primary-800 mb-2">
                    {vendor.business_name}
                  </h1>
                  <p className="text-neutral-600 text-lg mb-4">
                    by {vendor.user_name}
                  </p>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    ✓ Verified Vendor
                  </div>
                  <span className="text-sm text-neutral-500">
                    Since {new Date(vendor.created_at).getFullYear()}
                  </span>
                </div>
              </div>

              {/* Vendor Description */}
              <div className="prose prose-neutral max-w-none">
                <p className="text-neutral-700 text-lg leading-relaxed">
                  {vendor.description}
                </p>
              </div>

              {/* Vendor Stats */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-cream-50 rounded-lg p-4 text-center">
                  <div className="font-display font-bold text-2xl text-primary-800">
                    {products.length}+
                  </div>
                  <div className="text-sm text-neutral-600">Products</div>
                </div>
                <div className="bg-cream-50 rounded-lg p-4 text-center">
                  <div className="font-display font-bold text-2xl text-primary-800">
                    {new Date().getFullYear() - new Date(vendor.created_at).getFullYear() || 'New'}
                  </div>
                  <div className="text-sm text-neutral-600">Years Active</div>
                </div>
                <div className="bg-cream-50 rounded-lg p-4 text-center">
                  <div className="font-display font-bold text-2xl text-primary-800">
                    ⭐ 4.8
                  </div>
                  <div className="text-sm text-neutral-600">Rating</div>
                </div>
                <div className="bg-cream-50 rounded-lg p-4 text-center">
                  <div className="font-display font-bold text-2xl text-primary-800">
                    Fast
                  </div>
                  <div className="text-sm text-neutral-600">Shipping</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vendor Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display font-bold text-3xl text-primary-800">
            Products from {vendor.business_name}
          </h2>
          
          {/* Contact Vendor Button */}
          <button className="bg-primary-800 hover:bg-primary-900 text-cream-100 px-6 py-3 rounded-lg font-medium transition-colors duration-200">
            Contact Vendor
          </button>
        </div>

        {/* Products Loading */}
        {productsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-soft animate-pulse">
                <div className="h-48 bg-neutral-200 rounded-t-2xl"></div>
                <div className="p-4">
                  <div className="h-4 bg-neutral-200 rounded mb-2"></div>
                  <div className="h-4 bg-neutral-200 rounded w-2/3 mb-4"></div>
                  <div className="h-6 bg-neutral-200 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            {/* Products Grid */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
  {products.map((product) => (
    <div key={product.id} className="bg-white rounded-2xl shadow-soft hover:shadow-medium transition-all duration-300">
      {/* Product Image */}
      <Link to={`/products/${product.id}`}>
        <div className="h-48 bg-gradient-warm rounded-t-2xl overflow-hidden">
          {product.primary_image ? (
            <img 
              src={product.primary_image}
              alt={product.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.src = '/api/placeholder/400/400';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-cream-100 text-xl font-bold">
                  {product.title.charAt(0)}
                </span>
              </div>
            </div>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4">
        <Link 
          to={`/products/${product.id}`}
          className="font-display font-semibold text-lg text-primary-800 hover:text-primary-600 transition-colors duration-200 line-clamp-2 mb-2"
        >
          {product.title}
        </Link>
        
        <p className="text-neutral-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          <div>
            <span className="font-bold text-xl text-primary-800">
              ₹{formatPrice(product.base_price)}
            </span>
            {product.variants && product.variants.length > 0 && (
              <span className="text-neutral-500 text-sm ml-1">
                +variants
              </span>
            )}
          </div>
          
          {product.average_rating && (
            <div className="flex items-center">
              <span className="text-yellow-500 text-sm mr-1">★</span>
              <span className="text-neutral-600 text-sm">
                {parseFloat(product.average_rating).toFixed(1)}
              </span>
            </div>
          )}
        </div>

        {/* ✅ FIXED: Stock Status */}
        <div className="mt-3">
          {product.in_stock ? (
            <span className="text-green-600 text-sm font-medium">
              ✓ In Stock
              {product.variants && product.variants.length > 0 && (
                <span className="ml-1">
                  ({product.variants
                    .filter(variant => variant.is_active)
                    .reduce((total, variant) => total + (variant.stock || 0), 0)} available)
                </span>
              )}
            </span>
          ) : (
            <span className="text-red-600 text-sm font-medium">
              ✗ Out of Stock
            </span>
          )}
        </div>
      </div>
    </div>
  ))}
</div>


            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-cream-300 rounded-lg text-neutral-700 hover:bg-cream-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => setCurrentPage(index + 1)}
                      className={`px-4 py-2 rounded-lg font-medium ${
                        currentPage === index + 1
                          ? 'bg-primary-800 text-cream-100'
                          : 'border border-cream-300 text-neutral-700 hover:bg-cream-50'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-cream-300 rounded-lg text-neutral-700 hover:bg-cream-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          /* No Products */
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-neutral-200 rounded-full mx-auto mb-6 flex items-center justify-center">
              <svg className="w-12 h-12 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="font-display font-semibold text-xl text-primary-800 mb-2">
              No Products Yet
            </h3>
            <p className="text-neutral-600 mb-6">
              This vendor hasn't added any products yet. Check back later!
            </p>
            <Link 
              to="/vendors"
              className="bg-primary-800 hover:bg-primary-900 text-cream-100 px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              Browse Other Vendors
            </Link>
          </div>
        )}
      </div>

      {/* Vendor Information Footer */}
      <div className="bg-white border-t border-cream-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-medium text-primary-800 mb-2">Verified Business</h3>
              <p className="text-neutral-600 text-sm">
                This vendor has been verified and approved by our platform team.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="font-medium text-primary-800 mb-2">Secure Transactions</h3>
              <p className="text-neutral-600 text-sm">
                All purchases are protected by our secure payment system.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364" />
                </svg>
              </div>
              <h3 className="font-medium text-primary-800 mb-2">Customer Support</h3>
              <p className="text-neutral-600 text-sm">
                Get help with your orders through our customer support team.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorProfilePage;
