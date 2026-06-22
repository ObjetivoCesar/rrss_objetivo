import csv, sys

sys.stdout.reconfigure(encoding='utf-8')
files = [
    ('Titto Galvez', r'c:/Users/Cesar/Documents/GRUPO EMPRESARIAL REYES/PROYECTOS/RRSS_objetivo/estrategia-posicionamiento/data.csv'),
    ('Daniel Alzate', r'c:/Users/Cesar/Documents/GRUPO EMPRESARIAL REYES/PROYECTOS/RRSS_objetivo/estrategia-posicionamiento/data-danielalzate017.csv'),
    ('Jose Foley', r'c:/Users/Cesar/Documents/GRUPO EMPRESARIAL REYES/PROYECTOS/RRSS_objetivo/estrategia-posicionamiento/data-josefoley.co.csv'),
]

ALREADY_DONE = {'https://www.instagram.com/p/DYxAJseu3XS'}

for name, path in files:
    rows = []
    with open(path, encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                url = row['url'].strip()
                if url in ALREADY_DONE or row.get('type') != 'clips':
                    continue
                likes = int(row.get('likes', 0) or 0)
                comments = int(row.get('comments', 0) or 0)
                views = int(row.get('views', 0) or 0)
                score = likes + (comments * 3)
                rows.append({'url': url, 'score': score, 'views': views})
            except Exception as e:
                pass
    top5 = sorted(rows, key=lambda x: x['score'], reverse=True)[:5]
    print(f'\n🏆 TOP 5 - {name}')
    for i, r in enumerate(top5, 1):
        print(f'{i}. {r["url"]} (Vistas: {r["views"]:,})')
