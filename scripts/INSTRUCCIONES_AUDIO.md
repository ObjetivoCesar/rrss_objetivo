# 🎙️ Guía de Uso — Procesamiento de Audio Local

Hemos instalado y configurado dos scripts locales para que puedas procesar tus audios directamente desde tu máquina, de forma 100% gratuita y privada.

---

## 1. Extractor de Sonido Ambiental sin Voz (`strip_voice.py`)
Este script toma un video generado con Gemini Omni (o un archivo de audio), elimina la voz sintética por completo usando Inteligencia Artificial, y te devuelve:
1. El video original con el audio ambiental/música reemplazado (sin voz).
2. El archivo de audio `.wav` suelto con el sonido ambiental de fondo, listo para que lo arrastres a CapCut u otro editor si prefieres mezclarlo a mano.

### ¿Cómo usarlo?
Solo debes indicarle la ruta de tu video de entrada:
```powershell
python scripts/strip_voice.py --input "ruta/a/tu/video.mp4"
```

*Ejemplo:* Si tu video está en la carpeta de descargas:
```powershell
python scripts/strip_voice.py --input "C:\Users\Cesar\Downloads\clip1.mp4"
```
El script creará automáticamente `clip1_no_vocals.mp4` y `clip1_no_vocals.wav` en esa misma carpeta.

---

## 2. Optimizador de Voz de Estudio (`enhance_voice.py`)
Este script toma tu grabación de voz grabada en tu cuarto y le aplica una cadena de filtros profesionales de audio (reducción de ruido de fondo, corte de frecuencias molestas, compresor dinámico de voz para volumen uniforme y normalización de volumen).

### ¿Cómo usarlo?
```powershell
python scripts/enhance_voice.py --input "ruta/a/tu/grabacion.m4a" --preset "default"
```

### Presets disponibles (Elige según tu necesidad):
1. **`default` (Recomendado)**: Balance perfecto de reducción de ruido, compresión (voz con más fuerza) y ecualización de claridad.
2. **`heavy_denoise`**: Para grabaciones con eco de cuarto, ruidos de fondo fuertes o siseos constantes. Aplica una compuerta de ruido agresiva.
3. **`radio`**: Da un tono cálido, profundo (realza graves) y con mucha compresión, ideal para estilo narrador de podcast.

*Ejemplo:*
```powershell
python scripts/enhance_voice.py --input "C:\Users\Cesar\Downloads\mi_voz.m4a" --preset "radio"
```
Esto guardará un archivo WAV de alta fidelidad mejorado al lado de tu grabación original.

---

## 💡 Recomendación Extra para tu Voz
Aunque nuestro script de mejora local es muy potente para limpiar ruidos y nivelar volumen, te recomendamos subir tu archivo de voz a la herramienta web gratuita:
👉 **[Adobe Podcast AI (Speech Enhance)](https://podcast.adobe.com/enhance)**

La IA de Adobe reconstruye la acústica de tu voz como si tuvieras un micrófono de estudio profesional y elimina todo el eco físico de tu habitación. Puedes usar Adobe Podcast para mejorar tu voz, y luego mezclar ese archivo resultante con el audio de fondo (`_no_vocals.wav`) que genera nuestro script. ¡La calidad final será espectacular!
