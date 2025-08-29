// src/pages/OrderDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ordersAPI } from '../services/api';

const OrderDetailPage = () => {
  const { pk } = useParams(); // UUID from URL
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);

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
    if (isAuthenticated && pk) {
      fetchOrderDetail();
    } else if (!isAuthenticated) {
      setLoading(false);
    }
  }, [isAuthenticated, pk]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      console.log('Fetching order detail for UUID:', pk);
      console.log('Full API call:', `/orders/customer-orders/${pk}/`);
      
      const response = await ordersAPI.getOrderDetail(pk);
      console.log('Order detail response:', response.data);
      
      setOrder(response.data);
      
    } catch (error) {
      console.error('Failed to fetch order detail:', error);
      console.error('Error response:', error.response?.data);
      
      if (error.response?.status === 404) {
        setError('Order not found or does not belong to you');
      } else if (error.response?.status === 403) {
        setError('You do not have permission to view this order');
      } else {
        setError('Failed to load order details');
      }
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

  // Payment status color mapping
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

  // Order status timeline based on your backend statuses
  const getStatusTimeline = (currentStatus) => {
    const statuses = [
      { key: 'pending', label: 'Order Placed', icon: '📝' },
      { key: 'processing', label: 'Processing', icon: '⚙️' },
      { key: 'shipped', label: 'Shipped', icon: '🚚' },
      { key: 'delivered', label: 'Delivered', icon: '📦' }
    ];

    const statusOrder = ['pending', 'processing', 'shipped', 'delivered'];
    const currentIndex = statusOrder.indexOf(currentStatus);

    return statuses.map((status, index) => ({
      ...status,
      completed: index <= currentIndex && currentStatus !== 'cancelled' && currentStatus !== 'refunded',
      active: status.key === currentStatus
    }));
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      setCancelling(true);
      // Since your backend doesn't have a cancel endpoint, show this message
      alert('Order cancellation feature will be available soon. Please contact customer support for now.');
    } catch (error) {
      console.error('Failed to cancel order:', error);
      alert('Failed to cancel order. Please contact customer support.');
    } finally {
      setCancelling(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading order details...</p>
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
            You need to sign in to view order details.
          </p>
          <Link 
            to="/login"
            state={{ from: `/orders/${pk}` }}
            className="bg-primary-800 text-cream-100 px-6 py-3 rounded-lg font-medium hover:bg-primary-900 transition-colors duration-200"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="font-display font-semibold text-2xl text-primary-800 mb-4">
            {error}
          </h2>
          <div className="space-x-4">
            <Link 
              to="/orders"
              className="bg-primary-800 text-cream-100 px-6 py-3 rounded-lg font-medium hover:bg-primary-900 transition-colors duration-200"
            >
              Back to Orders
            </Link>
            <button
              onClick={fetchOrderDetail}
              className="border-2 border-primary-800 text-primary-800 hover:bg-primary-800 hover:text-cream-100 px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const timeline = getStatusTimeline(order.status);

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Header */}
      <div className="bg-white border-b border-cream-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <nav className="text-sm text-neutral-500 mb-2">
              <Link to="/" className="hover:text-primary-600">Home</Link>
              <span className="mx-2">/</span>
              <Link to="/orders" className="hover:text-primary-600">Orders</Link>
              <span className="mx-2">/</span>
              <span className="text-primary-800">#{order.order_id.slice(0, 8)}</span>
            </nav>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="font-display font-bold text-4xl text-primary-800">
                  Order #{order.order_id.slice(0, 8)}
                </h1>
                <p className="text-neutral-600 mt-2">
                  Placed on {new Date(order.created_at).toLocaleDateString()} • {order.vendor_business_name}
                </p>
              </div>
              <div className="flex items-center space-x-3 mt-4 lg:mt-0">
                <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.payment_status)}`}>
                  Payment {order.payment_status}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Order Status Timeline */}
            {order.status !== 'cancelled' && order.status !== 'refunded' && (
              <div className="bg-white rounded-2xl p-6 shadow-soft">
                <h2 className="font-display font-semibold text-xl text-primary-800 mb-6">
                  Order Status
                </h2>
                
                <div className="relative">
                  <div className="flex items-center justify-between">
                    {timeline.map((step, index) => (
                      <div key={step.key} className="flex flex-col items-center flex-1">
                        <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-lg mb-2 ${
                          step.completed 
                            ? 'bg-primary-600 border-primary-600 text-white' 
                            : step.active
                            ? 'bg-primary-100 border-primary-600 text-primary-600'
                            : 'bg-neutral-100 border-neutral-300 text-neutral-400'
                        }`}>
                          {step.icon}
                        </div>
                        <span className={`text-sm font-medium text-center ${
                          step.completed || step.active ? 'text-primary-800' : 'text-neutral-500'
                        }`}>
                          {step.label}
                        </span>
                        {index < timeline.length - 1 && (
                          <div className={`absolute top-6 h-0.5 ${
                            step.completed ? 'bg-primary-600' : 'bg-neutral-300'
                          }`} 
                          style={{
                            left: `${(100 / (timeline.length - 1)) * index + (50 / (timeline.length - 1))}%`,
                            width: `${100 / (timeline.length - 1)}%`
                          }} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tracking Information */}
                {order.tracking_number && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-blue-800 font-medium">Tracking Number: {order.tracking_number}</p>
                        {order.estimated_delivery && (
                          <p className="text-blue-700 text-sm">
                            Estimated Delivery: {new Date(order.estimated_delivery).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Order Items */}
            <div className="bg-white rounded-2xl p-6 shadow-soft">
              <h2 className="font-display font-semibold text-xl text-primary-800 mb-6">
                Order Items ({order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''})
              </h2>
              
              <div className="space-y-4">
                {order.items?.map((item, index) => {
                  const itemTotal = parseFloat(item.total || 0);
                  const priceAtPurchase = parseFloat(item.price_at_purchase || 0);

                  return (
                    <div key={index} className="flex items-center space-x-4 py-4 border-b border-cream-200 last:border-0">
                      <div className="w-16 h-16 bg-gradient-warm rounded-lg flex items-center justify-center flex-shrink-0">
                        <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                          <span className="text-cream-100 text-xs font-medium">P</span>
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-primary-800">
                          {item.product_title}
                        </h4>
                        {item.variant_name && (
                          <p className="text-sm text-neutral-600">
                            Variant: {item.variant_name}
                          </p>
                        )}
                        <p className="text-sm text-neutral-500">
                          ₹{formatPrice(priceAtPurchase)} × {item.quantity}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-medium text-primary-800">
                          ₹{formatPrice(itemTotal)}
                        </p>
                      </div>
                    </div>
                  );
                }) || (
                  <p className="text-neutral-500 text-center py-8">No items found</p>
                )}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-2xl p-6 shadow-soft">
              <h2 className="font-display font-semibold text-xl text-primary-800 mb-4">
                Shipping Address
              </h2>
              <div className="bg-cream-50 rounded-lg p-4">
                <p className="text-neutral-700 whitespace-pre-line">
                  {order.shipping_address_text}
                </p>
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-soft sticky top-8">
              <h2 className="font-display font-semibold text-xl text-primary-800 mb-6">
                Order Summary
              </h2>

              {/* Order Info */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-neutral-700">
                  <span>Order Total</span>
                  <span className="font-bold">₹{formatPrice(order.total_amount)}</span>
                </div>
                <div className="flex justify-between text-neutral-600 text-sm">
                  <span>Payment Method</span>
                  <span>{order.payment_method}</span>
                </div>
                {order.transaction_id && (
                  <div className="flex justify-between text-neutral-600 text-sm">
                    <span>Transaction ID</span>
                    <span className="font-mono text-xs">{order.transaction_id.slice(0, 16)}...</span>
                  </div>
                )}
                <div className="flex justify-between text-neutral-600 text-sm">
                  <span>Order Date</span>
                  <span>{new Date(order.created_at).toLocaleDateString()}</span>
                </div>
                {order.updated_at !== order.created_at && (
                  <div className="flex justify-between text-neutral-600 text-sm">
                    <span>Last Updated</span>
                    <span>{new Date(order.updated_at).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-3">
                {order.can_be_cancelled && (
                  <button
                    onClick={handleCancelOrder}
                    disabled={cancelling}
                    className="w-full border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
                  >
                    {cancelling ? 'Processing...' : 'Cancel Order'}
                  </button>
                )}
                
                <Link
                  to="/orders"
                  className="w-full bg-primary-800 hover:bg-primary-900 text-cream-100 py-3 px-4 rounded-lg font-medium transition-colors duration-200 text-center block"
                >
                  Back to Orders
                </Link>

                <Link
                  to="/products"
                  className="w-full border-2 border-primary-800 text-primary-800 hover:bg-primary-800 hover:text-cream-100 py-3 px-4 rounded-lg font-medium transition-colors duration-200 text-center block"
                >
                  Continue Shopping
                </Link>
              </div>

              {/* Support */}
              <div className="mt-6 pt-6 border-t border-cream-200">
                <p className="text-sm text-neutral-600 mb-3">
                  Need help with your order?
                </p>
                <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
