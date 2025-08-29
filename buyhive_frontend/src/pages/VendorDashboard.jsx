// src/pages/VendorDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { vendorsAPI, productsAPI, ordersAPI } from '../services/api';
import ProductFormModal from '../components/vendor/ProductFormModal';
import ProductActions from '../components/vendor/ProductActions';
import VendorAnalyticsCharts from '../components/vendor/VendorAnalyticsCharts';
const VendorDashboard = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [vendorProfile, setVendorProfile] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [saving, setSaving] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    business_name: '',
    description: '',
    tax_id: '',
    business_logo: null,
    business_license: null
  });

  // Analytics data
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Products data
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productFilters, setProductFilters] = useState({
    status: 'all',
    stock: 'all'
  });

  // Orders data
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderFilters, setOrderFilters] = useState({
    status: 'all',
    date_from: '',
    date_to: ''
  });
  useEffect(() => {
  if (isAuthenticated) {
    fetchVendorProfile();
    fetchCategories(); // Add this line
    if (activeTab === 'overview') {
      fetchAnalytics();
    }
  } else {
    navigate('/login', { state: { from: '/vendor/dashboard' } });
  }
}, [isAuthenticated, navigate]);
  useEffect(() => {
    if (isAuthenticated) {
      fetchVendorProfile();
      if (activeTab === 'overview') {
        fetchAnalytics();
      }
    } else {
      navigate('/login', { state: { from: '/vendor/dashboard' } });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (vendorProfile) {
      if (activeTab === 'products') {
        fetchProducts();
      } else if (activeTab === 'orders') {
        fetchOrders();
      } else if (activeTab === 'overview') {
        fetchAnalytics();
      }
    }
  }, [activeTab, vendorProfile, productFilters, orderFilters]);

  const fetchVendorProfile = async () => {
    try {
      setLoading(true);
      console.log('Fetching vendor profile...');
      const response = await vendorsAPI.getVendorProfile();
      console.log('Vendor profile response:', response.data);
      
      setVendorProfile(response.data);
      setProfileForm({
        business_name: response.data.business_name || '',
        description: response.data.description || '',
        tax_id: response.data.tax_id || '',
        business_logo: null,
        business_license: null
      });
      
    } catch (error) {
      console.error('Failed to fetch vendor profile:', error);
      if (error.response?.status === 403) {
        setError('You are not an approved vendor. Please wait for approval or apply first.');
      } else {
        setError('Failed to load vendor profile');
      }
    } finally {
      setLoading(false);
    }
  };
  const handleCreateProduct = () => {
    console.log('Categories when opening modal:', categories);
  setEditingProduct(null);
  setShowProductModal(true);
};

const handleEditProduct = (product) => {
  setEditingProduct(product);
  setShowProductModal(true);
};

const handleDeleteProduct = async (productId) => {
  if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
    try {
      setProductsLoading(true);
      await vendorsAPI.deleteProduct(productId);
      alert('Product deleted successfully!');
      fetchProducts(); // Refresh products list
      fetchAnalytics(); // Refresh analytics
    } catch (error) {
      console.error('Failed to delete product:', error);
      alert('Failed to delete product. Please try again.');
    } finally {
      setProductsLoading(false);
    }
  }
};

const handleProductModalSuccess = () => {
  fetchProducts(); // Refresh products list
  fetchAnalytics(); // Refresh analytics
};
  const fetchAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      console.log('Fetching vendor analytics...');
      const response = await vendorsAPI.getAnalytics();
      console.log('Analytics response:', response.data);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  };
  
  const fetchCategories = async () => {
  try {
    console.log('Fetching categories...');
    const response = await productsAPI.categories();
    console.log('🔥 RAW RESPONSE:', response);
    console.log('Categories response:', response.data);
    console.log('🔥 IS ARRAY?:', Array.isArray(response.data));
    const categoriesData = response.data.results || response.data || [];
    setCategories(Array.isArray(categoriesData) ? categoriesData : []);
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    setCategories([]);
  }
};



  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      console.log('Fetching vendor products...');
      const response = await vendorsAPI.getProductsManage(productFilters);
      console.log('Products response:', response.data);
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      console.log('Fetching vendor orders...');
      const response = await vendorsAPI.getOrdersManage(orderFilters);
      console.log('Orders response:', response.data);
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleOrderStatusUpdate = async (orderIds, newStatus, trackingNumber = '') => {
    try {
      console.log('Updating order status...', { orderIds, newStatus, trackingNumber });
      const response = await vendorsAPI.updateOrderStatus({
        order_ids: orderIds,
        status: newStatus,
        tracking_number: trackingNumber
      });
      
      alert(`Updated ${response.data.updated_count} orders successfully!`);
      fetchOrders(); // Refresh orders list
    } catch (error) {
      console.error('Failed to update order status:', error);
      alert('Failed to update order status. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      setProfileForm(prev => ({
        ...prev,
        [name]: files[0]
      }));
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      setSaving(true);
      console.log('Updating vendor profile...');
      
      const updateData = {
        business_name: profileForm.business_name,
        description: profileForm.description,
        tax_id: profileForm.tax_id
      };

      // Add files if selected
      if (profileForm.business_logo) {
        updateData.business_logo = profileForm.business_logo;
      }
      if (profileForm.business_license) {
        updateData.business_license = profileForm.business_license;
      }

      await vendorsAPI.updateVendorProfile(updateData);
      
      // Success message and refresh
      alert('Profile updated successfully!');
      await fetchVendorProfile();
      
      // Reset file inputs
      setProfileForm(prev => ({
        ...prev,
        business_logo: null,
        business_license: null
      }));
      
    } catch (error) {
      console.error('Failed to update profile:', error);
      if (error.response?.data?.business_name) {
        setError('Business name: ' + error.response.data.business_name[0]);
      } else if (error.response?.data?.description) {
        setError('Description: ' + error.response.data.description);
      } else {
        setError('Failed to update profile. Please check your inputs and try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading your vendor dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !vendorProfile) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-6 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="font-display font-semibold text-2xl text-primary-800 mb-4">
            Access Denied
          </h2>
          <p className="text-neutral-600 mb-6">
            {error}
          </p>
          <div className="space-x-4">
            <Link
              to="/vendor/apply"
              className="bg-primary-800 text-cream-100 px-6 py-3 rounded-lg font-medium hover:bg-primary-900 transition-colors duration-200"
            >
              Apply to Become Vendor
            </Link>
            <button
              onClick={fetchVendorProfile}
              className="border-2 border-primary-800 text-primary-800 hover:bg-primary-800 hover:text-cream-100 px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!vendorProfile) {
    return null;
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'profile', label: 'Profile Settings', icon: '⚙️' },
    { id: 'products', label: 'Products', icon: '📦' },
    { id: 'orders', label: 'Orders', icon: '📋' }
  ];

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Header */}
      <div className="bg-white border-b border-cream-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <nav className="text-sm text-neutral-500 mb-2">
                <Link to="/" className="hover:text-primary-600">Home</Link>
                <span className="mx-2">/</span>
                <span className="text-primary-800">Vendor Dashboard</span>
              </nav>
              <h1 className="font-display font-bold text-4xl text-primary-800">
                Vendor Dashboard
              </h1>
              <p className="text-neutral-600 mt-2">
                Welcome back, {vendorProfile.business_name}!
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                ✓ {vendorProfile.status.charAt(0).toUpperCase() + vendorProfile.status.slice(1)}
              </div>
              <Link
                to={`/vendors/${vendorProfile.id}`}
                className="border-2 border-primary-800 text-primary-800 hover:bg-primary-800 hover:text-cream-100 px-4 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                View Public Profile
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-cream-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {analyticsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-800 mx-auto mb-4"></div>
                <p className="text-neutral-600">Loading analytics...</p>
              </div>
            ) : analytics ? (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-2xl p-6 shadow-soft">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                        <span className="text-blue-600 text-xl">📦</span>
                      </div>
                      <div>
                        <p className="text-neutral-600 text-sm">Total Products</p>
                        <p className="font-display font-bold text-2xl text-primary-800">
                          {analytics.products.total}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-soft">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                        <span className="text-green-600 text-xl">📋</span>
                      </div>
                      <div>
                        <p className="text-neutral-600 text-sm">Total Orders</p>
                        <p className="font-display font-bold text-2xl text-primary-800">
                          {analytics.orders.total}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-soft">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                        <span className="text-yellow-600 text-xl">⏳</span>
                      </div>
                      <div>
                        <p className="text-neutral-600 text-sm">Pending Orders</p>
                        <p className="font-display font-bold text-2xl text-primary-800">
                          {analytics.orders.pending}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-soft">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                        <span className="text-purple-600 text-xl">💰</span>
                      </div>
                      <div>
                        <p className="text-neutral-600 text-sm">Total Revenue</p>
                        <p className="font-display font-bold text-2xl text-primary-800">
                          ₹{analytics.revenue.total.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                {analytics && <VendorAnalyticsCharts analytics={analytics} />}
                {/* Low Stock Alert */}
                {analytics.products.low_stock_count > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
                    <h3 className="font-display font-semibold text-xl text-yellow-800 mb-4">
                      ⚠️ Low Stock Alert ({analytics.products.low_stock_count} items)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {analytics.products.low_stock_items.map((item, index) => (
                        <div key={index} className="bg-white rounded-lg p-4">
                          <h4 className="font-medium text-yellow-800">{item.product_title}</h4>
                          {item.variants.map((variant, vIndex) => (
                            <p key={vIndex} className="text-sm text-yellow-700">
                              {variant.name}: {variant.stock} left
                            </p>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Top Products */}
                {analytics.top_products.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 shadow-soft">
                    <h3 className="font-display font-semibold text-xl text-primary-800 mb-4">
                      🏆 Top Selling Products (Last 30 Days)
                    </h3>
                    <div className="space-y-3">
                      {analytics.top_products.map((product, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-cream-50 rounded-lg">
                          <div>
                            <h4 className="font-medium text-primary-800">{product.product__title}</h4>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-primary-800">{product.total_sold} sold</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-neutral-600">No analytics data available</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'products' && (
          <div className="bg-white rounded-2xl p-8 shadow-soft">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-semibold text-2xl text-primary-800">
                Products Management
              </h2>
              
              {/* Product Filters */}
              <div className="flex space-x-4">
                <select
                  value={productFilters.status}
                  onChange={(e) => setProductFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="px-4 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                
                <select
                  value={productFilters.stock}
                  onChange={(e) => setProductFilters(prev => ({ ...prev, stock: e.target.value }))}
                  className="px-4 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Stock</option>
                  <option value="low">Low Stock</option>
                  <option value="out">Out of Stock</option>
                </select>
                <button
      onClick={handleCreateProduct}
      className="bg-primary-800 hover:bg-primary-900 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
    >
      + Add Product
    </button>
              </div>
            </div>
            
            {productsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-800 mx-auto mb-4"></div>
                <p className="text-neutral-600">Loading products...</p>
              </div>
            ) : products.length > 0 ? (
<div className="overflow-x-auto bg-white rounded-lg shadow">
  <table className="min-w-full">
    <thead className="bg-neutral-50">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Product</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider hidden md:table-cell">Category</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Price</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider hidden sm:table-cell">Stock</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-neutral-200">
      {products.map(product => (
        <tr key={product.id} className="hover:bg-neutral-50">
          <td className="px-6 py-4 whitespace-nowrap">
            <div>
              <div className="text-sm font-medium text-neutral-900">{product.title}</div>
              <div className="text-sm text-neutral-500 md:hidden">₹{product.base_price}</div>
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 hidden md:table-cell">
            {product.category}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 hidden md:table-cell">
            ₹{product.base_price}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 hidden sm:table-cell">
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              product.total_stock > 10 ? 'bg-green-100 text-green-800' : 
              product.total_stock > 0 ? 'bg-yellow-100 text-yellow-800' : 
              'bg-red-100 text-red-800'
            }`}>
              {product.total_stock} units
            </span>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              product.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {product.is_active ? 'Active' : 'Inactive'}
            </span>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <ProductActions 
              product={product}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
              loading={productsLoading}
            />
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-neutral-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <span className="text-4xl">📦</span>
                </div>
                <h3 className="font-display font-semibold text-xl text-primary-800 mb-2">
                  No Products Found
                </h3>
                <p className="text-neutral-600 mb-6">
                  No products match your current filters.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl p-8 shadow-soft">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-semibold text-2xl text-primary-800">
                Orders Management
              </h2>
              
              {/* Order Filters */}
              <div className="flex space-x-4">
                <select
                  value={orderFilters.status}
                  onChange={(e) => setOrderFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="px-4 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                </select>
                
                <input
                  type="date"
                  value={orderFilters.date_from}
                  onChange={(e) => setOrderFilters(prev => ({ ...prev, date_from: e.target.value }))}
                  className="px-4 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="From Date"
                />
                
                <input
                  type="date"
                  value={orderFilters.date_to}
                  onChange={(e) => setOrderFilters(prev => ({ ...prev, date_to: e.target.value }))}
                  className="px-4 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="To Date"
                />
              </div>
            </div>
            
            {ordersLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-800 mx-auto mb-4"></div>
                <p className="text-neutral-600">Loading orders...</p>
              </div>
            ) : orders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="border-b border-cream-200">
                      <th className="text-left py-3 px-4 font-medium text-neutral-700">Order ID</th>
                      <th className="text-left py-3 px-4 font-medium text-neutral-700">Customer</th>
                      <th className="text-left py-3 px-4 font-medium text-neutral-700">Amount</th>
                      <th className="text-left py-3 px-4 font-medium text-neutral-700">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-neutral-700">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-neutral-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b border-cream-100 hover:bg-cream-50">
                        <td className="py-3 px-4">
                          <div>
                            <h4 className="font-medium text-primary-800">#{order.order_id.slice(0, 8)}</h4>
                            <p className="text-sm text-neutral-600">{order.items_count} items</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-neutral-700">{order.customer_email}</td>
                        <td className="py-3 px-4 font-medium text-primary-800">₹{order.total_amount}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-neutral-700">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          {order.status === 'pending' && (
                            <button
                              onClick={() => handleOrderStatusUpdate([order.id], 'processing')}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs transition-colors"
                            >
                              Mark Processing
                            </button>
                          )}
                          {order.status === 'processing' && (
                            <button
                              onClick={() => {
                                const tracking = prompt('Enter tracking number (optional):');
                                handleOrderStatusUpdate([order.id], 'shipped', tracking || '');
                              }}
                              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-xs transition-colors"
                            >
                              Mark Shipped
                            </button>
                          )}
                          {order.status === 'shipped' && (
                            <button
                              onClick={() => handleOrderStatusUpdate([order.id], 'delivered')}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs transition-colors"
                            >
                              Mark Delivered
                            </button>
                          )}
                        </td>
                        <td className="py-3 px-4">
  <ProductActions
    product={order}
    onEdit={handleEditProduct}
    onDelete={handleDeleteProduct}
  />
</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-neutral-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <span className="text-4xl">📋</span>
                </div>
                <h3 className="font-display font-semibold text-xl text-primary-800 mb-2">
                  No Orders Found
                </h3>
                <p className="text-neutral-600 mb-6">
                  No orders match your current filters.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl p-8 shadow-soft">
            <h2 className="font-display font-semibold text-2xl text-primary-800 mb-6">
              Profile Settings
            </h2>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-red-800 font-medium">{error}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-6">
              {/* Business Name */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  name="business_name"
                  value={profileForm.business_name}
                  onChange={handleInputChange}
                  disabled={saving}
                  required
                  className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Business Description *
                </label>
                <textarea
                  name="description"
                  rows={4}
                  value={profileForm.description}
                  onChange={handleInputChange}
                  disabled={saving}
                  required
                  className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* Tax ID */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Tax ID / Business Registration Number
                </label>
                <input
                  type="text"
                  name="tax_id"
                  value={profileForm.tax_id}
                  onChange={handleInputChange}
                  disabled={saving}
                  className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* Business Logo */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Business Logo
                </label>
                <input
                  type="file"
                  name="business_logo"
                  onChange={handleFileChange}
                  disabled={saving}
                  accept="image/*"
                  className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                {vendorProfile.business_logo && (
                  <p className="text-sm text-neutral-600 mt-1">
                    Current logo: <a href={vendorProfile.business_logo} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">View</a>
                  </p>
                )}
              </div>

              {/* Business License */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Business License
                </label>
                <input
                  type="file"
                  name="business_license"
                  onChange={handleFileChange}
                  disabled={saving}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                {vendorProfile.business_license && (
                  <p className="text-sm text-neutral-600 mt-1">
                    Current license: <a href={vendorProfile.business_license} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">View</a>
                  </p>
                )}
              </div>

              {/* Read-only fields info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">Account Information</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <p><strong>Status:</strong> {vendorProfile.status}</p>
                  <p><strong>Member since:</strong> {new Date(vendorProfile.created_at).toLocaleDateString()}</p>
                  <p><strong>Last updated:</strong> {new Date(vendorProfile.updated_at).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-primary-800 hover:bg-primary-900 text-cream-100 px-8 py-3 rounded-lg font-semibold transition-colors duration-200 disabled:opacity-50"
                >
                  {saving ? 'Saving Changes...' : 'Save Changes'}
                </button>
                
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className="border-2 border-neutral-300 text-neutral-700 hover:bg-neutral-100 px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
                > 
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
      <ProductFormModal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        onSuccess={handleProductModalSuccess}
        editProduct={editingProduct}
        categories={categories}
      />
    </div>
  );
};

export default VendorDashboard;
