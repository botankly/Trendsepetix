import { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ActivityIndicator, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  Modal, 
  KeyboardAvoidingView, 
  Platform, 
  Dimensions,
  Alert
} from 'react-native';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { storage } from '../utils/storage';

const { width, height } = Dimensions.get('window');

// Host IP Auto-Discovery Helper
const getAutoDiscoverIp = () => {
  const hostUri = Constants.expoConfig?.hostUri; // e.g. "192.168.1.35:8081"
  if (hostUri) {
    return hostUri.split(':')[0];
  }
  return '192.168.1.100'; // Default developer fallback IP
};

export default function HomeScreen() {
  const [sales, setSales] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('Tümü');
  
  // IP / Server Configuration States
  const [customIp, setCustomIp] = useState<string>(getAutoDiscoverIp());
  const [customPort, setCustomPort] = useState<string>('8000');
  const [activeApiUrl, setActiveApiUrl] = useState<string>(`http://${getAutoDiscoverIp()}:8000/api/sales/`);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  // Active Cart State (Local Shopping)
  const [cart, setCart] = useState<{ [key: number]: { product: any, quantity: number } }>({});
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Modals visibility states
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isCouponsOpen, setIsCouponsOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [isAiReportOpen, setIsAiReportOpen] = useState(false);
  const [routeModalVisible, setRouteModalVisible] = useState(false);
  const [checkoutModalVisible, setCheckoutModalVisible] = useState(false); // For recommended basket purchase

  const [aiReportText, setAiReportText] = useState('');
  const [loadingAiReport, setLoadingAiReport] = useState(false);

  const loadAiReport = () => {
    setLoadingAiReport(true);
    setIsAiReportOpen(true);
    const cleanHost = activeApiUrl.replace('/api/sales/', '').replace('/api/sales', '');
    fetch(`${cleanHost}/api/sales/ai_report/`)
      .then(res => res.json())
      .then(data => {
        setAiReportText(data.report || '');
        setLoadingAiReport(false);
      })
      .catch(err => {
        console.error("AI Report fetch error:", err);
        setAiReportText("AI raporu yüklenemedi. Sunucu çevrimdışı veya bir hata oluştu.");
        setLoadingAiReport(false);
      });
  };

  // Selected details
  const [selectedBasket, setSelectedBasket] = useState<any>(null);

  // User Profile form states
  const [profileName, setProfileName] = useState('Ahmet Yılmaz');
  const [profileEmail, setProfileEmail] = useState('ahmet@gmail.com');
  const [profilePhone, setProfilePhone] = useState('0555 123 4567');
  const [profileAddress, setProfileAddress] = useState('Beyoğlu, İstanbul');

  // Past Orders and Tracking states
  const [pastOrders, setPastOrders] = useState<any[]>([]);

  // Coupon application states in cart
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0); // percentage or flat
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash' | 'wallet'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [paying, setPaying] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [orderSuccessId, setOrderSuccessId] = useState('');

  // 1. Fetch Sales (Baskets) & Products
  const loadData = (url: string) => {
    setLoading(true);
    setIsConnected(null);
    
    const cleanHost = url.replace('/api/sales/', '').replace('/api/sales', '');
    const statusUrl = `${cleanHost}/api/sales/status/`;
    const salesUrl = `${cleanHost}/api/sales/`;
    const productsUrl = `${cleanHost}/api/products/?limit=50`;

    fetch(statusUrl, { method: 'GET', headers: { 'Accept': 'application/json' } })
      .then(res => res.json())
      .then(data => {
        if (data.db === 'OK') {
          setIsConnected(true);
          return Promise.all([
            fetch(salesUrl).then(res => res.json()),
            fetch(productsUrl).then(res => res.json())
          ]);
        } else {
          throw new Error('Database is offline');
        }
      })
      .then(([salesData, productsData]) => {
        if (salesData) setSales(salesData);
        if (productsData) setProducts(productsData);
        setLoading(false);
      })
      .catch(err => {
        console.error("API Connection error:", err);
        setIsConnected(false);
        setSales([]);
        setProducts([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData(activeApiUrl);

    // Load User Profile and Past Orders from Storage
    storage.getItem('userProfile').then(val => {
      if (val) {
        const parsed = JSON.parse(val);
        setProfileName(parsed.name || 'Ahmet Yılmaz');
        setProfileEmail(parsed.email || 'ahmet@gmail.com');
        setProfilePhone(parsed.phone || '0555 123 4567');
        setProfileAddress(parsed.address || 'Beyoğlu, İstanbul');
      }
    });

    storage.getItem('pastOrders').then(val => {
      if (val) {
        setPastOrders(JSON.parse(val));
      } else {
        // Prepopulate with mock data if empty
        const initialMock = [
          {
            id: 'TS-9831',
            shop_name: 'H&M',
            district: 'Beyoğlu',
            price: 7278.56,
            date: '13.06.2026',
            status: 'Teslim Edildi',
            products: [
              { name: 'Chino Pantolon', price: 1200 },
              { name: 'Deri Bot', price: 2500 }
            ]
          }
        ];
        setPastOrders(initialMock);
        storage.setItem('pastOrders', JSON.stringify(initialMock));
      }
    });
  }, [activeApiUrl]);

  // Save User Profile Helper
  const handleSaveProfile = async () => {
    const profile = { name: profileName, email: profileEmail, phone: profilePhone, address: profileAddress };
    await storage.setItem('userProfile', JSON.stringify(profile));
    Alert.alert('Başarılı', 'Profil bilgileriniz kaydedildi.');
    setIsProfileOpen(false);
  };

  // Helper to apply coupon
  const handleApplyCoupon = (code: string) => {
    const c = code.trim().toUpperCase();
    if (c === 'TREND10') {
      setAppliedDiscount(10); // 10%
      setAppliedCoupon('TREND10');
      Alert.alert('Başarılı', 'TREND10 kuponu uygulandı (%10 İndirim).');
    } else if (c === 'TRENDSEPETIX25') {
      setAppliedDiscount(25); // 25%
      setAppliedCoupon('TRENDSEPETIX25');
      Alert.alert('Başarılı', 'TRENDSEPETIX25 kuponu uygulandı (%25 İndirim).');
    } else if (c === 'HOŞGELDİN50') {
      setAppliedDiscount(50); // 50%
      setAppliedCoupon('HOŞGELDİN50');
      Alert.alert('Başarılı', 'HOŞGELDİN50 kuponu uygulandı (%50 İndirim).');
    } else {
      Alert.alert('Hata', 'Geçersiz kupon kodu.');
    }
  };

  // Add Item to Cart
  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev[product.id];
      if (existing) {
        return {
          ...prev,
          [product.id]: {
            ...existing,
            quantity: existing.quantity + 1
          }
        };
      } else {
        return {
          ...prev,
          [product.id]: {
            product,
            quantity: 1
          }
        };
      }
    });
  };

  // Remove / Decrement Item from Cart
  const removeFromCart = (productId: number) => {
    setCart(prev => {
      const existing = prev[productId];
      if (!existing) return prev;
      if (existing.quantity <= 1) {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      } else {
        return {
          ...prev,
          [productId]: {
            ...existing,
            quantity: existing.quantity - 1
          }
        };
      }
    });
  };

  // Checkouts & Order Placement
  const handlePay = () => {
    if (paymentMethod === 'card' && (!cardNumber || !cardHolder)) {
      Alert.alert("Hata", "Lütfen kart bilgilerini doldurun!");
      return;
    }
    setPaying(true);
    setTimeout(() => {
      const newOrderId = `TS-${Math.floor(1000 + Math.random() * 9000)}`;
      const newOrderDate = new Date().toLocaleDateString('tr-TR');
      
      // Calculate final price
      let orderProducts: any[] = [];
      let shopName = 'Karma Sepet';
      let totalAmount = 0;

      if (selectedBasket) {
        // AI recommended basket checkout
        shopName = selectedBasket.shop_name;
        orderProducts = selectedBasket.products.map((p: any) => ({ name: p.name, price: p.price }));
        totalAmount = orderProducts.reduce((acc, p) => acc + parseFloat(p.price), 0);
      } else {
        // Custom cart checkout
        const cartItems = Object.values(cart);
        orderProducts = cartItems.map(item => ({ name: item.product.name, price: item.product.price }));
        const subtotal = cartItems.reduce((acc, item) => acc + (parseFloat(item.product.price) * item.quantity), 0);
        totalAmount = subtotal * (1 - appliedDiscount / 100);
        shopName = cartItems[0]?.product?.category || 'Genel Alışveriş';
      }

      const newOrder = {
        id: newOrderId,
        shop_name: shopName,
        district: selectedBasket?.district || 'Adrese Teslim',
        price: parseFloat(totalAmount.toFixed(2)),
        date: newOrderDate,
        status: 'Hazırlanıyor',
        products: orderProducts
      };

      const updatedOrders = [newOrder, ...pastOrders];
      setPastOrders(updatedOrders);
      storage.setItem('pastOrders', JSON.stringify(updatedOrders));

      setPaying(false);
      setIsPaid(true);
      setOrderSuccessId(newOrderId);
      setCart({}); // clear cart on success
    }, 1500);
  };

  // Opening Modals
  const openCheckout = (basket: any) => {
    setSelectedBasket(basket);
    setIsPaid(false);
    setCardNumber('');
    setCardHolder('');
    setExpiry('');
    setCvv('');
    setCheckoutModalVisible(true);
  };

  const openRoute = (basket: any) => {
    setSelectedBasket(basket);
    setRouteModalVisible(true);
  };

  // Dynamic filter lists
  const getFilteredProducts = () => {
    if (selectedCategory === 'Tümü') {
      return products.slice(0, 30);
    }
    const filtered = products.filter(p => {
      const cat = p.category || '';
      return cat.toLowerCase().includes(selectedCategory.toLowerCase());
    });
    return filtered.slice(0, 30);
  };

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

  // Cart total calculations
  const cartItems = Object.values(cart);
  const cartSubtotal = cartItems.reduce((acc, item) => acc + (parseFloat(item.product.price) * item.quantity), 0);
  const cartTotal = cartSubtotal * (1 - appliedDiscount / 100);

  // Category details
  const categories = [
    { label: 'Tümü', key: 'Tümü', icon: 'apps-sharp' },
    { label: 'Gıda & Manav', key: 'Gıda', icon: 'fast-food' },
    { label: 'Temizlik', key: 'Temizlik', icon: 'sparkles' },
    { label: 'Elektronik', key: 'Teknoloji', icon: 'laptop-outline' },
    { label: 'Giyim', key: 'Giyim & Aksesuar', icon: 'shirt' },
    { label: 'Oyuncak', key: 'Hobi & Oyuncak', icon: 'game-controller' }
  ];

  const renderBasketItem = (item: any) => {
    const products = item.products || [];
    const totalPrice = products.reduce((acc: number, p: any) => acc + parseFloat(p.price || 0), 0);
    const originalPrice = totalPrice * 1.15;
    const isHighlighted = item.isHighlighted;

    return (
      <View key={item.id} style={[styles.card, isHighlighted && styles.highlightedCard]}>
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={{ flex: 1, marginRight: 4 }}>
            <Text style={styles.cardTitle}>{item.shop_name}</Text>
            <View style={styles.locationContainer}>
              <Ionicons name="location-sharp" size={12} color="#6b21a8" style={{ marginRight: 2 }} />
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
                <Ionicons name="cube-outline" size={20} color="#6b21a8" />
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
            <Ionicons name="basket-outline" size={13} color="#4b5563" style={{ marginRight: 4 }} />
            <Text style={styles.sectionTitle}>Sepet İçeriği ve Stok Durumu</Text>
          </View>
          
          {products.map((p: any, idx: number) => {
            const cleanName = p.name.split(' #')[0];
            const variantNo = p.name.includes('#') ? `#${p.name.split('#')[1]}` : `#${idx + 1}`;
            return (
              <View key={p.id || idx} style={styles.productRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.productName}>
                    {cleanName} <Text style={{ color: '#c084fc', fontSize: 9 }}>{variantNo}</Text>
                  </Text>
                </View>
                <Text style={styles.productStock}>{p.stock || 10} Adet</Text>
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
            <Ionicons name="map" size={14} color="#374151" style={{ marginRight: 4 }} />
            <Text style={styles.btnRouteText}>ROTA</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openCheckout(item)} style={styles.btnBuy}>
            <Ionicons name="bag-check" size={14} color="#fff" style={{ marginRight: 4 }} />
            <Text style={styles.btnBuyText}>AL</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 1. Header (App Bar) */}
      <View style={styles.appBar}>
        <View style={styles.appTitleContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="rocket-sharp" size={22} color="#7c3aed" style={{ marginRight: 6 }} />
            <Text style={styles.appTitle}>TrendSepetiX</Text>
          </View>
          <Text style={[styles.appSubtitle, { fontSize: 8, color: '#64748b', letterSpacing: 0.2, textTransform: 'none', fontWeight: '500' }]}>
            Yapay Zeka Destekli Perakende Analiz Paneli
          </Text>
        </View>
        <View style={styles.appBarActions}>
          <TouchableOpacity onPress={() => setIsProfileOpen(true)} style={styles.headerProfileBtn}>
            <Ionicons name="person" size={12} color="#fff" style={{ marginRight: 4 }} />
            <Text style={styles.headerProfileBtnText}>PROFİLİM</Text>
          </TouchableOpacity>
          <View style={[
            styles.connectionDot,
            isConnected === true && styles.onlineDot,
            isConnected === false && styles.offlineDot
          ]} />
          <TouchableOpacity onPress={() => setIsSettingsOpen(!isSettingsOpen)} style={styles.settingsBtn}>
            <Ionicons name={isSettingsOpen ? "close-circle" : "settings"} size={18} color="#7c3aed" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Django Server Settings drawer */}
      {isSettingsOpen && (
        <View style={styles.settingsDrawer}>
          <Text style={styles.settingsTitle}>🔌 Django Server Bağlantı Ayarları</Text>
          <View style={styles.inputRow}>
            <View style={{ flex: 3, marginRight: 8 }}>
              <TextInput value={customIp} onChangeText={setCustomIp} placeholder="Bilgisayar IP" style={styles.textInput} keyboardType="numeric" />
            </View>
            <View style={{ flex: 1 }}>
              <TextInput value={customPort} onChangeText={setCustomPort} placeholder="8000" style={styles.textInput} keyboardType="numeric" />
            </View>
          </View>
          <View style={styles.settingsStatusRow}>
            <Text style={styles.currentUrlText} numberOfLines={1}>Aktif: {activeApiUrl}</Text>
            <TouchableOpacity onPress={handleUpdateServer} style={styles.btnSaveSettings}>
              <Text style={styles.btnSaveSettingsText}>Bağlan</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 2. Yatay Dinamik Butonlar */}
      <View style={styles.topNavBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.topNavScroll}>
          <TouchableOpacity onPress={loadAiReport} style={[styles.topNavPill, { backgroundColor: '#818cf8', borderColor: '#6366f1' }]}>
            <Ionicons name="analytics" size={14} color="#fff" style={{ marginRight: 6 }} />
            <Text style={[styles.topNavLabel, { color: '#fff' }]}>AI ANALİZ RAPORUNU GÖRÜNTÜLE</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsHistoryOpen(true)} style={[styles.topNavPill, { backgroundColor: '#4b5563', borderColor: '#374151' }]}>
            <Ionicons name="time" size={14} color="#fff" style={{ marginRight: 6 }} />
            <Text style={[styles.topNavLabel, { color: '#fff' }]}>GEÇMİŞ SİPARİŞLERİM</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsCouponsOpen(true)} style={[styles.topNavPill, { backgroundColor: '#f08a5d', borderColor: '#e2723b' }]}>
            <Ionicons name="pricetag" size={14} color="#fff" style={{ marginRight: 6 }} />
            <Text style={[styles.topNavLabel, { color: '#fff' }]}>KUPONLARIM</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsTrackingOpen(true)} style={[styles.topNavPill, { backgroundColor: '#10b981', borderColor: '#059669' }]}>
            <Ionicons name="location" size={14} color="#fff" style={{ marginRight: 6 }} />
            <Text style={[styles.topNavLabel, { color: '#fff' }]}>SİPARİŞ TAKİBİ</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* 3. Yatay Kategoriler Bar */}
      <View style={styles.categoriesBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.key;
            return (
              <TouchableOpacity key={cat.key} onPress={() => setSelectedCategory(cat.key)} style={[styles.categoryPill, isSelected && styles.categoryPillSelected]}>
                <Ionicons name={cat.icon as any} size={14} color={isSelected ? '#fff' : '#6b21a8'} style={{ marginRight: 6 }} />
                <Text style={[styles.categoryLabel, isSelected && styles.categoryLabelSelected]}>{cat.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 4. Yan Yana İki Sütun İçeriği */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6b21a8" />
          <Text style={styles.loadingText}>Veriler Alınıyor...</Text>
        </View>
      ) : isConnected === false ? (
        <View style={styles.offlineContainer}>
          <Ionicons name="wifi-outline" size={64} color="#ef4444" style={{ marginBottom: 16 }} />
          <Text style={styles.offlineTitle}>Server Bağlantısı Kurulamadı</Text>
          <Text style={styles.offlineDesc}>Django sunucusu çalışmıyor veya IP adresi hatalı.</Text>
          <TouchableOpacity onPress={() => loadData(activeApiUrl)} style={styles.btnRetry}>
            <Text style={styles.btnRetryText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.feedScroll} contentContainerStyle={styles.feedContent}>
          {/* A. EN ÇOK TERCİH EDİLENLER */}
          <View style={styles.featuredSectionCard}>
            <View style={styles.featuredHeaderRow}>
              <Text style={styles.featuredSectionTitle}>📈 En Çok Tercih Edilenler</Text>
              <View style={styles.hotBadge}>
                <Text style={styles.hotBadgeText}>BU HAFTA POPÜLER</Text>
              </View>
            </View>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featuredProductsScroll}>
              {[
                { id: 991, name: 'Slim Fit Gömlek', price: '1174.32', oldPrice: '1350.47', image: 'shirt-outline' },
                { id: 992, name: 'Yün Atkı', price: '517.87', oldPrice: '595.55', image: 'ribbon-outline' },
                { id: 993, name: 'Drone', price: '25807.56', oldPrice: '29678.69', image: 'airplane-outline' },
              ].map((p) => (
                <View key={p.id} style={styles.featuredProductItem}>
                  <View style={styles.featuredProductAvatar}>
                    <Ionicons name={p.image as any} size={24} color="#7c3aed" />
                  </View>
                  <Text style={styles.featuredProductName} numberOfLines={1}>{p.name}</Text>
                  <Text style={styles.featuredProductOldPrice}>{p.oldPrice} TL</Text>
                  <Text style={styles.featuredProductPrice}>{p.price} TL</Text>
                  <TouchableOpacity onPress={() => addToCart({ id: p.id, name: p.name, price: p.price, category: 'Giyim' })} style={styles.btnFeaturedAdd}>
                    <Ionicons name="add-circle" size={10} color="#fff" style={{ marginRight: 2 }} />
                    <Text style={styles.btnFeaturedAddText}>Sepete Ekle</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
            <Text style={styles.featuredFooterText}>
              *Haftalık sipariş verilerine göre en çok satılan ürünlerdir. Altlarındaki butonları kullanarak sepetinize ekleyebilirsiniz!
            </Text>
          </View>

          {/* B. EN ÇOK SATAN FIRSAT SEPETİ */}
          <View style={styles.featuredSectionCard}>
            <View style={styles.featuredHeaderRow}>
              <Text style={styles.featuredSectionTitle}>🛍️ En Çok Satan Fırsat Sepeti</Text>
              <View style={[styles.hotBadge, { backgroundColor: '#10b981' }]}>
                <Text style={styles.hotBadgeText}>%15 BİRLİKTE AL İNDİRİMİ</Text>
              </View>
            </View>

            <View style={styles.opportunityRow}>
              <View style={styles.opportunityProduct}>
                <View style={styles.opportunityProductAvatar}>
                  <Ionicons name="shirt-outline" size={20} color="#0d9488" />
                </View>
                <Text style={styles.opportunityProductName}>Pamuklu Eşofman</Text>
                <Text style={styles.opportunityProductPrice}>1498.98 TL</Text>
              </View>

              <Text style={styles.plusSign}>+</Text>

              <View style={styles.opportunityProduct}>
                <View style={styles.opportunityProductAvatar}>
                  <Ionicons name="shirt" size={20} color="#0d9488" />
                </View>
                <Text style={styles.opportunityProductName}>Slim Fit Gömlek</Text>
                <Text style={styles.opportunityProductPrice}>1213.94 TL</Text>
              </View>
            </View>

            <View style={styles.opportunityFooter}>
              <Text style={styles.opportunityCountText}>Bu hafta 14 kez birlikte satın alındı!</Text>
              <View style={styles.opportunityPrices}>
                <Text style={styles.opportunityOldPrice}>2712.92 TL</Text>
                <Text style={styles.opportunityNewPrice}>2305.98 TL</Text>
              </View>
            </View>

            <View style={styles.opportunityActions}>
              <TouchableOpacity 
                onPress={() => {
                  addToCart({ id: 981, name: 'Pamuklu Eşofman', price: '1498.98', category: 'Giyim' });
                  addToCart({ id: 991, name: 'Slim Fit Gömlek', price: '1213.94', category: 'Giyim' });
                  Alert.alert("Başarılı", "Fırsat sepeti ürünleri sepetinize eklendi!");
                }} 
                style={styles.opportunityBtnAdd}
              >
                <Ionicons name="cart" size={12} color="#fff" style={{ marginRight: 4 }} />
                <Text style={styles.opportunityBtnAddText}>SEPETE EKLE</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => {
                  const opportunityBasket = {
                    shop_name: 'Fırsat Sepeti',
                    district: 'Merkez Şube',
                    products: [
                      { id: 981, name: 'Pamuklu Eşofman', price: '1498.98' },
                      { id: 991, name: 'Slim Fit Gömlek', price: '1213.94' }
                    ]
                  };
                  openCheckout(opportunityBasket);
                }} 
                style={styles.opportunityBtnBuy}
              >
                <Ionicons name="flash" size={12} color="#fff" style={{ marginRight: 4 }} />
                <Text style={styles.opportunityBtnBuyText}>HEMEN SATIN AL</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* C. AI PİYASA ÖNGÖRÜSÜ */}
          <View style={styles.aiPredictionWidget}>
            <Ionicons name="flash" size={14} color="#facc15" style={{ marginRight: 6 }} />
            <Text style={styles.aiPredictionText}>
              <Text style={{ fontWeight: '900', color: '#60a5fa' }}>AI PİYASA ÖNGÖRÜSÜ: </Text>
              Bölgesel verilere göre un ve şeker talebinde %30 artış var, stok yapılması önerilir.
            </Text>
          </View>

          {/* SÜTUNLAR YAPISI */}
          <View style={styles.columnsContainer}>
            {/* SOL SÜTUN: TÜM ÜRÜNLER */}
            <View style={styles.column}>
              <View style={styles.columnHeaderCard}>
                <Ionicons name="list-sharp" size={14} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.columnHeaderTitle}>TÜM ÜRÜNLER</Text>
              </View>
              {getFilteredProducts().length === 0 ? (
                <Text style={styles.emptyColText}>Ürün bulunamadı.</Text>
              ) : (
                getFilteredProducts().map((product) => (
                  <View key={product.id} style={styles.productCard}>
                    <View style={styles.productCardLeft}>
                      <View style={styles.productAvatarSmall}>
                        <Ionicons name="cube-outline" size={18} color="#7c3aed" />
                      </View>
                      <View style={styles.productInfoSmall}>
                        <Text style={styles.productNameSmall} numberOfLines={1}>{product.name}</Text>
                        <Text style={styles.productPriceSmall}>{parseFloat(product.price).toFixed(2)} TL</Text>
                      </View>
                    </View>
                    <TouchableOpacity onPress={() => addToCart(product)} style={[styles.btnAddSmall, { backgroundColor: '#10b981' }]}>
                      <Ionicons name="add" size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>

            {/* SAĞ SÜTUN: AKILLI SEPETLER */}
            <View style={styles.column}>
              <View style={[styles.columnHeaderCard, { backgroundColor: '#7c3aed' }]}>
                <Ionicons name="sparkles" size={14} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.columnHeaderTitle}>AKILLI SEPETLER</Text>
              </View>
              {getProcessedSales().length === 0 ? (
                <Text style={styles.emptyColText}>Sepet bulunamadı.</Text>
              ) : (
                getProcessedSales().map((basket) => renderBasketItem(basket))
              )}
            </View>
          </View>
        </ScrollView>
      )}

      {/* 5. Yüzen Sepetim Butonu */}
      {cartItems.length > 0 && (
        <TouchableOpacity onPress={() => { setIsCartOpen(true); setIsPaid(false); setSelectedBasket(null); }} style={styles.floatingCartBtn}>
          <Ionicons name="basket" size={18} color="#fff" style={{ marginRight: 6 }} />
          <Text style={styles.floatingCartText}>Özel Sepetim ({cartItems.reduce((acc, item) => acc + item.quantity, 0)})</Text>
        </TouchableOpacity>
      )}

      {/* MODAL 1: PROFIL MODALI */}
      <Modal visible={isProfileOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.bottomSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>👤 Profil Bilgilerim</Text>
              <TouchableOpacity onPress={() => setIsProfileOpen(false)}>
                <Ionicons name="close-circle-sharp" size={24} color="#9ca3af" />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.modalScroll}>
              <Text style={styles.formLabel}>Ad Soyad</Text>
              <TextInput value={profileName} onChangeText={setProfileName} style={styles.formInput} />
              
              <Text style={styles.formLabel}>E-posta</Text>
              <TextInput value={profileEmail} onChangeText={setProfileEmail} style={styles.formInput} keyboardType="email-address" />
              
              <Text style={styles.formLabel}>Telefon</Text>
              <TextInput value={profilePhone} onChangeText={setProfilePhone} style={styles.formInput} keyboardType="phone-pad" />
              
              <Text style={styles.formLabel}>Teslimat Adresi</Text>
              <TextInput value={profileAddress} onChangeText={setProfileAddress} style={styles.formInput} multiline numberOfLines={3} />
              
              <TouchableOpacity onPress={handleSaveProfile} style={styles.btnPayAction}>
                <Text style={styles.btnPayActionText}>Bilgileri Kaydet</Text>
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* MODAL 2: GEÇMİŞ SİPARİŞLERİM MODALI */}
      <Modal visible={isHistoryOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>📜 Geçmiş Siparişlerim</Text>
              <TouchableOpacity onPress={() => setIsHistoryOpen(false)}>
                <Ionicons name="close-circle-sharp" size={24} color="#9ca3af" />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.modalScroll}>
              {pastOrders.length === 0 ? (
                <Text style={styles.emptyText}>Henüz siparişiniz bulunmamaktadır.</Text>
              ) : (
                pastOrders.map((order, idx) => (
                  <View key={order.id || idx} style={styles.orderHistoryCard}>
                    <View style={styles.orderHistoryHeader}>
                      <Text style={styles.orderHistoryId}>{order.id} ({order.date})</Text>
                      <Text style={[styles.orderHistoryStatus, order.status === 'Teslim Edildi' ? styles.statusGreen : styles.statusOrange]}>{order.status}</Text>
                    </View>
                    <Text style={styles.orderHistoryShop}>{order.shop_name} - {order.district}</Text>
                    <View style={styles.orderHistoryItems}>
                      {order.products?.map((p: any, pIdx: number) => (
                        <Text key={pIdx} style={styles.orderHistoryItemText}>• {p.name} ({parseFloat(p.price).toFixed(2)} TL)</Text>
                      ))}
                    </View>
                    <Text style={styles.orderHistoryTotal}>Toplam: {order.price.toFixed(2)} TL</Text>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL 3: KUPONLARIM MODALI */}
      <Modal visible={isCouponsOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🎟️ Aktif Kuponlarım</Text>
              <TouchableOpacity onPress={() => setIsCouponsOpen(false)}>
                <Ionicons name="close-circle-sharp" size={24} color="#9ca3af" />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.modalScroll}>
              {[
                { code: 'TREND10', desc: 'Tüm sepetlerde %10 indirim kazanın!', value: '10%' },
                { code: 'TRENDSEPETIX25', desc: 'Analiz şölenine özel %25 indirim!', value: '25%' },
                { code: 'HOŞGELDİN50', desc: 'Yeni üyelere özel ilk siparişte %50 indirim!', value: '50%' }
              ].map((coupon) => (
                <View key={coupon.code} style={styles.couponCard}>
                  <View style={styles.couponHeader}>
                    <Text style={styles.couponCodeText}>{coupon.code}</Text>
                    <Text style={{fontSize: 14, fontWeight: '900', color: '#10b981'}}>{coupon.value}</Text>
                  </View>
                  <Text style={styles.couponDesc}>{coupon.desc}</Text>
                  <TouchableOpacity onPress={() => { handleApplyCoupon(coupon.code); setIsCouponsOpen(false); }} style={styles.couponApplyBtn}>
                    <Text style={styles.couponApplyBtnText}>Sepete Uygula</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL 4: SIPARIS TAKIBI MODALI */}
      <Modal visible={isTrackingOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🧭 Sipariş Takibi</Text>
              <TouchableOpacity onPress={() => setIsTrackingOpen(false)}>
                <Ionicons name="close-circle-sharp" size={24} color="#9ca3af" />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.modalScroll}>
              {pastOrders.filter(o => o.status !== 'Teslim Edildi').length === 0 ? (
                <View style={styles.successContainer}>
                  <Ionicons name="checkmark-done-circle" size={64} color="#10b981" />
                  <Text style={styles.successTitle}>Aktif Sipariş Yok</Text>
                  <Text style={styles.successDesc}>Tüm siparişleriniz teslim edilmiştir ya da henüz yeni bir sipariş vermediniz.</Text>
                </View>
              ) : (
                pastOrders.filter(o => o.status !== 'Teslim Edildi').map((order, idx) => {
                  const currentStep = order.status === 'Hazırlanıyor' ? 1 : order.status === 'Yolda' ? 2 : 3;
                  return (
                    <View key={order.id || idx} style={styles.trackingCard}>
                      <Text style={styles.trackingOrderTitle}>{order.shop_name} ({order.id})</Text>
                      <Text style={styles.trackingSub}>Teslim Noktası: {order.district}</Text>
                      
                      {/* Visual Stepper */}
                      <View style={styles.stepperContainer}>
                        <View style={styles.stepUnit}>
                          <View style={[styles.stepDot, currentStep >= 1 && styles.stepDotActive]}>
                            <Ionicons name="receipt" size={12} color="#fff" />
                          </View>
                          <Text style={styles.stepText}>Alındı</Text>
                        </View>
                        <View style={[styles.stepLine, currentStep >= 2 && styles.stepLineActive]} />
                        <View style={styles.stepUnit}>
                          <View style={[styles.stepDot, currentStep >= 2 && styles.stepDotActive]}>
                            <Ionicons name="time" size={12} color="#fff" />
                          </View>
                          <Text style={styles.stepText}>Hazırlanıyor</Text>
                        </View>
                        <View style={[styles.stepLine, currentStep >= 3 && styles.stepLineActive]} />
                        <View style={styles.stepUnit}>
                          <View style={[styles.stepDot, currentStep >= 3 && styles.stepDotActive]}>
                            <Ionicons name="bicycle" size={12} color="#fff" />
                          </View>
                          <Text style={styles.stepText}>Yolda</Text>
                        </View>
                      </View>
                      
                      <Text style={styles.trackingStatusLabel}>Durum: <Text style={{fontWeight:'800', color: '#6b21a8'}}>{order.status}</Text></Text>
                    </View>
                  );
                })
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL 5: SEPETIM MODALI (Floating Cart Clicked) */}
      <Modal visible={isCartOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.bottomSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🛒 Alışveriş Sepetim</Text>
              <TouchableOpacity onPress={() => setIsCartOpen(false)}>
                <Ionicons name="close-circle-sharp" size={24} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            {isPaid ? (
              <View style={styles.successContainer}>
                <Ionicons name="checkmark-circle" size={80} color="#10b981" style={{ marginBottom: 16 }} />
                <Text style={styles.successTitle}>Sipariş Başarıyla Alındı!</Text>
                <Text style={styles.successDesc}>Sipariş Kodunuz: {orderSuccessId}. Siparişiniz hazırlanma aşamasına geçmiştir.</Text>
                <TouchableOpacity onPress={() => setIsCartOpen(false)} style={[styles.btnPayAction, { backgroundColor: '#6b21a8', marginTop: 20 }]}>
                  <Text style={styles.btnPayActionText}>Kapat</Text>
                </TouchableOpacity>
              </View>
            ) : cartItems.length === 0 ? (
              <Text style={styles.emptyText}>Sepetiniz boş.</Text>
            ) : (
              <ScrollView contentContainerStyle={styles.modalScroll}>
                {cartItems.map((item) => (
                  <View key={item.product.id} style={styles.cartItemRow}>
                    <View style={{ flex: 2 }}>
                      <Text style={styles.cartItemName}>{item.product.name}</Text>
                      <Text style={styles.cartItemPrice}>{parseFloat(item.product.price).toFixed(2)} TL</Text>
                    </View>
                    <View style={styles.qtyContainer}>
                      <TouchableOpacity onPress={() => removeFromCart(item.product.id)} style={styles.qtyBtn}>
                        <Ionicons name="remove" size={14} color="#6b21a8" />
                      </TouchableOpacity>
                      <Text style={styles.qtyText}>{item.quantity}</Text>
                      <TouchableOpacity onPress={() => addToCart(item.product)} style={styles.qtyBtn}>
                        <Ionicons name="add" size={14} color="#6b21a8" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}

                {/* Coupon Code Section */}
                <View style={styles.couponInputSection}>
                  <TextInput 
                    value={couponCode} 
                    onChangeText={setCouponCode} 
                    placeholder="İndirim Kupon Kodu Girin" 
                    placeholderTextColor="#9ca3af"
                    style={[styles.formInput, { flex: 1, marginBottom: 0 }]} 
                  />
                  <TouchableOpacity onPress={() => handleApplyCoupon(couponCode)} style={styles.btnApplyCoupon}>
                    <Text style={styles.btnApplyCouponText}>Uygula</Text>
                  </TouchableOpacity>
                </View>

                {appliedCoupon && (
                  <Text style={styles.appliedCouponText}>✓ {appliedCoupon} Aktif (%{appliedDiscount} İndirim)</Text>
                )}

                {/* Summary Card */}
                <View style={styles.checkoutSummaryCard}>
                  <Text style={styles.summaryLabel}>TOPLAM ÖDENECEK TUTAR</Text>
                  <Text style={styles.summaryValue}>{cartTotal.toFixed(2)} TL</Text>
                </View>

                {/* Payment Selection */}
                <Text style={styles.formLabel}>Ödeme Yöntemi</Text>
                <View style={styles.paymentMethodContainer}>
                  <TouchableOpacity onPress={() => setPaymentMethod('card')} style={[styles.paymentMethodBtn, paymentMethod === 'card' && styles.paymentMethodBtnSelected]}>
                    <Ionicons name="card" size={18} color={paymentMethod === 'card' ? '#fff' : '#6b21a8'} />
                    <Text style={[styles.paymentMethodLabel, paymentMethod === 'card' && styles.paymentMethodLabelSelected]}>Kart</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setPaymentMethod('cash')} style={[styles.paymentMethodBtn, paymentMethod === 'cash' && styles.paymentMethodBtnSelected]}>
                    <Ionicons name="cash" size={18} color={paymentMethod === 'cash' ? '#fff' : '#6b21a8'} />
                    <Text style={[styles.paymentMethodLabel, paymentMethod === 'cash' && styles.paymentMethodLabelSelected]}>Kapıda</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setPaymentMethod('wallet')} style={[styles.paymentMethodBtn, paymentMethod === 'wallet' && styles.paymentMethodBtnSelected]}>
                    <Ionicons name="wallet" size={18} color={paymentMethod === 'wallet' ? '#fff' : '#6b21a8'} />
                    <Text style={[styles.paymentMethodLabel, paymentMethod === 'wallet' && styles.paymentMethodLabelSelected]}>Cüzdan</Text>
                  </TouchableOpacity>
                </View>

                {paymentMethod === 'card' && (
                  <View style={styles.formContainer}>
                    <Text style={styles.formLabel}>Kart Sahibi</Text>
                    <TextInput value={cardHolder} onChangeText={setCardHolder} placeholder="Adı Soyadı" placeholderTextColor="#9ca3af" style={styles.formInput} />
                    
                    <Text style={styles.formLabel}>Kart Numarası</Text>
                    <TextInput value={cardNumber} onChangeText={setCardNumber} placeholder="0000 0000 0000 0000" placeholderTextColor="#9ca3af" style={styles.formInput} keyboardType="numeric" maxLength={16} />
                    
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.formLabel}>S.K.T</Text>
                        <TextInput value={expiry} onChangeText={setExpiry} placeholder="AA/YY" placeholderTextColor="#9ca3af" style={styles.formInput} maxLength={5} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.formLabel}>CVV</Text>
                        <TextInput value={cvv} onChangeText={setCvv} placeholder="123" placeholderTextColor="#9ca3af" style={styles.formInput} keyboardType="numeric" secureTextEntry maxLength={3} />
                      </View>
                    </View>
                  </View>
                )}

                <TouchableOpacity onPress={handlePay} style={styles.btnPayAction} disabled={paying}>
                  {paying ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.btnPayActionText}>Sepeti Onayla ve Öde</Text>}
                </TouchableOpacity>
              </ScrollView>
            )}
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* MODAL 6: RECOMENDED BASKET CHECKOUT MODAL */}
      <Modal visible={checkoutModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.bottomSheet}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>🛍️ Güvenli Satın Alım</Text>
                <Text style={styles.modalSubtitle}>{selectedBasket?.shop_name} - {selectedBasket?.district} Sepeti</Text>
              </View>
              <TouchableOpacity onPress={() => setCheckoutModalVisible(false)}>
                <Ionicons name="close-circle-sharp" size={24} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            {isPaid ? (
              <View style={styles.successContainer}>
                <Ionicons name="checkmark-circle" size={80} color="#10b981" style={{ marginBottom: 16 }} />
                <Text style={styles.successTitle}>Sipariş Başarıyla Alındı!</Text>
                <Text style={styles.successDesc}>Sipariş Kodunuz: {orderSuccessId}. Rezervasyon yapıldı, şubeden teslim alabilirsiniz.</Text>
                <TouchableOpacity onPress={() => setCheckoutModalVisible(false)} style={[styles.btnPayAction, { backgroundColor: '#6b21a8', marginTop: 20 }]}>
                  <Text style={styles.btnPayActionText}>Kapat</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView contentContainerStyle={styles.modalScroll}>
                <View style={styles.checkoutSummaryCard}>
                  <Text style={styles.summaryLabel}>TOPLAM ÖDENECEK TUTAR</Text>
                  <Text style={styles.summaryValue}>
                    {selectedBasket?.products?.reduce((acc: number, p: any) => acc + parseFloat(p.price), 0).toFixed(2)} TL
                  </Text>
                </View>

                <View style={styles.formContainer}>
                  <Text style={styles.formLabel}>Kart Sahibi</Text>
                  <TextInput value={cardHolder} onChangeText={setCardHolder} placeholder="Adı Soyadı" placeholderTextColor="#9ca3af" style={styles.formInput} />
                  
                  <Text style={styles.formLabel}>Kart Numarası</Text>
                  <TextInput value={cardNumber} onChangeText={setCardNumber} placeholder="0000 0000 0000 0000" placeholderTextColor="#9ca3af" style={styles.formInput} keyboardType="numeric" maxLength={16} />
                  
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.formLabel}>S.K.T</Text>
                      <TextInput value={expiry} onChangeText={setExpiry} placeholder="AA/YY" placeholderTextColor="#9ca3af" style={styles.formInput} maxLength={5} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.formLabel}>CVV</Text>
                      <TextInput value={cvv} onChangeText={setCvv} placeholder="123" placeholderTextColor="#9ca3af" style={styles.formInput} keyboardType="numeric" secureTextEntry maxLength={3} />
                    </View>
                  </View>
                </View>

                <TouchableOpacity onPress={handlePay} style={styles.btnPayAction} disabled={paying}>
                  {paying ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.btnPayActionText}>Ödemeyi Tamamla</Text>}
                </TouchableOpacity>
              </ScrollView>
            )}
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* MODAL 7: LOKASYON & NAVİGASYON MODALI */}
      <Modal visible={routeModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheet}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>📍 Lokasyon & Navigasyon</Text>
                <Text style={styles.modalSubtitle}>{selectedBasket?.shop_name} ({selectedBasket?.district} Şubesi)</Text>
              </View>
              <TouchableOpacity onPress={() => setRouteModalVisible(false)}>
                <Ionicons name="close-circle-sharp" size={24} color="#9ca3af" />
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
                  <Text style={styles.guideStepText}>Uygulamamız şu anda bulunduğunuz konumdan en hızlı rotayı planladı.</Text>
                </View>
                <View style={styles.guideStep}>
                  <Text style={styles.guideStepNo}>2</Text>
                  <Text style={styles.guideStepText}>Şube ile aranızdaki tahmini mesafe: 4.8 km (Seyahat süresi: ~12 dk).</Text>
                </View>
                <View style={styles.guideStep}>
                  <Text style={styles.guideStepNo}>3</Text>
                  <Text style={styles.guideStepText}>Bu sepeti satın almanız halinde, şube rezerve edilen ürünlerinizi paketleme alanına transfer edecektir.</Text>
                </View>
              </View>

              <TouchableOpacity onPress={() => setRouteModalVisible(false)} style={[styles.btnPayAction, { backgroundColor: '#374151' }]}>
                <Text style={styles.btnPayActionText}>Haritayı Kapat</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL 8: AI RAPORU MODALI */}
      <Modal visible={isAiReportOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.bottomSheet, { maxHeight: height * 0.9 }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>🧠 AI Strateji & Analiz Raporu</Text>
                <Text style={styles.modalSubtitle}>TrendSepetiX Akıllı Analiz Raporu</Text>
              </View>
              <TouchableOpacity onPress={() => setIsAiReportOpen(false)}>
                <Ionicons name="close-circle-sharp" size={24} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            {loadingAiReport ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6b21a8" />
                <Text style={[styles.loadingText, { marginTop: 12 }]}>Yapay zeka analiz raporu hazırlanıyor...</Text>
              </View>
            ) : (
              <ScrollView contentContainerStyle={styles.modalScroll}>
                <View style={styles.aiReportContent}>
                  <Text style={styles.aiReportText}>{aiReportText.replace(/<[^>]*>/g, '')}</Text>
                </View>
                <TouchableOpacity onPress={() => setIsAiReportOpen(false)} style={[styles.btnPayAction, { backgroundColor: '#7c3aed', marginTop: 20 }]}>
                  <Text style={styles.btnPayActionText}>Raporu Kapat</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9d5ff',
  },
  settingsTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#faf5ff',
    borderWidth: 1,
    borderColor: '#e9d5ff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 12,
    color: '#1f2937',
  },
  settingsStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currentUrlText: {
    fontSize: 10,
    color: '#6b7280',
    flex: 1,
    marginRight: 8,
  },
  btnSaveSettings: {
    backgroundColor: '#6b21a8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  btnSaveSettingsText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 11,
  },
  // Top Navigation Bar
  topNavBar: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3e8ff',
  },
  topNavScroll: {
    paddingHorizontal: 12,
    gap: 8,
  },
  topNavPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f3e8ff',
    borderWidth: 1,
    borderColor: '#d8b4fe',
  },
  topNavLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6b21a8',
  },
  // Horizontal Categories
  categoriesBar: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3e8ff',
  },
  categoriesScroll: {
    paddingHorizontal: 12,
    gap: 6,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
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
  // Two Columns Layout
  feedScroll: {
    flex: 1,
  },
  feedContent: {
    padding: 8,
    paddingBottom: 80,
  },
  columnsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  column: {
    flex: 1,
    gap: 8,
  },
  columnHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6b21a8',
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 4,
  },
  columnHeaderTitle: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  // Product Card Small (Left Column)
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f3e8ff',
    shadowColor: '#6b21a8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  productCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 6,
  },
  productAvatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#faf5ff',
    borderWidth: 1,
    borderColor: '#e9d5ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  productInfoSmall: {
    flex: 1,
  },
  productNameSmall: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1f2937',
  },
  productPriceSmall: {
    fontSize: 11,
    fontWeight: '800',
    color: '#10b981',
    marginTop: 1,
  },
  btnAddSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#6b21a8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Basket Card Styling (Right Column)
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: '#f3e8ff',
    shadowColor: '#6b21a8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  highlightedCard: {
    borderColor: '#c084fc',
    backgroundColor: '#faf5ff',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#1f2937',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardSubtitle: {
    fontSize: 9,
    fontWeight: '700',
    color: '#6b21a8',
  },
  priceBadgeContainer: {
    alignItems: 'flex-end',
  },
  oldPriceText: {
    fontSize: 9,
    color: '#9ca3af',
    textDecorationLine: 'line-through',
    fontWeight: '600',
  },
  newPriceText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#10b981',
  },
  imageStrip: {
    marginBottom: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f3e8ff',
    paddingBottom: 6,
  },
  imageStripContent: {
    gap: 8,
  },
  productVisualContainer: {
    alignItems: 'center',
    width: 45,
  },
  productAvatar: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#faf5ff',
    borderWidth: 1,
    borderColor: '#e9d5ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  visualProductName: {
    fontSize: 7,
    fontWeight: '600',
    color: '#6b7280',
    textAlign: 'center',
    width: '100%',
  },
  productsContainer: {
    backgroundColor: '#faf8ff',
    padding: 8,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#f3e8ff',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: '#4b5563',
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f3e8ff',
  },
  productName: {
    fontSize: 10,
    color: '#1f2937',
    fontWeight: '600',
  },
  productStock: {
    fontSize: 9,
    fontWeight: '700',
    color: '#7c3aed',
  },
  recommendationText: {
    fontSize: 9,
    color: '#4b5563',
    lineHeight: 12,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 6,
  },
  btnRoute: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  btnRouteText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#374151',
  },
  btnBuy: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#6b21a8',
    paddingVertical: 6,
    borderRadius: 8,
  },
  btnBuyText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#fff',
  },
  // Floating Cart Button
  floatingCartBtn: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#6b21a8',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#6b21a8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 99,
  },
  floatingCartText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 14,
  },
  // General Modal overlay
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 24,
    maxHeight: height * 0.85,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1f2937',
  },
  modalSubtitle: {
    fontSize: 11,
    color: '#6b21a8',
    fontWeight: '700',
  },
  modalScroll: {
    paddingBottom: 20,
  },
  // Form fields
  formLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 4,
    marginTop: 8,
  },
  formInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#1f2937',
    marginBottom: 4,
  },
  btnPayAction: {
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  btnPayActionText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 14,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#10b981',
    marginBottom: 8,
  },
  successDesc: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 16,
  },
  // Order History List
  orderHistoryCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  orderHistoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  orderHistoryId: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6b21a8',
  },
  orderHistoryStatus: {
    fontSize: 10,
    fontWeight: '800',
    borderRadius: 4,
  },
  statusGreen: {
    color: '#10b981',
  },
  statusOrange: {
    color: '#f97316',
  },
  orderHistoryShop: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 6,
  },
  orderHistoryItems: {
    backgroundColor: '#f9fafb',
    padding: 8,
    borderRadius: 8,
    marginBottom: 6,
  },
  orderHistoryItemText: {
    fontSize: 10,
    color: '#4b5563',
    lineHeight: 14,
  },
  orderHistoryTotal: {
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'right',
    color: '#10b981',
  },
  // Coupons List
  couponCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e9d5ff',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#6b21a8',
  },
  couponHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  couponCodeText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#6b21a8',
  },
  couponValueText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#10b981',
  },
  couponDesc: {
    fontSize: 10,
    color: '#4b5563',
    marginBottom: 8,
  },
  couponApplyBtn: {
    backgroundColor: '#faf5ff',
    borderWidth: 1,
    borderColor: '#d8b4fe',
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: 'center',
  },
  couponApplyBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6b21a8',
  },
  // Tracking
  trackingCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  trackingOrderTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1f2937',
  },
  trackingSub: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 12,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  stepUnit: {
    alignItems: 'center',
    width: 60,
  },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepDotActive: {
    backgroundColor: '#6b21a8',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#e5e7eb',
    marginTop: -18,
  },
  stepLineActive: {
    backgroundColor: '#6b21a8',
  },
  stepText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#4b5563',
    textAlign: 'center',
  },
  trackingStatusLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
  },
  // Cart Items rows in Drawer
  cartItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3e8ff',
  },
  cartItemName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1f2937',
  },
  cartItemPrice: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10b981',
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#faf5ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9d5ff',
    padding: 2,
  },
  qtyBtn: {
    padding: 6,
  },
  qtyText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6b21a8',
    paddingHorizontal: 8,
  },
  couponInputSection: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    marginBottom: 8,
  },
  btnApplyCoupon: {
    backgroundColor: '#6b21a8',
    paddingHorizontal: 16,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnApplyCouponText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 12,
  },
  appliedCouponText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#10b981',
    marginBottom: 8,
  },
  checkoutSummaryCard: {
    backgroundColor: '#10b981',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 12,
  },
  summaryLabel: {
    fontSize: 9,
    color: '#fff',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fff',
  },
  paymentMethodContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  paymentMethodBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e9d5ff',
    backgroundColor: '#faf5ff',
    gap: 4,
  },
  paymentMethodBtnSelected: {
    backgroundColor: '#6b21a8',
    borderColor: '#6b21a8',
  },
  paymentMethodLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6b21a8',
  },
  paymentMethodLabelSelected: {
    color: '#fff',
  },
  // Map Graphics Mocks
  mapGraphicMock: {
    backgroundColor: '#faf5ff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9d5ff',
  },
  mapGraphicText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6b21a8',
    marginTop: 6,
  },
  mapDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  mapDotGreen: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  mapLine: {
    width: 80,
    height: 2,
    backgroundColor: '#c084fc',
  },
  mapDotRed: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  mapCoordinates: {
    fontSize: 9,
    color: '#6b7280',
  },
  navigationGuideCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f3e8ff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  guideTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 8,
  },
  guideStep: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  guideStepNo: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#f3e8ff',
    color: '#6b21a8',
    fontSize: 9,
    fontWeight: '800',
    textAlign: 'center',
    marginRight: 6,
  },
  guideStepText: {
    flex: 1,
    fontSize: 10,
    color: '#4b5563',
    lineHeight: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: '#6b7280',
  },
  offlineContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  offlineTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  offlineDesc: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 12,
  },
  btnRetry: {
    backgroundColor: '#6b21a8',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  btnRetryText: {
    color: '#fff',
    fontWeight: '700',
  },
  emptyColText: {
    fontSize: 11,
    color: '#9ca3af',
    textAlign: 'center',
    marginVertical: 10,
  },
  emptyText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 20,
  },
  formContainer: {
    gap: 6,
  },
  headerProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 10,
  },
  headerProfileBtnText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
  },
  featuredSectionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  featuredHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 6,
  },
  featuredSectionTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#1e293b',
  },
  hotBadge: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  hotBadgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '900',
  },
  featuredProductsScroll: {
    gap: 10,
    paddingBottom: 4,
  },
  featuredProductItem: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    width: 110,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  featuredProductAvatar: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  featuredProductName: {
    fontSize: 10,
    fontWeight: '700',
    color: '#334155',
    textAlign: 'center',
    marginBottom: 2,
  },
  featuredProductOldPrice: {
    fontSize: 8,
    color: '#94a3b8',
    textDecorationLine: 'line-through',
  },
  featuredProductPrice: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0d9488',
    marginBottom: 6,
  },
  btnFeaturedAdd: {
    backgroundColor: '#0d9488',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  btnFeaturedAddText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
  },
  featuredFooterText: {
    fontSize: 8,
    color: '#64748b',
    marginTop: 8,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  opportunityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  opportunityProduct: {
    alignItems: 'center',
    flex: 1,
  },
  opportunityProductAvatar: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#f0fdfa',
    borderWidth: 1,
    borderColor: '#ccfbf1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  opportunityProductName: {
    fontSize: 10,
    fontWeight: '700',
    color: '#334155',
    textAlign: 'center',
  },
  opportunityProductPrice: {
    fontSize: 9,
    color: '#64748b',
    marginTop: 1,
  },
  plusSign: {
    fontSize: 18,
    fontWeight: '900',
    color: '#a855f7',
    paddingHorizontal: 10,
  },
  opportunityFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  opportunityCountText: {
    fontSize: 9,
    color: '#64748b',
    fontWeight: '500',
  },
  opportunityPrices: {
    alignItems: 'flex-end',
  },
  opportunityOldPrice: {
    fontSize: 8,
    color: '#94a3b8',
    textDecorationLine: 'line-through',
  },
  opportunityNewPrice: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0d9488',
  },
  opportunityActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  opportunityBtnAdd: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#7c3aed',
    paddingVertical: 8,
    borderRadius: 8,
  },
  opportunityBtnAddText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#fff',
  },
  opportunityBtnBuy: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0d9488',
    paddingVertical: 8,
    borderRadius: 8,
  },
  opportunityBtnBuyText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#fff',
  },
  aiPredictionWidget: {
    backgroundColor: '#1e293b',
    padding: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  aiPredictionText: {
    flex: 1,
    color: '#e2e8f0',
    fontSize: 9,
    lineHeight: 13,
  },
  aiReportContent: {
    padding: 4,
  },
  aiReportText: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
  },
});
