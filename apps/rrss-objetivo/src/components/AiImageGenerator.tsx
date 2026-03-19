"use client";

import { useState } from "react";
import { Sparkles, Loader2, Image as ImageIcon, ChevronRight, Check } from "lucide-react";
import toast from "react-hot-toast";

interface Style {
  id: string;
  title: string;
  prompt: string;
  image: string;
}

const FEATURED_STYLES: Style[] = [
  {
    id: "style_49",
    title: "Fashion Magazine",
    prompt: "Photography style features high-definition detail and texture, resembling a fashion magazine cover. Minimalist background to highlight the subject.",
    image: "/video-styles/style_49_example_fashion_design_cover.png"
  },
  {
    id: "style_9",
    title: "Minimalist Futurist",
    prompt: "Minimalist futurist exhibition poster with ultra-light cool gray background. Silky glass-like appearance, softbox lighting, clean with generous whitespace.",
    image: "/video-styles/style_9_minimalist_futurist_poster.png"
  },
  {
    id: "style_17",
    title: "Retro CRT",
    prompt: "Retro CRT computer boot screen style, low-res aesthetic, glowing phosphors, vintage tech vibe.",
    image: "/video-styles/style_17_retro_crt_computer_boot_screen.png"
  },
  {
    id: "style_25",
    title: "Minimalist 3D",
    prompt: "Minimalist 3D Illustration, rounded edges, smooth and soft forms, soft gradients, diffused lighting, matte texture.",
    image: "/video-styles/style_25_example_minimalist_3d_toilet.png"
  },
  {
    id: "style_78",
    title: "Photorealistic Glass",
    prompt: "Photorealistic glass material, plain white background, centered, soft diffused studio lighting, clear reflections and transparency.",
    image: "/video-styles/style_78_example_retexture_glass_phone.png"
  }
];

interface AiImageGeneratorProps {
  initialPrompt: string;
  onImageUsed: (url: string) => void;
}

export default function AiImageGenerator({ initialPrompt, onImageUsed }: AiImageGeneratorProps) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [selectedStyle, setSelectedStyle] = useState<Style | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Ingresa un prompt para generar la imagen.");
      return;
    }

    setGenerating(true);
    setGeneratedUrl(null);

    const fullPrompt = selectedStyle 
      ? `${prompt}. Style: ${selectedStyle.prompt}`
      : prompt;

    try {
      const res = await fetch("/api/seo-image-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: fullPrompt })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setGeneratedUrl(data.imageUrl);
      toast.success("¡Imagen generada!");
    } catch (error: any) {
      toast.error(error.message || "Error al generar la imagen");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 bg-gradient-to-r from-purple-500/5 to-blue-500/5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl shadow-lg shadow-purple-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Generador AI Expert Lens</h2>
            <p className="text-xs text-neutral-500">Imágenes de ultra-alta calidad para tu blog.</p>
          </div>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto p-6 space-y-6 hide-scrollbar">
        {/* Prompt Input */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Base Prompt (Descripción)</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full h-24 p-4 text-sm bg-neutral-50 dark:bg-black/20 border border-neutral-200 dark:border-neutral-800 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500/30 resize-none transition-all"
            placeholder="Describe la imagen que deseas..."
          />
        </div>

        {/* Style Selector */}
        <div className="space-y-3">
          <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Selecciona un Estilo</label>
          <div className="grid grid-cols-2 gap-3">
            {FEATURED_STYLES.map((style) => (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(selectedStyle?.id === style.id ? null : style)}
                className={`relative group aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all ${
                  selectedStyle?.id === style.id 
                    ? 'border-purple-500 shadow-lg shadow-purple-500/20 scale-[0.98]' 
                    : 'border-transparent hover:border-neutral-200 dark:hover:border-neutral-700'
                }`}
              >
                <img src={style.image} alt={style.title} className="w-full h-full object-cover" />
                <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
                  selectedStyle?.id === style.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}>
                  <span className="text-[10px] font-bold text-white text-center px-2">{style.title}</span>
                  {selectedStyle?.id === style.id && (
                    <div className="absolute top-1 right-1 bg-purple-500 rounded-full p-0.5">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full py-4 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50"
        >
          {generating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Renderizando con FLUX...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generar Imagen <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Result Area */}
        {generatedUrl && (
          <div className="space-y-4 pt-4 border-t border-neutral-100 dark:border-neutral-800 animate-in fade-in zoom-in-95 duration-500">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl">
              <img src={generatedUrl} alt="Generated" className="w-full h-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <button
                  onClick={() => onImageUsed(generatedUrl)}
                  className="w-full py-2.5 bg-white text-black rounded-xl font-bold text-sm shadow-lg hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Usar como Portada
                </button>
              </div>
            </div>
            <p className="text-[10px] text-center text-neutral-500">Imagen guardada en tu CDN (Bunny.net/Supabase)</p>
          </div>
        )}
      </div>
    </div>
  );
}
