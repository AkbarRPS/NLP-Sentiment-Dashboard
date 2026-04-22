import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

function App() {
  const [ringkasan, setRingkasan] = useState(null)
  const [kutipan, setKutipan] = useState([])
  const [loading, setLoading] = useState(true)
  const [pesanError, setPesanError] = useState(null)
  const [isDarkMode, setIsDarkMode] = useState(false)
  
  // 1. State untuk menyimpan kata kunci pencarian
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

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

  // 2. Logika untuk menyaring data berdasarkan teks pencarian
  // Kita cek apakah teks kutipan mengandung kata kunci (case-insensitive)
  const dataTerfilter = kutipan.filter((item) => {
    return item.Kutipan.toLowerCase().includes(searchTerm.toLowerCase())
  })

  if (pesanError) {
    return (
      <div className="text-center mt-16 font-sans dark:bg-gray-900 min-h-screen pt-10 transition-colors duration-300">
        <h1 className="text-3xl font-bold text-red-500 mb-2">❌ Gagal Mengambil Data</h1>
        <p className="text-gray-700 dark:text-gray-300">Pesan dari server: <span className="font-semibold">{pesanError}</span></p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <h2 className="text-2xl font-semibold text-gray-600 dark:text-gray-300 animate-pulse font-sans">⏳ Menyiapkan Dashboard...</h2>
      </div>
    )
  }

  const dataGrafik = ringkasan ? [
    { name: 'Positif', value: ringkasan.Positif || 0, color: '#22c55e' }, 
    { name: 'Negatif', value: ringkasan.Negatif || 0, color: '#ef4444' }, 
    { name: 'Netral', value: ringkasan.Netral || 0, color: '#9ca3af' }  
  ] : []

  return (
    <div className="p-6 md:p-10 font-sans min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center border-b-2 border-gray-200 dark:border-gray-700 pb-4 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-main)] mb-4 md:mb-0 transition-colors duration-300">
            📊 Dashboard Analisis Sentimen
          </h1>
          
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="flex items-center gap-2 px-6 py-2 bg-white dark:bg-gray-800 text-[var(--text-main)] border border-gray-300 dark:border-gray-600 rounded-full shadow-sm hover:shadow-md active:scale-95 transition-all font-medium"
          >
            {isDarkMode ? '☀️ Mode Terang' : '🌙 Mode Gelap'}
          </button>
        </div>
        
        {/* RINGKASAN CARDS */}
        <div className="flex flex-col md:flex-row gap-6 mb-10">
          <div className="flex-1 p-6 bg-green-500 text-white rounded-2xl shadow-lg hover:rotate-1 transition-all">
            <h3 className="text-lg font-medium opacity-90 m-0 font-sans">Positif</h3>
            <p className="text-5xl font-extrabold mt-2 tracking-tight">{ringkasan?.Positif || 0}</p>
          </div>
          <div className="flex-1 p-6 bg-red-500 text-white rounded-2xl shadow-lg hover:-rotate-1 transition-all">
            <h3 className="text-lg font-medium opacity-90 m-0 font-sans">Negatif</h3>
            <p className="text-5xl font-extrabold mt-2 tracking-tight">{ringkasan?.Negatif || 0}</p>
          </div>
          <div className="flex-1 p-6 bg-gray-400 text-white rounded-2xl shadow-lg hover:rotate-1 transition-all">
            <h3 className="text-lg font-medium opacity-90 m-0 font-sans">Netral</h3>
            <p className="text-5xl font-extrabold mt-2 tracking-tight">{ringkasan?.Netral || 0}</p>
          </div>
        </div>

        {/* GRAFIK DISTRIBUSI */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 mb-10 h-[400px] transition-colors duration-300">
          <h2 className="text-center text-xl font-bold text-gray-700 dark:text-gray-200 mb-4 font-sans">Distribusi Sentimen Kutipan</h2>
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
              <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* BAGIAN DATA & PENCARIAN */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-4 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white font-sans">Detail Data Teks</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Menampilkan <span className="font-bold text-blue-600 dark:text-blue-400">{dataTerfilter.length}</span> hasil
            </p>
          </div>

          {/* INPUT SEARCH */}
          <div className="w-full md:w-80 relative">
            <span className="absolute left-4 top-3 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Cari kata kunci..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm transition-all font-sans"
            />
          </div>
        </div>

        {/* TABEL DATA */}
        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 mb-10 transition-colors duration-300">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700 border-b-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200">
                <th className="p-4 font-semibold font-sans">Teks Kutipan (Hasil Tokenisasi)</th>
                <th className="p-4 font-semibold font-sans w-40">Label Sentimen</th>
              </tr>
            </thead>
            <tbody>
              {dataTerfilter.length > 0 ? (
                dataTerfilter.slice(0, 15).map((baris, index) => (
                  <tr key={index} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600/50 transition-colors font-sans">
                    <td className="p-4 text-gray-600 dark:text-gray-300 leading-relaxed italic">"{baris.Kutipan}"</td>
                    <td className="p-4 font-bold">
                      <span className={`px-3 py-1 rounded-full text-xs uppercase tracking-wider
                        ${baris.Label_Sentimen === 'Positif' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                          baris.Label_Sentimen === 'Negatif' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 
                          'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}
                      >
                        {baris.Label_Sentimen}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2" className="p-10 text-center text-gray-500 dark:text-gray-400 font-sans italic">
                    ❌ Tidak ada kutipan yang mengandung kata "{searchTerm}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <p className="text-gray-400 dark:text-gray-500 text-[10px] text-center pb-10 uppercase tracking-widest font-sans">
          Powered by NLP Model & React Framework
        </p>
      </div>
    </div>
  )
}

export default App