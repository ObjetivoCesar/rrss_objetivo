---
name: carousel-maintenance
description: Protocolo operativo para la carga, optimización y sincronización de carruseles de 8 láminas en el ecosistema RRSS_objetivo. Úsalo para asegurar que los carruseles se publiquen correctamente con todas sus imágenes.
---

# 🛠️ Skill: Mantenimiento y Sincronización de Carruseles

Esta skill es la guía operativa para que César (o cualquier agente) mantenga el flujo de carruseles de 8 láminas sin errores técnicos.

## 1. El Flujo de Trabajo (Protocolo de 4 Pasos)

Para cada tanda de carruseles nuevos, sigue este orden exacto:

### Paso 1: Preparación de Archivos Localmente
1. Descarga las láminas generadas por IA.
2. Colócalas en `apps/rrss-objetivo/public/carruseles/`.
3. Organízalas en carpetas por número de carrusel:
   - `Carrusel 1/` (SEO B2B / IA)
   - `Carrusel 2/` (E-commerce / Menús)
   - `Carrusel 3/` (WhatsApp CRM)
   - `Carrusel 4/` (Reingeniería / Estrategia)
   - `Carrusel 5/` (Networking / Branding)
   - `Carrusel 6/` (IA en Ecuador)
4. Nombra las imágenes como `slide_1.png`, `slide_2.png`... hasta `slide_8.png`.

### Paso 2: Optimización de Imágenes
Ejecuta el script de optimización para reducir el peso sin perder calidad y sin recortar el formato:
```bash
node apps/rrss-objetivo/scripts/optimize_carousels.js
```
*Este script convierte PNG a WebP y elimina los originales.*

### Paso 3: Subida Masiva a BunnyCDN
Sincroniza las carpetas locales con el almacenamiento en la nube de Bunny:
```bash
node apps/rrss-objetivo/scripts/bulk_upload_bunny_carousels.js
```
*Esto crea la estructura de carpetas en `https://cesarweb.b-cdn.net/carruseles/`.*

### Paso 4: Sincronización con Supabase (Base de Datos)
Actualiza los registros de los posts programados para que incluyan las 8 URLs en lugar de solo la portada:
```bash
node apps/rrss-objetivo/scripts/fix_carousel_media_urls.js
```
*Este script vincula automáticamente el contenido del post con su carpeta correspondiente en BunnyCDN.*

## 2. Mapeo de Topics y Carpetas

El script de sincronización usa este mapa. Si creas nuevos temas, asegúrate de actualizarlo en el script:

| Topic en Supabase | Carpeta en Bunny |
|:--- |:--- |
| SEO B2B, SEO e IA | Carrusel 1 |
| E-commerce, Venta Directa, Menús Digitales | Carrusel 2 |
| WhatsApp CRM | Carrusel 3 |
| Estrategia Digital, Reingeniería 2026 | Carrusel 4 |
| Networking, Branding y Autoridad | Carrusel 5 |
| IA en Ecuador | Carrusel 6 |

## 3. Verificación de Éxito
1. Entra al Calendario en el Dashboard.
2. Haz clic en un post de carrusel (color Púrpura/Ámbar).
3. En el modal, deberías ver **8 miniaturas** de imágenes.
4. **Disparo Manual:** Si quieres probar la publicación inmediata, usa el botón **"Disparar Scheduler (Manual)"** en la página principal de Publicaciones. 
   - *Nota:* El sistema usa un patrón síncrono; espera a que la notificación de éxito aparezca antes de cerrar.

## 4. Notas de Despliegue (Vercel)
- **Rama Oficial:** Siempre empujar a la rama `master`. La rama `main` es secundaria y no actualiza la producción en Vercel.
- **Límites Hobby:** No usar `maxDuration` ni crons de alta frecuencia en `vercel.json`.

## 5. Solución de Problemas
- **Las fotos salen cortadas**: Asegúrate de que `optimize_carousels.js` NO tenga activo el `.resize()` o el `.extract()`.
- **Make.com solo publica 1 foto**: El array `media_urls` en Supabase tiene solo 1 elemento. Re-ejecuta el Paso 4.
- **Error de conexión**: Revisa que las variables de entorno en `.env.local` (BUNNY_API_KEY, SUPABASE_URL) sean correctas.
