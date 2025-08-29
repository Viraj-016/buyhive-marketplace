# apps/vendors/views.py
from rest_framework import generics, permissions, serializers, status  # [UPDATED] Added status
from rest_framework.response import Response
from django.utils.translation import gettext_lazy as _
from .models import VendorProfile
from .serializers import VendorApplicationSerializer, VendorProfileSerializer, PublicVendorSerializer  
from .permissions import IsApprovedVendor
from django.db.models import Count, Sum, Q
from django.utils import timezone
from datetime import timedelta
from apps.products.models import Product
from apps.orders.models import Order
class VendorApplyView(generics.CreateAPIView):
    queryset = VendorProfile.objects.all()
    serializer_class = VendorApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        # [UPDATED] Check if user already has a vendor profile
        if VendorProfile.objects.filter(user=self.request.user).exists():
            raise serializers.ValidationError({
                'detail': _('You have already applied to be a vendor.')
            })
        
        # [UPDATED] Ensure user is marked as vendor
        if not self.request.user.is_vendor:
            self.request.user.is_vendor = True
            self.request.user.save(update_fields=['is_vendor'])
            
        serializer.save(user=self.request.user)
    
    def create(self, request, *args, **kwargs):  # [UPDATED] Override create for better response
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        return Response({
            'message': _('Vendor application submitted successfully. You will be notified once reviewed.'),
            'status': 'pending'
        }, status=status.HTTP_201_CREATED)

class VendorProfileManageView(generics.RetrieveUpdateAPIView):
    serializer_class = VendorProfileSerializer
    permission_classes = [IsApprovedVendor]
    
    def get_object(self):
        return self.request.user.vendor_profile

class VendorStatusView(generics.RetrieveAPIView):  # [UPDATED] Added new view for checking application status
    """View for users to check their vendor application status"""
    serializer_class = VendorProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        try:
            return self.request.user.vendor_profile
        except VendorProfile.DoesNotExist:
            return None
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance is None:
            return Response({
                'status': 'not_applied',
                'message': _('You have not applied to be a vendor yet.')
            })
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

class PublicVendorListView(generics.ListAPIView):
    queryset = VendorProfile.objects.filter(is_approved=True)
    serializer_class = PublicVendorSerializer  # [UPDATED] Use separate public serializer
    permission_classes = [permissions.AllowAny]
    
    #[UPDATED] Added pagination and filtering
    ordering = ['-created_at']
    search_fields = ['business_name', 'description']
    filterset_fields = ['business_name']


# ADD THIS NEW VIEW to vendors/views.py
class VendorAnalyticsView(generics.RetrieveAPIView):
    """
    Get analytics data for vendor dashboard
    """
    permission_classes = [IsApprovedVendor]
    
    def get(self, request, *args, **kwargs):
        vendor = request.user.vendor_profile
        
        # Get date ranges
        today = timezone.now().date()
        last_30_days = today - timedelta(days=30)
        
        # Product statistics
        total_products = vendor.products.count()
        active_products = vendor.products.filter(is_active=True).count()
        featured_products = vendor.products.filter(featured=True).count()
        
        # Order statistics
        total_orders = vendor.vendor_orders.count()
        pending_orders = vendor.vendor_orders.filter(status='pending').count()
        processing_orders = vendor.vendor_orders.filter(status='processing').count()
        shipped_orders = vendor.vendor_orders.filter(status='shipped').count()
        delivered_orders = vendor.vendor_orders.filter(status='delivered').count()
        
        # Revenue calculations
        total_revenue = vendor.vendor_orders.filter(
            payment_status='completed'
        ).aggregate(total=Sum('total_amount'))['total'] or 0
        
        monthly_revenue = vendor.vendor_orders.filter(
            payment_status='completed',
            created_at__date__gte=last_30_days
        ).aggregate(total=Sum('total_amount'))['total'] or 0
        
        # Recent orders (last 30 days)
        recent_orders = vendor.vendor_orders.filter(
            created_at__date__gte=last_30_days
        ).count()
        
        # Low stock products (stock < 10)
        low_stock_products = []
        for product in vendor.products.filter(is_active=True):
            if product.variants.exists():
                low_stock_variants = product.variants.filter(stock__lt=10, is_active=True)
                if low_stock_variants.exists():
                    low_stock_products.append({
                        'product_title': product.title,
                        'product_id': product.id,
                        'variants': [
                            {
                                'name': variant.name,
                                'stock': variant.stock
                            } for variant in low_stock_variants
                        ]
                    })
        
        # Top selling products (by order items)
        from apps.orders.models import OrderItem
        top_products = OrderItem.objects.filter(
            order__vendor=vendor,
            order__created_at__date__gte=last_30_days
        ).values('product__title', 'product__id').annotate(
            total_sold=Sum('quantity')
        ).order_by('-total_sold')[:5]
        
        analytics_data = {
            'products': {
                'total': total_products,
                'active': active_products,
                'featured': featured_products,
                'low_stock_count': len(low_stock_products),
                'low_stock_items': low_stock_products[:10]  # Limit to 10 items
            },
            'orders': {
                'total': total_orders,
                'pending': pending_orders,
                'processing': processing_orders,
                'shipped': shipped_orders,
                'delivered': delivered_orders,
                'recent_30_days': recent_orders
            },
            'revenue': {
                'total': float(total_revenue),
                'monthly': float(monthly_revenue)
            },
            'top_products': list(top_products),
            'business_info': {
                'business_name': vendor.business_name,
                'member_since': vendor.created_at.date(),
                'status': 'approved'
            }
        }
        
        return Response(analytics_data)

# ADD THIS NEW VIEW to vendors/views.py
class VendorProductManagementView(generics.ListAPIView):
    """
    Enhanced product management for vendors
    """
    permission_classes = [IsApprovedVendor]
    
    def get_queryset(self):
        return self.request.user.vendor_profile.products.all().select_related('category').prefetch_related('variants', 'images')
    
    def get(self, request, *args, **kwargs):
        vendor = request.user.vendor_profile
        
        # Get filter parameters
        status_filter = request.query_params.get('status', 'all')  # all, active, inactive
        stock_filter = request.query_params.get('stock', 'all')    # all, low, out
        
        queryset = self.get_queryset()
        
        # Apply filters
        if status_filter == 'active':
            queryset = queryset.filter(is_active=True)
        elif status_filter == 'inactive':
            queryset = queryset.filter(is_active=False)
            
        products_data = []
        for product in queryset:
            # Calculate total stock across variants
            total_stock = 0
            if product.variants.exists():
                total_stock = sum(variant.stock for variant in product.variants.filter(is_active=True))
            
            # Apply stock filter
            if stock_filter == 'low' and total_stock >= 10:
                continue
            elif stock_filter == 'out' and total_stock > 0:
                continue
                
            product_data = {
                'id': product.id,
                'title': product.title,
                'base_price': float(product.base_price),
                'is_active': product.is_active,
                'featured': product.featured,
                'category': product.category.name,
                'total_stock': total_stock,
                'variants_count': product.variants.count(),
                'images_count': product.images.count(),
                'average_rating': product.average_rating,
                'review_count': product.review_count,
                'created_at': product.created_at,
                'updated_at': product.updated_at
            }
            products_data.append(product_data)
        
        return Response({
            'count': len(products_data),
            'products': products_data
        })

# ADD THIS NEW VIEW to vendors/views.py  
class VendorOrderManagementView(generics.ListAPIView):
    """
    Enhanced order management for vendors with filtering
    """
    permission_classes = [IsApprovedVendor]
    
    def get(self, request, *args, **kwargs):
        vendor = request.user.vendor_profile
        
        # Get filter parameters
        status_filter = request.query_params.get('status', 'all')
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        
        queryset = vendor.vendor_orders.all().select_related('customer').prefetch_related('items')
        
        # Apply status filter
        if status_filter != 'all':
            queryset = queryset.filter(status=status_filter)
        
        # Apply date filters
        if date_from:
            try:
                from datetime import datetime
                date_from_obj = datetime.strptime(date_from, '%Y-%m-%d').date()
                queryset = queryset.filter(created_at__date__gte=date_from_obj)
            except ValueError:
                pass
                
        if date_to:
            try:
                from datetime import datetime
                date_to_obj = datetime.strptime(date_to, '%Y-%m-%d').date()
                queryset = queryset.filter(created_at__date__lte=date_to_obj)
            except ValueError:
                pass
        
        orders_data = []
        for order in queryset.order_by('-created_at'):
            order_data = {
                'id': order.id,
                'order_id': str(order.order_id),
                'customer_email': order.customer.email,
                'total_amount': float(order.total_amount),
                'status': order.status,
                'payment_status': order.payment_status,
                'tracking_number': order.tracking_number,
                'estimated_delivery': order.estimated_delivery,
                'created_at': order.created_at,
                'updated_at': order.updated_at,
                'items_count': order.items.count(),
                'can_be_cancelled': order.can_be_cancelled,
                'is_completed': order.is_completed
            }
            orders_data.append(order_data)
        
        return Response({
            'count': len(orders_data),
            'orders': orders_data
        })

# ADD THIS NEW VIEW to vendors/views.py
class VendorOrderStatusUpdateView(generics.UpdateAPIView):
    """
    Bulk update order status for vendors
    """
    permission_classes = [IsApprovedVendor]
    
    def patch(self, request, *args, **kwargs):
        vendor = request.user.vendor_profile
        
        order_ids = request.data.get('order_ids', [])
        new_status = request.data.get('status')
        tracking_number = request.data.get('tracking_number', '')
        estimated_delivery = request.data.get('estimated_delivery')
        
        if not order_ids or not new_status:
            return Response({
                'error': 'order_ids and status are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate status
        valid_statuses = ['pending', 'processing', 'shipped', 'delivered']
        if new_status not in valid_statuses:
            return Response({
                'error': f'Invalid status. Must be one of: {valid_statuses}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Update orders
        orders = vendor.vendor_orders.filter(id__in=order_ids)
        updated_count = 0
        
        for order in orders:
            # Validate status transition
            if self._can_update_status(order.status, new_status):
                order.status = new_status
                if tracking_number:
                    order.tracking_number = tracking_number
                if estimated_delivery:
                    order.estimated_delivery = estimated_delivery
                order.save()
                updated_count += 1
        
        return Response({
            'message': f'Updated {updated_count} orders',
            'updated_count': updated_count
        })
    
    def _can_update_status(self, current_status, new_status):
        """Validate status transitions"""
        allowed_transitions = {
            'pending': ['processing', 'cancelled'],
            'processing': ['shipped', 'cancelled'],
            'shipped': ['delivered'],
            'delivered': [],  # Final status
            'cancelled': [],  # Final status
        }
        
        return new_status in allowed_transitions.get(current_status, [])
