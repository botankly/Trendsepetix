import { useState, useEffect, useRef } from 'react';
import './App.css';
import productsData from './products.json';
import FeedbackComponent from './FeedbackComponent';

const MOCK_SALES = [
  {
    id: 101,
    shop_name: "Trendsepeti Kadıköy Merkez",
    district: "Kadıköy",
    lat: 40.9901,
    lng: 29.0290,
    products: [
      { id: 1, name: "Kablosuz ANC Kulaklık", price: 1299, category: "Teknoloji" },
      { id: 2, name: "Akıllı Saat Pro", price: 2499, category: "Teknoloji" }
    ]
  },
  {
    id: 102,
    shop_name: "Trendsepeti Beşiktaş Sahil",
    district: "Beşiktaş",
    lat: 41.0428,
    lng: 29.0075,
    products: [
      { id: 3, name: "Pamuklu Spor Tişört", price: 349, category: "Giyim & Aksesuar" },
      { id: 4, name: "Koşu Ayakkabısı", price: 1499, category: "Spor & Outdoor" }
    ]
  },
  {
    id: 103,
    shop_name: "Trendsepeti Şişli Cevahir",
    district: "Şişli",
    lat: 41.0600,
    lng: 28.9870,
    products: [
      { id: 5, name: "Nemlendirici Yüz Kremi", price: 289, category: "Kişisel Bakım" },
      { id: 6, name: "Sıvı El Sabunu", price: 79, category: "Kişisel Bakım" }
    ]
  },
  {
    id: 104,
    shop_name: "Trendsepeti Üsküdar Çarşı",
    district: "Üsküdar",
    lat: 41.0267,
    lng: 29.0154,
    products: [
      { id: 7, name: "Organik Zeytinyağı 1L", price: 320, category: "Gıda" },
      { id: 8, name: "Premium Siyah Çay 1Kg", price: 180, category: "Gıda" }
    ]
  },
  {
    id: 105,
    shop_name: "Trendsepeti Fatih Vatan",
    district: "Fatih",
    lat: 41.0186,
    lng: 28.9438,
    products: [
      { id: 9, name: "Mikrofiber Temizlik Bezi", price: 65, category: "Temizlik" },
      { id: 10, name: "Ultra Çamaşır Suyu", price: 49, category: "Temizlik" }
    ]
  },
  {
    id: 106,
    shop_name: "Trendsepeti Sarıyer İstinye",
    district: "Sarıyer",
    lat: 41.1685,
    lng: 29.0573,
    products: [
      { id: 11, name: "Kedi Maması Premium 5Kg", price: 450, category: "Pet Shop" },
      { id: 12, name: "Kedi Kumu Kokusuz", price: 120, category: "Pet Shop" }
    ]
  },
  {
    id: 107,
    shop_name: "Trendsepeti Kadıköy Moda",
    district: "Kadıköy",
    lat: 40.9850,
    lng: 29.0250,
    products: [
      { id: 13, name: "12'li Resim Kalemi Seti", price: 150, category: "Kırtasiye" },
      { id: 14, name: "Çizgili A4 Defter", price: 55, category: "Kırtasiye" }
    ]
  },
  {
    id: 108,
    shop_name: "Trendsepeti Ataşehir Finans",
    district: "Ataşehir",
    lat: 40.9847,
    lng: 29.1064,
    products: [
      { id: 15, name: "Akıllı Saat Pro", price: 2499, category: "Teknoloji" },
      { id: 16, name: "Ergonomik Kablosuz Mouse", price: 450, category: "Teknoloji" }
    ]
  },
  {
    id: 109,
    shop_name: "Trendsepeti Bakırköy Metroport",
    district: "Bakırköy",
    lat: 40.9782,
    lng: 28.7845,
    products: [
      { id: 17, name: "Katlanabilir Kamp Sandalyesi", price: 399, category: "Spor & Outdoor" },
      { id: 18, name: "Termos 1L", price: 650, category: "Spor & Outdoor" }
    ]
  },
  {
    id: 110,
    shop_name: "Trendsepeti Kartal Sahil",
    district: "Kartal",
    lat: 40.8886,
    lng: 29.1856,
    products: [
      { id: 19, name: "Bulaşık Makinesi Tableti 30 Lu", price: 240, category: "Temizlik" },
      { id: 20, name: "Yüzey Temizleyici 2L", price: 75, category: "Temizlik" }
    ]
  },
  {
    id: 111,
    shop_name: "Trendsepeti Beylikdüzü Migros",
    district: "Beylikdüzü",
    lat: 41.0012,
    lng: 28.6419,
    products: [
      { id: 21, name: "Dekoratif Duvar Saati", price: 350, category: "Ev & Yaşam" },
      { id: 22, name: "Led Ampul 10'lu", price: 190, category: "Ev & Yaşam" }
    ]
  },
  {
    id: 112,
    shop_name: "Trendsepeti Beşiktaş Çarşı",
    district: "Beşiktaş",
    lat: 41.0435,
    lng: 29.0065,
    products: [
      { id: 23, name: "Kablosuz Klavye Türkçe", price: 799, category: "Teknoloji" },
      { id: 24, name: "Laptop Yükseltici Alüminyum", price: 350, category: "Teknoloji" }
    ]
  },
  {
    id: 113,
    shop_name: "Trendsepeti Kadıköy Rıhtım",
    district: "Kadıköy",
    lat: 40.9910,
    lng: 29.0275,
    products: [
      { id: 25, name: "Klasik Kot Ceket", price: 899, category: "Giyim & Aksesuar" },
      { id: 26, name: "Deri Kemer Siyah", price: 249, category: "Giyim & Aksesuar" }
    ]
  },
  {
    id: 114,
    shop_name: "Trendsepeti Üsküdar Sahil",
    district: "Üsküdar",
    lat: 41.0260,
    lng: 29.0145,
    products: [
      { id: 27, name: "Doğal Bal 500g", price: 240, category: "Gıda" },
      { id: 28, name: "Süzme Peynir 500 Gr", price: 140, category: "Gıda" }
    ]
  },
  {
    id: 115,
    shop_name: "Trendsepeti Şişli Bomonti",
    district: "Şişli",
    lat: 41.0590,
    lng: 28.9885,
    products: [
      { id: 29, name: "Diş Macunu Beyazlatıcı", price: 110, category: "Kişisel Bakım" },
      { id: 30, name: "Şampuan Bitkisel Özlü", price: 135, category: "Kişisel Bakım" }
    ]
  }
];

const MOCK_ANALYSIS = [
  { items: ["Kablosuz ANC Kulaklık", "Akıllı Saat Pro"], confidence: 0.85 },
  { items: ["Pamuklu Spor Tişört", "Koşu Ayakkabısı"], confidence: 0.72 },
  { items: ["Nemlendirici Yüz Kremi", "Sıvı El Sabunu"], confidence: 0.68 },
  { items: ["Kedi Maması Premium 5Kg", "Kedi Kumu Kokusuz"], confidence: 0.91 },
  { items: ["Bulaşık Makinesi Tableti 30 Lu", "Yüzey Temizleyici 2L"], confidence: 0.78 },
  { items: ["Dekoratif Duvar Saati", "Led Ampul 10'lu"], confidence: 0.62 }
];

const MOCK_AI_REPORT = `
  <h4>Trendsepetix Mağaza & Bölge Performansı AI Raporu</h4>
  <p><strong>Genel Durum Analizi:</strong> İstanbul genelindeki 10 farklı semtte yer alan aktif şubelerimizin sipariş ve ciro verileri incelenmiştir. Mevcut verilere göre, en yüksek ciroya ulaşan kategori <strong>Teknoloji</strong> ve <strong>Spor & Outdoor</strong> kategorileridir.</p>
  
  <h5>Kategori & Çapraz Satış Önerileri (Apriori Analizi)</h5>
  <p>Yapılan sepet analizi sonuçlarına göre, <strong>Kablosuz ANC Kulaklık</strong> satın alan müşterilerin %85'inin aynı zamanda <strong>Akıllı Saat Pro</strong> ürününü de sepetine eklediği gözlemlenmiştir. Bu durum, teknoloji kategorisindeki ikili paket (bundle) promosyonlarının satışları artırma potansiyeline işaret eder.</p>

  <h5>Bölgesel Satış & İndirim Stratejisi</h5>
  <p>Satış yoğunluğunun en düşük olduğu <strong>Fatih</strong> ve <strong>Beylikdüzü</strong> bölgelerinde sipariş adetlerini artırmak amacıyla sepet genelinde <strong>%20'ye varan dinamik indirim oranları</strong> uygulanması önerilmektedir. <strong>Kadıköy</strong> ve <strong>Beşiktaş</strong> gibi satışların yoğun olduğu merkezlerde ise indirim oranları %10 seviyesinde tutularak kar marjı maksimize edilebilir.</p>
`;

function App() {
  const [sales, setSales] = useState<any[]>([]);
  const [analysis, setAnalysis] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'map' | 'charts' | 'discount'>('dashboard');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Shopping Cart States
  const [cart, setCart] = useState<any[]>([]);
  const [showCartModal, setShowCartModal] = useState<boolean>(false);

  const handleAddToCart = (product: any) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId: number, amount: number) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.id === productId ? { ...item, quantity: item.quantity + amount } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // Authentication States
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('web_auth') === 'true';
  });
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  const [currentUser, setCurrentUser] = useState<any>(() => {
    const saved = localStorage.getItem('web_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  // Login Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Signup Form States
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupError, setSignupError] = useState('');
  const [signupSuccess, setSignupSuccess] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginEmail || !loginPassword) {
      setLoginError('Lütfen tüm alanları doldurun.');
      return;
    }

    // Retrieve users list from localStorage to validate
    const registeredUsersRaw = localStorage.getItem('web_users_db');
    const registeredUsers = registeredUsersRaw ? JSON.parse(registeredUsersRaw) : [];

    // Prepopulate with a default admin user if database is empty
    const defaultUser = { name: 'Ahmet Yılmaz', email: 'admin@trendsepetix.com', password: 'admin' };
    const allUsers = [defaultUser, ...registeredUsers];

    const match = allUsers.find(u => u.email.toLowerCase() === loginEmail.toLowerCase() && u.password === loginPassword);
    if (match) {
      setIsAuthenticated(true);
      setCurrentUser(match);
      localStorage.setItem('web_auth', 'true');
      localStorage.setItem('web_user', JSON.stringify(match));
      // Clear forms
      setLoginEmail('');
      setLoginPassword('');
    } else {
      setLoginError('E-posta adresi veya şifre hatalı.');
    }
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');
    setSignupSuccess('');

    if (!signupName || !signupEmail || !signupPassword || !signupConfirmPassword) {
      setSignupError('Lütfen tüm alanları doldurun.');
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      setSignupError('Şifreler uyuşmuyor.');
      return;
    }

    if (signupPassword.length < 4) {
      setSignupError('Şifre en az 4 karakter olmalıdır.');
      return;
    }

    const registeredUsersRaw = localStorage.getItem('web_users_db');
    const registeredUsers = registeredUsersRaw ? JSON.parse(registeredUsersRaw) : [];

    if (registeredUsers.some((u: any) => u.email.toLowerCase() === signupEmail.toLowerCase()) || signupEmail.toLowerCase() === 'admin@trendsepetix.com') {
      setSignupError('Bu e-posta adresi zaten kullanımda.');
      return;
    }

    const newUser = { name: signupName, email: signupEmail, password: signupPassword };
    const updatedUsers = [...registeredUsers, newUser];
    localStorage.setItem('web_users_db', JSON.stringify(updatedUsers));

    setSignupSuccess('Hesabınız başarıyla oluşturuldu! Şimdi giriş yapabilirsiniz.');
    
    // Clear signup form
    setSignupName('');
    setSignupEmail('');
    setSignupPassword('');
    setSignupConfirmPassword('');

    // Switch to login view after a short delay
    setTimeout(() => {
      setAuthView('login');
      setSignupSuccess('');
    }, 2000);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('web_auth');
    localStorage.removeItem('web_user');
  };

  // AI Modal States
  const [showAiModal, setShowAiModal] = useState<boolean>(false);
  const [aiReport, setAiReport] = useState<string>('');
  const [aiLoading, setAiLoading] = useState<boolean>(false);

  // Chart Refs
  const districtChartRef = useRef<HTMLCanvasElement | null>(null);
  const shopChartRef = useRef<HTMLCanvasElement | null>(null);
  const districtChartInstance = useRef<any>(null);
  const shopChartInstance = useRef<any>(null);

  // Map Container Ref
  const mapInstance = useRef<any>(null);

  // Fetch initial sales and rule mining analysis from Django REST API
  useEffect(() => {
    const fetchSales = () => {
      fetch('http://127.0.0.1:8000/api/sales/')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            setSales(data);
          } else {
            setSales(MOCK_SALES);
          }
          setLoading(false);
        })
        .catch(err => {
          console.error("Sales fetch error:", err);
          setSales(MOCK_SALES);
          setLoading(false);
        });
    };

    fetchSales();

    // 2. Fetch Association Analysis (Apriori/FP-Growth)
    fetch('http://127.0.0.1:8000/api/sales/analyze/')
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data) && data.length > 0) {
          setAnalysis(data.slice(0, 6));
        } else {
          setAnalysis(MOCK_ANALYSIS);
        }
      })
      .catch(err => {
        console.error("Analysis fetch error:", err);
        setAnalysis(MOCK_ANALYSIS);
      });

    // Poll server every 10 seconds for real-time synchronization if running locally
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    let interval: any;
    if (isLocal) {
      interval = setInterval(fetchSales, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  // Compute Dynamic Metrics
  const totalRevenue = sales.reduce((acc, s) => {
    const saleSum = s.products?.reduce((pAcc: number, p: any) => pAcc + parseFloat(p.price || 0), 0) || 0;
    return acc + saleSum;
  }, 0);

  const uniqueShops = Array.from(new Set(sales.map(s => s.shop_name))).length;
  const uniqueDistricts = Array.from(new Set(sales.map(s => s.district))).length;

  // Curated list of Turkish product categories
  const categories = [
    { name: "Gıda", icon: "🍎", color: "bg-red-50 text-red-500 border-red-100" },
    { name: "Giyim & Aksesuar", icon: "👕", color: "bg-blue-50 text-blue-500 border-blue-100" },
    { name: "Teknoloji", icon: "💻", color: "bg-purple-50 text-purple-500 border-purple-100" },
    { name: "Kişisel Bakım", icon: "🧴", color: "bg-pink-50 text-pink-500 border-pink-100" },
    { name: "Temizlik", icon: "🧼", color: "bg-teal-50 text-teal-500 border-teal-100" },
    { name: "Kırtasiye", icon: "✏️", color: "bg-yellow-50 text-yellow-500 border-yellow-100" },
    { name: "Ev & Yaşam", icon: "🏠", color: "bg-indigo-50 text-indigo-500 border-indigo-100" },
    { name: "Spor & Outdoor", icon: "🚴", color: "bg-orange-50 text-orange-500 border-orange-100" },
    { name: "Pet Shop", icon: "🐱", color: "bg-green-50 text-green-500 border-green-100" }
  ];

  // Dynamic Float-to-Top Basket Sorting Logic
  const getSortedBaskets = () => {
    if (!selectedCategory) return sales;
    return [...sales].sort((a: any, b: any) => {
      const aHas = a.products?.some((p: any) => p.category === selectedCategory);
      const bHas = b.products?.some((p: any) => p.category === selectedCategory);
      if (aHas && !bHas) return -1;
      if (!aHas && bHas) return 1;
      return 0;
    });
  };

  // Helper for dynamic image URL fallback
  const getProductImageUrl = (url: string, name = '', category = '') => {
    if (url && url.startsWith('http')) return url;
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    // Always use high-quality Unsplash fallbacks in production to guarantee gorgeous, working visuals
    if (!isLocal) {
      const n = (name || '').toLowerCase();
      const c = (category || '').toLowerCase();

      // 1. Technology & Electronics
      if (n.includes('airpods')) return 'https://images.unsplash.com/photo-1588449668338-d151688d3472?w=500';
      if (n.includes('kulaklık') || n.includes('headphone')) return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500';
      if (n.includes('saat') || n.includes('watch')) return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500';
      if (n.includes('laptop') || n.includes('bilgisayar')) return 'https://images.unsplash.com/photo-1496181130204-755241524eab?w=500';
      if (n.includes('tablet')) return 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500';
      if (n.includes('telefon') || n.includes('phone')) return 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500';
      if (n.includes('drone')) return 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=500';
      if (n.includes('hoparlor') || n.includes('hoparlör') || n.includes('speaker')) return 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500';
      if (n.includes('powerbank')) return 'https://images.unsplash.com/photo-1609592424109-dd9892f1b17c?w=500';
      if (n.includes('robotsupurge') || n.includes('süpürge')) return 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=500';

      // 2. Clothing & Accessories
      if (n.includes('pantolon') || n.includes('jean') || n.includes('chino')) return 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500';
      if (n.includes('tişört') || n.includes('t-shirt') || n.includes('gömlek') || n.includes('sweatshort') || n.includes('eşofman') || n.includes('kazak') || n.includes('atkı')) return 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500';
      if (n.includes('bot') || n.includes('ayakkabı') || n.includes('terlik')) return 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=500';
      if (n.includes('çorap') || n.includes('corap')) return 'https://images.unsplash.com/photo-1582966772680-860e372bb558?w=500';

      // 3. Groceries & Food (Fresh)
      if (n.includes('domates') || n.includes('salatalık') || n.includes('biber') || n.includes('bıber') || n.includes('patates') || n.includes('kabak') || n.includes('patlıcan') || n.includes('sogan') || n.includes('çengeköy') || n.includes('fasulye')) return 'https://images.unsplash.com/photo-1566385101042-1a010c129fae?w=500';
      if (n.includes('karpuz') || n.includes('kavun') || n.includes('erık') || n.includes('cılek') || n.includes('çilek') || n.includes('kayısı') || n.includes('portakal') || n.includes('seftalı') || n.includes('uzum') || n.includes('muz')) return 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500';
      
      // 4. Dairy & Breakfast
      if (n.includes('peynir') || n.includes('kaşar')) return 'https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=500';
      if (n.includes('yağ') || n.includes('zeytinyağı') || n.includes('ayçiçek')) return 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500';
      if (n.includes('çay') || n.includes('kahve')) return 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500';
      if (n.includes('süt') || n.includes('sut')) return 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500';
      if (n.includes('yumurta') || n.includes('ymurta')) return 'https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?w=500';

      // 5. Meat & Poultry
      if (n.includes('tavuk') || n.includes('kuşbaşı') || n.includes('kıyma') || n.includes('et')) return 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=500';

      // 6. Pantry & Staples
      if (n.includes('makarna') || n.includes('spagetti') || n.includes('mercimek') || n.includes('bulgur') || n.includes('pirinç') || n.includes('nohut')) return 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500';
      
      // 7. Snacks & Drinks
      if (n.includes('biskuvi') || n.includes('bıskuvı') || n.includes('çikolata') || n.includes('cıkolata') || n.includes('kraker') || n.includes('kek') || n.includes('jelibon') || n.includes('jelıbon') || n.includes('lolıop') || n.includes('lolipop') || n.includes('sakız') || n.includes('cıps') || n.includes('cips')) return 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=500';
      if (n.includes('gazoz') || n.includes('kola') || n.includes('salgam') || n.includes('şalgam') || n.includes('su') || n.includes('içecek')) return 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500';

      // 8. Cleaning & Care
      if (n.includes('deterjan') || n.includes('sabun') || n.includes('temizleyici') || n.includes('çamaşırsuyu') || n.includes('camasırsuyu') || n.includes('sıvısabun') || n.includes('deodorant') || n.includes('parfum') || n.includes('şampuan') || n.includes('saçboyası') || n.includes('krem')) return 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500';
      if (n.includes('sunger') || n.includes('sünger') || n.includes('teli') || n.includes('bez') || n.includes('havlu') || n.includes('rulo') || n.includes('kağıt')) return 'https://images.unsplash.com/photo-1583947581924-860bda6a26df?w=500';

      // 9. Spices & Seasoning
      if (n.includes('sumak') || n.includes('tarcın') || n.includes('tarçın') || n.includes('kımyon') || n.includes('kimyon') || n.includes('nane') || n.includes('karabiber') || n.includes('kekik') || n.includes('karanfil') || n.includes('pulbiber') || n.includes('baharat')) return 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=500';

      // 10. Toys, Hobbies & Pets
      if (n.includes('puzzle') || n.includes('logo') || n.includes('boyama') || n.includes('kitap') || n.includes('kırtasiye') || n.includes('defter') || n.includes('kalem')) return 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=500';
      if (n.includes('kedi') || n.includes('köpek') || n.includes('mama') || n.includes('pet')) return 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500';

      // General Category-based Fallback
      if (c === 'teknoloji') return 'https://images.unsplash.com/photo-1588508065123-287b28e013da?w=500';
      if (c === 'giyim & aksesuar') return 'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=500';
      if (c === 'gıda') return 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500';
      if (c === 'kişisel bakım') return 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=500';
      
      return 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500'; // General placeholder
    }
    return `http://127.0.0.1:8000${url}`;
  };

  // Trigger Dynamic Gemini API Raporu
  const loadAiReport = () => {
    setShowAiModal(true);
    setAiLoading(true);
    setAiReport('');

    fetch('http://127.0.0.1:8000/api/sales/ai_report/')
      .then(res => res.json())
      .then(data => {
        if (data && data.report) {
          setAiReport(data.report);
        } else {
          setAiReport(MOCK_AI_REPORT);
        }
        setAiLoading(false);
      })
      .catch(err => {
        console.error("AI Report fetch error:", err);
        setAiReport(MOCK_AI_REPORT);
        setAiLoading(false);
      });
  };

  // --- CHART.JS RENDERING EFFECT ---
  useEffect(() => {
    if (sales.length === 0 || activeTab === 'map') return;
    const Chart = (window as any).Chart;
    if (!Chart) return;

    // 1. Prepare District Counts
    const districtCounts: { [key: string]: number } = {};
    sales.forEach((s: any) => {
      districtCounts[s.district] = (districtCounts[s.district] || 0) + 1;
    });
    const sortedDistricts = Object.entries(districtCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
    const districtLabels = sortedDistricts.map(d => d[0]);
    const districtData = sortedDistricts.map(d => d[1]);

    // 2. Prepare Shop Counts
    const shopCounts: { [key: string]: number } = {};
    sales.forEach((s: any) => {
      shopCounts[s.shop_name] = (shopCounts[s.shop_name] || 0) + 1;
    });
    const sortedShops = Object.entries(shopCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
    const shopLabels = sortedShops.map(s => s[0]);
    const shopData = sortedShops.map(s => s[1]);

    // Render Bar Chart (District)
    if (districtChartRef.current) {
      if (districtChartInstance.current) {
        districtChartInstance.current.destroy();
      }
      const ctx = districtChartRef.current.getContext('2d');
      if (ctx) {
        const barGradient = ctx.createLinearGradient(0, 0, 0, 250);
        barGradient.addColorStop(0, 'rgba(108, 92, 231, 0.9)');
        barGradient.addColorStop(1, 'rgba(162, 155, 254, 0.15)');

        const hoverBarGradient = ctx.createLinearGradient(0, 0, 0, 250);
        hoverBarGradient.addColorStop(0, 'rgba(108, 92, 231, 1)');
        hoverBarGradient.addColorStop(1, 'rgba(162, 155, 254, 0.4)');

        districtChartInstance.current = new Chart(districtChartRef.current, {
          type: 'bar',
          data: {
            labels: districtLabels,
            datasets: [{
              label: 'Sipariş Sayısı',
              data: districtData,
              backgroundColor: barGradient,
              borderColor: '#6c5ce7',
              borderWidth: 2,
              borderRadius: 16,
              borderSkipped: false,
              hoverBackgroundColor: hoverBarGradient,
              hoverBorderColor: '#6c5ce7',
              hoverBorderWidth: 2
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: 'rgba(45, 52, 54, 0.9)',
                titleFont: { family: 'Inter', size: 13, weight: '700' },
                bodyFont: { family: 'Inter', size: 12, weight: '600' },
                padding: 12,
                cornerRadius: 12,
                displayColors: false
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: { color: 'rgba(108, 92, 231, 0.05)' },
                ticks: {
                  font: { family: 'Inter', size: 11, weight: '600' },
                  color: '#636e72'
                }
              },
              x: {
                grid: { display: false },
                ticks: {
                  font: { family: 'Inter', size: 11, weight: '600' },
                  color: '#636e72'
                }
              }
            }
          }
        });
      }
    }

    // Render Doughnut Chart (Shop)
    if (shopChartRef.current) {
      if (shopChartInstance.current) {
        shopChartInstance.current.destroy();
      }
      shopChartInstance.current = new Chart(shopChartRef.current, {
        type: 'doughnut',
        data: {
          labels: shopLabels,
          datasets: [{
            data: shopData,
            backgroundColor: [
              '#6c5ce7', '#00b894', '#00cec9', '#ff7675',
              '#fdcb6e', '#e17055', '#fd79a8', '#a29bfe'
            ],
            borderWidth: 2,
            borderColor: '#ffffff',
            hoverOffset: 12,
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                font: { family: 'Inter', size: 11, weight: '600' },
                color: '#2d3436',
                boxWidth: 8,
                boxHeight: 8,
                usePointStyle: true,
                padding: 12
              }
            },
            tooltip: {
              backgroundColor: 'rgba(45, 52, 54, 0.9)',
              titleFont: { family: 'Inter', size: 13, weight: '700' },
              bodyFont: { family: 'Inter', size: 12, weight: '600' },
              padding: 12,
              cornerRadius: 12
            }
          },
          cutout: '72%'
        }
      });
    }

    return () => {
      if (districtChartInstance.current) {
        districtChartInstance.current.destroy();
        districtChartInstance.current = null;
      }
      if (shopChartInstance.current) {
        shopChartInstance.current.destroy();
        shopChartInstance.current = null;
      }
    };
  }, [sales, activeTab]);

  // --- LEAFLET MAP RENDERING EFFECT ---
  useEffect(() => {
    if (sales.length === 0 || activeTab === 'charts') return;
    const L = (window as any).L;
    if (!L) return;

    // Prepare map stats
    const districtStats: { [key: string]: { count: number, lat: number, lng: number } } = {};
    sales.forEach((s: any) => {
      if (!districtStats[s.district]) {
        districtStats[s.district] = { count: 0, lat: s.lat || 41.0082, lng: s.lng || 28.9784 };
      }
      districtStats[s.district].count += 1;
    });

    const statsArray = Object.entries(districtStats);
    let totalLat = 0, totalLng = 0, count = 0;
    statsArray.forEach(([_, d]) => {
      totalLat += d.lat;
      totalLng += d.lng;
      count++;
    });
    const center = count > 0 ? [totalLat / count, totalLng / count] : [41.0082, 28.9784];

    // Remove old leaflet container instance
    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
    }

    const mapElement = activeTab === 'map' ? 'fullDensityMap' : 'densityMap';
    const container = document.getElementById(mapElement);
    if (container) {
      const map = L.map(container).setView(center, 11);
      mapInstance.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      statsArray.forEach(([districtName, d]) => {
        const radius = Math.sqrt(d.count) * 120 + 200;
        const marker = L.circle([d.lat, d.lng], {
          color: '#6c5ce7',
          fillColor: '#a29bfe',
          fillOpacity: 0.5,
          weight: 2,
          radius: radius
        }).addTo(map);

        marker.bindPopup(`
          <div style="font-family: 'Inter', sans-serif; padding: 5px;">
            <h4 style="margin: 0 0 6px 0; color: #6c5ce7; font-weight: 800; font-size: 1.15em;">📍 ${districtName}</h4>
            <p style="margin: 0; font-size: 0.95em; color: #2d3436; font-weight: 600;">
              Sipariş Sayısı: <span style="color: #00b894; font-weight: 800; font-size: 1.1em;">${d.count} Adet</span>
            </p>
          </div>
        `);

        marker.on('mouseover', function(this: any) {
          this.setStyle({ fillOpacity: 0.8, weight: 3, color: '#00b894' });
        });
        marker.on('mouseout', function(this: any) {
          this.setStyle({ fillOpacity: 0.5, weight: 2, color: '#6c5ce7' });
        });
      });
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [sales, activeTab]);

  if (!isAuthenticated) {
    return (
      <div className="auth-fullscreen-container flex items-center justify-center min-h-screen relative overflow-hidden bg-cover bg-center bg-[#f8f9fd]">
        {/* Dynamic Abstract Background Elements */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-purple-400/20 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-400/20 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob animation-delay-2000"></div>

        <div className="auth-glass-card max-w-md w-full p-8 mx-4 rounded-[2.5rem] shadow-2xl relative border border-white/40 backdrop-blur-xl">
          <div className="text-center mb-6">
            <div className="inline-block bg-primary text-white p-3.5 rounded-2xl shadow-lg shadow-primary/30 mb-3.5">
              <i className="fas fa-chart-line text-2xl"></i>
            </div>
            <h2 className="text-2xl font-black text-dark tracking-tight">TrendSepetiX</h2>
            <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-wide">Analiz & Karar Destek Sistemi</p>
          </div>

          {authView === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <h3 className="text-base font-black text-dark text-center">İşletme Yöneticisi Girişi</h3>
              
              {loginError && (
                <div className="bg-red-50 text-red-600 text-xs font-bold p-3 rounded-xl border border-red-100 flex items-center gap-2">
                  <span>⚠️</span> {loginError}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">E-posta Adresi</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                    <i className="fas fa-envelope text-xs"></i>
                  </span>
                  <input
                    type="email"
                    placeholder="ornek@trendsepetix.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50/50 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-bold transition-all text-dark placeholder-gray-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Şifre</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                    <i className="fas fa-lock text-xs"></i>
                  </span>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50/50 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-bold transition-all text-dark placeholder-gray-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-purple-600 text-white font-extrabold text-xs py-3.5 rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-98 transition-all cursor-pointer border-none mt-2"
              >
                GİRİŞ YAP
              </button>

              <div className="text-center pt-2">
                <p className="text-xs text-gray-400 font-bold">
                  Hesabınız yok mu?{' '}
                  <span
                    onClick={() => { setAuthView('signup'); setLoginError(''); }}
                    className="text-primary hover:underline cursor-pointer font-black"
                  >
                    Yeni Hesap Oluştur
                  </span>
                </p>
              </div>

              <div className="bg-purple-50/60 p-3 rounded-2xl border border-purple-100/50 text-[10px] text-primary/80 font-bold text-center mt-3 leading-relaxed">
                💡 Demo Yönetici Bilgileri:<br />
                E-posta: <span className="underline">admin@trendsepetix.com</span><br />
                Şifre: <span className="underline">admin</span>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSignupSubmit} className="space-y-3">
              <h3 className="text-base font-black text-dark text-center">Yeni Hesap Oluştur</h3>

              {signupError && (
                <div className="bg-red-50 text-red-600 text-xs font-bold p-3 rounded-xl border border-red-100 flex items-center gap-2">
                  <span>⚠️</span> {signupError}
                </div>
              )}

              {signupSuccess && (
                <div className="bg-green-50 text-green-600 text-xs font-bold p-3 rounded-xl border border-green-100 flex items-center gap-2">
                  <span>✅</span> {signupSuccess}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Ad Soyad</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                    <i className="fas fa-user text-xs"></i>
                  </span>
                  <input
                    type="text"
                    placeholder="Ahmet Yılmaz"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-bold transition-all text-dark placeholder-gray-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">E-posta Adresi</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                    <i className="fas fa-envelope text-xs"></i>
                  </span>
                  <input
                    type="email"
                    placeholder="ornek@trendsepetix.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-bold transition-all text-dark placeholder-gray-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Şifre</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                    <i className="fas fa-lock text-xs"></i>
                  </span>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-bold transition-all text-dark placeholder-gray-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Şifre Tekrarı</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                    <i className="fas fa-lock text-xs"></i>
                  </span>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-bold transition-all text-dark placeholder-gray-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-purple-600 text-white font-extrabold text-xs py-3.5 rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-98 transition-all cursor-pointer border-none mt-2"
              >
                HESAP OLUŞTUR
              </button>

              <div className="text-center pt-2">
                <p className="text-xs text-gray-400 font-bold">
                  Zaten üye misiniz?{' '}
                  <span
                    onClick={() => { setAuthView('login'); setSignupError(''); }}
                    className="text-primary hover:underline cursor-pointer font-black"
                  >
                    Giriş Yap
                  </span>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fd] w-full text-dark font-sans pb-12 antialiased">
      {/* HEADER NAVBAR */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-purple-50 shadow-sm px-6 py-4">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary text-white p-2.5 rounded-2xl shadow-md shadow-primary/20 animate-pulse">
              <i className="fas fa-chart-line text-lg"></i>
            </div>
            <div>
              <h1 className="text-2xl font-black text-dark tracking-tight flex items-center gap-2">
                TrendSepetiX <span className="text-[10px] font-bold text-primary bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">React v3.0</span>
              </h1>
              <p className="text-xs font-semibold text-gray-400">Veri Madenciliği ve AI Karar Destek Arayüzü</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* AI Action Button */}
            <button 
              onClick={loadAiReport}
              className="bg-gradient-to-r from-primary to-purple-600 text-white font-extrabold text-sm px-5 py-3 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2 group border-none cursor-pointer"
            >
              <span className="bg-white/20 p-1.5 rounded-lg group-hover:rotate-12 transition-transform">🧠</span>
              AI STRATEJİ RAPORU
            </button>

            {/* Tab Navigation */}
            <div className="bg-gray-100 p-1.5 rounded-2xl flex gap-1 border border-gray-200">
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all border-none cursor-pointer ${activeTab === 'dashboard' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-dark bg-transparent'}`}
              >
                GENEL PANEL
              </button>
              <button 
                onClick={() => setActiveTab('map')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all border-none cursor-pointer ${activeTab === 'map' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-dark bg-transparent'}`}
              >
                BÖLGESEL HARİTA
              </button>
              <button 
                onClick={() => setActiveTab('charts')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all border-none cursor-pointer ${activeTab === 'charts' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-dark bg-transparent'}`}
              >
                GRAFİK ANALİZLERİ
              </button>
              <button 
                onClick={() => setActiveTab('discount')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all border-none cursor-pointer ${activeTab === 'discount' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-dark bg-transparent'}`}
              >
                İNDİRİM STRATEJİSİ
              </button>
            </div>

            {/* Shopping Cart Button */}
            <button 
              onClick={() => setShowCartModal(true)}
              className="bg-white hover:bg-purple-50 text-primary font-extrabold text-xs px-4 py-2.5 rounded-2xl shadow-sm border border-purple-100 hover:border-purple-200 cursor-pointer transition-all flex items-center gap-2"
            >
              <span>🛒</span>
              <span>Sepetim</span>
              <span className="bg-primary text-white text-[9px] px-1.5 py-0.5 rounded-full font-black tabular-nums">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            </button>

            {/* User Profile & Logout */}
            <div className="flex items-center gap-2.5 bg-purple-50/50 pl-3 pr-2 py-1.5 rounded-2xl border border-purple-100 shadow-xs">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-dark leading-tight">{currentUser?.name || 'Yönetici'}</span>
                <span className="text-[8px] font-bold text-gray-400 tracking-wider">İŞLETME YÖNETİCİSİ</span>
              </div>
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-xs shadow-inner">
                {currentUser?.name ? currentUser.name.split(' ').map((n: string) => n[0]).join('') : 'Y'}
              </div>
              <button 
                onClick={handleLogout}
                title="Güvenli Çıkış"
                className="bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 w-8 h-8 rounded-xl flex items-center justify-center border-none cursor-pointer transition-colors shadow-xs"
              >
                <i className="fas fa-sign-out-alt text-xs"></i>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* METRICS STATS BAR */}
      <section className="container mx-auto px-4 mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white p-5 rounded-3xl border border-purple-50 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <span className="text-3xl bg-purple-50 p-3 rounded-2xl text-primary">🛍️</span>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">TOPLAM SEPET</p>
              <p className="text-2xl font-black text-dark tabular-nums">{sales.length}</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-purple-50 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <span className="text-3xl bg-green-50 p-3 rounded-2xl text-accent">💰</span>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">TOPLAM CİRO</p>
              <p className="text-2xl font-black text-dark tabular-nums">{totalRevenue.toLocaleString('tr-TR')} TL</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-purple-50 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <span className="text-3xl bg-blue-50 p-3 rounded-2xl text-blue-500">🏢</span>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">MAĞAZA SAYISI</p>
              <p className="text-2xl font-black text-dark tabular-nums">{uniqueShops}</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-purple-50 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <span className="text-3xl bg-yellow-50 p-3 rounded-2xl text-yellow-500">📍</span>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">AKTİF SEMT</p>
              <p className="text-2xl font-black text-dark tabular-nums">{uniqueDistricts}</p>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN VIEW CONTROLLER */}
      <main className="container mx-auto px-4 mt-8">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-96 gap-4">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="font-extrabold text-gray-400 tracking-wider uppercase text-sm">Veri Tabanı Bağlantısı Kuruluyor...</p>
          </div>
        ) : (
          <>
            {/* 1. DASHBOARD VIEW */}
            {activeTab === 'dashboard' && (
              <div className="grid grid-cols-12 gap-8">
                {/* LEFT SIDEBAR: AI RULES & PRODUCT CATALOG */}
                <aside className="col-span-12 lg:col-span-4 space-y-8">
                  {/* AI Association Rules */}
                  <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-purple-50">
                    <h2 className="text-xl font-black mb-6 text-dark flex items-center gap-3">
                      <span className="bg-purple-100 p-2 rounded-xl text-primary text-sm">🧠</span>
                      AI Birliktelik Analizi
                    </h2>
                    <div className="space-y-4">
                      {analysis.length > 0 ? (
                        analysis.map((item, idx) => (
                          <div key={idx} className="p-4 bg-gradient-to-r from-purple-50 to-white rounded-2xl border border-purple-100 hover:shadow-md transition-all">
                            <div className="flex flex-wrap gap-2 mb-3">
                              {item.items.map((it: string) => (
                                <span key={it} className="bg-white px-2.5 py-1 rounded-lg text-xs font-bold shadow-xs border border-purple-100 text-primary">
                                  {it}
                                </span>
                              ))}
                            </div>
                            <div className="flex justify-between items-center bg-white/70 p-2 rounded-xl">
                              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Güven Oranı</span>
                              <span className="text-primary font-black text-sm">%{(item.confidence * 100).toFixed(1)}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-400 italic text-center py-6">Korelasyonlar işleniyor...</p>
                      )}
                    </div>
                    <p className="mt-5 text-[9px] text-gray-300 font-bold uppercase tracking-widest text-center italic">
                      *Apriori Algoritması Verileridir
                    </p>
                  </div>

                  {/* Product Catalog Category Selector & Product List */}
                  <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-purple-50 flex flex-col h-[650px]">
                    <h2 className="text-xl font-black mb-4 text-dark flex items-center gap-3">
                      <span className="bg-purple-100 p-2 rounded-xl text-primary text-sm">🛍️</span>
                      Kategori Odaklı Sepet Filtresi
                    </h2>
                    <p className="text-xs text-gray-400 font-semibold mb-4 leading-relaxed">
                      Herhangi bir kategoriye basarak sağ paneldeki ilgili sepetleri en üste sabitleyebilir ve çapraz satış potansiyellerini inceleyebilirsiniz.
                    </p>

                    {/* Horizontal Categories Badges */}
                    <div className="flex flex-wrap gap-2 mb-6 max-h-40 overflow-y-auto pr-1">
                      <button
                        onClick={() => setSelectedCategory(null)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer ${!selectedCategory ? 'bg-primary text-white border-primary shadow-md shadow-primary/20' : 'bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100'}`}
                      >
                        🌟 Hepsi ({sales.length})
                      </button>
                      {categories.map((cat) => (
                        <button
                          key={cat.name}
                          onClick={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer ${selectedCategory === cat.name ? 'bg-primary text-white border-primary shadow-md shadow-primary/20' : 'bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100'}`}
                        >
                          {cat.icon} {cat.name}
                        </button>
                      ))}
                    </div>

                    {/* Products Grid inside Catalog */}
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Katalog Ürünleri</h3>
                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                      {productsData.slice(0, 16).map((prod: any) => (
                        <div key={prod.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-sm transition-all group">
                          <div className="w-12 h-12 rounded-xl bg-white shadow-xs border border-gray-100 overflow-hidden flex items-center justify-center p-1">
                            <img src={getProductImageUrl(prod.image, prod.name, prod.category)} alt={prod.name} className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-dark truncate leading-tight">{prod.name}</h4>
                            <span className="text-[10px] text-gray-400 font-semibold">{prod.category}</span>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-xs text-primary font-black whitespace-nowrap">{prod.price} TL</span>
                            <button
                              onClick={() => handleAddToCart({
                                id: prod.id,
                                name: prod.name,
                                price: prod.price,
                                image: prod.image,
                                category: prod.category
                              })}
                              className="bg-primary/10 hover:bg-primary text-primary hover:text-white px-2.5 py-1.5 rounded-xl text-[10px] font-black transition-all border-none cursor-pointer flex items-center gap-1"
                              title="Sepete Ekle"
                            >
                              <span>➕</span> <span className="hidden sm:inline">Sepete Ekle</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </aside>

                {/* RIGHT AREA: REAL-TIME MAP & RECENT SALES */}
                <section className="col-span-12 lg:col-span-8 space-y-8">
                  {/* Dynamic Density Map mini */}
                  <div className="bg-white p-7 rounded-[2.5rem] shadow-sm border border-purple-50 relative overflow-hidden">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className="text-lg font-black text-dark flex items-center gap-2">
                          <i className="fas fa-map-marked-alt text-primary"></i> Bölgesel Satış Yoğunluk Haritası
                        </h3>
                        <p className="text-xs text-gray-400 font-medium">Bölgelere göre sipariş adetleri heatmap marker katmanı</p>
                      </div>
                      <button 
                        onClick={() => setActiveTab('map')}
                        className="text-xs font-extrabold text-primary hover:underline bg-transparent border-none cursor-pointer"
                      >
                        TAM EKRANA GEÇ <i className="fas fa-chevron-right ml-1"></i>
                      </button>
                    </div>
                    {/* Map Div */}
                    <div id="densityMap" className="h-64 rounded-3xl overflow-hidden border border-gray-100 shadow-inner" style={{ zIndex: 1 }}></div>
                  </div>

                  {/* Son Alışverişler Feed with category float sort */}
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className="text-xl font-black text-dark flex items-center gap-3">
                          Son Alışverişler
                          {selectedCategory && (
                            <span className="bg-primary/10 text-primary text-[10px] font-black px-3 py-1 rounded-full border border-primary/20">
                              🎯 {selectedCategory.toUpperCase()} ODAKLI
                            </span>
                          )}
                        </h3>
                        <p className="text-xs text-gray-400 font-semibold">Tıklanan kategoriye ait sepetler dinamik sıralama ile en üsttedir</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-[10px] font-black text-gray-400 tracking-wider">CANLI HAREKET AKTİF</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {getSortedBaskets().map((sale: any) => {
                        const hasCategory = selectedCategory && sale.products?.some((p: any) => p.category === selectedCategory);
                        return (
                          <div 
                            key={sale.id} 
                            className={`group bg-white p-6 rounded-[2.5rem] shadow-sm border-2 transition-all duration-500 overflow-hidden relative ${hasCategory ? 'border-primary/50 shadow-lg ring-4 ring-primary/5' : 'border-transparent hover:border-purple-200 hover:shadow-md'}`}
                          >
                            {hasCategory && (
                              <div className="absolute top-0 right-0 bg-primary text-white text-[9px] font-black px-4 py-1.5 rounded-bl-2xl uppercase shadow-xs tracking-wider z-20 flex items-center gap-1">
                                <i className="fas fa-star text-[8px]"></i> EŞLEŞEN
                              </div>
                            )}

                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                              <span className="text-7xl font-black italic">#{sale.id}</span>
                            </div>

                            <div className="relative z-10">
                              <div className="mb-4">
                                <span className="bg-purple-50 text-primary text-[10px] font-black px-3 py-1 rounded-full uppercase mb-2 inline-block border border-purple-100">
                                  📍 {sale.district}
                                </span>
                                <h4 className="font-black text-lg text-dark leading-tight">{sale.shop_name}</h4>
                              </div>

                              <div className="space-y-2.5 mb-4 border-t border-b border-gray-50 py-3">
                                {sale.products?.map((p: any) => {
                                  const isMatched = selectedCategory && p.category === selectedCategory;
                                  return (
                                    <div key={p.id} className="flex justify-between items-center text-xs gap-3 p-1 hover:bg-purple-50/30 rounded-xl transition-all">
                                      <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center p-0.5 overflow-hidden shrink-0">
                                          <img 
                                            src={getProductImageUrl(p.image_url || p.image || '', p.name, p.category)} 
                                            alt={p.name} 
                                            className="max-w-full max-h-full object-contain" 
                                          />
                                        </div>
                                        <span className={`font-semibold truncate ${isMatched ? 'text-primary font-bold' : 'text-gray-500'}`}>
                                          {isMatched && <span className="mr-1">🎯</span>}
                                          {p.name.split(' #')[0]}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2 shrink-0">
                                        <span className={`font-black tabular-nums ${isMatched ? 'text-primary' : 'text-dark'}`}>{p.price} TL</span>
                                        <button
                                          onClick={() => handleAddToCart({
                                            id: p.id,
                                            name: p.name.split(' #')[0],
                                            price: p.price,
                                            image: p.image_url || p.image || '',
                                            category: p.category
                                          })}
                                          title="Sepete Ekle"
                                          className="w-6 h-6 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-lg flex items-center justify-center border-none cursor-pointer text-xs font-black transition-all"
                                        >
                                          ➕
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              <div className="flex justify-between items-center text-[9px] text-gray-400 font-bold uppercase tracking-wider pt-2">
                                <span>SQL INDEX: ACTIVE</span>
                                <span className="text-primary hover:underline cursor-pointer">İNCELE</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Feedback component at bottom of dashboard */}
                  <FeedbackComponent />
                </section>
              </div>
            )}

            {/* 2. REGIONAL HARİTA VIEW */}
            {activeTab === 'map' && (
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-purple-50">
                <div className="mb-6 flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-black text-dark flex items-center gap-2">
                      <i className="fas fa-map-marked-alt text-primary"></i> Tam Ekran Bölgesel Satış Isı Haritası
                    </h2>
                    <p className="text-xs text-gray-400 font-semibold">İstanbul genelindeki şubelerin sipariş yoğunluk dağılımını canlı inceleyin</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('dashboard')}
                    className="bg-gray-100 hover:bg-gray-200 text-dark font-extrabold text-xs px-4 py-2 rounded-xl transition-all border-none cursor-pointer"
                  >
                    <i className="fas fa-arrow-left mr-1"></i> PANELE DÖN
                  </button>
                </div>
                <div id="fullDensityMap" className="h-[600px] rounded-[2rem] overflow-hidden border border-gray-100 shadow-md"></div>
              </div>
            )}

            {/* 3. CHARTS VIEW */}
            {activeTab === 'charts' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Regional Bar Chart */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-purple-50">
                  <div className="mb-6">
                    <h2 className="text-xl font-black text-dark flex items-center gap-2">
                      <i className="fas fa-chart-bar text-primary"></i> En Popüler Sipariş Semtleri
                    </h2>
                    <p className="text-xs text-gray-400 font-semibold">Semt bazında en yüksek sipariş adedine ulaşan bölgelerin analizi</p>
                  </div>
                  <div className="h-96 relative">
                    <canvas ref={districtChartRef}></canvas>
                  </div>
                </div>

                {/* Store Doughnut Chart */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-purple-50">
                  <div className="mb-6">
                    <h2 className="text-xl font-black text-dark flex items-center gap-2">
                      <i className="fas fa-chart-pie text-accent"></i> Mağaza Satış Dağılım Payı
                    </h2>
                    <p className="text-xs text-gray-400 font-semibold">Aktif mağaza zincirlerinin sepet paylaşımları</p>
                  </div>
                  <div className="h-96 relative">
                    <canvas ref={shopChartRef}></canvas>
                  </div>
                </div>
              </div>
            )}
            {/* 4. DISCOUNT STRATEGY VIEW */}
            {activeTab === 'discount' && (
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-purple-50">
                <div className="mb-6 flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-black text-dark flex items-center gap-2">
                      <span className="bg-purple-100 p-2 rounded-xl text-primary text-sm">🏷️</span>
                      Dinamik İndirim Strateji Paneli
                    </h2>
                    <p className="text-xs text-gray-400 font-semibold">Düşük satış hacmine sahip semtlerde müşteri çekmek için dinamik indirim oranları hesaplayın ve simüle edin</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('dashboard')}
                    className="bg-gray-100 hover:bg-gray-200 text-dark font-extrabold text-xs px-4 py-2 rounded-xl transition-all border-none cursor-pointer"
                  >
                    <i className="fas fa-arrow-left mr-1"></i> PANELE DÖN
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(() => {
                    const districtCounts: { [key: string]: number } = {};
                    sales.forEach((s: any) => {
                      districtCounts[s.district] = (districtCounts[s.district] || 0) + 1;
                    });
                    
                    return Object.entries(districtCounts).map(([district, count]) => {
                      const recommended = count < 25 ? 20 : count < 60 ? 15 : 10;
                      
                      return (
                        <div key={district} className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-3xl border border-gray-100 shadow-xs hover:shadow-md transition-all">
                          <h4 className="font-black text-lg text-dark flex items-center justify-between mb-2">
                            <span>📍 {district}</span>
                            <span className="bg-purple-50 text-primary text-[10px] font-black px-2.5 py-1 rounded-full border border-purple-100">
                              {count} Sipariş
                            </span>
                          </h4>
                          
                          <div className="space-y-4 mt-4">
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-gray-400 font-bold">ÖNERİLEN İNDİRİM</span>
                              <span className="text-accent font-black text-sm">%{recommended}</span>
                            </div>
                            
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-gray-400 font-bold">DURUM</span>
                              <span className={`font-black uppercase tracking-wider ${count < 25 ? 'text-red-500' : count < 60 ? 'text-yellow-500' : 'text-green-500'}`}>
                                {count < 25 ? 'Düşük Satış' : count < 60 ? 'Orta Satış' : 'Yüksek Satış'}
                              </span>
                            </div>
                            
                            <button
                              onClick={() => alert(`🎉 ${district} semti için %${recommended} oranında dinamik indirim kampanyası başarıyla uygulandı!`)}
                              className="w-full bg-primary text-white font-extrabold text-xs py-2.5 rounded-xl hover:bg-dark transition-all border-none cursor-pointer mt-2"
                            >
                              İNDİRİMİ UYGULA
                            </button>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* GEMINI AI STRATEGİC REPORT GLASSMODAL */}
      {showAiModal && (
        <div className="fixed inset-0 bg-dark/60 backdrop-blur-md flex justify-center items-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-[2.5rem] max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-2xl border border-purple-100 flex flex-col transform transition-transform animate-scaleUp">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-primary to-purple-600 p-6 text-white flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <div className="flex items-center gap-3 relative z-10">
                <span className="text-3xl bg-white/20 p-2 rounded-2xl">🧠</span>
                <div>
                  <h3 className="text-xl font-black">AI Karar Destek Raporu</h3>
                  <p className="text-xs text-purple-100 font-semibold">Gemini 2.5 Canlı Strateji Motoru</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAiModal(false)}
                className="bg-white/10 hover:bg-white/25 text-white w-10 h-10 rounded-full flex items-center justify-center border-none transition-all cursor-pointer relative z-10"
              >
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
              {aiLoading ? (
                <div className="flex flex-col justify-center items-center py-20 gap-4">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="font-extrabold text-gray-400 text-xs tracking-wider uppercase">Birliktelik verileri analiz ediliyor ve yorumlar canlı üretiliyor...</p>
                </div>
              ) : (
                <div 
                  className="prose prose-purple max-w-none text-gray-600 font-medium text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: aiReport }}
                />
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center rounded-b-[2.5rem]">
              <span className="text-[10px] text-gray-400 font-extrabold tracking-widest uppercase">
                <i className="fas fa-shield-alt text-primary mr-1"></i> Canlı Gemini API Servisi
              </span>
              <button 
                onClick={() => setShowAiModal(false)}
                className="bg-dark text-white font-extrabold text-xs px-6 py-3 rounded-2xl hover:bg-primary transition-all border-none cursor-pointer"
              >
                RAPORU KAPAT
              </button>
            </div>
          </div>
        </div>
      )}
      {/* SHOPPING CART MODAL */}
      {showCartModal && (
        <div className="fixed inset-0 bg-dark/60 backdrop-blur-xs flex items-center justify-center z-50 animate-fadeIn" onClick={() => setShowCartModal(false)}>
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-purple-50 w-full max-w-[480px] max-h-[85vh] flex flex-col transform transition-transform animate-scaleUp" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-black mb-4 text-dark flex items-center gap-3">
              <span className="bg-purple-100 p-2 rounded-xl text-primary text-sm">🛒</span>
              Sepetim ({cart.reduce((sum, item) => sum + item.quantity, 0)} Ürün)
            </h3>
            
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar my-4">
              {cart.length > 0 ? (
                cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="w-12 h-12 rounded-xl bg-white shadow-xs border border-gray-100 overflow-hidden flex items-center justify-center p-1">
                      <img src={getProductImageUrl(item.image, item.name, item.category)} alt={item.name} className="max-w-full max-h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-dark truncate leading-tight">{item.name}</h4>
                      <span className="text-[10px] text-gray-400 font-semibold">{item.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleUpdateQuantity(item.id, -1)}
                        className="w-5 h-5 bg-gray-200 hover:bg-gray-300 text-dark rounded-md border-none cursor-pointer flex items-center justify-center font-bold text-xs"
                      >
                        -
                      </button>
                      <span className="text-xs font-black text-dark tabular-nums w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => handleUpdateQuantity(item.id, 1)}
                        className="w-5 h-5 bg-gray-200 hover:bg-gray-300 text-dark rounded-md border-none cursor-pointer flex items-center justify-center font-bold text-xs"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-xs text-primary font-black whitespace-nowrap min-w-[70px] text-right">
                      {item.price * item.quantity} TL
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <span className="text-4xl">🛒</span>
                  <p className="text-sm text-gray-400 font-bold italic">Sepetiniz boş.</p>
                </div>
              )}
            </div>
            
            {cart.length > 0 && (
              <div className="border-t border-gray-100 pt-4 mt-2 space-y-3">
                <div className="flex justify-between items-center text-sm font-black text-dark">
                  <span>Toplam Tutar:</span>
                  <span className="text-primary text-base tabular-nums">
                    {cart.reduce((sum, item) => sum + item.price * item.quantity, 0)} TL
                  </span>
                </div>
                <button 
                  onClick={() => {
                    alert("Siparişiniz Alındı! Bizi tercih ettiğiniz için teşekkür ederiz.");
                    setCart([]);
                    setShowCartModal(false);
                  }}
                  className="w-full bg-gradient-to-r from-primary to-purple-600 text-white font-extrabold text-xs py-3.5 rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-98 transition-all cursor-pointer border-none"
                >
                  SİPARİŞİ TAMAMLA
                </button>
              </div>
            )}
            
            <button 
              onClick={() => setShowCartModal(false)}
              className="mt-3 w-full bg-gray-100 hover:bg-gray-200 text-gray-500 font-extrabold text-xs py-3.5 rounded-2xl border-none cursor-pointer transition-colors"
            >
              Kapat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
