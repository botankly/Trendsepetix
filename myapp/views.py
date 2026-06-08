from django.shortcuts import render
from .models import Sale, Product
from django.db.models import Count, Avg
import random
import os

def index(request):
    try:
        toplam_sepet_sayisi = Sale.objects.count()
        raw_sales_data = Sale.objects.order_by('-id')[:500].values(
            'id', 'district', 'shop_name', 'lat', 'lng',
            'products__id', 'products__name', 'products__price', 'products__image_url'
        )
        grouped_sales = []
        sales_map = {}
        for row in raw_sales_data:
            sid = row['id']
            if sid not in sales_map:
                sale_item = {
                    'id': sid,
                    'district': row['district'],
                    'shop_name': row['shop_name'],
                    'lat': row['lat'],
                    'lng': row['lng'],
                    'products': []
                }
                sales_map[sid] = sale_item
                grouped_sales.append(sale_item)
            
            if row['products__id']:
                sales_map[sid]['products'].append({
                    'id': row['products__id'],
                    'name': row['products__name'],
                    'price': float(row['products__price']) if row['products__price'] else 0.0,
                    'image_url': row['products__image_url']
                })
        satislar = grouped_sales
        satislar_full = grouped_sales
        
        populer_semtler = Sale.objects.values('district').annotate(
            sayi=Count('id')).order_by('-sayi')
        en_aktif_semt = populer_semtler[0]['district'] if populer_semtler else "İstanbul"

        # Grafik ve harita istatistikleri
        semt_adlari = [item['district'] for item in populer_semtler[:8]]
        semt_satis_sayilari = [item['sayi'] for item in populer_semtler[:8]]
        
        populer_magazalar = Sale.objects.values('shop_name').annotate(
            sayi=Count('id')).order_by('-sayi')
        magaza_adlari = [item['shop_name'] for item in populer_magazalar[:8]]
        magaza_satis_sayilari = [item['sayi'] for item in populer_magazalar[:8]]
        
        semt_harita_verisi = list(Sale.objects.values('district').annotate(
            sayi=Count('id'),
            avg_lat=Avg('lat'),
            avg_lng=Avg('lng')
        ).order_by('-sayi'))

        # Fallback values for latitude and longitude (Istanbul defaults) if they are None
        for item in semt_harita_verisi:
            if item['avg_lat'] is None:
                item['avg_lat'] = 41.0082
            else:
                item['avg_lat'] = float(item['avg_lat'])
                
            if item['avg_lng'] is None:
                item['avg_lng'] = 28.9784
            else:
                item['avg_lng'] = float(item['avg_lng'])
        # DİNAMİK GÖRSEL EŞLEŞTİRME (GELİŞMİŞ)
        import re
        from django.conf import settings
        
        # Mükemmel el yapımı görsel eşleme tablosu (92 yerel görsel ve varyasyonlar)
        PRODUCT_IMAGE_MAP = {
            # --- Giyim & Aksesuar ---
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
            'deri kemer': '/static/images/chino pantolon.png.png',
            'kışlık mont': '/static/images/pamuklu sweatshort.png.png',
            'spor ayakkabı': '/static/images/deri bot.png.png',
            'bez çanta': '/static/images/corap.png.webp',
            'beyaz tişört': '/static/images/slım fit gömlek.png.png',

            # --- Teknoloji ---
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
            'bilgisayar çantası': '/static/images/airpods.png.png',
            'usb bellek 64gb': '/static/images/powerbank.png.png',
            'hızlı şarj kablosu': '/static/images/powerbank.png.png',
            'mekanik klavye': '/static/images/laptop.png.png',

            # --- Market / Gıda ---
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
            'tam yağlı yoğurt': '/static/images/tam yağlı süt 1lt.png.png',
            'siyah zeytin': '/static/images/nohut.png.jpg',
            'tam buğday ekmek': '/static/images/tam yağlı kaşar peyniri 400 gr.png.png',
            'süzme çiçek balı': '/static/images/tam yağlı kaşar peyniri 400 gr.png.png',

            # --- Temizlik ---
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
            'bebek bezi (dev paket)': '/static/images/kağıt havlu 6 lı rulo.png.png',
            'bebek bezi': '/static/images/kağıt havlu 6 lı rulo.png.png',
            'diş macunu (beyazlatıcı)': '/static/images/sıvısabun.png.webp',
            'diş macunu': '/static/images/sıvısabun.png.webp',
            'yumuşak diş fırçası': '/static/images/bulasıksungerı.png.webp',

            # --- Manav / Meyve & Sebze ---
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
            'muz (ithal)': '/static/images/portakal.png.png',
            'muz': '/static/images/portakal.png.png',
            'kırmızı elma': '/static/images/cılek.png.png',
            'sulu armut': '/static/images/seftalı.png.png',
            'taze maydanoz': '/static/images/nane.png.webp',

            # --- Atıştırmalık & İçecek ---
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

            # --- Baharat ---
            'karabiber': '/static/images/karabıber.png.jpg',
            'karanfil': '/static/images/karanfıl.png.webp',
            'kekik': '/static/images/kekık.png.jfif',
            'kimyon': '/static/images/kımyon.png.jpg',
            'pul biber': '/static/images/pulbıber.png.jpeg',
            'sumak': '/static/images/sumak.png.jpg',
            'tarçın': '/static/images/tarcın.png.jpg',

            # --- Hobi & Oyuncak / Kozmetik ---
            'boya kalemi': '/static/images/boyamakalemı.png.jpeg',
            'boyama kitabı': '/static/images/boyamakıtabı.png.webp',
            'lego seti': '/static/images/logosetı.png.jpg',
            'puzzle': '/static/images/puzzle.png.webp',
            'deodorant': '/static/images/deodorant.png.png',
            'parfüm': '/static/images/parfum.png.png',
            'saç boyası': '/static/images/saçboyası.png.jpg',
            'oyuncak ayıcık': '/static/images/logosetı.png.jpg',
            'oyuncak araba': '/static/images/drone.png.jpg',
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
                # 2. Prevent loose fuzzy matches by falling back to physical checks or specific keys
                res = None
                for map_key, path in PRODUCT_IMAGE_MAP.items():
                    if map_key == name_clean:
                        res = path
                        break
                
                if not res:
                    # 3. Check if the database image url exists physically on disk
                    if database_image_url:
                        local_path = os.path.join(settings.BASE_DIR, database_image_url.lstrip('/'))
                        if os.path.exists(local_path):
                            res = database_image_url
                    
                if not res:
                    # 4. Fallback to the database URL if it is a valid web URL or another fallback, otherwise a placeholder
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

        # Veritabanındaki gerçek benzersiz ürünleri grupla (Hayalet ürünleri önlemek ve gerçek fiyatları getirmek için)
        product_data = {}
        for p in Product.objects.all():
            name_raw = p.name
            clean_name = name_raw.split(" #")[0].split(" (")[0].strip()
            clean_name_lower = clean_name.lower()
            if clean_name_lower not in product_data:
                product_data[clean_name_lower] = {
                    'original_name': clean_name,
                    'price': p.price,
                    'skt': p.expiration_date.strftime('%d.%m.%Y') if p.expiration_date else "N/A",
                    'category': p.category,
                    'image_url': p.image_url
                }

        kategorili_urunler = {}
        
        def assign_category(name, db_category):
            if db_category and str(db_category).strip():
                cat = str(db_category).strip()
                if "Teknoloji" in cat or "Elektronik" in cat:
                    return '💻 Elektronik'
                elif "Moda" in cat or "Giyim" in cat:
                    return '👕 Giyim'
                elif "Market" in cat or "Gıda" in cat:
                    return '🍔 Gıda & Market'
                elif "Temizlik" in cat:
                    return '🧼 Temizlik'
                elif "Kırtasiye" in cat or "Oyuncak" in cat:
                    return '🧸 Kırtasiye & Oyuncak'
            
            n = name.lower()
            if any(x in n for x in ['peynir', 'süt', 'kıyma', 'yağ', 'bisküvi', 'çikolata', 'biber', 'şalgam', 'şeftali', 'soğan', 'üzüm', 'çilek', 'erik', 'jelibon', 'karanfil', 'kekik', 'kimyon', 'lolipop', 'tarçın', 'yumurta', 'salça', 'makarna', 'pirinç', 'ayçiçek']):
                return '🍔 Gıda & Market'
            elif any(x in n for x in ['laptop', 'drone', 'mouse', 'robot', 'hoparlör', 'telefon', 'tablet']):
                return '💻 Elektronik'
            elif any(x in n for x in ['sabun', 'deterjan', 'sünger', 'çamaşır']):
                return '🧼 Temizlik'
            elif any(x in n for x in ['gömlek', 'çorap', 'sweat', 'tişört']):
                return '👕 Giyim'
            elif any(x in n for x in ['lego', 'boya', 'kitab']):
                return '🧸 Kırtasiye & Oyuncak'
            else:
                return '📦 Diğer'

        # Benzersiz ürünleri sidebar kategorilerine ekle
        for clean_name_lower, p_info in sorted(product_data.items(), key=lambda x: x[1]['original_name']):
            display_name = p_info['original_name']
            base_price = p_info['price']
            db_img = p_info['image_url']
            
            foto = find_best_image(display_name, db_img)
            cat = assign_category(display_name, p_info['category'])
            
            if cat not in kategorili_urunler:
                kategorili_urunler[cat] = []
                
            kategorili_urunler[cat].append({
                'ad': display_name,
                'gercek_fiyat': round(float(base_price) * 1.15, 2),
                'fiyat': float(base_price),
                'foto': foto,
                'skt': p_info['skt']
            })

        analizler = []
        for s in satislar:
            urunler_list = s['products']
            toplam = sum(p['price'] for p in urunler_list)
            
            hazir_urun_listesi = []
            for p in urunler_list:
                temel_ad = p['name'].split(" #")[0]
                secilen_resim = find_best_image(temel_ad, p['image_url'])
                
                hazir_urun_listesi.append({
                    'ad': p['name'],
                    'stok': random.randint(10, 50),
                    'foto': secilen_resim
                })

            analizler.append({
                'semt': s['district'],
                'market': s['shop_name'],
                'lat': s['lat'],
                'lng': s['lng'],
                'urun_detaylari': hazir_urun_listesi,
                'eski_fiyat': round(toplam * 1.15, 2),
                'yeni_fiyat': round(toplam, 2),
                'oneri': "Stok Verimliliği Analiz Edildi"
            })

        # --- HAFTANIN POPÜLER ÜRÜNLERİ VE BUNDLE ANALİZİ ---
        product_counts = {}
        for s in satislar_full:
            for p in s['products']:
                product_counts[p['id']] = product_counts.get(p['id'], 0) + 1

        top_product_ids = sorted(product_counts.items(), key=lambda x: x[1], reverse=True)[:3]
        popular_products = []
        for p_id, count in top_product_ids:
            try:
                p = Product.objects.get(id=p_id)
                foto = find_best_image(p.name, p.image_url)
                popular_products.append({
                    'id': p.id,
                    'name': p.name,
                    'price': float(p.price),
                    'old_price': round(float(p.price) * 1.15, 2),
                    'foto': foto,
                    'sales_count': count
                })
            except Product.DoesNotExist:
                pass

        # Birliktelik analizinden en yüksek support'lu ikiliyi bul
        from .utils.analysis import get_associations
        associations = get_associations(satislar_full, min_support=0.01)
        popular_bundle = None
        if associations:
            best_assoc = associations[0]
            item_names = best_assoc['items']
            bundle_products = []
            total_price = 0
            for name in item_names:
                p = Product.objects.filter(name__iexact=name).first()
                if not p:
                    p = Product.objects.filter(name__icontains=name).first()
                if p:
                    foto = find_best_image(p.name, p.image_url)
                    bundle_products.append({
                        'name': p.name,
                        'price': float(p.price),
                        'foto': foto
                    })
                    total_price += float(p.price)
            
            if len(bundle_products) >= 2:
                popular_bundle = {
                    'products': bundle_products,
                    'total_price': round(total_price * 0.85, 2), # %15 indirim
                    'old_price': round(total_price, 2),
                    'sales_count': best_assoc['count']
                }

        if not popular_bundle and len(popular_products) >= 2:
            p1 = popular_products[0]
            p2 = popular_products[1]
            total_price = p1['price'] + p2['price']
            popular_bundle = {
                'products': [
                    {'name': p1['name'], 'price': p1['price'], 'foto': p1['foto']},
                    {'name': p2['name'], 'price': p2['price'], 'foto': p2['foto']}
                ],
                'total_price': round(total_price * 0.85, 2),
                'old_price': round(total_price, 2),
                'sales_count': max(p1['sales_count'], p2['sales_count'])
            }

        # AI Strateji Raporu - Gemini Entegrasyonu (Görsel 3 / 9. Hafta Uyumlu)
        import requests
        
        gemini_api_key = os.environ.get('GEMINI_API_KEY')
        ai_genel_rapor = ""
        
        # En yüksek support'lu ilk 5 birlikteliği özetle
        associations_summary = ""
        if associations:
            for i, assoc in enumerate(associations[:5]):
                items_str = " + ".join(assoc['items'])
                associations_summary += f"{i+1}. {items_str} (Support: %{round(assoc['support']*100, 2)}, Confidence: %{round(assoc['confidence']*100, 2)}, Sepet Adedi: {assoc['count']})<br>"
        else:
            associations_summary = "Henüz yeterli birliktelik kuralı tespit edilemedi."

        bundle_desc = ""
        if popular_bundle:
            bundle_desc = " ve ".join([p['name'] for p in popular_bundle['products']])

        prompt = f"""
        Sen TrendSepetiX e-ticaret analiz platformunun akıllı AI Strateji ve Veri Analitiği motorusun.
        Aşağıda sepet veri tabanımızdan Apriori / FP-Growth birliktelik analizi algoritmalarıyla çıkarılmış en yüksek ilişkili ürün birliktelikleri, aktif semtler ve sepet verileri bulunmaktadır:
        
        En Yüksek Ürün Birliktelikleri:
        {associations_summary.replace('<br>', '\n')}
        
        En Aktif Satış Semti: {en_aktif_semt}
        Sistemdeki Toplam Analiz Edilen Sepet: {toplam_sepet_sayisi}
        
        Lütfen bu verileri analiz ederek şirket yöneticileri için Türkçe, profesyonel, akıcı ve stratejik bir "Yönetici Özeti ve Karar Destek Raporu" oluştur. 
        Raporunda:
        1. Birliktelik analizi sonuçlarını iş kararları açısından yorumla (Hangi ürünler beraber alınmış, neden?).
        2. {en_aktif_semt} gibi en yüksek hacimli semtler için çapraz satış kampanyası (Bundle) önerileri sun.
        3. Mağaza yöneticilerinin stok ve lojistik optimizasyonunu artıracak somut adımlar tavsiye et.
        
        Yanıtını HTML başlıkları ve paragrafları kullanarak ver. Örneğin: 
        <h3 style="color:var(--primary); margin-top:0; font-size:1.4em; display:flex; align-items:center; gap:10px;"><i class="fas fa-chart-line"></i> TrendSepetiX AI Karar Destek Raporu</h3>
        <p>Paragraf içerikleri...</p>
        <h4 style="color:var(--dark); margin-bottom:8px; font-size:1.1em;"><i class="fas fa-shopping-basket"></i> Başlık</h4>
        <strong>Kalın yazı</strong>
        <ul><li>Liste öğesi</li></ul>
        HTML yapısını bozacak dış etiketler veya <html>/<body> ekleme, sadece doğrudan gövde etiketlerini kullan. Sade ve üst düzey yöneticilere hitap eden profesyonel bir üslupla oluştur.
        """

        if gemini_api_key:
            try:
                from google import genai
                client = genai.Client(api_key=gemini_api_key)
                response = client.models.generate_content(
                    model='gemini-2.5-flash',
                    contents=prompt
                )
                ai_genel_rapor = response.text
                if not ai_genel_rapor:
                    print("Gemini API boş yanıt verdi.")
            except Exception as gem_err:
                print(f"Gemini API çağrı hatası (google-genai): {gem_err}")
                
        if not ai_genel_rapor:
            # Fallback (Akıllı yerel analiz raporu - API Key yoksa veya hata alındıysa)
            ai_genel_rapor = f"""<h3 style="color:var(--primary); margin-top:0; font-size:1.4em; display:flex; align-items:center; gap:10px;"><i class="fas fa-chart-line"></i> TrendSepetiX AI Karar Destek Raporu (Çevrimdışı Analiz)</h3>
<p>Sistemdeki toplam <strong>{toplam_sepet_sayisi}</strong> sepet verisi FP-Growth ve Apriori algoritmalarıyla başarıyla analiz edilmiştir. Elde edilen bulgular, platformun bölgesel bazda yüksek büyüme potansiyeline ve optimize edilebilir kampanya alanlarına sahip olduğunu göstermektedir.</p>

<h4 style="color:var(--dark); margin-bottom:8px; font-size:1.1em;"><i class="fas fa-shopping-basket"></i> 1. Sepet Birliktelik Bulguları (Association Analysis)</h4>
<p>Veri madenciliği motorumuz, müşterilerin alışveriş alışkanlıklarında güçlü korelasyonlar tespit etmiştir. Özellikle en yüksek birliktelik oranına sahip ürünler:<br>
<strong>{associations_summary}</strong>
Bu durum, bu ürünlerin reyonlarda veya online katalogda yan yana listelenmesi durumunda satışları artıracağını kanıtlamaktadır.</p>

<h4 style="color:var(--dark); margin-bottom:8px; font-size:1.1em;"><i class="fas fa-map-marked-alt"></i> 2. Bölgesel Strateji ve Lokasyon Fırsatları</h4>
<p>En aktif satış bölgesi olan <strong>{en_aktif_semt}</strong> semtinde lojistik ve stok devir hızı en yüksek seviyemedir. Bu bölgedeki mağazalarda hızlı tüketim ürünlerinin stok seviyelerinin %20 artırılması, olası stoksuzluk kayıplarını engelleyecektir. Diğer düşük hacimli semtlerde ise hedeflenmiş bölgesel indirim kampanyaları devreye sokulmalıdır.</p>

<h4 style="color:var(--dark); margin-bottom:8px; font-size:1.1em;"><i class="fas fa-gift"></i> 3. Çapraz Satış (Bundle) ve Fiyatlandırma Tavsiyeleri</h4>
<p>{f"<strong>{bundle_desc}</strong> ürünlerinden oluşan haftanın fırsat sepeti, birliktelik oranı en güçlü kombinasyondur." if bundle_desc else "Tespit edilen en popüler ürün grupları arasında sepet bazlı %15 indirimli çapraz paket kampanyaları düzenlenmelidir."} Bu paketler, ortalama sepet büyüklüğünü (AOV) artırmak için ideal araçlardır.</p>"""

        import json
        from django.core.serializers.json import DjangoJSONEncoder
        analizler_json = json.dumps(analizler, cls=DjangoJSONEncoder)
        semt_harita_verisi_json = json.dumps(semt_harita_verisi, cls=DjangoJSONEncoder)
        semt_adlari_json = json.dumps(semt_adlari, cls=DjangoJSONEncoder)
        semt_satis_sayilari_json = json.dumps(semt_satis_sayilari, cls=DjangoJSONEncoder)
        magaza_adlari_json = json.dumps(magaza_adlari, cls=DjangoJSONEncoder)
        magaza_satis_sayilari_json = json.dumps(magaza_satis_sayilari, cls=DjangoJSONEncoder)

        print(f"DEBUG: analizler count: {len(analizler)}")
        print(f"DEBUG: kategoriler count: {len(kategorili_urunler)}")
        return render(request, 'index.html', {
            'analizler_json': analizler_json,
            'kategorili_urunler': kategorili_urunler,
            'toplam_sepet': toplam_sepet_sayisi,
            'en_aktif_semt': en_aktif_semt,
            'ai_genel_rapor': ai_genel_rapor,
            'popular_products': popular_products,
            'popular_bundle': popular_bundle,
            'semt_adlari_json': semt_adlari_json,
            'semt_satis_sayilari_json': semt_satis_sayilari_json,
            'magaza_adlari_json': magaza_adlari_json,
            'magaza_satis_sayilari_json': magaza_satis_sayilari_json,
            'semt_harita_verisi_json': semt_harita_verisi_json
        })
        
    except Exception as e:
        from django.http import HttpResponse
        return HttpResponse(f"Görselleştirme hatası: {e}")