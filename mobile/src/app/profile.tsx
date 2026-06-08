import { useState, useEffect, useRef } from 'react';
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

const { width } = Dimensions.get('window');

// Host IP Auto-Discovery Helper
const getAutoDiscoverIp = () => {
  const hostUri = Constants.expoConfig?.hostUri; // e.g. "192.168.1.35:8081"
  if (hostUri) {
    return hostUri.split(':')[0];
  }
  return '192.168.1.100'; // Default developer fallback IP
};

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState<'profile' | 'orders_coupons' | 'feedback'>('profile');
  
  // Server Configuration
  const [baseIp] = useState<string>(getAutoDiscoverIp());
  const [activeApiUrl, setActiveApiUrl] = useState<string>(`http://${getAutoDiscoverIp()}:8000/api`);

  // Profile Form States
  const [fullName, setFullName] = useState('Ahmet Yılmaz');
  const [phone, setPhone] = useState('0555 123 4567');
  const [email, setEmail] = useState('ahmet@example.com');
  const [address, setAddress] = useState('');

  // Orders & Coupons States
  const [orders, setOrders] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [hasActiveOrder, setHasActiveOrder] = useState(false);

  // Live Tracking States
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [courierProgress, setCourierProgress] = useState(0); // 0 to 100
  const [deliveryMinutes, setDeliveryMinutes] = useState(15);
  const trackingInterval = useRef<any>(null);

  // Feedback States (Backend API integration)
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // 1. Load Local Storage Profile, Orders and Coupons
  const loadLocalData = () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      // Profile
      const storedProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
      if (storedProfile.name) setFullName(storedProfile.name);
      if (storedProfile.phone) setPhone(storedProfile.phone);
      if (storedProfile.email) setEmail(storedProfile.email);
      if (storedProfile.address) setAddress(storedProfile.address);

      // Orders
      const storedOrders = JSON.parse(localStorage.getItem('myOrders') || '[]');
      setOrders(storedOrders);

      // Coupons
      const storedCoupons = JSON.parse(localStorage.getItem('myCoupons') || '[]');
      setCoupons(storedCoupons);

      // Active order status
      const isActive = localStorage.getItem('activeOrder') === 'true';
      setHasActiveOrder(isActive);
    }
  };

  // Save Profile to Local Storage
  const handleSaveProfile = () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const profileObj = {
        name: fullName,
        phone: phone,
        email: email,
        address: address
      };
      localStorage.setItem('userProfile', JSON.stringify(profileObj));
      alert("Profil bilgileri başarıyla kaydedildi! 💾");
    } else {
      alert("Bilgiler yerel olarak kaydedildi.");
    }
  };

  // 2. Load Feedback List from Django backend
  const loadFeedbacks = () => {
    setFeedbackLoading(true);
    fetch(`${activeApiUrl}/feedback/`)
      .then(res => res.json())
      .then(data => {
        setFeedbacks(data);
        setFeedbackLoading(false);
      })
      .catch(err => {
        console.error("Feedback loading error:", err);
        // Fallback offline reviews
        setFeedbacks([
          { id: 1, comment: "Özel sepet özelliği harika çalışıyor! Ürünler tam SKT'sine uygun geldi.", rating: 5, created_at: new Date().toISOString() },
          { id: 2, comment: "Kurye siparişimi 10 dakikada getirdi, harita üzerinden takip etmek çok keyifliydi.", rating: 5, created_at: new Date().toISOString() },
          { id: 3, comment: "Apriori analizleriyle önerilen sepetlerde çok güzel indirimler yakaladım.", rating: 4, created_at: new Date().toISOString() }
        ]);
        setFeedbackLoading(false);
      });
  };

  // Submit new feedback to Django backend
  const handleSubmitFeedback = () => {
    if (!newComment.trim()) {
      alert("Lütfen yorumunuzu yazın!");
      return;
    }

    setSubmittingFeedback(true);
    const feedbackPayload = {
      comment: newComment,
      rating: newRating
    };

    fetch(`${activeApiUrl}/feedback/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(feedbackPayload)
    })
      .then(res => {
        if (!res.ok) throw new Error("API error");
        return res.json();
      })
      .then(data => {
        setNewComment('');
        setNewRating(5);
        setSubmittingFeedback(false);
        alert("Değerlendirmeniz başarıyla veritabanına iletildi! Teşekkürler. 🌟");
        loadFeedbacks(); // Refresh
      })
      .catch(err => {
        console.error("Submit feedback error:", err);
        // Offline Mock Fallback
        const mockNew = {
          id: Date.now(),
          comment: newComment,
          rating: newRating,
          created_at: new Date().toISOString()
        };
        setFeedbacks(prev => [mockNew, ...prev]);
        setNewComment('');
        setNewRating(5);
        setSubmittingFeedback(false);
        alert("Değerlendirmeniz kaydedildi (Çevrimdışı Mod). 🌟");
      });
  };

  useEffect(() => {
    loadLocalData();
    loadFeedbacks();
    
    // Periodically sync orders/coupons/activeOrder in case changes are made in catalog screen
    const syncInterval = setInterval(() => {
      loadLocalData();
    }, 1500);

    return () => {
      clearInterval(syncInterval);
      if (trackingInterval.current) clearInterval(trackingInterval.current);
    };
  }, [activeApiUrl]);

  // 3. Live Courier Tracking Simulation Logic
  const startTrackingSimulation = () => {
    setCourierProgress(0);
    setDeliveryMinutes(12);
    setIsTrackingOpen(true);

    if (trackingInterval.current) clearInterval(trackingInterval.current);

    trackingInterval.current = setInterval(() => {
      setCourierProgress(prev => {
        if (prev >= 100) {
          clearInterval(trackingInterval.current);
          return 100;
        }
        
        // Progress increases smoothly
        const nextProgress = prev + 5;
        
        // Decrease delivery minutes proportionally
        if (nextProgress === 25) setDeliveryMinutes(9);
        else if (nextProgress === 50) setDeliveryMinutes(6);
        else if (nextProgress === 75) setDeliveryMinutes(3);
        else if (nextProgress === 100) setDeliveryMinutes(0);

        return nextProgress;
      });
    }, 1500); // 1.5 seconds per step
  };

  const closeTrackingSimulation = () => {
    setIsTrackingOpen(false);
    if (trackingInterval.current) clearInterval(trackingInterval.current);
  };

  const handleDeliverComplete = () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('activeOrder');
    }
    setHasActiveOrder(false);
    closeTrackingSimulation();
    alert("Siparişinizi afiyetle tüketin! 🏁 Kuponlarınızı ve yeni sipariş geçmişinizi incelemeyi unutmayın.");
  };

  // Get dynamic tracking status texts
  const getCourierStatusMessage = () => {
    if (courierProgress === 0) return "Sipariş onaylandı, depoda paketleniyor...";
    if (courierProgress <= 20) return "Şube lojistiği tamamlandı, kurye şubeden çıkmak üzere!";
    if (courierProgress <= 50) return "Kuryemiz siparişi teslim aldı ve yola çıktı! 🏍️";
    if (courierProgress <= 80) return "Kurye Beşiktaş Caddesi yönünde hızla ilerliyor...";
    if (courierProgress < 100) return "Kurye adresinize ulaştı, binaya giriş yapıyor...";
    return "Kurye kapınızda! Siparişinizi teslim alabilirsiniz. 🏁";
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* App Bar Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>👤 Kullanıcı İşlem Hub'ı</Text>
        <Text style={styles.headerSubtitle}>PROFİL, SİPARİŞLER & CANLI TAKİP</Text>
      </View>

      {/* Tabs Row Segment Switcher */}
      <View style={styles.tabsRow}>
        <TouchableOpacity 
          onPress={() => setActiveTab('profile')}
          style={[styles.tabButton, activeTab === 'profile' && styles.tabButtonActive]}
        >
          <Ionicons name="person" size={14} color={activeTab === 'profile' ? '#fff' : '#6b21a8'} style={{ marginRight: 4 }} />
          <Text style={[styles.tabButtonText, activeTab === 'profile' && styles.tabButtonTextActive]}>
            Profilim
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => setActiveTab('orders_coupons')}
          style={[styles.tabButton, activeTab === 'orders_coupons' && styles.tabButtonActive]}
        >
          <Ionicons name="receipt" size={14} color={activeTab === 'orders_coupons' ? '#fff' : '#6b21a8'} style={{ marginRight: 4 }} />
          <Text style={[styles.tabButtonText, activeTab === 'orders_coupons' && styles.tabButtonTextActive]}>
            Sipariş & Kuponlar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => setActiveTab('feedback')}
          style={[styles.tabButton, activeTab === 'feedback' && styles.tabButtonActive]}
        >
          <Ionicons name="chatbubbles" size={14} color={activeTab === 'feedback' ? '#fff' : '#6b21a8'} style={{ marginRight: 4 }} />
          <Text style={[styles.tabButtonText, activeTab === 'feedback' && styles.tabButtonTextActive]}>
            Değerlendirmeler
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main content body based on Segment Selection */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Tab 1: Profile & Delivery Address Settings */}
        {activeTab === 'profile' && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>📋 Kişisel Bilgiler ve Adres Ayarı</Text>
            <Text style={styles.formDesc}>
              Teslimat adresinizi girerek özel siparişlerinizin evinize canlı kuryeyle teslim edilmesini sağlayabilirsiniz:
            </Text>

            <Text style={styles.inputLabel}>Ad Soyad</Text>
            <TextInput 
              value={fullName}
              onChangeText={setFullName}
              style={styles.textInput}
              placeholder="Adınızı ve soyadınızı girin"
              placeholderTextColor="#9ca3af"
            />

            <Text style={styles.inputLabel}>Telefon Numarası</Text>
            <TextInput 
              value={phone}
              onChangeText={setPhone}
              style={styles.textInput}
              placeholder="Örn: 0555 123 45 67"
              keyboardType="phone-pad"
              placeholderTextColor="#9ca3af"
            />

            <Text style={styles.inputLabel}>E-posta Adresi</Text>
            <TextInput 
              value={email}
              onChangeText={setEmail}
              style={styles.textInput}
              placeholder="e-posta@adresiniz.com"
              keyboardType="email-address"
              placeholderTextColor="#9ca3af"
            />

            <Text style={styles.inputLabel}>🏠 Teslimat Adresi</Text>
            <TextInput 
              value={address}
              onChangeText={setAddress}
              style={[styles.textInput, styles.textAreaInput]}
              placeholder="Siparişlerinizin ulaştırılacağı detaylı adresi giriniz"
              multiline
              numberOfLines={4}
              placeholderTextColor="#9ca3af"
            />

            <TouchableOpacity onPress={handleSaveProfile} style={styles.btnSaveProfile}>
              <Ionicons name="save" size={16} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.btnSaveProfileText}>Profil Ayarlarını Kaydet</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Tab 2: Orders & Loyalty Coupons */}
        {activeTab === 'orders_coupons' && (
          <View style={{ gap: 20 }}>
            {/* Active order courier tracking card banner */}
            {hasActiveOrder ? (
              <TouchableOpacity 
                onPress={startTrackingSimulation}
                style={styles.activeOrderBanner}
                activeOpacity={0.9}
              >
                <Ionicons name="bicycle" size={36} color="#fff" style={{ marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.activeOrderBannerTitle}>Siparişiniz Yolda! 🚚</Text>
                  <Text style={styles.activeOrderBannerDesc}>
                    Kuryeniz yola çıktı. Harita üzerinden canlı izlemek için tıklayın!
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#fff" />
              </TouchableOpacity>
            ) : null}

            {/* Coupons Loyalty Section */}
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="ticket" size={20} color="#6b21a8" style={{ marginRight: 6 }} />
              <Text style={styles.sectionTitle}>Aktif İndirim Kuponlarım</Text>
            </View>

            {coupons.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons name="ticket-outline" size={40} color="#9ca3af" style={{ marginBottom: 8 }} />
                <Text style={styles.emptyText}>Aktif kuponunuz bulunmamaktadır.</Text>
                <Text style={styles.emptySubText}>50 TL üzerindeki her alışverişinizde %10 hediye kupon kodu kazanırsınız!</Text>
              </View>
            ) : (
              <View style={{ gap: 12 }}>
                {coupons.map((coupon, idx) => {
                  const isExpired = new Date() > new Date(coupon.expiresAt);
                  const expDateStr = new Date(coupon.expiresAt).toLocaleDateString('tr-TR');
                  
                  let statusColor = "#10b981"; // Green ready
                  let statusText = "Kullanıma Hazır";
                  if (coupon.isUsed) {
                    statusColor = "#ef4444"; // Used
                    statusText = "Kullanıldı";
                  } else if (isExpired) {
                    statusColor = "#6b7280"; // Expired
                    statusText = "Süresi Doldu";
                  }

                  return (
                    <View 
                      key={coupon.code || idx} 
                      style={[
                        styles.couponCard, 
                        coupon.isUsed && styles.couponCardUsed, 
                        !coupon.isUsed && isExpired && styles.couponCardExpired
                      ]}
                    >
                      <View style={styles.couponCardLeft}>
                        <Text style={styles.couponCardDiscountLabel}>İNDİRİM TUTARI</Text>
                        <Text style={styles.couponCardDiscountVal}>{parseFloat(coupon.discountAmount).toFixed(2)} TL</Text>
                        <Text style={styles.couponCardExpire}>Son Kullanım: {expDateStr}</Text>
                      </View>

                      <View style={styles.couponCardDivider}>
                        <View style={styles.notchTop} />
                        <View style={styles.dashedLine} />
                        <View style={styles.notchBottom} />
                      </View>

                      <View style={styles.couponCardRight}>
                        <Text style={styles.couponCardCode}>{coupon.code}</Text>
                        <View style={[styles.couponStatusBadge, { backgroundColor: statusColor + '1A' }]}>
                          <Text style={[styles.couponStatusText, { color: statusColor }]}>{statusText}</Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Orders History Section */}
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="receipt" size={20} color="#6b21a8" style={{ marginRight: 6 }} />
              <Text style={styles.sectionTitle}>Sipariş Geçmişim</Text>
            </View>

            {orders.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons name="cube-outline" size={40} color="#9ca3af" style={{ marginBottom: 8 }} />
                <Text style={styles.emptyText}>Henüz kayıtlı bir sipariş bulunmamaktadır.</Text>
                <Text style={styles.emptySubText}>Akıllı sepetlerimizden veya katalogdan satın aldığınız siparişler burada listelenir.</Text>
              </View>
            ) : (
              <View style={{ gap: 14 }}>
                {orders.map((order, idx) => (
                  <View key={idx} style={styles.orderCard}>
                    <View style={styles.orderCardHeader}>
                      <Text style={styles.orderNo}>Sipariş #{orders.length - idx}</Text>
                      <Text style={styles.orderDate}>{order.date}</Text>
                    </View>

                    {/* Horizontal list of items in the order */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.orderChipsScroll}>
                      {order.items.map((it: any, iIdx: number) => (
                        <View key={iIdx} style={styles.orderItemChip}>
                          <Text style={styles.orderItemChipText}>{it.name.split(' #')[0]}</Text>
                        </View>
                      ))}
                    </ScrollView>

                    <Text style={styles.orderPrice}>Toplam Tutar: <Text style={{ color: '#10b981', fontWeight: '900' }}>{order.total}</Text></Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Tab 3: Feedbacks submissions and list reviews (Django DB) */}
        {activeTab === 'feedback' && (
          <View style={{ gap: 20 }}>
            {/* Feedback Submit form */}
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>✍️ Deneyiminizi Değerlendirin</Text>
              <Text style={styles.formDesc}>
                TrendSepetiX karar destek algoritmaları ve sipariş süreçleri hakkındaki yorumlarınızı doğrudan Django veri tabanımıza kaydedebilirsiniz:
              </Text>

              {/* Rating stars selector */}
              <View style={styles.ratingSelector}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => setNewRating(star)} style={{ padding: 4 }}>
                    <Ionicons 
                      name={star <= newRating ? "star" : "star-outline"} 
                      size={28} 
                      color="#eab308" 
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput 
                value={newComment}
                onChangeText={setNewComment}
                style={[styles.textInput, styles.feedbackAreaInput]}
                placeholder="Yorum ve deneyimlerinizi buraya yazın..."
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={3}
              />

              <TouchableOpacity 
                onPress={handleSubmitFeedback} 
                style={styles.btnSubmitFeedback}
                disabled={submittingFeedback}
              >
                {submittingFeedback ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="send" size={14} color="#fff" style={{ marginRight: 6 }} />
                    <Text style={styles.btnSaveProfileText}>Değerlendirmeyi Gönder</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* List dynamically loaded reviews from django database */}
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="people" size={20} color="#6b21a8" style={{ marginRight: 6 }} />
              <Text style={styles.sectionTitle}>Son Müşteri Değerlendirmeleri</Text>
            </View>

            {feedbackLoading ? (
              <ActivityIndicator size="large" color="#6b21a8" style={{ marginVertical: 20 }} />
            ) : feedbacks.length === 0 ? (
              <Text style={styles.emptyText}>Henüz hiç değerlendirme yazılmamış.</Text>
            ) : (
              <View style={{ gap: 12 }}>
                {feedbacks.map((f: any) => (
                  <View key={f.id} style={styles.feedbackCard}>
                    <View style={styles.feedbackCardHeader}>
                      <View style={{ flexDirection: 'row', gap: 2 }}>
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Ionicons 
                            key={idx}
                            name={idx < f.rating ? "star" : "star-outline"} 
                            size={12} 
                            color="#eab308" 
                          />
                        ))}
                      </View>
                      <Text style={styles.feedbackDate}>
                        {f.created_at ? new Date(f.created_at).toLocaleDateString('tr-TR') : 'Bugün'}
                      </Text>
                    </View>
                    <Text style={styles.feedbackComment}>{f.comment}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* 4. Full-screen Courier Tracking Simulation Canvas Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isTrackingOpen}
        onRequestClose={closeTrackingSimulation}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.bottomSheet, { height: '90%', maxHeight: '90%' }]}>
            
            {/* Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>📍 Canlı Sipariş Takibi</Text>
                <Text style={styles.modalSubtitle}>TrendSepetiX Akıllı Lojistik Entegrasyonu</Text>
              </View>
              <TouchableOpacity onPress={closeTrackingSimulation}>
                <Ionicons name="close-circle-sharp" size={26} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.trackingScroll}>
              
              {/* ETA Display Card */}
              <View style={styles.etaCard}>
                <View>
                  <Text style={styles.etaTitle}>TAHMİNİ TESLİMAT SÜRESİ</Text>
                  <Text style={styles.etaTime}>{deliveryMinutes > 0 ? `${deliveryMinutes} Dakika` : 'Kurye Kapıda!'}</Text>
                </View>
                <View style={styles.etaIconContainer}>
                  <Ionicons name="alarm-outline" size={24} color="#6b21a8" />
                </View>
              </View>

              {/* HIGH FIDELITY ANIMATED SIMULATION CANVAS PATH */}
              <View style={styles.simulationCanvas}>
                
                {/* Store Point */}
                <View style={[styles.nodePoint, { left: 16, top: 40 }]}>
                  <View style={styles.storeIconBg}>
                    <Ionicons name="storefront" size={16} color="#fff" />
                  </View>
                  <Text style={styles.nodeLabel}>Merkez Şube</Text>
                </View>

                {/* Dotted path route track line */}
                <View style={styles.trackPathBg}>
                  {/* Neon animated progress fill indicator */}
                  <View style={[styles.trackPathFill, { width: `${courierProgress}%` }]} />
                  
                  {/* Moving courier motorbike */}
                  <View style={[
                    styles.courierMotorbike, 
                    { left: `${Math.min(92, Math.max(0, courierProgress - 2))}%` }
                  ]}>
                    <View style={styles.motorbikePulseBg}>
                      <Ionicons name="bicycle" size={22} color="#fff" />
                    </View>
                  </View>
                </View>

                {/* Home Point */}
                <View style={[styles.nodePoint, { right: 16, top: 40 }]}>
                  <View style={styles.homeIconBg}>
                    <Ionicons name="home" size={16} color="#fff" />
                  </View>
                  <Text style={styles.nodeLabel}>Teslimat Evi</Text>
                </View>

              </View>

              {/* Status Update card */}
              <View style={styles.trackingLogCard}>
                <Text style={styles.logCardTitle}>🧭 Kurye Konum ve Durum Güncellemesi</Text>
                <Text style={styles.logCardStatusText}>{getCourierStatusMessage()}</Text>

                {/* Historical checkpoints */}
                <View style={styles.logSteps}>
                  
                  <View style={styles.logStepRow}>
                    <View style={[styles.stepDot, courierProgress >= 0 && styles.stepDotActive]} />
                    <Text style={[styles.stepText, courierProgress >= 0 && styles.stepTextActive]}>
                      Siparişiniz sistem tarafından onaylandı ve paketlendi.
                    </Text>
                  </View>

                  <View style={styles.logStepRow}>
                    <View style={[styles.stepDot, courierProgress >= 20 && styles.stepDotActive]} />
                    <Text style={[styles.stepText, courierProgress >= 20 && styles.stepTextActive]}>
                      Kurye şubeden çıkış yaptı, hızlı rotadan Beşiktaş yönünde ilerliyor.
                    </Text>
                  </View>

                  <View style={styles.logStepRow}>
                    <View style={[styles.stepDot, courierProgress >= 50 && styles.stepDotActive]} />
                    <Text style={[styles.stepText, courierProgress >= 50 && styles.stepTextActive]}>
                      Kurye caddenize yaklaştı, trafik ışıkları geçiliyor. (~2.4 km kaldı)
                    </Text>
                  </View>

                  <View style={styles.logStepRow}>
                    <View style={[styles.stepDot, courierProgress >= 100 && styles.stepDotActive]} />
                    <Text style={[styles.stepText, courierProgress >= 100 && styles.stepTextActive]}>
                      Kurye binanıza ulaştı, siparişiniz kapınıza teslim edilmektedir!
                    </Text>
                  </View>

                </View>
              </View>

              {/* Complete button shown only when 100% progress */}
              {courierProgress === 100 ? (
                <TouchableOpacity 
                  onPress={handleDeliverComplete}
                  style={styles.btnCompleteTracking}
                >
                  <Ionicons name="checkmark-done" size={20} color="#fff" style={{ marginRight: 6 }} />
                  <Text style={styles.btnCompleteTrackingText}>Siparişi Teslim Aldım</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  onPress={closeTrackingSimulation}
                  style={styles.btnCancelTracking}
                >
                  <Text style={styles.btnCancelTrackingText}>Haritayı Kapat</Text>
                </TouchableOpacity>
              )}

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
  // Switch Tabs Row
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
    fontSize: 11,
    fontWeight: '800',
    color: '#6b21a8',
  },
  tabButtonTextActive: {
    color: '#fff',
  },
  // Scroll Containers
  scrollContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#f3e8ff',
    padding: 20,
    shadowColor: '#6b21a8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  formTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1f2937',
    marginBottom: 6,
  },
  formDesc: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 18,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6b21a8',
    marginTop: 10,
    marginBottom: 6,
  },
  textInput: {
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
  textAreaInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  btnSaveProfile: {
    backgroundColor: '#6b21a8',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
  },
  btnSaveProfileText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 12,
  },
  // Active order flashing tracking card banner
  activeOrderBanner: {
    backgroundColor: '#8b5cf6',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 24,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#a78bfa',
  },
  activeOrderBannerTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#fff',
  },
  activeOrderBannerDesc: {
    fontSize: 11,
    color: '#ddd6fe',
    marginTop: 2,
  },
  // Section Headers
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#374151',
  },
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f3e8ff',
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#374151',
    marginTop: 8,
  },
  emptySubText: {
    fontSize: 11,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 15,
  },
  // Coupon ticket cards layout
  couponCard: {
    backgroundColor: '#10b981',
    flexDirection: 'row',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  couponCardExpired: {
    backgroundColor: '#9ca3af',
    shadowOpacity: 0,
    elevation: 0,
  },
  couponCardUsed: {
    backgroundColor: '#ef4444',
    shadowOpacity: 0,
    elevation: 0,
  },
  couponCardLeft: {
    flex: 2,
    padding: 16,
    justifyContent: 'center',
  },
  couponCardDiscountLabel: {
    fontSize: 8,
    color: '#fff',
    fontWeight: '700',
    opacity: 0.8,
  },
  couponCardDiscountVal: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fff',
    marginVertical: 2,
  },
  couponCardExpire: {
    fontSize: 9,
    color: '#fff',
    fontWeight: '700',
    opacity: 0.9,
  },
  couponCardDivider: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
  },
  notchTop: {
    width: 20,
    height: 10,
    borderRadius: 10,
    backgroundColor: '#faf5ff',
    position: 'absolute',
    top: -5,
  },
  dashedLine: {
    flex: 1,
    width: 1,
    borderWidth: 0.5,
    borderColor: '#fff',
    borderStyle: 'dashed',
    marginVertical: 10,
  },
  notchBottom: {
    width: 20,
    height: 10,
    borderRadius: 10,
    backgroundColor: '#faf5ff',
    position: 'absolute',
    bottom: -5,
  },
  couponCardRight: {
    flex: 1.5,
    backgroundColor: '#ffffff20',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  couponCardCode: {
    fontSize: 14,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1,
    marginBottom: 6,
  },
  couponStatusBadge: {
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  couponStatusText: {
    fontSize: 8,
    fontWeight: '900',
  },
  // Order Card layouts
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f3e8ff',
    padding: 16,
  },
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 0.5,
    borderBottomColor: '#f3e8ff',
    paddingBottom: 8,
    marginBottom: 10,
  },
  orderNo: {
    fontSize: 12,
    fontWeight: '900',
    color: '#6b21a8',
  },
  orderDate: {
    fontSize: 10,
    color: '#9ca3af',
    fontWeight: '700',
  },
  orderChipsScroll: {
    gap: 8,
    paddingVertical: 4,
  },
  orderItemChip: {
    backgroundColor: '#faf5ff',
    borderWidth: 0.5,
    borderColor: '#e9d5ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  orderItemChipText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#6b21a8',
  },
  orderPrice: {
    fontSize: 11,
    fontWeight: '800',
    color: '#374151',
    marginTop: 10,
    textAlign: 'right',
  },
  // Feedback layout styles
  feedbackAreaInput: {
    height: 60,
    textAlignVertical: 'top',
  },
  ratingSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginVertical: 10,
  },
  btnSubmitFeedback: {
    backgroundColor: '#10b981',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 14,
  },
  feedbackCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f3e8ff',
    padding: 14,
  },
  feedbackCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  feedbackDate: {
    fontSize: 9,
    color: '#9ca3af',
    fontWeight: '700',
  },
  feedbackComment: {
    fontSize: 12,
    color: '#4b5563',
    lineHeight: 16,
  },
  // Modal styles for Live Tracking
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
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
  trackingScroll: {
    paddingBottom: 40,
  },
  etaCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#faf5ff',
    borderWidth: 1.5,
    borderColor: '#e9d5ff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
  },
  etaTitle: {
    fontSize: 9,
    fontWeight: '900',
    color: '#6b21a8',
    letterSpacing: 0.5,
  },
  etaTime: {
    fontSize: 22,
    fontWeight: '900',
    color: '#6b21a8',
    marginTop: 2,
  },
  etaIconContainer: {
    backgroundColor: '#fff',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9d5ff',
  },
  // Simulation Map Path Canvas
  simulationCanvas: {
    height: 140,
    backgroundColor: '#1e1b4b', // Deep night blueprint dark blue
    borderRadius: 24,
    position: 'relative',
    marginVertical: 10,
    paddingHorizontal: 20,
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#312e81',
    shadowColor: '#6b21a8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 3,
  },
  nodePoint: {
    position: 'absolute',
    alignItems: 'center',
    width: 60,
  },
  nodeLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: '#a5b4fc',
    marginTop: 6,
    textAlign: 'center',
  },
  storeIconBg: {
    backgroundColor: '#6b21a8',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  homeIconBg: {
    backgroundColor: '#10b981',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  trackPathBg: {
    height: 6,
    backgroundColor: '#3730a3',
    borderRadius: 3,
    width: '65%',
    alignSelf: 'center',
    position: 'relative',
    justifyContent: 'center',
    marginTop: -20,
  },
  trackPathFill: {
    height: '100%',
    backgroundColor: '#10b981', // Neon green progress line
    borderRadius: 3,
  },
  courierMotorbike: {
    position: 'absolute',
    marginTop: -8,
  },
  motorbikePulseBg: {
    backgroundColor: '#d946ef', // Flashing pink background
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#fff',
    shadowColor: '#d946ef',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  // Tracking logs section
  trackingLogCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#f3e8ff',
    padding: 18,
    marginTop: 16,
  },
  logCardTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#374151',
    marginBottom: 6,
  },
  logCardStatusText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#d946ef',
    marginBottom: 16,
  },
  logSteps: {
    gap: 12,
    paddingLeft: 6,
  },
  logStepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e5e7eb',
    marginTop: 4,
  },
  stepDotActive: {
    backgroundColor: '#10b981',
  },
  stepText: {
    fontSize: 11,
    color: '#9ca3af',
    lineHeight: 15,
    flex: 1,
  },
  stepTextActive: {
    color: '#374151',
    fontWeight: '700',
  },
  btnCompleteTracking: {
    backgroundColor: '#10b981',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 24,
  },
  btnCompleteTrackingText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 14,
  },
  btnCancelTracking: {
    backgroundColor: '#374151',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  btnCancelTrackingText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
});
