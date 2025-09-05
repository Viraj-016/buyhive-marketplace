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
│ │ ├── components/ 
│ │ ├── context/  
│ │ ├── hooks/   
│ │ ├── pages/  
│ │ ├── services/   
│ │ ├── store/  
│ ├── public/
│ ├── package.json
│ └── vite.config.js
├── README.md
└── .gitignore


## 🚀 Getting Started

### Prerequisites
- Python 3.8+ installed
- Node.js 14+ installed  
- SQLite (comes with Python)

### Backend Setup

1. Navigate to backend directory:
cd buyhive_backend
2. Create virtual environment (recommended):
3. Install dependencies:
pip install -r requirements.txt
4. Run database migrations:
python manage.py makemigrations
python manage.py migrate
5. Create superuser (optional):
python manage.py createsuperuser
6. Start development server:
python manage.py runserver

### Frontend Setup

1. Navigate to frontend directory:
cd buyhive_frontend
2. Install dependencies:
npm install
3. Start development server:
npm run dev


### Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api
- **Admin Panel**: http://localhost:8000/admin

## 🔑 Environment Variables

Create a `.env` file in the backend directory:

SECRET_KEY=your-secret-key
DEBUG=True
DATABASE_URL=sqlite:///db.sqlite3

## ⭐ Acknowledgments

- Django REST Framework for powerful API development
- React.js community for excellent frontend tools
- Tailwind CSS for beautiful, responsive design
- All contributors and supporters of this project
---


**🛒 BuyHive** - Transforming multi-vendor e-commerce with modern technology stack!