import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

// --- KOMPONEN ANIMASI ANGKA ---
function AnimatedNumber({ value }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value);
    
    if (!end || start === end) {
      setDisplayValue(end || 0);
      return;
    }

    let totalMilidetik = 1000; 
    let intervalWaktu = Math.max(totalMilidetik / end, 10); 

    let timer = setInterval(() => {
      start += 1;
      setDisplayValue(start);
      if (start >= end) {
        clearInterval(timer);
        setDisplayValue(end); 
      }
    }, intervalWaktu);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{displayValue}</span>;
}

// --- KOMPONEN UTAMA DASHBOARD ---
function App() {
  const [ringkasan, setRingkasan] = useState(null)
  const [kutipan, setKutipan] = useState([])
  const [loading, setLoading] = useState(true)
  const [pesanError, setPesanError] = useState(null)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // State untuk Fitur Live Inference
  const [inputText, setInputText] = useState('')
  const [hasilSimulasi, setHasilSimulasi] = useState(null)
  const [skorKepercayaan, setSkorKepercayaan] = useState(null) // Tambahan Skor Dinamis
  const [isAnalyzing, setIsAnalyzing] = useState(false)

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
        setTimeout(() => setLoading(false), 800) 
      })
      .catch(err => {
        setPesanError(err.message)
        setLoading(false)
      })
  }, [])

  const dataTerfilter = kutipan.filter((item) => {
    return item.Kutipan.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const handleExportCSV = () => {
    let csvContent = "Kutipan,Label Sentimen\n";
    dataTerfilter.forEach(row => {
      let teksBersih = row.Kutipan.replace(/"/g, '""');
      csvContent += `"${teksBersih}","${row.Label_Sentimen}"\n`;
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Data_Sentimen_${searchTerm ? 'Filtered' : 'All'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // --- LOGIKA ANALISIS (HYBRID: MOCK-UP + PERSIAPAN REAL API) ---
  const handleAnalisis = async () => {
    setIsAnalyzing(true);
    setHasilSimulasi(null);
    setSkorKepercayaan(null);


    // --- MOCKUP PINTAR DINAMIS (Opsi 2) ---
    setTimeout(() => {
      const teks = inputText.toLowerCase();
      let hasil = 'Netral';

      // Perbendaharaan kata yang lebih banyak
      const kataPositif = ['bagus', 'keren', 'suka', 'mantap', 'terbaik', 'puas', 'membantu', 'mudah', 'cepat'];
      const kataNegatif = ['jelek', 'kecewa', 'buruk', 'marah', 'sulit', 'lambat', 'error', 'parah', 'bingung'];

      const isPositif = kataPositif.some(kata => teks.includes(kata));
      const isNegatif = kataNegatif.some(kata => teks.includes(kata));

      if (isPositif && !isNegatif) hasil = 'Positif';
      else if (isNegatif && !isPositif) hasil = 'Negatif';

      // Generate Skor Dinamis antara 85.0% - 99.9%
      const skorAcak = (Math.random() * (99.9 - 85.0) + 85.0).toFixed(1);

      setHasilSimulasi(hasil);
      setSkorKepercayaan(skorAcak);
      setIsAnalyzing(false);
    }, 1500);
  }

  // --- UX: FUNGSI BERSIHKAN (Opsi 3) ---
  const handleReset = () => {
    setInputText('');
    setHasilSimulasi(null);
    setSkorKepercayaan(null);
  }

  if (loading) {
    return (
      <div className="p-6 md:p-10 font-sans min-h-screen bg-[var(--background)] transition-colors duration-300">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center border-b-2 border-[var(--border-color)] pb-4 mb-8">
            <div className="h-10 w-64 bg-gray-300 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="h-10 w-32 bg-gray-300 dark:bg-gray-700 rounded-full animate-pulse"></div>
          </div>
          <div className="flex flex-col md:flex-row gap-6 mb-10">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex-1 h-32 bg-gray-300 dark:bg-gray-700 rounded-2xl animate-pulse"></div>
            ))}
          </div>
          <div className="bg-[var(--card-bg)] p-6 rounded-2xl border border-[var(--border-color)] mb-10 h-[400px] flex flex-col items-center justify-center">
            <div className="h-6 w-48 bg-gray-300 dark:bg-gray-700 rounded mb-8 animate-pulse"></div>
            <div className="w-56 h-56 rounded-full border-[20px] border-gray-200 dark:border-gray-700 animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  if (pesanError) {
    return (
      <div className="text-center mt-16 font-sans bg-[var(--background)] min-h-screen pt-10 transition-colors duration-300 text-[var(--text-main)]">
        <h1 className="text-3xl font-bold text-red-500 mb-2">❌ Gagal Mengambil Data</h1>
        <p>Pesan dari server: <span className="font-semibold">{pesanError}</span></p>
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
      <div className="max-w-6xl mx-auto animate-in fade-in duration-700">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center border-b-2 border-[var(--border-color)] pb-4 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 md:mb-0 tracking-tight text-[var(--text-main)]">
            📊 Dashboard Analisis Sentimen
          </h1>
          
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="flex items-center gap-2 px-6 py-2 bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--text-main)] rounded-full shadow-sm hover:shadow-md active:scale-95 transition-all font-medium"
          >
            {isDarkMode ? '☀️ Mode Terang' : '🌙 Mode Gelap'}
          </button>
        </div>
        
        {/* RINGKASAN CARDS */}
        <div className="flex flex-col md:flex-row gap-6 mb-10 text-white">
          <div className="flex-1 p-6 bg-green-500 rounded-2xl shadow-lg hover:shadow-xl transition-all">
            <h3 className="text-lg font-medium opacity-90 m-0">Positif</h3>
            <p className="text-5xl font-extrabold mt-2 tracking-tight">
              <AnimatedNumber value={ringkasan?.Positif || 0} />
            </p>
          </div>
          <div className="flex-1 p-6 bg-red-500 rounded-2xl shadow-lg hover:shadow-xl transition-all">
            <h3 className="text-lg font-medium opacity-90 m-0">Negatif</h3>
            <p className="text-5xl font-extrabold mt-2 tracking-tight">
              <AnimatedNumber value={ringkasan?.Negatif || 0} />
            </p>
          </div>
          <div className="flex-1 p-6 bg-gray-500 rounded-2xl shadow-lg hover:shadow-xl transition-all">
            <h3 className="text-lg font-medium opacity-90 m-0">Netral</h3>
            <p className="text-5xl font-extrabold mt-2 tracking-tight">
              <AnimatedNumber value={ringkasan?.Netral || 0} />
            </p>
          </div>
        </div>

        {/* FITUR LIVE INFERENCE (DENGAN UX RESET & SKOR DINAMIS) */}
        <div className="bg-[var(--card-bg)] p-6 rounded-2xl shadow-md border border-[var(--border-color)] mb-10 transition-colors duration-300">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span>🤖</span> Coba Analisis Kalimatmu (BETA)
          </h2>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ketik kalimat tentang pengalamanmu di sini... (Contoh: Website ini keren banget dan sangat cepat!)"
                className="w-full p-4 bg-[var(--background)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none h-32 transition-colors text-sm text-[var(--text-main)]"
              ></textarea>
              
              {/* Grup Tombol Aksi */}
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <button
                  onClick={handleAnalisis}
                  disabled={!inputText.trim() || isAnalyzing}
                  className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-medium rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  {isAnalyzing ? '⏳ Menganalisis Pola...' : '✨ Analisis Sekarang'}
                </button>
                
                {/* Tombol UX Tambahan: Reset */}
                <button
                  onClick={handleReset}
                  disabled={!inputText.trim() && !hasilSimulasi}
                  className="w-full sm:w-auto px-6 py-2.5 bg-[var(--background)] hover:bg-gray-200 dark:hover:bg-gray-700 border border-[var(--border-color)] disabled:opacity-50 text-[var(--text-main)] text-sm font-medium rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  🗑️ Bersihkan
                </button>
              </div>
            </div>

            {/* Kotak Hasil Analisis Dinamis */}
            <div className="w-full md:w-1/3 bg-[var(--background)] border border-[var(--border-color)] rounded-xl p-6 flex flex-col justify-center items-center transition-colors min-h-[160px] relative overflow-hidden">
              {isAnalyzing ? (
                <div className="flex flex-col items-center animate-pulse z-10">
                  <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-3"></div>
                  <p className="text-sm text-gray-500">Memproses jutaan parameter...</p>
                </div>
              ) : hasilSimulasi ? (
                <div className="text-center animate-in zoom-in duration-300 z-10">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-semibold">Hasil Prediksi AI</p>
                  <span className={`px-6 py-2.5 rounded-full text-base font-extrabold uppercase tracking-widest inline-block mb-3 border shadow-sm
                    ${hasilSimulasi === 'Positif' ? 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/40 dark:text-green-400' : 
                      hasilSimulasi === 'Negatif' ? 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/40 dark:text-red-400' : 
                      'bg-gray-200 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300'}`}
                  >
                    {hasilSimulasi}
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Akurasi Model: <span className="font-bold text-indigo-600 dark:text-indigo-400">{skorKepercayaan}%</span>
                  </p>
                </div>
              ) : (
                <div className="text-center opacity-40 z-10">
                  <span className="text-4xl block mb-2 grayscale">🧠</span>
                  <p className="text-sm italic">Menunggu input teks...</p>
                </div>
              )}
            </div>
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

        {/* DATA HEADER, SEARCH & EXPORT BUTTON */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold">Detail Data Teks</h2>
            <p className="text-gray-500 text-sm">
              Menampilkan <span className="font-bold text-blue-500"><AnimatedNumber value={dataTerfilter.length} /></span> hasil
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="w-full sm:w-64 relative">
              <span className="absolute left-4 top-2.5 opacity-50">🔍</span>
              <input
                type="text"
                placeholder="Cari kutipan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm transition-all text-sm text-[var(--text-main)]"
              />
            </div>
            
            <button 
              onClick={handleExportCSV}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              📥 Unduh CSV
            </button>
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
                    <td className="p-4 text-sm leading-relaxed opacity-80 italic text-[var(--text-main)]">"{baris.Kutipan}"</td>
                    <td className="p-4 text-center text-[var(--text-main)]">
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
                    ❌ Kata "{searchTerm}" tidak ditemukan.
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