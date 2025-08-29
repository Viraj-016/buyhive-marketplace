// src/components/vendor/ProductFormModal.jsx
import React, { useState, useEffect } from 'react';
import { vendorsAPI, productsAPI } from '../../services/api';

const ProductFormModal = ({ isOpen, onClose, onSuccess, editProduct = null, categories = [] }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    base_price: '',
    category: '',
    is_active: true,
    featured: false,
    images: [],
    stock_quantity: '',
    low_stock_threshold: '5',
    has_variants: false,
    variants: [{ name: 'Default', stock: '', price_modifier: '0.00' }]
  });

  // Initialize form when editing
  useEffect(() => {
    if (editProduct) {
      setFormData({
        title: editProduct.title || '',
        description: editProduct.description || '',
        base_price: editProduct.base_price || '',
        category: editProduct.category?.id || '',
        is_active: editProduct.is_active,
        featured: editProduct.featured || false,
        images: [], // Always empty for new uploads
        stock_quantity: editProduct.variants?.[0]?.stock || '',
        low_stock_threshold: '5',
        has_variants: editProduct.variants?.length > 1,
        variants: editProduct.variants?.length > 0 ? editProduct.variants.map(v => ({
          name: v.name,
          stock: v.stock,
          price_modifier: v.price_modifier
        })) : [{ name: 'Default', stock: '', price_modifier: '0.00' }]
      });
      setError(''); // Clear errors when editing
    } else {
      setFormData({
        title: '',
        description: '',
        base_price: '',
        category: '',
        is_active: true,
        featured: false,
        images: [],
        stock_quantity: '',
        low_stock_threshold: '5',
        has_variants: false,
        variants: [{ name: 'Default', stock: '', price_modifier: '0.00' }]
      });
      setError('');
    }
  }, [editProduct, isOpen]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      images: files
    }));
    // Clear image error when files are selected
    if (files.length > 0 && error.includes('image')) {
      setError('');
    }
  };

  const handleVariantChange = (index, field, value) => {
    const updatedVariants = [...formData.variants];
    updatedVariants[index][field] = value;
    setFormData(prev => ({
      ...prev,
      variants: updatedVariants
    }));
  };

  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { name: '', stock: '', price_modifier: '0.00' }]
    }));
  };

  const removeVariant = (index) => {
    if (formData.variants.length > 1) {
      setFormData(prev => ({
        ...prev,
        variants: prev.variants.filter((_, i) => i !== index)
      }));
    }
  };

  const validateForm = () => {
    // ✅ FIXED: Make images required for new products
    if (!editProduct && (!formData.images || formData.images.length === 0)) {
      setError('At least one product image is required');
      return false;
    }

    if (!formData.title.trim()) {
      setError('Product title is required');
      return false;
    }

    if (!formData.description.trim()) {
      setError('Product description is required');
      return false;
    }

    if (!formData.base_price || parseFloat(formData.base_price) <= 0) {
      setError('Valid base price is required');
      return false;
    }

    if (!formData.category) {
      setError('Please select a category');
      return false;
    }

    // Validate variants
    for (let i = 0; i < formData.variants.length; i++) {
      const variant = formData.variants[i];
      if (!variant.name.trim()) {
        setError(`Variant ${i + 1} name is required`);
        return false;
      }
      if (!variant.stock || parseInt(variant.stock) < 0) {
        setError(`Variant ${i + 1} stock must be a non-negative number`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const payload = new FormData();
      
      // Basic product data
      payload.append('title', formData.title);
      payload.append('description', formData.description);
      payload.append('base_price', formData.base_price);
      payload.append('category', parseInt(formData.category));
      payload.append('is_active', formData.is_active ? 'true' : 'false');
      payload.append('featured', formData.featured ? 'true' : 'false');

      // Images (if provided)
      if (formData.images && formData.images.length > 0) {
        formData.images.forEach((image) => {
          payload.append('images', image);
        });
      }

      // Variants
      if (formData.has_variants) {
        formData.variants.forEach((variant, index) => {
          payload.append(`variants[${index}][name]`, variant.name);
          payload.append(`variants[${index}][stock]`, variant.stock);
          payload.append(`variants[${index}][price_modifier]`, variant.price_modifier);
        });
      } else {
        payload.append('variants[0][name]', 'Default');
        payload.append('variants[stock]', formData.stock_quantity || '0');
        payload.append('variants[price_modifier]', '0.00');
      }

      let response;
      if (editProduct) {
        response = await vendorsAPI.updateProduct(editProduct.id, payload);
      } else {
        response = await vendorsAPI.createProduct(payload);
      }

      onSuccess(response.data);
      onClose();
    } catch (error) {
      // console.error('Failed to save product:', error);
      if (error.response?.data) {
        const errors = [];
        Object.entries(error.response.data).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            errors.push(`${key}: ${value.join(', ')}`);
          } else {
            errors.push(`${key}: ${value}`);
          }
        });
        setError(errors.join('. '));
      } else {
        setError('Failed to save product. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-primary-800">
              {editProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            <button
              onClick={onClose}
              className="text-neutral-500 hover:text-neutral-700 text-2xl font-bold"
              disabled={loading}
            >
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Title */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Product Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter product title"
                required
                disabled={loading}
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Describe your product"
                required
                disabled={loading}
              />
            </div>

            {/* Base Price */}
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Base Price (₹) *
              </label>
              <input
                type="number"
                name="base_price"
                value={formData.base_price}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="0.00"
                required
                disabled={loading}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
                disabled={loading}
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Product Images */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Product Images {!editProduct && '*'}
                <span className="text-xs text-neutral-500 ml-2">
                  (You can upload multiple images)
                </span>
              </label>
              <input
                type="file"
                name="images"
                onChange={handleImageChange}
                multiple
                accept="image/*"
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                disabled={loading}
                required={!editProduct} // ✅ FIXED: Required for new products
              />
              <p className="text-xs text-neutral-500 mt-1">
                {!editProduct ? 'At least one image is required for new products' : 'Leave empty to keep existing images'}
              </p>
            </div>

            {/* Stock Management */}
            <div className="md:col-span-2">
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  name="has_variants"
                  checked={formData.has_variants}
                  onChange={handleInputChange}
                  className="mr-2"
                  disabled={loading}
                />
                <label className="text-sm font-semibold text-neutral-700">
                  This product has multiple variants (sizes, colors, etc.)
                </label>
              </div>

              {!formData.has_variants ? (
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    name="stock_quantity"
                    value={formData.stock_quantity}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="0"
                    required
                    disabled={loading}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-neutral-700">
                    Product Variants *
                  </label>
                  {formData.variants.map((variant, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-neutral-200 rounded-lg">
                      <div>
                        <input
                          type="text"
                          placeholder="Variant name (e.g., Large Red)"
                          value={variant.name}
                          onChange={(e) => handleVariantChange(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          required
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          placeholder="Stock"
                          value={variant.stock}
                          onChange={(e) => handleVariantChange(index, 'stock', e.target.value)}
                          min="0"
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          required
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          placeholder="Price modifier (₹)"
                          value={variant.price_modifier}
                          onChange={(e) => handleVariantChange(index, 'price_modifier', e.target.value)}
                          step="0.01"
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          disabled={loading}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        {formData.variants.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeVariant(index)}
                            className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                            disabled={loading}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addVariant}
                    className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors"
                    disabled={loading}
                  >
                    + Add Variant
                  </button>
                </div>
              )}
            </div>

            {/* Settings */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="mr-2"
                  disabled={loading}
                />
                <label className="text-sm font-semibold text-neutral-700">
                  Active (visible to customers)
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleInputChange}
                  className="mr-2"
                  disabled={loading}
                />
                <label className="text-sm font-semibold text-neutral-700">
                  Featured product
                </label>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent inline-block mr-2"></div>
                  {editProduct ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                editProduct ? 'Update Product' : 'Create Product'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductFormModal;
