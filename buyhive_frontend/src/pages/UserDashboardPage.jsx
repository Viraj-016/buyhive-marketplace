// src/pages/UserDashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { addressAPI } from '../services/api';

const UserDashboardPage = () => {
  const { user, updateProfile, isAuthenticated, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [addresses, setAddresses] = useState([]);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    bio: '',
    phone_number: '',
    profile_picture: null
  });

  const [addressForm, setAddressForm] = useState({
    street_address: '',
    apartment_address: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'India',
    address_type: 'shipping',
    is_default: false
  });

  // Indian states for dropdown
  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 
    'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 
    'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 
    'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir', 
    'Ladakh', 'Puducherry', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 
    'Lakshadweep', 'Andaman and Nicobar Islands'
  ];

  // Phone number validation
  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  // PIN code validation
  const validatePinCode = (pinCode) => {
    const pinRegex = /^[1-9][0-9]{5}$/;
    return pinRegex.test(pinCode);
  };

  useEffect(() => {
    if (user) {
      setProfileForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        bio: user.profile?.bio || '',
        phone_number: user.profile?.phone_number || '',
        profile_picture: null
      });
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAddresses();
    }
  }, [isAuthenticated]);

  const fetchAddresses = async () => {
    try {
      setAddressesLoading(true);
      const response = await addressAPI.list();
      const addressesData = response.data.results || response.data;
      setAddresses(addressesData);
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
    } finally {
      setAddressesLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    // Validate phone number
    if (profileForm.phone_number && !validatePhoneNumber(profileForm.phone_number)) {
      alert('Please enter a valid Indian mobile number (10 digits starting with 6-9)');
      return;
    }

    setIsLoading(true);
    try {
      const result = await updateProfile(profileForm);
      if (result.success) {
        setIsEditingProfile(false);
        alert('Profile updated successfully!');
      } else {
        alert('Failed to update profile: ' + (result.error?.detail || 'Unknown error'));
      }
    } catch (error) {
      console.error('Profile update error:', error);
      alert('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    
    // Validate PIN code
    if (!validatePinCode(addressForm.zip_code)) {
      alert('Please enter a valid Indian PIN code (6 digits)');
      return;
    }

    setIsLoading(true);
    try {
      if (editingAddress) {
        await addressAPI.update(editingAddress.id, addressForm);
        setEditingAddress(null);
      } else {
        await addressAPI.create(addressForm);
      }
      setIsAddingAddress(false);
      await fetchAddresses();
      setAddressForm({
        street_address: '',
        apartment_address: '',
        city: '',
        state: '',
        zip_code: '',
        country: 'India',
        address_type: 'shipping',
        is_default: false
      });
    } catch (error) {
      console.error('Address save error:', error);
      alert('Failed to save address');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditAddress = (address) => {
    setAddressForm(address);
    setEditingAddress(address);
    setIsAddingAddress(true);
  };

  const handleDeleteAddress = async (addressId) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await addressAPI.delete(addressId);
        await fetchAddresses();
      } catch (error) {
        console.error('Delete address error:', error);
        alert('Failed to delete address');
      }
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      await addressAPI.setDefault(addressId);
      await fetchAddresses();
    } catch (error) {
      console.error('Set default address error:', error);
      alert('Failed to set default address');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-50 to-primary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600 mx-auto mb-4"></div>
          <p className="text-primary-700 font-medium text-lg">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-50 to-primary-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center bg-white rounded-3xl shadow-xl p-8">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-primary-800 mb-4">Welcome to BuyHive</h2>
          <p className="text-neutral-600 mb-6">You need to sign in to access your dashboard and manage your account.</p>
          <Link
            to="/login"
            className="inline-block bg-primary-700 hover:bg-primary-800 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-primary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Enhanced Header Section */}
        <div className="mb-12">
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-primary-100">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  {user.profile?.profile_picture ? (
                    <img
                      src={user.profile.profile_picture}
                      alt="Profile"
                      className="w-20 h-20 rounded-full object-cover border-4 border-primary-200 shadow-lg"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white text-2xl font-bold">
                        {user.first_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                      </span>
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-primary-800 mb-2">
                    Welcome back, {user.first_name || 'Friend'}! 👋
                  </h1>
                  <p className="text-neutral-600 text-lg">
                    {user.email}
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      Active Member
                    </span>
                    {user.is_vendor && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                        Verified Vendor
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Enhanced Vendor Section */}
              {user.is_vendor && (
                <div className="bg-gradient-to-br from-purple-50 to-accent-50 rounded-2xl p-6 border-2 border-purple-200 lg:max-w-sm">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-purple-800 text-lg">Vendor Dashboard</h3>
                      <p className="text-purple-600 text-sm">Manage your business</p>
                    </div>
                  </div>
                  <p className="text-purple-700 mb-4 text-sm leading-relaxed">
                    Access your vendor tools to manage products, view analytics, and grow your business on BuyHive.
                  </p>
                  <Link
                    to="/vendor/dashboard"
                    className="inline-flex items-center justify-center w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                    </svg>
                    Go to Vendor Panel
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Navigation Tabs */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-2 border border-primary-100">
            <nav className="flex space-x-1">
              {[
                { id: 'profile', name: 'Profile Settings', icon: '👤' },
                { id: 'addresses', name: 'My Addresses', icon: '📍' },
                { id: 'orders', name: 'Order History', icon: '📦' },
                { id: 'security', name: 'Security', icon: '🔒' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-primary-600 text-white shadow-lg transform scale-105'
                      : 'text-neutral-600 hover:bg-primary-50 hover:text-primary-700'
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Enhanced Content Sections */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-primary-100">
          
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-primary-800 mb-2">Profile Information</h2>
                  <p className="text-neutral-600">Manage your account settings and preferences</p>
                </div>
                {!isEditingProfile && (
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    <span>Edit Profile</span>
                  </button>
                )}
              </div>

              {!isEditingProfile ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-2xl p-6 border border-primary-200">
                      <label className="block text-sm font-semibold text-primary-700 mb-2">Email Address</label>
                      <p className="text-lg text-primary-800 font-medium">{user.email}</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-2xl p-6 border border-primary-200">
                      <label className="block text-sm font-semibold text-primary-700 mb-2">First Name</label>
                      <p className="text-lg text-primary-800 font-medium">
                        {user.first_name || <span className="text-neutral-500 italic">Not provided</span>}
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-2xl p-6 border border-primary-200">
                      <label className="block text-sm font-semibold text-primary-700 mb-2">Last Name</label>
                      <p className="text-lg text-primary-800 font-medium">
                        {user.last_name || <span className="text-neutral-500 italic">Not provided</span>}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-accent-50 to-cream-50 rounded-2xl p-6 border border-accent-200">
                      <label className="block text-sm font-semibold text-accent-700 mb-2">📱 Mobile Number</label>
                      {user.profile?.phone_number ? (
                        <p className="text-lg text-accent-800 font-medium">+91 {user.profile.phone_number}</p>
                      ) : (
                        <div className="text-neutral-500 italic">
                          📱 Add your mobile number for order updates and support
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-gradient-to-br from-accent-50 to-cream-50 rounded-2xl p-6 border border-accent-200">
                      <label className="block text-sm font-semibold text-accent-700 mb-2">✨ About You</label>
                      {user.profile?.bio ? (
                        <p className="text-lg text-accent-800 leading-relaxed">{user.profile.bio}</p>
                      ) : (
                        <div className="text-neutral-500 italic">
                          ✨ Tell us about yourself! Share your home decor style or what you're looking for.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-primary-700 mb-2">First Name</label>
                      <input
                        type="text"
                        value={profileForm.first_name}
                        onChange={(e) => setProfileForm({...profileForm, first_name: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-primary-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all duration-300"
                        placeholder="Enter your first name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-primary-700 mb-2">Last Name</label>
                      <input
                        type="text"
                        value={profileForm.last_name}
                        onChange={(e) => setProfileForm({...profileForm, last_name: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-primary-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all duration-300"
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-primary-700 mb-2">Mobile Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-neutral-500 font-medium">+91</span>
                      </div>
                      <input
                        type="tel"
                        value={profileForm.phone_number}
                        onChange={(e) => setProfileForm({...profileForm, phone_number: e.target.value})}
                        className="w-full pl-12 pr-4 py-3 border-2 border-primary-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all duration-300"
                        placeholder="9876543210"
                        maxLength="10"
                      />
                    </div>
                    <p className="text-xs text-neutral-600 mt-1">Enter 10-digit mobile number starting with 6, 7, 8, or 9</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-primary-700 mb-2">About You</label>
                    <textarea
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})}
                      rows="4"
                      className="w-full px-4 py-3 border-2 border-primary-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all duration-300"
                      placeholder="Tell us about your home decor preferences, style, or what you're looking for..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-primary-700 mb-2">Profile Picture</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setProfileForm({...profileForm, profile_picture: e.target.files})}
                      className="w-full px-4 py-3 border-2 border-primary-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all duration-300"
                    />
                  </div>
                  
                  <div className="flex space-x-4 pt-4">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50"
                    >
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="bg-neutral-200 hover:bg-neutral-300 text-neutral-700 px-8 py-3 rounded-xl font-semibold transition-all duration-300"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Addresses Tab */}
          {activeTab === 'addresses' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-primary-800 mb-2">My Addresses</h2>
                  <p className="text-neutral-600">Manage your delivery addresses</p>
                </div>
                <button
                  onClick={() => setIsAddingAddress(true)}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  <span>Add New Address</span>
                </button>
              </div>

              {isAddingAddress && (
                <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-2xl p-6 border-2 border-primary-200">
                  <h3 className="text-xl font-bold text-primary-800 mb-4">
                    {editingAddress ? 'Edit Address' : 'Add New Address'}
                  </h3>
                  <form onSubmit={handleAddressSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-primary-700 mb-2">Street Address *</label>
                        <input
                          type="text"
                          required
                          value={addressForm.street_address}
                          onChange={(e) => setAddressForm({...addressForm, street_address: e.target.value})}
                          className="w-full px-4 py-3 border-2 border-primary-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all duration-300"
                          placeholder="House/Flat No., Building, Street"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-primary-700 mb-2">Apartment/Landmark</label>
                        <input
                          type="text"
                          value={addressForm.apartment_address}
                          onChange={(e) => setAddressForm({...addressForm, apartment_address: e.target.value})}
                          className="w-full px-4 py-3 border-2 border-primary-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all duration-300"
                          placeholder="Apartment, Landmark, Area"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-primary-700 mb-2">City *</label>
                        <input
                          type="text"
                          required
                          value={addressForm.city}
                          onChange={(e) => setAddressForm({...addressForm, city: e.target.value})}
                          className="w-full px-4 py-3 border-2 border-primary-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all duration-300"
                          placeholder="City"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-primary-700 mb-2">State *</label>
                        <select
                          required
                          value={addressForm.state}
                          onChange={(e) => setAddressForm({...addressForm, state: e.target.value})}
                          className="w-full px-4 py-3 border-2 border-primary-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all duration-300"
                        >
                          <option value="">Select State</option>
                          {indianStates.map((state) => (
                            <option key={state} value={state}>{state}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-primary-700 mb-2">PIN Code *</label>
                        <input
                          type="text"
                          required
                          value={addressForm.zip_code}
                          onChange={(e) => setAddressForm({...addressForm, zip_code: e.target.value})}
                          className="w-full px-4 py-3 border-2 border-primary-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all duration-300"
                          placeholder="400001"
                          maxLength="6"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-primary-700 mb-2">Address Type</label>
                        <select
                          value={addressForm.address_type}
                          onChange={(e) => setAddressForm({...addressForm, address_type: e.target.value})}
                          className="w-full px-4 py-3 border-2 border-primary-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all duration-300"
                        >
                          <option value="shipping">Shipping</option>
                          <option value="billing">Billing</option>
                        </select>
                      </div>
                      
                      <div className="flex items-center space-x-3 pt-8">
                        <input
                          type="checkbox"
                          id="is_default"
                          checked={addressForm.is_default}
                          onChange={(e) => setAddressForm({...addressForm, is_default: e.target.checked})}
                          className="w-4 h-4 text-primary-600 border-2 border-primary-300 rounded focus:ring-primary-500"
                        />
                        <label htmlFor="is_default" className="text-sm font-medium text-primary-700">
                          Set as default address
                        </label>
                      </div>
                    </div>
                    
                    <div className="flex space-x-4 pt-4">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50"
                      >
                        {isLoading ? 'Saving...' : editingAddress ? 'Update Address' : 'Save Address'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingAddress(false);
                          setEditingAddress(null);
                          setAddressForm({
                            street_address: '',
                            apartment_address: '',
                            city: '',
                            state: '',
                            zip_code: '',
                            country: 'India',
                            address_type: 'shipping',
                            is_default: false
                          });
                        }}
                        className="bg-neutral-200 hover:bg-neutral-300 text-neutral-700 px-8 py-3 rounded-xl font-semibold transition-all duration-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {addressesLoading ? (
                  <div className="col-span-2 text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-neutral-600">Loading addresses...</p>
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="col-span-2 text-center py-12">
                    <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-10 h-10 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-primary-800 mb-2">No addresses yet</h3>
                    <p className="text-neutral-600 mb-4">Add your first address to get started with orders.</p>
                  </div>
                ) : (
                  addresses.map((address) => (
                    <div
                      key={address.id}
                      className={`bg-gradient-to-br rounded-2xl p-6 border-2 transition-all duration-300 ${
                        address.is_default
                          ? 'from-primary-50 to-accent-50 border-primary-300 shadow-lg'
                          : 'from-neutral-50 to-cream-50 border-neutral-200 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            address.address_type === 'shipping' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {address.address_type === 'shipping' ? '📦 Shipping' : '💳 Billing'}
                          </span>
                          {address.is_default && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                              ⭐ Default
                            </span>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditAddress(address)}
                            className="text-primary-600 hover:text-primary-700 p-2 hover:bg-primary-100 rounded-lg transition-all duration-200"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(address.id)}
                            className="text-red-600 hover:text-red-700 p-2 hover:bg-red-100 rounded-lg transition-all duration-200"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="font-semibold text-primary-800">{address.street_address}</p>
                        {address.apartment_address && (
                          <p className="text-neutral-700">{address.apartment_address}</p>
                        )}
                        <p className="text-neutral-700">
                          {address.city}, {address.state} {address.zip_code}
                        </p>
                        <p className="text-neutral-600 text-sm font-medium">{address.country}</p>
                      </div>
                      
                      {!address.is_default && (
                        <button
                          onClick={() => handleSetDefaultAddress(address.id)}
                          className="mt-4 text-primary-600 hover:text-primary-700 text-sm font-medium"
                        >
                          Set as default
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-primary-800 mb-2">Order History</h2>
                <p className="text-neutral-600">Track your orders and purchase history</p>
              </div>
              
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5zM10 12a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-primary-800 mb-4">No orders yet</h3>
                <p className="text-neutral-600 mb-6 max-w-md mx-auto">
                  When you place your first order, it will appear here with tracking information and order details.
                </p>
                <Link
                  to="/products"
                  className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Start Shopping
                </Link>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-primary-800 mb-2">Security Settings</h2>
                <p className="text-neutral-600">Keep your account secure</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gradient-to-br from-accent-50 to-cream-50 rounded-2xl p-6 border-2 border-accent-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-accent-600 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-accent-800">Password</h3>
                  </div>
                  <p className="text-accent-700 mb-4">Update your password to keep your account secure</p>
                  <button className="bg-accent-600 hover:bg-accent-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300">
                    Change Password
                  </button>
                </div>
                
                <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-2xl p-6 border-2 border-primary-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-primary-800">Two-Factor Authentication</h3>
                  </div>
                  <p className="text-primary-700 mb-4">Add an extra layer of security to your account</p>
                  <button className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300">
                    Enable 2FA
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboardPage;
