# 🛒 BuyHive - Multi-Vendor E-commerce Marketplace

A full-stack e-commerce platform built with Django REST Framework and React.js, enabling vendors to sell products and customers to shop seamlessly.

## 🚀 Features

### **Customer Features**
- User registration and authentication with JWT
- Product browsing with search and filters
- Shopping cart management
- Secure checkout process
- Order tracking and history
- Product reviews and ratings
- Wishlist functionality

### **Vendor Features**
- Vendor registration and approval system
- Product management (CRUD operations)
- Order management and status updates
- Analytics dashboard
- Inventory tracking

### **Admin Features**
- Vendor approval workflow
- Platform analytics
- Order management
- Content moderation

## 🛠️ Tech Stack

**Backend:**
- Django REST Framework
- SQLite
- JWT Authentication

**Frontend:**
- React.js
- Tailwind CSS
- Axios (API calls)
- React Router

## 🏗️ Project Structure

buyhive/
├── buyhive_backend/
│ ├── apps/
│ │ ├── accounts/ # User authentication & profiles
│ │ ├── products/ # Product management
│ │ ├── orders/ # Cart & order processing
│ │ ├── vendors/ # Vendor management
│ │ └── wishlist/ # Wishlist functionality
│ ├── buyhive/ # Django settings
│ ├── manage.py
│ └── requirements.txt
├── buyhive_frontend/
│ ├── src/
│ │ ├── components/ # Reusable React components
│ │ ├── pages/ # Page components
│ │ ├── services/ # API integration
│ │ ├── context/ # React context providers
│ │ └── styles/ # CSS and styling
│ ├── public/
│ ├── package.json
│ └── vite.config.js
├── README.md
└── .gitignore