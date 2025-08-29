# apps/vendors/serializers.py
from rest_framework import serializers
from django.utils.translation import gettext_lazy as _  # [UPDATED] Added translation
from .models import VendorProfile

class VendorApplicationSerializer(serializers.ModelSerializer):
    """
    Serializer for a user to apply to become a vendor.
    Includes verification fields.
    """
    class Meta:
        model = VendorProfile
        fields = ('business_name', 'description', 'business_logo', 'tax_id', 'business_license')  # [UPDATED] Added business_logo
        extra_kwargs = {
            'business_license': {'required': False},
            'business_logo': {'required': False},  # [UPDATED] Make logo optional
            'tax_id': {'required': False}  # [UPDATED] Make tax_id optional for initial application
        }
    
    def validate_business_name(self, value):  # [UPDATED] Added custom validation
        """Ensure business name is unique and properly formatted"""
        if len(value.strip()) < 2:
            raise serializers.ValidationError(_("Business name must be at least 2 characters long."))
        return value.strip()

class VendorProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for an approved vendor to view and update their profile.
    """
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.SerializerMethodField()  # [UPDATED] Added user name
    status = serializers.SerializerMethodField()  # [UPDATED] Added status field
    
    class Meta:
        model = VendorProfile
        fields = (
            'id', 'user_email', 'user_name', 'business_name', 'business_logo', 
            'description', 'tax_id', 'business_license', 'is_approved', 
            'status', 'rejection_reason', 'created_at', 'updated_at'  # [UPDATED] Added more fields
        )
        read_only_fields = (
            'is_approved', 'rejection_reason', 'created_at', 'updated_at'  # [UPDATED] Enhanced read-only fields
        )
    
    def get_user_name(self, obj):  # [UPDATED] Added method to get user name
        """Get the full name of the vendor user"""
        return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.email
    
    def get_status(self, obj):  # [UPDATED] Added status method
        """Get human-readable status"""
        if obj.is_approved:
            return 'approved'
        elif obj.rejection_reason:
            return 'rejected'
        else:
            return 'pending'

class PublicVendorSerializer(serializers.ModelSerializer):  # [UPDATED] Added separate public serializer
    """Serializer for public vendor listing - limited fields for security"""
    user_name = serializers.SerializerMethodField()
    
    class Meta:
        model = VendorProfile
        fields = ('id', 'business_name', 'business_logo', 'description', 'user_name', 'created_at')
        read_only_fields = ('id', 'business_name', 'business_logo', 'description', 'user_name', 'created_at')
    
    def get_user_name(self, obj):
        try:
            if obj.user.first_name and obj.user.last_name:
                return f"{obj.user.first_name} {obj.user.last_name}".strip()
            elif obj.user.first_name:
                return obj.user.first_name
            else:
                return "Vendor"
        except AttributeError:
            return "Vendor"
# ADD TO apps/vendors/serializers.py

class VendorAnalyticsSerializer(serializers.Serializer):
    """
    Serializer for vendor analytics data (if you want structured validation)
    """
    products = serializers.DictField()
    orders = serializers.DictField()
    revenue = serializers.DictField()
    top_products = serializers.ListField()
    business_info = serializers.DictField()
    
    class Meta:
        fields = ['products', 'orders', 'revenue', 'top_products', 'business_info']
