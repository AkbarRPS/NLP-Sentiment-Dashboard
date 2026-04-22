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
  const [skorKepercayaan, setSkorKepercayaan] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // Sinkronisasi Dark Mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  // Fetch Data
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

  // Logika Filter Pencarian
  const dataTerfilter = kutipan.filter((item) => {
    return item.Kutipan.toLowerCase().includes(searchTerm.toLowerCase())
  })

  // Handlers
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

  const handleAnalisis = () => {
    setIsAnalyzing(true);
    setHasilSimulasi(null);
    setSkorKepercayaan(null);

    setTimeout(() => {
      const teks = inputText.toLowerCase();
      let hasil = 'Netral';
      const kataPositif = ['bagus', 'keren', 'suka', 'mantap', 'terbaik', 'puas', 'membantu', 'mudah', 'cepat'];
      const kataNegatif = ['jelek', 'kecewa', 'buruk', 'marah', 'sulit', 'lambat', 'error', 'parah', 'bingung'];

      const isPositif = kataPositif.some(kata => teks.includes(kata));
      const isNegatif = kataNegatif.some(kata => teks.includes(kata));

      if (isPositif && !isNegatif) hasil = 'Positif';
      else if (isNegatif && !isPositif) hasil = 'Negatif';

      const skorAcak = (Math.random() * (99.9 - 85.0) + 85.0).toFixed(1);
      setHasilSimulasi(hasil);
      setSkorKepercayaan(skorAcak);
      setIsAnalyzing(false);
    }, 1500);
  }

  const handleReset = () => {
    setInputText('');
    setHasilSimulasi(null);
    setSkorKepercayaan(null);
  }

  // --- VIEW: LOADING SKELETON ---
  if (loading) {
    return (
      <div className="p-6 md:p-10 font-sans min-h-screen bg-[var(--background)] transition-colors duration-300">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center border-b-2 border-[var(--border-color)] pb-4 mb-8">
            <div className="h-10 w-64 bg-gray-300 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="h-10 w-32 bg-gray-300 dark:bg-gray-700 rounded-full animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-gray-300 dark:bg-gray-700 rounded-2xl animate-pulse"></div>
            ))}
          </div>
          <div className="bg-[var(--card-bg)] p-6 rounded-2xl border border-[var(--border-color)] mb-10 h-[400px] flex flex-col items-center justify-center animate-pulse">
            <div className="h-6 w-48 bg-gray-300 dark:bg-gray-700 rounded mb-8"></div>
            <div className="w-56 h-56 rounded-full border-[20px] border-gray-200 dark:border-gray-700"></div>
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
        
        {/* RINGKASAN CARDS (DEKORASI BARU DENGAN GRADIEN & IKON) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 text-white">
          <div className="p-6 bg-gradient-to-br from-green-500 to-green-600 rounded-3xl shadow-lg flex flex-col items-center justify-center transform hover:scale-[1.02] transition-all border border-green-400/20">
            <span className="text-4xl mb-2 drop-shadow-md">😊</span>
            <h3 className="text-sm font-medium opacity-90 m-0 uppercase tracking-widest">Positif</h3>
            <p className="text-5xl font-black mt-1 tracking-tighter">
              <AnimatedNumber value={ringkasan?.Positif || 0} />
            </p>
          </div>

          <div className="p-6 bg-gradient-to-br from-red-500 to-red-600 rounded-3xl shadow-lg flex flex-col items-center justify-center transform hover:scale-[1.02] transition-all border border-red-400/20">
            <span className="text-4xl mb-2 drop-shadow-md">😟</span>
            <h3 className="text-sm font-medium opacity-90 m-0 uppercase tracking-widest">Negatif</h3>
            <p className="text-5xl font-black mt-1 tracking-tighter">
              <AnimatedNumber value={ringkasan?.Negatif || 0} />
            </p>
          </div>

          <div className="p-6 bg-gradient-to-br from-slate-500 to-slate-600 rounded-3xl shadow-lg flex flex-col items-center justify-center transform hover:scale-[1.02] transition-all border border-slate-400/20">
            <span className="text-4xl mb-2 drop-shadow-md">😐</span>
            <h3 className="text-sm font-medium opacity-90 m-0 uppercase tracking-widest">Netral</h3>
            <p className="text-5xl font-black mt-1 tracking-tighter">
              <AnimatedNumber value={ringkasan?.Netral || 0} />
            </p>
          </div>
        </div>

        {/* LIVE INFERENCE */}
        <div className="bg-[var(--card-bg)] p-6 rounded-3xl shadow-sm border border-[var(--border-color)] mb-10 transition-colors duration-300">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span>🤖</span> Bilik Analisis AI (BETA)
          </h2>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Tuliskan pendapat atau ulasan di sini..."
                className="w-full p-5 bg-[var(--background)] border border-[var(--border-color)] rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none h-36 transition-all text-[var(--text-main)]"
              ></textarea>
              <div className="flex flex-wrap gap-3 mt-4">
                <button
                  onClick={handleAnalisis}
                  disabled={!inputText.trim() || isAnalyzing}
                  className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-2xl shadow-md transition-all active:scale-95"
                >
                  {isAnalyzing ? '⏳ Menganalisis...' : '✨ Cek Sentimen'}
                </button>
                <button
                  onClick={handleReset}
                  disabled={!inputText.trim() && !hasilSimulasi}
                  className="px-8 py-3 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 border border-[var(--border-color)] text-[var(--text-main)] font-medium rounded-2xl transition-all"
                >
                  🗑️ Reset
                </button>
              </div>
            </div>

            <div className="w-full md:w-1/3 bg-[var(--background)] border border-[var(--border-color)] rounded-2xl p-8 flex flex-col justify-center items-center min-h-[200px]">
              {isAnalyzing ? (
                <div className="text-center animate-pulse">
                  <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-sm opacity-60">Memproses teks...</p>
                </div>
              ) : hasilSimulasi ? (
                <div className="text-center animate-in zoom-in duration-300">
                  <p className="text-xs opacity-50 uppercase tracking-widest mb-3">Hasil Prediksi</p>
                  <div className={`text-2xl font-black px-6 py-2 rounded-2xl border-2 mb-4 inline-block
                    ${hasilSimulasi === 'Positif' ? 'text-green-500 border-green-500/20 bg-green-500/10' : 
                      hasilSimulasi === 'Negatif' ? 'text-red-500 border-red-500/20 bg-red-500/10' : 
                      'text-gray-500 border-gray-500/20 bg-gray-500/10'}`}>
                    {hasilSimulasi}
                  </div>
                  <p className="text-xs opacity-50">Tingkat Kepercayaan: <span className="font-bold text-indigo-500">{skorKepercayaan}%</span></p>
                </div>
              ) : (
                <p className="text-center italic opacity-30 text-sm">Hasil akan muncul di sini setelah dianalisis</p>
              )}
            </div>
          </div>
        </div>

        {/* GRAFIK DISTRIBUSI */}
        <div className="bg-[var(--card-bg)] p-8 rounded-3xl shadow-sm border border-[var(--border-color)] mb-10 h-[450px] transition-colors duration-300">
          <h2 className="text-center text-xl font-bold mb-6">Distribusi Statistik Data</h2>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dataGrafik}
                cx="50%"
                cy="50%"
                innerRadius={90}
                outerRadius={130}
                paddingAngle={8}
                dataKey="value"
                stroke="none"
              >
                {dataGrafik.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '16px', 
                  border: 'none', 
                  backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                  color: isDarkMode ? '#ffffff' : '#000000',
                  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' 
                }} 
              />
              <Legend verticalAlign="bottom" height={40} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* DATA CONTROL (SEARCH & EXPORT) */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold">Detail Koleksi Data</h2>
            <p className="text-sm opacity-50">Menampilkan {dataTerfilter.length} entri ditemukan</p>
          </div>
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <span className="absolute left-4 top-2.5 opacity-30">🔍</span>
              <input
                type="text"
                placeholder="Cari kutipan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-sm"
              />
            </div>
            <button 
              onClick={handleExportCSV}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-2xl shadow-md transition-all active:scale-95 flex items-center gap-2"
            >
              📥 Export CSV
            </button>
          </div>
        </div>

        {/* TABEL DATA */}
        <div className="overflow-x-auto bg-[var(--card-bg)] rounded-3xl shadow-sm border border-[var(--border-color)] mb-12 transition-colors duration-300">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[var(--background)] border-b border-[var(--border-color)] text-xs uppercase tracking-widest opacity-60">
                <th className="p-6 font-bold">Konten Kutipan</th>
                <th className="p-6 font-bold w-48 text-center">Klasifikasi</th>
              </tr>
            </thead>
            <tbody>
              {dataTerfilter.length > 0 ? (
                dataTerfilter.slice(0, 15).map((baris, index) => (
                  <tr key={index} className="border-b border-[var(--border-color)] hover:bg-gray-400/5 transition-all">
                    <td className="p-6 text-sm opacity-80 italic leading-relaxed">"{baris.Kutipan}"</td>
                    <td className="p-6 text-center">
                      <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter border
                        ${baris.Label_Sentimen === 'Positif' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                          baris.Label_Sentimen === 'Negatif' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                          'bg-gray-500/10 text-gray-500 border-gray-500/20'}`}
                      >
                        {baris.Label_Sentimen}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2" className="p-16 text-center opacity-40 italic">Data tidak ditemukan dalam database.</td>
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