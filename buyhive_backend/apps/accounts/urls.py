# apps/accounts/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserRegisterView, UserProfileView, AddressViewSet

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r'addresses', AddressViewSet, basename='address')

# The API URLs are now determined automatically by the router.
urlpatterns = [
    path('register/', UserRegisterView.as_view(), name='user-register'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('', include(router.urls)), # Include the router URLs
]
