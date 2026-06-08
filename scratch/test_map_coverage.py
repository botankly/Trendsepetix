import os
import django
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'trend_projesi.settings')
sys.path.append(r'c:\Users\KLAY\Desktop\TRENDSEPETİX')
django.setup()

from myapp.models import Product
from myapp.views import index
from django.conf import settings

# A mock request to test the views mapping logic
from django.test import RequestFactory
request = RequestFactory().get('/')

# Let's inspect unique product names in the database
unique_names = sorted(list(set(p.name.split(' #')[0].split(' (')[0].strip() for p in Product.objects.all())))
print(f"Total unique products found in DB: {len(unique_names)}")

# We will temporarily mock or directly import find_best_image by evaluating the view or parsing the map
# To make it simple, let's read the map and find_best_image logic from views.py
# Let's write a function to mimic find_best_image exactly as it is in views.py
from myapp.views import index

# Let's run a simple django check first
print("Running django system check...")
from django.core.management import call_command
call_command('check')
print("Django check completed successfully.")

# Now, let's test if we can render the view index without errors!
print("Testing view index rendering...")
try:
    response = index(request)
    if response.status_code == 200:
        print("View index rendered successfully (Status 200)!")
    else:
        print(f"View index returned status code: {response.status_code}")
except Exception as e:
    print(f"View index rendering failed with error: {e}")
    import traceback
    traceback.print_exc()

