# ADN del Proyecto: Automatizador de Redes Sociales

## 1. Visión General
Sistema de automatización de redes sociales diseñado para separar la lógica de negocio (el "cerebro") de la ejecución de publicaciones (el "músculo"). El sistema evolucionará hacia un **"Autopublicador Inteligente"**, donde la IA será capaz de generar calendarios de contenido, someterlos a aprobación humana (WhatsApp) e inyectarlos en el sistema para publicación automática. El objetivo es mantener el control total del contenido, el calendario y la IA en una plataforma propia, delegando la complejidad de las APIs de redes sociales a Make.com.

## 2. Decisiones Arquitectónicas (Enfoque Híbrido y Escalable)
- **Cerebro (Plataforma Propia):** Base de datos (Supabase), Interfaz de Usuario (Next.js) y lógica de agendamiento (Cron).
- **Músculo (Make.com - Estrategia de Un Solo Flujo):** Para optimizar costos y mantenimiento, utilizaremos **un único Webhook Maestro** en Make.com que recibirá toda la carga útil y la distribuirá mediante un Router a las diferentes plataformas.
  - **Plataformas Soportadas:** Facebook (Post/Reel), Instagram (Post/Reel/Carousel), **TikTok (Video)**, **YouTube (Shorts/Video)** y **LinkedIn (Post/Imagen/Video)**.
- **El Inteligencia Artificial (Agente Creativo):** Servicio de Backend que interactúa con DeepSeek/Gemini para proponer el calendario mensual basado en el "ADN de la Marca".
- **El Supervisor (Humano en el Medio):** Flujo de aprobación vía WhatsApp (Evolution API).
- **Inyección de Datos:** El Cerebro empuja URLs públicas de Supabase Storage. Make actúa como transportador puro.

## 3. Estructura de Datos Universal (JSON Payload)
Para soportar múltiples plataformas en un solo flujo, el JSON enviado a Make será:
```json
{
  "api_secret": "...",
  "post_id": "...",
  "text": "Caption principal",
  "media_url": "URL destacada",
  "media_urls": [
    {"url": "...", "type": "IMAGE|VIDEO", "title": "Opcional YT/LinkedIn"}
  ],
  "platforms": ["facebook", "instagram", "tiktok", "youtube", "linkedin"],
  "metadata": {
    "youtube_title": "Título Video",
    "linkedin_title": "Título Post",
    "tiktok_privacy": "public_everyone"
  }
}
```

## 4. Flujo Operativo (La Fábrica de Contenido)

### Flujo 1: Creación Automática Mensual
1. **Generación:** IA propone 12-20 posts variados según los pilares de marca.
2. **Aprobación:** Notificación vía WhatsApp a Cesar.
3. **Persistencia:** Guardado en `social_posts` con `status: draft_ai`.

### Flujo 2: Publicación a Máquina (The Muscle)
1. **Trigger:** `scheduler.ts` dispara el Webhook Maestro.
2. **Router en Make:** Filtra por plataforma y tipo de medio (Imagen vs Video).
3. **Ejecución:** Módulos nativos de cada red social en Make.
4. **Feedback:** Callbacks al servidor para marcar como `published` o `failed`.

## 5. Mitigaciones de Riesgos (Abogado del Diablo)
1. **Riesgo: Complejidad de APIs específicas (LinkedIn/TikTok).**
   * *Solución:* Usar Make.com como abstracción. Si una red requiere campos extra (ej. Títulos en YT), el Cerebro los enviará en un objeto `metadata` flexible.
2. **Riesgo: Agotamiento de cuota en Make.**
   * *Solución:* Filtros inteligentes. Make solo ejecuta los módulos de las redes marcadas en el array `platforms`.

## 6. Directrices de Evolución
- Este documento es la única fuente de verdad.
- Priorizar siempre la **Estrategia de Un Solo Flujo** en Make para evitar proliferación de webhooks y desorden.
- Mantener el código del `scheduler.ts` lo más genérico posible para absorber nuevas redes sin cambios estructurales.
