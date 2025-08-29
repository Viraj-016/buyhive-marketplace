// src/components/vendor/ProductActions.jsx
import React, { useState } from 'react';

const ProductActions = ({ product, onEdit, onDelete, loading = false }) => {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${product.title}"? This action cannot be undone.`)) {
      setDeleting(true);
      try {
        await onDelete(product.id);
      } finally {
        setDeleting(false);
      }
    }
  };

  return (
    <div className="flex items-center space-x-2">
      {/* Edit Button */}
      <button
        onClick={() => onEdit(product)}
        disabled={loading || deleting}
        className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-blue-100 hover:bg-blue-200 text-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Edit Product"
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        Edit
      </button>

      {/* Delete Button */}
      <button
        onClick={handleDelete}
        disabled={loading || deleting}
        className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-red-100 hover:bg-red-200 text-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Delete Product"
      >
        {deleting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-600 border-t-transparent mr-1"></div>
            Deleting...
          </>
        ) : (
          <>
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </>
        )}
      </button>

      {/* Toggle Active Status */}
      <button
        onClick={() => onEdit({ ...product, is_active: !product.is_active })}
        disabled={loading || deleting}
        className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          product.is_active 
            ? 'bg-green-100 hover:bg-green-200 text-green-700' 
            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
        }`}
        title={product.is_active ? 'Deactivate Product' : 'Activate Product'}
      >
        {product.is_active ? 'Active' : 'Inactive'}
      </button>
    </div>
  );
};

export default ProductActions;
