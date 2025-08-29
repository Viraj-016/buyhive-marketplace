# apps/products/serializers.py
from rest_framework import serializers
from django.utils.text import slugify
from .models import Category, Product, ProductVariant, ProductImage, ProductReview

class CategorySerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ('id', 'name', 'slug', 'parent', 'description', 'children')

    def get_children(self, obj):
        if obj.children.filter(is_active=True).exists():
            return CategorySerializer(obj.children.filter(is_active=True), many=True).data
        return []

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ('id', 'image', 'alt_text', 'is_primary')

class ProductVariantSerializer(serializers.ModelSerializer):
    final_price = serializers.ReadOnlyField()

    class Meta:
        model = ProductVariant
        fields = ('id', 'name', 'sku', 'price_modifier', 'final_price', 'stock', 'is_active')

class ProductReviewSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = ProductReview
        fields = ('id', 'user', 'rating', 'comment', 'created_at')

    def validate_rating(self, value):
        if value not in range(1, 6):
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value

class ProductSerializer(serializers.ModelSerializer):
    vendor_name = serializers.CharField(source='vendor.business_name', read_only=True)
    vendor_id = serializers.IntegerField(source='vendor.id', read_only=True)
    category = CategorySerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    reviews = ProductReviewSerializer(many=True, read_only=True)
    average_rating = serializers.ReadOnlyField()
    review_count = serializers.ReadOnlyField()
    in_stock = serializers.ReadOnlyField()

    class Meta:
        model = Product
        fields = (
            'id', 'title', 'slug', 'description', 'base_price', 'is_active',
            'featured', 'vendor_name', 'vendor_id', 'category', 'images',
            'variants', 'reviews', 'average_rating', 'review_count',
            'in_stock', 'created_at', 'updated_at'
        )

class ProductManageSerializer(serializers.ModelSerializer):
    slug = serializers.SlugField(read_only=True)

    class Meta:
        model = Product
        fields = ('title', 'slug', 'description', 'base_price', 'category', 'is_active', 'featured')
        read_only_fields = ('vendor', 'slug')

    def create(self, validated_data):
        validated_data['slug'] = slugify(validated_data['title'])
        return super().create(validated_data)

    def validate_base_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than 0.")
        return value

class ProductListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for product listings"""
    vendor_name = serializers.CharField(source='vendor.business_name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    primary_image = serializers.SerializerMethodField()
    average_rating = serializers.ReadOnlyField()
    review_count = serializers.ReadOnlyField()
    in_stock = serializers.ReadOnlyField()  # ✅ ADD THIS LINE
    variants = ProductVariantSerializer(many=True, read_only=True)
    class Meta:
        model = Product
        fields = (
            'id', 'title', 'slug', 'base_price', 'vendor_name',
            'category_name', 'primary_image', 'average_rating',
            'review_count', 'featured','in_stock', 'variants'
        )

    def get_primary_image(self, obj):
        primary = obj.images.filter(is_primary=True).first()
        if primary:
            return self.context['request'].build_absolute_uri(primary.image.url)
        first_image = obj.images.first()
        if first_image:
            return self.context['request'].build_absolute_uri(first_image.image.url)
        return None

# ✅ Product creation serializers
class ProductVariantCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = ('name', 'stock', 'price_modifier')

    def validate_stock(self, value):
        if value < 0:
            raise serializers.ValidationError("Stock cannot be negative.")
        return value
class ProductCreateSerializer(serializers.ModelSerializer):
    variants = ProductVariantCreateSerializer(many=True, required=False)
    images = serializers.ListField(
        child=serializers.ImageField(),
        required=False,
        allow_empty=True
    )

    class Meta:
        model = Product
        fields = ('title', 'description', 'base_price', 'category',
                 'is_active', 'featured', 'variants', 'images')
        read_only_fields = ('vendor', 'slug')

    def create(self, validated_data):
        # ✅ CRITICAL FIX: Handle nested data properly
        variants_data = validated_data.pop('variants', [])
        images_data = validated_data.pop('images', [])
        
        print("=== SERIALIZER CREATE DEBUG ===")
        print("Product data:", validated_data)
        print("Variants data received:", variants_data)
        print("Images count:", len(images_data))

        # Create product first
        product = Product.objects.create(**validated_data)
        print(f"Created product: {product.title}")

        # ✅ Create variants
        if variants_data:
            for i, variant_data in enumerate(variants_data):
                print(f"Creating variant {i+1}: {variant_data}")
                variant = ProductVariant.objects.create(
                    product=product,
                    name=variant_data.get('name', 'Default'),
                    stock=int(variant_data.get('stock', 0)),
                    price_modifier=variant_data.get('price_modifier', 0)
                )
                print(f"CREATED variant: {variant.name} with stock {variant.stock}")
        else:
            print("No variants data provided, creating default variant")
            variant = ProductVariant.objects.create(
                product=product,
                name='Default',
                stock=0,
                price_modifier=0
            )
            print(f"Created default variant with stock: {variant.stock}")

        # ✅ Create images
        for index, image_data in enumerate(images_data):
            print(f"Creating image {index + 1}: {image_data.name}")
            ProductImage.objects.create(
                product=product,
                image=image_data,
                is_primary=(index == 0),
                alt_text=f"Image for {product.title}"
            )

        return product

    def update(self, instance, validated_data):
        # ✅ Handle update for nested fields
        variants_data = validated_data.pop('variants', [])
        images_data = validated_data.pop('images', [])
        
        # Update basic product fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # ✅ Update variants (replace existing)
        if variants_data:
            # Delete existing variants
            instance.variants.all().delete()
            
            # Create new variants
            for variant_data in variants_data:
                ProductVariant.objects.create(
                    product=instance,
                    name=variant_data.get('name', 'Default'),
                    stock=int(variant_data.get('stock', 0)),
                    price_modifier=variant_data.get('price_modifier', 0)
                )

        # ✅ Update images (replace existing if new images provided)
        if images_data:
            # Delete existing images
            instance.images.all().delete()
            
            # Create new images
            for index, image_data in enumerate(images_data):
                ProductImage.objects.create(
                    product=instance,
                    image=image_data,
                    is_primary=(index == 0),
                    alt_text=f"Image for {instance.title}"
                )

        return instance

    def validate_base_price(self, value):
        if float(value) <= 0:
            raise serializers.ValidationError("Price must be greater than 0.")
        return value

    def validate(self, data):
        if 'variants' in data and data['variants']:
            for variant in data['variants']:
                if variant.get('stock', 0) < 0:
                    raise serializers.ValidationError("Stock cannot be negative.")
        return data
