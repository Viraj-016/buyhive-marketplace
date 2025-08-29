// src/components/layout/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom'; // ✅ Add this import

const Footer = () => (
  <footer className="bg-neutral-900 text-white py-12 mt-16">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Company Info */}
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-primary-800 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">B</span>
            </div>
            <span className="font-display font-bold text-2xl">BuyHive</span>
          </div>
          <p className="text-neutral-300 mb-4 max-w-md">
            Connecting you with authentic makers who craft with passion. 
            Discover unique handcrafted treasures that tell a story.
          </p>
          <div className="flex space-x-4">
            <a href="#" className="text-neutral-400 hover:text-white transition-colors">
              <span className="sr-only">Facebook</span>
              📘
            </a>
            <a href="#" className="text-neutral-400 hover:text-white transition-colors">
              <span className="sr-only">Instagram</span>
              📷
            </a>
            <a href="#" className="text-neutral-400 hover:text-white transition-colors">
              <span className="sr-only">Twitter</span>
              🐦
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-semibold text-lg mb-4">Shop</h3>
          <ul className="space-y-2 text-neutral-300">
            <li><Link to="/products" className="hover:text-white transition-colors">All Products</Link></li>
            <li><Link to="/vendors" className="hover:text-white transition-colors">All Vendors</Link></li>
            <li><a href="#" className="hover:text-white transition-colors">Categories</a></li>
            <li><a href="#" className="hover:text-white transition-colors">New Arrivals</a></li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h3 className="font-semibold text-lg mb-4">Support</h3>
          <ul className="space-y-2 text-neutral-300">
            <li><Link to="/vendor/apply" className="hover:text-white transition-colors">Become a Vendor</Link></li>
            <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Shipping Info</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-neutral-800 mt-12 pt-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-neutral-400 text-sm">
            © 2025 BuyHive. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-neutral-400 hover:text-white text-sm transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-neutral-400 hover:text-white text-sm transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-neutral-400 hover:text-white text-sm transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
