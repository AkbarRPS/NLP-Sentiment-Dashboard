import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

function App() {
  const [ringkasan, setRingkasan] = useState(null)
  const [kutipan, setKutipan] = useState([])
  const [loading, setLoading] = useState(true)
  const [pesanError, setPesanError] = useState(null)
  const [isDarkMode, setIsDarkMode] = useState(false)

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

  if (pesanError) {
    return (
      <div className="text-center mt-16 font-sans dark:bg-gray-900 min-h-screen pt-10">
        <h1 className="text-3xl font-bold text-red-500 mb-2">❌ Gagal Mengambil Data</h1>
        <p className="text-gray-700 dark:text-gray-300">Pesan dari server: <span className="font-semibold">{pesanError}</span></p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <h2 className="text-2xl font-semibold text-gray-600 dark:text-gray-300 animate-pulse">⏳ Menyiapkan Dashboard...</h2>
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

        
        <div className="flex flex-col md:flex-row justify-between items-center border-b-2 border-gray-200 dark:border-gray-700 pb-4 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-main)] mb-4 md:mb-0 transition-colors duration-300">
            📊 Dashboard Analisis Sentimen
          </h1>
          
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-[var(--text-main)] border border-gray-300 dark:border-gray-600 rounded-full shadow-sm hover:shadow-md transition-all font-medium"
          >
            {isDarkMode ? '☀️ Mode Terang' : '🌙 Mode Gelap'}
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6 mb-10">
          <div className="flex-1 p-6 bg-green-500 text-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <h3 className="text-lg font-medium opacity-90 m-0">Positif</h3>
            <p className="text-5xl font-extrabold mt-2 tracking-tight">{ringkasan?.Positif || 0}</p>
          </div>
          
          <div className="flex-1 p-6 bg-red-500 text-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <h3 className="text-lg font-medium opacity-90 m-0">Negatif</h3>
            <p className="text-5xl font-extrabold mt-2 tracking-tight">{ringkasan?.Negatif || 0}</p>
          </div>
          
          <div className="flex-1 p-6 bg-gray-400 text-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <h3 className="text-lg font-medium opacity-90 m-0">Netral</h3>
            <p className="text-5xl font-extrabold mt-2 tracking-tight">{ringkasan?.Netral || 0}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 mb-10 h-[400px] transition-colors duration-300">
          <h2 className="text-center text-xl font-bold text-gray-700 dark:text-gray-200 mb-4">Distribusi Sentimen Kutipan</h2>
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
                  borderRadius: '10px', 
                  border: 'none', 
                  backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                  color: isDarkMode ? '#ffffff' : '#000000',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                }} 
              />
              <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Detail Data Teks</h2>
        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 mb-4 transition-colors duration-300">
          <table className="w-full text-left border-collapse whitespace-nowrap md:whitespace-normal">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700 border-b-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200">
                <th className="p-4 font-semibold w-3/4">Teks Kutipan (Hasil Tokenisasi)</th>
                <th className="p-4 font-semibold w-1/4">Label Sentimen</th>
              </tr>
            </thead>
            <tbody>
              {kutipan?.slice(0, 15).map((baris, index) => (
                <tr key={index} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600/50 transition-colors">
                  <td className="p-4 text-gray-600 dark:text-gray-300 leading-relaxed">{baris.Kutipan}</td>
                  <td className={`p-4 font-bold 
                    ${baris.Label_Sentimen === 'Positif' ? 'text-green-600 dark:text-green-400' : 
                      baris.Label_Sentimen === 'Negatif' ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}
                  >
                    {baris.Label_Sentimen}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium pb-10">
          *Menampilkan 15 sampel data teratas dari total <span className="text-gray-800 dark:text-gray-200 font-bold">{kutipan?.length || 0}</span> data.
        </p>
      </div>
    </div>
  )
}

export default App