import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/sales/')
      .then(res => res.json())
      .then(data => {
        setSales(data.slice(0, 10))
        setLoading(false)
      })
      .catch(err => console.error("API Error:", err))
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      <header className="bg-white shadow-sm p-6 mb-8">
        <h1 className="text-3xl font-extrabold text-primary flex items-center gap-2">
          🚀 TrendSepetiX <span className="text-sm font-medium text-gray-400">DashBoard v2.0 (React)</span>
        </h1>
      </header>

      <main className="container mx-auto px-4 flex gap-8">
        <aside className="w-1/4 bg-white p-6 rounded-3xl shadow-xl overflow-hidden h-fit sticky top-8 border border-purple-100">
          <h2 className="text-xl font-bold mb-6 text-dark flex items-center gap-2">
            🛒 Canlı Ürün Listesi
          </h2>
          <div className="space-y-4">
            <div className="p-4 bg-purple-50 rounded-2xl animate-pulse h-12"></div>
            <div className="p-4 bg-purple-50 rounded-2xl animate-pulse h-12"></div>
            <div className="p-4 bg-purple-50 rounded-2xl animate-pulse h-12"></div>
          </div>
        </aside>

        <section className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {loading ? (
              [1,2,3,4].map(i => (
                <div key={i} className="bg-white p-8 rounded-3xl shadow-lg h-60 animate-pulse"></div>
              ))
            ) : (
              sales.map((sale: any) => (
                <div key={sale.id} className="bg-white p-6 rounded-3xl shadow-lg border border-transparent hover:border-primary transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-xl text-dark">{sale.district} - {sale.market}</h3>
                      <p className="text-gray-400 text-sm">#Sepet ID: {sale.id}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {sale.products.slice(0,3).map((p: any) => (
                      <div key={p.id} className="flex justify-between text-sm py-1 border-b border-gray-50">
                        <span>{p.name}</span>
                        <span className="font-semibold">{p.price} TL</span>
                      </div>
                    ))}
                  </div>
                  <button className="mt-6 w-full py-4 bg-primary text-white rounded-2xl font-bold hover:opacity-90 active:scale-95 transition-all">
                    Detaylı Analiz
                  </button>
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
