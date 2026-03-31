import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'trend_projesi.settings')
django.setup()
from myapp.models import Sale, Product

def clean_duplicates():
    print("--- Sepetlerdeki mükerrer ürünler temizleniyor...")
    count = 0
    for sale in Sale.objects.all():
        products = sale.products.all()
        seen_names = set()
        to_keep = []
        for p in products:
            # Base name extraction (remove " #number" suffix)
            base_name = p.name.split(" #")[0]
            if base_name not in seen_names:
                seen_names.add(base_name)
                to_keep.append(p)
            else:
                count += 1
        
        # Update the sale products with unique types
        if len(to_keep) < len(products):
            sale.products.set(to_keep)
    
    print(f"DONE: Temizlik Tamamlandı! Toplam {count} mükerrer ürün sepetlerden çıkarıldı.")

if __name__ == "__main__":
    clean_duplicates()
