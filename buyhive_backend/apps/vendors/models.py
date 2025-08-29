# apps/vendors/models.py
from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _  # [UPDATED] Added translation support
from django.core.exceptions import ValidationError  # [UPDATED] Added for validation

class VendorProfile(models.Model):
    # --- Core Link to User ---
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='vendor_profile',
        limit_choices_to={'is_vendor': True}  # [UPDATED] Only allow vendor users
    )
    
    # --- Business Information (Provided by Vendor) ---
    business_name = models.CharField(max_length=255, unique=True)
    description = models.TextField(help_text=_("A brief description of your business."))
    business_logo = models.ImageField(upload_to='vendor_logos/', null=True, blank=True)
    
    # --- Verification Details ---
    tax_id = models.CharField(
        max_length=100, 
        blank=True, 
        help_text=_("Your business Tax ID or registration number.")
    )
    business_license = models.FileField(
        upload_to='vendor_licenses/', 
        blank=True, 
        help_text=_("Upload a copy of your business license.")
    )
    
    # --- Platform Status (Managed by Admin) ---
    is_approved = models.BooleanField(
        default=False, 
        help_text=_("Admin-approved to sell on the platform.")
    )
    
    # [UPDATED] Added rejection functionality
    rejection_reason = models.TextField(
        blank=True,
        help_text=_("Reason for rejection (filled by admin)")
    )
    
    # --- Timestamps ---
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _("Vendor Profile")
        verbose_name_plural = _("Vendor Profiles")
        ordering = ['-created_at']  # [UPDATED] Added ordering
        indexes = [  # [UPDATED] Added indexes for better performance
            models.Index(fields=['is_approved', 'created_at']),
            models.Index(fields=['business_name']),
        ]
    
    def __str__(self):
        return self.business_name
    
    def clean(self):  # [UPDATED] Added model validation
        super().clean()
        if not self.user.is_vendor:
            raise ValidationError(_('User must be marked as vendor to create vendor profile.'))
    
    def save(self, *args, **kwargs):  # [UPDATED] Enhanced save method
        # Ensure the linked user has is_vendor=True
        if not self.user.is_vendor:
            self.user.is_vendor = True
            self.user.save(update_fields=['is_vendor'])
        
        # Clear rejection reason when approved
        if self.is_approved and self.rejection_reason:
            self.rejection_reason = ''
            
        super().save(*args, **kwargs)
    
    @property  # [UPDATED] Added useful property
    def is_pending(self):
        """Returns True if vendor application is pending approval"""
        return not self.is_approved and not self.rejection_reason
    
    @property
    def is_rejected(self):
        """Returns True if vendor application was rejected"""
        return not self.is_approved and bool(self.rejection_reason)
