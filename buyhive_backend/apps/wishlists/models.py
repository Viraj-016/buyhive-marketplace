from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _  # [UPDATED] Added translation support
from apps.products.models import Product

class Wishlist(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='wishlist'
    )
    products = models.ManyToManyField(
        Product, 
        blank=True, 
        related_name='wishlisted_by',
        limit_choices_to={'is_active': True}  # [UPDATED] Only allow active products
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _("Wishlist")
        verbose_name_plural = _("Wishlists")
        ordering = ['-updated_at']  # [UPDATED] Added ordering
    
    def __str__(self):
        return f"Wishlist for {self.user.email}"
    
    @property  # [UPDATED] Added useful property
    def product_count(self):
        """Get total number of products in wishlist"""
        return self.products.count()
