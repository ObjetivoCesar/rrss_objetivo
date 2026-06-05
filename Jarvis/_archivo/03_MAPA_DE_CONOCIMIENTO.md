# 🗺️ MAPA DE CONOCIMIENTO — Jarvis
## Índice Vivo de Archivos y Relaciones | RRSS_OBJETIVO
**Fecha:** 2026-06-04 | **Estado:** Fase 1 — Construido desde investigación

---

## 📌 NOTA DE USO

Este documento es el **corazón de Jarvis**. Cuando Jarvis se activa, lee este archivo para saber:
1. Qué archivos existen sobre posicionamiento
2. Cómo se relacionan entre sí
3. Cuál es la fuente de verdad para cada cosa
4. Qué está pendiente

---

## 🔗 RELACIONES PRINCIPALES

```
BLOG_ESTRATEGICO_2026.csv (planificacion-rrss/)
        ↓ Alimenta
Estrategia_Posicionamiento_Mes1.csv (planificacion-rrss/)
        ↓ Ejecuta
CALENDARIO_POSTS_DIARIOS_2026.md (planificacion-rrss/)
        ↓ Registra
EXPEDIENTE_CONTENIDOS_2026.md (planificacion-rrss/)

estrategia-posicionamiento/02-articulos/
        ↓ Extrae posts → social-post-engine
        ↓ Extrae reels → video-script-engine
        ↓ Alimenta
BLOG_ESTRATEGICO_2026.csv

MICRO-SERIES (docs/)
        ↓ Ya publicado (reels activos)
        ↓ NO está en calendario ❗
        ↓ Relacionado con
BLOG_ESTRATEGICO_2026.csv (¿dónde entra?)
```

---

## 📁 JERARQUÍA DE ARCHIVOS POR FUNCIÓN

### 🏆 FUENTE DE VERDAD (Orden de precedencia)

| # | Archivo | Rol | Ubicación |
|---|---|---|---|
| 1 | `AGENTS.md` | Constitución del sistema | Raíz |
| 2 | `skill-madre/SKILL.md` | Autoridad máxima de marca | `.agents/skills/` |
| 3 | `BLOG_ESTRATEGICO_2026.csv` | Calendario de artículos (24) | `planificacion-rrss/` |
| 4 | `Estrategia_Posicionamiento_Mes1.csv` | Plan operativo mensual | `planificacion-rrss/` |
| 5 | `estado-sesion.md` | Contexto entre sesiones | Raíz |

### 📍 POSICIONAMIENTO (Archivos del ecosistema)

| Archivo | Qué es | Relación |
|---|---|---|
| `estrategia-posicionamiento/02-articulos/Art-001.md` | Artículo posicionamiento #1 | → Extrae posts |
| `estrategia-posicionamiento/02-articulos/Art-002.md` | Artículo posicionamiento #2 | → Extrae posts |
| `estrategia-posicionamiento/02-articulos/Art-003.md` | Artículo posicionamiento #3 | → Extrae posts + reel |
| `estrategia-posicionamiento/competencia-registry.md` | 27 perfiles analizados, 4 espejos | → Inspira contenido |
| `estrategia-posicionamiento/PENDIENTES.md` | 8 tareas pendientes | → Seguimiento |
| `estrategia-posicionamiento/INDICE.md` | Tracking de artículos | → Estado actual |

### 📍 ESTRATEGIA (Documentos de apoyo)

| Archivo | Qué es | Relación |
|---|---|---|
| `docs/estrategia-posicionamiento/matriz_maestra_donna_ai.md` | 15 URLs pilares + estructura | → Duplica info del CSV |
| `docs/estrategia-posicionamiento/AUDITORIA_ABOGADOS_DIABLO.md` | Auditoría SEO + CRO del plan | → Critica el BLOG_ESTRATEGICO |
| `docs/estrategia-posicionamiento/PLAN_MAESTRO_IMPLEMENTACION_2026.md` | Visión, avatar, arquitectura | → Estratégico pero isolado |
| `docs/estrategia-posicionamiento/PLAN_DISTRIBUCION_SOCIAL_2026.md` | Posts por cada artículo | → Duplica el CSV |
| `docs/estrategia-posicionamiento/ESTRATEGIA_STORIES_OPERATIVAS.md` | 5 loops de stories diarios | → Operativo |

### 📍 MICRO-SERIES (Producción activa ❗)

| Archivo | Qué es | Estado |
|---|---|---|
| `docs/MICRO-SERIES-el-problema-no-era-la-app.md` | 4 guiones de videos | ✅ 2 reels publicados |
| `docs/MUSIC-BRIEF-micro-series-app.md` | 3 briefs neuroacústicos | Pendiente producción |

**⚠️ ALERTA:** MICRO-SERIES tiene peso real (reels publicados) pero NO está en:
- `BLOG_ESTRATEGICO_2026.csv`
- `Estrategia_Posicionamiento_Mes1.csv`
- `EXPEDIENTE_CONTENIDOS_2026.md`

### 📍 ARTÍCULOS BLOG (Borradores generados por IA)

| Carpeta | Cantidad | Estado |
|---|---|---|
| `docs/borradores/` | 30 archivos | Art-001 a Art-030 (lote 1-3) |
| `docs/automatizacion/` | 1 archivo | supabase_pg_cron_setup.sql (técnico) |

---

## 📊 SUMARIO DE CONTENIDO

### Artículos de Posicionamiento (3 Recibidos)
| # | Título | Dolor | Posts pendientes | Reels pendientes |
|---|---|---|---|---|
| Art-001 | Local centro/arriendo | Arriendo caro + gente que pasa | 4 | 1-2 |
| Art-002 | Redes vs local físico | Tiempo en redes sin retorno | 4 | 1-2 |
| Art-003 | Marketing falló | Desconfianza + falta de plan | 4 | 1 (gancho: 10% QR) |

### Blog Estratégico (24 artículos planificados)
| Silo | Cantidad | Pilares |
|---|---|---|
| automatizacion-de-ventas | 10 | 4, 17, 21 |
| marketing-para-pymes | 7 | 2, 9 |
| posicionamiento-en-google | 4 | 3, 12 |

### MICRO-SERIES (4 videos)
| Video | Tema | Estado |
|---|---|---|
| 1 | El Error | ✅ Publicado |
| 2 | Decisión #1: Objetivo | ✅ Publicado |
| 3 | Decisión #2: Prioridades | ⏳ Por grabar |
| 4 | Decisión #3: Conexión | ⏳ Por grabar |

---

## 🕵️ COMPETENCIA (Resumen del Registry)

### 4 Espejos Principales
| Handle | Seguidores | Estrategia |
|---|---|---|
| @tittogalvez | 851K | Autoridad + casos reales |
| @danielalzate017 | 36.8K | Tono consultor/empresarial |
| @diegofherok | 133K | Le habla al empresario |
| @josefoley.co | 49.5K | Comercial para locales |

### Lección Gancho
@waltergeanfrancisco: 119 posts → 241K seguidores. **Gancho > Cantidad.**

---

## ⚠️ GAPS DETECTADOS

| Gap | Problema | Acción sugerida |
|---|---|---|
| MICRO-SERIES fuera del calendario | No está integrado en BLOG_ESTRATEGICO | Agregar como serie especial |
| Artículos sin extraer posts | Art-001, 002, 003 pendientes | Invocar `social-post-engine` |
| 01-plan-estrategico vacío | Nadie creó el plan de 90 días | Llenar con contenido real |
| Canibalización keywords | Arts 8, 14, 29 pelean en Google | Fusión de pilares |
| Lead magnets faltantes | Embudo incompleto | Diseñar herramientas gratuitas |

---

## 🔄 FLUJO DE TRABAJO SUGERIDO

```
1. Revisar MICRO-SERIES → Integrar en calendario
2. Extraer posts de Art-001, 002, 003 → social-post-engine
3. Llenar 01-plan-estrategico con los 3 artículos como base
4. Resolver canibalización (fusión de pilares)
5. Diseñar lead magnets para embudo
```

---

*Archivo creado: 2026-06-04*
*Próximo paso: Crear `03_REGLAS_DE_ACTIVACION.md` y el skill `agents/Jarvis-Agent/SKILL.md`*