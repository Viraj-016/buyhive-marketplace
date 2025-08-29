// src/pages/OrderHistoryPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ordersAPI } from '../services/api';

const OrderHistoryPage = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
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
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      console.log('Fetching customer orders...');
      const response = await ordersAPI.getOrders();
      console.log('Orders response:', response.data);
      
      // Handle pagination like other APIs
      const ordersData = response.data.results || response.data;
      setOrders(ordersData);
      
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setError('Failed to load order history');
    } finally {
      setLoading(false);
    }
  };

  // Status color mapping based on your backend ORDER_STATUS_CHOICES
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'refunded':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-neutral-100 text-neutral-800 border-neutral-200';
    }
  };

  // Payment status color mapping based on your backend PAYMENT_STATUS_CHOICES
  const getPaymentStatusColor = (paymentStatus) => {
    switch (paymentStatus) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading your orders...</p>
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
            You need to sign in to view your order history.
          </p>
          <Link 
            to="/login"
            state={{ from: '/orders' }}
            className="bg-primary-800 text-cream-100 px-6 py-3 rounded-lg font-medium hover:bg-primary-900 transition-colors duration-200"
          >
            Sign In
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
          <div className="mb-6">
            <nav className="text-sm text-neutral-500 mb-2">
              <Link to="/" className="hover:text-primary-600">Home</Link>
              <span className="mx-2">/</span>
              <Link to="/dashboard" className="hover:text-primary-600">Dashboard</Link>
              <span className="mx-2">/</span>
              <span className="text-primary-800">Order History</span>
            </nav>
            <h1 className="font-display font-bold text-4xl text-primary-800">
              Order History
            </h1>
            <p className="text-neutral-600 mt-2">
              View and track all your orders
            </p>
          </div>

          {/* Success message from checkout */}
          {location.state?.success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-green-800 font-medium">
                  {location.state.message || 'Order placed successfully!'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-800 font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Orders List */}
        {orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl shadow-soft hover:shadow-medium transition-all duration-300">
                {/* Order Header */}
                <div className="p-6 border-b border-cream-200">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="mb-4 lg:mb-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-display font-semibold text-lg text-primary-800">
                          Order #{order.order_id.slice(0, 8)}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.payment_status)}`}>
                          Payment {order.payment_status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-neutral-600">
                        <span>Placed on {new Date(order.created_at).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>Vendor: {order.vendor_business_name}</span>
                        {order.tracking_number && (
                          <>
                            <span>•</span>
                            <span>Tracking: {order.tracking_number}</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-display font-bold text-xl text-primary-800">
                          ${formatPrice(order.total_amount)}
                        </p>
                        <p className="text-sm text-neutral-600">
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <Link
                        to={`/orders/${order.order_id}`} // FIXED: Added 'order.' prefix
                        className="bg-primary-800 hover:bg-primary-900 text-cream-100 px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Order Items Preview */}
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {order.items.slice(0, 3).map((item, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-warm rounded-lg flex items-center justify-center flex-shrink-0">
                          <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                            <span className="text-cream-100 text-xs font-medium">P</span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-primary-800 truncate">
                            {item.product_title}
                          </p>
                          {item.variant_name && (
                            <p className="text-sm text-neutral-500 truncate">
                              {item.variant_name}
                            </p>
                          )}
                          <p className="text-sm text-neutral-600">
                            ${formatPrice(item.price_at_purchase)} × {item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="flex items-center justify-center text-sm text-neutral-500">
                        +{order.items.length - 3} more item{order.items.length - 3 !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Actions */}
                <div className="px-6 py-4 bg-cream-50 border-t border-cream-200 rounded-b-2xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-neutral-600">
                        Payment Method: {order.payment_method}
                      </span>
                      {order.estimated_delivery && (
                        <span className="text-neutral-600">
                          Estimated Delivery: {new Date(order.estimated_delivery).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {order.can_be_cancelled && (
                        <button className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors duration-200">
                          Cancel Order
                        </button>
                      )}
                      <Link
                        to={`/orders/${order.order_id}`} // FIXED: Added 'order.' prefix
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors duration-200"
                      >
                        Track Order →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-neutral-200 rounded-full mx-auto mb-6 flex items-center justify-center">
              <svg className="w-12 h-12 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 12H6L5 9z" />
              </svg>
            </div>
            <h2 className="font-display font-semibold text-3xl text-primary-800 mb-4">
              No orders yet
            </h2>
            <p className="text-neutral-600 text-lg mb-8 max-w-md mx-auto">
              When you place your first order, it will appear here.
            </p>
            <Link 
              to="/products"
              className="bg-primary-800 hover:bg-primary-900 text-cream-100 px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200 inline-block"
            >
              Start Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistoryPage;
