# apps/products/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, CategoryViewSet, ProductReviewViewSet

router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')
router.register(r'categories', CategoryViewSet, basename='category')

# Custom URL pattern for product reviews
urlpatterns = [
    path('', include(router.urls)),
    # Manual nested route for reviews: /api/products/{id}/reviews/
    path('products/<int:product_pk>/reviews/', 
         ProductReviewViewSet.as_view({'get': 'list', 'post': 'create'}), 
         name='product-reviews-list'),
    path('products/<int:product_pk>/reviews/<int:pk>/', 
         ProductReviewViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}), 
         name='product-reviews-detail'),
]
