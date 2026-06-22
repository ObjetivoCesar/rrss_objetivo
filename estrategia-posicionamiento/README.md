# 📁 Estrategia de Posicionamiento — ActivaQR

Carpeta raíz del proyecto de posicionamiento "Nivel Conciencia" (Awareness Level) para ActivaQR.

---

## Estructura

```
estrategia-posicionamiento/
├── 01-plan-estrategico/     → Plan director, pilares y estrategia 90 días
├── 02-articulos/             → Artículos drafts y finales (fuente para posts/reels)
├── 03-contenido-social/      → Posts, carruseles, reels extraídos de artículos
└── 04-recursos/              → Briefs, prompts, datos de investigación
```

---

## Guía de Uso

### Para Donna (Skill Madre)
Cuando César pida crear, editar o revisar un artículo de posicionamiento ActivaQR, el flujo es:

1. **Leer el plan estratégico** en `01-plan-estrategico/` para conocer el ángulo vigente.
2. **Consultar el ADN** en `apps/rrss-objetivo/adn/adn_activaqr` (fuente de verdad).
3. **Guardar artículos recibidos** en `02-articulos/` con el formato del framework.
4. **Extraer contenido social** (posts + reels) desde los artículos → `03-contenido-social/`.
5. **Mantener tracking** en el archivo `INDICE.md` dentro de `02-articulos/`.

### Formato de Artículos
Los artículos deben guardarse con frontmatter:
```yaml
---
title: "Título del artículo"
date: "YYYY-MM-DD"
category: "posicionamiento"
slug: "url-slug"
excerpt: "Resumen de 1-2 líneas"
image_url: "URL de imagen"
tags: ["tag1", "tag2"]
related_service: "activaqr"
author: "César Reyes"
published: false
---
```

### Sistema de Tracking
Cada artículo recibe un número secuencial (Art-001, Art-002...). Al guardarlo, actualizar `02-articulos/INDICE.md` con:
- Título
- Fecha de creación
- Estado (borrador → publicado)
- Posts extraídos
- Reels generados

---

*Creado: 2026-05-29 | Gobernanza: AGENTS.md §5*
