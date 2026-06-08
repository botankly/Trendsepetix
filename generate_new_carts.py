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
            
    p, created = Product.objects.get_or_create(
        name=display_name,
        defaults={
            'price': random.randint(10, 500),
            'category': found_cat,
            'image_url': f"/static/images/{f}"
        }
    )
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
