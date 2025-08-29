from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _  # [UPDATED] Added translation support
from django.core.validators import MinValueValidator, MaxValueValidator  # [UPDATED] Added validators
from apps.vendors.models import VendorProfile
from django.utils.text import slugify
class Category(models.Model):
    name = models.CharField(max_length=255, unique=True)
    slug = models.SlugField(max_length=255, unique=True)
    parent = models.ForeignKey(
        'self', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='children'
    )
    description = models.TextField(blank=True)  # [UPDATED] Added description field
    is_active = models.BooleanField(default=True)  # [UPDATED] Added is_active field
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['name']
        indexes = [  # [UPDATED] Added indexes for better performance
            models.Index(fields=['parent', 'is_active']),
            models.Index(fields=['slug']),
        ]
    
    def __str__(self):
        return self.name
    
    def get_full_path(self):  # [UPDATED] Added method to get category path
        """Returns the full category path like 'Electronics > Phones'"""
        if self.parent:
            return f"{self.parent.get_full_path()} > {self.name}"
        return self.name

class Product(models.Model):
    vendor = models.ForeignKey(
        VendorProfile, 
        on_delete=models.CASCADE, 
        related_name='products',
        limit_choices_to={'is_approved': True}  # [UPDATED] Only approved vendors
    )
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='products')
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    description = models.TextField(blank=True)
    base_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(0.01)]  # [UPDATED] Added minimum price validation
    )
    is_active = models.BooleanField(default=True, help_text="Is this product publicly visible?")
    featured = models.BooleanField(default=False)  # [UPDATED] Added featured field
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [  # [UPDATED] Added indexes for better performance
            models.Index(fields=['vendor', 'is_active']),
            models.Index(fields=['category', 'is_active']),
            models.Index(fields=['featured', 'is_active']),
        ]
    def save(self, *args, **kwargs):
        # ✅ Auto-generate slug if not provided
        if not self.slug and self.title:
            base_slug = slugify(self.title)
            slug = base_slug
            counter = 1
            
            # Ensure uniqueness
            while Product.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            
            self.slug = slug
        
        super().save(*args, **kwargs)
    def __str__(self):
        return self.title
    
    @property  # [UPDATED] Added useful properties
    def average_rating(self):
        """Calculate average rating from reviews"""
        reviews = self.reviews.filter(is_approved=True)
        if reviews.exists():
            return round(reviews.aggregate(models.Avg('rating'))['rating__avg'], 1)
        return 0
    
    @property
    def review_count(self):
        """Get total number of approved reviews"""
        return self.reviews.filter(is_approved=True).count()
    
    @property
    def in_stock(self):
        """Check if product has any variants in stock"""
        return self.variants.filter(stock__gt=0, is_active=True).exists()

class ProductVariant(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    name = models.CharField(max_length=100, help_text="e.g., Large Red, Size M")  # [UPDATED] Better help text
    sku = models.CharField(max_length=100, unique=True, blank=True, null=True)
    price_modifier = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0, 
        help_text="Amount to add/subtract from base price."
    )
    stock = models.PositiveIntegerField(default=0, help_text="Available quantity")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)  # [UPDATED] Added timestamp
    
    class Meta:  # [UPDATED] Added Meta class
        ordering = ['name']
        indexes = [
            models.Index(fields=['product', 'is_active']),
            models.Index(fields=['sku']),
        ]
    
    def __str__(self):
        return f"{self.product.title} - {self.name}"
    
    @property  # [UPDATED] Added property to calculate final price
    def final_price(self):
        """Calculate the final price including modifier"""
        return self.product.base_price + self.price_modifier

class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='product_images/')
    alt_text = models.CharField(max_length=255, blank=True, help_text="For accessibility")
    is_primary = models.BooleanField(default=False)  # [UPDATED] Added primary image flag
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:  # [UPDATED] Added Meta class
        ordering = ['-is_primary', 'created_at']
    
    def __str__(self):
        return f"Image for {self.product.title}"
    
    def save(self, *args, **kwargs):  # [UPDATED] Ensure only one primary image per product
        if self.is_primary:
            ProductImage.objects.filter(
                product=self.product, 
                is_primary=True
            ).exclude(pk=self.pk).update(is_primary=False)
        super().save(*args, **kwargs)

class ProductReview(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reviews')
    rating = models.PositiveIntegerField(
        choices=[(i, str(i)) for i in range(1, 6)],
        validators=[MinValueValidator(1), MaxValueValidator(5)]  # [UPDATED] Added validators
    )
    comment = models.TextField()
    is_approved = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)  # [UPDATED] Added updated_at
    
    class Meta:
        unique_together = ('product', 'user')
        ordering = ['-created_at']
        indexes = [  # [UPDATED] Added indexes
            models.Index(fields=['product', 'is_approved']),
            models.Index(fields=['rating']),
        ]
    
    def __str__(self):
        return f"Review by {self.user.email} for {self.product.title}"
