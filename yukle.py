import os, django, random
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'trend_projesi.settings')
django.setup()
from myapp.models import Product, Sale

def mantikli_veri_yukle():
    print("Eski veriler temizleniyor...")
    Sale.objects.all().delete()
    Product.objects.all().delete()

    # MAĞAZA TİPLERİ VE SATABİLECEKLERİ ÜRÜNLER (GENİŞLETİLMİŞ)
    yapi = {
        "Teknoloji Mağazası": {
            "marketler": ["Vatan", "MediaMarkt", "Teknosa", "Amazon Loft"],
            "urunler": [
                ("Laptop", 28000, "1 Adet", "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300"),
                ("Akıllı Saat", 5500, "1 Adet", "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300"),
                ("Kulaklık", 3200, "1 Adet", "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300"),
                ("Gaming Mouse", 1900, "1 Adet", "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=300"),
                ("Tablet", 16000, "1 Adet", "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300"),
                ("Bilgisayar Çantası", 1200, "1 Adet", "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300"),
                ("Mekanik Klavye", 2500, "1 Adet", "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=300"),
                ("USB Bellek 64GB", 350, "1 Adet", "https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=300"),
                ("Hızlı Şarj Kablosu", 250, "1 Adet", "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=300"),
                ("Powerbank 20000mAh", 950, "1 Adet", "https://images.unsplash.com/photo-1609100411649-7c8799982442?w=300")
            ]
        },
        "Moda & Giyim": {
            "marketler": ["ZARA", "Boyner", "H&M", "Mavi", "LC Waikiki"],
            "urunler": [
                ("Yün Kazak", 950, "1 Adet", "https://images.unsplash.com/photo-1556905055-8f358a7a4bb4?w=300"),
                ("Kışlık Mont", 4200, "1 Adet", "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=300"),
                ("Spor Ayakkabı", 3200, "1 Adet", "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300"),
                ("Pamuklu Eşofman", 1400, "1 Adet", "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300"),
                ("Deri Kemer", 750, "1 Adet", "https://images.unsplash.com/photo-1624222247344-550fb8ec5522?w=300"),
                ("Beyaz Tişört", 450, "1 Adet", "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300"),
                ("Jean Pantolon", 1200, "1 Adet", "https://images.unsplash.com/photo-1542272604-787c3835535d?w=300"),
                ("Bez Çanta", 150, "1 Adet", "https://images.unsplash.com/photo-1544816155-12df9643f363?w=300"),
                ("Şık Gömlek", 1100, "1 Adet", "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300"),
                ("Kışlık Atkı", 350, "1 Adet", "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=300")
            ]
        },
        "Market & Gıda": {
            "marketler": ["Migros", "Carrefour", "BİM", "ŞOK", "Tarım Kredi"],
            "urunler": [
                ("Pilavlık Pirinç", 65, "1 Kg", "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300"),
                ("Kırmızı Mercimek", 55, "1 Kg", "https://images.unsplash.com/photo-1515942400420-2b98fed1f515?w=300"),
                ("Dana Kıyma", 540, "1 Kg", "https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=300"),
                ("Süzme Çiçek Balı", 320, "1 Adet", "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=300"),
                ("Spagetti Makarna", 25, "1 Adet", "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=300"),
                ("Domates", 45, "1 Kg", "https://images.unsplash.com/photo-1546473427-e1ad6c448144?w=300"),
                ("Bebek Bezi (Dev Paket)", 450, "1 Adet", "https://images.unsplash.com/photo-1595433707802-68267d83760a?w=300"),
                ("Diş Macunu (Beyazlatıcı)", 85, "1 Adet", "https://images.unsplash.com/photo-1559591931-98939b7f5bd8?w=300"),
                ("Yumuşak Diş Fırçası", 45, "1 Adet", "https://images.unsplash.com/photo-1559591901-789a7f34be64?w=300"),
                ("Oyuncak Ayıcık", 350, "1 Adet", "https://images.unsplash.com/photo-1559440666-302a4866380c?w=300"),
                ("Oyuncak Araba", 150, "1 Adet", "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=300"),
                ("Muz (İthal)", 110, "1 Kg", "https://images.unsplash.com/photo-1571771894821-ad9958a35c47?w=300"),
                ("Kırmızı Elma", 35, "1 Kg", "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=300"),
                ("Sulu Armut", 40, "1 Kg", "https://images.unsplash.com/photo-1514756331096-242fdeb70d4a?w=300"),
                ("Taze Maydanoz", 10, "1 Demet", "https://images.unsplash.com/photo-1533604195157-8fbd74753004?w=300"),
                ("Tam Yağlı Yoğurt", 85, "1.5 Kg", "https://images.unsplash.com/photo-1584273143981-42107ad61029?w=300"),
                ("Siyah Zeytin", 160, "500 Gr", "https://images.unsplash.com/photo-1526470494896-7e77ba05cf94?w=300"),
                ("Tam Buğday Ekmek", 25, "1 Adet", "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300")
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

    print("✅ BAŞARILI: Ürün-Mağaza uyumu sağlandı ve birimler eklendi!")

if __name__ == "__main__":
    mantikli_veri_yukle()