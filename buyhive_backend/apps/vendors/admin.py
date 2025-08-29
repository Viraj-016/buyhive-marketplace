from django.contrib import admin
from django.utils.html import format_html  # [UPDATED] Added for better display
from django.utils.translation import gettext_lazy as _
from .models import VendorProfile

@admin.register(VendorProfile)
class VendorProfileAdmin(admin.ModelAdmin):
    # [UPDATED] Enhanced list display with status indicators
    list_display = (
        'business_name', 
        'user', 
        'status_display',  # Custom method for better status display
        'created_at'
    )
    
    # [UPDATED] Enhanced filters
    list_filter = ('is_approved', 'created_at', 'updated_at')
    
    # Allow searching by business name or user email
    search_fields = ('business_name', 'user__email', 'user__first_name', 'user__last_name')
    
    # [UPDATED] Enhanced fieldsets with rejection reason
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        (_("User Information"), {
            'fields': ('user',)
        }),
        (_("Business Details"), {
            'fields': ('business_name', 'description', 'business_logo')
        }),
        (_("Verification Documents"), {
            'fields': ('tax_id', 'business_license')
        }),
        (_("Admin Review"), {
            'fields': ('is_approved', 'rejection_reason')
        }),
        (_("Timestamps"), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    # [UPDATED] Enhanced actions with reject functionality
    actions = ['approve_vendors', 'reject_vendors']
    
    def status_display(self, obj):
        """Custom method to display approval status with colors"""
        if obj.is_approved:
            return format_html('<span style="color: green;">✓ Approved</span>')
        elif obj.rejection_reason:
            return format_html('<span style="color: red;">✗ Rejected</span>')
        else:
            return format_html('<span style="color: orange;">⏳ Pending</span>')
    status_display.short_description = _('Status')
    
    def approve_vendors(self, request, queryset):
        """Approve selected vendors and mark user as vendor"""
        count = 0
        for profile in queryset.filter(is_approved=False):
            profile.is_approved = True
            profile.rejection_reason = ''  # Clear any rejection reason
            profile.user.is_vendor = True
            profile.user.save(update_fields=['is_vendor'])
            profile.save(update_fields=['is_approved', 'rejection_reason'])
            count += 1
        
        self.message_user(request, f'{count} vendor(s) approved successfully.')
    approve_vendors.short_description = _("Approve selected vendors")
    
    def reject_vendors(self, request, queryset):  # [UPDATED] Added reject action
        """Reject selected vendors (admin can add reason manually)"""
        count = queryset.filter(is_approved=True).update(is_approved=False)
        self.message_user(request, f'{count} vendor(s) rejected. Add rejection reasons manually.')
    reject_vendors.short_description = _("Reject selected vendors")
    
    # [UPDATED] Enhanced list view
    list_per_page = 25
    date_hierarchy = 'created_at'
