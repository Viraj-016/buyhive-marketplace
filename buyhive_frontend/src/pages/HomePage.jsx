// src/pages/HomePage.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productsAPI, vendorsAPI } from '../services/api';
import ProtectedAction from '../components/common/ProtectedAction';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [featuredVendors, setFeaturedVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        
        // Fetch featured products
        const productsResponse = await productsAPI.featured();
        const productsData = Array.isArray(productsResponse.data) 
          ? productsResponse.data 
          : productsResponse.data.results || [];
        setFeaturedProducts(productsData.slice(0, 12));

        // Fetch public vendors
        const vendorsResponse = await vendorsAPI.getPublicVendors();
        const vendorsData = Array.isArray(vendorsResponse.data) 
          ? vendorsResponse.data 
          : vendorsResponse.data.results || [];
        setFeaturedVendors(vendorsData.slice(0, 8));

      } catch (error) {
        console.error('Error fetching homepage data:', error);
        setFeaturedProducts([]);
        setFeaturedVendors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600 mx-auto"></div>
          <p className="mt-6 text-primary-700 font-medium text-lg">Loading BuyHive...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Keep your exact existing banner section */}
      <section className="relative min-h-screen flex items-center bg-gradient-warm overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-32 h-32 bg-primary-600 rounded-full"></div>
          <div className="absolute top-1/3 right-20 w-24 h-24 bg-accent-500 rounded-full"></div>
          <div className="absolute bottom-20 left-1/4 w-20 h-20 bg-primary-400 rounded-full"></div>
          <div className="absolute bottom-1/3 right-10 w-16 h-16 bg-accent-300 rounded-full"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center min-h-[85vh]">
            
            {/* Left Side - Text Content (3 columns) */}
            <div className="lg:col-span-3 space-y-8 lg:pr-12">
              <div className="space-y-6">
                {/* Brand Badge */}
                <div className="inline-flex items-center space-x-3 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-soft">
                  <div className="w-8 h-8 bg-gradient-brand rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                    </svg>
                  </div>
                  <span className="text-primary-700 font-medium text-sm tracking-wide">CURATED MARKETPLACE</span>
                </div>

                {/* Main Heading */}
                <div className="space-y-4">
                  <h1 className="font-display text-6xl lg:text-8xl text-primary-800 leading-[0.9] tracking-tight">
                    Buy<span className="text-accent-600">Hive</span>
                  </h1>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-1 bg-accent-500"></div>
                    <div className="w-8 h-1 bg-primary-600"></div>
                    <div className="w-4 h-1 bg-accent-300"></div>
                  </div>
                </div>

                <h2 className="text-2xl lg:text-3xl font-light text-primary-700 leading-relaxed max-w-2xl">
                  Where Nature Meets Artisanal Excellence
                </h2>
                
                <p className="text-lg text-primary-600 leading-relaxed max-w-xl font-body">
                  Discover handcrafted treasures from independent artisans who bring botanical beauty, sustainable luxury, and timeless stories into every unique piece.
                </p>
              </div>

              {/* CTA Section */}
              <div className="space-y-6 pt-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/products"
                    className="inline-flex items-center justify-center bg-primary-700 hover:bg-primary-800 text-cream-50 px-8 py-4 font-medium transition-all duration-300 shadow-elegant hover:shadow-large transform hover:-translate-y-1 group"
                  >
                    Explore Collection
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                  <Link
                    to="/vendors"
                    className="inline-flex items-center justify-center border-2 border-primary-600 text-primary-700 hover:bg-primary-600 hover:text-white px-8 py-4 font-medium transition-all duration-300"
                  >
                    Meet Artisans
                  </Link>
                </div>

                {/* Features */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-accent-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-accent-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-primary-700">Free Shipping</p>
                      <p className="text-sm text-primary-500">On orders over₹$200</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-primary-700">Curated Quality</p>
                      <p className="text-sm text-primary-500">Expert-vetted artisans</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Side - Image (2 columns) */}
            <div className="lg:col-span-2 relative">
              <div className="relative">
                {/* Main Image Container */}
                <div className="relative overflow-hidden rounded-2xl shadow-large">
                  <img
                    src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                    alt="BuyHive Curated Collection"
                    className="w-full h-[500px] lg:h-[600px] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary-900/20"></div>
                </div>

                {/* Background decorative elements */}
                <div className="absolute -z-10 top-12 -right-12 w-32 h-32 bg-primary-200 rounded-full opacity-30"></div>
                <div className="absolute -z-10 -bottom-8 -left-8 w-20 h-20 bg-accent-200 rounded-full opacity-40"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-primary-400 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-primary-400 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* UPDATED Featured Products Section - Reduced spacing and fixed functionality */}
      <section className="py-16 px-4 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl lg:text-5xl text-primary-800 mb-6">
            Featured Treasures
          </h2>
          <div className="w-32 h-1 bg-accent-500 mx-auto mb-6"></div>
          <p className="text-xl text-primary-600 max-w-3xl mx-auto font-body leading-relaxed">
            From statement furniture to delicate botanical accents, discover pieces that reflect nature's beauty and artisanal excellence
          </p>
        </div>

        {featuredProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {featuredProducts.map((product) => (
                <div
                  key={product.id}
                  className="group bg-white rounded-lg overflow-hidden shadow-soft hover:shadow-elegant transition-all duration-500 transform hover:-translate-y-2 cursor-pointer"
                >
                  <div 
                    className="relative overflow-hidden aspect-square"
                    onClick={() => navigate(`/products/${product.id}`)}
                  >
                    {product.primary_image  ? (
                      <img
                        src={product.primary_image}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        onError={(e) => {
                          e.target.src = '/api/placeholder/400/400';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-warm flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-primary-200 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-8 h-8 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span className="text-primary-500 text-sm font-medium">No Image</span>
                        </div>
                      </div>
                    )}
                    
                    {product.featured && (
                      <div className="absolute top-4 right-4 bg-accent-500 text-white px-3 py-1 text-xs font-medium rounded-full">
                        Featured
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-primary-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  
                  <div className="p-6 space-y-3">
                    <h3 
                      className="text-lg font-medium text-primary-800 group-hover:text-primary-600 transition-colors line-clamp-2 cursor-pointer"
                      onClick={() => navigate(`/products/${product.id}`)}
                    >
                      {product.title}
                    </h3>
                    <p className="text-sm text-primary-500 font-medium">
                      by {product.vendor_name || 'Artisan Maker'}
                    </p>
                    <div className="flex items-center justify-between pt-2">
                      <p className="text-xl font-semibold text-accent-600">
                        ₹{parseFloat(product.base_price || 0).toLocaleString()}
                      </p>
                      
                      <ProtectedAction
                        action="add items to cart"
                        onAction={() => {
                          // TODO: Implement add to cart functionality
                          alert(`${product.title} will be added to cart soon!`);
                        }}
                      >
                        <button 
                          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                            product.in_stock 
                              ? 'bg-primary-800 text-white hover:bg-primary-900' 
                              : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                          }`}
                          disabled={!product.in_stock}
                        >
                          {product.in_stock ? 'Add to Cart' : 'Out of Stock'}
                        </button>
                      </ProtectedAction>
                      
                    </div>
                    {product.description && (
                      <p className="text-sm text-primary-400 line-clamp-2 pt-2">
                        {product.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center">
              <Link
                to="/products"
                className="inline-block border-2 border-primary-600 text-primary-700 hover:bg-primary-600 hover:text-white px-10 py-3 font-medium transition-all duration-300 shadow-soft hover:shadow-medium"
              >
                View All Products
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl shadow-soft">
            <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-primary-600 text-xl mb-6">New treasures coming soon to BuyHive</p>
            <Link
              to="/products"
              className="inline-block text-accent-600 hover:text-accent-700 font-medium transition-colors"
            >
              Explore All Products →
            </Link>
          </div>
        )}
      </section>

      {/* Brand Story Section - Reduced spacing */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                alt="Artisan crafting at BuyHive"
                className="w-full h-[500px] object-cover rounded-2xl shadow-large"
              />
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-accent-500 rounded-full opacity-20"></div>
              <div className="absolute -top-8 -left-8 w-24 h-24 bg-primary-300 rounded-full opacity-30"></div>
            </div>
            
            <div className="space-y-8">
              <div>
                <h2 className="font-display text-4xl lg:text-5xl text-primary-800 mb-6 leading-tight">
                  The BuyHive Story
                </h2>
                <div className="w-24 h-1 bg-accent-500 mb-6"></div>
              </div>
              
              <p className="text-xl text-primary-600 leading-relaxed font-body">
                Every piece in our collection comes from independent artisans who pour their hearts into creating sustainable, beautiful home goods. We believe in the power of handcrafted pieces to tell stories, create connections, and bring nature's tranquility into your space.
              </p>
              
              <div className="grid grid-cols-1 gap-8 pt-4">
                <div className="flex items-start space-x-6">
                  <div className="w-14 h-14 bg-gradient-brand rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary-800 mb-3 text-lg">Curated Excellence</h3>
                    <p className="text-primary-600 leading-relaxed">Every maker and product is carefully vetted by our botanical design experts to ensure exceptional quality, sustainability, and artisanal craftsmanship.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-6">
                  <div className="w-14 h-14 bg-gradient-brand rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary-800 mb-3 text-lg">Direct Artisan Connection</h3>
                    <p className="text-primary-600 leading-relaxed">Connect directly with independent makers who infuse botanical inspiration, personal stories, and passionate craftsmanship into each unique piece.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-6">
                  <div className="w-14 h-14 bg-gradient-brand rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary-800 mb-3 text-lg">Secure & Sustainable</h3>
                    <p className="text-primary-600 leading-relaxed">Shop with complete confidence knowing your purchases support sustainable practices, secure payments, and eco-friendly delivery methods.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Vendors Section - Reduced spacing */}
      <section className="py-16 px-4 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl lg:text-5xl text-primary-800 mb-6">
            Meet Our Artisans
          </h2>
          <div className="w-32 h-1 bg-accent-500 mx-auto mb-6"></div>
          <p className="text-xl text-primary-600 max-w-3xl mx-auto font-body leading-relaxed">
            Meet the talented creators behind BuyHive's botanical treasures - independent artisans who craft with passion and purpose
          </p>
        </div>

        {featuredVendors.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
              {featuredVendors.map((vendor) => (
                <div
                  key={vendor.id}
                  onClick={() => navigate(`/vendors/${vendor.id}`)}
                  className="group block text-center bg-white rounded-2xl p-8 shadow-soft hover:shadow-elegant transition-all duration-500 transform hover:-translate-y-2 cursor-pointer"
                >
                  <div className="relative overflow-hidden mb-8 w-32 h-32 mx-auto rounded-full">
                    {vendor.business_logo ? (
                      <img
                        src={vendor.business_logo}
                        alt={vendor.business_name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.target.src = '/api/placeholder/150/150';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-warm flex items-center justify-center">
                        <span className="text-2xl font-bold text-primary-600 font-display">
                          {vendor.business_name?.charAt(0) || 'A'}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 rounded-full border-4 border-transparent group-hover:border-accent-200 transition-colors duration-300"></div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-primary-800 group-hover:text-primary-600 transition-colors">
                      {vendor.business_name}
                    </h3>
                    {vendor.description && (
                      <p className="text-primary-500 line-clamp-3 max-w-xs mx-auto leading-relaxed">
                        {vendor.description}
                      </p>
                    )}
                    <div className="pt-4">
                      <span className="inline-flex items-center text-accent-600 font-medium group-hover:text-accent-700 transition-colors">
                        View Collection
                        <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Link
                to="/vendors"
                className="inline-block border-2 border-primary-600 text-primary-700 hover:bg-primary-600 hover:text-white px-10 py-3 font-medium transition-all duration-300 shadow-soft hover:shadow-medium"
              >
                Discover All Artisans
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl shadow-soft">
            <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
              </svg>
            </div>
            <p className="text-primary-600 text-xl mb-6">Amazing artisans joining BuyHive soon</p>
            <Link
              to="/vendors"
              className="inline-block text-accent-600 hover:text-accent-700 font-medium transition-colors"
            >
              Explore All Artisans →
            </Link>
          </div>
        )}
      </section>

      {/* Newsletter Section - Reduced spacing */}
      <section className="py-16 bg-gradient-brand relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-40 h-40 bg-white rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-32 h-32 bg-accent-300 rounded-full"></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-cream-200 rounded-full"></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 lg:px-8 text-center">
          <h2 className="font-display text-4xl lg:text-5xl text-cream-50 mb-8">
            Join the BuyHive Community
          </h2>
          <p className="text-xl text-cream-100 mb-12 max-w-2xl mx-auto leading-relaxed">
            Get botanical design inspiration, new artisan discoveries, and exclusive sustainable living tips delivered to your inbox
          </p>
          
          <form className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto mb-8">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 px-8 py-4 text-primary-800 bg-cream-50 border-0 rounded-lg focus:ring-4 focus:ring-cream-200 focus:outline-none text-lg shadow-soft"
              required
            />
            <button
              type="submit"
              className="px-10 py-4 bg-accent-500 hover:bg-accent-600 text-white font-medium rounded-lg transition-all duration-300 shadow-soft hover:shadow-medium transform hover:-translate-y-1 text-lg"
            >
              Subscribe
            </button>
          </form>
          
          <div className="flex items-center justify-center space-x-8 text-cream-200">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">No spam, just inspiration</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">Unsubscribe anytime</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
