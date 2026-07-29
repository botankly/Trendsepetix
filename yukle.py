import os, django, random
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'trend_projesi.settings')
django.setup()
from myapp.models import Product, Sale
from django.db import transaction

@transaction.atomic
def mantikli_veri_yukle():
    print("Eski veriler temizleniyor...")
    Sale.objects.all().delete()
    Product.objects.all().delete()

    # MAĞAZA TİPLERİ VE SATABİLECEKLERİ ÜRÜNLER (GENİŞLETİLMİŞ)
    yapi = {
        "Teknoloji Mağazası": {
            "marketler": ["Vatan", "MediaMarkt", "Teknosa", "Amazon Loft"],
            "urunler": [
                ("Laptop", 28000, "1 Adet", "/static/images/laptop.png.png"),
                ("Akıllı Saat", 5500, "1 Adet", "/static/images/saat.png.png"),
                ("Kulaklık", 3200, "1 Adet", "/static/images/kulaklık.png.png"),
                ("Gaming Mouse", 1900, "1 Adet", "/static/images/mouse(fare).png.png"),
                ("Tablet", 16000, "1 Adet", "/static/images/tablet.png.png"),
                ("Powerbank", 950, "1 Adet", "/static/images/powerbank.png.png"),
                ("Airpods", 3500, "1 Adet", "/static/images/airpods.png.png"),
                ("Drone", 25000, "1 Adet", "/static/images/drone.png.jpg"),
                ("Robot Süpürge", 14000, "1 Adet", "/static/images/robotsupurge.png.jpg"),
                ("Hoparlör", 4500, "1 Adet", "/static/images/hoparlor.png.webp"),
                ("Telefon", 48000, "1 Adet", "/static/images/telefon.png.png")
            ]
        },
        "Moda & Giyim": {
            "marketler": ["ZARA", "Boyner", "H&M", "Mavi", "LC Waikiki"],
            "urunler": [
                ("Slim Fit Gömlek", 1100, "1 Adet", "/static/images/slım fit gömlek.png.png"),
                ("Yün Atkı", 350, "1 Adet", "/static/images/yün atkı.png.png"),
                ("Yün Kazak", 950, "1 Adet", "/static/images/yün kazak 1 adet.png.png"),
                ("Pamuklu Eşofman", 1400, "1 Adet", "/static/images/pamuklu eşofman.png.png"),
                ("Pamuklu Sweatshirt", 1250, "1 Adet", "/static/images/pamuklu sweatshort.png.png"),
                ("Chino Pantolon", 1200, "1 Adet", "/static/images/chino pantolon.png.png"),
                ("Jean Pantolon", 1200, "1 Adet", "/static/images/jean pantolon.png.png"),
                ("Deri Bot", 3200, "1 Çift", "/static/images/deri bot.png.png"),
                ("Çorap", 120, "1 Adet", "/static/images/corap.png.webp"),
                ("Terlik", 450, "1 Çift", "/static/images/terlik.png.jpg")
            ]
        },
        "Market & Gıda": {
            "marketler": ["Migros", "Carrefour", "BİM", "ŞOK", "Tarım Kredi"],
            "urunler": [
                ("Pilavlık Pirinç", 65, "1 Kg", "/static/images/pilavlık pirinç 1 kg.png.png"),
                ("Kırmızı Mercimek", 55, "1 Kg", "/static/images/kırmızı mercimek 1 kg.png.png"),
                ("Dana Kıyma", 540, "1 Kg", "/static/images/dana kıyma 1 kg.png.png"),
                ("Dana Kuşbaşı", 580, "1 Kg", "/static/images/dana kuşbaşı 1kg.pmg.png"),
                ("Ayçiçek Yağı", 140, "2 Lt", "/static/images/ayçiçek yağı 2 lt.png.png"),
                ("Beyaz Peynir", 130, "500 Gr", "/static/images/beyaz peynir 500 gr.png.png"),
                ("Kaşar Peyniri", 160, "400 Gr", "/static/images/tam yağlı kaşar peyniri 400 gr.png.png"),
                ("Tam Yağlı Süt", 35, "1 Lt", "/static/images/tam yağlı süt 1lt.png.png"),
                ("Yarım Yağlı Süt", 30, "1 Lt", "/static/images/yarım yağlı süt 1 lt.png.png"),
                ("Tavuk Göğsü", 180, "1 Kg", "/static/images/tavuk göğsü 1 kg.png.png"),
                ("Yumurta", 75, "15 li", "/static/images/ymurta 15 li.png.png"),
                ("Toz Şeker", 45, "1 Kg", "/static/images/toz şeker 1 kg.png.png"),
                ("Spagetti Makarna", 25, "1 Adet", "/static/images/spagetti makarna.png.png"),
                ("Domates", 45, "1 Kg", "/static/images/domates 1 kg.png.png"),
                ("Salkım Domates", 55, "1 Kg", "/static/images/salkım domates 1 kg.png.png"),
                ("Salatalık", 30, "1 Kg", "/static/images/salatalık.png.png"),
                ("Çengelköy Salatalık", 45, "1 Kg", "/static/images/çengeköy salatalık 1kg.png.png"),
                ("Soğan", 20, "1 Kg", "/static/images/sogan.png.webp"),
                ("Patates", 25, "1 Kg", "/static/images/patates.png.jpg"),
                ("Patlıcan", 40, "1 Kg", "/static/images/patlıcan.png.png"),
                ("Kabak", 35, "1 Kg", "/static/images/kabak.png.png"),
                ("Biber", 50, "1 Kg", "/static/images/bıber.png.png"),
                ("Muz (İthal)", 110, "1 Kg", "/static/images/muz.png.png"),
                ("Portakal", 35, "1 Kg", "/static/images/portakal.png.png"),
                ("Çilek", 80, "1 Kg", "/static/images/cılek.png.png"),
                ("Karpuz", 15, "1 Kg", "/static/images/karpuz.png.png"),
                ("Kavun", 25, "1 Kg", "/static/images/kavun.png.png"),
                ("Kayısı", 60, "1 Kg", "/static/images/kayısı.png.png"),
                ("Erik", 50, "1 Kg", "/static/images/erık.png.png"),
                ("Şeftali", 45, "1 Kg", "/static/images/seftalı.png.png"),
                ("Üzüm", 55, "1 Kg", "/static/images/uzum.png.png"),
                ("Karanfil", 30, "1 Paket", "/static/images/karanfıl.png.webp"),
                ("Nane", 15, "1 Demet", "/static/images/nane.png.webp"),
                ("Kekik", 20, "1 Paket", "/static/images/kekık.png.jfif"),
                ("Sumak", 25, "1 Paket", "/static/images/sumak.png.jpg"),
                ("Kimyon", 20, "1 Paket", "/static/images/kımyon.png.jpg"),
                ("Karabiber", 25, "1 Paket", "/static/images/karabıber.png.jpg"),
                ("Su", 10, "1 Adet", "/static/images/su.png.png"),
                ("Kola", 45, "1 Adet", "/static/images/kola.png.png"),
                ("Gazoz", 30, "1 Adet", "/static/images/gazoz.png.webp"),
                ("Şalgam", 35, "1 Adet", "/static/images/salgam.png.png"),
                ("Kahve", 80, "1 Adet", "/static/images/kahve.png.png"),
                ("Çikolata", 25, "1 Adet", "/static/images/cıkolata.png.jpg"),
                ("Bisküvi", 20, "1 Adet", "/static/images/bıskuvı.png.jpg"),
                ("Kraker", 15, "1 Adet", "/static/images/kraker.png.avif"),
                ("Kek", 15, "1 Adet", "/static/images/kek.png.jpg"),
                ("Jelibon", 20, "1 Adet", "/static/images/jelıbon.png.jpg"),
                ("Lolipop", 10, "1 Adet", "/static/images/lolıop.png.jpg"),
                ("Sakız", 10, "1 Adet", "/static/images/sakız.png.png"),
                ("Cips", 25, "1 Adet", "/static/images/cıps.png.webp"),
                ("Fasulye", 45, "1 Kg", "/static/images/fasulye.png.png"),
                ("Nohut", 45, "1 Kg", "/static/images/nohut.png.jpg"),
                ("Pilavlık Bulgur", 40, "1 Kg", "/static/images/pilavlık bulgur 1 kg.png.png"),
                ("Pul Biber", 25, "1 Paket", "/static/images/pulbıber.png.jpeg"),
                ("Tarçın", 30, "1 Paket", "/static/images/tarcın.png.jpg")
            ]
        },
        "Temizlik": {
            "marketler": ["Migros", "Carrefour", "BİM", "ŞOK", "Tarım Kredi"],
            "urunler": [
                ("Bulaşık Deterjanı", 85, "1 Adet", "/static/images/bulasıkdeterjanı.png.png"),
                ("Bulaşık Makinesi Tableti", 220, "30 lu", "/static/images/bulaşık makinesi tableti 30 lu.png.png"),
                ("Çamaşır Suyu", 45, "1 Adet", "/static/images/camasırsuyu.png.webp"),
                ("Sıvı Deterjan", 150, "2 Lt", "/static/images/sıvı deterjan 2 lt.png.png"),
                ("Yüzey Temizleyici", 75, "1 Adet", "/static/images/yüzey temizleyici.png.png"),
                ("Sıvı Sabun", 40, "1 Adet", "/static/images/sıvısabun.png.webp"),
                ("Deodorant", 95, "1 Adet", "/static/images/deodorant.png.png"),
                ("Parfüm", 750, "1 Adet", "/static/images/parfum.png.png"),
                ("Saç Boyası", 120, "1 Adet", "/static/images/saçboyası.png.jpg"),
                ("Bulaşık Süngeri", 25, "1 Adet", "/static/images/bulasıksungerı.png.webp"),
                ("Bulaşık Teli", 20, "1 Adet", "/static/images/bulasıkteli.png.jpg"),
                ("Kağıt Havlu", 85, "6 lı rulo", "/static/images/kağıt havlu 6 lı rulo.png.png"),
                ("Tuvalet Kağıdı", 130, "12 li rulo", "/static/images/tuvalet kağıdı 12 li rulo.png.png")
            ]
        },
        "Hobi & Oyuncak": {
            "marketler": ["Toyzz Shop", "Armağan", "Migros", "D&R"],
            "urunler": [
                ("Boyama Kalemi", 75, "1 Paket", "/static/images/boyamakalemı.png.jpeg"),
                ("Boyama Kitabı", 45, "1 Adet", "/static/images/boyamakıtabı.png.webp"),
                ("Logo Seti", 650, "1 Adet", "/static/images/logosetı.png.jpg"),
                ("Puzzle", 250, "1 Adet", "/static/images/puzzle.png.webp")
            ]
        }
    }

    all_products = []
    print("Ürünler Mağaza Tiplerine Göre Hazırlanıyor...")
    for tip, detay in yapi.items():
        for ad, fiyat, birim, img in detay["urunler"]:
            # Her üründen çeşitlilik için varyasyonlar oluştur
            for i in range(1, 201):
                p = Product.objects.create(
                    name=f"{ad} ({birim}) #{i}", # BİRİM BURADA EKLENİYOR
                    price=round(fiyat * random.uniform(0.85, 1.15), 2),
                    category=tip,
                    stock=random.randint(5, 50),
                    image_url=img
                )
                all_products.append(p)

    semtler = ["Beşiktaş", "Kadıköy", "Pendik", "Şişli", "Bakırköy", "Üsküdar"]

    print("500 Mantıklı Sepet Oluşturuluyor...")
    for _ in range(500):
        # Önce rastgele bir Mağaza Tipi seç (Örn: Sadece Giyim)
        secili_tip = random.choice(list(yapi.keys()))
        secili_market = random.choice(yapi[secili_tip]["marketler"])
        
        s = Sale.objects.create(
            district=random.choice(semtler),
            shop_name=secili_market,
            lat=41.0 + (random.randint(-100, 100)/1000.0),
            lng=28.9 + (random.randint(-100, 100)/1000.0),
            recommendation=f"Bu hafta {secili_market} mağazasında {secili_tip} ürünlerinde dev fırsat!"
        )
        
        # Sadece o mağaza tipine uygun ürünleri filtrele
        uygun_urunler = [p for p in all_products if p.category == secili_tip]
        
        # AYNI TİP ÜRÜNLERDEN (Örn: İki tane Laptop) KAÇINMAK İÇİN GRUPLA
        tip_bazli_urunler = {}
        for p in uygun_urunler:
            base_name = p.name.split(" #")[0]
            if base_name not in tip_bazli_urunler:
                tip_bazli_urunler[base_name] = []
            tip_bazli_urunler[base_name].append(p)
            
        # Her tipten rastgele birer tane seç ve onlardan sepet oluştur
        her_tipten_birer = [random.choice(v) for v in tip_bazli_urunler.values()]
        s.products.set(random.sample(her_tipten_birer, min(len(her_tipten_birer), random.randint(3, 5))))

    print("BASARILI: Urun-Magaza uyumu saglandi ve birimler eklendi!")

if __name__ == "__main__":
    mantikli_veri_yukle()