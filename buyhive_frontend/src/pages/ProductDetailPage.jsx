// src/pages/ProductDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ProtectedAction from '../components/common/ProtectedAction';
import { useAuth } from '../context/AuthContext';
import { productsAPI, ordersAPI, wishlistAPI } from '../services/api';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const [wishlistItems, setWishlistItems] = useState([]);
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  // Helper function for formatting prices
  const formatPrice = (price) => {
    return parseFloat(price || 0).toFixed(2);
  };

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  useEffect(() => {
    const fetchWishlistStatus = async () => {
      try {
        const response = await wishlistAPI.getWishlist();
        setWishlistItems(response.data.products.map(p => p.id));
      } catch (error) {
        console.error('Failed to fetch wishlist status:', error);
      }
    };

    if (isAuthenticated) {
      fetchWishlistStatus();
    }
  }, [isAuthenticated]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.detail(id);
      const productData = response.data;
      
      setProduct(productData);
      
      // Set first active variant as default
      const activeVariants = productData.variants?.filter(v => v.is_active && v.stock > 0);
      if (activeVariants?.length > 0) {
        setSelectedVariant(activeVariants[0]);
      } else if (productData.variants?.length > 0) {
        setSelectedVariant(productData.variants);
      }

      // Set primary image or first image as default
      const primaryImageIndex = productData.images?.findIndex(img => img.is_primary);
      if (primaryImageIndex >= 0) {
        setSelectedImageIndex(primaryImageIndex);
      }

      // Reviews are included in product response
      setReviews(productData.reviews || []);
      
      // Fetch related products
      if (productData.category?.id) {
        fetchRelatedProducts(productData.category.id, productData.id);
      }
      
    } catch (error) {
      console.error('Failed to fetch product:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async (categoryId, currentProductId) => {
    try {
      setRelatedLoading(true);
      const response = await productsAPI.list({ 
        category: categoryId,
        limit: 8
      });
      
      const productsData = response.data.results || response.data;
      const filteredProducts = productsData
        .filter(p => p.id !== parseInt(currentProductId))
        .slice(0, 6);
      
      setRelatedProducts(filteredProducts);
    } catch (error) {
      console.error('Failed to fetch related products:', error);
    } finally {
      setRelatedLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      const response = await productsAPI.reviews(id);
      const reviewsData = response.data.results || response.data;
      setReviews(reviewsData);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleToggleWishlist = async (productId) => {
    try {
      const response = await wishlistAPI.toggleProduct(productId);
      if (response.data.is_added) {
        setWishlistItems(prev => [...prev, productId]);
      } else {
        setWishlistItems(prev => prev.filter(id => id !== productId));
      }
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!newReview.comment.trim()) {
      alert('Please write a review comment');
      return;
    }
    
    setSubmittingReview(true);
    try {
      await productsAPI.createReview(id, newReview);
      setNewReview({ rating: 5, comment: '' });
      fetchReviews();
      alert('Review submitted successfully!');
    } catch (error) {
      console.error('Failed to submit review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleAddToCart = async () => {
    setAddingToCart(true);
    try {
      const cartItemData = {
        product_id: product.id,
        variant_id: selectedVariant?.id,
        quantity: quantity
      };
      
      await ordersAPI.addToCart(cartItemData);
      alert(`Added ${quantity} ${product.title} ${selectedVariant ? `(${selectedVariant.name})` : ''} to cart!`);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('Failed to add to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  const StarRating = ({ rating, reviewCount, size = 'small', interactive = false, onRatingChange }) => {
    const starSize = size === 'large' ? 'w-6 h-6' : 'w-4 h-4';
    const textSize = size === 'large' ? 'text-lg' : 'text-sm';

    const handleStarClick = (starRating) => {
      if (interactive && onRatingChange) {
        onRatingChange(starRating);
      }
    };

    return (
      <div className="flex items-center space-x-2">
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type={interactive ? 'button' : undefined}
              onClick={interactive ? () => handleStarClick(star) : undefined}
              className={`${starSize} ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
              disabled={!interactive}
            >
              <svg
                className={`${starSize} ${
                  star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                }`}
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}
        </div>
        {reviewCount !== undefined && (
          <span className={`${textSize} text-neutral-600`}>
            ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
          </span>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-800 mx-auto mb-4"></div>
          <p className="text-primary-800 font-medium text-lg">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center bg-white rounded-2xl shadow-lg p-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-primary-800 mb-4">Product Not Found</h2>
          <p className="text-neutral-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
          <Link
            to="/products"
            className="inline-block bg-primary-800 hover:bg-primary-900 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            Browse All Products
          </Link>
        </div>
      </div>
    );
  }

  const finalPrice = selectedVariant?.final_price || product?.base_price;
  const isInStock = selectedVariant?.stock > 0 || product?.in_stock;

  return (
    <div className="min-h-screen bg-cream-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Product Details */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            
            {/* Product Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="aspect-square bg-neutral-100 rounded-lg overflow-hidden">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[selectedImageIndex]?.image || product.primary_image}
                    alt={product.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = '/api/placeholder/500/500';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-24 h-24 bg-neutral-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-12 h-12 text-neutral-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p className="text-neutral-500 font-medium">No Image Available</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Thumbnail Images */}
              {product.images && product.images.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                        selectedImageIndex === index 
                          ? 'border-primary-800 shadow-lg' 
                          : 'border-neutral-200 hover:border-primary-800'
                      }`}
                    >
                      <img
                        src={image.image}
                        alt={`${product.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              
              {/* Title and Rating */}
              <div>
                <div className="flex items-start justify-between mb-2">
                  <h1 className="text-3xl font-bold text-primary-800 leading-tight">{product.title}</h1>
                  <ProtectedAction
                    action="manage wishlist"
                    onAction={() => handleToggleWishlist(product.id)}
                  >
                    <button className={`p-3 rounded-full transition-all duration-200 ${
                      wishlistItems.includes(product.id) 
                        ? 'text-red-500 bg-red-50 hover:bg-red-100' 
                        : 'text-neutral-400 hover:text-red-500 hover:bg-red-50'
                    }`}>
                      <svg className="w-6 h-6" fill={wishlistItems.includes(product.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </ProtectedAction>
                </div>
                
                {product.average_rating > 0 && (
                  <StarRating 
                    rating={product.average_rating} 
                    reviewCount={product.review_count} 
                    size="small" 
                  />
                )}
                
                <p className="text-neutral-600 mt-2">
                  by <Link to={`/vendors/${product.vendor_id}`} className="text-primary-800 hover:text-primary-700 font-medium">
                    {product.vendor_name}
                  </Link>
                </p>
              </div>

              {/* Price */}
              <div className="text-4xl font-bold text-primary-800">
                ₹{formatPrice(finalPrice)}
                {selectedVariant && selectedVariant.price_modifier !== 0 && (
                  <span className="text-lg text-neutral-500 ml-2">
                    (Base: ₹{formatPrice(product.base_price)})
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isInStock ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className={`font-medium ${isInStock ? 'text-green-700' : 'text-red-700'}`}>
                  {selectedVariant?.stock > 0 
                    ? `${selectedVariant.stock} in stock` 
                    : isInStock 
                      ? 'In stock' 
                      : 'Out of stock'
                  }
                </span>
              </div>

              {/* Variants */}
              {product.variants && product.variants.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-neutral-800">Select Variant:</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((variant) => (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariant(variant)}
                        disabled={!variant.is_active || variant.stock === 0}
                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                          selectedVariant?.id === variant.id
                            ? 'bg-primary-800 text-white shadow-lg'
                            : variant.is_active && variant.stock > 0
                              ? 'bg-neutral-100 text-neutral-700 hover:bg-primary-100 hover:text-primary-800'
                              : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                        }`}
                      >
                        {variant.name}
                        {variant.stock === 0 && ' (Out of Stock)'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              {isInStock && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-neutral-800">Quantity:</h3>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 rounded-lg bg-neutral-200 hover:bg-neutral-300 flex items-center justify-center font-bold text-neutral-700 transition-colors"
                    >
                      -
                    </button>
                    <span className="w-16 text-center font-bold text-lg">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 rounded-lg bg-neutral-200 hover:bg-neutral-300 flex items-center justify-center font-bold text-neutral-700 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons - USING YOUR ORIGINAL COLORS */}
              <div className="space-y-4">
                <ProtectedAction
                  action="add items to cart"
                  onAction={handleAddToCart}
                >
                  <button
                    disabled={!isInStock || addingToCart}
                    className={`w-full py-4 px-6 rounded-lg font-bold text-lg transition-all duration-300 ${
                      isInStock && !addingToCart
                        ? 'bg-primary-800 hover:bg-primary-900 text-white shadow-lg'
                        : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                    }`}
                  >
                    {addingToCart ? 'Adding to Cart...' : isInStock ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                </ProtectedAction>

                <button
                  onClick={() => navigate('/cart')}
                  className="w-full py-4 px-6 rounded-lg font-bold text-lg bg-neutral-200 hover:bg-neutral-300 text-neutral-700 transition-all duration-300"
                >
                  View Cart
                </button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-neutral-200">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-xs font-medium text-green-700">Secure Payment</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                    </svg>
                  </div>
                  <p className="text-xs font-medium text-blue-700">Free Shipping</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <svg className="w-6 h-6 text-accent-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-xs font-medium text-accent-600">Easy Returns</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="border-t border-neutral-200">
            {/* Tab Navigation */}
            <div className="flex border-b border-neutral-200">
              <button
                onClick={() => setActiveTab('description')}
                className={`px-8 py-4 font-semibold transition-colors ${
                  activeTab === 'description'
                    ? 'text-primary-800 border-b-2 border-primary-800'
                    : 'text-neutral-600 hover:text-primary-800'
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`px-8 py-4 font-semibold transition-colors ${
                  activeTab === 'reviews'
                    ? 'text-primary-800 border-b-2 border-primary-800'
                    : 'text-neutral-600 hover:text-primary-800'
                }`}
              >
                Reviews ({product.review_count})
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-8">
              {activeTab === 'description' && (
                <div className="space-y-6">
                  <div className="prose prose-lg max-w-none">
                    <p className="text-neutral-700 leading-relaxed">
                      {product.description || 'No description available for this product.'}
                    </p>
                  </div>

                  {/* Vendor Info */}
                  <div className="bg-neutral-50 rounded-lg p-6">
                    <h3 className="font-bold text-primary-800 mb-2">About the Vendor</h3>
                    <p className="text-neutral-600">
                      Premium furniture and home decor from trusted vendors.
                    </p>
                    <Link
                      to={`/vendors/${product.vendor_id}`}
                      className="inline-block mt-3 text-primary-800 hover:text-primary-700 font-medium"
                    >
                      Visit {product.vendor_name} Store →
                    </Link>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-8">
                  {/* Reviews Summary */}
                  <div className="text-center">
                    {product.average_rating > 0 ? (
                      <div>
                        <StarRating 
                          rating={product.average_rating} 
                          size="large" 
                        />
                        <p className="text-neutral-600 mt-2">
                          Based on {product.review_count} reviews
                        </p>
                      </div>
                    ) : (
                      <p className="text-neutral-600">No reviews yet</p>
                    )}
                  </div>

                  {/* Review Form */}
                  {isAuthenticated && (
                    <div className="bg-neutral-50 rounded-lg p-6">
                      <h3 className="font-bold text-primary-800 mb-4">Write a Review</h3>
                      <form onSubmit={handleSubmitReview} className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-neutral-700 mb-2">
                            Rating
                          </label>
                          <StarRating
                            rating={newReview.rating}
                            size="large"
                            interactive={true}
                            onRatingChange={(rating) => setNewReview(prev => ({ ...prev, rating }))}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-semibold text-neutral-700 mb-2">
                            Your Review
                          </label>
                          <textarea
                            value={newReview.comment}
                            onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                            placeholder="Tell others about your experience with this product..."
                            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-800 focus:border-primary-800 transition-colors"
                            rows="4"
                            required
                          />
                        </div>
                        
                        <button
                          type="submit"
                          disabled={submittingReview || !newReview.comment.trim()}
                          className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                            submittingReview || !newReview.comment.trim()
                              ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                              : 'bg-primary-800 hover:bg-primary-900 text-white'
                          }`}
                        >
                          {submittingReview ? 'Submitting...' : 'Submit Review'}
                        </button>
                      </form>
                    </div>
                  )}

                  {/* Reviews List */}
                  <div className="space-y-6">
                    {reviewsLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-800 border-t-transparent mx-auto mb-4"></div>
                        <p className="text-neutral-600">Loading reviews...</p>
                      </div>
                    ) : reviews.length > 0 ? (
                      reviews.map((review) => (
                        <div key={review.id} className="border-b border-neutral-200 pb-6">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <StarRating rating={review.rating} size="small" />
                              <p className="font-semibold text-neutral-800 mt-1">{review.user}</p>
                              <p className="text-sm text-neutral-500">
                                {new Date(review.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <p className="text-neutral-700 leading-relaxed">{review.comment}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-neutral-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <p className="text-neutral-600">Be the first to review this product!</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Products You May Like */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-primary-800 mb-6">Products You May Like</h2>
          
          {relatedLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-neutral-200 aspect-square rounded-lg mb-3"></div>
                  <div className="bg-neutral-200 h-4 rounded mb-2"></div>
                  <div className="bg-neutral-200 h-4 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : relatedProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  to={`/products/${relatedProduct.id}`}
                  className="group"
                >
                  <div className="bg-neutral-100 aspect-square rounded-lg overflow-hidden mb-3 group-hover:shadow-lg transition-all duration-300">
                    {relatedProduct.primary_image ? (
                      <img
                        src={relatedProduct.primary_image}
                        alt={relatedProduct.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = '/api/placeholder/200/200';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-12 h-12 text-neutral-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold text-neutral-800 text-sm mb-1 line-clamp-2 group-hover:text-primary-800 transition-colors">
                    {relatedProduct.title}
                  </h3>
                  <p className="text-primary-800 font-bold">
                    ₹{formatPrice(relatedProduct.base_price)}
                  </p>
                  {relatedProduct.average_rating > 0 && (
                    <div className="mt-1">
                      <StarRating 
                        rating={relatedProduct.average_rating} 
                        reviewCount={relatedProduct.review_count}
                        size="small" 
                      />
                    </div>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-neutral-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </div>
              <p className="text-neutral-600">No related products found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
