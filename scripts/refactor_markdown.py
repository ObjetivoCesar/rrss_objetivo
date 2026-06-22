import os

file_path = r"c:\Users\Cesar\Documents\GRUPO EMPRESARIAL REYES\PROYECTOS\RRSS_objetivo\.agent\ESTRATEGIA DE POSICIONAMIENTO.docx.md"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

replacements = []

# Semana 1 Viernes Reel
s1_vie_old = """Reel avatar: "¿Estás de acuerdo? Etiqueta a alguien con negocio en Loja" · CTA: comenta SÍ o NO."""
s1_vie_new = """---
**🎥 PRODUCCIÓN AUDIOVISUAL DEL DÍA: REEL AVATAR**
**Publicación:** ActivaQR (perfil propio)
**Objetivo:** Combustión encuesta 2 — generar comentarios SÍ o NO
**Duración:** 18 segundos
**Avatar:** Mujer, aprox. 30 años, ropa casual-profesional. Voz español neutro latinoamericano, tono directo y seguro.

**TEXTO EN PANTALLA (sincronizado):**
[0-3 seg] → *¿Sabes cómo te tienen guardado tus clientes?*
[4-8 seg] → *"María la de la ropa"*
[9-12 seg] → *"El señor del pan"*
[13-16 seg] → *Así no te van a recomendar.*
[17-18 seg] → *ActivaQR lo cambia. Link en bio.*

**GUION VOZ AVATAR:**
"¿Sabes cómo te tienen guardado tus clientes en el teléfono?
'María la de la ropa'. 'El señor del pan'. 'Plomero mamá'.
Así no te van a recomendar cuando más te necesiten.
ActivaQR lo cambia. Desde veinte dólares al año."

**CTA final en pantalla:** COMENTA: ¿así te tienen guardado? SÍ o NO
---"""
replacements.append((s1_vie_old, s1_vie_new))

# Semana 2 Martes Historia + Reel
s2_mar_old = """Reel avatar: "Muchos dicen que el sobrino maneja sus redes, pero el estratega César Reyes dice que eso es invisibilidad. ¿A quién le crees?" · CTA: comenta GUÍA."""
s2_mar_new = """---
**📱 HISTORIA CÉSAR REAL (MARTES — PREVIA A OMNIPRESENCIA)**
"Mañana voy a estar en cuatro lugares al mismo tiempo explicando el error más caro que cometen los negocios en Loja. Primer Reporte, Hora 32, Ecotel Express y mi blog. Activa las notificaciones."

**🎥 PRODUCCIÓN AUDIOVISUAL DEL DÍA: REEL AVATAR**
**Publicación:** ActivaQR
**Objetivo:** Debate — sobrino vs. estratega
**Duración:** 20 segundos
**Avatar:** Hombre, aprox. 30 años, ropa casual-profesional. Voz español neutro, tono más confrontacional y provocador.

**TEXTO EN PANTALLA:**
[0-3 seg] → *Tu sobrino sabe subir fotos.*
[4-7 seg] → *¿Sabe construir una base de datos?*
[8-12 seg] → *Hay una diferencia entre presencia en redes*
[13-15 seg] → *y un sistema de ventas.*
[16-18 seg] → *¿A cuál le estás apostando?*
[19-20 seg] → *Comenta.*

**GUION VOZ AVATAR:**
"Tu sobrino sabe subir fotos. Eso está bien.
Pero, ¿sabe construir una base de datos de clientes que no dependa del algoritmo de Instagram?
Hay una diferencia enorme entre tener presencia en redes y tener un sistema de ventas.
¿A cuál le estás apostando tú?
Comenta abajo."

**CTA final en pantalla:** ¿SISTEMA O INSTAGRAM? COMENTA
---"""
replacements.append((s2_mar_old, s2_mar_new))

# Semana 2 Miercoles Reel César + Historia
s2_mie_old = """*Acciones clave:* Omnipresencia en 4 medios el mismo día · Bio de Instagram activa: "Consultor en [logos de medios]" · CTA diagnóstico gratis."""
s2_mie_new = """---
**📱 HISTORIA CÉSAR REAL (DÍA DE OMNIPRESENCIA)**
"Hoy salió el análisis en @PrimerReporte, @Hora32 y @EcotelExpress. Si todavía no lo leíste, el link está aquí arriba. Es de los que se guardan."

**🎥 PRODUCCIÓN AUDIOVISUAL DEL DÍA: REEL CÉSAR REAL**
**Publicación:** Perfil personal de César Reyes
**Formato:** CÉSAR REAL a cámara — NO avatar
**Objetivo:** Primera aparición pública de César con autoridad transferida
**Duración:** 60 segundos máximo
**Notas de Grabación:** Cámara fija. Luz natural, ambiente profesional casual. Subtítulos sincronizados.

**GUION CÉSAR (habla directo):**
*"Esta semana Primer Reporte le preguntó algo incómodo a los negocios de Loja.
El resultado: la mayoría sabe que cuando su cliente los busca en redes, también está viendo a la competencia. Pero nadie les había explicado por qué pasa eso, ni qué pueden hacer.
Yo llevo más de seis años construyendo sistemas digitales para negocios en Ecuador. Y el problema número uno que veo no es la falta de publicidad.
Es que el negocio no vive en el teléfono de sus clientes.
Esta semana publicamos el análisis completo. El link está en mi bio.
Si tienes un negocio en Loja y quieres entender por qué tus clientes no te encuentran cuando más te necesitan — sígueme. Esto recién empieza."*

**TEXTO EN PANTALLA:**
[0-5 seg] → *César Reyes · Estratega de Sistemas para PYMEs*
[Al final] → *cesarreyesjaramillo.com*
**CTA final:** Sígueme — esto recién empieza.
---
*Acciones clave:* Omnipresencia en 4 medios el mismo día · Bio de Instagram activa: "Consultor en [logos de medios]" · CTA diagnóstico gratis."""
replacements.append((s2_mie_old, s2_mie_new))

# Semana 2 Sabado Historia
s2_sab_old = """Historia: link al blog con sticker "desliza arriba"."""
s2_sab_new = """---
**📱 HISTORIA CÉSAR REAL (ARTÍCULO + DIAGNÓSTICO)**
"Si esta semana te quedaste con alguna duda sobre cómo aparece tu negocio en el teléfono de tus clientes, escríbeme directamente. El diagnóstico es gratis. Así de simple."
Link al blog con sticker "desliza arriba".
---"""
replacements.append((s2_sab_old, s2_sab_new))

# Semana 3 Lunes Historia + Reel Prelanzamiento
s3_lun_old = """*Sinergia:* Story AQ con sticker encuesta. AQ comenta en PR: "¿Cuántos negocios en Loja tienen este problema? El miércoles publicamos la solución". Prelanzamiento de ActivaQR en la narrativa."""
s3_lun_new = """---
**📱 HISTORIA CÉSAR REAL (ANUNCIO EXPERIMENTO)**
"Esta semana voy a instalar un sistema completo en un negocio real de Loja y voy a publicar los resultados el viernes. ¿Qué negocio debería ser? Comenta o escríbeme directo."

**🎥 PRODUCCIÓN AUDIOVISUAL DEL DÍA: REEL AVATAR**
**Publicación:** ActivaQR
**Objetivo:** Generar expectativa para el lanzamiento del miércoles
**Duración:** 15 segundos
**Avatar:** Mujer, aprox. 30 años. Voz neutra.

**TEXTO EN PANTALLA:**
[0-3 seg] → *Un negocio en Loja perdía 10 citas por semana.*
[4-8 seg] → *No por falta de clientes.*
[9-12 seg] → *Por falta de sistema.*
[13-15 seg] → *El miércoles publicamos cómo lo resolvió.*

**GUION VOZ AVATAR:**
"Una clínica en Loja perdía diez citas por semana.
No por falta de clientes. Por falta de sistema.
El miércoles publicamos exactamente cómo lo resolvieron.
Activa las notificaciones."

**CTA final en pantalla:** ACTIVA LAS NOTIFICACIONES
---
*Sinergia:* Story AQ con sticker encuesta. AQ comenta en PR: "¿Cuántos negocios en Loja tienen este problema? El miércoles publicamos la solución". Prelanzamiento de ActivaQR en la narrativa."""
replacements.append((s3_lun_old, s3_lun_new))

# Semana 3 Martes Reel Debate Lujo
s3_mar_old = """Reel avatar: "¿Crees que la tecnología es un lujo o una obligación para sobrevivir hoy? Comenta" · Los comentarios alimentan el copy del caso de éxito del jueves."""
s3_mar_new = """---
**🎥 PRODUCCIÓN AUDIOVISUAL DEL DÍA: REEL AVATAR**
**Publicación:** ActivaQR
**Objetivo:** Debate lujo vs. obligación — alimenta el copy del caso del jueves
**Duración:** 18 segundos
**Avatar:** Mujer, aprox. 30 años. 

**TEXTO EN PANTALLA:**
[0-4 seg] → *¿La tecnología para tu negocio es un lujo?*
[5-9 seg] → *O es lo que te separa*
[10-13 seg] → *de cerrar el mes en rojo.*
[14-16 seg] → *Comenta: LUJO u OBLIGACIÓN*
[17-18 seg] → *Usamos tus respuestas el jueves.*

**GUION VOZ AVATAR:**
"¿La tecnología para tu negocio es un lujo?
¿O es exactamente lo que te separa de cerrar el mes en rojo?
Comenta abajo: LUJO u OBLIGACIÓN.
Vamos a usar esas respuestas el jueves."

**CTA final en pantalla:** COMENTA: LUJO u OBLIGACIÓN
---"""
replacements.append((s3_mar_old, s3_mar_new))

# Semana 3 Miercoles Historia
s3_mie_old = """*ActivaQR:* Hoy publicamos algo diferente."""
s3_mie_new = """---
**📱 HISTORIA CÉSAR REAL (INSTALACIÓN EN VIVO)**
"Ya elegimos el negocio. Hoy instalamos. El viernes vemos qué pasó. Sin editar, sin filtros — números reales."
---
*ActivaQR:* Hoy publicamos algo diferente."""
replacements.append((s3_mie_old, s3_mie_new))

# Semana 3 Jueves Historia Encuesta
s3_jue_old = """Historia César con encuesta nativa ("¿Tienes base de datos?")."""
s3_jue_new = """---
**📱 HISTORIA CÉSAR REAL (ENCUESTA NATIVA)**
Usar sticker de encuesta de Instagram directamente.
**Pregunta:** *"¿Tienes ya una base de datos de tus clientes?"*
**Opción A:** *Sí, la tengo organizada*
**Opción B:** *No, solo tengo WhatsApp*
---"""
# Para evitar fallos si no encuentra la línea exacta:
if s3_jue_old not in content:
    s3_jue_old = """*Sinergia:* Esta encuesta filtra al cliente ideal."""
    s3_jue_new = """---
**📱 HISTORIA CÉSAR REAL (ENCUESTA NATIVA)**
Usar sticker de encuesta de Instagram directamente.
**Pregunta:** *"¿Tienes ya una base de datos de tus clientes?"*
**Opción A:** *Sí, la tengo organizada*
**Opción B:** *No, solo tengo WhatsApp*
---
*Sinergia:* Esta encuesta filtra al cliente ideal."""
replacements.append((s3_jue_old, s3_jue_new))

# Semana 3 Viernes Reel Demo + Historia Resultados
s3_vie_old = """Historia: demostración en video de 15 segundos del proceso ActivaQR en acción."""
s3_vie_new = """---
**📱 HISTORIA CÉSAR REAL (RESULTADOS DEL EXPERIMENTO)**
"Los resultados del experimento ya están publicados. Número real, proceso real, negocio real de Loja. El link está aquí arriba."

**🎥 PRODUCCIÓN AUDIOVISUAL DEL DÍA: REEL DEMO PANTALLA**
**Publicación:** ActivaQR + Primer Reporte Stories
**Objetivo:** Mostrar producto en acción
**Duración:** 20 segundos
**Formato:** Pantalla grabada de teléfono + Voz Avatar superpuesta.

**GUION VOZ AVATAR:**
"Mira. El cliente escanea el QR.
Un toque. Descarga.
El negocio queda guardado en su teléfono con foto, servicios y WhatsApp directo.
Para siempre. Sin que nadie lo olvide.
Eso es ActivaQR. Desde veinte dólares al año."

**TEXTO EN PANTALLA:**
[Durante escaneo] → *1 escaneo*
[Durante descarga] → *1 toque*
[Contacto guardado] → *Guardado para siempre*
[Final] → *activaqr.com · desde $20/año*

**CTA final:** Link en bio — empieza hoy.
---"""
replacements.append((s3_vie_old, s3_vie_new))

# Semana 4 Lunes Firma Directa
s4_lun_old = """*ActivaQR:* Tu agenda llena no significa que tu negocio sea rentable. Yo arreglo la fuga."""
s4_lun_new = """---
**📱 HISTORIA CÉSAR REAL (FIRMA DIRECTA)**
"Esta semana cerramos el mes. Y quiero preguntarte algo directo: ¿tu negocio está trabajando para ti o tú estás trabajando para él? Escríbeme. Tengo espacios para diagnóstico esta semana."
---
*ActivaQR:* Tu agenda llena no significa que tu negocio sea rentable. Yo arreglo la fuga."""
replacements.append((s4_lun_old, s4_lun_new))

# Semana 4 Martes Trampa Operatividad
s4_mar_old = """Reel avatar final: "¿Estás listo para que tu negocio trabaje para ti o vas a esperar que tu competencia automatice primero?" — el reel más directo del mes."""
s4_mar_new = """---
**🎥 PRODUCCIÓN AUDIOVISUAL DEL DÍA: REEL AVATAR**
**Publicación:** ActivaQR
**Objetivo:** El reel más confrontacional del mes — prospecto lleva 3 semanas de contexto
**Duración:** 20 segundos
**Avatar:** Hombre, aprox. 30 años.

**TEXTO EN PANTALLA:**
[0-4 seg] → *El [X]% trabaja PARA su negocio.*
[5-8 seg] → *No al revés.*
[9-13 seg] → *Eso tiene nombre:*
[14-16 seg] → *La Trampa de la Operatividad.*
[17-18 seg] → *César Reyes explica cómo salir.*
[19-20 seg] → *Link en bio.*

**GUION VOZ AVATAR:**
"El resultado de esta semana confirmó algo que ya sospechábamos.
La mayoría de dueños de negocio en Loja trabaja para el negocio — no al revés.
Eso tiene nombre: la Trampa de la Operatividad.
César Reyes explica hoy cómo salir de ella.
El link está en la bio."

**CTA final en pantalla:** ¿ESTÁS ATRAPADO? COMENTA
---"""
replacements.append((s4_mar_old, s4_mar_new))

# Semana 4 Miercoles Entrevista Historia
s4_mie_old = """*ActivaQR:* Hoy en @PrimerReporte César Reyes explica por qué "estar ocupado" no es lo mismo que "ser rentable"."""
s4_mie_new = """---
**📱 HISTORIA CÉSAR REAL (DESPUÉS DE ENTREVISTA EN PR)**
"Hoy salió la entrevista en @PrimerReporte. Si quieres ver por qué las empresas que usan Excel siempre llegan tarde — el link está aquí. Es de las que incomodan."
---
*ActivaQR:* Hoy en @PrimerReporte César Reyes explica por qué "estar ocupado" no es lo mismo que "ser rentable"."""
replacements.append((s4_mie_old, s4_mie_new))

# Semana 4 Jueves Historia Emocional
s4_jue_old = """*Sinergia:* Esta es la encuesta más poderosa del mes."""
s4_jue_new = """---
**📱 HISTORIA CÉSAR REAL (LA MÁS EMOCIONAL)**
"Te hago una pregunta y quiero que la pienses en serio. Si pudieras eliminar el ochenta por ciento de tus tareas repetitivas — ¿en qué invertirías ese tiempo? Escríbeme la respuesta. Me interesa saber."
---
*Sinergia:* Esta es la encuesta más poderosa del mes."""
replacements.append((s4_jue_old, s4_jue_new))

# Semana 4 Viernes Demo Final 3 Productos
s4_vie_old = """3 Historias: una por cada producto. Reel demo final de los 3 productos."""
s4_vie_new = """3 Historias: una por cada producto.

---
**🎥 PRODUCCIÓN AUDIOVISUAL DEL DÍA: REEL AVATAR / DEMO**
**Publicación:** ActivaQR
**Objetivo:** Presentar la escalera completa de productos — reel reutilizable
**Duración:** 20 segundos

**TEXTO EN PANTALLA:**
[0-3 seg] → *3 sistemas que cambian un negocio en Loja:*
[4-7 seg] → *1. ActivaQR — vive en el teléfono de tu cliente*
[8-11 seg] → *2. Bot WhatsApp — atiende solo mientras duermes*
[12-15 seg] → *3. CRM — nunca pierdas un cliente por olvido*
[16-18 seg] → *Todo empieza desde $20.*
[19-20 seg] → *activaqr.com*

**GUION VOZ AVATAR:**
"Tres sistemas que están cambiando negocios en Loja.
Primero: ActivaQR — tu negocio vive en el teléfono de cada cliente.
Segundo: automatización de WhatsApp — tu negocio atiende solo mientras duermes.
Tercero: CRM personalizado — nunca más pierdes un cliente por olvido.
Todo empieza desde veinte dólares. activaqr.com"

**CTA final en pantalla:** EMPIEZA HOY · activaqr.com
---"""
replacements.append((s4_vie_old, s4_vie_new))

# Semana 4 Sabado Cierre mes Historia
s4_sab_old = """Historia: resumen visual del mes en formato carrusel."""
s4_sab_new = """Historia: resumen visual del mes en formato carrusel.
---
**📱 HISTORIA CÉSAR REAL (CIERRE DE MES)**
"Un mes. Ocho encuestas. Cuatro artículos. Dos casos de éxito. Y una sola conclusión: los negocios en Loja no son invisibles por falta de calidad. Son invisibles por falta de sistema. El mes que viene empezamos a resolverlo. Sígueme."
---"""
replacements.append((s4_sab_old, s4_sab_new))

modificados = 0
for old_text, new_text in replacements:
    if old_text in content:
        content = content.replace(old_text, new_text)
        modificados += 1
    else:
        print(f"⚠️ NO ENCONTRADO: {old_text[:50]}...")

# Eliminar sección basura final
idx = content.find("# GUIONES COMPLETOS — PAQUETE PRIMER REPORTE")
if idx != -1:
    content = content[:idx]
    print("✅ Sección final 'GUIONES COMPLETOS' eliminada correctamente.")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print(f"¡Reorganización completa! {modificados}/{len(replacements)} inyecciones realizadas exitosamente.")
