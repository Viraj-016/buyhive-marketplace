from rest_framework import serializers
from django.utils.translation import gettext_lazy as _  # [UPDATED] Added translation
from .models import Cart, CartItem, Order, OrderItem
from apps.products.models import Product, ProductVariant
from apps.products.serializers import ProductListSerializer, ProductVariantSerializer  # [UPDATED] Use lighter serializer
from apps.accounts.models import Address

class CartItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)  # [UPDATED] Use lighter serializer for performance
    variant = ProductVariantSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.filter(is_active=True),  # [UPDATED] Only active products
        write_only=True, 
        source='product'
    )
    variant_id = serializers.PrimaryKeyRelatedField(
        queryset=ProductVariant.objects.filter(is_active=True),  # [UPDATED] Only active variants
        write_only=True, 
        source='variant', 
        allow_null=True, 
        required=False
    )
    total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True, source='get_total')
    
    class Meta:
        model = CartItem
        fields = ('id', 'product', 'product_id', 'variant', 'variant_id', 'quantity', 'total', 'created_at')  # [UPDATED] Added created_at
        read_only_fields = ('cart',)
    
    def validate_quantity(self, value):  # [UPDATED] Added quantity validation
        if value <= 0:
            raise serializers.ValidationError(_("Quantity must be greater than 0."))
        if value > 99:  # Reasonable limit
            raise serializers.ValidationError(_("Quantity cannot exceed 99."))
        return value
    
    def validate(self, data):
        product = data.get('product')
        variant = data.get('variant')
        
        if variant and variant.product != product:
            raise serializers.ValidationError(_("Variant does not belong to the selected product."))
        
        # Check stock
        stock_item = variant if variant else product
        quantity = data.get('quantity')
        
        if hasattr(stock_item, 'stock') and stock_item.stock < quantity:
            raise serializers.ValidationError(
                f"Not enough stock for {stock_item.name if variant else product.title}. Available: {stock_item.stock}"
            )
        
        return data

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True, source='get_total_price')
    total_items = serializers.IntegerField(read_only=True, source='get_total_items') 
    
    class Meta:
        model = Cart
        fields = ('id', 'items', 'total_price', 'total_items', 'created_at', 'updated_at')
        read_only_fields = ('user',)

class OrderItemSerializer(serializers.ModelSerializer):
    product_title = serializers.CharField(source='product.title', read_only=True)
    variant_name = serializers.CharField(source='variant.name', read_only=True, allow_null=True)
    total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True, source='get_total')  # [UPDATED] Added total field
    
    class Meta:
        model = OrderItem
        fields = ('product_title', 'variant_name', 'quantity', 'price_at_purchase', 'total')

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    customer_email = serializers.EmailField(source='customer.email', read_only=True)
    vendor_business_name = serializers.CharField(source='vendor.business_name', read_only=True)
    can_be_cancelled = serializers.BooleanField(read_only=True)  # [UPDATED] Added useful fields
    is_completed = serializers.BooleanField(read_only=True)
    
    shipping_address_id = serializers.PrimaryKeyRelatedField(
        queryset=Address.objects.all(), 
        write_only=True, 
        required=True
    )
    
    class Meta:
        model = Order
        fields = (
            'id', 'order_id', 'customer_email', 'vendor_business_name', 'total_amount',
            'status', 'payment_status', 'payment_method', 'transaction_id',
            'shipping_address_text', 'tracking_number', 'estimated_delivery',  # [UPDATED] Added tracking fields
            'items', 'can_be_cancelled', 'is_completed', 'created_at', 'updated_at', 
            'shipping_address_id'
        )
        read_only_fields = (
            'order_id', 'customer_email', 'vendor_business_name', 'total_amount',
            'payment_status', 'transaction_id', 'shipping_address_text',
            'created_at', 'updated_at', 'items', 'can_be_cancelled', 'is_completed'
        )
    
    def validate_shipping_address_id(self, value):
        if value.user != self.context['request'].user:
            raise serializers.ValidationError(_("Selected address does not belong to you."))
        return value
    
    def create(self, validated_data):
        raise NotImplementedError(_("Use the checkout view for order creation."))
