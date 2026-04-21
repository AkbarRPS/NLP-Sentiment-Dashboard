import requests
from bs4 import BeautifulSoup
import pandas as pd

def main():
    
    url = 'http://quotes.toscrape.com/'
    print(f"Mencoba menghubungi {url}...")

    
    response = requests.get(url)

    
    if response.status_code == 200:
        print("Akses diterima! Mulai membongkar halaman...\n")
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        kumpulan_kotak = soup.find_all('div', class_='quote')
        
        data_hasil = []
        
        for kotak in kumpulan_kotak:
            
            teks_kutipan = kotak.find('span', class_='text').text
            nama_penulis = kotak.find('small', class_='author').text
            data_hasil.append([teks_kutipan, nama_penulis])
            print(f"Didapat: {nama_penulis} - {teks_kutipan[:30]}...")
            
        df = pd.DataFrame(data_hasil, columns=['Kutipan', 'Penulis'])
        
        nama_file = 'hasil_scraping_quotes.csv'
        df.to_csv(nama_file, index=False)
        print(f"\nSelesai! {len(df)} kutipan berhasil disimpan ke dalam '{nama_file}'.")
        
    else:
        print(f"Gagal masuk. Kode error: {response.status_code}")

if __name__ == "__main__":
    main()