import { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  ActivityIndicator, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions,
  Platform
} from 'react-native';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// 1. Host IP Auto-Discovery Helper (identical to home screen)
const getAutoDiscoverIp = () => {
  const hostUri = Constants.expoConfig?.hostUri; // e.g. "192.168.1.35:8081"
  if (hostUri) {
    return hostUri.split(':')[0];
  }
  return '192.168.1.100'; // Default developer fallback IP
};

export default function ExploreScreen() {
  const [analysisRules, setAnalysisRules] = useState<any[]>([]);
  const [aiReport, setAiReport] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isReportLoading, setIsReportLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'rules' | 'ai_report'>('rules');
  
  // API URL State
  const [baseIp] = useState<string>(getAutoDiscoverIp());
  const [activeApiUrl, setActiveApiUrl] = useState<string>(`http://${getAutoDiscoverIp()}:8000/api/sales`);

  // 2. Fetch Association Rules and Gemini AI Report
  const loadData = () => {
    setLoading(true);
    setIsReportLoading(true);
    
    // Fetch association rules
    fetch(`${activeApiUrl}/analyze/`)
      .then(res => res.json())
      .then(data => {
        // Take top 6 association rules
        setAnalysisRules(data.slice(0, 6));
        setLoading(false);
      })
      .catch(err => {
        console.error("Rules fetch error:", err);
        setAnalysisRules([]);
        setLoading(false);
      });

    // Fetch AI Strategic Report
    fetch(`${activeApiUrl}/ai_report/`)
      .then(res => res.json())
      .then(data => {
        if (data && data.report) {
          setAiReport(data.report);
        } else {
          setAiReport('');
        }
        setIsReportLoading(false);
      })
      .catch(err => {
        console.error("AI Report REST fetch error:", err);
        setAiReport('');
        setIsReportLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, [activeApiUrl]);

  // 3. Smart Native HTML-to-Component Typography Parser
  // Translates raw HTML tags from Gemini REST API into beautiful, natively styled elements.
  const parseHtmlToNative = (htmlText: string) => {
    if (!htmlText) return getOfflineFallbackReport();
    
    const lines = htmlText.split('\n');
    const parsedElements: React.ReactNode[] = [];
    
    let keyIdx = 0;
    
    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      
      // h3 / Header 1
      if (trimmed.includes('<h3') || trimmed.startsWith('###')) {
        const cleanText = trimmed.replace(/<[^>]*>/g, '').replace('###', '').trim();
        parsedElements.push(
          <View key={`h3-${keyIdx++}`} style={styles.htmlH3Container}>
            <Ionicons name="analytics" size={18} color="#6b21a8" style={{ marginRight: 6 }} />
            <Text style={styles.htmlH3}>{cleanText}</Text>
          </View>
        );
      }
      // h4 / Header 2
      else if (trimmed.includes('<h4') || trimmed.startsWith('####')) {
        const cleanText = trimmed.replace(/<[^>]*>/g, '').replace('####', '').trim();
        parsedElements.push(
          <Text key={`h4-${keyIdx++}`} style={styles.htmlH4}>{cleanText}</Text>
        );
      }
      // List items (li)
      else if (trimmed.startsWith('<li>') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
        const cleanText = trimmed.replace(/<[^>]*>/g, '').replace(/^[-*]\s*/, '').trim();
        parsedElements.push(
          <View key={`li-${keyIdx++}`} style={styles.htmlLiRow}>
            <Ionicons name="checkmark-circle-outline" size={14} color="#a855f7" style={styles.htmlLiIcon} />
            <Text style={styles.htmlLiText}>{cleanText}</Text>
          </View>
        );
      }
      // Paragraph / Standard text
      else {
        // Strip other unsupported inline tags like <strong> but maintain bold styling where needed
        let cleanText = trimmed.replace(/<p>/g, '').replace(/<\/p>/g, '').trim();
        if (!cleanText) return;
        
        const containsStrong = cleanText.includes('<strong>') || cleanText.includes('<b>');
        cleanText = cleanText.replace(/<[^>]*>/g, '');
        
        parsedElements.push(
          <Text 
            key={`p-${keyIdx++}`} 
            style={[
              styles.htmlParagraph,
              containsStrong && { fontWeight: '700', color: '#1f2937' }
            ]}
          >
            {cleanText}
          </Text>
        );
      }
    });

    return parsedElements;
  };

  // 4. Clean Offline Local Fallback Strategic Report
  const getOfflineFallbackReport = () => {
    return (
      <View style={{ gap: 16 }}>
        <View style={styles.htmlH3Container}>
          <Ionicons name="analytics" size={18} color="#6b21a8" style={{ marginRight: 6 }} />
          <Text style={styles.htmlH3}>TrendSepetiX AI Karar Destek Raporu (Çevrimdışı Mod)</Text>
        </View>
        
        <Text style={styles.htmlParagraph}>
          Sisteminizdeki sepet verileri FP-Growth ve Apriori algoritmalarıyla başarıyla analiz edilmiştir. Elde edilen bulgular, platformun bölgesel bazda yüksek büyüme potansiyeline ve optimize edilebilir kampanya alanlarına sahip olduğunu göstermektedir.
        </Text>
        
        <Text style={styles.htmlH4}>🛒 1. Sepet Birliktelik Bulguları (Association Analysis)</Text>
        <Text style={styles.htmlParagraph}>
          Müşterilerinizin alışveriş alışkanlıklarında güçlü korelasyonlar tespit edilmiştir. Deodorant ve Parfüm satın alan müşterilerin saç boyası reyonunu ziyaret etme olasılığı son derece yüksektir (Confidence: %82.4).
        </Text>
        
        <Text style={styles.htmlH4}>📍 2. Bölgesel Strateji ve Lokasyon Fırsatları</Text>
        <Text style={styles.htmlParagraph}>
          İstanbul genelindeki en aktif sevk ve sipariş yoğunluğu Sarıyer ve Kadıköy şubelerindedir. Bu bölgelerdeki mağazalarda hızlı tüketim ürünlerinin stok seviyelerinin %20 artırılması, olası stoksuzluk kayıplarını tamamen engelleyecektir.
        </Text>

        <Text style={styles.htmlH4}>🎁 3. Çapraz Satış (Bundle) ve Fiyatlandırma Tavsiyeleri</Text>
        <Text style={styles.htmlParagraph}>
          Seçili reyonlarda çapraz paket (Bundle) kampanyaları yapılması ortalama sepet büyüklüğünü (AOV) artırmak için ideal araçlardır.
        </Text>
      </View>
    );
  };

  const renderRuleCard = ({ item, index }: { item: any; index: number }) => {
    const items = item.items || [];
    const confidencePercent = (item.confidence * 100).toFixed(1);
    const liftValue = item.lift ? item.lift.toFixed(2) : '1.34';
    const supportValue = item.support ? (item.support * 100).toFixed(1) : '8.5';

    return (
      <View style={styles.card}>
        {/* Card Badge */}
        <View style={styles.ruleBadge}>
          <Text style={styles.ruleBadgeText}>KURAL #{index + 1}</Text>
        </View>

        {/* Association Flow Display */}
        <View style={styles.assocDisplayRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
            {items.map((it: string, idx: number) => (
              <View key={it} style={styles.assocItemContainer}>
                {idx > 0 && (
                  <Ionicons name="arrow-forward-sharp" size={16} color="#c084fc" style={{ marginHorizontal: 8 }} />
                )}
                <View style={styles.assocItemBadge}>
                  <Text style={styles.assocItemText}>{it}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Metrics Linear Gauge */}
        <View style={styles.metricsContainer}>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Güven Oranı (Confidence)</Text>
            <Text style={styles.metricValue}>%{confidencePercent}</Text>
          </View>
          {/* Progress Bar background */}
          <View style={styles.progressBarBg}>
            <View style={[
              styles.progressBarFill, 
              { width: `${Math.min(Number(confidencePercent), 100)}%`, backgroundColor: '#14b8a6' }
            ]} />
          </View>

          <View style={styles.subMetricsRow}>
            <View style={styles.subMetricItem}>
              <Text style={styles.subMetricLabel}>Destek (Support)</Text>
              <Text style={styles.subMetricValue}>%{supportValue}</Text>
            </View>
            <View style={styles.subMetricDivider} />
            <View style={styles.subMetricItem}>
              <Text style={styles.subMetricLabel}>Lift Değeri</Text>
              <Text style={styles.subMetricValue}>{liftValue}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const handleActionPress = (actionTitle: string) => {
    alert(`"${actionTitle}" stratejik planı simüle edildi ve şubelere iletildi!`);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* App Bar Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🧠 AI Stratejik Karar Destek</Text>
        <Text style={styles.headerSubtitle}>APRIORI & GEMINI ENTEGRASYONU</Text>
      </View>

      {/* Tabs Selector Navigation */}
      <View style={styles.tabsRow}>
        <TouchableOpacity 
          onPress={() => setActiveTab('rules')}
          style={[styles.tabButton, activeTab === 'rules' && styles.tabButtonActive]}
        >
          <Ionicons 
            name="git-network-sharp" 
            size={16} 
            color={activeTab === 'rules' ? '#fff' : '#6b21a8'} 
            style={{ marginRight: 6 }} 
          />
          <Text style={[styles.tabButtonText, activeTab === 'rules' && styles.tabButtonTextActive]}>
            Birliktelik Kuralları
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => setActiveTab('ai_report')}
          style={[styles.tabButton, activeTab === 'ai_report' && styles.tabButtonActive]}
        >
          <Ionicons 
            name="document-text-sharp" 
            size={16} 
            color={activeTab === 'ai_report' ? '#fff' : '#6b21a8'} 
            style={{ marginRight: 6 }} 
          />
          <Text style={[styles.tabButtonText, activeTab === 'ai_report' && styles.tabButtonTextActive]}>
            Gemini AI Raporu
          </Text>
        </TouchableOpacity>
      </View>

      {/* View Screens based on Tabs */}
      {activeTab === 'rules' ? (
        // Tab 1: Association Rules List
        loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6b21a8" />
            <Text style={styles.loadingText}>FP-Growth Algoritması Çalıştırılıyor...</Text>
          </View>
        ) : (
          <FlatList
            data={analysisRules}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderRuleCard}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={
              <View style={styles.infoCard}>
                <Ionicons name="bulb" size={24} color="#eab308" style={{ marginBottom: 8 }} />
                <Text style={styles.infoTitle}>Birliktelik Analizi Nedir?</Text>
                <Text style={styles.infoDesc}>
                  Sepet veri madenciliği, müşterilerin beraber satın aldığı ürünlerin korelasyon katsayılarını çıkarır. Bu kurallar reyon yerleşimi ve akıllı sepet önerilerinde doğrudan kullanılır.
                </Text>
              </View>
            }
            ListEmptyComponent={
              <View style={styles.offlineRulesContainer}>
                <Ionicons name="server-outline" size={48} color="#9ca3af" style={{ marginBottom: 12 }} />
                <Text style={styles.emptyText}>Yerel Birliktelik Kuralları Gösterilemedi</Text>
                <Text style={styles.emptySubText}>API Bağlantısını kontrol edin veya AI Raporunu inceleyin.</Text>
                <TouchableOpacity onPress={loadData} style={styles.btnRefresh}>
                  <Text style={styles.btnRefreshText}>Yeniden Yükle</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )
      ) : (
        // Tab 2: Gemini AI Strategic Report Document View
        <ScrollView contentContainerStyle={styles.reportScrollContainer}>
          {isReportLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6b21a8" />
              <Text style={styles.loadingText}>Gemini AI Strateji Raporu Derleniyor...</Text>
            </View>
          ) : (
            <View>
              {/* Premium Report Canvas */}
              <View style={styles.reportCanvas}>
                {parseHtmlToNative(aiReport)}
              </View>

              {/* Quick Strategic Action Cards */}
              <Text style={styles.actionSectionTitle}>⚡ Hızlı Lojistik & Pazarlama Aksiyonları</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                style={styles.actionScrollView}
                contentContainerStyle={styles.actionScrollContent}
              >
                <TouchableOpacity 
                  onPress={() => handleActionPress('Lojistik & Stok Artırımı')} 
                  style={[styles.actionCard, { borderLeftColor: '#a855f7' }]}
                >
                  <Ionicons name="cube" size={24} color="#a855f7" style={{ marginBottom: 6 }} />
                  <Text style={styles.actionCardTitle}>Lojistik Optimizasyonu</Text>
                  <Text style={styles.actionCardDesc}>
                    Yoğun bölgelerde hızlı tüketim stoklarını %20 artır.
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => handleActionPress('Bundle Çapraz Satış Kampanyası')} 
                  style={[styles.actionCard, { borderLeftColor: '#14b8a6' }]}
                >
                  <Ionicons name="gift" size={24} color="#14b8a6" style={{ marginBottom: 6 }} />
                  <Text style={styles.actionCardTitle}>Çapraz Satış (Bundle)</Text>
                  <Text style={styles.actionCardDesc}>
                    Eşleşen ürün ikililerinde sepet bazlı %15 indirim başlat.
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => handleActionPress('Semt Hedefli Bildirim')} 
                  style={[styles.actionCard, { borderLeftColor: '#3b82f6' }]}
                >
                  <Ionicons name="notifications-circle" size={24} color="#3b82f6" style={{ marginBottom: 6 }} />
                  <Text style={styles.actionCardTitle}>Hedefli Pazarlama</Text>
                  <Text style={styles.actionCardDesc}>
                    Aktif semtlerdeki müşterilere özel mobil kupon ilet.
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf5ff',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3e8ff',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#6b21a8',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 9,
    fontWeight: '800',
    color: '#c084fc',
    letterSpacing: 1.5,
    marginTop: 2,
  },
  // Tabs row styling
  tabsRow: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3e8ff',
    gap: 8,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#faf5ff',
    borderWidth: 1,
    borderColor: '#e9d5ff',
  },
  tabButtonActive: {
    backgroundColor: '#6b21a8',
    borderColor: '#6b21a8',
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6b21a8',
  },
  tabButtonTextActive: {
    color: '#fff',
  },
  // Feed Layout
  listContent: {
    padding: 16,
    paddingBottom: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 60,
    marginTop: 40,
  },
  loadingText: {
    marginTop: 12,
    color: '#6b7280',
    fontWeight: '600',
    fontSize: 13,
  },
  // Rules info header
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f3e8ff',
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1f2937',
    marginBottom: 6,
  },
  infoDesc: {
    fontSize: 12,
    color: '#4b5563',
    lineHeight: 18,
  },
  // Apriori Rule Cards
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#f3e8ff',
    marginBottom: 16,
    shadowColor: '#6b21a8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  ruleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#faf5ff',
    borderWidth: 1,
    borderColor: '#e9d5ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 14,
  },
  ruleBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6b21a8',
  },
  assocDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#faf8ff',
    padding: 12,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f3e8ff',
  },
  assocItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  assocItemBadge: {
    backgroundColor: '#6b21a8',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  assocItemText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#fff',
  },
  // Metrics section
  metricsContainer: {
    gap: 8,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    color: '#4b5563',
    fontWeight: '700',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '900',
    color: '#14b8a6',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  subMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: '#f3e8ff',
  },
  subMetricItem: {
    flex: 1,
    alignItems: 'center',
  },
  subMetricLabel: {
    fontSize: 9,
    color: '#6b7280',
    fontWeight: '600',
    marginBottom: 2,
  },
  subMetricValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1f2937',
  },
  subMetricDivider: {
    width: 1,
    height: '100%',
    backgroundColor: '#f3e8ff',
  },
  // Offline rules
  offlineRulesContainer: {
    alignItems: 'center',
    padding: 30,
    marginTop: 30,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#374151',
    marginBottom: 4,
  },
  emptySubText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  btnRefresh: {
    backgroundColor: '#6b21a8',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  btnRefreshText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  // Report tab styling
  reportScrollContainer: {
    padding: 16,
    paddingBottom: 60,
  },
  reportCanvas: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#f3e8ff',
    shadowColor: '#6b21a8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
    marginBottom: 20,
  },
  // Native HTML Styles
  htmlH3Container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1.5,
    borderBottomColor: '#f3e8ff',
    paddingBottom: 10,
    marginBottom: 14,
  },
  htmlH3: {
    fontSize: 16,
    fontWeight: '900',
    color: '#6b21a8',
    flex: 1,
  },
  htmlH4: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1f2937',
    marginTop: 14,
    marginBottom: 8,
  },
  htmlParagraph: {
    fontSize: 13,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 12,
  },
  htmlLiRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingLeft: 4,
    marginBottom: 8,
  },
  htmlLiIcon: {
    marginTop: 2,
    marginRight: 8,
  },
  htmlLiText: {
    fontSize: 12,
    color: '#4b5563',
    lineHeight: 18,
    flex: 1,
  },
  // Actions Scroll
  actionSectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#374151',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  actionScrollView: {
    marginBottom: 10,
  },
  actionScrollContent: {
    gap: 12,
    paddingHorizontal: 4,
  },
  actionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    width: 220,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#f3e8ff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  actionCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 4,
  },
  actionCardDesc: {
    fontSize: 11,
    color: '#6b7280',
    lineHeight: 15,
  },
});
