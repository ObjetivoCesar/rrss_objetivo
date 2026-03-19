# Expert Lens Pipeline™ — Guía de Integración
**Sistema de generación de guiones para video · ActivaQR.com**

---

## ¿Qué es este módulo?

El **Expert Lens Pipeline** es un sistema de producción de guiones de video con IA. Toma una idea en texto y la convierte en un guion completo optimizado, con:
- Debate interno de 7 expertos (Brainstorm de IA)
- Prompts de producción: video por escena, voz en off, música
- Síntesis de voz (Gemini TTS) con audio reproducible
- Historial de guiones en Supabase
- Estilos visuales (100+ opciones)

El motor principal es **DeepSeek Reasoner** (deepseek-reasoner) para el guion y **DeepSeek Chat** para los prompts de producción. El TTS usa **Gemini 2.5 Flash**.

---

## Estructura de archivos del ZIP

```
expert-lens-pipeline-module/
├── app/                         ← Páginas y server actions
│   ├── actions.ts               ← generateScript, saveFullPipeline, etc.
│   ├── voice-actions.ts         ← TTS, música Gemini, extracción de voz
│   ├── page.tsx                 ← UI principal del pipeline
│   ├── layout.tsx               ← Layout con fuentes
│   ├── globals.css
│   └── login/                   ← Autenticación Supabase
│       ├── page.tsx
│       └── actions.ts
├── lib/
│   ├── pipeline/
│   │   ├── executor.ts          ← runBrainstormPipeline (función principal)
│   │   └── production-prompts.ts← Genera prompts de video/voz/música
│   ├── llm/
│   │   ├── provider.ts          ← Factory de proveedores (DeepSeek/Gemini)
│   │   ├── types.ts
│   │   └── adapters/
│   │       ├── deepseek.ts
│   │       └── gemini.ts
│   ├── prompts/
│   │   └── loader.ts            ← Lee archivos .md de /prompts/
│   ├── audio/
│   │   └── voices.ts            ← Lista de voces Gemini disponibles
│   ├── supabase/
│   │   ├── client.ts            ← Cliente browser
│   │   └── server.ts            ← Cliente server (cookies Next.js)
│   └── utils/
│       └── export.ts            ← Exportar guion a Markdown
├── prompts/                     ← Prompts en texto (NO hardcodeados en código)
│   ├── adn-activaqr.md          ← ADN base de ActivaQR (contexto permanente)
│   ├── draft-brainstorm.md      ← Prompt maestro del debate de expertos
│   ├── production-video.md      ← Genera prompts de video por escena
│   ├── production-voice.md      ← Genera narración limpia con marcadores
│   └── production-music.md      ← Genera brief musical
├── adn/
│   ├── adn                      ← ADN v4 (versión extendida con productos)
│   └── ExpertLensPipeline_ActivaQR_v2.doc.md ← Spec original del sistema
├── public/
│   └── video-styles/            ← 100+ estilos visuales (imágenes + styles.json)
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql ← Schema completo de tablas
├── middleware.ts                 ← Auth guard para rutas protegidas
└── INTEGRATION_GUIDE.md         ← Este archivo
```

---

## Variables de entorno necesarias

Agrega estas variables al `.env.local` del proyecto destino:

```bash
# ─── DeepSeek (Motor principal del pipeline) ───────────────────────────────
DEEPSEEK_API_KEY=sk-...          # Obtener en platform.deepseek.com

# ─── Google AI (TTS + Música Gemini) ───────────────────────────────────────
GOOGLE_AI_API_KEY=AIza...        # Obtener en aistudio.google.com

# ─── Supabase del proyecto destino ─────────────────────────────────────────
# (Usar las del proyecto RRSS_objetivo — las mismas que ya tienes)
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# ─── App ───────────────────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> ⚠️ **No necesitas** `LLM_API_KEY` ni `ANTHROPIC_API_KEY`. El pipeline ahora corre 100% en DeepSeek.

---

## Base de datos — Tablas a crear

Ejecuta el archivo `supabase/migrations/001_initial_schema.sql` en el Supabase del proyecto destino.

Crea estas **5 tablas nuevas** (no interfieren con las existentes de RRSS):

| Tabla | Propósito |
|-------|-----------|
| `scripts` | Guiones generados |
| `script_versions` | Historial de versiones de cada guion |
| `lens_results` | Resultados de cada lente del pipeline |
| `checklist_results` | Validación de buyer persona |
| `production_outputs` | Prompts de video/voz/música generados |

También crea **3 ENUMs** de Postgres: `pipeline_status`, `lens_type`, `lens_verdict`.

> ⚠️ Si el Supabase ya tiene una función llamada `update_updated_at`, puede que el script genere un conflicto. Comenta esa línea en el SQL o renómbrala a `update_scripts_updated_at`.

---

## Cómo integrar en un proyecto Next.js existente (src/ structure)

Si el proyecto destino usa `src/app/` en lugar de `app/`:

1. Mueve el contenido de `app/` a `src/app/pipeline/` para evitar conflictos con las rutas existentes. Por ejemplo:
   - `app/page.tsx` → `src/app/pipeline/page.tsx`
   - `app/actions.ts` → `src/app/pipeline/actions.ts`

2. Mueve `lib/` a `src/lib/pipeline-module/` si ya tienes tu propio `src/lib/`.

3. Los `prompts/`, `adn/` y `public/video-styles/` van en la raíz del proyecto sin cambios.

4. Agrega las dependencias a `package.json`:

```bash
npm install @google/genai openai @anthropic-ai/sdk
```

> El SDK de Supabase y Next.js ya deberías tenerlos en el proyecto destino.

---

## Dependencias requeridas

```json
{
  "@google/genai": "^1.43.0",
  "openai": "^6.25.0",
  "@anthropic-ai/sdk": "^0.78.0"
}
```

---

## Flujo del sistema

```
Usuario escribe idea
        ↓
generateScript() [app/actions.ts]
        ↓
runBrainstormPipeline() [lib/pipeline/executor.ts]
        ↓
DeepSeek Reasoner — 1 sola llamada (~2 min)
Debate interno de 7 expertos → Guion campeón
        ↓
generateProductionPrompts() [lib/pipeline/production-prompts.ts]
        ↓ (DeepSeek Chat — 3 llamadas en paralelo)
 ┌──────────────────────────────────────┐
 │ videoPrompts │ voicePrompt │ musicPrompt │
 └──────────────────────────────────────┘
        ↓
saveFullPipelineAction() → Guarda en Supabase
        ↓
UI muestra guion + estilos visuales + sección de voz/música
```

---

## Autenticación

El pipeline usa el sistema de auth de Supabase. El `middleware.ts` protege la ruta `/` y redirige a `/login` si no hay sesión activa.

Si el proyecto destino ya tiene auth de Supabase configurado, puedes reutilizar esa lógica y omitir el `app/login/` del módulo.

---

## Notas importantes

- Los archivos `.md` en `/prompts/` son **el corazón del sistema**. Se cargan en runtime en cada generación. No los hardcodees.
- El `adn-activaqr.md` es el contexto permanente de ActivaQR inyectado en cada llamada a la IA.
- El pipeline NO llama directamente a APIs de video (Kling, Runway). Solo genera los prompts de texto.
- El TTS usa Gemini 2.5 Flash y convierte automáticamente el PCM a WAV para reproducción en el navegador.

---

*Expert Lens Pipeline™ · ActivaQR.com · Módulo exportable v1.0*
