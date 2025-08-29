from django.contrib import admin
from django.utils.html import format_html  # [UPDATED] Added for better display
from .models import Category, Product, ProductVariant, ProductImage, ProductReview

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'parent', 'is_active', 'created_at')  # [UPDATED] Added is_active
    list_filter = ('is_active', 'parent')  # [UPDATED] Added filter
    search_fields = ('name', 'description')  # [UPDATED] Added description search
    prepopulated_fields = {'slug': ('name',)}
    ordering = ['name']  # [UPDATED] Added ordering

class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1
    fields = ('name', 'sku', 'price_modifier', 'stock', 'is_active')  # [UPDATED] Added fields

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ('image', 'alt_text', 'is_primary')  # [UPDATED] Added is_primary
    readonly_fields = ('image_preview',)  # [UPDATED] Added image preview
    
    def image_preview(self, obj):  # [UPDATED] Added method to preview images
        if obj.image:
            return format_html('<img src="{}" style="max-height: 50px;"/>', obj.image.url)
        return "No image"
    image_preview.short_description = "Preview"

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        'title', 'vendor', 'category', 'base_price', 
        'average_rating', 'review_count', 'is_active', 'featured'  # [UPDATED] Added more fields
    )
    list_filter = ('category', 'vendor', 'is_active', 'featured', 'created_at')  # [UPDATED] Added featured
    search_fields = ('title', 'description', 'vendor__business_name')
    prepopulated_fields = {'slug': ('title',)}
    inlines = [ProductVariantInline, ProductImageInline]
    
    # [UPDATED] Added actions
    actions = ['make_featured', 'remove_featured', 'activate_products', 'deactivate_products']
    
    def make_featured(self, request, queryset):
        queryset.update(featured=True)
    make_featured.short_description = "Mark selected products as featured"
    
    def remove_featured(self, request, queryset):
        queryset.update(featured=False)
    remove_featured.short_description = "Remove featured status"
    
    def activate_products(self, request, queryset):
        queryset.update(is_active=True)
    activate_products.short_description = "Activate selected products"
    
    def deactivate_products(self, request, queryset):
        queryset.update(is_active=False)
    deactivate_products.short_description = "Deactivate selected products"

@admin.register(ProductReview)
class ProductReviewAdmin(admin.ModelAdmin):
    list_display = ('product', 'user', 'rating', 'is_approved', 'created_at')
    list_filter = ('is_approved', 'rating', 'created_at')  # [UPDATED] Added created_at filter
    search_fields = ('product__title', 'user__email', 'comment')
    
    # [UPDATED] Added actions
    actions = ['approve_reviews', 'disapprove_reviews']
    
    def approve_reviews(self, request, queryset):
        queryset.update(is_approved=True)
    approve_reviews.short_description = "Approve selected reviews"
    
    def disapprove_reviews(self, request, queryset):
        queryset.update(is_approved=False)
    disapprove_reviews.short_description = "Disapprove selected reviews"
