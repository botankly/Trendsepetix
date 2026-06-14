import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'trend_projesi.settings')
django.setup()

from myapp.models import Product

print("=== Unique Products in Database ===")
unique_products = {}
for p in Product.objects.all():
    base_name = p.name.split(" #")[0].split(" (")[0].strip()
    if base_name not in unique_products:
        unique_products[base_name] = {
            'db_image_url': p.image_url,
            'category': p.category,
            'example_full_name': p.name
        }

for name, info in sorted(unique_products.items()):
    db_img = info['db_image_url']
    # Check if the db image path starts with /static/
    local_path = None
    exists = False
    if db_img:
        local_path = os.path.join(os.getcwd(), db_img.lstrip('/'))
        exists = os.path.exists(local_path)
    
    print(f"Name: {name} | DB Image: {db_img} | Exists on disk: {exists}")
