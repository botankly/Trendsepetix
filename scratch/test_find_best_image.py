import os
import sys
import django
import re

# Set up Django environment
sys.path.append("C:\\Users\\KLAY\\Desktop\\TRENDSEPETİX")
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "trend_projesi.settings")
django.setup()

from myapp.models import Product
from django.conf import settings

PRODUCT_IMAGE_MAP = {
    # Giyim & Aksesuar
    'akıllı saat': '/static/images/saat.png.png',
    'saat': '/static/images/saat.png.png',
    'yün kazak': '/static/images/yün kazak 1 adet.png.png',
    'yün atkı': '/static/images/yün atkı.png.png',
    'kışlık atkı': '/static/images/yün atkı.png.png',
    'jean pantolon': '/static/images/jean pantolon.png.png',
    'pamuklu eşofman': '/static/images/pamuklu eşofman.png.png',
    'pamuklu sweatshirt': '/static/images/pamuklu sweatshort.png.png',
    'pamuklu sweatshort': '/static/images/pamuklu sweatshort.png.png',
    'şık gömlek': '/static/images/slım fit gömlek.png.png',
    'slim fit gömlek': '/static/images/slım fit gömlek.png.png',
    'terlik': '/static/images/terlik.png.jpg',
    'deri bot': '/static/images/deri bot.png.png',
    'çorap': '/static/images/corap.png.webp',
    'chino pantolon': '/static/images/chino pantolon.png.png',

    # Teknoloji
    'laptop': '/static/images/laptop.png.png',
    'kulaklık': '/static/images/kulaklık.png.png',
    'gaming mouse': '/static/images/mouse(fare).png.png',
    'mouse': '/static/images/mouse(fare).png.png',
    'tablet': '/static/images/tablet.png.png',
    'powerbank 20000mah': '/static/images/powerbank.png.png',
    'powerbank': '/static/images/powerbank.png.png',
    'airpods': '/static/images/airpods.png.png',
    'drone': '/static/images/drone.png.jpg',
    'hoparlör': '/static/images/hoparlor.png.webp',
    'robot süpürge': '/static/images/robotsupurge.png.jpg',
    'telefon': '/static/images/telefon.png.png',

    # Market / Gıda
    'pilavlık pirinç': '/static/images/pilavlık pirinç 1 kg.png.png',
    'kırmızı mercimek': '/static/images/kırmızı mercimek 1 kg.png.png',
    'dana kıyma': '/static/images/dana kıyma 1 kg.png.png',
    'spagetti makarna': '/static/images/spagetti makarna.png.png',
    'domates': '/static/images/domates 1 kg.png.png',
    'salkım domates': '/static/images/salkım domates 1 kg.png.png',
    'çengeköy salatalık': '/static/images/çengeköy salatalık 1kg.png.png',
    'salatalık': '/static/images/salatalık.png.png',
    'tavuk göğsü': '/static/images/tavuk göğsü 1 kg.png.png',
    'tam yağlı kaşar peyniri': '/static/images/tam yağlı kaşar peyniri 400 gr.png.png',
    'kaşar peyniri': '/static/images/tam yağlı kaşar peyniri 400 gr.png.png',
    'beyaz peynir': '/static/images/beyaz peynir 500 gr.png.png',
    'tam yağlı süt': '/static/images/tam yağlı süt 1lt.png.png',
    'yarım yağlı süt': '/static/images/yarım yağlı süt 1 lt.png.png',
    'toz şeker': '/static/images/toz şeker 1 kg.png.png',
    'ayçiçek yağı': '/static/images/ayçiçek yağı 2 lt.png.png',
    'yumurta': '/static/images/ymurta 15 li.png.png',
    'yumurta 15\'li': '/static/images/ymurta 15 li.png.png',
    'yumurta 15 li': '/static/images/ymurta 15 li.png.png',
    'su': '/static/images/su.png.png',
    'dana kuşbaşı': '/static/images/dana kuşbaşı 1kg.pmg.png',
    'pilavlık bulgur': '/static/images/pilavlık bulgur 1 kg.png.png',
    'kahve': '/static/images/kahve.png.png',
    'nohut': '/static/images/nohut.png.jpg',

    # Manav / Meyve & Sebze
    'biber': '/static/images/bıber.png.png',
    'çilek': '/static/images/cılek.png.png',
    'erik': '/static/images/erık.png.png',
    'fasulye': '/static/images/fasulye.png.png',
    'kabak': '/static/images/kabak.png.png',
    'karpuz': '/static/images/karpuz.png.png',
    'kavun': '/static/images/kavun.png.png',
    'kayısı': '/static/images/kayısı.png.png',
    'nane': '/static/images/nane.png.webp',
    'patates': '/static/images/patates.png.jpg',
    'patlıcan': '/static/images/patlıcan.png.png',
    'portakal': '/static/images/portakal.png.png',
    'şeftali': '/static/images/seftalı.png.png',
    'soğan': '/static/images/sogan.png.webp',
    'üzüm': '/static/images/uzum.png.png',

    # Temizlik
    'bulaşık deterjanı': '/static/images/bulasıkdeterjanı.png.png',
    'bulaşık süngeri': '/static/images/bulasıksungerı.png.webp',
    'bulaşık teli': '/static/images/bulasıkteli.png.jpg',
    'bulaşık makinesi tableti 30 lu': '/static/images/bulaşık makinesi tableti 30 lu.png.png',
    'çamaşır suyu': '/static/images/camasırsuyu.png.webp',
    'kağıt havlu 6 lı rulo': '/static/images/kağıt havlu 6 lı rulo.png.png',
    'sıvı deterjan 2 lt': '/static/images/sıvı deterjan 2 lt.png.png',
    'sıvı sabun': '/static/images/sıvısabun.png.webp',
    'tuvalet kağıdı 12 li rulo': '/static/images/tuvalet kağıdı 12 li rulo.png.png',
    'yüzey temizleyici': '/static/images/yüzey temizleyici.png.png',

    # Atıştırmalık & İçecek
    'bisküvi': '/static/images/bıskuvı.png.jpg',
    'çikolata': '/static/images/cıkolata.png.jpg',
    'cips': '/static/images/cıps.png.webp',
    'gazoz': '/static/images/gazoz.png.webp',
    'jelibon': '/static/images/jelıbon.png.jpg',
    'kek': '/static/images/kek.png.jpg',
    'kola': '/static/images/kola.png.png',
    'kraker': '/static/images/kraker.png.avif',
    'lolipop': '/static/images/lolıop.png.jpg',
    'sakız': '/static/images/sakız.png.png',
    'şalgam': '/static/images/salgam.png.png',

    # Baharat
    'karabiber': '/static/images/karabıber.png.jpg',
    'karanfil': '/static/images/karanfıl.png.webp',
    'kekik': '/static/images/kekık.png.jfif',
    'kimyon': '/static/images/kımyon.png.jpg',
    'pul biber': '/static/images/pulbıber.png.jpeg',
    'sumak': '/static/images/sumak.png.jpg',
    'tarçın': '/static/images/tarcın.png.jpg',

    # Hobi & Oyuncak / Kozmetik
    'boya kalemi': '/static/images/boyamakalemı.png.jpeg',
    'boyama kitabı': '/static/images/boyamakıtabı.png.webp',
    'lego seti': '/static/images/logosetı.png.jpg',
    'puzzle': '/static/images/puzzle.png.webp',
    'deodorant': '/static/images/deodorant.png.png',
    'parfüm': '/static/images/parfum.png.png',
    'saç boyası': '/static/images/saçboyası.png.jpg',
}

image_cache = {}
def find_best_image(product_name, database_image_url=None):
    if product_name in image_cache:
        return image_cache[product_name]
        
    name_clean = product_name.split(" #")[0].split(" (")[0].strip().lower()
    
    # 1. First check if it's in our exact manually curated local product-image map
    if name_clean in PRODUCT_IMAGE_MAP:
        res = PRODUCT_IMAGE_MAP[name_clean]
    else:
        # Check for partial match in PRODUCT_IMAGE_MAP (only for whole-word boundary matching or specific mapping keys to avoid incorrect sub-matching like 'su')
        res = None
        for map_key, path in PRODUCT_IMAGE_MAP.items():
            if map_key == name_clean:
                res = path
                break
        
        if not res:
            # 2. Check if the database image url exists physically on disk
            if database_image_url:
                local_path = os.path.join(settings.BASE_DIR, database_image_url.lstrip('/'))
                if os.path.exists(local_path):
                    res = database_image_url
            
        if not res:
            # 3. Fallback to the database URL if it is a valid web URL or another fallback, otherwise a placeholder
            if database_image_url and (database_image_url.startswith('http') or database_image_url.startswith('/static/')):
                # Filter out known broken local static URLs
                if database_image_url == '/static/images/terlik.png':
                    res = '/static/images/terlik.png.jpg'
                else:
                    res = database_image_url
            else:
                res = "https://via.placeholder.com/150"
                
    image_cache[product_name] = res
    return res

products = Product.objects.all()
unique_products = {}
for p in products:
    base_name = p.name.split(" #")[0].split(" (")[0].strip()
    if base_name not in unique_products:
        unique_products[base_name] = p.image_url

print("DB PRODUCTS MAPPING TEST:")
for base_name, db_url in sorted(unique_products.items()):
    final_img = find_best_image(base_name, db_url)
    print(f"  '{base_name}' (DB URL: '{db_url}') -> '{final_img}'")
