// src/pages/NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom'; // ✅ Add this import

const NotFound = () => (
  <div className="min-h-screen bg-cream-50 flex items-center justify-center">
    <div className="text-center">
      <h1 className="font-display font-bold text-6xl text-primary-800 mb-4">404</h1>
      <h2 className="font-display font-semibold text-2xl text-neutral-700 mb-6">
        Page Not Found
      </h2>
      <p className="text-neutral-600 mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="space-x-4">
        <Link 
          to="/"
          className="bg-primary-800 hover:bg-primary-900 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
        >
          Go Back Home
        </Link>
        <Link 
          to="/products"
          className="border-2 border-primary-800 text-primary-800 hover:bg-primary-800 hover:text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
        >
          Browse Products
        </Link>
      </div>
    </div>
  </div>
);

export default NotFound;
