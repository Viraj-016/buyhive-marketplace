# apps/orders/admin.py

from django.contrib import admin
from .models import Cart, CartItem, Order, OrderItem

# Inlines for easier management of related items
class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0 # No empty forms by default
    readonly_fields = ('product', 'variant', 'quantity')

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('product', 'variant', 'quantity', 'price_at_purchase')

# Register Cart and CartItem
@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'created_at', 'updated_at', 'get_total_price')
    search_fields = ('user__email',)
    inlines = [CartItemInline]
    readonly_fields = ('created_at', 'updated_at')

@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ('cart', 'product', 'variant', 'quantity', 'get_total')
    search_fields = ('cart__user__email', 'product__title')
    list_filter = ('cart',)

# Register Order and OrderItem
@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('order_id', 'customer', 'vendor', 'total_amount', 'status', 'payment_status', 'created_at')
    list_filter = ('status', 'payment_status', 'vendor', 'created_at')
    search_fields = ('order_id', 'customer__email', 'vendor__business_name')
    inlines = [OrderItemInline]
    readonly_fields = ('order_id', 'customer', 'vendor', 'total_amount', 'shipping_address_text', 
                       'payment_method', 'payment_status', 'transaction_id', 'created_at', 'updated_at')
    fieldsets = (
        ("Order Details", {
            'fields': ('order_id', 'customer', 'vendor', 'total_amount', 'status', 'created_at', 'updated_at')
        }),
        ("Payment Information", {
            'fields': ('payment_status', 'payment_method', 'transaction_id')
        }),
        ("Shipping Information", {
            'fields': ('shipping_address_text',)
        }),
    )

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ('order', 'product', 'variant', 'quantity', 'price_at_purchase', 'get_total')
    search_fields = ('order__order_id', 'product__title')
    list_filter = ('order',)
