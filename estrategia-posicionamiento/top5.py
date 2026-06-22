import csv

files = [
    ('Titto', r'c:/Users/Cesar/Documents/GRUPO EMPRESARIAL REYES/PROYECTOS/RRSS_objetivo/estrategia-posicionamiento/data.csv'),
    ('Daniel', r'c:/Users/Cesar/Documents/GRUPO EMPRESARIAL REYES/PROYECTOS/RRSS_objetivo/estrategia-posicionamiento/data-danielalzate017.csv'),
    ('Foley', r'c:/Users/Cesar/Documents/GRUPO EMPRESARIAL REYES/PROYECTOS/RRSS_objetivo/estrategia-posicionamiento/data-josefoley.co.csv'),
]

# Video de Titto ya analizado — excluir
ALREADY_DONE = {'https://www.instagram.com/p/DYxAJseu3XS'}

for name, path in files:
    rows = []
    with open(path, encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                url = row['url'].strip()
                if url in ALREADY_DONE:
                    continue
                likes = int(row.get('likes', 0) or 0)
                comments = int(row.get('comments', 0) or 0)
                views = int(row.get('views', 0) or 0)
                thumbnail = row.get('thumbnail', '')
                score = likes + (comments * 3)
                caption = row.get('caption', '')[:70].replace('\n', ' ')
                rows.append({
                    'url': url,
                    'likes': likes,
                    'comments': comments,
                    'views': views,
                    'score': score,
                    'caption': caption,
                    'thumbnail': thumbnail
                })
            except Exception as e:
                pass
    top5 = sorted(rows, key=lambda x: x['score'], reverse=True)[:5]
    print(f'\n=== {name} TOP 5 ===')
    for i, r in enumerate(top5, 1):
        print(f'{i}. URL: {r["url"]}')
        print(f'   Likes:{r["likes"]} | Comentarios:{r["comments"]} | Vistas:{r["views"]:,}')
        print(f'   Caption: {r["caption"]}')
        print(f'   Thumbnail: {r["thumbnail"][:80]}...')
        print()
