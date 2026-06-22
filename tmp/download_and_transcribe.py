import os
import subprocess
import requests
from dotenv import load_dotenv

load_dotenv()

urls = [
    "https://www.facebook.com/reel/1889008865077690",
    "https://www.facebook.com/reel/1495744455394226",
    "https://www.facebook.com/reel/1286754039966952",
    "https://www.facebook.com/reel/1245081644371135",
    "https://www.facebook.com/reel/1674401950256761",
    "https://www.facebook.com/reel/3332690263576276",
    "https://www.facebook.com/reel/1318893643333694"
]

groq_key = os.environ.get("GROQ_API_KEY")

os.makedirs("tmp/reels", exist_ok=True)

for i, url in enumerate(urls):
    reel_id = url.split("/")[-1]
    audio_path = f"tmp/reels/{reel_id}.m4a"
    
    if not os.path.exists(audio_path):
        print(f"Downloading {url}...")
        try:
            subprocess.run(["yt-dlp", "-f", "bestaudio[ext=m4a]", "-o", audio_path, url], check=True, capture_output=True)
        except Exception as e:
            print(f"Failed to download {url}: {e}")
            continue
            
    if not os.path.exists(audio_path):
        print(f"Audio file not found for {url}")
        continue
        
    print(f"Transcribing {reel_id}...")
    with open(audio_path, "rb") as file:
        response = requests.post(
            "https://api.groq.com/openai/v1/audio/transcriptions",
            headers={"Authorization": f"Bearer {groq_key}"},
            files={"file": (f"{reel_id}.m4a", file, "audio/m4a")},
            data={"model": "whisper-large-v3-turbo", "language": "es"}
        )
        if response.status_code == 200:
            print(f"Transcription {i+1} ({reel_id}):\n{response.json().get('text')}\n")
        else:
            print(f"Error {i+1}: {response.text}\n")
