// src/pages/WishlistPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProtectedAction from '../components/common/ProtectedAction';
import { wishlistAPI, ordersAPI } from '../services/api';

const WishlistPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  // Helper function for safe price formatting
  const formatPrice = (value) => {
    if (typeof value === 'number') return value.toFixed(2);
    if (typeof value === 'string') {
      const num = parseFloat(value);
      return isNaN(num) ? '0.00' : num.toFixed(2);
    }
    return '0.00';
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      console.log('Fetching wishlist...');
      const response = await wishlistAPI.getWishlist();
      console.log('Wishlist response:', response.data);
      setWishlist(response.data);
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
      setError('Failed to load wishlist');
      // Create empty wishlist structure if none exists
      setWishlist({ products: [], product_count: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    try {
      setUpdating(true);
      console.log('Removing from wishlist:', productId);
      const response = await wishlistAPI.toggleProduct(productId);
      console.log('Toggle response:', response.data);
      
      if (!response.data.is_added) {
        // Product was removed, refresh wishlist
        await fetchWishlist();
        alert('Item removed from wishlist');
      }
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
      alert('Failed to remove item. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleAddToCart = async (product) => {
    try {
      setUpdating(true);
      console.log('Adding to cart from wishlist:', product.id);
      
      const cartData = {
        product_id: product.id,
        quantity: 1
        // variant_id: null  // Add if you want to support variants
      };

      await ordersAPI.addToCart(cartData);
      alert(`${product.title} added to cart!`);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to add to cart';
      alert(errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  const handleClearWishlist = async () => {
    if (!window.confirm('Are you sure you want to remove all items from your wishlist?')) {
      return;
    }

    try {
      setUpdating(true);
      await wishlistAPI.clearWishlist();
      await fetchWishlist(); // Refresh to get empty wishlist
      alert('Wishlist cleared successfully');
    } catch (error) {
      console.error('Failed to clear wishlist:', error);
      alert('Failed to clear wishlist. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleMoveAllToCart = async () => {
    if (!wishlist?.products?.length) return;

    try {
      setUpdating(true);
      console.log('Moving all items to cart...');
      
      for (const product of wishlist.products) {
        const cartData = {
          product_id: product.id,
          quantity: 1
        };
        await ordersAPI.addToCart(cartData);
      }
      
      alert('All items moved to cart!');
      navigate('/cart');
    } catch (error) {
      console.error('Failed to move items to cart:', error);
      alert('Failed to move some items to cart. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const StarRating = ({ rating, reviewCount }) => (
    <div className="flex items-center space-x-1">
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <span key={i} className={`text-sm ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-neutral-300'}`}>
            ★
          </span>
        ))}
      </div>
      <span className="text-xs text-neutral-600">({reviewCount})</span>
    </div>
  );

  const WishlistItem = ({ item }) => (
    <div className="bg-white rounded-2xl shadow-soft hover:shadow-medium transition-all duration-300 p-6">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Product Image */}
        <Link to={`/products/${item.id}`} className="flex-shrink-0">
          <div className="w-24 h-24 sm:w-32 sm:h-32 bg-neutral-100 rounded-xl overflow-hidden">
            {item.primary_image ? (
              <img
                src={item.primary_image}
                alt={item.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.target.src = '/api/placeholder/150/150';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-neutral-400 text-4xl">🏠</span>
              </div>
            )}
          </div>
        </Link>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <Link
            to={`/products/${item.id}`}
            className="block font-semibold text-lg text-primary-800 hover:text-primary-600 transition-colors duration-200 mb-2"
          >
            {item.title}
          </Link>
          
          <p className="text-sm text-neutral-600 mb-2">
            by {item.vendor_name || 'Unknown Vendor'}
          </p>
          
          <p className="text-sm text-neutral-500 mb-2">
            {item.category_name || 'Home & Decor'}
          </p>

          <div className="flex items-center justify-between mb-4">
            <span className="text-xl font-bold text-primary-800">
              ₹{formatPrice(item.base_price)}
            </span>
            {item.average_rating > 0 && (
              <StarRating rating={item.average_rating} reviewCount={item.review_count || 0} />
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            <ProtectedAction
              action="add to cart"
              onAction={() => handleAddToCart(item)}
            >
              <button
                disabled={updating}
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50"
              >
                {updating ? 'Adding...' : 'Add to Cart'}
              </button>
            </ProtectedAction>
            
            <button
              onClick={() => handleRemoveFromWishlist(item.id)}
              disabled={updating}
              className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50"
            >
              {updating ? 'Removing...' : 'Remove'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-50 to-primary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600 mx-auto mb-4"></div>
          <p className="text-primary-700 font-medium text-lg">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-50 to-primary-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center bg-white rounded-3xl shadow-xl p-8">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-primary-800 mb-4">Sign in to view your wishlist</h2>
          <p className="text-neutral-600 mb-6">Save items you love to your wishlist. They'll be waiting for you when you're ready to purchase.</p>
          <Link
            to="/login"
            className="inline-block bg-primary-700 hover:bg-primary-800 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const wishlistItems = wishlist?.products || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-primary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary-800 mb-4">
            My Wishlist ❤️
          </h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            {wishlistItems.length > 0
              ? `${wishlistItems.length} ${wishlistItems.length === 1 ? 'item' : 'items'} saved for later`
              : 'Save items you love and they will appear here'
            }
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Empty State */}
        {wishlistItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-32 h-32 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <svg className="w-16 h-16 text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-primary-800 mb-4">Your wishlist is empty</h3>
            <p className="text-neutral-600 mb-8 max-w-md mx-auto">
              Save items you love to your wishlist. They'll be waiting for you when you're ready to purchase.
            </p>
            <Link
              to="/products"
              className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <>
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button
                onClick={handleMoveAllToCart}
                disabled={updating}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50"
              >
                {updating ? 'Moving...' : 'Move All to Cart'}
              </button>
              <button
                onClick={handleClearWishlist}
                disabled={updating}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50"
              >
                {updating ? 'Clearing...' : 'Clear Wishlist'}
              </button>
            </div>

            {/* Wishlist Items */}
            <div className="grid grid-cols-1 gap-6">
              {wishlistItems.map((item) => (
                <WishlistItem key={item.id} item={item} />
              ))}
            </div>
          </>
        )}

        {/* Continue Shopping */}
        <div className="text-center mt-12">
          <Link
            to="/products"
            className="inline-block border-2 border-primary-600 text-primary-700 hover:bg-primary-600 hover:text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;
