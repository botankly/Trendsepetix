import { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  ActivityIndicator, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  Modal, 
  KeyboardAvoidingView, 
  Platform, 
  Dimensions
} from 'react-native';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';

// Dimensions for responsive screens
const { width, height } = Dimensions.get('window');

// 1. Host IP Auto-Discovery Helper
const getAutoDiscoverIp = () => {
  const hostUri = Constants.expoConfig?.hostUri; // e.g. "192.168.1.35:8081"
  if (hostUri) {
    return hostUri.split(':')[0];
  }
  return '192.168.1.100'; // Default developer fallback IP
};

export default function HomeScreen() {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('Tümü');
  
  // IP / Server Configuration States
  const [customIp, setCustomIp] = useState<string>(getAutoDiscoverIp());
  const [customPort, setCustomPort] = useState<string>('8000');
  const [activeApiUrl, setActiveApiUrl] = useState<string>(`http://${getAutoDiscoverIp()}:8000/api/sales/`);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  
  // Modal states
  const [checkoutModalVisible, setCheckoutModalVisible] = useState(false);
  const [routeModalVisible, setRouteModalVisible] = useState(false);
  const [selectedBasket, setSelectedBasket] = useState<any>(null);
  
  // Checkout Form States
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [paying, setPaying] = useState(false);

  // 2. Load Sales & Health Check
  const loadData = (url: string) => {
    setLoading(true);
    setIsConnected(null);
    
    // Check backend status first
    const statusUrl = url.endsWith('/sales/') 
      ? url.replace('/sales/', '/sales/status/')
      : `${url}/status/`;

    fetch(statusUrl, { method: 'GET', headers: { 'Accept': 'application/json' } })
      .then(res => res.json())
      .then(data => {
        if (data.db === 'OK') {
          setIsConnected(true);
          // Load sales list
          return fetch(url);
        } else {
          throw new Error('Database is offline');
        }
      })
      .then(res => res && res.json())
      .then(data => {
        if (data) {
          setSales(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("API Connection error:", err);
        setIsConnected(false);
        setSales([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData(activeApiUrl);
  }, [activeApiUrl]);

  // 3. Category Helper Functions
  const categories = [
    { label: 'Tümü', key: 'Tümü', icon: 'apps-sharp' },
    { label: 'Gıda & Manav', key: 'Gıda', icon: 'fast-food' },
    { label: 'Temizlik', key: 'Temizlik', icon: 'sparkles' },
    { label: 'Elektronik', key: 'Teknoloji', icon: 'laptop-outline' },
    { label: 'Giyim', key: 'Giyim & Aksesuar', icon: 'shirt' },
    { label: 'Oyuncak', key: 'Hobi & Oyuncak', icon: 'game-controller' }
  ];

  // 4. Float-to-Top Sorting Logic
  // Baskets containing the selected category are elevated to the top, other baskets remain below.
  const getProcessedSales = () => {
    if (selectedCategory === 'Tümü') {
      return sales;
    }
    
    const matching: any[] = [];
    const nonMatching: any[] = [];

    sales.forEach(sale => {
      const hasMatchingProduct = sale.products.some((p: any) => {
        const cat = p.category || '';
        return cat.toLowerCase().includes(selectedCategory.toLowerCase());
      });

      if (hasMatchingProduct) {
        matching.push({ ...sale, isHighlighted: true });
      } else {
        nonMatching.push({ ...sale, isHighlighted: false });
      }
    });

    return [...matching, ...nonMatching];
  };

  const handleUpdateServer = () => {
    const cleanIp = customIp.trim();
    const cleanPort = customPort.trim();
    if (!cleanIp) return;
    const newUrl = `http://${cleanIp}:${cleanPort}/api/sales/`;
    setActiveApiUrl(newUrl);
    setIsSettingsOpen(false);
  };

  const openCheckout = (basket: any) => {
    setSelectedBasket(basket);
    setIsPaid(false);
    setCardNumber('');
    setCardHolder('');
    setExpiry('');
    setCvv('');
    setCheckoutModalVisible(true);
  };

  const handlePay = () => {
    if (!cardNumber || !cardHolder) {
      alert("Lütfen tüm alanları doldurun!");
      return;
    }
    setPaying(true);
    setTimeout(() => {
      setPaying(false);
      setIsPaid(true);
    }, 1500);
  };

  const openRoute = (basket: any) => {
    setSelectedBasket(basket);
    setRouteModalVisible(true);
  };

  const renderBasketItem = ({ item }: { item: any }) => {
    const products = item.products || [];
    
    // Dynamic Pricing Logic: Original Price vs Slashed Price
    const totalPrice = products.reduce((acc: number, p: any) => acc + parseFloat(p.price || 0), 0);
    const originalPrice = totalPrice * 1.15;
    
    const isHighlighted = item.isHighlighted;

    return (
      <View style={[
        styles.card,
        isHighlighted && styles.highlightedCard
      ]}>
        {isHighlighted && (
          <View style={styles.highlightBadge}>
            <Ionicons name="star" size={10} color="#fff" style={{ marginRight: 4 }} />
            <Text style={styles.highlightBadgeText}>Seçili Reyon Fırsatı</Text>
          </View>
        )}
        
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.cardTitle}>{item.shop_name}</Text>
            <View style={styles.locationContainer}>
              <Ionicons name="location-sharp" size={13} color="#6b21a8" style={{ marginRight: 3 }} />
              <Text style={styles.cardSubtitle}>{item.district}</Text>
            </View>
          </View>
          <View style={styles.priceBadgeContainer}>
            <Text style={styles.oldPriceText}>{originalPrice.toFixed(2)} TL</Text>
            <Text style={styles.newPriceText}>{totalPrice.toFixed(2)} TL</Text>
          </View>
        </View>

        {/* Product Visual Horizontal Strip */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.imageStrip}
          contentContainerStyle={styles.imageStripContent}
        >
          {products.map((p: any, idx: number) => (
            <View key={p.id || idx} style={styles.productVisualContainer}>
              <View style={styles.productAvatar}>
                <Ionicons name="cube-outline" size={24} color="#6b21a8" />
              </View>
              <Text style={styles.visualProductName} numberOfLines={1}>
                {p.name.split(' #')[0]}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* Dynamic Detail List */}
        <View style={styles.productsContainer}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="basket-outline" size={15} color="#4b5563" style={{ marginRight: 6 }} />
            <Text style={styles.sectionTitle}>Sepet İçeriği ve Stok Durumu</Text>
          </View>
          
          {products.map((p: any, idx: number) => {
            const cleanName = p.name.split(' #')[0];
            const variantNo = p.name.includes('#') ? `#${p.name.split('#')[1]}` : `#${idx + 1}`;
            return (
              <View key={p.id || idx} style={styles.productRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.productName}>
                    {cleanName} <Text style={{ color: '#c084fc', fontSize: 10 }}>{variantNo}</Text>
                  </Text>
                </View>
                <Text style={styles.productStock}>{p.stock || 25} Adet</Text>
              </View>
            );
          })}
        </View>

        {/* Bottom Recommendation Text */}
        <Text style={styles.recommendationText}>
          💡 {item.recommendation || "Bu sepet verimlilik analitiği algoritmalarıyla optimize edilmiştir."}
        </Text>

        {/* Interactive Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity onPress={() => openRoute(item)} style={styles.btnRoute}>
            <Ionicons name="map" size={16} color="#374151" style={{ marginRight: 6 }} />
            <Text style={styles.btnRouteText}>ROTA</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openCheckout(item)} style={styles.btnBuy}>
            <Ionicons name="bag-check" size={16} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.btnBuyText}>SATIN AL</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const processedSales = getProcessedSales();

  return (
    <SafeAreaView style={styles.container}>
      {/* 5. Custom App Bar */}
      <View style={styles.appBar}>
        <View style={styles.appTitleContainer}>
          <Text style={styles.appTitle}>TrendSepetiX</Text>
          <Text style={styles.appSubtitle}>MOBİL KARAR DESTEK</Text>
        </View>
        
        {/* Settings Toggle and Online Indicator */}
        <View style={styles.appBarActions}>
          <View style={[
            styles.connectionDot,
            isConnected === true && styles.onlineDot,
            isConnected === false && styles.offlineDot
          ]} />
          
          <TouchableOpacity 
            onPress={() => setIsSettingsOpen(!isSettingsOpen)} 
            style={styles.settingsBtn}
          >
            <Ionicons name={isSettingsOpen ? "close-circle" : "settings"} size={22} color="#6b21a8" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 6. Settings Box / Server Config Drawer */}
      {isSettingsOpen && (
        <View style={styles.settingsDrawer}>
          <Text style={styles.settingsTitle}>🔌 Django Server Bağlantı Ayarları</Text>
          <Text style={styles.settingsSubtitle}>
            Uygulamanın bilgisayarınızda çalışan Django backend API'sine bağlanması için yerel IP adresini girin:
          </Text>
          
          <View style={styles.inputRow}>
            <View style={{ flex: 3, marginRight: 8 }}>
              <Text style={styles.inputLabel}>Bilgisayar IP</Text>
              <TextInput 
                value={customIp}
                onChangeText={setCustomIp}
                placeholder="Örn: 192.168.1.35"
                style={styles.textInput}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Port</Text>
              <TextInput 
                value={customPort}
                onChangeText={setCustomPort}
                placeholder="8000"
                style={styles.textInput}
                keyboardType="numeric"
              />
            </View>
          </View>
          
          <View style={styles.settingsStatusRow}>
            <Text style={styles.currentUrlText}>
              Aktif: <Text style={{ fontWeight: '700' }}>{activeApiUrl}</Text>
            </Text>
            <TouchableOpacity onPress={handleUpdateServer} style={styles.btnSaveSettings}>
              <Text style={styles.btnSaveSettingsText}>Bağlan</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 7. Horizontal Categories Bar */}
      <View style={styles.categoriesBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.key;
            return (
              <TouchableOpacity 
                key={cat.key} 
                onPress={() => setSelectedCategory(cat.key)}
                style={[
                  styles.categoryPill,
                  isSelected && styles.categoryPillSelected
                ]}
              >
                <Ionicons 
                  name={cat.icon as any} 
                  size={14} 
                  color={isSelected ? '#fff' : '#6b21a8'} 
                  style={{ marginRight: 6 }} 
                />
                <Text style={[
                  styles.categoryLabel,
                  isSelected && styles.categoryLabelSelected
                ]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 8. Main Sales Feed Container */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6b21a8" />
          <Text style={styles.loadingText}>Karar Destek Verileri Alınıyor...</Text>
        </View>
      ) : isConnected === false ? (
        <View style={styles.offlineContainer}>
          <Ionicons name="wifi-outline" size={64} color="#ef4444" style={{ marginBottom: 16 }} />
          <Text style={styles.offlineTitle}>Server Bağlantısı Kurulamadı</Text>
          <Text style={styles.offlineDesc}>
            Django sunucusu çalışmıyor veya telefonunuzla bilgisayarınız aynı Wi-Fi ağına bağlı değil.
          </Text>
          <Text style={styles.offlineTip}>
            Üstteki mor çark simgesine tıklayarak bilgisayarınızın yerel IP adresini güncelleyebilirsiniz.
          </Text>
          <TouchableOpacity onPress={() => loadData(activeApiUrl)} style={styles.btnRetry}>
            <Text style={styles.btnRetryText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={processedSales}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderBasketItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Gösterilecek sepet bulunmamaktadır.</Text>
          }
        />
      )}

      {/* 9. Simulated Checkout Modal (Bottom Sheet style) */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={checkoutModalVisible}
        onRequestClose={() => setCheckoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            style={styles.bottomSheet}
          >
            {/* Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>🛍️ Güvenli Satın Alım</Text>
                <Text style={styles.modalSubtitle}>
                  {selectedBasket?.shop_name} - {selectedBasket?.district} Sepeti
                </Text>
              </View>
              <TouchableOpacity onPress={() => setCheckoutModalVisible(false)}>
                <Ionicons name="close-circle-sharp" size={26} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            {isPaid ? (
              // Success Screen
              <View style={styles.successContainer}>
                <Ionicons name="checkmark-circle" size={80} color="#10b981" style={{ marginBottom: 16 }} />
                <Text style={styles.successTitle}>Sipariş Başarıyla Alındı!</Text>
                <Text style={styles.successDesc}>
                  Sepetteki stoklar sizin adınıza rezerve edilmiştir. Mağazaya giderek ürünlerinizi teslim alabilirsiniz.
                </Text>
                <TouchableOpacity 
                  onPress={() => setCheckoutModalVisible(false)} 
                  style={[styles.btnPayAction, { backgroundColor: '#6b21a8', marginTop: 20 }]}
                >
                  <Text style={styles.btnPayActionText}>Kapat</Text>
                </TouchableOpacity>
              </View>
            ) : (
              // Payment Fields
              <ScrollView contentContainerStyle={styles.modalScroll}>
                <View style={styles.checkoutSummaryCard}>
                  <Text style={styles.summaryLabel}>TOPLAM ÖDENECEK TUTAR</Text>
                  <Text style={styles.summaryValue}>
                    {selectedBasket?.products?.reduce((acc: number, p: any) => acc + parseFloat(p.price), 0).toFixed(2)} TL
                  </Text>
                </View>

                <View style={styles.formContainer}>
                  <Text style={styles.formLabel}>Kart Sahibi</Text>
                  <TextInput 
                    value={cardHolder}
                    onChangeText={setCardHolder}
                    placeholder="Adı Soyadı"
                    style={styles.formInput}
                  />

                  <Text style={styles.formLabel}>Kart Numarası</Text>
                  <TextInput 
                    value={cardNumber}
                    onChangeText={setCardNumber}
                    placeholder="0000 0000 0000 0000"
                    style={styles.formInput}
                    keyboardType="numeric"
                    maxLength={16}
                  />

                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.formLabel}>S.K.T</Text>
                      <TextInput 
                        value={expiry}
                        onChangeText={setExpiry}
                        placeholder="AA/YY"
                        style={styles.formInput}
                        maxLength={5}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.formLabel}>CVV</Text>
                      <TextInput 
                        value={cvv}
                        onChangeText={setCvv}
                        placeholder="123"
                        style={styles.formInput}
                        keyboardType="numeric"
                        secureTextEntry
                        maxLength={3}
                      />
                    </View>
                  </View>

                  <TouchableOpacity 
                    onPress={handlePay} 
                    style={styles.btnPayAction}
                    disabled={paying}
                  >
                    {paying ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.btnPayActionText}>Ödemeyi Tamamla</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* 10. Simulated Route Modal (Bottom Sheet style) */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={routeModalVisible}
        onRequestClose={() => setRouteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheet}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>📍 Lokasyon & Navigasyon</Text>
                <Text style={styles.modalSubtitle}>
                  {selectedBasket?.shop_name} ({selectedBasket?.district} Şubesi)
                </Text>
              </View>
              <TouchableOpacity onPress={() => setRouteModalVisible(false)}>
                <Ionicons name="close-circle-sharp" size={26} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalScroll}>
              <View style={styles.mapGraphicMock}>
                <Ionicons name="navigate-circle" size={48} color="#6b21a8" />
                <Text style={styles.mapGraphicText}>NAVİGASYON HARİTASI (SİMÜLE)</Text>
                <View style={styles.mapDotsRow}>
                  <View style={styles.mapDotGreen} />
                  <View style={styles.mapLine} />
                  <View style={styles.mapDotRed} />
                </View>
                <Text style={styles.mapCoordinates}>
                  Hedef Koordinatlar: {selectedBasket?.lat?.toFixed(4)}, {selectedBasket?.lng?.toFixed(4)}
                </Text>
              </View>

              <View style={styles.navigationGuideCard}>
                <Text style={styles.guideTitle}>🧭 Akıllı Yol Tarifi ve Stok Rezervasyonu</Text>
                
                <View style={styles.guideStep}>
                  <Text style={styles.guideStepNo}>1</Text>
                  <Text style={styles.guideStepText}>
                    Uygulamamız şu anda bulunduğunuz konumdan en hızlı rotayı planladı.
                  </Text>
                </View>
                
                <View style={styles.guideStep}>
                  <Text style={styles.guideStepNo}>2</Text>
                  <Text style={styles.guideStepText}>
                    Şube ile aranızdaki tahmini mesafe: <Text style={{ fontWeight: '700', color: '#6b21a8' }}>4.8 km</Text> (Seyahat süresi: ~12 dk).
                  </Text>
                </View>

                <View style={styles.guideStep}>
                  <Text style={styles.guideStepNo}>3</Text>
                  <Text style={styles.guideStepText}>
                    Bu sepeti satın almanız halinde, şubedeki akıllı lojistik panelimiz rezerve edilen ürünlerinizi paketleme alanına transfer edecektir.
                  </Text>
                </View>
              </View>

              <TouchableOpacity 
                onPress={() => setRouteModalVisible(false)} 
                style={[styles.btnPayAction, { backgroundColor: '#374151' }]}
              >
                <Text style={styles.btnPayActionText}>Haritayı Kapat</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf5ff', // Premium soft purple background
  },
  // Custom App Bar
  appBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3e8ff',
  },
  appTitleContainer: {
    flexDirection: 'column',
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#6b21a8',
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 9,
    fontWeight: '700',
    color: '#a855f7',
    letterSpacing: 1,
  },
  appBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d1d5db',
    marginRight: 10,
  },
  onlineDot: {
    backgroundColor: '#10b981',
  },
  offlineDot: {
    backgroundColor: '#ef4444',
  },
  settingsBtn: {
    padding: 4,
  },
  // Settings Drawer
  settingsDrawer: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9d5ff',
  },
  settingsTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 6,
  },
  settingsSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 16,
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 10,
    color: '#6b21a8',
    fontWeight: '700',
    marginBottom: 4,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: '#faf5ff',
    borderWidth: 1,
    borderColor: '#e9d5ff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#1f2937',
  },
  settingsStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currentUrlText: {
    fontSize: 11,
    color: '#6b7280',
    flex: 1,
    marginRight: 8,
  },
  btnSaveSettings: {
    backgroundColor: '#6b21a8',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  btnSaveSettingsText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  // Horizontal Categories
  categoriesBar: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3e8ff',
  },
  categoriesScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#faf5ff',
    borderWidth: 1,
    borderColor: '#e9d5ff',
  },
  categoryPillSelected: {
    backgroundColor: '#6b21a8',
    borderColor: '#6b21a8',
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6b21a8',
  },
  categoryLabelSelected: {
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
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  offlineContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    marginTop: 40,
  },
  offlineTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1f2937',
    marginBottom: 8,
  },
  offlineDesc: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 8,
  },
  offlineTip: {
    fontSize: 11,
    color: '#a855f7',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 20,
    fontStyle: 'italic',
  },
  btnRetry: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  btnRetryText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    color: '#9ca3af',
    marginTop: 40,
  },
  // Basket Card Styling
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#6b21a8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1.5,
    borderColor: '#f3e8ff',
    position: 'relative',
    overflow: 'hidden',
  },
  highlightedCard: {
    borderColor: '#c084fc',
    shadowColor: '#c084fc',
    shadowOpacity: 0.15,
    borderWidth: 2,
    backgroundColor: '#faf5ff',
  },
  highlightBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#c084fc',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderBottomLeftRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  highlightBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    marginTop: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1f2937',
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardSubtitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6b21a8',
  },
  priceBadgeContainer: {
    alignItems: 'flex-end',
  },
  oldPriceText: {
    fontSize: 11,
    color: '#9ca3af',
    textDecorationLine: 'line-through',
    marginBottom: 2,
    fontWeight: '600',
  },
  newPriceText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#14b8a6', // Teal highlighted price
  },
  // Visual image strip
  imageStrip: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3e8ff',
    paddingBottom: 12,
  },
  imageStripContent: {
    gap: 12,
    paddingHorizontal: 2,
  },
  productVisualContainer: {
    alignItems: 'center',
    width: 65,
  },
  productAvatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#faf5ff',
    borderWidth: 1,
    borderColor: '#e9d5ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  visualProductName: {
    fontSize: 9,
    fontWeight: '600',
    color: '#6b7280',
    textAlign: 'center',
    width: '100%',
  },
  // Basket items detail
  productsContainer: {
    backgroundColor: '#faf8ff',
    padding: 12,
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#f3e8ff',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#4b5563',
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f3e8ff',
  },
  productName: {
    fontSize: 13,
    color: '#1f2937',
    fontWeight: '600',
  },
  productStock: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7c3aed',
  },
  recommendationText: {
    fontSize: 11,
    color: '#4b5563',
    lineHeight: 16,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  btnRoute: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  btnRouteText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#374151',
  },
  btnBuy: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#6b21a8',
    paddingVertical: 12,
    borderRadius: 14,
  },
  btnBuyText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#fff',
  },
  // Modal & Bottom Sheet styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 34,
    maxHeight: height * 0.85,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1f2937',
    marginBottom: 2,
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#6b21a8',
    fontWeight: '700',
  },
  modalScroll: {
    paddingBottom: 24,
  },
  // Checkout Summary
  checkoutSummaryCard: {
    backgroundColor: '#14b8a6',
    padding: 16,
    borderRadius: 18,
    alignItems: 'center',
    marginBottom: 20,
  },
  summaryLabel: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 26,
    fontWeight: '900',
    color: '#fff',
  },
  formContainer: {
    gap: 12,
  },
  formContainerCard: {
    gap: 12,
  },
  formLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 2,
  },
  formInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1f2937',
  },
  btnPayAction: {
    backgroundColor: '#14b8a6',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  btnPayActionText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 15,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#10b981',
    marginBottom: 10,
  },
  successDesc: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
  },
  // Route Map Graphics
  mapGraphicMock: {
    backgroundColor: '#faf5ff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e9d5ff',
  },
  mapGraphicText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6b21a8',
    marginTop: 10,
    letterSpacing: 0.5,
  },
  mapDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  mapDotGreen: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10b981',
  },
  mapLine: {
    width: 120,
    height: 2,
    backgroundColor: '#c084fc',
    borderStyle: 'dashed',
  },
  mapDotRed: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ef4444',
  },
  mapCoordinates: {
    fontSize: 10,
    color: '#6b7280',
  },
  navigationGuideCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f3e8ff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  guideTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 14,
  },
  guideStep: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  guideStepNo: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#f3e8ff',
    color: '#6b21a8',
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 18,
    marginRight: 10,
    marginTop: 1,
  },
  guideStepText: {
    flex: 1,
    fontSize: 12,
    color: '#4b5563',
    lineHeight: 16,
  },
});
