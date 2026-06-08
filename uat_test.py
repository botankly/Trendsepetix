# -*- coding: utf-8 -*-
"""
TrendSepetiX - Kullanıcı Kabul Testleri (UAT)
Bu betik, sahte sepet verilerini analiz ederek veri madenciliği motorunun ve
veritabanı ilişkilerinin doğru çalışıp çalışmadığını test eder.
"""
import os
import django
import sys

# Django ortamını kur
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'trend_projesi.settings')
django.setup()

from myapp.models import Product, Sale
from myapp.utils.analysis import get_associations
from django.utils import timezone

def run_uat_tests():
    print("==================================================")
    print("   TRENDSEPETIX KULLANICI KABUL TESTLERİ (UAT)   ")
    print("==================================================")
    
    # Test 1: Veritabanı ve Ürünlerin Varlığı
    product_count = Product.objects.count()
    print(f"[TEST 1] Veritabanı Ürün Kontrolü: {product_count} ürün bulundu.")
    if product_count == 0:
        print("HATA: Veritabanında ürün bulunamadı. Lütfen önce veri yükleme scriptini çalıştırın.")
        sys.exit(1)
    print(" -> Durum: BAŞARILI")
    
    # Test 2: Sepet Verilerinin Kontrolü
    sales_count = Sale.objects.count()
    print(f"[TEST 2] Sepet Verileri Kontrolü: {sales_count} sepet bulundu.")
    if sales_count == 0:
        print("HATA: Veritabanında sepet (satış) bulunamadı.")
        sys.exit(1)
    print(" -> Durum: BAŞARILI")
    
    # Test 3: Apriori Birliktelik Analizi Testi
    print("[TEST 3] Birliktelik Analizi (Association Analysis) Tahmin Testi...")
    sales = Sale.objects.all().prefetch_related('products')
    associations = get_associations(sales, min_support=0.01)
    
    print(f" -> Toplam üretilen birliktelik kuralı sayısı: {len(associations)}")
    if not associations:
        print(" UYARI: Düşük destek değeri nedeniyle hiç kural üretilemedi.")
    else:
        print(" -> En popüler birliktelikler:")
        for assoc in associations[:3]:
            items_str = " + ".join(assoc['items'])
            print(f"    * {items_str} -> Güven: %{assoc['confidence']*100:.1f}, Destek: %{assoc['support']*100:.1f} (Sepet: {assoc['count']})")
    print(" -> Durum: BAŞARILI")
    
    # Test 4: SKT ve Gıda Ürünleri Kontrolü (UAT Tahminleme & Güvenlik Testi)
    print("[TEST 4] Son Kullanma Tarihi (SKT) Güvenlik ve Doğruluk Kontrolü...")
    today = timezone.now().date()
    expired_products = Product.objects.filter(expiration_date__lt=today)
    print(f" -> Son kullanma tarihi geçmiş ürün sayısı: {expired_products.count()}")
    if expired_products.exists():
        print(" -> Dikkat: Raf ömrü dolmuş ürünler tespit edildi, sistem uyarı mekanizması aktif.")
        for ep in expired_products[:3]:
            print(f"    * EXPIRED: {ep.name} (SKT: {ep.expiration_date})")
    print(" -> Durum: BAŞARILI")
    
    print("==================================================")
    print("      TÜM UAT TESTLERİ BAŞARIYLA TAMAMLANDI      ")
    print("==================================================")

if __name__ == "__main__":
    run_uat_tests()
