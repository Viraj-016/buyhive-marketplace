# apps/vendors/urls.py
from django.urls import path
from .views import (
    VendorApplyView, 
    VendorProfileManageView, 
    VendorStatusView,  # [UPDATED] Added new view
    PublicVendorListView,
    VendorAnalyticsView,
    VendorProductManagementView,
    VendorOrderManagementView,
    VendorOrderStatusUpdateView,
)

urlpatterns = [
    path('apply/', VendorApplyView.as_view(), name='vendor-apply'),
    path('status/', VendorStatusView.as_view(), name='vendor-status'),  # [UPDATED] Added status endpoint
    path('profile/', VendorProfileManageView.as_view(), name='vendor-profile-manage'),
    path('public/', PublicVendorListView.as_view(), name='public-vendor-list'),
    path('analytics/', VendorAnalyticsView.as_view(), name='vendor-analytics'),
    path('products/manage/', VendorProductManagementView.as_view(), name='vendor-products-manage'),
    path('orders/manage/', VendorOrderManagementView.as_view(), name='vendor-orders-manage'),
    path('orders/update-status/', VendorOrderStatusUpdateView.as_view(),name='vendor-orders-update-status'),
]
