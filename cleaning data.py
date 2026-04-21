import pandas as pd
import re

def main():
    nama_file='hasil_scraaping_quotes.csv'
    print(f"Membaca data dari {nama_file}...\n")
    
    df = pd.read_csv(nama_file)

    print("--- 1. Eksplorasi Data Awal ---")
    print(f"Total baris dan kolom awal: {df.shape}\n")
    
    jumal_duplikat = df.dupilacated().sum()
    print(f"Jumlah baris duplikat yang ditemukan: {jumal_duplikat}")

    if jumlah_duplikat > 0:
        df = df.drop_duplicates()
        print(f"Duplikasi berhasil dihapus.")

    jumlah_kosong = df.isnull().sum().sum
    print(f"Jumlah data kosong: {jumlah_kosong}")

    if jumlah_kosong > 0:
        df = df.dropna()
        print(f"Baris dengan sel kosong berhasil dihapus. \n")

    print(f"Total baris setelah pengecekan: {df.shape[0]}\n")
                                          
    
    print("--- 2. Proses Pembersihan Teks ---")
    def bersihkan_kutipan(teks):
        if type(teks) !=str:
            return ""

    teks = re.sub(r'[“”"]', '', teks)
    teks = re.sub(r'[^a-zA-Z\s]', '', teks)
    return teks.lower().strip()

print("Sedang membersihkan kolom kutipan...")
df['Kutipan_Bersih'] = df['Kutipan'].apply(bersihkan_kutipan)

print("\nPerbandingan Teks (sebelumnya vs sesudah):")

for index, row in df.head(3).iterrows():
    print(f"Asli: {row['Kutipan'][:50]}")
    print(f"Bersih: {row['Kutipan_Bersih'][:50]}...\n")

file_output = 'quotes_bersih.csv'
df.to_csv(file_output, index=False)
print(f"--- SELESAI ---")
print(f"Data bersih berhasil disimpan ke '{file_output}'")

if __name__ == "__main__":
    main()
