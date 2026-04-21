import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

function App() {
  const [ringkasan, setRingkasan] = useState(null)
  const [kutipan, setKutipan] = useState([])
  const [loading, setLoading] = useState(true)
  const [pesanError, setPesanError] = useState(null)

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
      <div className="text-center mt-16 font-sans">
        <h1 className="text-3xl font-bold text-red-500 mb-2">❌ Gagal Mengambil Data</h1>
        <p className="text-gray-700">Pesan dari server: <span className="font-semibold">{pesanError}</span></p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <h2 className="text-2xl font-semibold text-gray-600 animate-pulse">⏳ Menyiapkan Dashboard...</h2>
      </div>
    )
  }

  // Data ini otomatis membaca dari state 'ringkasan' milikmu
  const dataGrafik = ringkasan ? [
    { name: 'Positif', value: ringkasan.Positif || 0, color: '#22c55e' }, // emerald-500
    { name: 'Negatif', value: ringkasan.Negatif || 0, color: '#ef4444' }, // red-500
    { name: 'Netral', value: ringkasan.Netral || 0, color: '#9ca3af' }  // gray-400
  ] : []

  return (
    <div className="p-6 md:p-10 font-sans max-w-6xl mx-auto bg-gray-50 min-h-screen">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 border-b-2 border-gray-200 pb-4 mb-8">
        📊 Dashboard Analisis Sentimen
      </h1>
      
      {/* KARTU RINGKASAN */}
      {/* flex-col untuk layar HP, md:flex-row untuk layar laptop */}
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

      {/* KOMPONEN GRAFIK */}
      <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 mb-10 h-[400px]">
        <h2 className="text-center text-xl font-bold text-gray-700 mb-4">Distribusi Sentimen Kutipan</h2>
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
            >
              {dataGrafik.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
            />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* TABEL DATA */}
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Detail Data Teks</h2>
      <div className="overflow-x-auto bg-white rounded-xl shadow-md border border-gray-100 mb-4">
        <table className="w-full text-left border-collapse whitespace-nowrap md:whitespace-normal">
          <thead>
            <tr className="bg-gray-100 border-b-2 border-gray-200 text-gray-700">
              <th className="p-4 font-semibold w-3/4">Teks Kutipan (Hasil Tokenisasi)</th>
              <th className="p-4 font-semibold w-1/4">Label Sentimen</th>
            </tr>
          </thead>
          <tbody>
            {kutipan?.slice(0, 15).map((baris, index) => (
              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="p-4 text-gray-600 leading-relaxed">{baris.Kutipan}</td>
                <td className={`p-4 font-bold 
                  ${baris.Label_Sentimen === 'Positif' ? 'text-green-600' : 
                    baris.Label_Sentimen === 'Negatif' ? 'text-red-600' : 'text-gray-500'}`}
                >
                  {baris.Label_Sentimen}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <p className="text-gray-500 text-sm font-medium">
        *Menampilkan 15 sampel data teratas dari total <span className="text-gray-800 font-bold">{kutipan?.length || 0}</span> data.
      </p>
    </div>
  )
}

export default App