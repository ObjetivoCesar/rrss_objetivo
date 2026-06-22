#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
enhance_voice.py
-------------------------------------------------------------------
Este script mejora grabaciones de voz hechas en casa para darles calidad
de estudio/podcast usando procesamiento digital de señal mediante FFmpeg.

Aplica reducción de ruido, filtro pasa-altos, compresión de rango dinámico,
ecualización quirúrgica para eliminar opacidad, y normalización de volumen.

Requisitos:
- FFmpeg (en el PATH del sistema)
-------------------------------------------------------------------
Uso:
  python scripts/enhance_voice.py --input "ruta/mi_voz.m4a" --preset "default"
"""

import os
import sys
import argparse
import subprocess
import shutil
from pathlib import Path

# Definimos los presets de filtros de audio de FFmpeg optimizados para voz humana
PRESETS = {
    # Preset por defecto: Limpieza de ruidos, compresión balanceada y EQ de claridad
    "default": (
        "highpass=f=80,"                           # Corta retumbes de baja frecuencia (viento, aire acondicionado)
        "afftdn=nf=-40,"                           # Reducción de ruido de fondo de precisión basada en FFT
        "compand=attacks=0:decays=0.3:"           # Compresor dinámico (le da pegada y empareja volumen alto/bajo)
        "points=-70/-70|-45/-20|-20/-10|-10/-5|0/-3:"
        "gain=2,"
        "equalizer=f=3000:width_type=h:width=1000:g=2.5," # Acento de claridad (presencia)
        "equalizer=f=250:width_type=h:width=100:g=-1.5,"  # Reduce caja/mud de cuarto cerrado
        "loudnorm=I=-16:TP=-1.5:LRA=11"            # Normalización estándar para redes sociales (Loudness R128)
    ),
    
    # Preset para entornos muy ruidosos o con eco
    "heavy_denoise": (
        "highpass=f=85,"
        "afftdn=nf=-30:noise_type=w,"              # Reducción de ruido más agresiva (perfil blanco/hiss)
        "agate=threshold=0.03:ratio=10:range=0.01," # Compuerta de ruido (silencia el fondo completamente cuando no habla)
        "compand=attacks=0:decays=0.4:"
        "points=-70/-70|-40/-18|-20/-10|0/-3:"
        "gain=1,"
        "equalizer=f=3200:width_type=h:width=1000:g=3,"
        "equalizer=f=240:width_type=h:width=100:g=-2.5,"
        "loudnorm=I=-16:TP=-1.5:LRA=10"
    ),
    
    # Preset para tono cálido y de locutor de radio (más graves y compresión alta)
    "radio": (
        "highpass=f=75,"
        "afftdn=nf=-42,"
        "compand=attacks=0.005:decays=0.25:"       # Compresión más rápida
        "points=-70/-70|-40/-15|-18/-8|0/-1.5:"
        "gain=3,"
        "equalizer=f=120:width_type=h:width=50:g=2.5,"    # Incrementa graves/calidez de la voz
        "equalizer=f=3000:width_type=h:width=1000:g=3,"   # Sube presencia/brillo
        "equalizer=f=250:width_type=h:width=120:g=-2,"    # Atenúa resonancias de caja
        "loudnorm=I=-14:TP=-1.0:LRA=8"             # Más fuerte y comprimido (estilo broadcast)
    ),
    
    # Preset para locutor de radio con EXTRA BRILLO (ideal si la voz suena opaca)
    "radio_brillo": (
        "highpass=f=75,"
        "afftdn=nf=-42,"
        "compand=attacks=0.005:decays=0.25:"
        "points=-70/-70|-40/-15|-18/-8|0/-1.5:"
        "gain=3,"
        "equalizer=f=120:width_type=h:width=50:g=2.0,"    # Graves controlados
        "equalizer=f=3500:width_type=h:width=1500:g=7.5," # PRESENCIA AL MÁXIMO (Brillo súper destacado)
        "equalizer=f=8000:width_type=h:width=2000:g=5.5," # Mucho más aire/sibilancia
        "equalizer=f=250:width_type=h:width=120:g=-2.5,"  # Reduce lo "encajonado"
        "loudnorm=I=-14:TP=-1.0:LRA=8"
    )
}

def check_dependencies():
    """Verifica que FFmpeg esté disponible."""
    if not shutil.which("ffmpeg"):
        print("[!] Error: FFmpeg no está instalado o no se encuentra en el PATH.")
        sys.exit(1)

def enhance_audio(input_path, output_path, preset_name):
    """Procesa el audio usando la cadena de filtros de FFmpeg del preset elegido."""
    print(f"[*] Procesando audio '{input_path.name}' con preset '{preset_name}'...")
    
    filter_chain = PRESETS[preset_name]
    
    command = [
        "ffmpeg", "-y",
        "-i", str(input_path),
        "-af", filter_chain, # Aplica la cadena de filtros de audio
        "-acodec", "pcm_s16le", # WAV 16-bit de alta fidelidad
        "-ar", "44100",
        "-ac", "1", # Exportamos a Mono para mejor mezcla de voz centralizada
        str(output_path)
    ]
    
    result = subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if result.returncode != 0:
        print("[!] Error al procesar la mejora de voz:")
        print(result.stderr.decode('utf-8', errors='ignore'))
        sys.exit(1)
        
    print(f"[SUCCESS] Voz mejorada y guardada con éxito en: {output_path}!")

def main():
    parser = argparse.ArgumentParser(description="Mejora grabaciones vocales locales usando FFmpeg.")
    parser.add_argument("--input", "-i", required=True, help="Archivo de audio de entrada (.wav, .m4a, .mp3, etc.).")
    parser.add_argument("--output", "-o", help="Archivo de salida procesado (.wav). Si se omite, se guarda al lado de la entrada con el sufijo '_enhanced'.")
    parser.add_argument("--preset", "-p", default="default", choices=list(PRESETS.keys()), 
                        help="Preset de mejora acústica a aplicar (por defecto: default).")
    args = parser.parse_args()
    
    check_dependencies()
    
    input_path = Path(args.input)
    if not input_path.exists():
        print(f"[!] Error: El archivo '{input_path}' no existe.")
        sys.exit(1)
        
    if args.output:
        output_path = Path(args.output)
    else:
        output_path = input_path.parent / (input_path.stem + f"_enhanced_{args.preset}.wav")
        
    enhance_audio(input_path, output_path, args.preset)

if __name__ == "__main__":
    main()
