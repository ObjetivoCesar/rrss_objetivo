import re
import json

file_path = r"c:\Users\Cesar\Documents\GRUPO EMPRESARIAL REYES\PROYECTOS\RRSS_objetivo\.agent\ESTRATEGIA DE POSICIONAMIENTO.docx.md"

with open(file_path, "r", encoding="utf-8") as f:
    text = f.read()

# Extract the section that has the clean text. Starts at "SEMANA 1 — El dolor invisible" inside the clean text block
import re

start_idx = text.find("**SEMANA 1 — El dolor invisible**")
clean_text = text[start_idx:]

weeks = re.split(r'\*\*SEMANA \d+ [^\*]+\*\*', clean_text)
# weeks[0] is empty or whitespace
weeks = weeks[1:]

days_order = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

data = {day: [] for day in days_order}

for week_idx, week_content in enumerate(weeks):
    semana_str = f"Semana {week_idx + 1}"
    
    # Split by day
    # Pattern: **LUNES — Algo**
    day_blocks = re.split(r'\*\*([A-ZÁÉÍÓÚ]+) — (.*?)\*\*', week_content)
    # day_blocks[0] is preamble before first day
    
    if len(day_blocks) < 3:
        continue
        
    for i in range(1, len(day_blocks), 3):
        day_raw = day_blocks[i].upper()
        # Normalizar tildes para mapear
        day_normalized = day_raw.replace('MIERCOLES', 'Miércoles').replace('SABADO', 'Sábado').capitalize()
        if day_normalized not in days_order:
            if 'MIER' in day_raw: day_normalized = "Miércoles"
            elif 'SAB' in day_raw: day_normalized = "Sábado"
            else: day_normalized = day_raw.capitalize()
            
        objetivo = day_blocks[i+1].strip()
        content = day_blocks[i+2]
        
        # We need to extract:
        # *Primer Reporte:* ...
        # *ActivaQR:* ...
        # *Sinergia:* ...
        # *Acciones clave:* ...
        # --- (stories/reels are now inside --- markers or under specific tags)
        
        def extract_section(start_marker, next_markers):
            idx = content.find(start_marker)
            if idx == -1: return "-"
            idx += len(start_marker)
            
            end_idx = len(content)
            for marker in next_markers:
                m_idx = content.find(marker, idx)
                if m_idx != -1 and m_idx < end_idx:
                    end_idx = m_idx
            return content[idx:end_idx].strip()
            
        pr_post = extract_section("*Primer Reporte:*", ["*ActivaQR:*", "---", "*Sinergia:*"])
        aq_post = extract_section("*ActivaQR:*", ["*Sinergia:*", "---", "*Acciones clave:*"])
        sinergia = extract_section("*Sinergia:*", ["*Acciones clave:*", "---"])
        acciones = extract_section("*Acciones clave:*", ["---"])
        
        # Combinar Sinergia y Acciones Clave
        sinergia_total = sinergia
        if acciones != "-":
            sinergia_total += "\n\nAcciones clave: " + acciones
            
        # Parse Historias / Reels
        # Look for the --- blocks we added earlier
        audiovisual = ""
        audiovisual_blocks = re.findall(r'---\n(.*?)\n---', content, re.DOTALL)
        for b in audiovisual_blocks:
            audiovisual += b.strip() + "\n\n"
            
        if not audiovisual.strip():
            audiovisual = "-"
            
        data[day_normalized].append({
            "Semana": semana_str,
            "Objetivo del Día": objetivo,
            "Estrategia Primer Reporte (Post Mañana)": pr_post,
            "Estrategia Primer Reporte (Historia Noche)": "-", # Asumiremos las historias si quedaron dentro de los textos
            "Estrategia ActivaQR (Post Mañana)": aq_post,
            "Estrategia ActivaQR (Historia Noche)": "-",
            "Reel / Video César (Si Aplica)": audiovisual.strip(),
            "Sinergia y Acciones Clave": sinergia_total.strip()
        })

with open("parsed_output.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Parse complete")
