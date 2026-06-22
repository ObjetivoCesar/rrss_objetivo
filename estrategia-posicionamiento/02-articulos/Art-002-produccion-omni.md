# 🎬 Bloques de Producción para Gemini Omni — Art-002 (Redes vs Tráfico Físico)
**Brand Target:** César Reyes Jaramillo  
**Video de Referencia:** `cesar_talking_reference.mp4`  
**Imagen de Referencia:** `cesar_avatar_reference.png`  
**Duración Total:** 30 segundos  
**Formato Estrella:** Contradicción Clásica (Heredado de Art-001)

---

## ── CLIP 1 (0-8s) ──────────────────────
**Fondo IA:** Acera comercial del centro de Loja con peatones. La escena comienza con César caminando entre la gente, de pronto se detiene, mira hacia un local a su lado. Luego la cámara hace una transición al plano de visión de César (POV) mostrando un local comercial aburrido: paredes blancas, puerta de aluminio y vidrio translúcido, una vitrina simple, sin letreros ni identidad.

### 🎭 Composición y Dirección de Escena (JSON)
```json
{
  "layout": "pov_transition",
  "panels": [
    {
      "id": "panel_main",
      "position": "full",
      "aspect_ratio": "9:16",
      "sequence": [
        {
          "time": "0-5s",
          "content": {
            "type": "talking_head",
            "action": "walking_then_stops_and_looks_side",
            "setting": "loja_street_with_people",
            "reference": "cesar_talking_reference.mp4"
          }
        },
        {
          "time": "5-8s",
          "content": {
            "type": "b_roll_pov",
            "action": "static_view_of_empty_store",
            "setting": "boring_storefront_white_walls_no_signs"
          }
        }
      ]
    }
  ]
}
```

### 🗣️ Locución y Audio
- **Locución (César - Clon de Voz):** 
  "(0-5s - Voz en Off / Sincro - Tono serio, de intriga): ¿Sabes qué es más caro que pagar anuncios de Facebook? Pagar un local en el centro... y usarlo solo de vitrina."
  *(5-8s - Silencio vocal): (La cámara muestra el local vacío, reforzando visualmente el concepto de 'solo vitrina' sin decir más palabras).*
- **Audio/SFX:** 
  - (0-4s): Sonido ambiental de calle en movimiento (pasos, murmullos).
  - (5s): 🔊 Efecto de sonido de transición sutil (whoosh o cambio de foco) cuando cambia a la perspectiva POV.
  - (5-8s): Sonido ambiental puro, para dar un efecto de vacío o desolación al ver la vitrina sin letrero.

---

## ── CLIP 2 (8-17s) ──────────────────────
**Fondo IA:** Acera comercial del centro de Loja. César camina, se baja de la vereda para cruzar la calle y voltea a mirar para asegurarse de que no venga un carro, mientras sigue hablando a la cámara.

### 🎭 Composición y Dirección de Escena (JSON)
```json
{
  "layout": "talking_head_focused",
  "panels": [
    {
      "id": "panel_main",
      "position": "full",
      "aspect_ratio": "9:16",
      "content": {
        "type": "talking_head",
        "action": "steps_off_sidewalk_looks_for_cars",
        "setting": "loja_street_crossing",
        "reference": "cesar_talking_reference.mp4"
      }
    }
  ]
}
```

### 🗣️ Locución y Audio
- **Locución (César - Clon de Voz):**
  "(8-17s - Voz Sincro - Mirada fija y gesticulación mientras cruza): Tu vitrina hoy es invisible. A menos que pongas un letrero que diga 'Escanéame y te regalo el 10%'. Ese los frena y los convierte en contactos."
- **Audio/SFX:**
  - (8-17s): Sonido de tráfico un poco más cercano al bajar a la calle.
  - (14s): SFX leve de "frenazo" al pronunciar "Ese los frena".

---

## ── CLIP 3 (17-30s) ──────────────────────
**Fondo IA:** Acera del centro de Loja, César de pie en primer plano terminando de cruzar o ya del otro lado de la calle.

### 🎭 Composición y Dirección de Escena (JSON)
```json
{
  "layout": "talking_head_focused",
  "panels": [
    {
      "id": "panel_main",
      "position": "full",
      "aspect_ratio": "9:16",
      "content": {
        "type": "talking_head",
        "action": "standing_talking_directly",
        "setting": "loja_street_sidewalk",
        "reference": "cesar_talking_reference.mp4"
      }
    }
  ]
}
```

### 🗣️ Locución y Audio
- **Locución (César - Clon de Voz):**
  "(17-25s - Voz Sincro - Tono firme y seguro): Si tú no logras llamar la atención del que pasa por tu puerta... pronto lo hará el local de al lado."
  "(25-28s - Voz Sincro - Gesto empático): Hoy cientos de personas pasaron y ni supieron qué vendes."
  "(28-30s - Voz Sincro - CTA directo): Cuéntame abajo, ¿qué haces para llamar la atención en tu negocio?"
- **Audio/SFX:**
  - (28-30s): 🔊 Beat musical ascendente y fade out limpio.

