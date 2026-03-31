from django.shortcuts import render
from .models import Sale, Product
from django.db.models import Count
import random
import os

def index(request):
    try:
        # Performans için sadece son 40 sepeti göster (Grid için)
        satislar_full = Sale.objects.all().prefetch_related('products')
        toplam_sepet_sayisi = satislar_full.count()
        satislar = satislar_full.order_by('-id')[:40]
        
        populer_semtler = Sale.objects.values('district').annotate(
            sayi=Count('id')).order_by('-sayi')
        en_aktif_semt = populer_semtler[0]['district'] if populer_semtler else "İstanbul"

        # SENİN .PNG DOSYALARINLA EŞLEŞEN SÖZLÜK
        ozel_gorseller = {
            "yün kazak": "/static/images/yün kazak 1 adet.png",
            "kışlık mont": "/static/images/kışlık mont.png",
            "pamuklu eşofman": "/static/images/pamuklu eşofman.png",
            "pamuklu sweat": "/static/images/pamuklu sweatshort.png",
            "slım fit gömlek": "/static/images/slım fit gömlek.png",
            "jean pantolon": "/static/images/jean pantolon.png",
            "chino pantolon": "/static/images/chino pantolon.png",
            "deri bot": "/static/images/deri bot.png",
            "yün atkı": "/static/images/yün atkı.png",
            "laptop": "/static/images/laptop.png",
            "tablet": "/static/images/tablet.png",
            "telefon": "/static/images/telefon.png",
            "kulaklık": "/static/images/kulaklık.png",
            "airpods": "/static/images/airpods.png",
            "mouse": "/static/images/gaming mouse.png",
            "fare": "/static/images/mouse(fare).png",
            "powerbank": "/static/images/powerbank.png",
            "saat": "/static/images/saat.png",
            "pirinç": "/static/images/pilavlık pirinç 1 kg.png",
            "bulgur": "/static/images/pilavlık bulgur 1 kg.png",
            "mercimek": "/static/images/kırmızı mercimek 1 kg.png",
            "makarna": "/static/images/spagetti makarna.png",
            "kıyma": "/static/images/dana kıyma 1 kg.png",
            "kuşbaşı": "/static/images/dana kuşbaşı 1kg.png",
            "tavuk göğsü": "/static/images/tavuk göğsü 1 kg.png",
            "domates": "/static/images/domates.png",
            "salatalık": "/static/images/çengeköy salatalık 1kg.png",
            "ayçiçek yağı": "/static/images/ayçiçek yağı 2 lt.png",
            "toz şeker": "/static/images/toz şeker 1 kg.png",
            "yumurta": "/static/images/ymurta 15 li.png",
            "tam yağlı süt": "/static/images/tam yağlı süt 1lt.png",
            "yarım yağlı süt": "/static/images/yarım yağlı süt 1 lt.png",
            "kaşar peyniri": "/static/images/tam yağlı kaşar peyniri 400 gr.png",
            "beyaz peynir": "/static/images/beyaz peynir 500 gr.png",
            "sıvı deterjan": "/static/images/sıvı deterjan 2 lt.png",
            "bulaşık makinesi tableti": "/static/images/bulaşık makinesi tableti 30 lu.png",
            "kağıt havlu": "/static/images/kağıt havlu 6 lı rulo.png",
            "tuvalet kağıdı": "/static/images/tuvalet kağıdı 12 li rulo.png",
            "yüzey temizleyici": "/static/images/yüzey temizleyici.png",
            "spor ayakkabı": "/static/images/spor ayakkabı.png",
            "deri kemer": "/static/images/deri kemer.png",
            "dis macunu": "/static/images/dis_macunu_ozel.png",
            "diş macunu": "/static/images/dis_macunu_ozel.png",
            "dis fircasi": "/static/images/dis_fircasi_ozel.png",
            "diş fırçası": "/static/images/dis_fircasi_ozel.png",
            "usb bellek": "/static/images/usb_bellek_ozel.png",
            "oyuncak ayıcık": "/static/images/oyuncak_ayicik_ozel.png",
            "muz": "/static/images/muz_ozel.png",
            "maydanoz": "/static/images/maydanoz_ozel.png",
            "yoğurt": "/static/images/yogurt_ozel.png",
            "yogurt": "/static/images/yogurt_ozel.png",
            "zeytin": "/static/images/zeytin_ozel.png",
            "bebek bezi": "/static/images/bebek_bezi_ozel.png",
            "balı": "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400",
            "mouse": "/static/images/gaming mouse.png",
            "fare": "/static/images/mouse(fare).png"
        }

        # TÜM SEPETLERDEKİ BENZERSİZ ÜRÜNLERİ HIZLI BİR ŞEKİLDE ÇEK (#1 olanları filtrele)
        # 8000+ ürün içinde dönmek yerine sadece temel varyasyonları alıyoruz
        tum_urunler_sorgu = Product.objects.filter(name__contains='#1').distinct()
        tum_urunler = []
        gorulen_adlar = set()
        
        for p in tum_urunler_sorgu:
            # Sadece isim bazlı benzersizlik (örneğin farklı sepetlerdeki aynı ürünü bir kez göster)
            temel_ad = p.name.split(" #")[0]
            if temel_ad not in gorulen_adlar:
                urun_adi_lower = p.name.lower()
                # Önce veritabanındaki görseli al (yukle.py'den gelen kaliteli Unsplash linki)
                secilen_resim = p.image_url 
                
                # ÖZEL YÜKLENMİŞ .PNG VEYA SPESİFİK GÖRSEL VARSA ONU KULLAN (OVERRIDE)
                for anahtar, resim_path in ozel_gorseller.items():
                    if anahtar in urun_adi_lower:
                        secilen_resim = resim_path
                        break
                
                tum_urunler.append({
                    'ad': temel_ad,
                    'gercek_fiyat': round(float(p.price) * 1.15, 2),
                    'foto': secilen_resim
                })
                gorulen_adlar.add(temel_ad)

        analizler = []
        for s in satislar:
            urunler_queryset = s.products.all()
            toplam = sum(p.price for p in urunler_queryset)
            
            hazir_urun_listesi = []
            for p in urunler_queryset:
                urun_adi_lower = p.name.lower()
                # Veritabanındaki görseli varsayılan olarak kullan
                secilen_resim = p.image_url 
                
                # ÖZEL EŞLEŞTİRME (DAHA ESNEK)
                for anahtar, resim_path in ozel_gorseller.items():
                    if anahtar in urun_adi_lower:
                        secilen_resim = resim_path
                        break
                
                hazir_urun_listesi.append({
                    'ad': p.name,
                    'stok': random.randint(10, 50),
                    'foto': secilen_resim
                })

            analizler.append({
                'semt': s.district,
                'market': s.shop_name,
                'lat': s.lat,
                'lng': s.lng,
                'urun_detaylari': hazir_urun_listesi,
                'eski_fiyat': round(float(toplam) * 1.15, 2),
                'yeni_fiyat': round(float(toplam), 2),
                'oneri': "Stok Verimliliği Analiz Edildi"
            })

        return render(request, 'index.html', {
            'analizler': analizler,
            'tum_urunler': tum_urunler,
            'toplam_sepet': toplam_sepet_sayisi,
            'en_aktif_semt': en_aktif_semt,
            'ai_genel_rapor': "Ürün görselleri ve sistem paneli başarıyla güncellendi."
        })
        
    except Exception as e:
        from django.http import HttpResponse
        return HttpResponse(f"Görselleştirme hatası: {e}")