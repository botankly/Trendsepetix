# TrendSepetiX 🛒
> E-Ticaret Veri Madenciliği ve Yapay Zeka Karar Destek Sistemi

TrendSepetiX, modern e-ticaret sepet verilerini analiz ederek sepet birlikteliklerini, bölgesel trendleri ve mağaza bazlı satış dağılımlarını çıkaran, elde edilen verileri **Gemini API** ile işleyerek yöneticilere akıllı karar destek raporları sunan entegre bir web, mobil ve backend platformudur.

---

## 🛠️ Teknoloji Yığını (Tech Stack)

* **Backend**: Python, Django REST Framework, SQLite / MySQL, Docker
* **Frontend**: React.js (Vite, TypeScript), Tailwind CSS, Leaflet.js, Chart.js
* **Mobil**: React Native (Expo)
* **Yapay Zeka**: Google Gemini Pro (google-genai API)
* **Test & Analiz**: Python Threading (Stress Test), Django Test Case (UAT)

---

## 📅 14 Haftalık Proje Geliştirme Yol Haritası

### 🔹 1. Hafta: Proje Kapsamı & Docker Kurulumu
Proje gereksinimlerinin belirlenmesi, Docker ortamında MySQL veritabanı altyapısının kurulması ve ham sepet verilerinin sisteme aktarılmasının planlanması.

### 🔹 2. Hafta: Django Backend Mimarisinin Kurulması
Django Rest Framework (DRF) entegrasyonunun tamamlanması, temel modellerin (`Product`, `Sale`, `Feedback`) hazırlanması ve CRUD (Create, Read, Update, Delete) API uçlarının geliştirilmesi.

### 🔹 3. Hafta: Veri Madenciliği Motoru (Apriori Algoritması)
Sepet birliktelik analizlerini (Association Analysis) gerçekleştiren Apriori benzeri algoritmanın Python ile kodlanması. Ürün çiftlerinin destek (support) ve güven (confidence) oranlarının hesaplanması.

### 🔹 4. Hafta: React.js Dashboard Projesinin Başlatılması
Vite ve TypeScript kullanılarak React frontend projesinin kurulması. Tailwind CSS entegrasyonunun tamamlanarak modern dashboard tasarım iskeletinin oluşturulması.

### 🔹 5. Hafta: Frontend - Backend API Entegrasyonu
Veri madenciliği motorunun ürettiği sepet korelasyon yüzdelerini ve ürün listelerini frontend paneline çeken API entegrasyonunun tamamlanması.

### 🔹 6. Hafta (Vize): SQL Sorgu Optimasyonu
Büyük veri setleri üzerinde analiz hızını artırmak amacıyla database indeksleme işlemlerinin yapılması ve SQL sorgu performanslarının denetlenmesi.

### 🔹 7. Hafta: Bölgesel Analiz Modülü (Leaflet Harita)
Satışların coğrafi konumlara göre ayrıştırılması amacıyla Leaflet.js harita entegrasyonunun yapılması. Semt bazlı sipariş yoğunluk hotspot'larının (ısı haritası) geliştirilmesi.

### 🔹 8. Hafta: Hazır Sepet (Bundle) Önerici
Güven katsayısı %70'in üzerinde olan birbiriyle doğrudan ilişkili ürünlerin otomatik olarak "Fırsat Paketi (Bundle)" olarak gruplanması ve sepete %15 indirimle sunulma mantığının kodlanması.

### 🔹 9. Hafta: Gemini API Entegrasyonu
Birliktelik analizi verilerinin Gemini API'ye gönderilerek "X bölgesinde Y ürününü alanlar Z ürününü de alıyor, kampanya başlatılmalı" tarzında metinsel, profesyonel stratejik raporlar üreten AI modülünün entegrasyonu.

### 🔹 10. Hafta: İndirim Strateji Paneli
React panelinde düşük satış hacmine sahip semtler için dinamik ve kademeli indirim oranları hesaplayan ve yöneticilerin kampanyaları tek tıkla simüle etmesini sağlayan interaktif arayüzün kodlanması.

### 🔹 11. Hafta: Gelişmiş Veri Görselleştirme
Chart.js kullanılarak en çok sipariş alan ilk 8 semtin (Bar Chart) ve aktif mağaza zincirlerinin sepet paylaşımlarının (Doughnut Chart) görselleştirilmesi.

### 🔹 12. Hafta: Kullanıcı Kabul Testleri (UAT)
Sahte sepet verileri ve SKT (Son Kullanma Tarihi) uyarılı ürün varyasyonları üzerinden veri madenciliği motorunun doğruluğunu doğrulayan `uat_test.py` betiğinin yazılması.

### 🔹 13. Hafta: Sistem Stres Testi
Binlerce eşzamanlı analiz isteği altında sunucunun tepki süresini, CPU/RAM yükünü ve dayanıklılığını ölçen çok iş parçacıklı (multithreaded) `stress_test.py` performans aracının kodlanması.

### 🔹 14. Hafta: Proje Teslimi & Rapor Sunumu
Tüm projenin derlenmesi, gereksiz dosyaların temizlenmesi, GitHub reposunun güncellenmesi ve nihai proje raporunun (`README.md`) hazırlanarak teslim edilmesi.

---

## 🚀 Çalıştırma Talimatları

### 1. Backend Sunucusunu Başlatma
```bash
# Bağımlılıkları yükleyin
pip install -r requirements.txt

# Veritabanını göç ettirin ve mock verileri yükleyin
python manage.py migrate
python yukle.py

# Sunucuyu çalıştırın
python manage.py runserver
```

### 2. Frontend Panelini Başlatma
```bash
cd frontend
npm install
npm run dev
```

### 3. Mobil Uygulamayı Çalıştırma (Expo)
```bash
cd mobile
npm install
npx expo start
```

### 4. UAT ve Stres Testlerini Çalıştırma
```bash
# Kullanıcı Kabul Testleri (UAT)
python uat_test.py

# Sistem Stres Testi (Sunucu açıkken çalıştırılmalıdır)
python stress_test.py
```

---
*Bu proje **botankly** tarafından başarıyla tamamlanmış ve teslim edilmiştir.*
