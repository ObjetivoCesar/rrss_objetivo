"""
Retry script para los 6 outliers que fallaron por 502 (Gemini saturado).
El post 11 (DOZAiguETwD) se excluye porque requiere login de Instagram.
"""
import requests
import time

ENDPOINT = "http://localhost:3000/api/analyze"

# URLs que fallaron por 502 (Gemini saturado)
FAILED_URLS = [
    "https://www.instagram.com/p/DYUkZd8OklC",  # 3/15
    "https://www.instagram.com/p/DVlsOJCjt_y",  # 4/15
    "https://www.instagram.com/p/DP7mRH9jfop",  # 8/15
    "https://www.instagram.com/p/DVT_nGqmrR0",  # 9/15
    "https://www.instagram.com/p/DTvYSiGEf4N",  # 12/15
    "https://www.instagram.com/p/DSSqyLWj4Ga",  # 13/15
]

def process_url(index, total, url):
    print(f"\n[{index}/{total}] 🔄 Procesando URL: {url}")
    try:
        response = requests.post(ENDPOINT, json={"url": url}, timeout=180)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ ¡Éxito! Procesado en {data.get('processing_time', 'N/A')}s")
            print(f"   🆔 ID en Supabase: {data.get('id', 'N/A')}")
            if data.get('hook'):
                print(f"   📝 Hook detectado: {data['hook']}")
            return True
        else:
            print(f"❌ Falló (Código {response.status_code})")
            print(f"   Error: {response.text[:200]}")
            return False
    except Exception as e:
        print(f"❌ Error inesperado: {str(e)[:200]}")
        return False

def main():
    total = len(FAILED_URLS)
    success = 0
    failed = 0

    print(f"🚀 REINTENTANDO {total} URLs FALLIDAS")
    print(f"🔗 Endpoint: {ENDPOINT}")
    print(f"⏳ Esperando 20s entre solicitudes (rate limit cuidado)")
    print("-" * 80)

    for i, url in enumerate(FAILED_URLS, 1):
        if process_url(i, total, url):
            success += 1
        else:
            failed += 1
        
        if i < total:
            print(f"😴 Esperando 20 segundos antes de la siguiente petición...")
            time.sleep(20)

    print("\n" + "=" * 80)
    print(f"📊 RESUMEN FINAL")
    print(f"✅ Exitosos: {success}")
    print(f"❌ Fallidos: {failed}")
    print(f"Total procesados: {total}")
    print("=" * 80)

if __name__ == "__main__":
    main()