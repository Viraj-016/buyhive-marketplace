// src/components/layout/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { vendorsAPI, ordersAPI, authAPI, wishlistAPI } from '../../services/api'; // ✅ ONLY ADDED wishlistAPI

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { accessToken, logout } = useAuthStore();
  const isAuthenticated = !!accessToken;
  
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0); // ✅ ONLY ADDED THIS
  const [isVendor, setIsVendor] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserProfile();
      fetchCartItems();
      fetchWishlistCount(); // ✅ ONLY ADDED THIS
      checkVendorStatus();
    } else {
      setUserProfile(null);
      setCartItemsCount(0);
      setWishlistCount(0); // ✅ ONLY ADDED THIS
      setIsVendor(false);
    }
  }, [isAuthenticated]);

  const fetchUserProfile = async () => {
    try {
      // ✅ Use your authAPI instead of hardcoded fetch
      const response = await authAPI.getProfile();
      setUserProfile(response.data);
    } catch (error) {
      console.log('Failed to fetch profile');
    }
  };

  const fetchCartItems = async () => {
    try {
      const response = await ordersAPI.getCart();
      setCartItemsCount(response.data.total_items || 0);
    } catch (error) {
      console.log('No cart items');
      setCartItemsCount(0);
    }
  };

  // ✅ ONLY ADDED THIS FUNCTION
  const fetchWishlistCount = async () => {
    try {
      const response = await wishlistAPI.getWishlist();
      setWishlistCount(response.data.product_count || 0);
    } catch (error) {
      console.log('No wishlist items');
      setWishlistCount(0);
    }
  };

  const checkVendorStatus = async () => {
    try {
      const response = await vendorsAPI.getVendorStatus();
      setIsVendor(response.data.status === 'approved');
    } catch (error) {
      setIsVendor(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsUserMenuOpen(false);
    setUserProfile(null);
    setCartItemsCount(0);
    setWishlistCount(0); // ✅ ONLY ADDED THIS
    setIsVendor(false);
  };

  const isActiveRoute = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      {/* Top Banner */}
      <div className="bg-primary-800 text-white text-center py-2 text-sm">
        <p>Free shipping on orders over ₹150 • New arrivals weekly</p>
      </div>

      {/* Main Navigation */}
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary-800 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">B</span>
              </div>
              <span className="font-display font-bold text-2xl text-primary-800">
                BuyHive
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                to="/"
                className={`font-medium transition-colors duration-200 ${
                  isActiveRoute('/') 
                    ? 'text-primary-800 border-b-2 border-primary-800' 
                    : 'text-neutral-700 hover:text-primary-800'
                }`}
              >
                Home
              </Link>
              
              <Link
                to="/products"
                className={`font-medium transition-colors duration-200 ${
                  isActiveRoute('/products') 
                    ? 'text-primary-800 border-b-2 border-primary-800' 
                    : 'text-neutral-700 hover:text-primary-800'
                }`}
              >
                Shop
              </Link>
              
              <Link
                to="/vendors"
                className={`font-medium transition-colors duration-200 ${
                  isActiveRoute('/vendors') 
                    ? 'text-primary-800 border-b-2 border-primary-800' 
                    : 'text-neutral-700 hover:text-primary-800'
                }`}
              >
                Vendors
              </Link>

              {/* ✅ ONLY ADDED WISHLIST BUTTON */}
              {isAuthenticated && (
                <Link
                  to="/wishlist"
                  className={`relative font-medium transition-colors duration-200 ${
                    isActiveRoute('/wishlist') 
                      ? 'text-primary-800 border-b-2 border-primary-800' 
                      : 'text-neutral-700 hover:text-primary-800'
                  }`}
                >
                  ❤️ Wishlist
                  {wishlistCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-accent-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
              )}

              {/* ✅ Show Cart ONLY for authenticated users */}
              {isAuthenticated && (
                <Link
                  to="/cart"
                  className={`relative font-medium transition-colors duration-200 ${
                    isActiveRoute('/cart') 
                      ? 'text-primary-800 border-b-2 border-primary-800' 
                      : 'text-neutral-700 hover:text-primary-800'
                  }`}
                >
                  🛒 Cart
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-accent-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartItemsCount}
                    </span>
                  )}
                </Link>
              )}

              {/* ✅ Show Vendor Dashboard for approved vendors */}
              {isAuthenticated && isVendor && (
                <Link
                  to="/vendor/dashboard"
                  className={`font-medium transition-colors duration-200 ${
                    isActiveRoute('/vendor') 
                      ? 'text-accent-600 border-b-2 border-accent-600' 
                      : 'text-accent-600 hover:text-accent-700'
                  }`}
                >
                  📊 Dashboard
                </Link>
              )}
            </div>

            {/* ✅ Auth Section - Conditional Rendering */}
            <div className="hidden md:flex items-center space-x-4">
              {!isAuthenticated ? (
                // ✅ Show Login/Register ONLY for non-authenticated users
                <div className="flex items-center space-x-2">
                  <Link
                    to="/login"
                    className="text-neutral-700 hover:text-primary-800 px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="bg-primary-800 hover:bg-primary-900 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Get Started
                  </Link>
                </div>
              ) : (
                // ✅ Show User Profile ONLY for authenticated users
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 text-neutral-700 hover:text-primary-800 px-3 py-2 rounded-lg transition-colors"
                  >
                    {/* ✅ User Avatar with profile picture or initials */}
                    <div className="w-8 h-8 bg-primary-800 rounded-full flex items-center justify-center">
                      {userProfile?.profile?.profile_picture ? (
                        <img 
                          src={userProfile.profile.profile_picture} 
                          alt="Profile" 
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-medium text-sm">
                          {userProfile?.first_name?.charAt(0)?.toUpperCase() || 
                           userProfile?.email?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      )}
                    </div>
                    <span className="font-medium">
                      {userProfile?.first_name || 'Profile'}
                    </span>
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isUserMenuOpen ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* ✅ User Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-neutral-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-neutral-200">
                        <p className="text-sm font-medium text-neutral-900">
                          {userProfile?.first_name} {userProfile?.last_name}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {userProfile?.email}
                        </p>
                      </div>
                      
                      <Link
                        to="/dashboard"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center space-x-3 px-4 py-3 text-neutral-700 hover:bg-neutral-50 hover:text-primary-800 transition-colors"
                      >
                        <span className="text-lg">👤</span>
                        <span>My Profile</span>
                      </Link>
                      
                      <Link
                        to="/orders"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center space-x-3 px-4 py-3 text-neutral-700 hover:bg-neutral-50 hover:text-primary-800 transition-colors"
                      >
                        <span className="text-lg">📋</span>
                        <span>My Orders</span>
                      </Link>

                      {!isVendor && (
                        <Link
                          to="/vendor/apply"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center space-x-3 px-4 py-3 text-neutral-700 hover:bg-neutral-50 hover:text-accent-600 transition-colors"
                        >
                          <span className="text-lg">🚀</span>
                          <span>Become a Vendor</span>
                        </Link>
                      )}

                      <div className="border-t border-neutral-200 my-2"></div>
                      
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center space-x-3 px-4 py-3 text-neutral-700 hover:bg-neutral-50 hover:text-red-600 transition-colors"
                      >
                        <span className="text-lg">🚪</span>
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-neutral-700 hover:text-primary-800 p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-neutral-200">
              <div className="space-y-2">
                <Link
                  to="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg font-medium transition-colors ${
                    isActiveRoute('/') ? 'bg-primary-100 text-primary-800' : 'text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  Home
                </Link>
                
                <Link
                  to="/products"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg font-medium transition-colors ${
                    isActiveRoute('/products') ? 'bg-primary-100 text-primary-800' : 'text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  Shop
                </Link>
                
                <Link
                  to="/vendors"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg font-medium transition-colors ${
                    isActiveRoute('/vendors') ? 'bg-primary-100 text-primary-800' : 'text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  Vendors
                </Link>

                {/* ✅ ONLY ADDED WISHLIST IN MOBILE */}
                {isAuthenticated && (
                  <Link
                    to="/wishlist"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between px-4 py-3 rounded-lg font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
                  >
                    <span>❤️ Wishlist</span>
                    {wishlistCount > 0 && (
                      <span className="bg-accent-600 text-white text-xs rounded-full px-2 py-1">
                        {wishlistCount}
                      </span>
                    )}
                  </Link>
                )}

                {/* ✅ Show Cart in mobile ONLY for authenticated users */}
                {isAuthenticated && (
                  <Link
                    to="/cart"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between px-4 py-3 rounded-lg font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
                  >
                    <span>🛒 Cart</span>
                    {cartItemsCount > 0 && (
                      <span className="bg-accent-600 text-white text-xs rounded-full px-2 py-1">
                        {cartItemsCount}
                      </span>
                    )}
                  </Link>
                )}

                {/* ✅ Show auth buttons in mobile ONLY for non-authenticated users */}
                {!isAuthenticated && (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-3 rounded-lg font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-3 rounded-lg font-medium bg-primary-800 text-white hover:bg-primary-900 transition-colors"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>

              {/* ✅ Mobile User Menu ONLY for authenticated users */}
              {isAuthenticated && (
                <div className="mt-6 pt-4 border-t border-neutral-200">
                  <div className="px-4 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    My Account
                  </div>
                  <Link
                    to="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 text-neutral-700 hover:bg-neutral-100 transition-colors"
                  >
                    <span className="text-lg">👤</span>
                    <span>Profile</span>
                  </Link>
                  <Link
                    to="/orders"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 text-neutral-700 hover:bg-neutral-100 transition-colors"
                  >
                    <span className="text-lg">📋</span>
                    <span>Orders</span>
                  </Link>
                  {isVendor && (
                    <Link
                      to="/vendor/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 text-accent-600 hover:bg-accent-50 transition-colors"
                    >
                      <span className="text-lg">📊</span>
                      <span>Vendor Dashboard</span>
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left flex items-center space-x-3 px-4 py-3 text-neutral-700 hover:bg-neutral-100 transition-colors"
                  >
                    <span className="text-lg">🚪</span>
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
