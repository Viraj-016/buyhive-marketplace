from rest_framework import serializers
from .models import Wishlist
from apps.products.serializers import ProductListSerializer  # [UPDATED] Use lighter serializer for better performance

class WishlistSerializer(serializers.ModelSerializer):
    products = ProductListSerializer(many=True, read_only=True)  # [UPDATED] Use lightweight product serializer
    product_count = serializers.IntegerField(read_only=True)  # [UPDATED] Added product count
    
    class Meta:
        model = Wishlist
        fields = ('id', 'user', 'products', 'product_count', 'created_at', 'updated_at')  # [UPDATED] Added product_count
        read_only_fields = ('user',)
