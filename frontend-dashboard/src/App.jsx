import { useState, useEffect } from 'react'
// 1. Tambahkan import komponen grafik dari Recharts di sini
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
      <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'Arial' }}>
        <h1 style={{ color: '#e74c3c' }}>❌ Gagal Mengambil Data</h1>
        <p>Pesan dari server: <b>{pesanError}</b></p>
      </div>
    )
  }

  if (loading) {
    return <h2 style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'Arial' }}>⏳ Menyiapkan Dashboard...</h2>
  }

  // 2. Siapkan format data khusus untuk Grafik Pie
  // Data ini otomatis membaca dari state 'ringkasan' milikmu
  const dataGrafik = ringkasan ? [
    { name: 'Positif', value: ringkasan.Positif || 0, color: '#2ecc71' },
    { name: 'Negatif', value: ringkasan.Negatif || 0, color: '#e74c3c' },
    { name: 'Netral', value: ringkasan.Netral || 0, color: '#95a5a6' }
  ] : []

  return (
    <div style={{ padding: '30px', fontFamily: 'Arial, sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ borderBottom: '2px solid #ccc', paddingBottom: '10px' }}>📊 Dashboard Analisis Sentimen</h1>
      
      {/* KARTU RINGKASAN (Tetap sama seperti sebelumnya) */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', marginTop: '20px' }}>
        <div style={{ flex: 1, padding: '20px', backgroundColor: '#2ecc71', color: 'white', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: 0 }}>Positif</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold', margin: '10px 0 0 0' }}>{ringkasan?.Positif || 0}</p>
        </div>
        <div style={{ flex: 1, padding: '20px', backgroundColor: '#e74c3c', color: 'white', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: 0 }}>Negatif</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold', margin: '10px 0 0 0' }}>{ringkasan?.Negatif || 0}</p>
        </div>
        <div style={{ flex: 1, padding: '20px', backgroundColor: '#95a5a6', color: 'white', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: 0 }}>Netral</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold', margin: '10px 0 0 0' }}>{ringkasan?.Netral || 0}</p>
        </div>
      </div>

      {/* 3. KOMPONEN GRAFIK (Baru ditambahkan) */}
      <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '30px', height: '350px' }}>
        <h2 style={{ textAlign: 'center', marginTop: 0, color: '#333' }}>Distribusi Sentimen Kutipan</h2>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={dataGrafik}
              cx="50%"
              cy="50%"
              innerRadius={70} // Ini membuat grafiknya bolong di tengah (seperti donat)
              outerRadius={110}
              paddingAngle={5}
              dataKey="value"
            >
              {dataGrafik.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* TABEL DATA */}
      <h2>Detail Data Teks</h2>
      <div style={{ overflowX: 'auto', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
              <th style={{ padding: '15px' }}>Teks Kutipan (Hasil Tokenisasi)</th>
              <th style={{ padding: '15px', width: '150px' }}>Label Sentimen</th>
            </tr>
          </thead>
          <tbody>
            {kutipan?.slice(0, 15).map((baris, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                {/* INGAT: Ganti 'KOLOM_KUTIPAN_MU' dengan nama kolom yang benar! */}
                <td style={{ padding: '15px' }}>{baris.Kutipan}</td>
                <td style={{ padding: '15px', fontWeight: 'bold', color: baris.Label_Sentimen === 'Positif' ? '#27ae60' : baris.Label_Sentimen === 'Negatif' ? '#c0392b' : '#7f8c8d' }}>
                  {baris.Label_Sentimen}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ color: '#666', fontSize: '14px' }}>*Menampilkan 15 sampel data teratas dari total {kutipan?.length || 0} data.</p>
    </div>
  )
}

export default App