# apps/vendors/permissions.py
from rest_framework.permissions import BasePermission
from django.utils.translation import gettext_lazy as _  # [UPDATED] Added translation

class IsApprovedVendor(BasePermission):
    """
    Permission class to check if user is an approved vendor.
    """
    message = _("You are not an approved vendor.")
    
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.is_vendor and
            hasattr(request.user, 'vendor_profile') and
            request.user.vendor_profile.is_approved
        )

class IsVendorOwner(BasePermission):  # [UPDATED] Added new permission for vendor profile access
    """
    Permission class to check if user owns the vendor profile.
    """
    message = _("You can only access your own vendor profile.")
    
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.is_vendor and
            hasattr(request.user, 'vendor_profile')
        )
