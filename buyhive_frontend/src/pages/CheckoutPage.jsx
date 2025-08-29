// src/pages/CheckoutPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ordersAPI, addressAPI } from '../services/api';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [cart, setCart] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
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
      fetchCheckoutData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchCheckoutData = async () => {
    try {
      setLoading(true);
      
      // Fetch cart and addresses in parallel
      const [cartResponse, addressResponse] = await Promise.all([
        ordersAPI.getCart(),
        addressAPI.list()
      ]);

      console.log('Checkout - Cart:', cartResponse.data);
      console.log('Checkout - Addresses:', addressResponse.data);

      const cartData = cartResponse.data;
      const addressData = addressResponse.data.results || addressResponse.data;

      setCart(cartData);
      setAddresses(addressData);

      // Auto-select default address
      const defaultAddress = addressData.find(addr => addr.is_default);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      } else if (addressData.length > 0) {
        setSelectedAddressId(addressData[0].id);
      }

    } catch (error) {
      console.error('Failed to fetch checkout data:', error);
      setError('Failed to load checkout information');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      setError('Please select a shipping address');
      return;
    }

    if (!cart || !cart.items || cart.items.length === 0) {
      setError('Your cart is empty');
      return;
    }

    try {
      setPlacing(true);
      setError('');

      const checkoutData = {
        shipping_address_id: selectedAddressId,
        payment_method: paymentMethod
      };

      console.log('Placing order:', checkoutData);
      const response = await ordersAPI.checkout(checkoutData);
      
      console.log('Order response:', response.data);
      
      // Navigate to order confirmation or order history
      navigate('/orders', { 
        state: { 
          success: true, 
          message: response.data.message,
          orders: response.data.orders 
        }
      });

    } catch (error) {
      console.error('Checkout failed:', error);
      const errorMessage = error.response?.data?.detail || 'Order placement failed. Please try again.';
      setError(errorMessage);
    } finally {
      setPlacing(false);
    }
  };

  // Calculate totals
  const cartItems = cart?.items || [];
  const subtotal = parseFloat(cart?.total_price || 0);
  const totalItems = parseInt(cart?.total_items || 0);
  const shipping = subtotal >= 150 ? 0 : 15.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-display font-semibold text-2xl text-primary-800 mb-4">
            Please Sign In
          </h2>
          <p className="text-neutral-600 mb-6">
            You need to sign in to complete your order.
          </p>
          <Link 
            to="/login"
            state={{ from: '/checkout' }}
            className="bg-primary-800 text-cream-100 px-6 py-3 rounded-lg font-medium hover:bg-primary-900 transition-colors duration-200"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  // Show empty cart
  if (!cart || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-display font-semibold text-2xl text-primary-800 mb-4">
            Your cart is empty
          </h2>
          <p className="text-neutral-600 mb-6">
            Add some items to your cart before checking out.
          </p>
          <Link 
            to="/products"
            className="bg-primary-800 text-cream-100 px-6 py-3 rounded-lg font-medium hover:bg-primary-900 transition-colors duration-200"
          >
            Continue Shopping
          </Link>
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
            <Link to="/cart" className="hover:text-primary-600">Cart</Link>
            <span className="mx-2">/</span>
            <span className="text-primary-800">Checkout</span>
          </nav>
          <h1 className="font-display font-bold text-4xl text-primary-800">
            Checkout
          </h1>
          <p className="text-neutral-600 mt-2">
            Review your order and complete your purchase
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-8">
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

            {/* Shipping Address */}
            <div className="bg-white rounded-2xl p-6 shadow-soft">
              <h2 className="font-display font-semibold text-xl text-primary-800 mb-4">
                Shipping Address
              </h2>
              
              {addresses.length > 0 ? (
                <div className="space-y-4">
                  {addresses.map((address) => (
                    <label
                      key={address.id}
                      className={`block border-2 rounded-lg p-4 cursor-pointer transition-colors duration-200 ${
                        selectedAddressId === address.id
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-cream-300 hover:border-cream-400'
                      }`}
                    >
                      <div className="flex items-start">
                        <input
                          type="radio"
                          name="address"
                          value={address.id}
                          checked={selectedAddressId === address.id}
                          onChange={(e) => setSelectedAddressId(parseInt(e.target.value))}
                          className="mt-1 mr-3"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-medium text-primary-800">
                              {address.address_type === 'shipping' ? 'Shipping' : 'Billing'} Address
                            </span>
                            {address.is_default && (
                              <span className="bg-primary-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                                Default
                              </span>
                            )}
                          </div>
                          <div className="text-neutral-700">
                            <p>{address.street_address}</p>
                            {address.apartment_address && <p>{address.apartment_address}</p>}
                            <p>{address.city}, {address.state} {address.zip_code}</p>
                            <p>{address.country}</p>
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-neutral-600 mb-4">No shipping addresses found.</p>
                  <Link
                    to="/dashboard"
                    className="bg-primary-800 text-cream-100 px-4 py-2 rounded-lg font-medium hover:bg-primary-900 transition-colors duration-200"
                  >
                    Add Address
                  </Link>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl p-6 shadow-soft">
              <h2 className="font-display font-semibold text-xl text-primary-800 mb-4">
                Payment Method
              </h2>
              
              <div className="space-y-4">
                {[
                  { value: 'credit_card', label: 'Credit Card', icon: '💳' },
                  { value: 'debit_card', label: 'Debit Card', icon: '💳' },
                  { value: 'paypal', label: 'PayPal', icon: '🔵' },
                  { value: 'apple_pay', label: 'Apple Pay', icon: '🍎' },
                ].map((method) => (
                  <label
                    key={method.value}
                    className={`block border-2 rounded-lg p-4 cursor-pointer transition-colors duration-200 ${
                      paymentMethod === method.value
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-cream-300 hover:border-cream-400'
                    }`}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="payment"
                        value={method.value}
                        checked={paymentMethod === method.value}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-3"
                      />
                      <span className="text-xl mr-3">{method.icon}</span>
                      <span className="font-medium text-primary-800">{method.label}</span>
                    </div>
                  </label>
                ))}
              </div>
              
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  <strong>Note:</strong> This is a demo store. No real payment will be processed.
                </p>
              </div>
            </div>

            {/* Order Items Preview */}
            <div className="bg-white rounded-2xl p-6 shadow-soft">
              <h2 className="font-display font-semibold text-xl text-primary-800 mb-4">
                Order Items ({totalItems} items)
              </h2>
              
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {cartItems.map((item) => {
                  const itemTotal = parseFloat(item.total || 0);
                  const basePrice = parseFloat(item.product?.base_price || 0);
                  const priceModifier = parseFloat(item.variant?.price_modifier || 0);
                  const unitPrice = basePrice + priceModifier;

                  return (
                    <div key={item.id} className="flex items-center space-x-4 py-3 border-b border-cream-200 last:border-0">
                      <div className="w-16 h-16 bg-gradient-warm rounded-lg flex items-center justify-center flex-shrink-0">
                        {item.product?.primary_image ? (
                          <img 
                            src={item.product.primary_image}
                            alt={item.product.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                            <span className="text-cream-100 text-xs font-medium">P</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-primary-800 truncate">
                          {item.product?.title}
                        </h4>
                        <p className="text-sm text-neutral-600">
                          by {item.product?.vendor_name}
                        </p>
                        {item.variant && (
                          <p className="text-sm text-neutral-500">
                            {item.variant.name}
                          </p>
                        )}
                        <p className="text-sm text-neutral-500">
                          ₹{formatPrice(unitPrice)} × {item.quantity}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-medium text-primary-800">
                          ₹{formatPrice(itemTotal)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-soft sticky top-8">
              <h2 className="font-display font-semibold text-xl text-primary-800 mb-6">
                Order Summary
              </h2>

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

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={placing || !selectedAddressId || cartItems.length === 0}
                className="w-full bg-primary-800 hover:bg-primary-900 text-cream-100 py-4 px-6 rounded-lg font-semibold text-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
              >
                {placing ? 'Placing Order...' : `Place Order - ₹${formatPrice(total)}`}
              </button>

              {/* Security Info */}
              <div className="text-center text-sm text-neutral-600">
                <div className="flex items-center justify-center mb-2">
                  <svg className="w-4 h-4 text-green-600 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Secure checkout</span>
                </div>
                <p>Your payment information is encrypted and secure.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
