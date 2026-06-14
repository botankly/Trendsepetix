from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Product, Sale, Feedback
from .serializers import ProductSerializer, SaleSerializer, FeedbackSerializer
from .utils.analysis import get_associations

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    def get_queryset(self):
        queryset = Product.objects.all()
        category = self.request.query_params.get('category')
        limit = self.request.query_params.get('limit')
        
        if category and category != 'Tümü':
            # Map standard categories if needed
            mapped_cat = category
            if category == 'Gıda & Manav' or category == 'Gıda':
                mapped_cat = 'Gıda'
            elif category == 'Temizlik':
                mapped_cat = 'Temizlik'
            elif category == 'Elektronik' or category == 'Teknoloji':
                mapped_cat = 'Teknoloji'
            elif category == 'Giyim':
                mapped_cat = 'Giyim'
            elif category == 'Oyuncak':
                mapped_cat = 'Oyuncak'
            queryset = queryset.filter(category__icontains=mapped_cat)
            
        if self.request.query_params.get('all') == 'true':
            return queryset
            
        if limit:
            try:
                queryset = queryset[:int(limit)]
            except ValueError:
                pass
        else:
            queryset = queryset[:100] # Default limit to prevent massive payload sizes
            
        return queryset

class SaleViewSet(viewsets.ModelViewSet):
    queryset = Sale.objects.all().prefetch_related('products')
    serializer_class = SaleSerializer

    @action(detail=False, methods=['get'])
    def analyze(self, request):
        sales = self.get_queryset()
        analysis_results = get_associations(sales)
        return Response(analysis_results)

    @action(detail=False, methods=['get'])
    def ai_report(self, request):
        import os
        from django.db.models import Count
        
        sales = self.get_queryset()
        analysis_results = get_associations(sales)
        toplam_sepet_sayisi = sales.count()
        
        populer_semtler = Sale.objects.values('district').annotate(
            sayi=Count('id')).order_by('-sayi')
        en_aktif_semt = populer_semtler[0]['district'] if populer_semtler else "İstanbul"
        
        # En yüksek support'lu ilk 5 birlikteliği özetle
        associations_summary = ""
        if analysis_results:
            for i, assoc in enumerate(analysis_results[:5]):
                items_str = " + ".join(assoc['items'])
                associations_summary += f"{i+1}. {items_str} (Support: %{round(assoc['support']*100, 2)}, Confidence: %{round(assoc['confidence']*100, 2)}, Sepet Adedi: {assoc['count']})\n"
        else:
            associations_summary = "Henüz yeterli birliktelik kuralı tespit edilemedi."
            
        gemini_api_key = os.environ.get('GEMINI_API_KEY')
        ai_genel_rapor = ""
        
        prompt = f"""
        Sen TrendSepetiX e-ticaret analiz platformunun akıllı AI Strateji ve Veri Analitiği motorusun.
        Aşağıda sepet veri tabanımızdan Apriori / FP-Growth birliktelik analizi algoritmalarıyla çıkarılmış en yüksek ilişkili ürün birliktelikleri, aktif semtler ve sepet verileri bulunmaktadır:
        
        En Yüksek Ürün Birliktelikleri:
        {associations_summary}
        
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
            except Exception as gem_err:
                print(f"Gemini API REST çağrı hatası (google-genai): {gem_err}")
                
        if not ai_genel_rapor:
            # Fallback
            associations_summary_html = associations_summary.replace('\n', '<br>')
            ai_genel_rapor = f"""<h3 style="color:var(--primary); margin-top:0; font-size:1.4em; display:flex; align-items:center; gap:10px;"><i class="fas fa-chart-line"></i> TrendSepetiX AI Karar Destek Raporu (Çevrimdışı Analiz)</h3>
<p>Sistemdeki toplam <strong>{toplam_sepet_sayisi}</strong> sepet verisi FP-Growth ve Apriori algoritmalarıyla başarıyla analiz edilmiştir. Elde edilen bulgular, platformun bölgesel bazda yüksek büyüme potansiyeline ve optimize edilebilir kampanya alanlarına sahip olduğunu göstermektedir.</p>

<h4 style="color:var(--dark); margin-bottom:8px; font-size:1.1em;"><i class="fas fa-shopping-basket"></i> 1. Sepet Birliktelik Bulguları (Association Analysis)</h4>
<p>Veri madenciliği motorumuz, müşterilerin alışveriş alışkanlıklarında güçlü korelasyonlar tespit etmiştir. Özellikle en yüksek birliktelik oranına sahip ürünler:<br>
<strong>{associations_summary_html}</strong>
Bu durum, bu ürünlerin reyonlarda veya online katalogda yan yana listelenmesi durumunda satışları artıracağını kanıtlamaktadır.</p>

<h4 style="color:var(--dark); margin-bottom:8px; font-size:1.1em;"><i class="fas fa-map-marked-alt"></i> 2. Bölgesel Strateji ve Lokasyon Fırsatları</h4>
<p>En aktif satış bölgesi olan <strong>{en_aktif_semt}</strong> semtinde lojistik ve stok devir hızı en yüksek seviyemedir. Stok seviyelerinin optimize edilmesi stoksuzluk kayıplarını engelleyecektir.</p>"""

        return Response({"report": ai_genel_rapor})

    @action(detail=False, methods=['get'])
    def status(self, request):
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        return Response({"db": "OK", "sales_count": Sale.objects.count()})

class FeedbackViewSet(viewsets.ModelViewSet):
    queryset = Feedback.objects.all().order_by('-created_at')
    serializer_class = FeedbackSerializer
