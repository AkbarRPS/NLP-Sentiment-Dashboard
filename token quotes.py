import pandas as pd
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords

nltk.download('stopwords')
nltk.download('punkt')

nltk.download('punkt_tab')

print("\nMembaca file quotes_bersih.csv...\n")
df = pd.read_csv('quotes_bersih.csv')

kamus_stopwords = set(stopwords.words('english'))

def proses_tokenisasi(teks):
    if type(teks) !=str:
        return ""
    tokens = word_tokenize(teks)
    kata_penting = [kata for kata in tokens if kata not in kamus_stopwords]
    return ' '.join(kata_penting)

print("Sedang memecah kata dan menghapus stop wprds...")
df['Kutipan_Final'] = df['Kutipan_Bersih'].apply(proses_tokenisasi)

print("\nPerbandingan Teks (sebelumnya vs sesudah):")
for index, row in df.head(3).iterrows():
    print(f"Asli: {row['Kutipan_Bersih'][:70]}")
    print(f"Bersih: {row['Kutipan_Final'][:70]}...\n")

file_output = 'quotes_final.csv'
df.to_csv(file_output, index=False)
print(f"--- SELESAI ---")
print(f"Data bersih berhasil disimpan ke '{file_output}'")
