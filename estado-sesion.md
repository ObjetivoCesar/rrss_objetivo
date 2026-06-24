# 📓 Estado de Sesión — RRSS_OBJETIVO

## Sesión Actual
- **Fecha:** 2026-06-22
- **Iniciada por:** César
- **Tema:** Producción completa Semana 1 — Guiones + Copys de los 7 días

## Progreso del día
- [x] Integrar directrices de marca personal, filtro Alejandra y regla de precio por contexto en `Jarvis/ESTRATEGIA-MARCA-PERSONAL-30DIAS.md` (v3.1).
- [x] Diseñar guiones de Sábado y Domingo (Carril Dual: Serie + Captación).
- [x] Diseñar guion completo **Lunes — Video Cero** ("Construyéndome desde cero", Episodio 1).
- [x] Diseñar guion completo **Martes — Caso de Estudio Titanos Gym Loja** (hook estructura @josefoley.co, trigger `TITANOS`).
- [x] Diseñar guion completo **Miércoles — Testimonio Comentado Yessy** (dolor de identidad, trigger `YESSY`).
- [x] Diseñar guion completo **Jueves — Reacción / Mito alcance orgánico** (trigger `ALCANCE`).
- [x] Diseñar secuencia completa **Viernes — CTA Consultivo Alejandra** (5 historias, trigger `DIAGNÓSTICO`).
- [x] Tabla de activaciones ManyChat Semana 1 (4 triggers con primer mensaje de bot definido).
- [x] Tabla de estado de producción — 7 días auditados y listos para grabar.
- [x] Corregir error 404 del planificador en producción (/api/brand-planner) y error de hidratación #418.
- [x] Migrar el almacenamiento del Spreadsheet (Brand Planner) desde CSV a Supabase para evitar fallos de lectura (`fs.readFileSync`) en Vercel.

## Archivos tocados
- `Jarvis/ESTRATEGIA-MARCA-PERSONAL-30DIAS.md` — [MODIFICADO] v3.1 con carril dual y precio por contexto.
- `Jarvis/SEMANA-01-MARCA-PERSONAL.md` — [MODIFICADO] **COMPLETO** — 7 días con guiones, copys, historias y triggers ManyChat.
- `Jarvis/MAPA.md` — [MODIFICADO] Mapa maestro de posicionamiento unificado.
- `.agents/skills/Sistema de Ingeniería de Contenido/video-script-engine/SKILL.md` — [MODIFICADO] Reglas de ganchos inyectadas.
- `apps/rrss-objetivo/next.config.ts` — [MODIFICADO] Tracing de assets para bundler en Vercel.
- `apps/rrss-objetivo/src/app/api/brand-planner/route.ts` — [MODIFICADO] Rutas de datos dinámicas.
- `apps/rrss-objetivo/src/components/brand/BrandSpreadsheet.tsx` — [MODIFICADO] Guarda de montaje para evitar error de hidratación.
- `estado-sesion.md` — [MODIFICADO] Registro de la sesión actualizado.

## Pendientes para la próxima sesión
- [ ] **ACCIÓN INMEDIATA:** Confirmar si Yessy tiene video/audio de 10-15s para usar en el reel del Miércoles (de lo contrario el guion funciona con voz de César + texto).
- [ ] **ACCIÓN INMEDIATA:** Conseguir screenshot de Titanos Gym en primera posición de Google para el Martes.
- [ ] Configurar los 4 triggers ManyChat (`TITANOS`, `YESSY`, `ALCANCE`, `DIAGNÓSTICO`) con los primeros mensajes definidos en la tabla.
- [ ] Enviar propuesta a Ing. Carlos Rafael Reyes por WhatsApp.

---

## Sesión Anterior (2026-06-20)
- **Fecha:** 2026-06-20
- **Iniciada por:** César
- **Tema:** Restauración de Make.com y Auditoría de Posicionamiento de Marca Personal

## Progreso del día
- [x] Restaurar publicación mediante webhook de Make.com en `scheduler.ts` (eliminando API directa de Meta e implementando payload V2 intacto).
- [x] Ejecutar commit de restauración técnica: `feat: restore Make.com as primary publisher in scheduler`.
- [x] Auditar y confrontar la planificación `SEMANA-01-ACTIVAQR.md` contra el ADN y las lecciones de Myron Golden.

## Archivos tocados
- `apps/rrss-objetivo/src/lib/scheduler.ts` — [MODIFICADO] Restauración de webhook de Make.com.
- `apps/rrss-objetivo/src/lib/pipeline/executor.ts` — [MODIFICADO]
- `apps/rrss-objetivo/src/app/pipeline/page.tsx` — [MODIFICADO]
- `estado-sesion.md` — [MODIFICADO] Actualización de la sesión.

---

## Sesión Anterior (2026-06-19)
- **Fecha:** 2026-06-19
- **Iniciada por:** César
- **Tema:** Propuesta Ing. Carlos Rafael Reyes — CRM ($850 / $1,400)

## Progreso del día
- [x] Crear propuesta para Ing. Carlos Rafael Reyes — CRM ($850 Plan Básico / $1,400 Plan Completo con Redes).
- [x] Opción 1: CRM Básico ($850) — 1 mes — Leads WhatsApp, Agenda, Redirección mensajería, API + BD propia.
- [x] Opción 2: CRM Completo + Módulo Redes ($1,400) — 3 meses — Todo lo anterior + Planificador, Facebook, Instagram, WhatsApp, web. APIs de terceros incluido.
- [x] Garantía 6 meses para ambas opciones.


## Progreso del día
- [x] Cotización Caretas (Paola Gaevor) — Propuesta Completa (Fase 0 a 3: Presencia + Gestión de Alquileres + Inventario + Caja) — Creada y publicada con éxito.

## Archivos tocados
- `apps/rrss-objetivo/scripts/publish-temp.js` — [CREADO y ELIMINADO] Script de publicación temporal.


## Sesión Anterior (2026-06-08)
- **Fecha:** 2026-06-08
- **Iniciada por:** César
- **Tema:** Crear propuestas comerciales para 5 prospectos nuevos

## Progreso del día
- [x] Cotización Doris Segarra — "Caricias" (ropa interior) — $2,550+ + $90/mes
- [x] Cotización Omar — "Palacio del brazier" (administrador) — $200 catálogo / $1,000 ecommerce
- [x] Cotización Daniel Vivanco — "Central market" (bodega) — $200 catálogo
- [x] Cotización Nancy Torres — "Galtor" (bodega grande) — $1,385 + $40/mes
- [x] Cotización Vicente Flores — "Comercios Only" (trajes, calzado, mochilas) — $200 catálogo / $1,000 ecommerce
- [ ] Revisar todas las cotizaciones online con César

## Archivos en juego
- `docs/propuestas_activaqr/propuestas_2026_06_08/` — carpeta de propuestas de hoy

## Productos a ofrecer por cliente
| Cliente | Negocio | Productos a ofrecer |
|---|---|---|
| Doris Segarra | Caricias (ropa interior) | Ecommerce + Posicionamiento + Automatización WhatsApp + Software personalizado |
| Omar | Palacio del brazier (admin) | Catálogo $200 (opción 1) / Ecommerce $1000-40pág (opción 2) |
| Daniel Vivanco | Central market (bodega) | Catálogo $200 |
| Nancy Torres | Galtor (bodega grande) | Contacto digital + Ecommerce + Automatización WhatsApp |
| Vicente Flores | Comercios Only (trajes, etc.) | Catálogo $200 (opción 1) / Ecommerce $1000-40pág (opción 2) |

## Progreso del día
- [x] Extraer la esencia del Plan Catálogo de $200 del ADN local.
- [x] Diseñar e integrar la Matriz RECON Ads con 16 variantes psicológicas y de negocio para la transición de 5 a 7 segundos (operación a corazón abierto).
- [x] Actualizar `docs/arquifachadas-retouches.md` con la matriz de ganchos y variaciones estructuradas.
- [x] Analizar y seleccionar el titular para la portada del video de testeo (Fórmula Arquifachadas).
- [x] Registrar los 3 copies/textos definitivos renderizados para la campaña de testeo 1.
- [x] Lanzar la campaña de testeo CBO de $9/día en Meta Ads con las 3 variantes de video.

## Archivos tocados
- `docs/arquifachadas-retouches.md` — [MODIFICADO] Integrada matriz RECON Ads e ingresados los 3 copies definitivos
- `docs/MUSIC-BRIEF-campana-testeo-1.md` — [NUEVO] Brief y prompts de música instrumental con BPM para IA
- `estado-sesion.md` — [MODIFICADO] Actualizado estado con campaña en circulación

## Pendientes para la próxima sesión
- [ ] Programar/Refinar el flujo de ManyChat unificado para la palabra clave (ActivaQR) que entrega el portafolio/demo y califica al prospecto.
- [ ] Monitorear el rendimiento de la campaña CBO tras 4-7 días (Hook Rate, ThruPlay %, CTR, Costo por Comentario).

---

## Sesión Anterior (2026-06-05)
- **Fecha:** 2026-06-05
- **Iniciada por:** César
- **Tema:** Jarvis — Auditoría de Sitemap y Arquitectura de Ejecución

## Progreso del día
- [x] Ejecutar protocolo de arranque de Jarvis leyendo `estado-sesion.md` y `Jarvis/MAPA.md`.
- [x] Rastrear y auditar el sitemap real de `cesarreyesjaramillo.com` en vivo.
- [x] Cruzar y verificar que los 3 artículos de Conciencia (Art-001, Art-002, Art-003) ya están publicados en la web.
- [x] Validar el interlinking estratégico: los artículos de conciencia sirven de embudo indirecto para ActivaQR.
- [x] Acordar el "Camino C" para Jarvis: Generará y guardará sus herramientas dinámicas en su propio entorno privado sin alterar las sub-skills globales del sistema.
- [x] Extraer 12 posts de LinkedIn a partir de los artículos 1, 2, 3 y la micro-serie "El problema no era la app".

## Archivos tocados
- `Jarvis/SKILL.md` — [NUEVO] Cerebro completo de Jarvis
- `Jarvis/MAPA.md` — [NUEVO] Índice vivo del ecosistema
- `Jarvis/REGISTRO/micro-series.md` — [NUEVO]
- `Jarvis/REGISTRO/reels.md` — [NUEVO]
- `Jarvis/REGISTRO/posts.md` — [NUEVO]
- `Jarvis/REGISTRO/articulos.md` — [NUEVO]
- `Jarvis/_archivo/` — [NUEVO] 9 docs de ideación archivados
- `.agents/skills/Sistema de Ingeniería de Contenido/jarvis/SKILL.md` — [NUEVO] Punto de entrada
- `.agents/skills/skill-madre/SKILL.md` — [MODIFICADO] Jarvis registrado en inventario
- `estrategia-posicionamiento/03-posts-linkedin.md` — [NUEVO] 12 posts de LinkedIn para los artículos 1, 2, 3 y micro-serie

## Pendientes para la próxima sesión
- [ ] **Recordatorio:** Manus.ai va a postear automáticamente por nosotros en LinkedIn.
- [ ] César abre notebooklm.google.com → yo me conecto y leo "Harness Engineering" → extraigo aprendizajes para Jarvis
- [ ] César provee métricas de Reels 1 y 2 del MICRO-SERIES → Jarvis llena `REGISTRO/micro-series.md`
- [ ] Integrar MICRO-SERIES en `planificacion-rrss/BLOG_ESTRATEGICO_2026.csv`
- [ ] Extraer posts de Art-001 → invocar `article-posicionamiento`

## 🚨 Lecciones del Agente
- [2026-06-04] La carpeta `adn/` NO existe en la raíz — el ADN real está en `apps/rrss-objetivo/adn/`
- [2026-06-04] MICRO-SERIES ya tiene 2 reels publicados pero NO está en ningún calendario
- `estrategia-posicionamiento/competencia-registry.md` — 27 perfiles, 4 espejos
- `planificacion-rrss/BLOG_ESTRATEGICO_2026.csv` — 24 artículos planificados
- `planificacion-rrss/Estrategia_Posicionamiento_Mes1.csv` — Plan mes 1 (3 semanas)
- `.agents/skills/skill-madre/SKILL.md` — Autoridad suprema
- `.agents/skills/Sistema de Ingeniería de Contenido/article-posicionamiento/` — Skill artículos

## Pendientes para la próxima sesión
- [ ] Decidir siguiente paso: ¿extraer posts de los 3 artículos o primero pulir artículos?
- [ ] Carpeta 01-plan-estrategico/ está vacía — requiere contenido
- [ ] Art-003 tiene gancho fuerte ("10% descuento por QR") → posible reel principal
- [ ] BLOG_ESTRATEGICO_2026.csv necesita actualizarse con los 3 artículos recibidos

## 🚨 Lecciones del Agente
- [2026-06-04] La carpeta `adn/` NO existe en la raíz — el ADN real está en `apps/rrss-objetivo/adn/`
- [2026-06-04] estrategia-posicionamiento/ tiene estructura clara: 01-plan-estrategico (vacío), 02-articulos (3 artículos), 02-articulos/INDICE.md (tracking)
- [2026-06-04] La estrategia de posicionamiento está íntimamente conectada con el BLOG_ESTRATEGICO_2026.csv — los artículos de posicionamiento alimentan el blog y los posts

---

## Sesión Anterior (2026-06-04)
- **Fecha:** 2026-06-03
- **Iniciada por:** César
- **Tema:** MICRO-SERIES v3.0 "El Problema No Era La App" — Guiones reescritos por César (Decisión #1, #2, #3)

## Progreso del día
- [x] Diseñar estructura de Micro-Series v3.0 (4 videos, estructura Error → Objetivo → Prioridades → Recorrido)
- [x] Reescribir Videos 2, 3, 4 con estructura de César (más clara, con herramienta concreta por video)
- [x] Documento maestro actualizado en `docs/MICRO-SERIES-el-problema-no-era-la-app.md`
- [x] Prompts visuales de stock footage (pendiente para producción)
- [x] Music Brief neuroacústico (pendiente para producción)
- [x] Generar y publicar propuesta comercial de CRM para Henrry Castillo (Aion Vital)
- [ ] Grabar Videos 1-4
- [ ] Programar en Metricool

## Archivos tocados
- `docs/MICRO-SERIES-el-problema-no-era-la-app.md` — [ACTUALIZADO v3] Guiones de César
- `docs/MUSIC-BRIEF-micro-series-app.md` — [NUEVO] 3 briefs neuroacústicos
- `apps/rrss-objetivo/scripts/publish-aion-vital.js` — [CREADO y ELIMINADO] Script temporal para publicar la cotización
- `estado-sesion.md` — [ACTUALIZADO]

## Pendientes para la próxima sesión
- [ ] César graba Video 1 (El Error) — orgánico en oficina
- [ ] César graba Videos 2, 3, 4 — orgánico en oficina
- [ ] Buscar stock footage para支撑 visual
- [ ] Generar audio en Suno/Udio con los prompts del Music Brief
- [ ] Programar los 4 videos en Metricool (1 por día, 4 días consecutivos)

## 🚨 Lecciones del Agente
- [2026-06-03] MICRO-SERIES v3.0: César reescribió los Videos 2-4 con estructura clara: Error → Objetivo (define acción principal) → Prioridades (define qué es indispensable) → Recorrido (define flujo antes de programar). Cada video entrega una herramienta concreta.
- [2026-06-03] La fórmula "Y si... haz..." NO se aplicó en esta versión porque César prefirió estructura más narrativa con ejemplos claros (WhatsApp, Uber).
- [2026-06-03] El Video 1 fue el único que se mantuvo原来的 de la versión anterior.

## Progreso del día
- [x] Diseñar estructura de Micro-Series (4 videos en secuencia con cliffhanger)
- [x] Crear documento maestro `docs/MICRO-SERIES-el-problema-no-era-la-app.md` (4 guiones completos)
- [x] Generar prompts visuales de stock footage para cada video
- [x] Generar Music Brief neuroacústico con 3 variantes (Tensión/Empatía/Autoridad)
- [ ] Producir videos (grabar César + editar con stock footage)
- [ ] Programar en Metricool (4 días consecutivos)

## Archivos tocados
- `docs/MICRO-SERIES-el-problema-no-era-la-app.md` — [NUEVO] Documento maestro con 4 guiones + prompts visuales
- `docs/MUSIC-BRIEF-micro-series-app.md` — [NUEVO] 3 briefs neuroacústicos para Suno/Udio

## Pendientes para la próxima sesión
- [ ] César graba Video 1 (El Caso) + Video 4 (La Pregunta) — orgánico en oficina
- [ ] Buscar/editar stock footage para Videos 2 y 3 (pantalla dividida + robot)
- [ ] Producir Video 3 (El Robot) — requiere visual más elaborado (robot con piezas mismatched)
- [ ] Generar audio en Suno/Udio con los prompts del Music Brief
- [ ] Programar los 4 videos en Metricool

## 🚨 Lecciones del Agente
- [2026-06-03] Nuevo formato: "Videos en Secuencia" — 30s con UNA lección + cliffhanger + CTA al final. Cada video entrega valor aunque no vean el siguiente (regla de conciencia).
- [2026-06-03] Music Brief Engine v2.0: Generar 3 variantes (tensión/empatía/cierre) para cubrir toda la serie. Siempre en inglés para Suno/Udio, sin vocals.

## Progreso del día
- [x] Instalar `demucs` (Meta AI) y `torchcodec` — dependencias para separación de pistas
- [x] Crear `scripts/strip_voice.py` — extrae audio ambiental de un video eliminando la voz sintética de Gemini Omni
- [x] Crear `scripts/enhance_voice.py` — mejora grabaciones de voz (3 presets: default, heavy_denoise, radio)
- [x] Crear `scripts/INSTRUCCIONES_AUDIO.md` — guía de uso en lenguaje simple para César
- [x] Validar `enhance_voice.py` con los 3 presets (default ✅, radio ✅, heavy_denoise ✅)
- [x] Validar `strip_voice.py` — separación con Demucs (htdemucs) completada exitosamente

## Archivos tocados
- `scripts/strip_voice.py` — [NUEVO] Script de separación de voz con Demucs (IA de Meta)
- `scripts/enhance_voice.py` — [NUEVO] Script de mejora de voz con cadenas FFmpeg
- `scripts/INSTRUCCIONES_AUDIO.md` — [NUEVO] Manual de uso en lenguaje simple

## Pendientes para la próxima sesión
- [x] Probar `strip_voice.py` con un video real de Gemini Omni (.mp4) para validar el mux final video+audio
- [ ] Probar `enhance_voice.py` con una grabación real de voz de César para escuchar la diferencia
- [ ] Renderizar Art-001 y Art-002 en Gemini Omni (Art-003 ya en proceso)
- [ ] Grabar voz para los 3 guiones (guía teleprompter lista en Art-001-guiones.md)
- [ ] Validar experimento Art-001 (Trial Reels) tras 72 horas

## 🚨 Lecciones del Agente
- [2026-06-01] Gemini Omni rechaza palabras de restricción como "atrapas" o "tono retador" — usar "logras llamar" y "tono emotivo/seguro"
- [2026-06-01] NO incluir bloques de overlay/subtítulos en archivos Omni — CapCut maneja todo el texto
- [2026-06-01] El slug en BD puede tener contenido cruzado si el webhook publica en orden incorrecto
- [2026-06-01] Gemini tiene rate limits severos cuando está saturado — hay que espaciar los reintentos
- [2026-06-02] `demucs` necesita `torchcodec` además de `torchaudio` para guardar archivos WAV en Python 3.13
- [2026-06-02] Los filtros de FFmpeg en Windows no incluyen `acompand` — usar `compand` en su lugar
- [2026-06-02] Los scripts Python en Windows deben evitar emojis en los `print()` si el terminal usa codificación CP1252
- [2026-06-02] Si un video de Gemini Omni contiene únicamente locución hablada sin música de fondo, Demucs asigna el 99% de la señal a `vocals.wav`, dejando `no_vocals.wav` en silencio digital. Actualizado el script para exportar por defecto ambas versiones (sin voz y solo voz) para evitar videos mudos.

## Historial de sesiones (rotación 4 días)
| Fecha | Tema principal |
|:---:|:---|
| 2026-05-31 | Investigación Instagram + Creación instagram-intel-engine + Análisis 29 competidores |
| 2026-06-01 | Análisis viral 15 outliers + Producción Omni Art-001/002/003 + Diagnóstico artículos web |
| 2026-06-02 | Pipeline de audio local: strip_voice.py (Demucs) + enhance_voice.py (FFmpeg) |