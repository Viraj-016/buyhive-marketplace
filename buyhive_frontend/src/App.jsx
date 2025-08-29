// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer'; // ✅ Import Footer
import HomePage from './pages/HomePage';
import NotFound from './pages/NotFound'; // ✅ Import NotFound

// Import pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserDashboardPage from './pages/UserDashboardPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import OrderDetailPage from './pages/OrderDetailPage';
import VendorsPage from './pages/VendorsPage';
import VendorApplicationPage from './pages/VendorApplicationPage';
import VendorProfilePage from './pages/VendorProfilePage';
import VendorDashboard from './pages/VendorDashboard';
import WishlistPage from './pages/WishlistPage';
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App min-h-screen bg-cream-50">
          {/* Global Navigation */}
          <Navbar />
          
          {/* Main Content */}
          <main>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/vendors" element={<VendorsPage />} />
              <Route path="/vendors/:id" element={<VendorProfilePage />} />

              {/* Authentication Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Customer Routes */}
              <Route path="/dashboard" element={<UserDashboardPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/orders" element={<OrderHistoryPage />} />
              <Route path="/orders/:pk" element={<OrderDetailPage />} />

              {/* Vendor Routes */}
              <Route path="/vendor/apply" element={<VendorApplicationPage />} />
              <Route path="/vendor/dashboard" element={<VendorDashboard />} />
              <Route path="/wishlist" element={<WishlistPage />} />
              {/* ✅ 404 Route - MUST be last */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>

          {/* ✅ Global Footer */}
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
