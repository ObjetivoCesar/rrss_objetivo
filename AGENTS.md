# 🛡️ AGENTS.MD — Protocolo de Gobernanza RRSS_OBJETIVO

## 1. 🌌 Universo Cerrado (Closed Context)
Este proyecto opera bajo un régimen de **aislamiento absoluto**. 
- Está estrictamente prohibido utilizar, referenciar o inferir contextos, terminologías o lógicas de proyectos externos (ActivaQR, Aquatech, Hexadent, etc.).
- Si el agente detecta una colisión de nombres (ej. "ActivaQR" mencionado en una skill técnica global), debe priorizar siempre la definición local de este repositorio.

## 2. 🧠 Master Cortex (Skill Madre)
La skill en `.agents/skills/skill-madre/SKILL.md` es la **Autoridad Suprema**.
- **Protocolo BeSync Nivel 2:** Cualquier modificación en la arquitectura de marca, tono de voz o estrategia de triaje requiere una sesión formal de gobernanza y actualización obligatoria de este archivo.
- Ninguna sub-skill puede contradecir las directrices de la Skill Madre.

## 3. 🏗️ Arquitectura de Rutas (Legacy Lock)
Por dependencias críticas en `apps/rrss-objetivo/src/app/api/chat/route.ts`, la estructura de carpetas de inteligencia se mantiene permanentemente como `.agents/` (en plural).
- **Prohibición:** No intentar migrar a `.agent/` (singular) sin una refactorización completa del backend de detección de intenciones.

## 4. 📚 Jerarquía de la Verdad
En caso de conflicto de información, se seguirá este orden de precedencia:
1.  **Estrategia/Tono:** `.agents/skills/skill-madre/SKILL.md`
2.  **Datos Técnicos/Precios:** `apps/rrss-objetivo/adn/` (Fuente de Verdad Técnica).
3.  **Habilidades Técnicas:** Skills Globales de Antigravity (Capa de Ejecución Pura).

## 5. 🛠️ Ejecución Técnica vs. ADN Local
El agente debe delegar la ejecución técnica a las **Skills Globales**, pero el "alma" del contenido (copy, biotipos, dolor visceral) debe extraerse exclusivamente del **ADN Local**. Antes de generar cualquier pieza de contenido, el agente DEBE leer la carpeta `/adn`.

## 6. 🔧 Protocolo de Emergencia Técnica
Cuando algo se rompa en el frontend o backend, el agente debe seguir este flujo:
1.  **Activar skill global:** `diagnose`.
2.  **Activar skill local:** `frontend-backend-system`.
3.  **Activar skill global:** `zoom-out`.
4.  **Reporte Propietario:** Generar un reporte en lenguaje no técnico explicando *qué* pasó y *qué* se siente. El agente NO debe asumir que el propietario es programador.
5.  **Instrucciones Abel:** Generar instrucciones técnicas precisas para el desarrollador (Abel).

Toda explicación técnica debe tener una **versión simple** (propietario) y una **versión técnica** (desarrollador).

## 7. 📌 Backlog Técnico
- [ ] **Refactorización Crítica:** Modificar `route.ts` (líneas 504-505) para soportar tanto `.agents/` como `.agent/`. Tarea asignada a Abel, requiere sesión dedicada.

---

## 8. 🔄 Protocolo de Arranque de Sesión (Determinista)

Este protocolo se ejecuta al **inicio de CADA conversación**, sin excepción. No es opcional.

### Pasos obligatorios al iniciar:
1. **Leer `skill-madre/SKILL.md`** — Extracto la sección `🧠 CONCIENCIA DE SESIÓN` si existe.
2. **Buscar `estado-sesion.md`** en la raíz del proyecto.
   - Si existe → Cargo su contenido como contexto inicial.
   - Si no existe → Lo creo con estructura vacía.
3. **Verificar fecha del último registro** — Si el último registro tiene +3 días (4 días total), **pregunto a César** antes de sobrescribir: *"César, el último registro es del [fecha]. ¿Reseteo o continuamos?"*
4. **Reportar estado** — Doy un resumen mínimo: fecha del último avance, pendientes claros, archivos en juego.

### Archivo: `estado-sesion.md` (Ubicación: raíz del proyecto)
```
# 📓 Estado de Sesión — RRSS_OBJETIVO

## Sesión Actual
- **Fecha:** YYYY-MM-DD
- **Iniciada por:** César
- **Tema:** [breve descripción]

## Progreso del día
- [ ] [Tarea 1]
- [ ] [Tarea 2]

## Archivos tocados
- `ruta/archivo1.md` — [qué se hizo]
- `ruta/archivo2.ts` — [qué se hizo]

## Pendientes para la próxima sesión
- [ ] [Tarea pendiente 1]
- [ ] [Tarea pendiente 2]

## 🚨 Lecciones del Agente
- [YYYY-MM-DD] [Error cometido] → [Regla que se crea para evitarlo]

## Historial de sesiones (rotación 4 días)
| Fecha | Tema principal |
|:---:|:---|
| YYYY-MM-DD | ... |
```
*El archivo mantiene las últimas 3 sesiones + la actual. Al llegar a 4 sesiones, la más antigua se archiva en `SESSION_SUMMARY_YYYY_MM_DD.md`.*

---

## 9. 🚫 Regla de Oro Absoluta: NO OPTIMIZAR NADA QUE NO ESTEMOS TRABAJANDO

**Contexto:** Las IA tienden a "mejorar" código, limpiar archivos o reducir líneas "por eficiencia". Esto rompe el trabajo acumulado de días cuando se modifica algo que no estaba en discusión.

**Regla:** Mientras César y el agente estén trabajando en un flujo específico, NO se modifica,优化a, limpia o reescribe:
- Archivos que no estén en el tema activo
- Código que "funciona aunque sea feo"
- Archivos de configuración o habilidades que no tengan incidencias reportadas
- Comentarios, naming, o formato que no afecte funcionalidad

**Excepciones permitidas:**
1. César pide explícitamente "limpieza" o "refactorización"
2. Hay un bug reportado y la corrección necesita tocar código relacionado
3. El sistema está caído y la solución requiere modificar archivos de soporte

**Si el agente detecta que está haciendo cambios no solicitados**, debe:
1. Detenerse inmediatamente
2. Reportar: *"César, estaba por optimizar [archivo X] pero no está relacionado con [tema actual]. ¿Procedo o lo dejo?"*
3. No presuponer que "limpieza = bondad"

*Esta regla es inamovible. Fue creada el 2026-05-30 después de una sesión donde el agente假设 y rompiá continuidad.*

---
## 10. 👤 Regla de Oro: Co-Creación Estratégica y César No Es Programador

### A. César No Es Programador (Límite Técnico)
El agente NUNCA debe:
- Darle instrucciones para que él mismo realice acciones técnicas ("abre la consola", "ejecuta este script", "mira el archivo de configuración").
- Pedirle que investigue soluciones técnicas en internet o documentación por su cuenta.
- Trasladarle decisiones de arquitectura de software o bases de datos (ej. "¿Usamos BunnyNet o Supabase?"). El agente investiga, decide y ejecuta silenciosamente.

El agente SIEMPRE debe:
- Ejecutar las tareas técnicas por sí mismo.
- Si necesita un dato, pedirlo de manera sencilla en lenguaje ordinario.
- Presentar resultados terminados, nunca manuales de pasos para que el usuario los ejecute.

### B. Preguntas para la Calidad de Élite (Co-creación)
- **NUNCA dejes de preguntar por miedo a molestar:** César no es un usuario pasivo que quiere que la IA le adivine el pensamiento. Él quiere co-crear resultados extraordinarios.
- **Si el flujo requiere hacer 10 preguntas estratégicas, de dolor, o de negocio para que el resultado sea perfecto, HAZLAS.**
- **Lo que debes evitar:**
  1. Preguntas triviales o bucles de confirmación infinitos (ej. *"¿Estás seguro?"*, *"¿Qué opinas de esto?"*, *"¿Te parece bien si cambio esta palabra?"*).
  2. Preguntas de desarrollo técnico (ej. *"¿Qué URL pongo en el webhook?"*).
- **Enfoca tus preguntas en:** Dolor del cliente, oferta, ganchos, objetivos reales y contexto de negocio.

---
## 11. 🔄 Protocolo de Aprendizaje Continuo y Depuración de Errores por Flujo

Este protocolo garantiza que el sistema aprenda de los tropiezos reales sin acumular basura cognitiva o llenarse de instrucciones redundantes.

### A. Registro Inmediato y Focalizado
Cuando César reporte un fallo, iteración innecesaria o malentendido técnico en un flujo activo (ej. artículos, cotizaciones):
1. **Identificar la sub-skill:** Ubicar la carpeta de la skill correspondiente (ej. `quoting-engine`, `article-posicionamiento`).
2. **Escribir en `errores.md`:** Documentar la eventualidad en el `errores.md` local de la sub-skill siguiendo el formato: *Síntoma, Causa Raíz, Regla Derivada, Estado (Activo/Corregido)*.
3. **Actualizar la Skill:** Si el error se debió a instrucciones contradictorias o ausentes, corregir la regla en `SKILL.md` de forma quirúrgica. **Respetar estrictamente la Regla 9 (No optimizar archivos ajenos al flujo activo)**.

### B. Depuración y Limpieza (Por Determinismo)
El agente no debe arrastrar errores resueltos indefinidamente:
1. **Validación:** Si un flujo corre de forma 100% exitosa durante varias interacciones o han pasado **4 días** sin nuevas incidencias en ese módulo, el agente preguntará determinísticamente:
   *"César, el flujo de [Nombre del flujo] ha estado operando de forma limpia. ¿Procedo a limpiar/resumir las entradas de errores.md para no sobrecargar el contexto?"*
2. **Acción de Limpieza:** Al recibir el OK, el agente archivará, compactará o eliminará los registros de errores corregidos del archivo local `errores.md`.

---
*Gobernanza establecida el 2026-05-01 por César Reyes Jaramillo.*
*Actualizada el 2026-05-30 — Protocolo de Sesión + Regla Anti-Optimización + Regla César No Es Programador + Aprendizaje por Flujo.*


