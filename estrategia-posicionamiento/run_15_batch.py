import time
import requests
import sys

# Forzar salida en UTF-8 para consola de Windows
sys.stdout.reconfigure(encoding='utf-8')

# Configuración
ENDPOINT = "http://localhost:3000/api/analyze"
DELAY_SECONDS = 15  # Retraso prudencial para evitar Rate Limits (429) en Groq Whisper

# Los 15 videos con mayor engagement de la competencia (excluyendo procesados)
TARGET_URLS = [
    # 🏆 Titto Gálvez (Negocios físicos, casos reales, directo al grano)
    "https://www.instagram.com/p/DYuZYmJOXVh",
    "https://www.instagram.com/p/DY255iqvYoY",
    "https://www.instagram.com/p/DYUkZd8OklC",
    "https://www.instagram.com/p/DVlsOJCjt_y",
    "https://www.instagram.com/p/DYsAg_8ujav",

    # 🏆 Daniel Alzate (Tono consultor, clases a dueños de negocios)
    "https://www.instagram.com/p/DVY-ftxgGTT",
    "https://www.instagram.com/p/DIU1xjPMWZU",
    "https://www.instagram.com/p/DP7mRH9jfop",
    "https://www.instagram.com/p/DVT_nGqmrR0",
    "https://www.instagram.com/p/DVeGN5-Eauv",

    # 🏆 José Foley (Atraer clientes, embudos, estrategias comerciales)
    "https://www.instagram.com/p/DOZAiguETwD",
    "https://www.instagram.com/p/DTvYSiGEf4N",
    "https://www.instagram.com/p/DSSqyLWj4Ga",
    "https://www.instagram.com/p/DMncFg1sLuL",
    "https://www.instagram.com/p/DToCl_ckcYQ"
]

print("🚀 INICIANDO EL PROCESAMIENTO POR LOTES DE LOS 15 OUTLIERS VIRALES")
print(f"🔗 Endpoint local: {ENDPOINT}")
print(f"⏳ Tiempo de espera entre descargas: {DELAY_SECONDS}s (Cuidado de Rate Limits)")
print("--------------------------------------------------------------------------------")

success_count = 0
failed_count = 0

for i, url in enumerate(TARGET_URLS, 1):
    print(f"\n[{i}/15] 🔄 Procesando URL: {url}")
    
    payload = {
        "url": url
        # Para hacer un análisis personalizado y dinámico en el futuro,
        # puedes añadir aquí: "customPrompt": "Instrucción específica que desees"
    }
    
    try:
        start_time = time.time()
        response = requests.post(ENDPOINT, json=payload, timeout=120)
        duration = time.time() - start_time
        
        if response.status_code == 200:
            data = response.json()
            success_count += 1
            print(f"✅ ¡Éxito! Procesado en {duration:.1f}s")
            print(f"   🆔 ID en Supabase: {data.get('id')}")
            print(f"   📝 Hook detectado: \"{data.get('analysis', {}).get('hook', 'N/A')}\"")
        elif response.status_code == 207:
            # Estado 207: El análisis fue exitoso en Gemini pero falló la inserción en base de datos
            data = response.json()
            success_count += 1
            print(f"⚠️ Éxito parcial: Análisis completado, pero falló el guardado en base de datos.")
            print(f"   ❌ Detalle de BD: {data.get('detail')}")
            print(f"   📝 Hook detectado: \"{data.get('analysis', {}).get('hook', 'N/A')}\"")
        else:
            failed_count += 1
            print(f"❌ Falló (Código {response.status_code})")
            try:
                print(f"   Error: {response.json().get('error')}")
                print(f"   Detalle: {response.json().get('detail')}")
            except Exception:
                print(f"   Respuesta: {response.text[:200]}")
                
    except requests.exceptions.Timeout:
        failed_count += 1
        print("❌ Error: Excedido el tiempo de espera de la petición (Timeout de 120s)")
    except Exception as e:
        failed_count += 1
        print(f"❌ Error inesperado: {str(e)}")
        
    if i < len(TARGET_URLS):
        print(f"😴 Esperando {DELAY_SECONDS} segundos antes de la siguiente petición...")
        time.sleep(DELAY_SECONDS)

print("\n================================================================================")
print("📊 RESUMEN FINAL DEL PROCESAMIENTO")
print(f"✅ Exitosos: {success_count}")
print(f"❌ Fallidos: {failed_count}")
print(f"Total procesados: {len(TARGET_URLS)}")
print("================================================================================")
