import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts'

// --- KOMPONEN ANIMASI ANGKA ---
function AnimatedNumber({ value }) {
  const [displayValue, setDisplayValue] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = parseInt(value);
    if (!end || start === end) { setDisplayValue(end || 0); return; }
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

// --- KOMPONEN LAYOUT (SIDEBAR & HEADER) ---
function Layout({ children, isDarkMode, setIsDarkMode }) {
  const location = useLocation();
  const menu = [
    { name: 'Dashboard', path: '/', icon: '📊' },
    { name: 'Koleksi Data', path: '/data', icon: '📁' },
    { name: 'Lab AI', path: '/lab', icon: '🤖' },
  ];

  return (
    <div className="flex min-h-screen bg-[var(--background)] text-[var(--text-main)] transition-colors duration-300">
      {/* SIDEBAR */}
      <aside className="w-20 md:w-64 bg-[var(--card-bg)] border-r border-[var(--border-color)] flex flex-col transition-all sticky top-0 h-screen">
        <div className="p-8 font-black text-2xl tracking-tighter text-indigo-600 hidden md:block">
          SENTIFY
        </div>
        <div className="p-8 text-2xl md:hidden text-center">⚡</div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {menu.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 p-4 rounded-3xl transition-all ${
                location.pathname === item.path 
                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/40' 
                : 'hover:bg-gray-400/10 opacity-70 hover:opacity-100'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="hidden md:block font-bold tracking-tight">{item.name}</span>
            </Link>
          ))}
        </nav>
        
        {/* TEMA SWITCHER DI SIDEBAR */}
        <div className="p-6 border-t border-[var(--border-color)]">
          <div className="flex items-center justify-center gap-2 bg-[var(--background)] p-2 rounded-2xl border border-[var(--border-color)]">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${isDarkMode ? 'bg-indigo-600' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-300 ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
            <span className="text-xs hidden md:block font-medium opacity-60">{isDarkMode ? 'DARK' : 'LIGHT'}</span>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
          {children}
        </div>
      </main>
    </div>
  );
}

// --- HALAMAN 1: DASHBOARD ---
function DashboardPage({ ringkasan, dataTren, isDarkMode }) {
  const dataPie = ringkasan ? [
    { name: 'Positif', value: ringkasan.Positif, color: '#22c55e' },
    { name: 'Negatif', value: ringkasan.Negatif, color: '#ef4444' },
    { name: 'Netral', value: ringkasan.Netral, color: '#64748b' }
  ] : [];

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-4xl font-black tracking-tight">Main Dashboard</h1>
        <p className="opacity-50 mt-1 text-lg">Visualisasi sentimen ulasan secara real-time.</p>
      </header>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-white">
        <div className="p-8 bg-gradient-to-br from-green-500 to-green-600 rounded-[40px] shadow-lg border border-green-400/20">
          <span className="text-sm uppercase tracking-widest font-black opacity-80">Positif</span>
          <div className="text-6xl font-black mt-2 tracking-tighter"><AnimatedNumber value={ringkasan?.Positif || 0} /></div>
        </div>
        <div className="p-8 bg-gradient-to-br from-red-500 to-red-600 rounded-[40px] shadow-lg border border-red-400/20">
          <span className="text-sm uppercase tracking-widest font-black opacity-80">Negatif</span>
          <div className="text-6xl font-black mt-2 tracking-tighter"><AnimatedNumber value={ringkasan?.Negatif || 0} /></div>
        </div>
        <div className="p-8 bg-gradient-to-br from-slate-500 to-slate-600 rounded-[40px] shadow-lg border border-slate-400/20">
          <span className="text-sm uppercase tracking-widest font-black opacity-80">Netral</span>
          <div className="text-6xl font-black mt-2 tracking-tighter"><AnimatedNumber value={ringkasan?.Netral || 0} /></div>
        </div>
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[var(--card-bg)] p-8 rounded-[40px] border border-[var(--border-color)]">
          <h3 className="text-xl font-bold mb-8 text-center tracking-tight">Proporsi Sentimen</h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={dataPie} cx="50%" cy="50%" innerRadius={90} outerRadius={125} paddingAngle={8} dataKey="value" stroke="none">
                  {dataPie.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }} />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-[var(--card-bg)] p-8 rounded-[40px] border border-[var(--border-color)]">
          <h3 className="text-xl font-bold mb-8 text-center tracking-tight">Tren Analitik (7 Hari)</h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dataTren}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
                <XAxis dataKey="name" stroke="#9ca3af" axisLine={false} tick={{fontSize:12}} tickMargin={10} />
                <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} tick={{fontSize:12}} />
                <Tooltip contentStyle={{ borderRadius: '20px', border: 'none' }} />
                <Line type="monotone" dataKey="Positif" stroke="#22c55e" strokeWidth={5} dot={{r:5, strokeWidth:3}} activeDot={{r:8}} />
                <Line type="monotone" dataKey="Negatif" stroke="#ef4444" strokeWidth={5} dot={{r:5, strokeWidth:3}} activeDot={{r:8}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- HALAMAN 2: KOLEKSI DATA ---
function DataPage({ dataTerfilter, searchTerm, setSearchTerm, handleExportCSV }) {
  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight">Database</h1>
          <p className="opacity-50 mt-1">Eksplorasi data mentah dan hasil klasifikasi.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <span className="absolute left-4 top-3.5 opacity-30">🔍</span>
            <input 
              type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari kutipan teks..."
              className="w-full pl-12 pr-4 py-3.5 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl outline-none focus:ring-2 ring-indigo-500 transition-all shadow-sm"
            />
          </div>
          <button onClick={handleExportCSV} className="bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30">EXPORT</button>
        </div>
      </header>

      <div className="bg-[var(--card-bg)] rounded-[40px] border border-[var(--border-color)] overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-400/5 text-[10px] uppercase tracking-[0.2em] font-black opacity-50">
            <tr><th className="p-8">Isi Kutipan</th><th className="p-8 text-center w-40">Status</th></tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-color)]">
            {dataTerfilter.length > 0 ? (
              dataTerfilter.slice(0, 20).map((item, i) => (
                <tr key={i} className="hover:bg-gray-400/5 transition-all group">
                  <td className="p-8 text-sm italic opacity-80 leading-relaxed group-hover:opacity-100">"{item.Kutipan}"</td>
                  <td className="p-8 text-center">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border ${
                      item.Label_Sentimen === 'Positif' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                    }`}>
                      {item.Label_Sentimen}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="2" className="p-20 text-center opacity-30 italic">Data tidak ditemukan...</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- HALAMAN 3: LAB AI ---
function LabPage({ inputText, setInputText, isAnalyzing, handleAnalisis, hasilSimulasi, skorKepercayaan, handleReset }) {
  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-4xl font-black tracking-tight">AI Laboratory</h1>
        <p className="opacity-50 mt-1 italic text-lg text-indigo-500 font-medium tracking-tight">Sentify Prediction Engine v1.0</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="relative">
            <textarea 
              value={inputText} onChange={(e) => setInputText(e.target.value)}
              className="w-full h-80 p-10 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[50px] outline-none focus:ring-4 ring-indigo-500/10 text-xl leading-relaxed transition-all shadow-inner"
              placeholder="Ketikkan sesuatu untuk diuji vibrasinya..."
            ></textarea>
            <div className="absolute bottom-6 right-10 opacity-20 font-black tracking-widest text-xs uppercase">BETA ACCESS</div>
          </div>
          <div className="flex gap-4">
            <button onClick={handleAnalisis} disabled={isAnalyzing || !inputText.trim()} className="flex-1 py-6 bg-indigo-600 text-white rounded-[30px] font-black text-xl shadow-2xl shadow-indigo-500/40 hover:scale-[0.98] active:scale-95 transition-all disabled:opacity-50">
              {isAnalyzing ? 'PROSESING...' : 'RUN ANALYSIS ✨'}
            </button>
            <button onClick={handleReset} className="px-10 py-6 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[30px] font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">RESET</button>
          </div>
        </div>

        <div className="bg-[var(--card-bg)] rounded-[50px] border border-[var(--border-color)] p-10 flex flex-col items-center justify-center text-center shadow-sm min-h-[400px]">
          {isAnalyzing ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="text-sm font-bold opacity-40 animate-pulse uppercase tracking-widest">Menghitung Probabilitas...</p>
            </div>
          ) : hasilSimulasi ? (
            <div className="animate-in zoom-in duration-500">
              <span className="text-xs opacity-50 uppercase tracking-[0.3em] font-black">Prediction Output</span>
              <div className={`text-6xl font-black my-6 tracking-tighter ${hasilSimulasi === 'Positif' ? 'text-green-500' : 'text-red-500'}`}>
                {hasilSimulasi}
              </div>
              <div className="inline-block text-indigo-500 font-black bg-indigo-500/10 px-6 py-2.5 rounded-2xl text-sm border border-indigo-500/10">
                CONFIDENCE: {skorKepercayaan}%
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-5xl mb-4 opacity-10">🧠</div>
              <p className="opacity-30 italic text-sm">Belum ada data untuk diproses.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- MAIN WRAPPER DENGAN ROUTING ---
function App() {
  const [ringkasan, setRingkasan] = useState(null)
  const [kutipan, setKutipan] = useState([])
  const [dataTren, setDataTren] = useState([])
  const [loading, setLoading] = useState(true)
  
  // FITUR: AUTO-THEME BERDASARKAN JAM
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const hr = new Date().getHours(); return hr >= 17 || hr < 5;
  })
  
  const [searchTerm, setSearchTerm] = useState('')
  const [inputText, setInputText] = useState('')
  const [hasilSimulasi, setHasilSimulasi] = useState(null)
  const [skorKepercayaan, setSkorKepercayaan] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // Sinkronisasi Tema
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  // Fetch API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const resSum = await fetch('https://akbarabay-sentimen.hf.space/api/summary');
        const dataSum = await resSum.json();
        setRingkasan(dataSum.ringkasan);

        const resQuotes = await fetch('https://akbarabay-sentimen.hf.space/api/quotes');
        const dataQuotes = await resQuotes.json();
        const fData = dataQuotes.data || [];
        setKutipan(fData);

        // Simulasi Tren Waktu
        const tData = Array.from({length: 7}, (_, i) => {
          const d = new Date(); d.setDate(d.getDate() - (6-i));
          return { name: d.toLocaleDateString('id-ID', {day:'numeric', month:'short'}), Positif: 0, Negatif: 0 };
        });
        fData.forEach((it, idx) => { if(tData[idx%7]) tData[idx%7][it.Label_Sentimen]++; });
        setDataTren(tData);
      } catch (e) { console.error("Gagal load data API:", e); }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleAnalisis = () => {
    setIsAnalyzing(true);
    setHasilSimulasi(null);
    setTimeout(() => {
      const res = inputText.toLowerCase().includes('bagus') || inputText.toLowerCase().includes('keren') ? 'Positif' : 'Negatif';
      setHasilSimulasi(res);
      setSkorKepercayaan((Math.random() * 15 + 85).toFixed(1));
      setIsAnalyzing(false);
    }, 1200);
  };

  const handleExportCSV = () => {
    let csv = "Kutipan,Sentimen\n";
    kutipan.filter(it => it.Kutipan.toLowerCase().includes(searchTerm.toLowerCase())).forEach(row => {
      csv += `"${row.Kutipan.replace(/"/g, '""')}","${row.Label_Sentimen}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'Sentify_Export.csv'; a.click();
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[var(--background)]">
      <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
      <div className="font-black text-2xl tracking-tighter text-indigo-600 animate-pulse italic">SENTIFY...</div>
    </div>
  )

  return (
    <Router>
      <Layout isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode}>
        <Routes>
          <Route path="/" element={<DashboardPage ringkasan={ringkasan} dataTren={dataTren} isDarkMode={isDarkMode} />} />
          <Route path="/data" element={<DataPage dataTerfilter={kutipan.filter(it => it.Kutipan.toLowerCase().includes(searchTerm.toLowerCase()))} searchTerm={searchTerm} setSearchTerm={setSearchTerm} handleExportCSV={handleExportCSV} />} />
          <Route path="/lab" element={<LabPage inputText={inputText} setInputText={setInputText} isAnalyzing={isAnalyzing} handleAnalisis={handleAnalisis} hasilSimulasi={hasilSimulasi} skorKepercayaan={skorKepercayaan} handleReset={() => { setInputText(''); setHasilSimulasi(null); }} />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;