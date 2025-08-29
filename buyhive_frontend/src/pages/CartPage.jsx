// src/pages/CartPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProtectedAction from '../components/common/ProtectedAction';
import { ordersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CartPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  // Remove promo code functionality since it's not in your backend
  // const [promoCode, setPromoCode] = useState('');
  // const [promoDiscount, setPromoDiscount] = useState(0);
  // const [isPromoApplied, setIsPromoApplied] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);
  // Add this helper function inside CartPage component
const formatPrice = (value) => {
  if (typeof value === 'number') return value.toFixed(2);
  if (typeof value === 'string') {
    const num = parseFloat(value);
    return isNaN(num) ? '0.00' : num.toFixed(2);
  }
  return '0.00';
};

  const fetchCart = async () => {
    try {
      setLoading(true);
      console.log('Fetching cart...');
      const response = await ordersAPI.getCart();

      // Debug the response structure
      console.log('Raw cart response:', response.data);
      console.log('total_price type:', typeof response.data.total_price);
      console.log('total_price value:', response.data.total_price);
      setCart(response.data);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      // If cart doesn't exist, it will be created when user adds items
      setCart({ items: [], total_price: 0, total_items: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity === 0) {
      await handleRemoveItem(itemId);
      return;
    }
    
    // Find item to check stock
    const item = cart.items.find(item => item.id === itemId);
    const maxStock = item.variant?.stock || item.product?.stock || 0;
    
    if (newQuantity > maxStock) {
      alert(`Only ${maxStock} items available in stock`);
      return;
    }
    
    try {
      setUpdating(true);
      console.log('Updating cart item:', itemId, 'quantity:', newQuantity);
      await ordersAPI.updateCartItem(itemId, { quantity: newQuantity });
      await fetchCart(); // Refresh cart data
    } catch (error) {
      console.error('Failed to update cart item:', error);
      alert('Failed to update quantity. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      setUpdating(true);
      console.log('Removing cart item:', itemId);
      await ordersAPI.removeFromCart(itemId);
      await fetchCart(); // Refresh cart data
    } catch (error) {
      console.error('Failed to remove cart item:', error);
      alert('Failed to remove item. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleCheckout = () => {
    console.log('Proceeding to checkout with cart:', cart);
    navigate('/checkout');
  };

  // Calculate values from cart data with better type safety
  const cartItems = cart?.items || [];
  const subtotalRaw = cart?.total_price || '0';
  const subtotal = parseFloat(subtotalRaw) || 0; // Force to number
  const totalItems = parseInt(cart?.total_items || 0);
  
  // Frontend-only calculations (not in backend)
  const shipping = subtotal >= 150 ? 0 : 15.99; // Free shipping over $150
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  console.log('Cart data:', cart);
  console.log('Subtotal type:', typeof subtotal, 'value:', subtotal);
  console.log('Total items type:', typeof totalItems, 'value:', totalItems);

  const CartItem = ({ item }) => {
    // Use backend calculated total
    const itemTotal = parseFloat(item.total || 0);
  
    // Calculate unit price from backend data - ensure numbers
    const basePrice = parseFloat(item.product?.base_price || 0);
    const priceModifier = parseFloat(item.variant?.price_modifier || 0);
    const unitPrice = basePrice + priceModifier;

    return (
      <div className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all duration-300">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          {/* Product Image */}
          <div className="w-full lg:w-32 h-32 bg-gradient-warm rounded-xl flex items-center justify-center flex-shrink-0">
            {/* Show real product image if available from ProductListSerializer */}
            {item.product?.primary_image ? (
              <img 
                src={item.product.primary_image}
                alt={item.product.title}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-600 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <svg className="w-6 h-6 text-cream-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <p className="text-neutral-500 text-xs">Product</p>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1 mb-4 lg:mb-0">
                <Link 
                  to={`/products/${item.product.id}`} // Use ID instead of slug
                  className="font-display font-semibold text-lg text-primary-800 hover:text-primary-600 transition-colors duration-200"
                >
                  {item.product.title}
                </Link>
                <p className="text-neutral-600 text-sm mt-1">
                  by {item.product.vendor_name || 'Unknown Vendor'}
                </p>
                {item.variant && (
                  <p className="text-neutral-500 text-sm mt-1">
                    Variant: {item.variant.name}
                  </p>
                )}
                <div className="text-neutral-500 text-sm">
                  <span>₹{basePrice}</span>
                  {priceModifier !== 0 && (
                    <span className={`ml-1 ${priceModifier > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      ({priceModifier > 0 ? '+' : ''}${priceModifier})
                    </span>
                  )}
                  <span className="ml-1 font-medium">= ₹{unitPrice.toFixed(2)} each</span>
                </div>
                <p className="text-neutral-400 text-xs mt-1">
                  Added: {new Date(item.created_at).toLocaleDateString()}
                </p>
                <p className="text-neutral-500 text-xs">
                  {item.variant?.stock || 'Many'} in stock
                </p>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center border border-cream-300 rounded-lg">
                  <button
                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                    className="p-2 hover:bg-cream-100 transition-colors duration-200"
                    disabled={item.quantity <= 1 || updating}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <span className="px-4 py-2 min-w-[60px] text-center font-medium">
                    {updating ? '...' : item.quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    className="p-2 hover:bg-cream-100 transition-colors duration-200"
                    disabled={item.quantity >= (item.variant?.stock || 999) || updating}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>

                {/* Item Total */}
                <div className="text-right min-w-[100px]">
                  <p className="font-bold text-lg text-primary-800">
                    ₹{formatPrice(itemTotal)}
                  </p>
                  <p className="text-neutral-500 text-sm">
                    ₹{formatPrice(unitPrice)} × {item.quantity}
                  </p>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="p-2 text-neutral-400 hover:text-red-500 transition-colors duration-200"
                  disabled={updating}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-neutral-200 rounded-full mx-auto mb-6 flex items-center justify-center">
            <svg className="w-12 h-12 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="font-display font-semibold text-3xl text-primary-800 mb-4">
            Sign in to view your cart
          </h2>
          <p className="text-neutral-600 text-lg mb-8 max-w-md mx-auto">
            Please sign in to your account to view and manage your shopping cart.
          </p>
          <Link 
            to="/login"
            state={{ from: '/cart' }}
            className="bg-primary-800 hover:bg-primary-900 text-cream-100 px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200 inline-block mr-4"
          >
            Sign In
          </Link>
          <Link 
            to="/products"
            className="border-2 border-primary-800 text-primary-800 hover:bg-primary-800 hover:text-cream-100 px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200 inline-block"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  // Show empty cart
  if (!cart || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-cream-50">
        {/* Header */}
        <div className="bg-white border-b border-cream-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6">
              <nav className="text-sm text-neutral-500 mb-2">
                <Link to="/" className="hover:text-primary-600">Home</Link>
                <span className="mx-2">/</span>
                <span className="text-primary-800">Shopping Cart</span>
              </nav>
              <h1 className="font-display font-bold text-4xl text-primary-800">
                Your Cart
              </h1>
            </div>
          </div>
        </div>

        {/* Empty Cart */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="w-24 h-24 bg-neutral-200 rounded-full mx-auto mb-6 flex items-center justify-center">
              <svg className="w-12 h-12 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 12H6L5 9z" />
              </svg>
            </div>
            <h2 className="font-display font-semibold text-3xl text-primary-800 mb-4">
              Your cart is empty
            </h2>
            <p className="text-neutral-600 text-lg mb-8 max-w-md mx-auto">
              Looks like you haven't added any items to your cart yet. Start exploring our curated collection!
            </p>
            <Link 
              to="/products"
              className="bg-primary-800 hover:bg-primary-900 text-cream-100 px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200 inline-block"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Header */}
      <div className="bg-white border-b border-cream-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <nav className="text-sm text-neutral-500 mb-2">
              <Link to="/" className="hover:text-primary-600">Home</Link>
              <span className="mx-2">/</span>
              <span className="text-primary-800">Shopping Cart</span>
            </nav>
            <h1 className="font-display font-bold text-4xl text-primary-800">
              Your Cart
            </h1>
            <p className="text-neutral-600 mt-2">
              {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
            </p>
            <p className="text-neutral-500 text-sm">
              Last updated: {new Date(cart.updated_at).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6 mb-8 lg:mb-0">
            {/* Group by vendor for better organization */}
            {Object.entries(
              cartItems.reduce((groups, item) => {
                const vendor = item.product.vendor_name || 'Unknown Vendor';
                if (!groups[vendor]) groups[vendor] = [];
                groups[vendor].push(item);
                return groups;
              }, {})
            ).map(([vendorName, items]) => (
              <div key={vendorName} className="space-y-4">
                <div className="bg-cream-100 rounded-lg px-4 py-2">
                  <h3 className="font-medium text-primary-800">
                    Sold by {vendorName}
                  </h3>
                </div>
                {items.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>
            ))}

            {/* Continue Shopping */}
            <div className="bg-white rounded-2xl p-6 shadow-soft">
              <Link 
                to="/products"
                className="flex items-center text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-soft sticky top-8">
              <h2 className="font-display font-semibold text-xl text-primary-800 mb-6">
                Order Summary
              </h2>

              {/* Cart Summary Info */}
              <div className="mb-6 p-4 bg-cream-50 rounded-lg">
                <div className="text-sm text-neutral-600">
                  <div className="flex justify-between mb-1">
                    <span>Total Items:</span>
                    <span className="font-medium">{totalItems}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Unique Products:</span>
                    <span className="font-medium">{cartItems.length}</span>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-neutral-700">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>₹{formatPrice(subtotal)}</span>
                </div>
                
                <div className="flex justify-between text-neutral-700">
                  <span>Shipping</span>
                  <span>
                    {shipping === 0 ? (
                      <span className="text-green-600 font-medium">FREE</span>
                    ) : (
                      `$${formatPrice(shipping)}`
                    )}
                  </span>
                </div>
                
                <div className="flex justify-between text-neutral-700">
                  <span>Tax (8%)</span>
                  <span>₹{formatPrice(tax)}</span>
                </div>
                
                <hr className="border-cream-200" />
                
                <div className="flex justify-between font-display font-bold text-xl text-primary-800">
                  <span>Total</span>
                  <span>₹{formatPrice(total)}</span>
                </div>
              </div>

              {/* Shipping Info */}
              {shipping > 0 && (
                <div className="bg-accent-50 border border-accent-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-accent-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-accent-800 text-sm font-medium">
                      Add {formatPrice(150 - subtotal)} more for free shipping!
                    </span>
                  </div>
                  <div className="mt-2 bg-accent-200 rounded-full h-2">
                    <div 
                      className="bg-accent-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (subtotal / 150) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Stock Warnings */}
              {cartItems.some(item => item.quantity >= (item.variant?.stock || 999) * 0.8) && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div className="text-yellow-800 text-sm">
                      <p className="font-medium mb-1">Limited stock alert</p>
                      <p>Some items in your cart are running low on stock. Complete your order soon!</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Checkout Button */}
              <ProtectedAction 
                action="proceed to checkout"
                onAction={handleCheckout}
                useModal={false}
              >
                <button 
                  className="w-full bg-primary-800 hover:bg-primary-900 text-cream-100 py-4 px-6 rounded-lg font-semibold text-lg transition-colors duration-200 mb-4 disabled:opacity-50"
                  disabled={updating}
                >
                  {updating ? 'Updating Cart...' : 'Proceed to Checkout'}
                </button>
              </ProtectedAction>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-cream-200">
                <div className="text-center">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <p className="text-xs text-neutral-600">Secure Payment</p>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                  </div>
                  <p className="text-xs text-neutral-600">Free Returns</p>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364" />
                    </svg>
                  </div>
                  <p className="text-xs text-neutral-600">24/7 Support</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
