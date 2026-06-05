# 🧠 PROYECTO JARVIS — El Cerebro Estratégico de Posicionamiento
## Documento de Visión v2 | RRSS_OBJETIVO
**Fecha:** 2026-06-04 | **Tipo:** Visión + Especificación de Sistema Multi-Agente

---

## 💡 LA IDEA CENTRAL

Jarvis NO es un documento. NO es una skill. Es un **CEREBRO ESTRATÉGICO** especializado en posicionar a César Reyes Jaramillo en Ecuador.

**Lo que NO hace Jarvis:**
- ❌ No edita videos
- ❌ No publica posts
- ❌ No maneja dinero
- ❌ No ejecuta código
- ❌ No diseña imágenes

**Lo que SÍ hace Jarvis:**
- ✅ Piensa la estrategia
- ✅ Evalúa métricas (alcance, engagement, conversiones)
- ✅ Registra cada pieza de contenido y su rendimiento
- ✅ Genera agentes especializados por misión
- ✅ Conecta cada post/reel con el plan general
- ✅ Dice qué está funcionando y qué no

---

## 🔥 POR QUÉ ESTO ES EL PROYECTO MÁS GRANDE

### El problema actual
César tiene:
- 24 artículos planificados en BLOG_ESTRATEGICO_2026.csv
- 3 artículos de posicionamiento recibidos sin extraer posts
- MICRO-SERIES con 2 reels publicados fuera del calendario
- 27 perfiles de competencia analizados
- 8 tareas pendientes en PENDIENTES.md

**Nadie está evaluando:** ¿qué está funcionando? ¿qué no? ¿por qué? ¿qué ajustamos?

### La raíz del problema
**Falta un cerebro que piense, no que ejecute.** El contenido se produce pero no se evalúa estratégicamente. No hay feedback loop.

### La visión
Jarvis es el **sistema nervioso de la marca personal de César.** Cada pieza de contenido que se publica se monitorea y evalúa. Cada decisión estratégica pasa por Jarvis. Cada agente que se genera tiene una misión específica y reporta a Jarvis.

---

## 🏗️ ARQUITECTURA: EL SISTEMA DE AGENTES

```
                    ┌─────────────────────────────────────┐
                    │         🧠 JARVIS (El Cerebro)       │
                    │   Especializado en Estrategia         │
                    │   No ejecuta, solo piensa y evalúa   │
                    └──────────────┬──────────────────────┘
                                   │
           ┌───────────────────────┼───────────────────────┐
           │                       │                       │
    ┌──────▼──────┐        ┌───────▼───────┐       ┌──────▼──────┐
    │  Estrategia  │        │    Métricas    │       │   Memoria   │
    │   Agent      │        │    Agent       │       │   Agent     │
    │  (Planear)   │        │  (Medir)       │       │  (Recordar) │
    └─────────────┘        └───────────────┘       └─────────────┘
           │                       │                       │
           └───────────────────────┼───────────────────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              │                     │                    │
     ┌────────▼────────┐   ┌────────▼────────┐   ┌──────▼──────┐
     │  Post Agent     │   │   Reel Agent    │   │ Article Ag │
     │  (Defiende su   │   │  (Defiende su   │   │ (Defiende  │
     │   posición)     │   │   posición)     │   │  su pos.)  │
     └─────────────────┘   └─────────────────┘   └────────────┘
```

### принцип работы Agents

**Cada agente es efímero** — nace, ejecuta su misión, reporta a Jarvis, y muere. No hay agentes vivos permanentes. Cada sesión genera los agentes necesarios.

**Cada agente DEFINE su posición** — antes de actuar, el agente sabe:
1. ¿Qué estoy defendiendo? (objetivo del post/reel)
2. ¿Contra qué compito? (基准 de engagement)
3. ¿Qué métricas importan? (alcance, saves, comentarios, shares)
4. ¿Qué pasó la última vez que se hizo algo similar? (memoria de Jarvis)

---

## 🎯 FUNCIONES DE JARVIS

### 1. 🧠 Memoria Estratégica
Jarvis guarda TODO:
- Cada post publicado (con fecha, tema, métricas)
- Cada reel publicado (con fecha, tema, métricas)
- Cada artículo del BLOG_ESTRATEGICO_2026.csv
- Cada interacción en comentarios (si se registra)
- El rendimiento por tipo de contenido
- El rendimiento por tema (posicionamiento vs automatizacion vs B2B)

### 2. 📊 Evaluador de Métricas
Después de cada sesión, Jarvis pregunta:
- "¿Tienes las métricas de este post/reel?"
- "¿Qué comentaron?"
- "¿Cuánto alcance tuvo?"

Y actualiza el registro. Con el tiempo, Jarvis sabe qué tipo de contenido funciona mejor para qué objetivo.

### 3. 🔮 Generador de Agents
Cuando César dice "vamos a trabajar posicionamiento":
1. Jarvis carga el contexto completo
2. Identifica qué necesita hacerse
3. Genera UN AGENTE especializado para esa misión
4. El agente nace con las instrucciones de Jarvis (ADN de César)
5. El agente ejecuta y reporta
6. Jarvis evalúa el resultado

### 4. 📅 Integrador de Calendario
Jarvis sabe:
- Qué hay en BLOG_ESTRATEGICO_2026.csv
- Qué hay en MICRO-SERIES (2 reels publicados, 2 pendientes)
- Qué está publicado vs qué está pendiente
- Qué huecos hay en el calendario

---

## 📁 ESTRUCTURA DE JARVIS

```
Jarvis/
├── README.md                         → Este archivo
├── ADN/
│   ├── 01_SKILL_MADRE.md            → Copia del ADN de César (autoridad)
│   ├── 02_BRIEF_MARCA.md            → Personalidad, tono, frase bandera
│   ├── 03_AVATAR_B.md               → El cliente objetivo (comprador de local)
│   └── 04_GANCHOS_CONFIRMADOS.md    → Ganchos que ya funcionaron
├── MAPA/
│   ├── 01_INVENTARIO_CAOS.md        → (ya creado)
│   ├── 02_MAPA_ARCHIVOS.md          → Quién es quién en el proyecto
│   └── 03_RELACIONES.md             → Cómo se conectan los archivos
├── REGLAS/
│   ├── 01_ACTIVACION.md             → (ya creado)
│   ├── 02_PROMPT_BASE_AGENTS.md     → Prompt base para generar agents
│   └── 03_METRICAS.md               → Qué medir y cómo
├── REGISTRO/
│   ├── 01_REGISTRO_POSTS.md         → Cada post con métricas
│   ├── 02_REGISTRO_REELS.md         → Cada reel con métricas
│   ├── 03_REGISTRO_ARTICULOS.md     → Estado de cada artículo
│   └── 04_REGISTRO_MICRO_SERIES.md  → Estado de MICRO-SERIES
├── SESIONES/
│   └── YYYY-MM-DD.md                → Una sesión = un archivo de contexto
└── AGENTS/                          → Skills de agents generados
    ├── estrategia-agent/
    ├── metricas-agent/
    ├── contenido-agent/
    └── optimizacion-agent/
```

---

## 🔄 FLUJO DE TRABAJO

### Ejemplo: César quiere trabajar posicionamiento

```
1. César: "Vamos a trabajar posicionamiento"

2. Jarvis se activa (detecta keyword)
   → Carga 01_SKILL_MADRE.md (ADN)
   → Carga 02_MAPA_ARCHIVOS.md (sabe dónde está todo)
   → Revisa REGISTRO para saber qué se hizo

3. Jarvis reporta:
   "César, tienes:
   - 3 artículos de posicionamiento recibidos (Art-001, 002, 003)
   - MICRO-SERIES con 2 reels publicados fuera del calendario
   - 12 posts potenciales pendientes de extraer
   - Análisis de 27 perfiles de competencia en competencia-registry.md
   
   El MICRO-SERIES es prioritario porque ya tiene peso. ¿Lo integramos primero?"

4. César confirma: "Sí, integra el MICRO-SERIES en el calendario"

5. Jarvis genera el agent:
   → "MICRO-Series Integration Agent"
   → Objetivos: agregar Videos 3 y 4 al BLOG_ESTRATEGICO_2026.csv
   → Defiende: la serie debe estar en el calendario para programarse en Metricool

6. El agent ejecuta → reporte → Jarvis evalúa

7. Jarvis pregunta métricas:
   "¿Tienes las métricas de los 2 reels del MICRO-SERIES? (alcance, comentarios, saves)"

8. César provee → Jarvis actualiza 04_REGISTRO_MICRO_SERIES.md

9. Próxima sesión: Jarvis sabe que MICRO-SERIES tiene 2/4 reels publicados
```

---

## 📊 MÉTRICAS QUE JARVIS MONITEA

### Por Post
- Alcance (impresiones)
- Engagement (likes, comentarios, shares)
- Saves (guardados)
- Comentarios (tipo de conversación)
- CTR (si hay link)

### Por Reel
- Vistas (plays)
- Alcance
- Engagement rate
- Saves
- Comentarios (contenido)
- Shares

### Por Artículo
- Visitas orgánicas (Search Console)
- Tiempo en página
- CTR en Google
- Artículos que enlazan a él (backlinks internos)

### Por Serie (MICRO-SERIES)
- Retención entre videos (¿la gente ve el siguiente?)
- Engagement decreciente o creciente
- Mejor video de la serie
- Peor video de la serie

---

## ⚡ REGLAS DE ORO

1. **Jarvis NO ejecuta** — solo piensa, evalúa y genera agents
2. **Agents nacen y mueren** — cada misión es un agent nuevo
3. **Todo se registra** — si no se registra, no existe para Jarvis
4. **Métricas antes que opinión** — "creo que funcionó" no basta, necesitas números
5. **El ADN de César es la autoridad** — cualquier agent debe conocer la skill-madre
6. **Integración antes que producción** — no generar más contenido sin integrar el existente

---

## 🚧 FASES

### Fase 1: Base (Hoy ✅)
- [x] Crear carpeta Jarvis
- [x] Inventario del caos
- [x] Visión del sistema
- [x] Mapa de archivos
- [x] Reglas de activación

### Fase 2: ADN (Esta sesión)
- [ ] Copiar skill-madre en ADN/
- [ ] Crear BRIEF_MARCA.md
- [ ] Crear AVATAR_B.md
- [ ] Crear GANCHOS_CONFIRMADOS.md

### Fase 3: Registros
- [ ] Crear REGISTRO/ vacío
- [ ] Estructura para cada tipo de contenido

### Fase 4: Agentes
- [ ] Crear prompt base para agents
- [ ] Primer agent: "MICRO-Series Integration Agent"
- [ ] Validar con datos reales

---

## 🎯 RESULTADO ESPERADO

En 3 meses, Jarvis sabe:
- Qué topics generan más engagement (por tipo de contenido)
- Cuál es el mejor día/hora para publicar (según métricas)
- Qué ganchos funcionan para el Avatar B (dueño de local)
- Cuál es el alcance promedio de un reel vs un post
- Cuál es la tasa de conversión de contenido → leads
- Qué artículos del BLOG están sirviendo vs cuáles no

Y cuando César dice "vamos a trabajar posicionamiento", Jarvis no solo dice qué hay — dice qué hemos aprendido y qué debemos ajustar.

---

*Visión v2: 2026-06-04*
*Autor: Agente de Investigación + César Reyes*
*Actualizado el concepto de "documento" a "sistema multi-agente"*
*Jarvis es el cerebro, los agents son las manos (pero solo para ejecutar, no para pensar)*