# apps/products/views.py
from rest_framework import viewsets, permissions, filters, serializers, status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils.text import slugify

from .models import Product, Category, ProductReview, ProductVariant, ProductImage
from .serializers import (
    ProductSerializer, ProductManageSerializer, ProductListSerializer,
    CategorySerializer, ProductReviewSerializer, ProductCreateSerializer
)
from apps.vendors.permissions import IsApprovedVendor

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """A viewset for viewing categories."""
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]

class ProductViewSet(viewsets.ModelViewSet):
    """A viewset for viewing and editing products."""
    queryset = Product.objects.filter(is_active=True).select_related('vendor', 'category')
    permission_classes = [permissions.AllowAny]
    
    # ✅ Add parsers for file uploads
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    # Filtering, searching, and ordering
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'vendor', 'featured']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'base_price', 'title']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return ProductListSerializer
        elif self.action == 'retrieve':
            return ProductSerializer
        elif self.action == 'create':
            return ProductCreateSerializer
        elif self.action == 'update' or self.action == 'partial_update':
            return ProductCreateSerializer
        return ProductManageSerializer

    def get_permissions(self):
        if self.action not in ['list', 'retrieve']:
            self.permission_classes = [permissions.IsAuthenticated, IsApprovedVendor]
        return super().get_permissions()

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.action in ['list', 'retrieve']:
            return queryset.filter(vendor__is_approved=True)
        else:
            if hasattr(self.request.user, 'vendor_profile'):
                return queryset.filter(vendor=self.request.user.vendor_profile)
        return queryset

    def create(self, request, *args, **kwargs):
        print("=== PRODUCT CREATE DEBUG ===")
        print("Request data keys:", list(request.data.keys()))
        print("Request files:", dict(request.FILES))
        
        # Check user and vendor
        print("User:", request.user)
        print("User is authenticated:", request.user.is_authenticated)
        print("User has vendor_profile:", hasattr(request.user, 'vendor_profile'))
        
        if hasattr(request.user, 'vendor_profile'):
            print("Vendor profile:", request.user.vendor_profile)
            print("Vendor is approved:", request.user.vendor_profile.is_approved)
        else:
            print("❌ ERROR: User has no vendor_profile!")
            return Response({
                'error': 'You must be an approved vendor to create products.'
            }, status=status.HTTP_403_FORBIDDEN)

        # Debug variant data specifically
        variant_keys = [key for key in request.data.keys() if 'variants' in key]
        print("Variant FormData keys:", variant_keys)
        
        for key in variant_keys:
            value = request.data[key]
            print(f"  {key}: '{value}' (type: {type(value).__name__})")

        # Process FormData properly
        data = {}
        
        # Basic fields
        data['title'] = request.data.get('title')
        data['description'] = request.data.get('description')
        data['base_price'] = request.data.get('base_price')
        data['category'] = request.data.get('category')
        data['is_active'] = request.data.get('is_active', 'true').lower() == 'true'
        data['featured'] = request.data.get('featured', 'false').lower() == 'true'

        # ✅ Handle variants with comprehensive debugging
        variants = []
        i = 0
        while f'variants[{i}][name]' in request.data:
            name_value = request.data.get(f'variants[{i}][name]', 'Default')
            stock_value = request.data.get(f'variants[{i}][stock]', '0')
            price_modifier_value = request.data.get(f'variants[{i}][price_modifier]', '0')
            
            print(f"Processing variant {i}:")
            print(f"  name: '{name_value}'")
            print(f"  stock: '{stock_value}' (type: {type(stock_value).__name__})")
            print(f"  price_modifier: '{price_modifier_value}'")

            # ✅ Convert stock to integer with error handling
            try:
                stock_int = int(stock_value) if stock_value else 0
                print(f"  stock converted to: {stock_int}")
            except (ValueError, TypeError) as e:
                print(f"  ERROR converting stock '{stock_value}': {e}")
                stock_int = 0

            variant = {
                'name': name_value,
                'stock': stock_int,
                'price_modifier': float(price_modifier_value) if price_modifier_value else 0
            }
            
            print(f"  Final variant data: {variant}")
            variants.append(variant)
            i += 1

        if variants:
            data['variants'] = variants
            print(f"Total variants to create: {len(variants)}")
        else:
            print("No variants found in FormData!")
            data['variants'] = [{'name': 'Default', 'stock': 0, 'price_modifier': 0}]

        # Handle images
        images = request.FILES.getlist('images')
        if images:
            data['images'] = images
            print(f"Images to process: {len(images)}")

        print("Final processed data for serializer:", data)

        try:
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)

            # ✅ Auto-generate slug and set vendor
            validated_data = serializer.validated_data
            print("Validated data from serializer:", validated_data)
            
            validated_data['slug'] = slugify(validated_data['title'])
            validated_data['vendor'] = request.user.vendor_profile

            product = serializer.save()

            # ✅ Verify created variants
            created_variants = product.variants.all()
            print("Created variants verification:")
            for variant in created_variants:
                print(f"  Variant: {variant.name}, Stock: {variant.stock}")

            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
            
        except Exception as e:
            print("❌ ERROR TYPE:", type(e).__name__)
            print("❌ ERROR MESSAGE:", str(e))
            if hasattr(e, 'detail'):
                print("❌ ERROR DETAILS:", e.detail)
            raise

    def perform_create(self, serializer):
        # Vendor is set in create method above
        pass
    

    def update(self, request, *args, **kwargs):
        print("=== PRODUCT UPDATE DEBUG ===")
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        print(f"Updating product: {instance.title}")
        print("Request data keys:", list(request.data.keys()))
        print("Request files:", dict(request.FILES))

        # Process FormData for update (same logic as create)
        data = {}
        old_title = instance.title
        
        # Basic fields
        data['title'] = request.data.get('title', instance.title)
        data['description'] = request.data.get('description', instance.description)
        data['base_price'] = request.data.get('base_price', instance.base_price)
        data['category'] = request.data.get('category', instance.category.id)
        data['is_active'] = request.data.get('is_active', 'true').lower() == 'true'
        data['featured'] = request.data.get('featured', 'false').lower() == 'true'

        # ✅ CRITICAL FIX: Handle slug only if title changed
        new_title = data['title']
        if new_title != old_title:
            base_slug = slugify(new_title)
            slug = base_slug
            counter = 1
            # Ensure uniqueness but exclude current product
            while Product.objects.filter(slug=slug).exclude(pk=instance.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            data['slug'] = slug
        else:
            data['slug'] = instance.slug

        # ✅ Handle variants (same logic as create)
        variants = []
        i = 0
        while f'variants[{i}][name]' in request.data:
            name_value = request.data.get(f'variants[{i}][name]', 'Default')
            stock_value = request.data.get(f'variants[{i}][stock]', '0')
            price_modifier_value = request.data.get(f'variants[{i}][price_modifier]', '0')
            
            try:
                stock_int = int(stock_value) if stock_value else 0
            except (ValueError, TypeError):
                stock_int = 0

            variant = {
                'name': name_value,
                'stock': stock_int,
                'price_modifier': float(price_modifier_value) if price_modifier_value else 0
            }
            variants.append(variant)
            i += 1

        if variants:
            data['variants'] = variants
        else:
            # Keep existing variants if none provided
            data['variants'] = [{'name': 'Default', 'stock': 0, 'price_modifier': 0}]

        # ✅ Handle images (optional for updates)
        images = request.FILES.getlist('images')
        if images:
            data['images'] = images
            print(f"New images to process: {len(images)}")
        # If no new images, don't include in data (keep existing images)

        print("Final processed update data:", {k: v for k, v in data.items() if k != 'images'})

        try:
            serializer = self.get_serializer(instance, data=data, partial=partial)
            serializer.is_valid(raise_exception=True)
            
            # ✅ CRITICAL: Set vendor same as create
            validated_data = serializer.validated_data
            validated_data['vendor'] = request.user.vendor_profile
            
            # Update the product
            product = serializer.save()
            
            # ✅ If new images provided, delete old ones and create new ones
            if images:
                # Delete existing images
                instance.images.all().delete()
                
                # Create new images
                for index, image_data in enumerate(images):
                    ProductImage.objects.create(
                        product=product,
                        image=image_data,
                        is_primary=(index == 0),
                        alt_text=f"Image for {product.title}"
                    )
            
            # ✅ Handle variants update
            if variants:
                # Delete existing variants
                instance.variants.all().delete()
                
                # Create new variants
                for variant_data in variants:
                    ProductVariant.objects.create(
                        product=product,
                        name=variant_data['name'],
                        stock=variant_data['stock'],
                        price_modifier=variant_data['price_modifier']
                    )

            return Response(serializer.data)
            
        except Exception as e:
            print("❌ UPDATE ERROR TYPE:", type(e).__name__)
            print("❌ UPDATE ERROR MESSAGE:", str(e))
            if hasattr(e, 'detail'):
                print("❌ UPDATE ERROR DETAILS:", e.detail)
            raise

def perform_update(self, serializer):
    # Vendor is set in update method above
    pass

class ProductReviewViewSet(viewsets.ModelViewSet):
    """A viewset for creating and viewing product reviews."""
    serializer_class = ProductReviewSerializer

    def get_permissions(self):
        if self.action == 'create':
            self.permission_classes = [permissions.IsAuthenticated]
        else:
            self.permission_classes = [permissions.AllowAny]
        return super().get_permissions()

    def get_queryset(self):
        product_id = self.kwargs.get('product_pk')
        return ProductReview.objects.filter(
            product_id=product_id,
            is_approved=True
        ).select_related('user', 'product')

    def perform_create(self, serializer):
        product_id = self.kwargs.get('product_pk')
        try:
            product = Product.objects.get(pk=product_id, is_active=True)
        except Product.DoesNotExist:
            raise serializers.ValidationError("Product not found.")
        serializer.save(user=self.request.user, product=product)
