import os
import django
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'trend_projesi.settings')
sys.path.append(r'c:\Users\KLAY\Desktop\TRENDSEPETİX')
django.setup()

from myapp.models import Product
from django.conf import settings

missing_count = 0
found_count = 0

print("Verifying products in database...")
for p in Product.objects.all():
    image_url = p.image_url
    if not image_url:
        print(f"ERROR: Product '{p.name}' has no image_url!")
        missing_count += 1
        continue
        
    # Strip leading slash and join with BASE_DIR
    relative_path = image_url.lstrip('/')
    physical_path = os.path.join(settings.BASE_DIR, relative_path)
    
    if os.path.exists(physical_path):
        found_count += 1
    else:
        print(f"ERROR: Product '{p.name}' points to '{image_url}' which DOES NOT exist at '{physical_path}'!")
        missing_count += 1

print(f"Verification complete: {found_count} products verified. {missing_count} products failed.")

