import codecs

content = """# 📓 Estado de Sesión — RRSS_OBJETIVO

## Sesión Actual
- **Fecha:** 2026-05-31
- **Iniciada por:** César
- **Tema:** Corrección y publicación de 3 artículos de posicionamiento (Art-001, Art-002, Art-003)

## Progreso del día
- [x] Corregir image_url en los 3 artículos (de /blog/negocios-locales/ a /articulos/)
- [x] Eliminar H1 duplicado en el contenido (frontmatter genera el título)
- [x] Corregir H2 de Art-001: "El centro no te garantiza nada" → "Arrendar un local en el centro no te garantiza ventas"
- [x] Corregir todos los H2 de Art-002 y Art-003 con títulos más específicos del dolor
- [x] Limpiar marker [data:cache_control] residual en los archivos
- [x] Actualizar script publish-articulos-webhook.js (BOM UTF-8 bug + limpieza)
- [x] Publicar 3 artículos con webhook (Abel actualizó backend)
- [x] Actualizar H1 de los 3 artículos según indicaciones de César
- [x] Republicar con nuevos H1

## Archivos tocados
- `estrategia-posicionamiento/02-articulos/Art-001.md` — image_url corregida, H1/H2 actualizados
- `estrategia-posicionamiento/02-articulos/Art-002.md` — image_url corregida, H1/H2 actualizados
- `estrategia-posicionamiento/02-articulos/Art-003.md` — image_url corregida, H1/H2 actualizados
- `scripts/publish-articulos-webhook.js` — fix BOM UTF-8, parser frontmatter mejorado
- `scripts/publish-webhook-v2.js` — versión limpia del script (creado)

## Pendientes para la próxima sesión
- [ ] Verificar que los 3 artículos se ven correctamente en WhatsApp (imagen WebP puede no funcionar)
- [ ] Obtener versiones JPG de las imágenes destacadas si WhatsApp no las muestra
- [ ] Abel actualizó backend del webhook: compatibilidad con image_url + filtro anti-duplicado H1
- [ ] Continuar con pipeline de contenido: extraer posts y reels de los 3 artículos

## 🚨 Lecciones del Agente
- [2026-05-31] Archivos .md guardados por VS Code/editor pueden tener BOM UTF-8 invisible que rompe regex ^--- en Node.js. Solución: detectar y quitar BOM con bytes [0xEF, 0xBB, 0xBF].
- [2026-05-31] El marker [data:cache_control;base64,ZXBoZW1lcmFs] apareció en muchos archivos — parece ser un bug del editor al guardar. Limpiar con replace.
- [2026-05-31] WhatsApp no muestra preview de imagen con formato WebP — necesita JPG/PNG.

---

## Historial de sesiones (rotación 4 días)
| Fecha | Tema principal |
|:---:|:---|
| 2026-05-31 | Corrección y publicación de 3 artículos de posicionamiento |
| 2026-05-30 | Branding César Reyes + Protocolo de sesión + Anti-optimización |
| 2026-05-29 | Sesión de emergencia (protocolo de arranque) |
"""

with codecs.open(r'C:\Users\Cesar\Documents\GRUPO EMPRESARIAL REYES\PROYECTOS\RRSS_objetivo\estado-sesion.md', 'w', 'utf-8') as f:
    f.write(content)

print('OK')