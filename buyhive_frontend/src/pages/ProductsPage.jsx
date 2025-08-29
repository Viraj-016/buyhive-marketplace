// src/pages/ProductsPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import WishlistButton from '../components/common/WishlistButton'; 
import { productsAPI } from '../services/api'; // Import the products API

const ProductsPage = () => {
  // Updated state to use real data instead of sample data
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('-created_at'); // Use backend ordering format
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    featured: '',
    ordering: '-created_at',
    in_stock_only: false
  });

  // Fetch data from backend on component mount and when filters change
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [filters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      // Build query parameters for backend API
      const queryParams = {};
      if (filters.category) queryParams.category = filters.category;
      if (filters.search) queryParams.search = filters.search;
      if (filters.featured) queryParams.featured = filters.featured;
      if (filters.ordering) queryParams.ordering = filters.ordering;
      
      console.log('Fetching products with params:', queryParams);
      const response = await productsAPI.list(queryParams);
      console.log('Products response:', response.data);
      
      // Handle pagination like addresses
      const productsData = response.data.results || response.data;
      setProducts(productsData);
      
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await productsAPI.categories();
      console.log('Categories response:', response.data);
      
      // Handle pagination for categories
      const categoriesData = response.data.results || response.data;
      setCategories(categoriesData);
      
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  // Updated to use backend API instead of local filtering
  const handleCategoryFilter = (categoryId) => {
    setSelectedCategory(categoryId);
    setFilters(prev => ({
      ...prev,
      category: categoryId === 'all' ? '' : categoryId
    }));
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setFilters(prev => ({
      ...prev,
      search: query
    }));
  };

  const handleSort = (sortOption) => {
    setSortBy(sortOption);
    
    // Map frontend sort options to backend ordering
    let backendOrdering = '-created_at';
    switch (sortOption) {
      case 'price-low':
        backendOrdering = 'base_price';
        break;
      case 'price-high':
        backendOrdering = '-base_price';
        break;
      case 'title':
        backendOrdering = 'title';
        break;
      case 'newest':
      default:
        backendOrdering = '-created_at';
        break;
    }
    
    setFilters(prev => ({
      ...prev,
      ordering: backendOrdering
    }));
  };

  const handleFeaturedFilter = (featured) => {
    setFilters(prev => ({
      ...prev,
      featured: featured ? 'true' : ''
    }));
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSearchQuery('');
    setFilters({
      category: '',
      search: '',
      featured: '',
      ordering: '-created_at',
      in_stock_only: false
    });
  };

  const StarRating = ({ rating, reviewCount }) => (
    <div className="flex items-center space-x-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400' : 'text-neutral-300'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <span className="text-sm text-neutral-600">({reviewCount})</span>
    </div>
  );

  const ProductCard = ({ product }) => (
    <div className="bg-white rounded-2xl overflow-hidden shadow-soft hover:shadow-medium transition-all duration-300 group">
      {/* Product Image */}
      <div className="relative h-64 bg-gradient-warm flex items-center justify-center overflow-hidden">
        {/* Show real image if available */}
        {product.primary_image ? (
          <img 
            src={product.primary_image} 
            alt={product.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-cream-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p className="text-neutral-500 text-sm">Product Image</p>
          </div>
        )}
        
        {/* Updated badges to use backend fields */}
        <div className="absolute top-4 left-4 flex flex-col space-y-2">
          {/* Show "Featured" badge for featured products */}
          {product.featured && (
            <span className="bg-accent-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              Featured
            </span>
          )}
          {/* Show "New" badge for products created in last 30 days */}
          {new Date() - new Date(product.created_at) < 30 * 24 * 60 * 60 * 1000 && (
            <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              New
            </span>
          )}
        </div>

        {/* Quick Actions */}
        <div className="absolute top-4 right-4 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <WishlistButton 
            productId={product.id}
            size="medium"
            className="bg-white shadow-medium hover:bg-neutral-50"
          />
          <button className="p-2 bg-white rounded-full shadow-medium hover:bg-neutral-50 transition-colors duration-200">
            <svg className="w-4 h-4 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-6">
        <div className="mb-2">
          {/* Updated to use backend serializer fields */}
          <p className="text-sm text-neutral-500">{product.vendor_name}</p>
          <Link 
            to={`/products/${product.id}`} // Use ID instead of slug (backend uses ID routing)
            className="font-display font-semibold text-lg text-primary-800 hover:text-primary-600 transition-colors duration-200 line-clamp-2"
          >
            {product.title}
          </Link>
        </div>

        <div className="mb-4">
          {/* Updated to use backend calculated properties */}
          <StarRating rating={product.average_rating} reviewCount={product.review_count} />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* Updated to use base_price from backend */}
            <span className="font-bold text-xl text-primary-800">₹{product.base_price}</span>
          </div>
          
          <Link 
            to={`/products/${product.id}`} 
            className="bg-primary-800 hover:bg-primary-900 text-cream-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 inline-block text-center"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );

  // Show loading state
  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading products...</p>
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
              <span className="text-primary-800">Products</span>
            </nav>
            <h1 className="font-display font-bold text-4xl text-primary-800">
              All Products
            </h1>
            <p className="text-neutral-600 mt-2">
              Discover our carefully curated collection of home furniture and decor
            </p>
          </div>

          {/* Search and Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Sort and View Controls */}
            <div className="flex items-center space-x-4">
              {/* Sort - Updated options to match backend */}
              <select
                value={sortBy}
                onChange={(e) => handleSort(e.target.value)}
                className="px-4 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="title">Alphabetical</option>
              </select>

              {/* View Toggle */}
              <div className="flex border border-cream-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-primary-800 text-white' : 'text-neutral-600 hover:bg-cream-100'} transition-colors duration-200`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-primary-800 text-white' : 'text-neutral-600 hover:bg-cream-100'} transition-colors duration-200`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-soft mb-8 lg:sticky lg:top-24">
              <h3 className="font-display font-semibold text-xl text-primary-800 mb-6">
                Filters
              </h3>
              
              {/* Category Filter */}
              <div className="mb-8">
                <h4 className="font-medium text-neutral-800 mb-4">Category</h4>
                <div className="space-y-3">
                  <button
                    onClick={() => handleCategoryFilter('all')}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors duration-200 ${
                      selectedCategory === '' || selectedCategory === 'all'
                        ? 'bg-primary-100 text-primary-800 font-medium'
                        : 'text-neutral-600 hover:bg-cream-100'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryFilter(category.id)}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors duration-200 ${
                        selectedCategory === category.id
                          ? 'bg-primary-100 text-primary-800 font-medium'
                          : 'text-neutral-600 hover:bg-cream-100'
                      }`}
                    >
                      {category.name}
                      {/* Show parent path if hierarchical */}
                      {category.parent && (
                        <span className="text-neutral-400 text-xs block">
                          in {category.parent.name}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Featured Filter */}
              <div className="mb-6">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.featured === 'true'}
                    onChange={(e) => handleFeaturedFilter(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-neutral-700">Featured Products Only</span>
                </label>
              </div>

              {/* Clear Filters */}
              <button
                onClick={clearFilters}
                className="w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Clear All Filters
              </button>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-neutral-600">
                {loading ? (
                  'Loading products...'
                ) : (
                  <>
                    Showing <span className="font-medium">{products.length}</span> products
                  </>
                )}
              </p>
            </div>

            {/* Loading state during refetch */}
            {loading && products.length > 0 && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-800 mx-auto mb-4"></div>
                <p className="text-neutral-600">Updating products...</p>
              </div>
            )}

            {/* Products */}
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' 
                : 'grid-cols-1'
            }`}>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Empty State */}
            {!loading && products.length === 0 && (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-neutral-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="font-display font-semibold text-xl text-neutral-800 mb-2">
                  No products found
                </h3>
                <p className="text-neutral-600 mb-4">
                  Try adjusting your search or filter criteria
                </p>
                <button 
                  onClick={clearFilters}
                  className="bg-primary-800 text-cream-100 px-6 py-2 rounded-lg font-medium hover:bg-primary-900 transition-colors duration-200"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
