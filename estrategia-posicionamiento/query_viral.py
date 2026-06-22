"""
query_viral.py — Consulta los análisis virales de Supabase
Extrae: hook, hook_type, viral_formula, viral_dna, psychological_triggers
para encontrar el mejor match de "Valor Puro Sabor Controversia"
"""
import json
import sys
sys.stdout.reconfigure(encoding='utf-8')

import urllib.request
import urllib.error

SUPABASE_URL = "https://fcfsexddgupnvbvntgyz.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjZnNleGRkZ3VwbnZidm50Z3l6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTE1NzkwOSwiZXhwIjoyMDc2NzMzOTA5fQ.4ipX_DaVdz1qAKoLi1z5pb7p9UT5W7pDzgZOIs5NGuc"

# Campos que necesitamos
SELECT = "url,hook,hook_type,psychological_pattern,viral_formula,viral_dna,psychological_triggers,why_viral,replication_score,cesar_adaptations,hook_variations,narrative_structure,retention_mechanisms"

endpoint = f"{SUPABASE_URL}/rest/v1/viral_analyses?select={SELECT}&order=created_at.desc&limit=20"

req = urllib.request.Request(
    endpoint,
    headers={
        "apikey": SERVICE_KEY,
        "Authorization": f"Bearer {SERVICE_KEY}",
        "Content-Type": "application/json"
    }
)

try:
    with urllib.request.urlopen(req, timeout=15) as resp:
        data = json.loads(resp.read().decode())
except urllib.error.HTTPError as e:
    print(f"Error HTTP {e.code}: {e.read().decode()}")
    sys.exit(1)

print(f"\n{'='*70}")
print(f"TOTAL ANALIZADOS EN SUPABASE: {len(data)}")
print(f"{'='*70}\n")

# Buscar candidatos para "Valor Puro Sabor Controversia"
# Criterio: hook_type en [contradicción, shock, error_común] y dolor o curiosidad altos
candidates = []

for i, v in enumerate(data, 1):
    triggers = v.get('psychological_triggers') or {}
    dolor = triggers.get('dolor', 0)
    curiosidad = triggers.get('curiosidad', 0)
    miedo = triggers.get('miedo', 0)
    hook_type = v.get('hook_type', '')
    viral_dna = v.get('viral_dna') or {}
    share_trigger = viral_dna.get('share_trigger', '')
    comment_trigger = viral_dna.get('comment_trigger', '')
    
    # Score de controversia: dolor + curiosidad + tipos controversiales
    controversy_types = ['contradicción', 'error_común', 'shock', 'secreto']
    is_controversy = any(ct in hook_type.lower() for ct in controversy_types)
    controversy_score = dolor + curiosidad + miedo + (5 if is_controversy else 0)
    
    candidates.append({
        'index': i,
        'url': v.get('url', '')[-30:],  # solo el final para legibilidad
        'hook': v.get('hook', '')[:120],
        'hook_type': hook_type,
        'formula': v.get('viral_formula', '')[:100],
        'share_trigger': share_trigger[:80],
        'comment_trigger': comment_trigger[:80],
        'dolor': dolor,
        'curiosidad': curiosidad,
        'miedo': miedo,
        'replication_score': v.get('replication_score', 0),
        'controversy_score': controversy_score,
        'why_viral': v.get('why_viral', '')[:120],
        'retention': (v.get('retention_mechanisms') or [])[:2],
        'hook_variations': v.get('hook_variations') or {},
        'narrative': v.get('narrative_structure') or {},
        'cesar_adaptations': v.get('cesar_adaptations') or {}
    })

# Ordenar por controversy_score
candidates.sort(key=lambda x: x['controversy_score'], reverse=True)

print("🏆 TOP 5 CANDIDATOS — Valor Puro Sabor Controversia")
print("(Ordenados por score de controversia: dolor + curiosidad + tipo de hook)\n")

for rank, c in enumerate(candidates[:5], 1):
    print(f"{'─'*70}")
    print(f"#{rank} | Score Controversia: {c['controversy_score']} | Replicación: {c['replication_score']}/10")
    print(f"URL: ...{c['url']}")
    print(f"Hook Type: {c['hook_type']}")
    print(f"HOOK: \"{c['hook']}\"")
    print(f"FÓRMULA: {c['formula']}")
    print(f"Por qué viral: {c['why_viral']}")
    print(f"Share trigger: {c['share_trigger']}")
    print(f"Comment trigger: {c['comment_trigger']}")
    print(f"Triggers → Dolor:{c['dolor']} | Curiosidad:{c['curiosidad']} | Miedo:{c['miedo']}")
    if c['retention']:
        print(f"Retención: {c['retention']}")
    
    # Apertura narrativa
    narr = c['narrative']
    if narr.get('opening'):
        print(f"Opening (3s): {narr['opening'][:100]}")
    
    # Adaptación ActivaQR / César
    adaptations = c['cesar_adaptations']
    if adaptations.get('activaqr'):
        print(f"Adapt. ActivaQR: {str(adaptations['activaqr'])[:100]}")
    
    # Hook variations agresivas (las más útiles para controversia)
    hv = c['hook_variations']
    if hv.get('aggressive'):
        print(f"Hook agresivo: {hv['aggressive'][0][:100]}")
    
    print()

print(f"\n{'='*70}")
print("TODOS LOS REGISTROS (resumen rápido):")
print(f"{'='*70}")
for c in candidates:
    print(f"  [{c['hook_type']:20}] Dolor:{c['dolor']} | Score:{c['controversy_score']} | ...{c['url'][-25:]}")
