// src/components/common/AddToCartButton.jsx
import React from 'react';
import ProtectedAction from './ProtectedAction';

const AddToCartButton = ({ product, variant = null, quantity = 1, className = "" }) => {
  const handleAddToCart = async () => {
    try {
      // Add to cart logic here
      console.log('Adding to cart:', { product, variant, quantity });
      // TODO: Call your cart API
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const isOutOfStock = variant ? variant.stock === 0 : !product.in_stock;

  return (
    <ProtectedAction
      action="add items to cart"
      onAction={handleAddToCart}
    >
      <button
        className={`${className} ${
          isOutOfStock 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-primary-800 hover:bg-primary-900'
        } text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200`}
        disabled={isOutOfStock}
      >
        {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
      </button>
    </ProtectedAction>
  );
};

export default AddToCartButton;
