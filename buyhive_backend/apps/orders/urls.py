# apps/orders/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserCartView, CartItemViewSet, CheckoutView,
    CustomerOrderListView, CustomerOrderDetailView,
    VendorOrderListView, VendorOrderDetailView
)

# Router for CartItem operations
cart_router = DefaultRouter()
cart_router.register(r'items', CartItemViewSet, basename='cart-item')

urlpatterns = [
    # Cart management for customers
    path('cart/', UserCartView.as_view(), name='user-cart'),
    path('cart/', include(cart_router.urls)), # /api/orders/cart/items/

    # Checkout process
    path('checkout/', CheckoutView.as_view(), name='checkout'),

    # Customer order history
    path('customer-orders/', CustomerOrderListView.as_view(), name='customer-order-list'),
    path('customer-orders/<uuid:pk>/', CustomerOrderDetailView.as_view(), name='customer-order-detail'), # Use UUID for lookup

    # Vendor order management
    path('vendor-orders/', VendorOrderListView.as_view(), name='vendor-order-list'),
    path('vendor-orders/<uuid:pk>/', VendorOrderDetailView.as_view(), name='vendor-order-detail'), # Use UUID for lookup
]
