# 🎬 Bloques de Producción para Gemini Omni — Art-001 (Variante A Aprobada)
**Brand Target:** César Reyes Jaramillo  
**Video de Referencia (Voz/Cara/Gesticulación):** `cesar_talking_reference.mp4` (provisto por el usuario)  
**Imagen de Referencia (Apariencia/Avatar):** `cesar_avatar_reference.png` (provisto por el usuario)  
**Duración Total:** 30 segundos  
**Número de Clips:** 3  
**Frecuencia Recomendada:** 2 Sesiones de producción (Sesión 1: Clips 1 y 2 hoy; Sesión 2: Clip 3 mañana)

---

## ── CLIP 1 (0-8s) ──────────────────────
**Fondo IA:** Calle comercial del centro de Loja, Ecuador con movimiento real de peatones de fondo y tráfico moderado de vehículos en la calle. Iluminación diurna y cálida.

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
        "setting": "loja_street_movement_ia",
        "reference": "cesar_talking_reference.mp4"
      }
    }
  ],
  "overlay": {
    "type": "subtitle_banner",
    "position": "center_horizontal",
    "anchor": "lower_third",
    "text": "¿TENER LOCAL = TENER CLIENTES?",
    "visible_from": 0.0,
    "style": {
      "font_weight": "extrabold",
      "font_size": "large",
      "color_primary": "#FFFFFF",
      "highlight_word": "CLIENTES",
      "highlight_color": "#0047FF",
      "background": "none",
      "text_transform": "uppercase",
      "letter_spacing": "tight"
    }
  }
}
```

### 🗣️ Locución y Audio
- **Locución (César - Clon de Voz):** 
  "(0-4s - Voz en Off - Tono serio, de intriga): ¿Sabes qué es más caro que no tener local en el centro? Pagar el arriendo de uno... y que la gente solo pase de largo."
  "(4-8s - Voz Sincro - César caminando en la acera de Loja, tono directo): Hay gente frente a tu puerta todos los días. El problema no es la ubicación."
- **Audio/SFX:** 
  - (0-4s): Sonido ambiental de calle en movimiento (murmullo de peatones, motores suaves de fondo).
  - (4s): 🔊 Transición tipo beat seco de percusión con un corte limpio.

---

## ── CLIP 2 (8-17s) ──────────────────────
**Fondo IA:** Acera comercial del centro de Loja. César sigue caminando en plano medio mientras peatones desenfocados pasan de fondo mirando sus teléfonos móviles.

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
        "setting": "loja_street_movement_ia",
        "reference": "cesar_talking_reference.mp4"
      }
    }
  ],
  "overlay": {
    "type": "text_banner",
    "position": "center_horizontal",
    "anchor": "lower_third",
    "text": "EL PROBLEMA ES QUE NO TIENES NADA QUE LOS DETENGA",
    "visible_from": 0.0,
    "style": {
      "font_weight": "extrabold",
      "font_size": "medium",
      "color_primary": "#FFFFFF",
      "highlight_word": "NADA QUE LOS DETENGA",
      "highlight_color": "#0047FF",
      "background": "none",
      "text_transform": "uppercase",
      "letter_spacing": "tight"
    }
  }
}
```

### 🗣️ Locución y Audio
- **Locución (César - Clon de Voz):**
  "(8-17s - Voz Sincro - Mirada fija y gesticulación asertiva): El problema es que no tienes nada que los detenga. Miran el teléfono. Hasta que un letrero los hace alzar los ojos. El que dice 'No me mires'... ese los para en seco."
- **Audio/SFX:**
  - (10s): 🔊 Efecto "swoosh" sutil cuando aparece el banner en pantalla.
  - (14s): SFX leve de parada brusca al pronunciar "los para en seco".

---

## ── CLIP 3 (17-30s) ──────────────────────
**Fondo IA:** Acera del centro de Loja, César de pie en primer plano con un letrero digital con código QR visible a un costado.

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
        "setting": "loja_street_movement_ia",
        "reference": "cesar_talking_reference.mp4"
      }
    }
  ],
  "overlay": {
    "type": "subtitle_banner",
    "position": "center_horizontal",
    "anchor": "lower_third",
    "text": "NO APROVECHAR EL TRÁFICO = QUIEBRA",
    "visible_from": 0.0,
    "style": {
      "font_weight": "extrabold",
      "font_size": "large",
      "color_primary": "#FFFFFF",
      "highlight_word": "QUIEBRA",
      "highlight_color": "#0047FF",
      "background": "none",
      "text_transform": "uppercase",
      "letter_spacing": "tight"
    }
  }
}
```

### 🗣️ Locución y Audio
- **Locución (César - Clon de Voz):**
  "(17-25s - Voz Sincro - Tono retador): Si tú no tienes un sistema que los detenga... pronto lo tendrá el local de al lado."
  "(25-28s - Voz Sincro - Gesto empático): Hoy alguien pasó frente a tu puerta y no supo qué vendes."
  "(28-30s - Voz Sincro - CTA directo): Cuéntame abajo ¿Cómo muestras tus productos afuera de tu local?"
- **Audio/SFX:**
  - (28-30s): 🔊 Beat musical ascendente que finaliza con un fade out limpio al terminar el video.
