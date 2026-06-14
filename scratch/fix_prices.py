import os
import django
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'trend_projesi.settings')
django.setup()

from myapp.models import Product
from django.db import transaction

PRICE_MAP = {
    # Teknoloji / Elektronik
    'laptop': 35000.00,
    'akıllı saat': 6000.00,
    'saat': 5000.00,
    'kulaklık': 4500.00,
    'gaming mouse': 1800.00,
    'mouse': 1500.00,
    'tablet': 18000.00,
    'bilgisayar çantası': 1500.00,
    'mekanik klavye': 3000.00,
    'usb bellek 64gb': 350.00,
    'hızlı şarj kablosu': 290.00,
    'powerbank 20000mah': 1200.00,
    'powerbank': 950.00,
    'airpods': 6500.00,
    'drone': 25000.00,
    'robot süpürge': 16000.00,
    'telefon': 45000.00,
    'hoparlör': 3500.00,

    # Giyim & Aksesuar
    'yün kazak': 1200.00,
    'kışlık mont': 4999.00,
    'spor ayakkabı': 3999.00,
    'pamuklu eşofman': 1500.00,
    'deri kemer': 799.00,
    'beyaz tişört': 450.00,
    'jean pantolon': 1499.00,
    'bez çanta': 199.00,
    'şık gömlek': 1200.00,
    'slim fit gömlek': 1200.00,
    'yün atkı': 499.00,
    'kışlık atkı': 499.00,
    'chino pantolon': 1499.00,
    'deri bot': 2999.00,
    'çorap': 120.00,
    'terlik': 350.00,

    # Gıda / Market
    'pilavlık pirinç': 75.00,
    'kırmızı mercimek': 60.00,
    'dana kıyma': 650.00,
    'dana kuşbaşı': 720.00,
    'süzme çiçek balı': 350.00,
    'spagetti makarna': 25.00,
    'domates': 45.00,
    'salkım domates': 49.00,
    'bebek bezi (dev paket)': 550.00,
    'diş macunu (beyazlatıcı)': 95.00,
    'diş macunu': 95.00,
    'yumuşak diş fırçası': 75.00,
    'oyuncak ayıcık': 450.00,
    'oyuncak araba': 250.00,
    'muz (ithal)': 110.00,
    'muz': 90.00,
    'kırmızı elma': 40.00,
    'sulu armut': 45.00,
    'taze maydanoz': 15.00,
    'nane': 15.00,
    'tam yağlı yoğurt': 120.00,
    'siyah zeytin': 180.00,
    'tam buğday ekmek': 25.00,
    'beyaz peynir 500 gr': 140.00,
    'tam yağlı kaşar peyniri 400 gr': 180.00,
    'tam yağlı kaşar peyniri': 180.00,
    'tam yağlı süt 1lt': 39.00,
    'tam yağlı süt': 39.00,
    'yarım yağlı süt 1 lt': 35.00,
    'toz şeker 1 kg': 45.00,
    'toz şeker': 45.00,
    'ayçiçek yağı 2 lt': 145.00,
    'yumurta': 75.00,
    'yumurta 15\'li': 75.00,
    'yumurta 15 li': 75.00,
    'su': 10.00,
    'pilavlık bulgur': 35.00,
    'kahve': 120.00,
    'nohut': 65.00,
    'tavuk göğsü': 160.00,

    # Temizlik
    'bulaşık deterjanı': 75.00,
    'bulaşık süngeri': 25.00,
    'bulaşık teli': 20.00,
    'bulaşık makinesi tableti 30 lu': 320.00,
    'çamaşır suyu': 65.00,
    'kağıt havlu 6 lı rulo': 120.00,
    'sıvı deterjan 2 lt': 180.00,
    'sıvı sabun': 60.00,
    'tuvalet kağıdı 12 li rulo': 160.00,
    'yüzey temizleyici': 90.00,

    # Manav / Meyve & Sebze
    'biber': 55.00,
    'çilek': 95.00,
    'erik': 70.00,
    'fasulye': 75.00,
    'kabak': 35.00,
    'karpuz': 150.00,
    'kavun': 90.00,
    'kayısı': 85.00,
    'patates': 25.00,
    'patlıcan': 45.00,
    'portakal': 35.00,
    'salatalık': 35.00,
    'salkım domates 1 kg': 49.00,
    'şeftali': 65.00,
    'soğan': 20.00,
    'üzüm': 75.00,
    'çengeköy salatalık 1kg': 45.00,
    'çengeköy salatalık': 45.00,

    # Atıştırmalık & İçecek
    'bisküvi': 20.00,
    'çikolata': 35.00,
    'cips': 35.00,
    'gazoz': 18.00,
    'jelibon': 25.00,
    'kek': 12.00,
    'kola': 40.00,
    'kraker': 10.00,
    'lolipop': 10.00,
    'sakız': 7.00,
    'şalgam': 25.00,

    # Baharat
    'karabiber': 45.00,
    'karanfil': 45.00,
    'kekik': 45.00,
    'kimyon': 45.00,
    'pul biber': 45.00,
    'sumak': 45.00,
    'tarçın': 45.00,

    # Hobi & Oyuncak
    'boya kalemi': 120.00,
    'boyama kitabı': 50.00,
    'lego seti': 950.00,
    'puzzle': 290.00,

    # Kozmetik & Kişisel
    'deodorant': 180.00,
    'parfüm': 2500.00,
    'saç boyası': 220.00,
}

print("Updating product prices in database transaction...")
count = 0
with transaction.atomic():
    for p in Product.objects.all():
        name_clean = p.name.split(" #")[0].split(" (")[0].strip().lower()
        
        # Try to find base price
        base_price = PRICE_MAP.get(name_clean)
        if not base_price:
            # Check sub-strings
            for k, v in PRICE_MAP.items():
                if k in name_clean or name_clean in k:
                    base_price = v
                    break
                    
        if not base_price:
            base_price = 150.00  # Default fallback
            
        # Apply a realistic 5% random store variation
        new_price = round(base_price * random.uniform(0.95, 1.05), 2)
        p.price = new_price
        p.save()
        count += 1

print(f"Successfully updated {count} product prices in transaction!")
