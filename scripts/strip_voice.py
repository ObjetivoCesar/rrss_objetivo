#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
strip_voice.py
-------------------------------------------------------------------
Este script extrae el sonido ambiental e instrumental de un archivo
de video o audio, eliminando por completo la voz (vocales) utilizando
la librería de IA Demucs de Meta.

Requisitos:
- Python 3.x
- FFmpeg (en el PATH del sistema)
- demucs (instalado vía pip)
-------------------------------------------------------------------
Uso:
  python scripts/strip_voice.py --input "ruta/al/video.mp4"
"""

import os
import sys
import argparse
import subprocess
import shutil
from pathlib import Path

def check_dependencies():
    """Verifica que FFmpeg y demucs estén disponibles."""
    if not shutil.which("ffmpeg"):
        print("[!] Error: FFmpeg no está instalado o no se encuentra en el PATH.")
        sys.exit(1)
        
    try:
        import demucs
    except ImportError:
        print("[!] Error: La librería 'demucs' no está instalada en Python.")
        print("Por favor, ejecuta: pip install demucs")
        sys.exit(1)

def extract_audio(video_path, temp_audio_path):
    """Extrae el audio de un video en formato WAV de alta calidad."""
    print(f"[*] Extrayendo audio de {video_path}...")
    command = [
        "ffmpeg", "-y",
        "-i", str(video_path),
        "-vn", # Sin video
        "-acodec", "pcm_s16le", # WAV lineal 16-bit
        "-ar", "44100", # 44.1 kHz
        "-ac", "2", # Stereo
        str(temp_audio_path)
    ]
    
    result = subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if result.returncode != 0:
        print("[!] Error al extraer el audio del video:")
        print(result.stderr.decode('utf-8', errors='ignore'))
        sys.exit(1)
    print("[SUCCESS] Audio extraído con éxito.")

def run_demucs(audio_path, output_dir):
    """Ejecuta Demucs para separar la voz del fondo."""
    print("[*] Ejecutando separación por Inteligencia Artificial (Demucs)...")
    print("Nota: Esto puede tardar entre 10 y 45 segundos dependiendo de la duración.")
    
    # Demucs crea una carpeta de salida estructurada
    command = [
        "demucs",
        "--two-stems", "vocals", # Solo separa en: vocals y no_vocals (ambient/instrumental)
        "-o", str(output_dir),
        str(audio_path)
    ]
    
    result = subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if result.returncode != 0:
        print("[!] Error al separar las pistas con Demucs:")
        print(result.stderr.decode('utf-8', errors='ignore'))
        sys.exit(1)
    print("[SUCCESS] Separación completada.")

def find_separated_files(output_dir, input_filename_stem):
    """Busca los archivos resultantes de Demucs."""
    # Demucs por defecto usa el modelo htdemucs
    # La estructura de salida es: output_dir/htdemucs/input_filename_stem/vocals.wav y no_vocals.wav
    model_name = "htdemucs"
    track_dir = Path(output_dir) / model_name / input_filename_stem
    
    vocals_file = track_dir / "vocals.wav"
    no_vocals_file = track_dir / "no_vocals.wav"
    
    if not no_vocals_file.exists():
        # Si falló por estructura alternativa, buscar recursivamente
        print("[*] Estructura esperada no encontrada, buscando archivos alternativos...")
        found_wavs = list(Path(output_dir).rglob("*.wav"))
        for wav in found_wavs:
            if wav.name == "no_vocals.wav":
                no_vocals_file = wav
            elif wav.name == "vocals.wav":
                vocals_file = wav
                
    return vocals_file, no_vocals_file

def mux_audio_video(video_path, no_vocals_audio_path, output_video_path):
    """Re-mezcla el video original con el nuevo audio sin voz."""
    print(f"[*] Creando nuevo video con el audio ambiental sin voz...")
    command = [
        "ffmpeg", "-y",
        "-i", str(video_path),
        "-i", str(no_vocals_audio_path),
        "-map", "0:v:0", # Toma el video del archivo original
        "-map", "1:a:0", # Toma el audio procesado
        "-c:v", "copy",  # Copia el video sin re-codificar (calidad 100% intacta, super rápido)
        "-c:a", "aac",   # Codifica el nuevo audio a AAC
        "-b:a", "192k",  # Calidad del audio de salida
        "-shortest",
        str(output_video_path)
    ]
    
    result = subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if result.returncode != 0:
        print("[!] Error al re-mezclar video y audio:")
        print(result.stderr.decode('utf-8', errors='ignore'))
        sys.exit(1)
    print(f"[SUCCESS] Video final guardado con éxito en: {output_video_path}")

def main():
    parser = argparse.ArgumentParser(description="Extrae el audio ambiental (sin voz) de videos de Gemini Omni.")
    parser.add_argument("--input", "-i", required=True, help="Ruta al archivo de video (.mp4) o audio (.wav, .mp3) de entrada.")
    parser.add_argument("--output", "-o", help="Ruta para guardar el archivo de salida procesado. Si no se provee, se creará uno con sufijo '_no_vocals'.")
    args = parser.parse_args()
    
    check_dependencies()
    
    input_path = Path(args.input)
    if not input_path.exists():
        print(f"[!] Error: El archivo de entrada '{input_path}' no existe.")
        sys.exit(1)
        
    # Crear carpeta temporal en la raíz del espacio de trabajo
    workspace_tmp = Path("tmp") / "audio_strip"
    workspace_tmp.mkdir(parents=True, exist_ok=True)
    
    # Si el nombre del archivo tiene caracteres no-ASCII, hacer una copia interna con nombre seguro
    _cleanup_safe_copy = None
    try:
        input_path.name.encode('ascii')
    except UnicodeEncodeError:
        safe_name = workspace_tmp / ("safe_input" + input_path.suffix)
        shutil.copy(input_path, safe_name)
        _cleanup_safe_copy = safe_name
        input_path = safe_name
        print(f"[*] Nombre de archivo con caracteres especiales detectado. Usando copia temporal segura.")
    
    # Determinar si el archivo de entrada es video o audio
    is_video = input_path.suffix.lower() in [".mp4", ".mov", ".avi", ".mkv"]
    
    # Preparar rutas
    temp_audio_path = workspace_tmp / "temp_input.wav"
    output_separation_dir = workspace_tmp / "demucs_out"
    
    if is_video:
        extract_audio(input_path, temp_audio_path)
        audio_to_process = temp_audio_path
    else:
        audio_to_process = input_path
        
    # Ejecutar Demucs
    run_demucs(audio_to_process, output_separation_dir)
    
    # Buscar archivos separados
    stem_name = temp_audio_path.stem if is_video else input_path.stem
    vocals_file, no_vocals_file = find_separated_files(output_separation_dir, stem_name)
    
    if not no_vocals_file.exists():
        print("[!] Error: No se pudo encontrar el archivo de audio separado 'no_vocals.wav'.")
        sys.exit(1)
        
    # Definir nombre de salida por defecto si no se especificó
    if args.output:
        output_path = Path(args.output)
    else:
        suffix = "_no_vocals" + input_path.suffix
        output_path = input_path.parent / (input_path.stem + suffix)
        
    # Si la entrada era video, creamos ambos resultados
    if is_video:
        # Generar versión SIN VOZ (Fondo/Instrumental)
        output_sin_voz = output_path.parent / (output_path.stem + "_sin_voz.mp4")
        wav_sin_voz = output_path.parent / (output_path.stem + "_sin_voz.wav")
        mux_audio_video(input_path, no_vocals_file, output_sin_voz)
        shutil.copy(no_vocals_file, wav_sin_voz)
        
        # Generar versión SOLO VOZ (Voz aislada)
        output_solo_voz = output_path.parent / (output_path.stem + "_solo_voz.mp4")
        wav_solo_voz = output_path.parent / (output_path.stem + "_solo_voz.wav")
        mux_audio_video(input_path, vocals_file, output_solo_voz)
        shutil.copy(vocals_file, wav_solo_voz)
        
        print(f"[SUCCESS] Archivos generados:")
        print(f"  - Solo Fondo: {output_sin_voz} y {wav_sin_voz}")
        print(f"  - Solo Voz:   {output_solo_voz} y {wav_solo_voz}")
    else:
        # Si la entrada era audio, copiamos ambos WAVs
        wav_sin_voz = output_path.parent / (output_path.stem + "_sin_voz.wav")
        wav_solo_voz = output_path.parent / (output_path.stem + "_solo_voz.wav")
        shutil.copy(no_vocals_file, wav_sin_voz)
        shutil.copy(vocals_file, wav_solo_voz)
        print(f"[SUCCESS] Archivos de audio generados:")
        print(f"  - Solo Fondo: {wav_sin_voz}")
        print(f"  - Solo Voz:   {wav_solo_voz}")
        
    # Limpieza de archivos temporales
    try:
        shutil.rmtree(workspace_tmp)
    except Exception as e:
        pass

if __name__ == "__main__":
    main()
