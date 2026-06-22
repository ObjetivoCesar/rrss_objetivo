/**
 * /api/analyze — Pipeline de Inteligencia de Competencia Viral
 *
 * Flujo: URL (IG/TT/YT) → yt-dlp (audio) → Groq Whisper (transcript) → Gemini 2.5 Pro (análisis) → Supabase
 *
 * Compatible: Windows (usa os.tmpdir()), desarrollo local sin Vercel.
 * Requiere: yt-dlp instalado globalmente (`pip install yt-dlp`)
 */

import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { createClient } from "@supabase/supabase-js";

// Runtime: Node.js (necesario para child_process y fs)
export const runtime = "nodejs";
export const maxDuration = 120; // 2 minutos — yt-dlp puede tardar

const execAsync = promisify(exec);

// ─── Clientes ─────────────────────────────────────────────────────────────────

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const GROQ_API_KEY = process.env.GROQ_API_KEY!;

// Rotación de keys para evitar cuota (5 keys configuradas en .env)
const GOOGLE_API_KEYS = [
  process.env.GOOGLE_AI_API_KEY,
  process.env.GOOGLE_AI_API_KEY_2,
  process.env.GOOGLE_AI_API_KEY_3,
  process.env.GOOGLE_AI_API_KEY_4,
  process.env.GOOGLE_AI_API_KEY_5,
].filter(Boolean) as string[];

// gemini-2.5-flash: tier gratuito activo. gemini-2.5-pro requiere billing.
const GEMINI_MODEL = "gemini-2.5-flash";

// ─── Prompt de análisis viral ─────────────────────────────────────────────────

const ANALYSIS_PROMPT = (transcript: string) => `Eres un estratega de contenido viral especializado en habla hispana. Analizas videos para César Reyes Jaramillo, Constructor de Sistemas Autónomos en Ecuador. Su audiencia son dueños de pymes ecuatorianas que gerencian sin dirección, responden 100 mensajes para vender 3 o 4 productos, y pagan costos ocultos que no ven.

Sus nichos de contenido son automatización de negocios con IA, identidad digital para pymes, sistemas que liberan al dueño del operativo diario, y criterio estratégico aplicado.

Su tono es como una conversación en una mesa de café donde un amigo te dice la verdad sin endulzarla. Directo, cercano, práctico, sin lenguaje corporativo vacío, sin promesas milagrosas.

Vas a recibir la transcripción de un Reel, TikTok o YouTube Short. Tu trabajo es hacer ingeniería inversa completa del contenido para entender por qué funciona y cómo replicar su mecánica en los nichos de César.

Devuelve ÚNICAMENTE un JSON válido con esta estructura exacta, sin texto adicional antes ni después, sin bloques de código markdown:

{
  "hook": "transcripción exacta de las primeras 1 a 3 frases del video",
  "hook_type": "shock, contradicción, error_común, secreto, historia, prueba_social, autoridad, resultado_extremo, miedo u oportunidad",
  "psychological_pattern": "mecanismo psicológico principal en una oración",
  "curiosity_gap": "pregunta que queda abierta en la mente del espectador",
  "narrative_structure": {
    "opening": "qué establece en los primeros 3 segundos",
    "development": "cómo desarrolla la promesa del hook",
    "climax": "momento de mayor tensión o revelación",
    "close": "cómo cierra y qué emoción o acción deja"
  },
  "retention_mechanisms": [
    "mecanismo 1",
    "mecanismo 2",
    "mecanismo 3"
  ],
  "psychological_triggers": {
    "curiosidad": 0,
    "miedo": 0,
    "estatus": 0,
    "deseo": 0,
    "dolor": 0,
    "urgencia": 0
  },
  "viral_dna": {
    "primary_emotion": "emoción dominante que genera el video",
    "cognitive_bias": "sesgo cognitivo que aprovecha",
    "share_trigger": "por qué alguien lo compartiría",
    "save_trigger": "por qué alguien lo guardaría",
    "comment_trigger": "qué provocaría que alguien comente",
    "algorithm_signals": "comportamientos del usuario que el algoritmo premia"
  },
  "viral_formula": "fórmula reutilizable en formato: TIPO_HOOK + PROMESA + MECANISMO + CIERRE",
  "thumbnail_cover": {
    "composition": "descripción de la composición visual: posición del sujeto, fondo, encuadre",
    "text_overlay": {
      "present": true,
      "content": "texto exacto que aparece superpuesto en la portada",
      "typography_style": "tamaño relativo, peso, color, estilo (cursiva, caps, etc.)",
      "position": "dónde está ubicado el texto en pantalla: arriba centro, abajo izquierda, etc."
    },
    "subject": "quién aparece y cómo (expresión facial, postura, ropa notable)",
    "color_palette": ["color dominante 1", "color dominante 2", "color de acento"],
    "emotion_conveyed": "emoción que transmite la portada antes de que el usuario haga clic",
    "click_trigger": "por qué esta portada detiene el scroll y provoca el clic",
    "replication_notes": "instrucciones concretas para replicar esta portada adaptada a César: qué expresión hacer, qué texto poner, qué fondo usar"
  },
  "cesar_adaptations": {
    "automatizacion": "cómo aplicar esta mecánica para hablar de automatización de negocios o WhatsApp sin depender del dueño",
    "criterio": "cómo aplicar esta mecánica para posicionar el mensaje no vendo información vendo criterio",
    "activaqr": "cómo aplicar esta mecánica para ActivaQR hablando de identidad digital o auditoría operativa"
  },
  "hook_variations": {
    "aggressive": [
      "variación directa y provocadora",
      "variación 2",
      "variación 3"
    ],
    "emotional": [
      "variación emocional cercana",
      "variación 2",
      "variación 3"
    ],
    "authority": [
      "variación basada en resultado concreto",
      "variación 2",
      "variación 3"
    ]
  },
  "why_viral": "explicación en máximo 3 oraciones de por qué este contenido tiene potencial viral",
  "replication_score": 0
}

Los valores de psychological_triggers van del 0 al 10. El replication_score también del 0 al 10 e indica qué tan fácil es replicar esta mecánica en los nichos de César. Si la transcripción está vacía o tiene menos de 20 palabras devuelve todos los campos vacíos y agrega un campo error con la descripción del problema. La transcripción es: ${transcript}`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Extrae JSON de un string aunque venga con texto antes/después */
function extractJSON(text: string): object {
  // Intento directo
  try {
    return JSON.parse(text);
  } catch {
    // Buscar bloque JSON entre la primera { y la última }
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
    throw new Error("No se encontró JSON válido en la respuesta del modelo");
  }
}

// ─── Handler principal ────────────────────────────────────────────────────────

export async function POST(req: Request) {
  // Archivo temporal (se limpia al final)
  let audioPath: string | null = null;

  try {
    // ── PASO 1: Validar body ────────────────────────────────────────────────
    let body: { url?: string; customPrompt?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { stage: "validation", error: "Body inválido — se esperaba JSON con { url, customPrompt }" },
        { status: 400 }
      );
    }

    const { url, customPrompt } = body;
    if (!url || typeof url !== "string" || !url.startsWith("http")) {
      return NextResponse.json(
        { stage: "validation", error: "URL inválida o ausente" },
        { status: 400 }
      );
    }

    // Verificar API keys necesarias
    if (!GROQ_API_KEY) {
      return NextResponse.json(
        { stage: "config", error: "GROQ_API_KEY no configurada en el servidor" },
        { status: 500 }
      );
    }
    if (GOOGLE_API_KEYS.length === 0) {
      return NextResponse.json(
        { stage: "config", error: "GOOGLE_AI_API_KEY no configuradas en el servidor (.env)" },
        { status: 500 }
      );
    }

    // ── PASO 2: Descargar audio con yt-dlp ──────────────────────────────────
    const timestamp = Date.now();
    // os.tmpdir() resuelve correctamente en Windows (C:\Users\...\AppData\Local\Temp)
    const outputTemplate = path.join(os.tmpdir(), `viral_${timestamp}.%(ext)s`);

    let downloadedExtension = "m4a";
    try {
      const ytdlpCmd = `yt-dlp -x --audio-format m4a --audio-quality 0 --no-playlist -o "${outputTemplate}" "${url}"`;
      await execAsync(ytdlpCmd, { timeout: 90_000 });
      audioPath = path.join(os.tmpdir(), `viral_${timestamp}.m4a`);

      // Verificar que el archivo existe (yt-dlp puede renombrarlo)
      if (!fs.existsSync(audioPath)) {
        // Buscar cualquier archivo con ese timestamp
        const tmpFiles = fs.readdirSync(os.tmpdir()).filter((f) =>
          f.startsWith(`viral_${timestamp}`)
        );
        if (tmpFiles.length > 0) {
          audioPath = path.join(os.tmpdir(), tmpFiles[0]);
          downloadedExtension = path.extname(tmpFiles[0]).replace(".", "");
        } else {
          throw new Error("yt-dlp no generó ningún archivo de audio");
        }
      }
    } catch (err: any) {
      // Limpiar si existe
      if (audioPath && fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
      return NextResponse.json(
        {
          stage: "download_failed",
          error: "No se pudo descargar el audio. Verifica que yt-dlp esté instalado (`pip install yt-dlp`) y que la URL sea válida.",
          detail: err.message,
        },
        { status: 422 }
      );
    }

    // ── PASO 3: Transcribir con Groq Whisper ────────────────────────────────
    let transcript: string;
    try {
      const audioBuffer = fs.readFileSync(audioPath);
      const audioBlob = new Blob([audioBuffer], { type: `audio/${downloadedExtension}` });

      const formData = new FormData();
      formData.append("file", audioBlob, `audio.${downloadedExtension}`);
      formData.append("model", "whisper-large-v3");
      formData.append("language", "es");

      const groqResponse = await fetch(
        "https://api.groq.com/openai/v1/audio/transcriptions",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${GROQ_API_KEY}` },
          body: formData,
        }
      );

      if (!groqResponse.ok) {
        const errData = await groqResponse.json();
        throw new Error(errData?.error?.message || `Groq respondió ${groqResponse.status}`);
      }

      const groqData = await groqResponse.json();
      transcript = groqData.text;

      if (!transcript || transcript.trim().length < 10) {
        throw new Error("La transcripción está vacía. El audio puede no tener voz en español.");
      }
    } catch (err: any) {
      if (audioPath && fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
      return NextResponse.json(
        {
          stage: "transcription_failed",
          error: "Error al transcribir el audio con Groq Whisper.",
          detail: err.message,
        },
        { status: 502 }
      );
    }

    // ── PASO 4 + 5: Analizar con Gemini Pro + parsear JSON/Texto ────────────
    let analysis: object | null = null;
    let rawAnalysis = "";
    let geminiError: any = null;

    // Construir el prompt dinámicamente según si es un análisis estructurado o libre
    const promptText = customPrompt
      ? `Eres un asistente de inteligencia artificial experto en marketing, negocios y copy. César Reyes Jaramillo te ha proporcionado la transcripción de un video y te ha dado esta instrucción específica para interpretarlo:\n\n"${customPrompt}"\n\nAnaliza la transcripción basándote estrictamente en esa instrucción. La transcripción es:\n\n${transcript}`
      : ANALYSIS_PROMPT(transcript);

    for (let i = 0; i < GOOGLE_API_KEYS.length; i++) {
      const apiKey = GOOGLE_API_KEYS[i];
      try {
        console.log(`Intentando analizar con Gemini usando la Key ${i + 1} (Modo: ${customPrompt ? "Personalizado" : "Estándar"})...`);
        
        const reqBody: any = {
          contents: [{
            role: "user",
            parts: [{ text: promptText }]
          }],
          generationConfig: {
            temperature: 0,
          }
        };

        // Solo forzar JSON en modo estándar
        if (!customPrompt) {
          reqBody.generationConfig.responseMimeType = "application/json";
        }

        const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(reqBody),
        });

        if (!geminiResponse.ok) {
          const errData = await geminiResponse.json();
          const errMsg = errData?.error?.message || `Gemini respondió ${geminiResponse.status}`;
          console.warn(`Key ${i + 1} falló: ${errMsg}`);
          throw new Error(errMsg);
        }

        const geminiData = await geminiResponse.json();
        rawAnalysis = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

        if (!rawAnalysis) {
          throw new Error("Gemini devolvió una respuesta vacía");
        }

        if (customPrompt) {
          // En modo personalizado, la respuesta es texto libre (Markdown)
          analysis = { custom_analysis: rawAnalysis };
        } else {
          // Parsear JSON en modo estándar
          analysis = extractJSON(rawAnalysis);
        }
        console.log(`¡Éxito con la Key ${i + 1}!`);
        break; // Romper el loop si se tiene éxito
      } catch (err: any) {
        geminiError = err;
        console.error(`Error con la Key ${i + 1}:`, err.message);
        // Continúa al siguiente key
      }
    }

    if (!analysis) {
      if (audioPath && fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
      return NextResponse.json(
        {
          stage: "analysis_failed",
          error: "Error al analizar la transcripción con Gemini después de intentar con todas las API Keys.",
          detail: geminiError?.message || "Sin detalles",
        },
        { status: 502 }
      );
    }

    // ── PASO 6: Guardar en Supabase ─────────────────────────────────────────
    let savedRecord: any;
    try {
      const a = analysis as any;
      const { data, error } = await supabase
        .from("viral_analyses")
        .insert({
          url,
          transcript,
          hook: a.hook || null,
          hook_type: a.hook_type || null,
          psychological_pattern: a.psychological_pattern || null,
          curiosity_gap: a.curiosity_gap || null,
          narrative_structure: a.narrative_structure || null,
          retention_mechanisms: a.retention_mechanisms || null,
          psychological_triggers: a.psychological_triggers || null,
          viral_dna: a.viral_dna || null,
          viral_formula: a.viral_formula || null,
          thumbnail_cover: a.thumbnail_cover || null,
          cesar_adaptations: customPrompt ? { custom_analysis: a.custom_analysis } : a.cesar_adaptations || null,
          hook_variations: a.hook_variations || null,
          why_viral: customPrompt ? "Análisis Personalizado" : a.why_viral || null,
          replication_score: a.replication_score || null,
          model_used: GEMINI_MODEL,
        })
        .select()
        .single();

      if (error) throw error;
      savedRecord = data;
    } catch (err: any) {
      if (audioPath && fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
      return NextResponse.json(
        {
          stage: "save_failed",
          error: "El análisis fue exitoso pero falló el guardado en Supabase.",
          detail: err.message,
          // Devolvemos el análisis de todos modos para no perderlo
          analysis,
          transcript,
        },
        { status: 207 }
      );
    }

    // ── PASO 7: Limpiar audio y devolver resultado ──────────────────────────
    if (audioPath && fs.existsSync(audioPath)) {
      fs.unlinkSync(audioPath);
    }

    return NextResponse.json({
      success: true,
      id: savedRecord.id,
      url,
      transcript,
      analysis,
      saved_at: savedRecord.created_at,
    });
  } catch (err: any) {
    // Catch-all — limpiar temp file si quedó
    if (audioPath && fs.existsSync(audioPath)) {
      try { fs.unlinkSync(audioPath); } catch {}
    }
    console.error("[/api/analyze] Error inesperado:", err);
    return NextResponse.json(
      {
        stage: "unexpected",
        error: "Error interno inesperado.",
        detail: err.message,
      },
      { status: 500 }
    );
  }
}
