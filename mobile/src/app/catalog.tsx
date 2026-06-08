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
  Dimensions,
  Image
} from 'react-native';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Host IP Auto-Discovery Helper
const getAutoDiscoverIp = () => {
  const hostUri = Constants.expoConfig?.hostUri; // e.g. "192.168.1.35:8081"
  if (hostUri) {
    return hostUri.split(':')[0];
  }
  return '192.168.1.100'; // Default developer fallback IP
};

export default function CatalogScreen() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Server Config States
  const [customIp, setCustomIp] = useState<string>(getAutoDiscoverIp());
  const [customPort, setCustomPort] = useState<string>('8000');
  const [activeApiUrl, setActiveApiUrl] = useState<string>(`http://${getAutoDiscoverIp()}:8000/api/`);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  // Accordion Expand State
  const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({
    '🍔 Gıda & Market': true,
    '💻 Elektronik': true,
  });

  // Selected Product Detail State
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // Custom Cart State
  const [cart, setCart] = useState<{ [key: number]: { product: any, quantity: number } }>({});
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Checkout Modal State
  const [checkoutModalVisible, setCheckoutModalVisible] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash' | 'wallet'>('card');
  
  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  // Simulated Loader Flow State
  const [checkoutStep, setCheckoutStep] = useState<'form' | 'loading' | 'success'>('form');
  const [checkoutStatusText, setCheckoutStatusText] = useState('');
  const [earnedCouponCode, setEarnedCouponCode] = useState('');
  const [savedAddress, setSavedAddress] = useState('');

  // 1. Fetch Products from Django API
  const loadProducts = (baseUrl: string) => {
    setLoading(true);
    setIsConnected(null);
    
    const productsUrl = baseUrl.endsWith('/api/') ? `${baseUrl}products/` : `${baseUrl}/products/`;
    const statusUrl = baseUrl.endsWith('/api/') ? `${baseUrl}sales/status/` : `${baseUrl}/sales/status/`;

    // Check backend status first
    fetch(statusUrl, { method: 'GET', headers: { 'Accept': 'application/json' } })
      .then(res => res.json())
      .then(data => {
        if (data.db === 'OK') {
          setIsConnected(true);
          return fetch(productsUrl);
        } else {
          throw new Error('Database is offline');
        }
      })
      .then(res => res && res.json())
      .then(data => {
        if (data) {
          setProducts(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("API Connection error:", err);
        setIsConnected(false);
        setProducts([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadProducts(activeApiUrl);
    
    // Load saved address periodically or on enter
    const checkAddress = setInterval(() => {
      if (typeof window !== 'undefined' && window.localStorage) {
        const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
        setSavedAddress(profile.address || '');
      }
    }, 1500);

    return () => clearInterval(checkAddress);
  }, [activeApiUrl]);

  const handleUpdateServer = () => {
    const cleanIp = customIp.trim();
    const cleanPort = customPort.trim();
    if (!cleanIp) return;
    const newUrl = `http://${cleanIp}:${cleanPort}/api/`;
    setActiveApiUrl(newUrl);
    setIsSettingsOpen(false);
  };

  // Helper to format/fix relative django image URLs
  const formatImageUrl = (url: string) => {
    if (!url) return 'https://via.placeholder.com/150';
    if (url.startsWith('http') || url.startsWith('data:')) {
      return url;
    }
    // Prepend active Django server host
    const cleanHost = activeApiUrl.replace('/api/', '');
    return `${cleanHost}${url}`;
  };

  // 2. Category Assignment Helper (Matches views.py logic)
  const getProductCategory = (p: any) => {
    const dbCategory = p.category || '';
    if (dbCategory) {
      if (dbCategory.includes('Teknoloji') || dbCategory.includes('Elektronik')) return '💻 Elektronik';
      if (dbCategory.includes('Moda') || dbCategory.includes('Giyim')) return '👕 Giyim';
      if (dbCategory.includes('Market') || dbCategory.includes('Gıda')) return '🍔 Gıda & Market';
      if (dbCategory.includes('Temizlik')) return '🧼 Temizlik';
      if (dbCategory.includes('Kırtasiye') || dbCategory.includes('Oyuncak')) return '🧸 Kırtasiye & Oyuncak';
    }

    const n = (p.name || '').toLowerCase();
    if (['peynir', 'süt', 'kıyma', 'yağ', 'bisküvi', 'çikolata', 'biber', 'şalgam', 'şeftali', 'soğan', 'üzüm', 'çilek', 'erik', 'jelibon', 'karanfil', 'kekik', 'kimyon', 'lolipop', 'tarçın', 'yumurta', 'salça', 'makarna', 'pirinç', 'ayçiçek'].some(x => n.includes(x))) {
      return '🍔 Gıda & Market';
    }
    if (['laptop', 'drone', 'mouse', 'robot', 'hoparlör', 'telefon', 'tablet'].some(x => n.includes(x))) {
      return '💻 Elektronik';
    }
    if (['sabun', 'deterjan', 'sünger', 'çamaşır'].some(x => n.includes(x))) {
      return '🧼 Temizlik';
    }
    if (['gömlek', 'çorap', 'sweat', 'tişört'].some(x => n.includes(x))) {
      return '👕 Giyim';
    }
    if (['lego', 'boya', 'kitab'].some(x => n.includes(x))) {
      return '🧸 Kırtasiye & Oyuncak';
    }
    return '📦 Diğer';
  };

  // Group products by category dynamically
  const getGroupedProducts = () => {
    const grouped: { [key: string]: any[] } = {
      '🍔 Gıda & Market': [],
      '💻 Elektronik': [],
      '🧼 Temizlik': [],
      '👕 Giyim': [],
      '🧸 Kırtasiye & Oyuncak': [],
      '📦 Diğer': []
    };

    const filtered = products.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    filtered.forEach(p => {
      const cat = getProductCategory(p);
      if (!grouped[cat]) {
        grouped[cat] = [];
      }
      grouped[cat].push(p);
    });

    // Remove empty categories if searching
    if (searchQuery) {
      Object.keys(grouped).forEach(k => {
        if (grouped[k].length === 0) {
          delete grouped[k];
        }
      });
    }

    return grouped;
  };

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [cat]: !prev[cat]
    }));
  };

  // 3. Custom Cart Functions
  const addToCart = (product: any) => {
    setCart(prev => {
      const current = prev[product.id];
      return {
        ...prev,
        [product.id]: {
          product,
          quantity: current ? current.quantity + 1 : 1
        }
      };
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => {
      const current = prev[productId];
      if (!current) return prev;
      
      const next = { ...prev };
      if (current.quantity > 1) {
        next[productId] = { ...current, quantity: current.quantity - 1 };
      } else {
        delete next[productId];
      }
      return next;
    });
  };

  const deleteFromCart = (productId: number) => {
    setCart(prev => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
  };

  const getCartTotalItems = () => {
    return Object.values(cart).reduce((acc, c) => acc + c.quantity, 0);
  };

  const getCartSubtotal = () => {
    return Object.values(cart).reduce((acc, c) => {
      return acc + (parseFloat(c.product.price) * c.quantity);
    }, 0);
  };

  const getCartTotal = () => {
    const sub = getCartSubtotal();
    return Math.max(0, sub - appliedDiscount);
  };

  // Apply Loyaly Coupon (Simulated backend discount matching index.html)
  const applyCoupon = () => {
    const codeClean = couponCode.trim().toUpperCase();
    if (!codeClean) return;

    if (typeof window !== 'undefined' && window.localStorage) {
      const coupons = JSON.parse(localStorage.getItem('myCoupons') || '[]');
      const foundIdx = coupons.findIndex((c: any) => c.code === codeClean && !c.isUsed);
      
      if (foundIdx !== -1) {
        const discountAmount = coupons[foundIdx].discountAmount;
        setAppliedDiscount(discountAmount);
        setAppliedCoupon(codeClean);
        alert(`Kupon Başarıyla Uygulandı! 🎉\n\n${discountAmount.toFixed(2)} TL indirim kazandınız.`);
      } else {
        alert("Geçersiz veya kullanılmış kupon kodu!");
      }
    } else {
      // Mock fallback if offline/web standard local storage isn't accessible
      if (codeClean.startsWith('KAZAN')) {
        setAppliedDiscount(getCartSubtotal() * 0.1);
        setAppliedCoupon(codeClean);
        alert("Kupon Başarıyla Uygulandı! 🎉 (Çevrimdışı Mod %10 İndirim)");
      } else {
        alert("Geçersiz kupon kodu!");
      }
    }
    setCouponCode('');
  };

  // 4. Custom simulated checkout steps
  const handlePay = () => {
    const finalPrice = getCartTotal();
    
    if (paymentMethod === 'card' && (!cardNumber || !cardHolder)) {
      alert("Lütfen kart sahibi ve kart numarasını giriniz!");
      return;
    }

    setCheckoutStep('loading');
    setCheckoutStatusText('Ödemeniz alınıyor...');

    // Phase 1: Card Verification
    setTimeout(() => {
      setCheckoutStatusText('Akıllı lojistik panelinde stoklar ayrılıyor...');
      
      // Phase 2: Stock Allocation
      setTimeout(() => {
        setCheckoutStatusText('Sipariş kaydı veritabanına işleniyor...');
        
        // Phase 3: DB insertion and order completion
        setTimeout(() => {
          if (typeof window !== 'undefined' && window.localStorage) {
            // Save active order indicator for Live Tracking
            localStorage.setItem('activeOrder', 'true');
            
            // Build items representation
            const orderItems = Object.values(cart).map(c => ({
              name: c.product.name,
              price: parseFloat(c.product.price) * c.quantity,
              photo: formatImageUrl(c.product.image_url)
            }));

            const newOrder = {
              date: new Date().toLocaleString('tr-TR'),
              items: orderItems,
              total: finalPrice.toFixed(2) + " TL"
            };

            // Prepend new order to history
            const orders = JSON.parse(localStorage.getItem('myOrders') || '[]');
            orders.unshift(newOrder);
            localStorage.setItem('myOrders', JSON.stringify(orders));

            // Mark applied coupon as used
            if (appliedCoupon) {
              const coupons = JSON.parse(localStorage.getItem('myCoupons') || '[]');
              const cIdx = coupons.findIndex((c: any) => c.code === appliedCoupon);
              if (cIdx !== -1) {
                coupons[cIdx].isUsed = true;
                localStorage.setItem('myCoupons', JSON.stringify(coupons));
              }
            }

            // Earn a new loyalty coupon if purchase is over 50 TL
            const originalSpend = getCartSubtotal();
            if (originalSpend >= 50) {
              const newDiscount = originalSpend * 0.10;
              const newCode = "KAZAN" + Math.floor(1000 + Math.random() * 9000);
              
              const expireDate = new Date();
              expireDate.setDate(expireDate.getDate() + 7);
              
              const coupons = JSON.parse(localStorage.getItem('myCoupons') || '[]');
              coupons.unshift({
                code: newCode,
                discountAmount: newDiscount,
                earnedAt: new Date().toISOString(),
                expiresAt: expireDate.toISOString(),
                isUsed: false
              });
              localStorage.setItem('myCoupons', JSON.stringify(coupons));
              setEarnedCouponCode(newCode);
            } else {
              setEarnedCouponCode('');
            }
          }

          // Clear cart
          setCart({});
          setAppliedDiscount(0);
          setAppliedCoupon(null);
          setCheckoutStep('success');
        }, 1200);
      }, 1200);
    }, 1200);
  };

  const closeCheckoutFlow = () => {
    setCheckoutModalVisible(false);
    setCheckoutStep('form');
    setCardNumber('');
    setCardHolder('');
    setExpiry('');
    setCvv('');
    setPaymentMethod('card');
  };

  const openCheckoutFlow = () => {
    setIsCartOpen(false);
    setCheckoutModalVisible(true);
  };

  const grouped = getGroupedProducts();
  const totalItems = getCartTotalItems();

  return (
    <SafeAreaView style={styles.container}>
      {/* 1. App Bar with connection indicator and settings wheel */}
      <View style={styles.appBar}>
        <View style={styles.appTitleContainer}>
          <Text style={styles.appTitle}>TrendSepetiX</Text>
          <Text style={styles.appSubtitle}>ÜRÜN REYONLARI & KATALOG</Text>
        </View>
        
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

      {/* 2. Settings Drawer */}
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
              Aktif API: <Text style={{ fontWeight: '700' }}>{activeApiUrl}</Text>
            </Text>
            <TouchableOpacity onPress={handleUpdateServer} style={styles.btnSaveSettings}>
              <Text style={styles.btnSaveSettingsText}>Bağlan</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 3. Search Bar */}
      <View style={styles.searchBarContainer}>
        <Ionicons name="search" size={20} color="#6b21a8" style={{ marginRight: 8 }} />
        <TextInput 
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Ürün veya kategori ara..."
          style={styles.searchInput}
          placeholderTextColor="#a855f7"
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color="#9ca3af" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* 4. Products Accordion Feed */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6b21a8" />
          <Text style={styles.loadingText}>Ürün Veritabanı Yükleniyor...</Text>
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
          <TouchableOpacity onPress={() => loadProducts(activeApiUrl)} style={styles.btnRetry}>
            <Text style={styles.btnRetryText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.accordionContainer} contentContainerStyle={{ paddingBottom: 100 }}>
          {Object.keys(grouped).map(categoryName => {
            const catProducts = grouped[categoryName] || [];
            const isExpanded = expandedCategories[categoryName] ?? false;

            if (catProducts.length === 0 && searchQuery) return null;

            return (
              <View key={categoryName} style={styles.categoryBlock}>
                {/* Accordion Title Header */}
                <TouchableOpacity 
                  onPress={() => toggleCategory(categoryName)}
                  style={[
                    styles.categoryHeader,
                    isExpanded && styles.categoryHeaderActive
                  ]}
                >
                  <Text style={[
                    styles.categoryHeaderText,
                    isExpanded && styles.categoryHeaderTextActive
                  ]}>
                    {categoryName} ({catProducts.length})
                  </Text>
                  <Ionicons 
                    name={isExpanded ? "chevron-up" : "chevron-down"} 
                    size={18} 
                    color={isExpanded ? "#fff" : "#6b21a8"} 
                  />
                </TouchableOpacity>

                {/* Accordion Content Grid */}
                {isExpanded && (
                  <View style={styles.categoryContentGrid}>
                    {catProducts.map(p => {
                      const cartItem = cart[p.id];
                      const quantityInCart = cartItem ? cartItem.quantity : 0;
                      const formattedPrice = parseFloat(p.price);
                      const originalPrice = formattedPrice * 1.15;
                      const isSelected = selectedProduct?.id === p.id;

                      return (
                        <TouchableOpacity 
                          key={p.id} 
                          onPress={() => setSelectedProduct(isSelected ? null : p)}
                          style={[
                            styles.productCard,
                            isSelected && styles.productCardActive
                          ]}
                          activeOpacity={0.9}
                        >
                          <Image 
                            source={{ uri: formatImageUrl(p.image_url) }} 
                            style={styles.productImage}
                            resizeMode="contain"
                          />

                          <View style={styles.productCardBody}>
                            <Text style={styles.productName} numberOfLines={1}>
                              {p.name.split(' #')[0]}
                            </Text>

                            <View style={styles.priceRow}>
                              <Text style={styles.oldPrice}>{originalPrice.toFixed(2)} TL</Text>
                              <Text style={styles.newPrice}>{formattedPrice.toFixed(2)} TL</Text>
                            </View>

                            <View style={styles.stockBadge}>
                              <Ionicons name="cube-outline" size={10} color="#14b8a6" style={{ marginRight: 3 }} />
                              <Text style={styles.stockText}>Stok: {p.stock || 12} Adet</Text>
                            </View>

                            {/* Extra detail section visible on click */}
                            {isSelected && (
                              <View style={styles.productDetailsDropdown}>
                                <Text style={styles.expiryLabel}>Son Tüketim Tarihi (SKT)</Text>
                                <View style={styles.expiryBadge}>
                                  <Text style={styles.expiryText}>
                                    {p.expiration_date ? new Date(p.expiration_date).toLocaleDateString('tr-TR') : 'N/A'}
                                  </Text>
                                </View>
                                
                                <TouchableOpacity 
                                  onPress={() => addToCart(p)} 
                                  style={styles.btnAddToCartInline}
                                >
                                  <Ionicons name="cart-outline" size={14} color="#fff" style={{ marginRight: 4 }} />
                                  <Text style={styles.btnAddToCartInlineText}>SEPETE EKLE</Text>
                                </TouchableOpacity>
                              </View>
                            )}

                            {/* Cart quantity indicator counter */}
                            {quantityInCart > 0 && (
                              <View style={styles.counterRow}>
                                <TouchableOpacity 
                                  onPress={() => removeFromCart(p.id)}
                                  style={styles.counterBtn}
                                >
                                  <Ionicons name="remove" size={12} color="#fff" />
                                </TouchableOpacity>
                                <Text style={styles.counterValue}>{quantityInCart}</Text>
                                <TouchableOpacity 
                                  onPress={() => addToCart(p)}
                                  style={styles.counterBtn}
                                >
                                  <Ionicons name="add" size={12} color="#fff" />
                                </TouchableOpacity>
                              </View>
                            )}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* 5. Custom Pulse FAB for Custom Basket */}
      {totalItems > 0 && (
        <TouchableOpacity 
          onPress={() => setIsCartOpen(true)}
          style={styles.cartFAB}
          activeOpacity={0.8}
        >
          <Ionicons name="basket-sharp" size={24} color="#fff" />
          <View style={styles.cartFABBadge}>
            <Text style={styles.cartFABBadgeText}>{totalItems}</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* 6. Dynamic Custom Cart Bottom Sheet Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isCartOpen}
        onRequestClose={() => setIsCartOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.bottomSheet}
          >
            {/* Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>🛍️ Akıllı Özel Sepetim</Text>
                <Text style={styles.modalSubtitle}>Kendi Seçtiğiniz Kampanyalı Ürünler</Text>
              </View>
              <TouchableOpacity onPress={() => setIsCartOpen(false)}>
                <Ionicons name="close-circle-sharp" size={26} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.cartItemsScroll}>
              {Object.values(cart).map(item => (
                <View key={item.product.id} style={styles.cartItemRow}>
                  <Image 
                    source={{ uri: formatImageUrl(item.product.image_url) }} 
                    style={styles.cartItemPhoto}
                    resizeMode="contain"
                  />
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.cartItemName} numberOfLines={1}>{item.product.name.split(' #')[0]}</Text>
                    <Text style={styles.cartItemPrice}>
                      {item.quantity} x {parseFloat(item.product.price).toFixed(2)} TL
                    </Text>
                  </View>
                  
                  {/* Plus/Minus quantity adjustment */}
                  <View style={styles.cartQuantityControls}>
                    <TouchableOpacity onPress={() => removeFromCart(item.product.id)} style={styles.cartQtyBtn}>
                      <Ionicons name="remove" size={12} color="#6b21a8" />
                    </TouchableOpacity>
                    <Text style={styles.cartQtyVal}>{item.quantity}</Text>
                    <TouchableOpacity onPress={() => addToCart(item.product.id)} style={styles.cartQtyBtn}>
                      <Ionicons name="add" size={12} color="#6b21a8" />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity onPress={() => deleteFromCart(item.product.id)} style={styles.btnDeleteCartItem}>
                    <Ionicons name="trash-outline" size={16} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))}

              {/* Loyalty Coupon Code Section */}
              <View style={styles.couponSection}>
                <Text style={styles.couponSectionTitle}>🎟️ Sadakat Kuponu Ekle</Text>
                <View style={styles.couponInputRow}>
                  <TextInput 
                    value={couponCode}
                    onChangeText={setCouponCode}
                    placeholder="Kupon Kodu Girin (örn: KAZAN1482)"
                    placeholderTextColor="#9ca3af"
                    style={styles.couponInput}
                    autoCapitalize="characters"
                  />
                  <TouchableOpacity onPress={applyCoupon} style={styles.btnApplyCoupon}>
                    <Text style={styles.btnApplyCouponText}>Uygula</Text>
                  </TouchableOpacity>
                </View>

                {appliedDiscount > 0 && (
                  <View style={styles.appliedCouponTag}>
                    <Ionicons name="checkmark-circle" size={14} color="#10b981" style={{ marginRight: 4 }} />
                    <Text style={styles.appliedCouponText}>
                      Kupon Kod: {appliedCoupon} (-{appliedDiscount.toFixed(2)} TL İndirim Uygulandı)
                    </Text>
                  </View>
                )}
              </View>

              {/* Checkout Summary Card */}
              <View style={styles.checkoutSummaryCard}>
                <View style={styles.summaryItemRow}>
                  <Text style={styles.summaryLabel}>Ara Toplam</Text>
                  <Text style={styles.summaryValue}>{getCartSubtotal().toFixed(2)} TL</Text>
                </View>
                {appliedDiscount > 0 && (
                  <View style={styles.summaryItemRow}>
                    <Text style={[styles.summaryLabel, { color: '#ef4444' }]}>Kupon İndirimi</Text>
                    <Text style={[styles.summaryValue, { color: '#ef4444' }]}>-{appliedDiscount.toFixed(2)} TL</Text>
                  </View>
                )}
                <View style={[styles.summaryItemRow, { borderTopWidth: 0.5, borderTopColor: '#e9d5ff', paddingTop: 10, marginTop: 10 }]}>
                  <Text style={styles.summaryTotalLabel}>ÖDENECEK TUTAR</Text>
                  <Text style={styles.summaryTotalValue}>{getCartTotal().toFixed(2)} TL</Text>
                </View>
              </View>

              <TouchableOpacity 
                onPress={openCheckoutFlow} 
                style={styles.btnCheckoutAction}
              >
                <Ionicons name="wallet" size={18} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.btnCheckoutActionText}>Ödemeye İlerle</Text>
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* 7. Multi-step Checkout Simulated Payment Flow Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={checkoutModalVisible}
        onRequestClose={closeCheckoutFlow}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.bottomSheet}
          >
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>💳 Güvenli Ödeme Aşaması</Text>
                <Text style={styles.modalSubtitle}>Sipariş Tutarı: {getCartTotal().toFixed(2)} TL</Text>
              </View>
              <TouchableOpacity onPress={closeCheckoutFlow}>
                <Ionicons name="close-circle-sharp" size={26} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            {checkoutStep === 'form' && (
              <ScrollView contentContainerStyle={styles.checkoutFormScroll}>
                {/* Delivery address check */}
                <View style={styles.addressSummaryCard}>
                  <Ionicons name="home-outline" size={16} color="#6b21a8" style={{ marginRight: 6 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.addressSummaryTitle}>Teslimat Adresi</Text>
                    <Text style={styles.addressSummaryDesc}>
                      {savedAddress ? savedAddress : "Kayıtlı Adres Yok (Uygulama merkez şubeden teslimat ayarlanacaktır)"}
                    </Text>
                  </View>
                </View>

                {/* Payment Method Selector */}
                <Text style={styles.sectionLabel}>Ödeme Yöntemi</Text>
                <View style={styles.paymentMethodsRow}>
                  <TouchableOpacity 
                    onPress={() => setPaymentMethod('card')}
                    style={[styles.paymentMethodBtn, paymentMethod === 'card' && styles.paymentMethodBtnActive]}
                  >
                    <Ionicons name="card" size={18} color={paymentMethod === 'card' ? '#fff' : '#6b21a8'} />
                    <Text style={[styles.paymentMethodText, paymentMethod === 'card' && styles.paymentMethodTextActive]}>
                      Kredi Kartı
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    onPress={() => setPaymentMethod('cash')}
                    style={[styles.paymentMethodBtn, paymentMethod === 'cash' && styles.paymentMethodBtnActive]}
                  >
                    <Ionicons name="wallet" size={18} color={paymentMethod === 'cash' ? '#fff' : '#6b21a8'} />
                    <Text style={[styles.paymentMethodText, paymentMethod === 'cash' && styles.paymentMethodTextActive]}>
                      Kapıda Ödeme
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    onPress={() => setPaymentMethod('wallet')}
                    style={[styles.paymentMethodBtn, paymentMethod === 'wallet' && styles.paymentMethodBtnActive]}
                  >
                    <Ionicons name="phone-portrait-sharp" size={18} color={paymentMethod === 'wallet' ? '#fff' : '#6b21a8'} />
                    <Text style={[styles.paymentMethodText, paymentMethod === 'wallet' && styles.paymentMethodTextActive]}>
                      Cüzdan
                    </Text>
                  </TouchableOpacity>
                </View>

                {paymentMethod === 'card' ? (
                  <View style={styles.cardForm}>
                    <Text style={styles.formLabel}>Kart Sahibi Adı Soyadı</Text>
                    <TextInput 
                      value={cardHolder}
                      onChangeText={setCardHolder}
                      placeholder="Kart Üzerindeki İsim"
                      placeholderTextColor="#9ca3af"
                      style={styles.formInput}
                    />

                    <Text style={styles.formLabel}>Kart Numarası</Text>
                    <TextInput 
                      value={cardNumber}
                      onChangeText={setCardNumber}
                      placeholder="0000 0000 0000 0000"
                      placeholderTextColor="#9ca3af"
                      style={styles.formInput}
                      keyboardType="numeric"
                      maxLength={16}
                    />

                    <View style={{ flexDirection: 'row', gap: 12 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.formLabel}>Son Kullanma</Text>
                        <TextInput 
                          value={expiry}
                          onChangeText={setExpiry}
                          placeholder="AA/YY"
                          placeholderTextColor="#9ca3af"
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
                          placeholderTextColor="#9ca3af"
                          style={styles.formInput}
                          keyboardType="numeric"
                          secureTextEntry
                          maxLength={3}
                        />
                      </View>
                    </View>
                  </View>
                ) : (
                  <View style={styles.offlinePaymentNotice}>
                    <Ionicons name="information-circle" size={32} color="#6b21a8" style={{ marginBottom: 8 }} />
                    <Text style={styles.offlineNoticeTitle}>
                      {paymentMethod === 'cash' ? 'Kapıda Nakit / POS Ödeme' : 'Dijital Cüzdan ile Ödeme'}
                    </Text>
                    <Text style={styles.offlineNoticeDesc}>
                      {paymentMethod === 'cash' 
                        ? 'Siparişiniz kapınıza ulaştığında nakit veya kredi kartıyla ödemenizi yapabilirsiniz.'
                        : 'Simüle edilmiş dijital cüzdan bakiyenizden ödeme sipariş anında otomatik tahsil edilecektir.'}
                    </Text>
                  </View>
                )}

                <TouchableOpacity onPress={handlePay} style={styles.btnFinalPay}>
                  <Text style={styles.btnFinalPayText}>Siparişi Tamamla</Text>
                </TouchableOpacity>
              </ScrollView>
            )}

            {/* Circular step loader simulation */}
            {checkoutStep === 'loading' && (
              <View style={styles.simulatedLoaderContainer}>
                <ActivityIndicator size="large" color="#6b21a8" style={{ marginBottom: 20 }} />
                <Text style={styles.simulatedLoaderTitle}>Güvenli Ödeme Aşamaları</Text>
                <Text style={styles.simulatedLoaderStatusText}>{checkoutStatusText}</Text>
                
                <View style={styles.simulatedStepsProgressBg}>
                  <View style={[
                    styles.simulatedStepsProgressFill, 
                    {
                      width: checkoutStatusText.includes('Ödemeniz') ? '33%' : 
                             checkoutStatusText.includes('lojistik') ? '66%' : '90%'
                    }
                  ]} />
                </View>
              </View>
            )}

            {/* Success Card view */}
            {checkoutStep === 'success' && (
              <View style={styles.checkoutSuccessContainer}>
                <Ionicons name="checkmark-circle" size={80} color="#10b981" style={{ marginBottom: 16 }} />
                <Text style={styles.successTitle}>Siparişiniz Başarıyla Alındı!</Text>
                <Text style={styles.successDesc}>
                  {savedAddress 
                    ? `Ödemeniz alındı. Siparişiniz "${savedAddress}" adresinize teslim edilmek üzere kuryeye aktarıldı!`
                    : "Kayıtlı adresiniz bulunmadığından siparişiniz merkez şubemizden teslim alınmak üzere hazırlanmaktadır."}
                </Text>

                {earnedCouponCode ? (
                  <View style={styles.couponGiftCard}>
                    <Text style={styles.giftTitle}>🎁 TEBRİKLER! HEDİYE KUPON</Text>
                    <Text style={styles.giftDesc}>Alışverişiniz için %10 değerinde sonraki siparişte geçerli indirim kodu kazandınız:</Text>
                    <Text style={styles.giftCode}>{earnedCouponCode}</Text>
                    <Text style={styles.giftExpire}>7 Gün Geçerli</Text>
                  </View>
                ) : null}

                <Text style={styles.successTip}>
                  💡 Siparişinizi canlı kurye motoruyla "Profil" sayfasındaki Canlı Takip ekranından izleyebilirsiniz!
                </Text>

                <TouchableOpacity 
                  onPress={closeCheckoutFlow}
                  style={[styles.btnFinalPay, { backgroundColor: '#6b21a8', marginTop: 10 }]}
                >
                  <Text style={styles.btnFinalPayText}>Pencereleri Kapat</Text>
                </TouchableOpacity>
              </View>
            )}
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf5ff',
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
  // Search bar
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#f3e8ff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    margin: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '600',
  },
  // Loader and offline
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
  // Accordion lists
  accordionContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  categoryBlock: {
    marginBottom: 14,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#f3e8ff',
    borderRadius: 20,
    shadowColor: '#6b21a8',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  categoryHeaderActive: {
    backgroundColor: '#6b21a8',
    borderColor: '#6b21a8',
  },
  categoryHeaderText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#6b21a8',
  },
  categoryHeaderTextActive: {
    color: '#fff',
  },
  categoryContentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  // Product Card Layout
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#f3e8ff',
    width: (width - 48) / 2 - 2,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  productCardActive: {
    borderColor: '#c084fc',
    borderWidth: 1.5,
  },
  productImage: {
    width: '100%',
    height: 100,
    marginBottom: 8,
  },
  productCardBody: {
    gap: 4,
  },
  productName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1f2937',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  oldPrice: {
    fontSize: 10,
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },
  newPrice: {
    fontSize: 13,
    fontWeight: '900',
    color: '#10b981',
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#e6fffa',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  stockText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#14b8a6',
  },
  // Detail dropdown
  productDetailsDropdown: {
    marginTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: '#f3e8ff',
    paddingTop: 8,
    gap: 6,
  },
  expiryLabel: {
    fontSize: 8,
    color: '#6b7280',
    fontWeight: '700',
  },
  expiryBadge: {
    backgroundColor: '#fff1f2',
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  expiryText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#f43f5e',
  },
  btnAddToCartInline: {
    backgroundColor: '#6b21a8',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 4,
  },
  btnAddToCartInlineText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
  },
  // Qty counter indicators on card
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#faf5ff',
    borderWidth: 1,
    borderColor: '#e9d5ff',
    borderRadius: 10,
    padding: 3,
    marginTop: 6,
  },
  counterBtn: {
    backgroundColor: '#6b21a8',
    width: 20,
    height: 20,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterValue: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6b21a8',
  },
  // Floating Action Button
  cartFAB: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6b21a8',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6b21a8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
  },
  cartFABBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartFABBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
  },
  // Modal Bottom Sheets
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: '85%',
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3e8ff',
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#6b21a8',
  },
  modalSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#a855f7',
    marginTop: 2,
  },
  cartItemsScroll: {
    paddingBottom: 40,
  },
  cartItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3e8ff',
  },
  cartItemPhoto: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
    marginRight: 12,
  },
  cartItemName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 2,
  },
  cartItemPrice: {
    fontSize: 11,
    color: '#6b21a8',
    fontWeight: '700',
  },
  cartQuantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#faf5ff',
    borderWidth: 1,
    borderColor: '#e9d5ff',
    borderRadius: 8,
    padding: 2,
    marginRight: 10,
  },
  cartQtyBtn: {
    width: 18,
    height: 18,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartQtyVal: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6b21a8',
    paddingHorizontal: 8,
  },
  btnDeleteCartItem: {
    padding: 6,
  },
  // Coupon System styles
  couponSection: {
    marginTop: 16,
    backgroundColor: '#faf5ff',
    borderWidth: 1,
    borderColor: '#e9d5ff',
    borderRadius: 16,
    padding: 14,
  },
  couponSectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6b21a8',
    marginBottom: 8,
  },
  couponInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  couponInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e9d5ff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 12,
    color: '#1f2937',
    fontWeight: '700',
  },
  btnApplyCoupon: {
    backgroundColor: '#6b21a8',
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  btnApplyCouponText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  appliedCouponTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6fffa',
    borderWidth: 0.5,
    borderColor: '#a3e635',
    borderRadius: 8,
    padding: 8,
    marginTop: 10,
  },
  appliedCouponText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#10b981',
  },
  // Checkout Summary Card
  checkoutSummaryCard: {
    marginTop: 16,
    backgroundColor: '#faf8ff',
    borderWidth: 1.5,
    borderColor: '#f3e8ff',
    borderRadius: 20,
    padding: 16,
  },
  summaryItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 12,
    color: '#1f2937',
    fontWeight: '700',
  },
  summaryTotalLabel: {
    fontSize: 13,
    fontWeight: '900',
    color: '#6b21a8',
  },
  summaryTotalValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#10b981',
  },
  btnCheckoutAction: {
    backgroundColor: '#10b981',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 20,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 3,
  },
  btnCheckoutActionText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },
  // Simulated payment form
  checkoutFormScroll: {
    paddingBottom: 40,
  },
  addressSummaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#faf5ff',
    borderWidth: 1,
    borderColor: '#e9d5ff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },
  addressSummaryTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6b21a8',
    marginBottom: 2,
  },
  addressSummaryDesc: {
    fontSize: 11,
    color: '#4b5563',
    lineHeight: 15,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#374151',
    marginBottom: 8,
  },
  paymentMethodsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  paymentMethodBtn: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    padding: 10,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#f3e8ff',
    borderRadius: 14,
  },
  paymentMethodBtnActive: {
    backgroundColor: '#6b21a8',
    borderColor: '#6b21a8',
  },
  paymentMethodText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#6b21a8',
  },
  paymentMethodTextActive: {
    color: '#fff',
  },
  cardForm: {
    gap: 12,
  },
  formLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4b5563',
    marginBottom: -4,
  },
  formInput: {
    backgroundColor: '#faf5ff',
    borderWidth: 1,
    borderColor: '#e9d5ff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: '#1f2937',
    fontWeight: '600',
  },
  offlinePaymentNotice: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#faf8ff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e9d5ff',
    marginBottom: 12,
  },
  offlineNoticeTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#6b21a8',
    marginBottom: 4,
  },
  offlineNoticeDesc: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  btnFinalPay: {
    backgroundColor: '#10b981',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  btnFinalPayText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },
  // Step loader view
  simulatedLoaderContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  simulatedLoaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 4,
  },
  simulatedLoaderStatusText: {
    fontSize: 13,
    color: '#6b21a8',
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  simulatedStepsProgressBg: {
    width: '80%',
    height: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  simulatedStepsProgressFill: {
    height: '100%',
    backgroundColor: '#6b21a8',
    borderRadius: 3,
  },
  // Success Card Styles
  checkoutSuccessContainer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#10b981',
    marginBottom: 8,
  },
  successDesc: {
    fontSize: 12,
    color: '#4b5563',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  couponGiftCard: {
    width: '100%',
    backgroundColor: '#e6fffa',
    borderWidth: 1.5,
    borderColor: '#059669',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  giftTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#047857',
    marginBottom: 4,
  },
  giftDesc: {
    fontSize: 10,
    color: '#065f46',
    textAlign: 'center',
    marginBottom: 10,
  },
  giftCode: {
    fontSize: 18,
    fontWeight: '900',
    color: '#047857',
    letterSpacing: 2,
    borderWidth: 1,
    borderColor: '#059669',
    borderStyle: 'dashed',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  giftExpire: {
    fontSize: 8,
    color: '#059669',
    fontWeight: '700',
    marginTop: 6,
  },
  successTip: {
    fontSize: 11,
    color: '#6b21a8',
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 15,
    fontStyle: 'italic',
    paddingHorizontal: 10,
  },
});
