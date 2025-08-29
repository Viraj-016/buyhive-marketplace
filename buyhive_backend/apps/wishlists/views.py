from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils.translation import gettext_lazy as _  # [UPDATED] Added translation support
from .models import Wishlist
from .serializers import WishlistSerializer
from apps.products.models import Product

class WishlistView(generics.RetrieveAPIView):
    """
    Retrieve the current user's wishlist.
    A wishlist is created for the user on their first request if it doesn't exist.
    """
    serializer_class = WishlistSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        # [UPDATED] Added prefetch_related for better performance
        wishlist, created = Wishlist.objects.prefetch_related('products').get_or_create(user=self.request.user)
        return wishlist

class WishlistToggleProductView(APIView):
    """
    Add a product to the user's wishlist or remove it if it's already there.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        product_id = self.kwargs.get('product_id')
        if not product_id:
            return Response({
                'detail': _('Product ID is required.')
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # [UPDATED] Only allow active products to be added to wishlist
            product = Product.objects.get(id=product_id, is_active=True)
        except Product.DoesNotExist:
            return Response({
                'detail': _('Product not found or is not available.')
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Get the user's wishlist, creating it if it doesn't exist
        wishlist, created = Wishlist.objects.get_or_create(user=request.user)
        
        # Check if the product is already in the wishlist
        if wishlist.products.filter(id=product.id).exists():
            wishlist.products.remove(product)
            is_added = False
            message = _('Product removed from wishlist.')
        else:
            wishlist.products.add(product)
            is_added = True
            message = _('Product added to wishlist.')
        
        # [UPDATED] Better response with more useful data
        return Response({
            'detail': message,
            'is_added': is_added,
            'product_id': product.id,
            'wishlist_count': wishlist.product_count
        }, status=status.HTTP_200_OK)

class WishlistClearView(APIView):  # [UPDATED] Added new view to clear wishlist
    """
    Clear all products from the user's wishlist.
    """
    permission_classes = [IsAuthenticated]
    
    def delete(self, request, *args, **kwargs):
        try:
            wishlist = request.user.wishlist
            wishlist.products.clear()
            return Response({
                'detail': _('Wishlist cleared successfully.')
            }, status=status.HTTP_200_OK)
        except Wishlist.DoesNotExist:
            return Response({
                'detail': _('Wishlist not found.')
            }, status=status.HTTP_404_NOT_FOUND)
