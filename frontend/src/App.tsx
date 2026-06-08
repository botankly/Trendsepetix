import { useState, useEffect, useRef } from 'react';
import './App.css';
import productsData from './products.json';
import FeedbackComponent from './FeedbackComponent';

function App() {
  const [sales, setSales] = useState<any[]>([]);
  const [analysis, setAnalysis] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'map' | 'charts' | 'discount'>('dashboard');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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
    // 1. Fetch Sales
    fetch('http://127.0.0.1:8000/api/sales/')
      .then(res => res.json())
      .then(data => {
        setSales(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Sales fetch error:", err);
        setLoading(false);
      });

    // 2. Fetch Association Analysis (Apriori/FP-Growth)
    fetch('http://127.0.0.1:8000/api/sales/analyze/')
      .then(res => res.json())
      .then(data => setAnalysis(data.slice(0, 6)))
      .catch(err => console.error("Analysis fetch error:", err));
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
  const getProductImageUrl = (url: string) => {
    if (!url) return 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500';
    if (url.startsWith('http')) return url;
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
        setAiReport(data.report);
        setAiLoading(false);
      })
      .catch(err => {
        console.error("AI Report fetch error:", err);
        setAiReport("<p style='color:red;'>AI raporu oluşturulurken bir bağlantı hatası gerçekleşti. Lütfen daha sonra tekrar deneyin.</p>");
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
                            <img src={getProductImageUrl(prod.image)} alt={prod.name} className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-dark truncate leading-tight">{prod.name}</h4>
                            <span className="text-[10px] text-gray-400 font-semibold">{prod.category}</span>
                          </div>
                          <span className="text-xs text-primary font-black whitespace-nowrap">{prod.price} TL</span>
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

                              <div className="space-y-2 mb-4 border-t border-b border-gray-50 py-3">
                                {sale.products?.map((p: any) => {
                                  const isMatched = selectedCategory && p.category === selectedCategory;
                                  return (
                                    <div key={p.id} className="flex justify-between items-center text-xs">
                                      <span className={`font-semibold ${isMatched ? 'text-primary font-bold' : 'text-gray-500'}`}>
                                        {isMatched && <span className="mr-1">🎯</span>}
                                        {p.name.split(' #')[0]}
                                      </span>
                                      <span className={`font-black tabular-nums ${isMatched ? 'text-primary' : 'text-dark'}`}>{p.price} TL</span>
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
    </div>
  );
}

export default App;
