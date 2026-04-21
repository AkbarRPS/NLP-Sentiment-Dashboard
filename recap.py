import pandas as pd
import re
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.sentiment.vader import SentimentIntensityAnalyzer

print("Memulai Pengolahan Data")

nltk.download('punkt', quiet=True)
nltk.download('punkt_tab', quiet=True)
nltk.download('stopwords', quiet=True)
nltk.download('vader_lexicon', quiet=True)

nama_file_input = 'hasil_scraping_quotes.csv'
print(f"\n[1/4]Membaca data dari '{nama_file_input}'...")
df = pd.read_csv(nama_file_input)

print("[2/4] Melakukan pembersihan teks...")

if df.duplicated().sum() > 0:
    df = df.drop_duplicates()
if df.isnull().sum().sum() > 0:
    df = df.dropna()

def bersihkan_kutipan(teks):
    if type(teks) != str: return ""
    teks = re.sub(r'["""]', '', teks)
    teks = re.sub(r'[^a-zA-Z\s]', '', teks)
    return teks.lower().strip()

df['Kutipan_Bersih'] = df['Kutipan'].apply(bersihkan_kutipan)

print("[3/4] Memecah kata dan menghapus stop words")
kamus_stopwords = set(stopwords.words('english'))

def proses_tokenisasi(teks):
    tokens = word_tokenize(teks)
    kata_penting = [kata for kata in tokens if kata not in kamus_stopwords]
    return ' '.join(kata_penting)

df['Kutipan_Final'] = df['Kutipan_Bersih'].apply(proses_tokenisasi)

print("[4/4] Mengevaluasi sentimen menggunakan VADER...")
sia = SentimentIntensityAnalyzer()

def hitung_sentimen(teks):
    if type(teks) != str: return 'Netral'
    skor = sia.polarity_scores(teks)['compound']
    if skor >= 0.05: return 'Positif'
    elif skor <= -0.05: return 'Negatif'
    else: return 'Netral'

df['Label_Sentimen'] = df['Kutipan_Final'].apply(hitung_sentimen)

print("/n=== RINGKASAN HASIL ===")
print("Distribusi Sentimen:")
print(df['Label_Sentimen'].value_counts())

print("\nCuplikan 5 Data Teratas:")
print(df[['Kutipan_Final', 'Label_Sentimen']].head())

file_output = 'recap_quotes.csv'
df.to_csv(file_output, index=False)
print(f"--- SELESAI ---")
print(f"Data bersih berhasil disimpan ke '{file_output}'")

print("[5/5] Membuat visualisasi grafik...")

import matplotlib.pyplot as plt
import seaborn as sns

sns.set_theme(style="whitegrid")
plt.figure(figsize=(8, 5))

grafik = sns.countplot(
    data=df,
    x='Label_Sentimen',
    hue='Label_Sentimen',
    palette={'Positif': '#2ecc71', 'Negatif': '#e74c3c', 'Netral': '#95a5a6'},
    legend=False
)

plt.title('Distribusi Sentimen pada Kutipan Tokoh', fontsize=14, fontweight='bold')
plt.xlabel('Kategori Sentimen', fontsize=12)
plt.ylabel('Jumlah Kutipan', fontsize=12)

plt.show()