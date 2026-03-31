import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [sales, setSales] = useState([])
  const [analysis, setAnalysis] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Sepetleri çek
    fetch('http://127.0.0.1:8000/api/sales/')
      .then(res => res.json())
      .then(data => {
        setSales(data.slice(0, 6))
        setLoading(false)
      })

    // Analiz sonuçlarını çek (Apriori)
    fetch('http://127.0.0.1:8000/api/sales/analyze/')
      .then(res => res.json())
      .then(data => setAnalysis(data.slice(0, 5)))
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 w-full text-dark">
      <header className="bg-white shadow-sm p-6 mb-8 border-b border-purple-100">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-extrabold text-primary flex items-center gap-2">
            🚀 TrendSepetiX <span className="text-sm font-medium text-gray-400 bg-gray-100 px-3 py-1 rounded-full">v2.0 Beta</span>
          </h1>
          <div className="flex gap-4">
             <div className="text-right">
                <p className="text-xs text-gray-400">Aktif Sepet Sayısı</p>
                <p className="font-bold text-lg">500+</p>
             </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 grid grid-cols-12 gap-8 pb-12">
        
        {/* SOL PANEL: ANALİZ SONUÇLARI */}
        <aside className="col-span-12 lg:col-span-4 space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-purple-50">
            <h2 className="text-2xl font-black mb-6 text-dark flex items-center gap-3">
              <span className="bg-purple-100 p-2 rounded-xl text-primary">🧠</span> AI Birliktelik Analizi
            </h2>
            <div className="space-y-4">
              {analysis.length > 0 ? analysis.map((item: any, idx) => (
                <div key={idx} className="p-5 bg-gradient-to-r from-purple-50 to-white rounded-2xl border border-purple-100 hover:shadow-md transition-all">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {item.items.map((it: string) => (
                      <span key={it} className="bg-white px-3 py-1 rounded-lg text-xs font-bold shadow-sm border border-purple-100 text-primary">
                        {it}
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-between items-center bg-white/50 p-2 rounded-xl">
                    <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Güven Oranı</span>
                    <span className="text-accent font-black text-lg">%{(item.confidence * 100).toFixed(1)}</span>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-400 italic">Veriler işleniyor...</div>
              )}
            </div>
            <p className="mt-6 text-[10px] text-gray-300 font-medium uppercase tracking-widest text-center italic">
              *Apriori Algoritması ile hesaplanmıştır
            </p>
          </div>
        </aside>

        {/* ANA PANEL: SEPETLER */}
        <section className="col-span-12 lg:col-span-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-black text-dark">Son Alışverişler</h3>
            <div className="flex gap-2">
               <span className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></span>
               <p className="text-xs font-bold text-gray-400">CANLI VERİ AKIŞI</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loading ? (
              [1,2,3,4].map(i => (
                <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-lg h-64 animate-pulse"></div>
              ))
            ) : (
              sales.map((sale: any) => (
                <div key={sale.id} className="group bg-white p-7 rounded-[2.5rem] shadow-lg border-2 border-transparent hover:border-primary/20 hover:shadow-2xl transition-all duration-500 overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <span className="text-8xl font-black italic">#{sale.id}</span>
                  </div>
                  
                  <div className="relative z-10">
                    <div className="mb-6">
                      <span className="bg-purple-100 text-primary text-[10px] font-black px-3 py-1 rounded-full uppercase mb-2 inline-block">
                        {sale.district}
                      </span>
                      <h4 className="font-black text-2xl text-dark leading-tight">{sale.market}</h4>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      {sale.products.slice(0,3).map((p: any) => (
                        <div key={p.id} className="flex justify-between items-center">
                          <span className="text-gray-500 font-medium">{p.name.split(' #')[0]}</span>
                          <span className="text-dark font-black tabular-nums">{p.price} TL</span>
                        </div>
                      ))}
                    </div>
                    
                    <button className="w-full py-4 bg-dark text-white rounded-2xl font-black hover:bg-primary transition-colors shadow-lg shadow-purple-200">
                      DETAYLARI GÖR
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

      </main>
    </div>
  )
}

export default App
