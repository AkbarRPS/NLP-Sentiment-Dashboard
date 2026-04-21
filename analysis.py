import pandas as pd
import re
import nltk
from nltk.tokenize import word_tokenize
from nltk.sentiment.vader import SentimentIntensityAnalyzer
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import accuracy_score, classification_report


nltk.download('vader_lexicon')
nltk.download('punkt')
nltk.download('punkt_tab') 

def main():

    file_path = 'FPL_tweets.csv' 
    try:
        df = pd.read_csv(file_path)
        print(f"Berhasil memuat {len(df)} baris data.")
    except FileNotFoundError:
        print("File tidak ditemukan. Pastikan file CSV berada di folder yang sama.")
        return

    nama_kolom_teks = 'Text'
    if nama_kolom_teks not in df.columns:
        print(f"Kolom '{nama_kolom_teks}' tidak ditemukan.")
        return

   
    def bersihkan_dan_tokenize(teks):
        if not isinstance(teks, str):
            return []
        
        
        teks = re.sub(r"http\S+|www\S+|https\S+", '', teks, flags=re.MULTILINE)
        teks = re.sub(r'\@\w+', '', teks)
        teks = re.sub(r'\#', '', teks)
        teks = re.sub(r'[^a-zA-Z\s]', '', teks)
        teks = teks.lower().strip()
        
       
        tokens = word_tokenize(teks)
        return tokens

    print("\nSedang melakukan pembersihan data dan tokenization...")
    
    df['tokens'] = df[nama_kolom_teks].apply(bersihkan_dan_tokenize)
    
   
    df['cleaned_text'] = df['tokens'].apply(lambda x: ' '.join(x))

    
    sia = SentimentIntensityAnalyzer()
    
    def berikan_label(teks):
        skor = sia.polarity_scores(teks)['compound']
        if skor >= 0.05:
            return 'Positif'
        elif skor <= -0.05:
            return 'Negatif'
        else:
            return 'Netral'
            
    print("Sedang membuat label sentimen awal sebagai target pelatihan...")
    df['sentiment_target'] = df['cleaned_text'].apply(berikan_label)

    
    print("\nMemulai proses Machine Learning...")
    
    
    X_train, X_test, y_train, y_test = train_test_split(
        df['cleaned_text'], 
        df['sentiment_target'], 
        test_size=0.2, 
        random_state=42
    )

    
    vectorizer = TfidfVectorizer(max_features=5000) 
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)

    
    model = MultinomialNB()
    
    print("Sedang melatih model Naive Bayes...")
    model.fit(X_train_vec, y_train)

    
    y_pred = model.predict(X_test_vec)

    
    akurasi = accuracy_score(y_test, y_pred)
    print(f"\n--- Hasil Evaluasi Model ---")
    print(f"Akurasi Model: {akurasi * 100:.2f}%\n")
    print("Laporan Klasifikasi Detail:")
    print(classification_report(y_test, y_pred))

    
    X_all_vec = vectorizer.transform(df['cleaned_text'])
    df['ml_predicted_sentiment'] = model.predict(X_all_vec)

    output_file = 'hasil_ml_sentimen.csv'
    df.to_csv(output_file, index=False)
    print(f"\nDataset dengan hasil prediksi Machine Learning telah disimpan ke '{output_file}'")

if __name__ == "__main__":
    main()