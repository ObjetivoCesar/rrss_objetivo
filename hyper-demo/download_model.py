import os
import requests
from tqdm import tqdm

def download_model(url, path):
    print(f"Descargando modelo desde: {url}")
    os.makedirs(os.path.dirname(path), exist_ok=True)
    
    response = requests.get(url, stream=True)
    total_size = int(response.headers.get('content-length', 0))
    
    with open(path, 'wb') as f, tqdm(
        desc=os.path.basename(path),
        total=total_size,
        unit='iB',
        unit_scale=True,
        unit_divisor=1024,
    ) as bar:
        for data in response.iter_content(chunk_size=1024):
            size = f.write(data)
            bar.update(size)

if __name__ == "__main__":
    model_path = os.path.expanduser("~/.u2net/u2net.pth")
    if os.path.exists(model_path):
        print(f"Eliminando archivo corrupto: {model_path}")
        os.remove(model_path)
    
    url = "https://huggingface.co/sczhou/u2net/resolve/main/u2net.pth"
    # Alternativa si falla: https://github.com/xuebinqin/U-2-Net/raw/master/saved_models/u2net/u2net.pth
    try:
        download_model(url, model_path)
        print("¡Modelo descargado con éxito!")
    except Exception as e:
        print(f"Error descargando: {e}")
