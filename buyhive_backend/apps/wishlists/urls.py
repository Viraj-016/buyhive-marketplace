from django.urls import path
from .views import WishlistView, WishlistToggleProductView, WishlistClearView  # [UPDATED] Added WishlistClearView

urlpatterns = [
    # Get the user's wishlist
    path('', WishlistView.as_view(), name='user-wishlist'),
    
    # Add/remove a product from the wishlist
    path('toggle/<int:product_id>/', WishlistToggleProductView.as_view(), name='wishlist-toggle-product'),
    
    # Clear all products from wishlist  # [UPDATED] Added clear endpoint
    path('clear/', WishlistClearView.as_view(), name='wishlist-clear'),
]
