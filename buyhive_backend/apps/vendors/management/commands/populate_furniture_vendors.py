# apps/vendors/management/commands/populate_furniture_vendors.py
import random
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import IntegrityError
from apps.vendors.models import VendorProfile
from apps.products.models import Product, ProductVariant, Category

User = get_user_model()

class Command(BaseCommand):
    help = 'Populate database with furniture and home decor vendors and products'

    def add_arguments(self, parser):
        parser.add_argument('--vendors', type=int, default=15, help='Number of vendors to create')

    def handle(self, *args, **options):
        num_vendors = options['vendors']
        
        self.stdout.write('Creating furniture and home decor mock data...')
        
        # Furniture & Home Decor business names
        business_names = [
            "Cozy Home Furnishings", "Elegant Decor Studio", "Rustic Living Co",
            "Modern Spaces", "Vintage Charm", "Urban Interiors",
            "Luxury Lounge", "Classic Comfort", "Artisan Furniture",
            "Trendy Tableware", "Comfort Creations", "Nature's Touch",
            "Chic Spaces", "Eco Home Styles", "Fine Woodworks",
            "Minimalist Designs", "Decor Delights", "The Fabric Loft",
            "Urban Chic Home", "Handcrafted Living", "Dream Interiors",
            "Contemporary Corner", "Boho Style Studio", "Industrial Edge",
            "Scandinavian Simplicity"
        ]
        
        # Product categories specific to furniture and home decor
        furniture_products = [
            "Sofa", "Armchair", "Dining Table", "Coffee Table", "Bed Frame",
            "Bookshelf", "Cabinet", "Desk", "Wardrobe", "Nightstand",
            "TV Stand", "Recliner", "Ottoman", "Chest of Drawers", "Bench",
            "Dining Chair", "Bar Stool", "Side Table", "Dresser", "Headboard",
            "Entertainment Unit", "Storage Ottoman", "Accent Chair", "Loveseat",
            "Secretary Desk", "Vanity Table", "Room Divider", "Shoe Rack"
        ]
        
        home_decor_products = [
            "Curtains", "Cushions", "Wall Art", "Area Rug", "Table Lamp",
            "Floor Lamp", "Mirror", "Candles", "Picture Frame", "Wall Clock",
            "Planter", "Throw Blanket", "Decorative Bowl", "Sculpture", 
            "Table Runner", "Pendant Light", "Chandelier", "Wall Sconce",
            "Decorative Pillow", "Tapestry", "Artificial Plant", "Vase",
            "Ceramic Figurine", "String Lights", "Wall Shelf", "Macrame",
            "Decorative Tray", "Candle Holder"
        ]
        
        # Material options for variants
        materials = ["Wood", "Metal", "Fabric", "Leather", "Glass", "Ceramic", "Bamboo", "Rattan"]
        colors = ["Natural", "Black", "White", "Brown", "Gray", "Beige", "Navy", "Cream", "Charcoal", "Oak"]
        sizes = ["Small", "Medium", "Large", "Extra Large"]
        styles = ["Modern", "Rustic", "Industrial", "Scandinavian", "Boho", "Minimalist", "Classic", "Contemporary"]
        
        # Handle categories with try/except for IntegrityError
        try:
            furniture_category, created = Category.objects.get_or_create(
                name="Furniture",
                defaults={'description': 'High-quality furniture for every room in your home'}
            )
            if created:
                self.stdout.write('Created Furniture category')
            else:
                self.stdout.write('Using existing Furniture category')
        except IntegrityError:
            furniture_category = Category.objects.get(name="Furniture")
            self.stdout.write('Found existing Furniture category')
        
        try:
            decor_category, created = Category.objects.get_or_create(
                name="Home Decor",
                defaults={'description': 'Beautiful decorative items to enhance your living space'}
            )
            if created:
                self.stdout.write('Created Home Decor category')
            else:
                self.stdout.write('Using existing Home Decor category')
        except IntegrityError:
            decor_category = Category.objects.get(name="Home Decor")
            self.stdout.write('Found existing Home Decor category')
        
        # Create vendors
        created_vendors = []
        for i in range(num_vendors):
            # Create user for vendor
            email = f'furniture_vendor{i+1}@buyhive.com'
            user, user_created = User.objects.get_or_create(
                email=email,
                defaults={
                    'first_name': random.choice(['Emma', 'James', 'Sophia', 'William', 'Olivia', 'Michael', 'Ava', 'David']),
                    'last_name': random.choice(['Johnson', 'Smith', 'Brown', 'Davis', 'Miller', 'Wilson', 'Garcia', 'Anderson']),
                    'is_vendor': True,
                    'is_active': True
                }
            )
            
            if user_created:
                user.set_password('vendor123')
                user.save()
            
            # Create vendor profile
            business_name = business_names[i % len(business_names)]
            if i >= len(business_names):
                business_name += f" #{i - len(business_names) + 2}"
                
            descriptions = [
                f"Specializing in {random.choice(['handcrafted', 'premium', 'affordable', 'luxury', 'eco-friendly'])} furniture and home decor since {random.randint(2010, 2020)}. We focus on {random.choice(['modern', 'rustic', 'minimalist', 'bohemian', 'industrial'])} designs.",
                f"Your one-stop shop for beautiful {random.choice(['living room', 'bedroom', 'dining room', 'office'])} furniture and accessories. Quality craftsmanship meets contemporary style.",
                f"Transform your space with our curated collection of {random.choice(['sustainable', 'artisan-made', 'designer', 'vintage-inspired'])} furniture and decor pieces.",
                f"From cozy comfort to elegant sophistication, we offer {random.choice(['custom', 'ready-to-ship', 'handmade', 'imported'])} furniture solutions for every home."
            ]
                
            vendor, vendor_created = VendorProfile.objects.get_or_create(
                user=user,
                defaults={
                    'business_name': business_name,
                    'description': random.choice(descriptions),
                    'is_approved': True,
                    'tax_id': f'FUR{random.randint(100000, 999999)}'
                }
            )
            
            if vendor_created:
                created_vendors.append(vendor)
                self.stdout.write(f'Created vendor: {business_name}')
        
        # Create products for each vendor
        total_products_created = 0
        for vendor in created_vendors:
            # Determine if vendor focuses more on furniture or decor
            is_furniture_focused = random.choice([True, False])
            primary_products = furniture_products if is_furniture_focused else home_decor_products
            secondary_products = home_decor_products if is_furniture_focused else furniture_products
            primary_category = furniture_category if is_furniture_focused else decor_category
            
            # Number of products for this vendor
            num_products = random.randint(8, 15)
            
            for j in range(num_products):
                # 70% chance of primary category, 30% secondary
                if random.random() < 0.7:
                    product_name = random.choice(primary_products)
                    category = primary_category
                else:
                    product_name = random.choice(secondary_products)
                    category = decor_category
                
                # Create unique product title
                style_adj = random.choice(styles)
                material_adj = random.choice(materials)
                product_title = f"{style_adj} {material_adj} {product_name}"
                
                # Ensure uniqueness
                counter = 1
                original_title = product_title
                while Product.objects.filter(title=product_title, vendor=vendor).exists():
                    product_title = f"{original_title} #{counter}"
                    counter += 1
                
                # Price based on product type and quality
                if category == furniture_category:
                    if product_name in ["Sofa", "Dining Table", "Bed Frame", "Wardrobe", "Desk"]:
                        base_price = random.uniform(300, 1200)  # Larger furniture
                    else:
                        base_price = random.uniform(80, 500)    # Smaller furniture
                else:
                    if product_name in ["Chandelier", "Large Mirror", "Area Rug"]:
                        base_price = random.uniform(100, 400)   # Larger decor
                    else:
                        base_price = random.uniform(15, 120)    # Smaller decor
                
                # Stock levels
                stock = random.randint(3, 50)
                
                # Product descriptions
                descriptions = [
                    f"Beautifully crafted {product_name.lower()} featuring {material_adj.lower()} construction and {style_adj.lower()} design. Perfect for modern living spaces.",
                    f"Add elegance to your home with this stunning {style_adj.lower()} {product_name.lower()}. Made from premium {material_adj.lower()} materials.",
                    f"Transform your space with this {material_adj.lower()} {product_name.lower()}. Combines functionality with {style_adj.lower()} aesthetics.",
                    f"Premium quality {product_name.lower()} designed for comfort and style. Features {style_adj.lower()} design elements and durable {material_adj.lower()} finish."
                ]
                
                # Create product
                product = Product.objects.create(
                    title=product_title,
                    description=random.choice(descriptions),
                    base_price=Decimal(str(round(base_price, 2))),
                    category=category,
                    vendor=vendor,
                    stock=stock,
                    is_active=True
                )
                
                # Create product variants (30% chance for each product)
                if random.random() < 0.3:
                    num_variants = random.randint(1, 3)
                    for k in range(num_variants):
                        variant_name = f"{random.choice(colors)} {random.choice(sizes)}"
                        
                        # Ensure unique variant name
                        v_counter = 1
                        original_variant = variant_name
                        while ProductVariant.objects.filter(name=variant_name, product=product).exists():
                            variant_name = f"{original_variant} v{v_counter}"
                            v_counter += 1
                        
                        price_modifier = random.uniform(-50, 100)  # Variant can be cheaper or more expensive
                        variant_stock = random.randint(1, 20)
                        
                        ProductVariant.objects.create(
                            product=product,
                            name=variant_name,
                            price_modifier=Decimal(str(round(price_modifier, 2))),
                            stock=variant_stock,
                            is_active=True
                        )
                
                total_products_created += 1
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created {len(created_vendors)} furniture & decor vendors with {total_products_created} products'
            )
        )
