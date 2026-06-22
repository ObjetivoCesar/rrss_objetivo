# 📚 Repo Memory — RRSS_OBJETIVO

## Reglas de oro (nunca olvidar)

### 👤 CO-CREACIÓN ESTRATÉGICA Y CÉSAR NO ES PROGRAMADOR
**Creado:** 2026-05-30
**Regla:** César Reyes no es programador (limite técnico). El agente debe resolver lo técnico solo y no pedirle a César que corra comandos o decida arquitectura.
**Preguntas de valor:** El agente NO debe dejar de hacer preguntas por miedo a molestar. Si se requieren 10 preguntas de negocio/dolor para lograr calidad de élite, se deben hacer. Evita únicamente confirmaciones triviales ("¿estás seguro?") y tecnicismos.
**Frase de control:** *"¿Estoy resolviendo el problema técnico yo solo?" y "¿Estas preguntas refinan el negocio o son relleno trivial?"*

---

### 🚫 NO OPTIMIZAR NADA QUE NO ESTEMOS TRABAJANDO
**Creado:** 2026-05-30
**Contexto:** Las IA tienden a "mejorar" código, limpiar archivos o reducir líneas "por eficiencia". Esto rompe el trabajo acumulado de días cuando se modifica algo que no estaba en discusión.
**Regla:** Mientras César y el agente estén trabajando en un flujo específico, NO se modifica, optimiza, limpia o reescribe:
- Archivos que no estén en el tema activo
- Código que "funciona aunque sea feo"
- Archivos de configuración o habilidades que no tengan incidencias reportadas
- Comentarios, naming, o formato que no afecte funcionalidad
**Excepciones:** César pide explícitamente "limpieza" o "refactorización", hay bug reportado, o el sistema está caído.
**Si el agente detecta cambios no solicitados:** Detenerse → Preguntar → No presuponer que "limpieza = bondad".

---

## Arquitectura del proyecto

### Estructura clave
- `.agents/skills/` — Skills de contenido (article-posicionamiento, social-post-engine, etc.)
- `estrategia-posicionamiento/02-articulos/` — Artículos publicados (Art-001, 002, 003)
- `docs/borradores/` — Borradores en bruto (Lotes de artículos)
- `planificacion-rrss/` — CSV de tracking (BLOG_ESTRATEGICO_2026.csv)
- `estado-sesion.md` — Puente entre sesiones (raíz)

### Skills críticos
- `article-posicionamiento` — Para artículos de posicionamiento ActivaQR. NO intentar ejecutar el flujo internamente, SIEMPRE invocar este skill.
- `social-post-engine` — Para posts de imagen/video
- `quoting-engine` — Para cotizaciones ActivaQR

---

## Errores aprendidos

| Fecha | Error | Remedio |
|:---:|:---|:---|
| 2026-05-30 | Agente no leyó skill-madre al inicio y perdió el estado | Protocolo de arranque en AGENTS.md (Sección 8) fuerza lectura de estado-sesion.md |
| 2026-05-30 | Agente buscó archivos en docs/borradores sin invocar skill | Skill madre ahora tiene mandato de invocar skills especializados por intención |
| 2026-05-30 | Agente假设 contenido y no siguió el pipeline documentado | Regenerar contexto desde estado-sesion.md antes de buscar archivos |

---

## Pendientes del proyecto

### Articles por subir a la página
- Art-001, Art-002, Art-003 en `estrategia-posicionamiento/02-articulos/`
- Posiblemente artículos del lote 26-30 en `docs/borradores/Lot_3_Raw_26_30.md`

### Backlog técnico (de AGENTS.md)
- [ ] Refactorizar `route.ts` para soportar `.agent/` y `.agents/` — Asignado a Abel

---

*Última actualización: 2026-05-30*