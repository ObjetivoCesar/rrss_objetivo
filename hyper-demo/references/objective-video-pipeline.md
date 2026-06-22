---
name: objetivo-video-pipeline
description: Pipeline de producción de video premium para OBJETIVO. 
---

# OBJETIVO Video Pipeline v1.2 - RUTAS Y ESTÁNDAR

## 1. RUTAS OFICIALES (Windows)
- **Directorio de Brutos**: `C:\Users\Cesar\Videos\VIDEOS EN BRUTO`
- **Directorio de Salida**: `C:\Users\Cesar\Videos\VIDEOS EN BRUTO\Videos editados`

## 2. FLUJO DE TRABAJO
1.  **VALIDACIÓN CRUDA**: Subir video sin editar a TikTok para probar "Hook".
2.  **EDICIÓN PREMIUM**: Si el video tiene tracción, aplicar Pipeline:
    - Smart Cut (Corte de repeticiones y silencios).
    - Montserrat 900 (Black) - 110px - Sin borde.
    - Zonas Seguras: `bottom: 22%`, ancho `850px`.
    - Animación: Pop (0.08s).
    - Salida: `Videos editados\<nombre>-objetivo.mp4`.

## 3. PARÁMETROS TÉCNICOS
- Fuente: Montserrat 900.
- Color: Blanco + Dorado OBJETIVO (#FFD60A).
- Interlineado: 0.85.
- Render: npx hyperframes render.
