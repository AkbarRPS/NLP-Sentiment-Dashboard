import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

function App() {
  const [ringkasan, setRingkasan] = useState(null)
  const [kutipan, setKutipan] = useState([])
  const [loading, setLoading] = useState(true)
  const [pesanError, setPesanError] = useState(null)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Efek Sakelar Dark Mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  // Fetch Data dari Hugging Face
  useEffect(() => {
    fetch('https://akbarabay-sentimen.hf.space/api/summary')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'error') throw new Error(data.pesan)
        setRingkasan(data.ringkasan)
      })
      .catch(err => setPesanError(err.message))

    fetch('https://akbarabay-sentimen.hf.space/api/quotes')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'error') throw new Error(data.pesan)
        setKutipan(data.data || [])
        setLoading(false)
      })
      .catch(err => {
        setPesanError(err.message)
        setLoading(false)
      })
  }, [])

  // Logika Filter Pencarian
  const dataTerfilter = kutipan.filter((item) => {
    return item.Kutipan.toLowerCase().includes(searchTerm.toLowerCase())
  })

  if (pesanError) {
    return (
      <div className="text-center mt-16 font-sans bg-[var(--background)] min-h-screen pt-10 transition-colors duration-300">
        <h1 className="text-3xl font-bold text-red-500 mb-2">❌ Gagal Mengambil Data</h1>
        <p className="text-[var(--text-main)]">Pesan dari server: <span className="font-semibold">{pesanError}</span></p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[var(--background)] transition-colors duration-300">
        <h2 className="text-2xl font-semibold text-gray-500 animate-pulse font-sans">⏳ Menyiapkan Dashboard...</h2>
      </div>
    )
  }

  const dataGrafik = ringkasan ? [
    { name: 'Positif', value: ringkasan.Positif || 0, color: '#22c55e' }, 
    { name: 'Negatif', value: ringkasan.Negatif || 0, color: '#ef4444' }, 
    { name: 'Netral', value: ringkasan.Netral || 0, color: '#9ca3af' }  
  ] : []

  return (
    <div className="p-6 md:p-10 font-sans min-h-screen bg-[var(--background)] text-[var(--text-main)] transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center border-b-2 border-[var(--border-color)] pb-4 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 md:mb-0 tracking-tight">
            📊 Dashboard Analisis Sentimen
          </h1>
          
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="flex items-center gap-2 px-6 py-2 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-full shadow-sm hover:shadow-md active:scale-95 transition-all font-medium"
          >
            {isDarkMode ? '☀️ Mode Terang' : '🌙 Mode Gelap'}
          </button>
        </div>
        
        {/* RINGKASAN CARDS (Tetap Menggunakan Warna Statis Karena Memang Desainnya Berwarna) */}
        <div className="flex flex-col md:flex-row gap-6 mb-10 text-white">
          <div className="flex-1 p-6 bg-green-500 rounded-2xl shadow-lg hover:shadow-xl transition-all">
            <h3 className="text-lg font-medium opacity-90 m-0">Positif</h3>
            <p className="text-5xl font-extrabold mt-2 tracking-tight">{ringkasan?.Positif || 0}</p>
          </div>
          <div className="flex-1 p-6 bg-red-500 rounded-2xl shadow-lg hover:shadow-xl transition-all">
            <h3 className="text-lg font-medium opacity-90 m-0">Negatif</h3>
            <p className="text-5xl font-extrabold mt-2 tracking-tight">{ringkasan?.Negatif || 0}</p>
          </div>
          <div className="flex-1 p-6 bg-gray-500 rounded-2xl shadow-lg hover:shadow-xl transition-all">
            <h3 className="text-lg font-medium opacity-90 m-0">Netral</h3>
            <p className="text-5xl font-extrabold mt-2 tracking-tight">{ringkasan?.Netral || 0}</p>
          </div>
        </div>

        {/* GRAFIK DISTRIBUSI */}
        <div className="bg-[var(--card-bg)] p-6 rounded-2xl shadow-md border border-[var(--border-color)] mb-10 h-[400px] transition-colors duration-300">
          <h2 className="text-center text-xl font-bold mb-4">Distribusi Sentimen Kutipan</h2>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dataGrafik}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {dataGrafik.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                  color: isDarkMode ? '#ffffff' : '#000000',
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
                }} 
              />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* DATA HEADER & SEARCH */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold">Detail Data Teks</h2>
            <p className="text-gray-500 text-sm">
              Menampilkan <span className="font-bold text-blue-500">{dataTerfilter.length}</span> hasil
            </p>
          </div>

          <div className="w-full md:w-80 relative">
            <span className="absolute left-4 top-2.5 opacity-50">🔍</span>
            <input
              type="text"
              placeholder="Cari kutipan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm transition-all text-sm"
            />
          </div>
        </div>

        {/* TABEL DATA */}
        <div className="overflow-x-auto bg-[var(--card-bg)] rounded-xl shadow-md border border-[var(--border-color)] mb-10 transition-colors duration-300">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[var(--background)] border-b-2 border-[var(--border-color)]">
                <th className="p-4 font-semibold">Kutipan</th>
                <th className="p-4 font-semibold w-40 text-center">Sentimen</th>
              </tr>
            </thead>
            <tbody>
              {dataTerfilter.length > 0 ? (
                dataTerfilter.slice(0, 15).map((baris, index) => (
                  <tr key={index} className="border-b border-[var(--border-color)] hover:bg-gray-400/5 transition-colors">
                    <td className="p-4 text-sm leading-relaxed opacity-80">"{baris.Kutipan}"</td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest
                        ${baris.Label_Sentimen === 'Positif' ? 'bg-green-500/20 text-green-500' : 
                          baris.Label_Sentimen === 'Negatif' ? 'bg-red-500/20 text-red-500' : 
                          'bg-gray-500/20 text-gray-500'}`}
                      >
                        {baris.Label_Sentimen}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2" className="p-10 text-center text-gray-500 italic">
                    ❌ Kata "{searchTerm}" tidak ditemukan dalam data.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default App