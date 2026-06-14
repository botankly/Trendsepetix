import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'trend_projesi.settings')
django.setup()

from myapp.models import Product

print("=== Unique Products & Current Prices ===")
unique_products = {}
for p in Product.objects.all():
    base_name = p.name.split(" #")[0].split(" (")[0].strip()
    if base_name not in unique_products:
        unique_products[base_name] = p.price

for name, price in sorted(unique_products.items()):
    print(f"Name: {name} | Price: {price} TL")
