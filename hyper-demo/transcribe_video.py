import whisper
import json
import sys

def transcribe(video_path):
    print(f"Cargando modelo y transcribiendo {video_path}...")
    model = whisper.load_model("base") # "base" es rápido y preciso para español
    result = model.transcribe(video_path, language="es", word_timestamps=True)
    
    # Extraemos solo lo que necesitamos: palabras con sus tiempos
    words_data = []
    for segment in result['segments']:
        for word in segment['words']:
            words_data.append({
                "word": word['word'].strip(),
                "start": word['start'],
                "end": word['end']
            })
            
    with open("transcript.json", "w", encoding="utf-8") as f:
        json.dump(words_data, f, ensure_ascii=False, indent=2)
    
    print("Transcripción completada. Guardada en transcript.json")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python transcribe_video.py <video_path>")
    else:
        transcribe(sys.argv[1])
