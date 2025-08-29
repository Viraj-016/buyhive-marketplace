// src/components/common/WishlistButton.jsx
import React, { useState } from 'react';
import ProtectedAction from './ProtectedAction';

const WishlistButton = ({ 
  productId, 
  isInWishlist = false, 
  size = 'medium',
  className = '',
  onToggle 
}) => {
  const [inWishlist, setInWishlist] = useState(isInWishlist);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleWishlist = async () => {
    setIsLoading(true);
    
    try {
      // In real app, this would be an API call
      console.log(inWishlist ? 'Removing from wishlist:' : 'Adding to wishlist:', productId);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const newState = !inWishlist;
      setInWishlist(newState);
      
      if (onToggle) {
        onToggle(productId, newState);
      }
      
    } catch (error) {
      console.error('Wishlist toggle error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6'
  };

  const buttonSizeClasses = {
    small: 'p-1',
    medium: 'p-2',
    large: 'p-3'
  };

  return (
    <ProtectedAction 
      action="save to wishlist"
      onAction={handleToggleWishlist}
      useModal={true}
    >
      <button
        disabled={isLoading}
        className={`rounded-full transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed ${buttonSizeClasses[size]} ${className} ${
          inWishlist 
            ? 'text-red-500 hover:text-red-600' 
            : 'text-neutral-400 hover:text-red-500'
        }`}
        title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <svg 
          className={`${sizeClasses[size]} transition-transform duration-200 ${isLoading ? 'animate-pulse' : ''}`} 
          fill={inWishlist ? 'currentColor' : 'none'} 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={inWishlist ? 0 : 1.5} 
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
          />
        </svg>
      </button>
    </ProtectedAction>
  );
};

export default WishlistButton;
