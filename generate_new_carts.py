import os
import django
import random

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "trend_projesi.settings")
django.setup()

from myapp.models import Product, Sale
from django.conf import settings

image_dir = os.path.join(settings.BASE_DIR, 'static', 'images')
gercek_dosyalar = []
if os.path.exists(image_dir):
    gercek_dosyalar = os.listdir(image_dir)

yazim_duzeltmeleri = {
    "cilek": "Çilek", "cılek": "Çilek",
    "cikolata": "Çikolata", "cıkolata": "Çikolata",
    "biber": "Biber", "bıber": "Biber",
    "biskuvi": "Bisküvi", "bıskuvı": "Bisküvi",
    "camasirsuyu": "Çamaşır Suyu", "camasırsuyu": "Çamaşır Suyu",
    "corap": "Çorap",
    "cips": "Cips", "cıps": "Cips",
    "erik": "Erik", "erık": "Erik",
    "jelibon": "Jelibon", "jelıbon": "Jelibon",
    "karabiber": "Karabiber", "karabıber": "Karabiber",
    "karanfil": "Karanfil", "karanfıl": "Karanfil",
    "kekik": "Kekik", "kekık": "Kekik",
    "kimyon": "Kimyon", "kımyon": "Kimyon",
    "lolipop": "Lolipop", "lolıop": "Lolipop",
    "pulbiber": "Pul Biber", "pulbıber": "Pul Biber",
    "robotsupurge": "Robot Süpürge",
    "salgam": "Şalgam",
    "sacboyasi": "Saç Boyası", "saçboyası": "Saç Boyası",
    "seftali": "Şeftali", "seftalı": "Şeftali",
    "slim fit gomlek": "Slim Fit Gömlek", "slım fit gömlek": "Slim Fit Gömlek",
    "sogan": "Soğan",
    "sivisabun": "Sıvı Sabun", "sıvısabun": "Sıvı Sabun",
    "uzum": "Üzüm",
    "ymurta 15 li": "Yumurta 15'li", "yumurta 15 li": "Yumurta 15'li",
    "logoseti": "Lego Seti", "logosetı": "Lego Seti",
    "boyamakalemi": "Boya Kalemi", "boyamakalemı": "Boya Kalemi",
    "boyamakitabi": "Boyama Kitabı", "boyamakıtabı": "Boyama Kitabı",
    "bulasikdeterjani": "Bulaşık Deterjanı", "bulasıkdeterjanı": "Bulaşık Deterjanı",
    "bulasiksungeri": "Bulaşık Süngeri", "bulasıksungerı": "Bulaşık Süngeri",
    "bulasikteli": "Bulaşık Teli", "bulasıkteli": "Bulaşık Teli",
    "mouse(fare)": "Mouse",
    "pamuklu sweatshort": "Pamuklu Sweatshirt",
    "parfum": "Parfüm",
    "tarcin": "Tarçın", "tarcın": "Tarçın",
    "hoparlor": "Hoparlör",
    "aycicek yagi 2 lt": "Ayçiçek Yağı 2 Lt",
    "kaşar peyniri 400 gr": "Kaşar Peyniri 400 gr"
}

kategoriler = {
    "Teknoloji": ["airpods", "laptop", "mouse", "kulaklık", "tablet", "powerbank", "saat", "telefon", "hoparlör", "drone", "robot süpürge"],
    "Giyim & Aksesuar": ["chino pantolon", "çorap", "deri bot", "jean pantolon", "pamuklu eşofman", "pamuklu sweatshirt", "slim fit gömlek", "terlik", "yün atkı", "yün kazak 1 adet"],
    "Kozmetik & Kişisel": ["deodorant", "parfüm", "saç boyası"],
    "Temizlik": ["bulaşık deterjanı", "bulaşık süngeri", "bulaşık teli", "bulaşık makinesi tableti 30 lu", "çamaşır suyu", "kağıt havlu 6 lı rulo", "sıvı deterjan 2 lt", "sıvı sabun", "tuvalet kağıdı 12 li rulo", "yüzey temizleyici"],
    "Gıda (Market)": ["ayçiçek yağı 2 lt", "beyaz peynir 500 gr", "dana kuşbaşı 1kg", "dana kıyma 1 kg", "kahve", "kırmızı mercimek 1 kg", "nohut", "pilavlık bulgur 1 kg", "pilavlık pirinç 1 kg", "spagetti makarna", "tam yağlı kaşar peyniri 400 gr", "tam yağlı süt 1lt", "tavuk göğsü 1 kg", "toz şeker 1 kg", "yarım yağlı süt 1 lt", "yumurta 15'li", "su"],
    "Gıda (Manav)": ["biber", "çilek", "domates 1 kg", "erik", "fasulye", "kabak", "karpuz", "kavun", "kayısı", "nane", "patates", "patlıcan", "portakal", "salatalık", "salkım domates 1 kg", "şeftali", "soğan", "üzüm", "çengeköy salatalık 1kg"],
    "Atıştırmalık & İçecek": ["bisküvi", "çikolata", "cips", "gazoz", "jelibon", "kek", "kola", "kraker", "lolipop", "sakız", "şalgam"],
    "Baharat": ["karabiber", "karanfil", "kekik", "kimyon", "pul biber", "sumak", "tarçın"],
    "Hobi & Oyuncak": ["boya kalemi", "boyama kitabı", "lego seti", "puzzle"]
}

print("Veritabanına ürünler ekleniyor...")
kategori_db_map = {k: [] for k in kategoriler.keys()}
kategori_db_map["Diğer"] = []

for f in gercek_dosyalar:
    if not f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp', '.avif', '.jfif', '.pmg')):
        continue
    
    raw_name = f.replace(".png", "").replace(".jpg", "").replace(".jpeg", "").replace(".webp", "").replace(".avif", "").replace(".jfif", "").replace(".pmg", "")
    raw_name = raw_name.split('.')[0].strip()
    
    if raw_name.lower() in yazim_duzeltmeleri:
        display_name = yazim_duzeltmeleri[raw_name.lower()]
    else:
        display_name = raw_name.title()
        
    found_cat = "Diğer"
    for cat_name, items in kategoriler.items():
        if display_name.lower() in [i.lower() for i in items] or raw_name.lower() in [i.lower() for i in items]:
            found_cat = cat_name
            break
            
    # Realistic base prices map for the generator
    PRICE_MAP = {
        'laptop': 35000.00, 'akıllı saat': 6000.00, 'saat': 5000.00, 'kulaklık': 4500.00,
        'gaming mouse': 1800.00, 'mouse': 1500.00, 'tablet': 18000.00, 'bilgisayar çantası': 1500.00,
        'mekanik klavye': 3000.00, 'usb bellek 64gb': 350.00, 'hızlı şarj kablosu': 290.00,
        'powerbank 20000mah': 1200.00, 'powerbank': 950.00, 'airpods': 6500.00, 'drone': 25000.00,
        'robot süpürge': 16000.00, 'telefon': 45000.00, 'hoparlör': 3500.00, 'yün kazak': 1200.00,
        'kışlık mont': 4999.00, 'spor ayakkabı': 3999.00, 'pamuklu eşofman': 1500.00, 'deri kemer': 799.00,
        'beyaz tişört': 450.00, 'jean pantolon': 1499.00, 'bez çanta': 199.00, 'şık gömlek': 1200.00,
        'slim fit gömlek': 1200.00, 'yün atkı': 499.00, 'kışlık atkı': 499.00, 'chino pantolon': 1499.00,
        'deri bot': 2999.00, 'çorap': 120.00, 'terlik': 350.00, 'pilavlık pirinç': 75.00,
        'kırmızı mercimek': 60.00, 'dana kıyma': 650.00, 'dana kuşbaşı': 720.00, 'süzme çiçek balı': 350.00,
        'spagetti makarna': 25.00, 'domates': 45.00, 'salkım domates': 49.00, 'bebek bezi (dev paket)': 550.00,
        'diş macunu': 95.00, 'yumuşak diş fırçası': 75.00, 'oyuncak ayıcık': 450.00, 'oyuncak araba': 250.00,
        'muz (ithal)': 110.00, 'muz': 90.00, 'kırmızı elma': 40.00, 'sulu armut': 45.00, 'taze maydanoz': 15.00,
        'nane': 15.00, 'tam yağlı yoğurt': 120.00, 'siyah zeytin': 180.00, 'tam buğday ekmek': 25.00,
        'beyaz peynir 500 gr': 140.00, 'tam yağlı kaşar peyniri 400 gr': 180.00, 'tam yağlı kaşar peyniri': 180.00,
        'tam yağlı süt 1lt': 39.00, 'tam yağlı süt': 39.00, 'yarım yağlı süt 1 lt': 35.00, 'toz şeker 1 kg': 45.00,
        'toz şeker': 45.00, 'ayçiçek yağı 2 lt': 145.00, 'yumurta': 75.00, 'su': 10.00, 'pilavlık bulgur': 35.00,
        'kahve': 120.00, 'nohut': 65.00, 'tavuk göğsü': 160.00, 'bulaşık deterjanı': 75.00, 'bulaşık süngeri': 25.00,
        'bulaşık teli': 20.00, 'bulaşık makinesi tableti 30 lu': 320.00, 'çamaşır suyu': 65.00, 'kağıt havlu 6 lı rulo': 120.00,
        'sıvı deterjan 2 lt': 180.00, 'sıvı sabun': 60.00, 'tuvalet kağıdı 12 li rulo': 160.00, 'yüzey temizleyici': 90.00,
        'biber': 55.00, 'çilek': 95.00, 'erik': 70.00, 'fasulye': 75.00, 'kabak': 35.00, 'karpuz': 150.00,
        'kavun': 90.00, 'kayısı': 85.00, 'patates': 25.00, 'patlıcan': 45.00, 'portakal': 35.00, 'salatalık': 35.00,
        'soğan': 20.00, 'üzüm': 75.00, 'şeftali': 65.00, 'bisküvi': 20.00, 'çikolata': 35.00, 'cips': 35.00,
        'gazoz': 18.00, 'jelibon': 25.00, 'kek': 12.00, 'kola': 40.00, 'kraker': 10.00, 'lolipop': 10.00,
        'sakız': 7.00, 'şalgam': 25.00, 'karabiber': 45.00, 'karanfil': 45.00, 'kekik': 45.00, 'kimyon': 45.00,
        'pul biber': 45.00, 'sumak': 45.00, 'tarçın': 45.00, 'boya kalemi': 120.00, 'boyama kitabı': 50.00,
        'lego seti': 950.00, 'puzzle': 290.00, 'deodorant': 180.00, 'parfüm': 2500.00, 'saç boyası': 220.00
    }
    
    name_clean = display_name.lower().split(" #")[0].split(" (")[0].strip()
    base_price = PRICE_MAP.get(name_clean)
    if not base_price:
        for k, v in PRICE_MAP.items():
            if k in name_clean or name_clean in k:
                base_price = v
                break
    if not base_price:
        base_price = 150.00
        
    final_price = round(base_price * random.uniform(0.95, 1.05), 2)
    
    p, created = Product.objects.get_or_create(
        name=display_name,
        defaults={
            'price': final_price,
            'category': found_cat,
            'image_url': f"/static/images/{f}"
        }
    )
    p.price = final_price
    p.image_url = f"/static/images/{f}"
    p.save()
    
    kategori_db_map[found_cat].append(p)

print("500 yeni sepet oluşturuluyor...")
semtler = ["Kadıköy", "Beşiktaş", "Şişli", "Üsküdar", "Maltepe", "Bakırköy", "Sarıyer", "Beyoğlu", "Ataşehir", "Pendik", "Kartal", "Ümraniye", "Zeytinburnu"]
marketler = ["TrendSepetiX Express", "Süper Market", "Mahalle Bakkalı", "Organik Pazar", "TeknoStore", "Giyim Sepeti"]

active_categories = [k for k, v in kategori_db_map.items() if len(v) >= 2]

new_sales = []
for i in range(500):
    cat = random.choice(active_categories)
    available_products = kategori_db_map[cat]
    
    num_items = random.randint(2, min(5, len(available_products)))
    selected_products = random.sample(available_products, num_items)
    
    semt = random.choice(semtler)
    market = random.choice(marketler)
    
    lat = 41.0 + random.uniform(-0.1, 0.1)
    lng = 29.0 + random.uniform(-0.2, 0.2)
    
    sale = Sale.objects.create(
        district=semt,
        shop_name=market,
        lat=lat,
        lng=lng,
        recommendation=f"{cat} kategorisinde çapraz satış fırsatı"
    )
    sale.products.set(selected_products)
    sale.save()
    
print("Tüm işlemler başarıyla tamamlandı! Sitenizin sağ tarafında 500 yeni, mantıklı sepet listelenecektir.")
