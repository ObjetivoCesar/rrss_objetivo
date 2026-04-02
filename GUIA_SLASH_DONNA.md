# ⚡️ Guía Rápida: Slash Commands & Integración Donna ⚡️

¡Bienvenido a la nueva forma de comunicarte con Donna! Para acelerar tu flujo de trabajo, hemos implementado comandos rápidos (Slash Commands) y una integración bidireccional directa con el *Strategy Planner*.

## 1. Slash Commands en el Chat de Donna

Ahora Donna entiende comandos directos sin que tengas que teclear el "prompt" de cero cada vez. Funciona igual que en herramientas como Notion o Slack.

### ¿Cómo usarlo?
1. Escribe el símbolo **`/`** en el cuadro de texto de Donna (ya sea en su chat del menú lateral o en la pantalla principal).
2. Automáticamente se desplegará un menú flotante magenta sobre tu texto con la lista de opciones.
3. Sigue escribiendo (por ejemplo: `/ge`) para filtrar las opciones.
4. **Haz clic** sobre el comando que quieres usar, o autocompleta con un espacio.

### Comandos Disponibles
* **`/crear`**: Tu comando principal para desarrollo estructural. Úsalo para que Donna desarrolle a profundidad un módulo entero, todo el contenido de un día (ej: `/crear todo el día jueves`), crear un objetivo o estructurar una campaña completa.
* **`/generar`**: Úsalo cuando necesites producción rápida y masiva: variaciones de copy, ideas de contenido, o borradores relámpago.
* **`/objetivo`**, **`/estrategia`**: Atajos directos para activar el "modo planificador" y aterrizar conceptos de negocio.
* **`/reels`**: Para creación de guiones directos. Ojo, ella usará su ADN de storytelling corto y retentivo.
* **`/carrusel`**: Dispara la "Invocación al Motor de Carruseles 2026", la cual contiene la redacción estricta de 8 láminas con Hook, problema, solución y CTA.

---

## 2. Inyección Directa: "Compartir a Donna" (Strategy Planner)

Antes, para evaluar una estrategia que habías armado en el **Strategy Planner**, debías descargar el archivo `JSON` y, si la UI te lo permitía (o mediante trucos), pasárselo a Donna. Ya no más.

### Flujo Mejorado
1. Entra a tu **Strategy Planner** y carga una sesión o dibuja tu ecosistema de campaña.
2. En la parte inferior izquierda de las herramientas notarás un nuevo botón magenta: **"✨ A DONNA"**.
3. Al presionarlo:
   - El ecosistema convierte todos los nodos visuales y ramificaciones en el código JSON detrás de cámaras.
   - El panel lateral de **Donna Chat** se abrirá por sí solo (si estaba cerrado).
   - Donna auto-escribirá el JSON en el cuadro de mensaje, listo para enviar.
   - **Tú tienes el control final**: Puedes apretar **ENTER** para enviarlo directamente, o agregar una línea como: *"Donna, enfócate solo en la campaña de Meta Ads"*.

---

## 3. Nombrado Inteligente de Sesiones

Al generar una carga automatizada en el Canvas porque se lo pediste a Donna en el chat, tu pizarrón pasaba a llamarse genéricamente `"Nueva Planificación"`. Si te olvidabas de corregirlo en el cuadro de texto superior y le dabas a guardar, sobrescribía una planificación vacía.

**¿Qué pasa ahora?**
* **Interceptación Genética**: La próxima vez que un mapa visual se invoque y pinte desde Donna, el planner extraerá inteligentemente el `name` del nodo principal (tu Objetivo) y te auto-rellenará el cuadro de título con *"Estrategia: [Nombre del Objetivo]"*.
* **Guardado Seguro**: Esto garantiza que, si das clic a "Guardar Sesión" de inmediato sin rellenar nada, al menos se catalogue con el nombre descriptivo correcto en Supabase y no pierdas tu trabajo ni se cruce con otros planes.
