# 🧠 PROYECTO JARVIS — Agente de Conocimiento Posicionamiento
## Documento de Visión | RRSS_OBJETIVO
**Fecha:** 2026-06-04 | **Tipo:** Visión + Especificación Inicial

---

## 💡 LA IDEA CENTRAL

Crear un **agente de conocimiento vivo** (no un documento estático) que:
- Viva en `Jarvis/`
- Se active cada vez que algo de posicionamiento se mencione, toque o cruce
- Acumule aprendizaje con cada interacción
- Se convierta en la "memoria estratégica" del proyecto
- No compita con los archivos existentes — los **reconozca, indexe y reference**

---

## 🔥 POR QUÉ ESTO ES UN PROYECTO GRANDE

### El problema actual (síntomas)
- César tarda mucho en encontrar archivos
- Hay 4-5 documentos pretendiendo ser "el plan oficial"
- El MICRO-SERIES tiene peso real (reels publicados) pero nadie lo integró al calendario
- Los artículos de posicionamiento (Art-001, 002, 003) están "recibidos" pero sin extraer posts
- La competencia registry existe pero está aislada

### La raíz del problema
**El conocimiento NO está conectado.** Cada archivo vive en su silo sin relación con los demás. No hay un sistema que entienda el contexto y diga: *"Esto que estás buscando vive aquí, y se relaciona con esto otro."*

---

## 🎯 QUÉ HACEMOS CON JARVIS

### Visión: Un Agente que Sabe Dónde Está Todo

Jarvis NO es otro documento. Es un **sistema de conocimiento上下文** (contexto aware) que:

1. **Indexa** todos los archivos del proyecto relacionados con posicionamiento
2. **Reconoce** patrones entre archivos (ej. MICRO-SERIES → BLOG_ESTRATEGICO_2026.csv)
3. **Activa** cuando detecta intención de posicionamiento en el chat
4. **Responde** con información contextual + acciones sugeridas
5. **Aprende** de cada sesión — si algo no funcionó, lo registra

### Comportamiento Esperado

| Situación | Respuesta de Jarvis |
|---|---|
| César dice "quiero trabajar posicionamiento" | Carga el mapa completo: artículos pendientes, calendario, competencia, MICRO-SERIES |
| César pregunta "dónde está el plan de contenidos" | Le dice: "El calendario real está en `planificacion-rrss/BLOG_ESTRATEGICO_2026.csv`. El plan operativo en `Estrategia_Posicionamiento_Mes1.csv`" |
| César menciona "MICRO-SERIES" | Le dice: "El MICRO-SERIES ya tiene 2 días de reels publicados. Está en `docs/MICRO-SERIES-el-problema-no-era-la-app.md` y NO está integrado en el calendario — ¿lo agregamos?" |
| César pide "dame la estrategia" | Le entrega un resumen inteligente basado en todos los archivos + recomendaciones |

---

## 🏗️ ARQUITECTURA PROPUESTA (Fase 1)

```
Jarvis/
├── README.md                    → Este archivo (visión)
├── 01_INVENTARIO_CAOS.md       → Investigación del caos actual (este documento)
├── 02_MAPA_DE_CONOCIMIENTO.md → Índice vivo de archivos + relaciones
├── 03_REGLAS_DE_ACTIVACION.md  → Cuándo y cómo se activa Jarvis
├── 04 APRENDIZAJE/
│   └── sesiones/               → Logs de cada sesión de posicionamiento
├── 05 REFERENCIAS/
│   ├── posicion-2026.md        → Resumen ejecutivo de estrategia
│   ├── competencia-2026.md     → Resumen de competencia
│   └── contenido-2026.md       → Resumen de artículos + posts
└── agents/
    └── Jarvis-Agent/
        └── SKILL.md            → Skill que carga en cada conversación
```

### El Agente Jarvis (Skill)

```yaml
# SKILL JARVIS — Posicionamiento Intelligence
Activadores:
  - "posicionamiento"
  - "estrategia"
  - "contenido"
  - "artículo"
  - "reels"
  - "posts"
  - "competencia"
  - "MICRO-SERIES"
  - "micro series"
  - "blog"
  - "calendario"
  - "estrategia-posicionamiento"
  - "planificacion-rrss"

Comportamiento:
  1. Cargar 02_MAPA_DE_CONOCIMIENTO.md
  2. Identificar archivos relevantes según el tema
  3. Dar resumen contextual + archivos en juego
  4. Proponer siguiente paso
  5. Si hay tareas pendientes de sesiones anteriores, recordarlas

No竞争的 con:
  - skill-madre (autoridad máxima)
  - article-posicionamiento (flujo de artículos)
  - social-post-engine (posts)
  - video-pipeline-engine (videos)
```

---

## 🔄 FLUJO DE ACTIVACIÓN

```
César menciona posicionamiento (cualquier forma)
        ↓
¿Jarvis está activo en esta sesión?
        ↓ SI → Cargar contexto desde 02_MAPA_DE_CONOCIMIENTO.md
        ↓ NO → Invocar skill desde agents/Jarvis-Agent/SKILL.md
        ↓
Leer archivo relevante más reciente
        ↓
Reportar: estado + archivos + pendientes + siguiente paso sugerido
        ↓
Si César confirma acción → Delegar a skill especializado
(article-posicionamiento, social-post-engine, etc.)
```

---

## 🚧 FASES DE CONSTRUCCIÓN

### Fase 1: Documentar (Hoy)
- [x] Crear carpeta `Jarvis/`
- [x] Inventario del caos actual (`01_INVENTARIO_CAOS.md`)
- [x] Documento de visión (`02_IDEA_JARVIS.md`) ← ESTE
- [ ] Mapa de conocimiento (`02_MAPA_DE_CONOCIMIENTO.md`)
- [ ] Reglas de activación (`03_REGLAS_DE_ACTIVACION.md`)

### Fase 2: Skill Básico
- [ ] Crear `agents/Jarvis-Agent/SKILL.md`
- [ ] Skill que cargue el mapa y responda con contexto
- [ ] Integración con skill-madre como "Activador de Posicionamiento"

### Fase 3: Memoria Persistente
- [ ] Sistema de logging de sesiones (`04 APRENDIZAJE/sesiones/`)
- [ ] Jarvis recuerda qué se hizo la última vez
- [ ] Detecta cuando algo queda pendiente

### Fase 4: Inteligencia Contextual
- [ ] Jarvis entiende relaciones entre archivos
- [ ] Detecta gaps (ej. MICRO-SERIES publicado pero no integrado)
- [ ] Propone acciones correctivas automáticamente

---

## ⚡ RESULTADO ESPERADO

César dice: *"Vamos a trabajar posicionamiento"*

Jarvis responde:
> *"César, tenemos 3 artículos recibidos (Art-001, 002, 003) pendientes de extraer posts. El MICRO-SERIES ya tiene 2 reels publicados pero no está en el calendario. La estrategia de posicionamiento vive en `planificacion-rrss/BLOG_ESTRATEGICO_2026.csv` y la competencia está analizada en `estrategia-posicionamiento/competencia-registry.md`. ¿Qué quieres atacar?"*

En vez de:
> *"No sé qué archivo buscar, hay muchos y no sé cuál es el correcto."*

---

## 🎯 POR QUÉ ESTE PROYECTO ES GRANDE

1. **No es solo un documento** — es un sistema de conocimiento con memoria
2. **Requiere skill de IA** que reconozca patrones yactive contexto
3. **Tiene que aprender** — con cada sesión se vuelve más útil
4. **No compite con skill-madre** — lo potencia
5. **Resuelve el problema real** — no más buscar archivos durante 20 minutos

---

*Visión creada: 2026-06-04*
*Carpeta: `Jarvis/`*
*Próximo paso: Construir 02_MAPA_DE_CONOCIMIENTO.md*