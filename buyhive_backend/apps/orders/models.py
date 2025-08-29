from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _  # [UPDATED] Added translation support
from django.core.validators import MinValueValidator  # [UPDATED] Added validators
from apps.products.models import Product, ProductVariant
from apps.vendors.models import VendorProfile
import uuid

# --- Cart Model ---
class Cart(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name='cart'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:  # [UPDATED] Added Meta class
        verbose_name = _('cart')
        verbose_name_plural = _('carts')
        ordering = ['-updated_at']
    
    def __str__(self):
        return f"Cart for {self.user.email if self.user else 'Guest'}"
    
    @property
    def get_total_price(self):
        return sum(item.get_total for item in self.items.all())
    
    @property  # [UPDATED] Added useful property
    def get_total_items(self):
        """Get total number of items in cart"""
        return sum(item.quantity for item in self.items.all())

# --- CartItem Model ---
class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE, null=True, blank=True)
    quantity = models.PositiveIntegerField(
        default=1,
        validators=[MinValueValidator(1)]  # [UPDATED] Added minimum quantity validation
    )
    created_at = models.DateTimeField(auto_now_add=True)  # [UPDATED] Added timestamp
    updated_at = models.DateTimeField(auto_now=True)  # [UPDATED] Added timestamp
    
    class Meta:
        unique_together = ('cart', 'product', 'variant')
        ordering = ['-created_at']  # [UPDATED] Added ordering
        indexes = [  # [UPDATED] Added indexes for performance
            models.Index(fields=['cart', 'product']),
        ]
    
    def __str__(self):
        variant_info = f" ({self.variant.name})" if self.variant else ""
        return f"{self.quantity} x {self.product.title}{variant_info}"
    
    @property
    def get_total(self):
        base_price = self.product.base_price
        variant_modifier = self.variant.price_modifier if self.variant else 0
        return (base_price + variant_modifier) * self.quantity

# --- Order Model ---
class Order(models.Model):
    ORDER_STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
        ('refunded', 'Refunded'),
    )
    PAYMENT_STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    )
    
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='orders')
    vendor = models.ForeignKey(VendorProfile, on_delete=models.PROTECT, related_name='vendor_orders')
    
    order_id = models.UUIDField(
        default=uuid.uuid4, 
        editable=False, 
        unique=True, 
        help_text=_("Unique order identifier")
    )
    
    total_amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(0.01)]  # [UPDATED] Added minimum amount validation
    )
    status = models.CharField(max_length=20, choices=ORDER_STATUS_CHOICES, default='pending')
    
    # Snapshot of shipping address at time of order
    shipping_address_text = models.TextField()
    
    payment_method = models.CharField(max_length=50)
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    transaction_id = models.CharField(
        max_length=255, 
        blank=True, 
        null=True, 
        help_text=_("ID from payment gateway")
    )
    
    # [UPDATED] Added delivery tracking
    tracking_number = models.CharField(max_length=100, blank=True)
    estimated_delivery = models.DateField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [  # [UPDATED] Added indexes for better performance
            models.Index(fields=['customer', 'status']),
            models.Index(fields=['vendor', 'status']),
            models.Index(fields=['order_id']),
        ]
        verbose_name = _('order')
        verbose_name_plural = _('orders')
    
    def __str__(self):
        return f"Order {str(self.order_id)[:8]} by {self.customer.email}"
    
    @property  # [UPDATED] Added useful properties
    def can_be_cancelled(self):
        """Check if order can still be cancelled"""
        return self.status in ['pending', 'processing']
    
    @property
    def is_completed(self):
        """Check if order is completed"""
        return self.status == 'delivered'

# --- OrderItem Model ---
class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    variant = models.ForeignKey(ProductVariant, on_delete=models.PROTECT, null=True, blank=True)
    quantity = models.PositiveIntegerField(validators=[MinValueValidator(1)])  # [UPDATED] Added validation
    price_at_purchase = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(0.01)]  # [UPDATED] Added validation
    )
    
    class Meta:  # [UPDATED] Added Meta class
        indexes = [
            models.Index(fields=['order', 'product']),
        ]
    
    def __str__(self):
        variant_info = f" ({self.variant.name})" if self.variant else ""
        return f"{self.quantity} x {self.product.title}{variant_info}"
    
    @property
    def get_total(self):
        return self.quantity * self.price_at_purchase
