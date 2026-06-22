# OBJETIVO — Motor de Fondo (Hyper Video Engine)

Este pipeline permite eliminar el fondo de los videos grabados por César y reemplazarlos por fondos premium de manera automática.

## 🚀 Instalación Rápida

1. Asegúrate de tener **FFmpeg** instalado en el sistema.
2. Crea un entorno virtual e instala las dependencias:
   ```bash
   pip install -r requirements.txt
   ```

## 🎥 Uso

Para procesar un video y ponerle un fondo nuevo:

```bash
python pipeline_bg.py --input video_original.mp4 --bg fondo_oficina.jpg --output video_final.mp4
```

### Opciones avanzadas:
- `--alpha_only`: Genera un archivo `.mov` con transparencia para edición manual.
- `--model u2net_human_seg`: Usa un modelo especializado en personas (más lento pero preciso).

## 🛠️ Notas Técnicas
- El script restaura automáticamente el audio original.
- Si detecta una GPU NVIDIA, el proceso será hasta 10 veces más rápido.
- Resolución estándar: 1080x1920 (Vertical).
