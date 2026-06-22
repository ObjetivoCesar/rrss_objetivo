"""
Retry de los 2 outliers finales que fallaron por Gemini saturado.
"""
import requests
import time

ENDPOINT = "http://localhost:3000/api/analyze"

FAILED_URLS = [
    "https://www.instagram.com/p/DYUkZd8OklC",  # 3/15 original
    "https://www.instagram.com/p/DSSqyLWj4Ga",  # 13/15 original
]

def main():
    total = len(FAILED_URLS)
    success = 0

    print(f"🚀 REINTENTO FINAL — {total} URLs")
    print("-" * 60)

    for i, url in enumerate(FAILED_URLS, 1):
        print(f"\n[{i}/{total}] 🔄 {url}")
        try:
            r = requests.post(ENDPOINT, json={"url": url}, timeout=180)
            if r.status_code == 200:
                data = r.json()
                print(f"✅ Éxito — ID: {data.get('id', 'N/A')}")
                if data.get('hook'):
                    print(f"   Hook: {data['hook']}")
                success += 1
            else:
                print(f"❌ {r.status_code}: {r.text[:150]}")
        except Exception as e:
            print(f"❌ Error: {str(e)[:100]}")
        
        if i < total:
            time.sleep(20)

    print(f"\n{'='*60}")
    print(f"📊 Resultado: {success}/{total} exitosos")
    print("=" * 60)

if __name__ == "__main__":
    main()