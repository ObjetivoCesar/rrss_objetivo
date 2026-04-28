# 📔 EXPEDIENTE DE CONTENIDOS RRSS — 2026
**César Reyes Jaramillo | Registro de Ejecución y Resultados**

Este documento es el log oficial de cada pieza de contenido publicada. Sirve para medir el rendimiento y asegurar que no perdamos el foco estratégico.

---

## 🗓️ REGISTRO DE EJECUCIÓN (INICIO: SEMANA 1)
**Tema de la Semana:** El Mito de la "Clientela Fija" (Instalar el miedo a la invisibilidad).

| Fecha | Marca | Formato | Tema / Título | Hook (Gancho) | Estado | Resultados |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **2026-04-28** | César Reyes | Reel 1 | **La Trampa de la Clientela Fija** | "¿Crees que tienes clientela fija? Cuidado, Google dice lo contrario." | ⏳ Por Grabar | - |
| **2026-04-28** | César Reyes | Reel 2 | **La Vitrina de la Competencia** | "En Instagram, tu cliente te ve a ti y a toda tu competencia al mismo tiempo." | ⏳ Por Grabar | - |
| **2026-04-28** | César Reyes | Reel 3 | **Invisibilidad en Google Maps** | "Si no apareces en Google Maps, no existes para el 70% de Loja." | ⏳ Por Grabar | - |
| **2026-04-28** | OBJETIVO | Reel 4 | **IA: Más que un Chatbot** | "La IA no es para chatear, es para que tu negocio trabaje mientras descansas." | ⏳ Por Grabar | - |
| **2026-04-28** | ActivaQR | Reel 5 | **Muerte al Papel** | "¿Sigues repartiendo papel? Tu perfil digital es tu verdadera oficina." | ⏳ Por Grabar | - |
| **2026-04-28** | OBJETIVO | Reel (Auto) | **Tarjetas Basura** | "¿Sigues regalando basura? 🚩" | ✅ Programado (14:54) | [Link Video](https://player.mediadelivery.net/play/636136/7d9b7651-96ba-4098-b47a-e4502f880c98) |

---

## 📈 NOTAS ESTRATÉGICAS (SEMANA 1)
- **Foco:** Romper la falsa seguridad de los negocios tradicionales de Loja.
- **Mentalidad:** Menos perfección, más ejecución. 
- **Estructura:** Gancho Brutal -> El Problema (Duele) -> La Solución (César) -> CTA.

---

## 🚨 LOG DE ERRORES TÉCNICOS (SISTEMA DE PUBLICACIÓN)

### 2026-04-28: Fallo en Filtro de Make.com (Instagram/Facebook)
- **Error:** El sistema envió un Video (Reel) por la ruta de Imagen.
- **Causa Técnica:** El scheduler ahora envía un **Array de Objetos** (`media_urls[]`). Los filtros de Make.com estaban configurados con operadores de texto ("Does not contain .mp4") apuntando al array completo. Al no ser un string plano, el filtro falló (devolvió TRUE erróneamente).
- **Acción Correctiva:** Se deben actualizar los filtros en Make.com para apuntar a `media_urls[].url` o usar los nuevos campos booleanos `is_video` / `is_image`.
- **Estado:** PENDIENTE de corrección manual en Make.com.
