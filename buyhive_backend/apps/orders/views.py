from rest_framework import generics, status, viewsets
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from django.utils.translation import gettext_lazy as _  # [UPDATED] Added translation
import uuid  # [UPDATED] Added uuid import
from .models import Cart, CartItem, Order, OrderItem
from .serializers import CartSerializer, CartItemSerializer, OrderSerializer
from apps.accounts.models import Address
from apps.vendors.models import VendorProfile
from apps.vendors.permissions import IsApprovedVendor

# --- Cart Views ---
class UserCartView(generics.RetrieveAPIView):
    """
    Retrieve the current user's cart. Creates one if it doesn't exist.
    """
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        cart, created = Cart.objects.get_or_create(user=self.request.user)
        return cart

class CartItemViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing items in the user's cart.
    """
    serializer_class = CartItemSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Ensure the user only sees/modifies items in their own cart
        user_cart, created = Cart.objects.get_or_create(user=self.request.user)  # [UPDATED] Create cart if not exists
        return user_cart.items.all()
    
    def perform_create(self, serializer):
        user_cart, created = Cart.objects.get_or_create(user=self.request.user)
        product = serializer.validated_data['product']
        variant = serializer.validated_data.get('variant')
        quantity = serializer.validated_data['quantity']
        
        # Check if item already exists in cart, then update quantity
        cart_item, created = CartItem.objects.get_or_create(
            cart=user_cart,
            product=product,
            variant=variant,
            defaults={'quantity': quantity}
        )
        if not created:
            cart_item.quantity += quantity
            cart_item.save()
        serializer.instance = cart_item
    
    def perform_update(self, serializer):
        # Ensure quantity does not exceed stock
        instance = self.get_object()
        item_to_check_stock = instance.variant if instance.variant else instance.product
        new_quantity = serializer.validated_data.get('quantity', instance.quantity)
        
        # [UPDATED] Better stock checking
        if hasattr(item_to_check_stock, 'stock') and new_quantity > item_to_check_stock.stock:
            # Return error response properly
            raise serializers.ValidationError({
                'quantity': f"Not enough stock. Available: {item_to_check_stock.stock}"
            })
        serializer.save()

# --- Order Views ---
class CheckoutView(generics.CreateAPIView):
    """
    Handles the checkout process. Splits the user's cart into multiple orders
    (one per vendor) and processes payment.
    """
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        user = request.user
        
        # [UPDATED] Better cart retrieval
        try:
            user_cart = user.cart
            if not user_cart.items.exists():
                return Response({'detail': _('Your cart is empty.')}, status=status.HTTP_400_BAD_REQUEST)
        except Cart.DoesNotExist:
            return Response({'detail': _('Your cart is empty.')}, status=status.HTTP_400_BAD_REQUEST)
        
        # Get shipping address from request
        shipping_address_id = request.data.get('shipping_address_id')
        if not shipping_address_id:
            return Response({'detail': _('Shipping address ID is required.')}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            shipping_address = Address.objects.get(id=shipping_address_id, user=user)
        except Address.DoesNotExist:
            return Response({
                'detail': _('Shipping address not found or does not belong to you.')
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # [UPDATED] Better address formatting
        shipping_address_text = (
            f"{shipping_address.street_address}"
            + (f", {shipping_address.apartment_address}" if shipping_address.apartment_address else "")
            + f", {shipping_address.city}, {shipping_address.state}, {shipping_address.zip_code}, {shipping_address.country}"
        )
        
        # [UPDATED] Added stock validation before processing
        for item in user_cart.items.all():
            stock_item = item.variant if item.variant else item.product
            if hasattr(stock_item, 'stock') and item.quantity > stock_item.stock:
                return Response({
                    'detail': f"Not enough stock for {item.product.title}. Available: {stock_item.stock}"
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Mock payment processing
        payment_successful = True
        transaction_id = "mock_txn_" + str(uuid.uuid4())
        payment_method = request.data.get('payment_method', 'Mock Payment Gateway')
        
        if not payment_successful:
            return Response({'detail': _('Payment failed. Please try again.')}, status=status.HTTP_400_BAD_REQUEST)
        
        created_orders = []
        
        # Group cart items by vendor
        vendor_cart_items = {}
        for item in user_cart.items.all():
            vendor_id = item.product.vendor.id
            if vendor_id not in vendor_cart_items:
                vendor_cart_items[vendor_id] = []
            vendor_cart_items[vendor_id].append(item)
        
        with transaction.atomic():
            for vendor_id, items in vendor_cart_items.items():
                vendor_profile = VendorProfile.objects.get(id=vendor_id)
                
                # Calculate total for this vendor's portion of the order
                vendor_order_total = sum(item.get_total for item in items)
                
                # Create the Order
                order = Order.objects.create(
                    customer=user,
                    vendor=vendor_profile,
                    total_amount=vendor_order_total,
                    status='processing',
                    payment_method=payment_method,
                    payment_status='completed',
                    transaction_id=transaction_id,
                    shipping_address_text=shipping_address_text
                )
                
                # Create OrderItems and decrease stock
                for cart_item in items:
                    price_at_purchase = cart_item.product.base_price + (
                        cart_item.variant.price_modifier if cart_item.variant else 0
                    )
                    OrderItem.objects.create(
                        order=order,
                        product=cart_item.product,
                        variant=cart_item.variant,
                        quantity=cart_item.quantity,
                        price_at_purchase=price_at_purchase
                    )
                    
                    # Decrease stock
                    item_to_update_stock = cart_item.variant if cart_item.variant else cart_item.product
                    if hasattr(item_to_update_stock, 'stock'):  # [UPDATED] Added safety check
                        item_to_update_stock.stock -= cart_item.quantity
                        item_to_update_stock.save(update_fields=['stock'])
                
                created_orders.append(order)
            
            # Clear the user's cart after successful order creation
            user_cart.items.all().delete()
        
        # Serialize the created orders and return them
        serializer = self.get_serializer(created_orders, many=True)
        return Response({
            'message': _('Orders created successfully'),
            'orders': serializer.data
        }, status=status.HTTP_201_CREATED)

class CustomerOrderListView(generics.ListAPIView):
    """
    List all orders for the authenticated customer.
    """
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Order.objects.filter(customer=self.request.user).select_related('vendor')  # [UPDATED] Added select_related

class CustomerOrderDetailView(generics.RetrieveAPIView):
    """
    Retrieve a single order detail for the authenticated customer.
    """
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'order_id'        # Tell Django to use order_id field
    lookup_url_kwarg = 'pk'
    
    def get_queryset(self):
        return Order.objects.filter(customer=self.request.user).select_related('vendor').prefetch_related('items')  # [UPDATED] Added optimizations

class VendorOrderListView(generics.ListAPIView):
    """
    List all orders for the authenticated and approved vendor.
    """
    serializer_class = OrderSerializer
    permission_classes = [IsApprovedVendor]
    
    def get_queryset(self):
        return Order.objects.filter(vendor=self.request.user.vendor_profile).select_related('customer')  # [UPDATED] Added select_related

class VendorOrderDetailView(generics.RetrieveUpdateAPIView):
    """
    Retrieve and update a single order status for the authenticated and approved vendor.
    """
    serializer_class = OrderSerializer
    permission_classes = [IsApprovedVendor]
    
    def get_queryset(self):
        return Order.objects.filter(vendor=self.request.user.vendor_profile).prefetch_related('items')  # [UPDATED] Added prefetch_related
    
    def perform_update(self, serializer):
        # Only allow vendor to update specific fields  # [UPDATED] Allow more fields
        allowed_fields = ['status', 'tracking_number', 'estimated_delivery']
        update_data = {}
        for field in allowed_fields:
            if field in self.request.data:
                update_data[field] = serializer.validated_data.get(field)
        
        if update_data:
            serializer.save(**update_data)
        else:
            return Response({
                'detail': _('Only status, tracking number, and estimated delivery can be updated.')
            }, status=status.HTTP_400_BAD_REQUEST)
