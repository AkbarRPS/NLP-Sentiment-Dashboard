from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd

app = FastAPI(title="Quotes Sentiment Dashboard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/quotes")
async def get_all_quotes():
    try:
        df = pd.read_csv('quotes_sentimen.csv')
        data_json = df.to_dict(orient="records")
        
        return {
            "status": "sukses", 
            "total_data": len(df),
            "data": data_json
        }
    except FileNotFoundError:
        return {"status": "gagal", "pesan": "File quotes_sentimen.csv tidak ditemukan!"}
    
@app.get("/api/summary")
async def get_sentiment_summary():
    try:
        df = pd.read_csv('recap_quotes.csv')
        
        ringkasan = df['Label_Sentimen'].value_counts().to_dict()

        return {
            "status": "sukses",
            "ringkasan": ringkasan
        }
    except FileNotFoundError:
        return {"status": "gagal", "pesan": "File quotes_sentimen.csv tidak ditemukan!"}
    
    @app.get("/")
    def home():
        return {"status": "API Dashboard Sentimen Aktif! Kunjungi /docs untuk melihat dokumentasi."}