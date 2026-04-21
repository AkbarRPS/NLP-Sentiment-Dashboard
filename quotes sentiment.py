import pandas as pd
import nltk
from nltk.sentiment.vader import SentimentIntensityAnalyzer 

nltk.download('vader_lexicon')

print("Membaca file quotes_bersih.csv...")
df = pd.read_csv('quotes_bersih.csv')

sia = SentimentIntensityAnalyzer()

def hitung_sentimen(teks):
    if type(teks) != str:
        return 'Netral'

    skor = sia.polarity_scores(teks)['compound']
    if skor >= 0.05:
        return 'Positif'
    elif skor <= -0.05:
        return 'Negatif'
    else:
        return 'Netral'

print("Sedang mengevaluasi emosi dari setiap kutipan...")
df['Label_Sentimen'] = df['Kutipan'].apply(hitung_sentimen)


print("\n--- Distribusi Sentimen ---")
print(df['Label_Sentimen'].value_counts())

print("\n--- Cuplikan Hasil Evaluasi ---")
for index, row in df.head(5).iterrows():
    print(f"Kutipan: {row['Kutipan'][:60]}")
    print(f"Sentimen: {row['Label_Sentimen']}\n")

file_output = 'quotes_sentimen.csv'
df.to_csv(file_output, index=False)
print(f"--- SELESAI ---")
print(f"Data bersih berhasil disimpan ke '{file_output}'")