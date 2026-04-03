"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Sparkles, RotateCcw, Wand2, Image as ImageIcon,
  Check, Save, Loader2, X, Plus, Zap, Link as LinkIcon, Copy
} from "lucide-react";
import { useState, useEffect } from "react";
import { IMAGE_STYLES, ImageStyle } from "@/lib/ai/images/styles";
import { POST_TYPES, PLATFORMS } from "@/lib/ai/prompts";
import toast from "react-hot-toast";
import AiImageGenerator from "@/components/AiImageGenerator";
import MediaUploader from "@/components/MediaUploader";

// ─── Types ────────────────────────────────────────────────────────────────────
interface MixItem {
  id: string; // categoryId|platform
  categoryId: string;
  platform: string;
}

interface CarouselSlide {
  slideNumber: number;
  copy: string;
  imagePrompt: string;
  mediaUrl?: string;
}

interface GeneratedPost {
  content: string;
  categoryId: string;
  platform: string;
  style: ImageStyle;
  mediaUrls: string[];
  selectedMediaUrl: string;
  saved: boolean;
  imagePrompt: string;
  carouselSlides?: CarouselSlide[];
  node_id?: string | null; // Origin node from Planner
  scheduled_for?: string | null; // Manual override
}

// ─── Step Labels ──────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Setup" },
  { id: 2, label: "Mix" },
  { id: 3, label: "Generar" },
  { id: 4, label: "Resultado" },
];

function StepBar({ current, bridgeMode = false }: { current: number, bridgeMode?: boolean }) {
  const stepsToUse = bridgeMode ? [
    { id: 1, label: "Configurar" },
    { id: 2, label: "Omitido" },
    { id: 3, label: "Omitido" },
    { id: 4, label: "Editar y Guardar" },
  ] : STEPS;

  return (
    <div className="flex items-center gap-0 mb-8">
      {stepsToUse.map((step, i) => {
        const done = current > step.id;
        const active = current === step.id;
        return (
          <div key={step.id} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 text-xs font-bold transition-all ${
                done ? "bg-purple-600 border-purple-600 text-white"
                : active ? "bg-neutral-900 border-purple-500 text-purple-400"
                : "bg-neutral-900 border-neutral-700 text-neutral-600"
              }`}>
                {done ? <Check className="w-3.5 h-3.5" /> : step.id}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${
                active ? "text-purple-400" : done ? "text-purple-600" : "text-neutral-600"
              }`}>{step.label}</span>
            </div>
            {i < stepsToUse.length - 1 && (
              <div className={`flex-1 h-0.5 mb-5 mx-1 transition-all ${done ? "bg-purple-600" : "bg-neutral-800"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Platform Badge ───────────────────────────────────────────────────────────
function PlatformBadge({ platformId, size = 'sm' }: { platformId: string; size?: 'xs' | 'sm' }) {
  const p = PLATFORMS.find(p => p.id === platformId);
  if (!p) return null;
  return (
    <span className={`inline-flex items-center gap-1 font-bold rounded-full ${
      size === 'xs' ? 'text-[9px] px-1.5 py-0.5' : 'text-[10px] px-2 py-1'
    } border ${p.colorBorder} ${p.colorText}`}>
      {p.emoji} {p.name}
    </span>
  );
}

function LinkCard({ url }: { url: string }) {
  let domain = "";
  try { domain = new URL(url).hostname; } catch (e) { domain = url; }
  
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden aspect-[16/9] flex flex-col items-center justify-center p-6 text-center group cursor-pointer hover:border-purple-500/50 transition-colors">
      <div className="bg-neutral-800/50 p-4 rounded-full mb-3 group-hover:scale-110 transition-transform">
        <LinkIcon className="w-8 h-8 text-neutral-500 group-hover:text-purple-400" />
      </div>
      <p className="text-sm font-bold text-white mb-1 uppercase tracking-tight truncate max-w-full">Vista Previa de Enlace</p>
      <p className="text-[10px] text-neutral-500 font-mono mb-4">{domain}</p>
      <div className="px-4 py-1.5 bg-neutral-800 text-[10px] font-black text-white rounded-full uppercase tracking-tighter group-hover:bg-purple-600 transition-colors">
        Ver Artículo Completo
      </div>
    </div>
  );
}

// ## Opción "Sin Imagen" (Toggle Explícito)
// Para mayor claridad, he añadido un interruptor (switch) directo en el Step 1:
// - **Toggle "Generar Imágenes con AI"**: Ahora puedes activar o desactivar la generación de imágenes para todo el lote con un solo clic.
// - **Simplificación**: Si desactivas el toggle, el selector de estilos desaparece para evitar confusiones, y el sistema se prepara para generar solo texto (artículos).
// - **Lectura Mejorada**: En el paso final, si un post no tiene imagen, el texto se expande automáticamente ocupando todo el ancho de la tarjeta.

// ## Fix de Layout: Selectores de Campaña
// - **Orden Vertical**: Los selectores de "Objetivo" y "Campaña" ahora están apilados verticalmente de forma fija, eliminando cualquier solapamiento visual que pudiera ocurrir en diferentes tamaños de pantalla.

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function EditorPage() {
  const [step, setStep] = useState<number>(1);

  // ── Step 1: Setup ──
  const [targetMonth, setTargetMonth] = useState("Marzo");
  const [topic, setTopic] = useState("Restaurantes y Locales Físicos");
  const [centralIdea, setCentralIdea] = useState("");
  const [selectedStyle, setSelectedStyle] = useState<ImageStyle>(IMAGE_STYLES[0]);
  const [useBranding, setUseBranding] = useState(true);

  // Campaign Management State
  const [objectives, setObjectives] = useState<any[]>([]);
  const [selectedObjId, setSelectedObjId] = useState<string>("");
  const [selectedCampId, setSelectedCampId] = useState<string>("");
  const [donnaBanner, setDonnaBanner] = useState<string | null>(null); // Mensaje Jarvis
  const [showImageGen, setShowImageGen] = useState(false);
  const [activePostForImage, setActivePostForImage] = useState<number | null>(null);
  const [includeImages, setIncludeImages] = useState(true);
  const [isCarouselMode, setIsCarouselMode] = useState(false);
  const [manualMediaUrls, setManualMediaUrls] = useState<string[]>([]);
  const [externalLink, setExternalLink] = useState("");
  const [carouselSlides, setCarouselSlides] = useState(6);

  // 🌉 Bridge Configurator State
  const [bridgeMode, setBridgeMode] = useState(false);
  const [bridgeData, setBridgeData] = useState<any>(null);
  const [bridgeFormat, setBridgeFormat] = useState<'simple' | 'carousel' | 'text-only'>('simple');
  const [bridgeMediaStrategy, setBridgeMediaStrategy] = useState<'ai' | 'upload' | 'gallery' | 'none'>('ai');
  const [bridgePlatform, setBridgePlatform] = useState<string>('instagram');

  useEffect(() => {
    fetch("/api/campaigns")
      .then(res => res.json())
      .then(data => {
        if (!data.error) setObjectives(data);
      })
      .catch(console.error);
  }, []);

  // 🌉 THE BRIDGE: Escuchar el evento de Donna para pre-llenar el editor
  useEffect(() => {
    const handleDonnaPilot = (e: Event) => {
      const payload = (e as CustomEvent).detail as {
        central_idea: string;
        objective_id?: string | null;
        campaign_id?: string | null;
        target_month?: string;
        suggested_platforms?: string[];
      };

      // Hidrata los campos del Step 1
      if (payload.central_idea) setCentralIdea(payload.central_idea);
      if (payload.target_month) setTargetMonth(payload.target_month);
      if (payload.objective_id) setSelectedObjId(payload.objective_id);
      if (payload.campaign_id) setSelectedCampId(payload.campaign_id);
      if (payload.suggested_platforms?.[0]) setActivePlatform(payload.suggested_platforms[0]);

      // Mostrar banner de confirmación
      setDonnaBanner(payload.central_idea);
      toast.success('🤖 Donna activó el Editor. Contexto precargado.', { duration: 4000 });
    };

    window.addEventListener('donna-pilot-editor', handleDonnaPilot);
    return () => window.removeEventListener('donna-pilot-editor', handleDonnaPilot);
  }, []);

  // ── 🌉 THE BRIDGE: Hidratación desde el Planner
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('source') === 'planner') {
      const bridgeDataRaw = localStorage.getItem('rrss_content_bridge');
      if (bridgeDataRaw) {
        try {
          const storedData = JSON.parse(bridgeDataRaw);
          setBridgeData(storedData);
          setBridgeMode(true);
          
          if (storedData.objective_id) setSelectedObjId(storedData.objective_id);
          if (storedData.campaign_id) setSelectedCampId(storedData.campaign_id);
          if (storedData.target_month) setTargetMonth(storedData.target_month);
          if (storedData.suggested_platforms?.[0]) setBridgePlatform(storedData.suggested_platforms[0]);
          
          setStep(1); // Mantenemos en el Step 1 para que configure
          toast.success('🌉 Estrategia importada. Por favor, configura el formato del post.');
          
          // Limpiar para evitar recargas molestas
          localStorage.removeItem('rrss_content_bridge');
          window.history.replaceState({}, '', window.location.pathname);
        } catch (e) {
          console.error("Bridge Error:", e);
        }
      }
    }
  }, []);

  // Modals for inline creation
  const [showObjModal, setShowObjModal] = useState(false);
  const [showCampModal, setShowCampModal] = useState(false);
  const [newObj, setNewObj] = useState({ name: "", description: "", emoji: "🎯", color: "#6366f1" });
  const [newCamp, setNewCamp] = useState({ name: "", description: "" });

  async function handleCreateObjective(e: React.FormEvent) {
    e.preventDefault();
    if (!newObj.name) return;
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "objective", ...newObj }),
      });
      if (!res.ok) throw new Error("Error creando objetivo");
      
      const newObjRes = await fetch("/api/campaigns").then(r => r.json());
      setObjectives(newObjRes);
      const created = newObjRes.find((o: any) => o.name === newObj.name);
      if (created) setSelectedObjId(created.id);
      
      toast.success("Objetivo creado");
      setShowObjModal(false);
      setNewObj({ name: "", description: "", emoji: "🎯", color: "#6366f1" });
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function handleCreateCampaign(e: React.FormEvent) {
    e.preventDefault();
    if (!newCamp.name || !selectedObjId) return;
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "campaign", objective_id: selectedObjId, ...newCamp }),
      });
      if (!res.ok) throw new Error("Error creando campaña");
      
      const newObjRes = await fetch("/api/campaigns").then(r => r.json());
      setObjectives(newObjRes);
      const parentObj = newObjRes.find((o: any) => o.id === selectedObjId);
      const created = parentObj?.campaigns?.find((c: any) => c.name === newCamp.name);
      if (created) setSelectedCampId(created.id);
      
      toast.success("Campaña creada");
      setShowCampModal(false);
      setNewCamp({ name: "", description: "" });
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  // ── Step 2: Mix (Platform × Category) ──
  const [mixItems, setMixItems] = useState<MixItem[]>([]);
  const [activePlatform, setActivePlatform] = useState("instagram");
  const [activeCategory, setActiveCategory] = useState("educativo");

  const MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const NICHES = [
    "Restaurantes y Locales Físicos",
    "Profesionales Independientes",
    "B2B y Servicios Corporativos",
    "Consultores y Agencias",
  ];

  function addToMix() {
    const newItem: MixItem = {
      id: `${activeCategory}|${activePlatform}|${Date.now()}`,
      categoryId: activeCategory,
      platform: activePlatform,
    };
    setMixItems(prev => [...prev, newItem]);
  }

  function removeFromMix(id: string) {
    setMixItems(prev => prev.filter(item => item.id !== id));
  }

  // ── Step 3: Generate ──
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPost[]>([]);

  async function handleGenerate() {
    if (mixItems.length === 0) { toast.error("Agrega al menos un post al mix."); return; }
    if (!centralIdea.trim()) { toast.error("Escribe la idea central."); return; }
    setIsGenerating(true);
    setGeneratedPosts([]);

    const ideaWithBranding = centralIdea + (useBranding ? " | INTEGRAR LOGO: Incluir el logo de la marca 'Objetivo' de forma muy sutil y natural en el ambiente (como un letrero, etiqueta o detalle del fondo)." : "");

    const selectedObjective = objectives.find(o => o.id === selectedObjId);
    const selectedCampaign = selectedObjective?.campaigns?.find((c: any) => c.id === selectedCampId);

    try {
      const res = await fetch("/api/ai/generate-bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: ideaWithBranding,
          targetMonth,
          topic,
          style: selectedStyle,
          mixItems: mixItems.map(m => ({ categoryId: m.categoryId, platform: m.platform })),
          objectiveContext: selectedObjective ? `${selectedObjective.name}: ${selectedObjective.description}` : null,
          campaignStrategy: selectedCampaign ? `${selectedCampaign.name}: ${selectedCampaign.description}` : null,
          carouselSlides,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error en generación");

      const results: GeneratedPost[] = data.posts.map((p: any, idx: number) => {
        const isNoImage = !includeImages || selectedStyle.id === 'no-image';
        
        // NO FALLBACK: Use the AI's prompt or empty if not provided/wanted
        const safePrompt = isNoImage ? "" : (p.imagePrompt || "").substring(0, 1000);
        
        let variants: string[] = [];
        // If we have manual images for a carousel, use those instead of AI variants
        if (isCarouselMode && manualMediaUrls.length > 0) {
          variants = manualMediaUrls;
        } else if (!isNoImage && safePrompt) {
          variants = [1, 2, 3].map(() => {
            const seed = Math.floor(Math.random() * 1000000);
            return `/api/ai/image-proxy?prompt=${encodeURIComponent(safePrompt)}&seed=${seed}`;
          });
        }

        // Use platform/category from mix item if AI didn't return it
        const mixRef = mixItems[idx];
        const finalMediaUrls = variants;
        const finalSelectedMediaUrl = (isNoImage && externalLink.trim()) ? externalLink.trim() : (variants[0] || "");

        return {
          content: p.content,
          categoryId: p.categoryId || mixRef?.categoryId || "educativo",
          platform: p.platform || mixRef?.platform || "instagram",
          style: isNoImage ? IMAGE_STYLES.find(s => s.id === 'no-image') || selectedStyle : selectedStyle,
          mediaUrls: finalMediaUrls,
          selectedMediaUrl: finalSelectedMediaUrl,
          saved: false,
          imagePrompt: safePrompt,
          carouselSlides: p.carouselSlides || [],
          node_id: p.node_id || null,
          scheduled_for: null,
        };
      });

      setGeneratedPosts(results);
      setStep(4);
    } catch (err: any) {
      toast.error(err.message || "Error al generar.");
      setStep(2);
    } finally {
      setIsGenerating(false);
    }
  }

  // ── Step 4: Save ──
  async function savePost(idx: number) {
    const post = generatedPosts[idx];
    if (!post || post.saved) return;
    try {
      
      const slidePhotos = (post.carouselSlides && post.carouselSlides.length > 0) 
            ? post.carouselSlides.map(s => s.mediaUrl).filter(Boolean) as string[]
            : [];
            
      // Si el carrusel no tiene fotos por slide pero sí subió en bulk (manualMediaUrls)
      const finalMediaUrls = slidePhotos.length > 0 ? slidePhotos : (isCarouselMode && manualMediaUrls.length > 0 ? manualMediaUrls : [post.selectedMediaUrl]);

      const res = await fetch("/api/posts/save-ai-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: post.content,
          targetMonth,
          topic,
          platforms: [post.platform],
          categoryId: post.categoryId,
          media_urls: finalMediaUrls,
          campaign_id: selectedCampId || null,
          objective_id: selectedObjId || null,
          scheduled_for: post.scheduled_for || null,
          metadata: {
            node_id: post.node_id || null,
            source: post.node_id ? 'planner' : 'editor'
          }
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar");
      toast.success(`Post guardado en Borradores (Base de Datos) ✓`, { duration: 4000 });
      setGeneratedPosts(prev => prev.map((p, i) => i === idx ? { ...p, saved: true } : p));
    } catch {
      toast.error("No se pudo guardar el post");
    }
  }

  async function saveAll() {
    for (let i = 0; i < generatedPosts.length; i++) {
      if (!generatedPosts[i].saved) await savePost(i);
    }
  }

  const catName = (id: string) => POST_TYPES.find(t => t.id === id)?.name ?? id;

  // ─── UI ───────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto pb-20">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white drop-shadow-sm flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-500 dark:text-purple-400" />
            Generador de Contenido
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 font-medium">
            Copy nativo por plataforma — Instagram, Facebook, LinkedIn, TikTok, YouTube
          </p>
        </div>

        <StepBar current={step} bridgeMode={bridgeMode} />

        {/* ── STEP 1: SETUP ─────────────────────────────────────────────────── */}
        {step === 1 && (
          <div className="bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-xl shadow-black/5 dark:shadow-black/20 rounded-3xl p-8 space-y-6">

            {bridgeMode ? (
              <div className="space-y-8 animate-in fade-in zoom-in duration-500">
                <div>
                  <h2 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-emerald-500" />
                    Importando desde Strategy Planner
                  </h2>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 font-medium">
                    Has enviado un nodo estratégico ({bridgeData?.target_month || 'Estrategia'}). Configura el contenedor visual.
                  </p>
                </div>

                {/* 1. FORMATO */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-neutral-400 uppercase tracking-wide">1. Formato Principal</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      { id: 'simple', label: 'Post Simple', desc: '1 Imagen o Link', icon: ImageIcon },
                      { id: 'carousel', label: 'Carrusel', desc: 'Múltiples Láminas', icon: Copy },
                      { id: 'text-only', label: 'Solo Texto', desc: 'Sin archivo multimedia', icon: LinkIcon }
                    ].map(f => (
                      <button key={f.id} onClick={() => setBridgeFormat(f.id as any)}
                        className={`p-4 rounded-2xl border-2 text-left transition-all ${bridgeFormat === f.id ? "bg-emerald-500/10 border-emerald-500" : "bg-neutral-900/50 border-neutral-800 hover:border-neutral-700"}`}
                      >
                        <f.icon className={`w-6 h-6 mb-2 ${bridgeFormat === f.id ? "text-emerald-400" : "text-neutral-500"}`} />
                        <h4 className={`font-bold ${bridgeFormat === f.id ? "text-emerald-100" : "text-neutral-300"}`}>{f.label}</h4>
                        <p className="text-xs text-neutral-500 mt-1">{f.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* OPCIONAL: NÚMERO DE LÁMINAS SI ES CARRUSEL */}
                {bridgeFormat === 'carousel' && (
                  <div className="space-y-3 p-4 bg-neutral-900/50 border border-amber-500/30 rounded-2xl">
                    <label className="text-xs font-bold text-amber-500 uppercase tracking-wide">Configurar Carrusel</label>
                    <div className="flex items-center gap-4">
                      <select value={carouselSlides} onChange={e => setCarouselSlides(Number(e.target.value))}
                        className="bg-neutral-950 border border-amber-500/40 rounded-xl px-4 py-2 text-sm font-black text-amber-400 focus:outline-none"
                      >
                        {[2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n} Láminas</option>)}
                      </select>
                      <p className="text-[10px] text-neutral-400">Las láminas se generarán vacías para que ingreses el texto e imagen de cada una.</p>
                    </div>
                  </div>
                )}

                {/* 2. PLATAFORMA */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-neutral-400 uppercase tracking-wide">2. Red Social Principal</label>
                  <div className="flex flex-wrap gap-2">
                    {PLATFORMS.map(p => {
                      const isDisabled = bridgeFormat === 'carousel' && !['instagram', 'facebook', 'linkedin'].includes(p.id);
                      return (
                        <button key={p.id} onClick={() => !isDisabled && setBridgePlatform(p.id)} disabled={isDisabled}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all border ${
                            isDisabled ? 'bg-neutral-900 border-neutral-800 opacity-40' :
                            bridgePlatform === p.id ? "bg-emerald-600 border-emerald-500 text-white" : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-600"
                          }`}
                        >
                          <span>{p.emoji}</span> {p.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. MEDIA STRATEGY (Si no es solo texto) */}
                {bridgeFormat !== 'text-only' && (
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-neutral-400 uppercase tracking-wide">3. Estrategia Visual (Multimedia)</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        { id: 'ai', label: '✨ Generar con Inteligencia Artificial', desc: 'Donna aplicará el ADN de marca' },
                        { id: 'upload', label: '📤 Ya tengo mis propias imágenes', desc: 'Las subiré en el siguiente paso' }
                      ].map(s => (
                        <button key={s.id} onClick={() => setBridgeMediaStrategy(s.id as any)}
                          className={`px-4 py-3 rounded-xl border transition-all text-left ${bridgeMediaStrategy === s.id ? "bg-blue-500/10 border-blue-500" : "bg-neutral-900 border-neutral-800"}`}
                        >
                          <h4 className={`text-sm font-bold ${bridgeMediaStrategy === s.id ? "text-blue-300" : "text-neutral-400"}`}>{s.label}</h4>
                          <p className="text-[10px] text-neutral-500 mt-0.5">{s.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* SI ES IA, SELECCIONAR ESTILO */}
                {bridgeFormat !== 'text-only' && bridgeMediaStrategy === 'ai' && (
                  <div className="space-y-3 p-4 bg-neutral-900/50 border border-neutral-800 rounded-2xl">
                    <label className="text-xs font-bold text-neutral-400 uppercase tracking-wide">Elegir Estilo Visual</label>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                       {IMAGE_STYLES.map((style) => (
                         <button key={style.id} onClick={() => setSelectedStyle(style)}
                           className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                             selectedStyle.id === style.id ? "border-purple-500" : "border-transparent"
                           }`}
                         >
                           <img src={style.previewUrl} alt={style.name} className="w-full h-full object-cover" />
                           <div className="absolute bottom-0 inset-x-0 bg-black/60 p-1 pb-1.5 text-[9px] text-white font-bold leading-tight">{style.name}</div>
                         </button>
                       ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-4 border-t border-neutral-800">
                  <button onClick={() => {
                    const bridgePost: GeneratedPost = {
                      content: bridgeData?.content || "",
                      categoryId: bridgeFormat === 'carousel' ? 'carrusel' : 'educativo',
                      platform: bridgePlatform,
                      style: bridgeMediaStrategy === 'ai' ? selectedStyle : IMAGE_STYLES[0],
                      mediaUrls: [],
                      selectedMediaUrl: "",
                      saved: false,
                      imagePrompt: "",
                      carouselSlides: bridgeFormat === 'carousel' ? Array.from({length: carouselSlides}).map((_, i) => ({
                        slideNumber: i + 1,
                        copy: i === 0 ? (bridgeData?.content || "Contenido slide 1") : "Contenido slide " + (i+1),
                        imagePrompt: ""
                      })) : [],
                      node_id: bridgeData?.node_id || null,
                      scheduled_for: null
                    };
                    
                    // Asegurar flags correctos para el editor
                    setIncludeImages(bridgeFormat !== 'text-only');
                    if (bridgeFormat === 'text-only') {
                      bridgePost.style = IMAGE_STYLES.find(s => s.id === 'no-image') || bridgePost.style;
                    }
                    
                    setGeneratedPosts([bridgePost]);
                    setIsCarouselMode(bridgeFormat === 'carousel');
                    setStep(4);
                  }}
                  className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20">
                    Siguiente: Editar y Guardar →
                  </button>
                </div>
              </div>
            ) : (
              <>
            {/* 🌉 DONNA JARVIS BANNER */}
            {donnaBanner && (
              <div className="flex items-start gap-3 p-3.5 bg-gradient-to-r from-violet-100/80 to-pink-100/60 dark:from-violet-950/80 dark:to-pink-950/60 border border-pink-300/40 dark:border-pink-500/40 backdrop-blur-md rounded-2xl animate-in fade-in slide-in-from-top-2 duration-500">
                <div className="w-8 h-8 shrink-0 bg-pink-500/10 dark:bg-pink-500/20 rounded-xl flex items-center justify-center">
                  <Zap className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-pink-600 dark:text-pink-400 uppercase tracking-widest mb-0.5">Donna activó el Modo Jarvis</p>
                  <p className="text-xs text-neutral-800 dark:text-neutral-300 leading-relaxed font-medium">{donnaBanner}</p>
                </div>
                <button onClick={() => setDonnaBanner(null)} className="p-1 text-neutral-500 dark:text-neutral-600 hover:text-neutral-900 dark:hover:text-neutral-400 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Setup de Campaña</h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 font-medium">Define el contexto estratégico y visual</p>
              </div>
              <button
                onClick={() => setUseBranding(!useBranding)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl cursor-pointer border transition-all ${
                  useBranding ? "bg-purple-600/10 border-purple-500/50 text-purple-400" : "bg-neutral-950 border-neutral-800 text-neutral-600"
                }`}
              >
                <Check className={`w-3.5 h-3.5 transition-opacity ${useBranding ? "opacity-100" : "opacity-0"}`} />
                <span className="text-xs font-bold uppercase tracking-wide">Branding Objetivo</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wide">Objetivo (Opcional)</label>
                <div className="flex gap-2">
                  <select value={selectedObjId} onChange={e => { setSelectedObjId(e.target.value); setSelectedCampId(""); }}
                    className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors">
                    <option value="">-- Sin Objetivo --</option>
                    {objectives.map(obj => <option key={obj.id} value={obj.id}>{obj.emoji} {obj.name}</option>)}
                  </select>
                  <button onClick={() => setShowObjModal(true)} type="button" className="p-2.5 bg-neutral-900 border border-neutral-800 hover:border-purple-500 rounded-xl text-neutral-400 transition-colors" title="Crear Nuevo Objetivo">
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wide">Campaña (Opcional)</label>
                <div className="flex gap-2">
                  <select value={selectedCampId} onChange={e => setSelectedCampId(e.target.value)} disabled={!selectedObjId}
                    className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors disabled:opacity-50">
                    <option value="">-- Selecciona Campaña --</option>
                    {objectives.find(o => o.id === selectedObjId)?.campaigns?.map((camp: any) => (
                      <option key={camp.id} value={camp.id}>{camp.name}</option>
                    ))}
                  </select>
                  <button onClick={() => setShowCampModal(true)} disabled={!selectedObjId} type="button" className="p-2.5 bg-neutral-900 border border-neutral-800 hover:border-purple-500 rounded-xl text-neutral-400 transition-colors disabled:opacity-50" title="Crear Nueva Campaña">
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wide">Mes de la Campaña</label>
                <select value={targetMonth} onChange={e => setTargetMonth(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors">
                  {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wide">Nicho o Audiencia</label>
                <select value={topic} onChange={e => setTopic(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors">
                  {NICHES.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>
            {/* --- SELECCIÓN DE FORMATO (NUEVO) --- */}
            <div className="pt-4 border-t border-neutral-800/50 space-y-4">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-wide">¿Qué vamos a generar hoy?</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setIsCarouselMode(false)}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                    !isCarouselMode 
                      ? "bg-purple-600/10 border-purple-500 text-purple-400 shadow-lg shadow-purple-900/20" 
                      : "bg-neutral-900/50 border-neutral-800 text-neutral-600 hover:border-neutral-700"
                  }`}
                >
                  <ImageIcon className="w-6 h-6 mb-2" />
                  <span className="text-sm font-bold uppercase tracking-tight">Post Estándar</span>
                  <span className="text-[10px] opacity-60 font-medium">Foto, Video o Texto</span>
                </button>
                <button
                  onClick={() => {
                    setIsCarouselMode(true);
                    setActiveCategory('carrusel');
                    if (!['instagram', 'facebook'].includes(activePlatform)) {
                      setActivePlatform('instagram');
                    }
                  }}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                    isCarouselMode 
                      ? "bg-amber-600/10 border-amber-500 text-amber-500 shadow-lg shadow-amber-900/20" 
                      : "bg-neutral-900/50 border-neutral-800 text-neutral-600 hover:border-neutral-700"
                  }`}
                >
                  <RotateCcw className={`w-6 h-6 mb-2 ${isCarouselMode ? 'animate-spin-slow' : ''}`} />
                  <span className="text-sm font-bold uppercase tracking-tight">Carrusel Estratégico</span>
                  <span className="text-[10px] opacity-60 font-medium">Secuencia de Láminas</span>
                </button>
              </div>
            </div>

            {/* --- CONFIGURACIÓN DINÁMICA DE CARRUSEL --- */}
            {isCarouselMode && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-400">
                {/* Selector de Láminas (Movido a Step 1) */}
                <div className="flex items-center gap-4 p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl shadow-inner">
                  <div className="flex-1">
                    <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-0.5 flex items-center gap-2">
                       <Sparkles className="w-3.5 h-3.5" /> Cantidad de Láminas IA
                    </p>
                    <p className="text-[10px] text-neutral-500 font-medium">Define cuántas slides generará la IA automáticamente</p>
                  </div>
                  <select
                    value={carouselSlides}
                    onChange={e => setCarouselSlides(Number(e.target.value))}
                    className="bg-neutral-900 border border-amber-500/40 rounded-xl px-4 py-2 text-sm font-black text-amber-400 focus:outline-none focus:border-amber-400 transition-colors cursor-pointer"
                  >
                    {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                      <option key={n} value={n}>{n} Láminas</option>
                    ))}
                  </select>
                </div>

              </div>
            )}

            {!isCarouselMode && (
              <div className="flex items-center justify-between pt-4 border-t border-neutral-800/50">
                 <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${includeImages ? 'bg-purple-500/10 text-purple-400' : 'bg-neutral-800 text-neutral-500'}`}>
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-tight">Generar Imágenes con AI</h3>
                      <p className="text-[10px] text-neutral-500 font-medium">Crea piezas visuales únicas para cada post</p>
                    </div>
                 </div>
                 <button
                    onClick={() => setIncludeImages(!includeImages)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                      includeImages ? "bg-purple-600" : "bg-neutral-800"
                    }`}
                 >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        includeImages ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                 </button>
              </div>
            )}

            {!includeImages && (
              <div className="space-y-2 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-2 mb-1">
                  <LinkIcon className="w-3.5 h-3.5 text-purple-400" />
                  <label className="text-xs font-bold text-neutral-400 uppercase tracking-wide">Link del Artículo o Web (Opcional)</label>
                </div>
                <input 
                  type="url"
                  value={externalLink}
                  onChange={(e) => setExternalLink(e.target.value)}
                  placeholder="https://tupagina.com/articulo"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors placeholder:text-neutral-700 font-medium"
                />
                <p className="text-[10px] text-neutral-500 font-medium ml-1">Para que Facebook/LinkedIn generen el link card automático.</p>
              </div>
            )}

            {includeImages && (
              <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wide">Estilo Visual del Lote</label>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                  {IMAGE_STYLES.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setSelectedStyle(style)}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all group ${
                        selectedStyle.id === style.id ? "border-purple-500 scale-95 shadow-lg shadow-purple-500/20" : "border-neutral-800 hover:border-neutral-700"
                      }`}
                    >
                      <img src={style.previewUrl} alt={style.name} className="w-full h-full object-cover" />
                      <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-bottom p-2 transition-opacity ${
                        selectedStyle.id === style.id ? "opacity-100" : "opacity-60"
                      }`}>
                        <span className="mt-auto text-[9px] font-black text-white uppercase tracking-wider">{style.name}</span>
                      </div>
                      {selectedStyle.id === style.id && (
                        <div className="absolute top-1.5 right-1.5 bg-purple-500 rounded-full p-0.5">
                          <Check className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Central Idea */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-wide">Idea Central de la Campaña</label>
              <textarea value={centralIdea} onChange={e => setCentralIdea(e.target.value)}
                placeholder="Ej: 'Campaña WiFi ActivaQR: usar la clave del WiFi como gancho para instalar el contacto del negocio en el teléfono del cliente...'"
                rows={3}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors resize-none placeholder:text-neutral-600"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  const manualPost: GeneratedPost = {
                    content: "",
                    categoryId: "educativo",
                    platform: activePlatform || "instagram",
                    style: IMAGE_STYLES[0],
                    mediaUrls: [],
                    selectedMediaUrl: "",
                    saved: false,
                    imagePrompt: "",
                    carouselSlides: [],
                    scheduled_for: null
                  };
                  setGeneratedPosts([manualPost]);
                  setStep(4);
                }}
                className="flex items-center gap-2 px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 text-sm font-bold rounded-xl transition-all border border-neutral-800"
              >
                <Plus className="w-4 h-4" /> Crear Manualmente
              </button>
              <button
                onClick={() => { if (!centralIdea.trim()) { toast.error("Escribe la idea central"); return; } setStep(2); }}
                className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-purple-500/20"
              >
                Siguiente → Mix de Plataformas
              </button>
            </div>
              </>
            )}
          </div>
        )}

        {/* ── STEP 2: MIX DE PLATAFORMA × CATEGORÍA ───────────────────────── */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-xl shadow-black/5 dark:shadow-black/20 rounded-3xl p-8 space-y-6">
              <div>
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Mix de Plataformas</h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 font-medium">
                  Define exactamente qué post va a qué red. Cada uno tendrá copy nativo.
                </p>
              </div>

              {/* Platform Selector */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wide">1. Elige la Plataforma</label>
                {activeCategory === 'carrusel' && (
                  <p className="text-[10px] text-amber-400 font-bold uppercase tracking-widest flex items-center gap-1">
                    ⚠️ Carrusel disponible solo en Instagram y Facebook
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map(p => {
                    const isDisabledForCarousel = activeCategory === 'carrusel' && !['instagram', 'facebook'].includes(p.id);
                    return (
                      <button
                        key={p.id}
                        onClick={() => !isDisabledForCarousel && setActivePlatform(p.id)}
                        disabled={isDisabledForCarousel}
                        title={isDisabledForCarousel ? 'No disponible para Carrusel' : ''}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all border ${
                          isDisabledForCarousel
                            ? 'bg-neutral-900 border-neutral-800 text-neutral-700 opacity-40 cursor-not-allowed'
                            : activePlatform === p.id
                              ? `${p.colorBg} ${p.colorBorder} ${p.colorText} shadow-sm ring-2 ring-offset-1 ring-offset-neutral-900 ring-current`
                              : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:border-neutral-600'
                        }`}
                      >
                        {p.emoji} {p.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Category Selector */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-neutral-400 uppercase tracking-wide">2. Tipo de Contenido</label>
                  {isCarouselMode && (
                    <span className="text-[10px] bg-amber-500/20 text-amber-500 px-2 py-1 rounded-lg border border-amber-500/30 font-black uppercase tracking-widest">
                      Modo Carrusel Activo
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {POST_TYPES.map(type => {
                    // Si estamos en modo carrusel, desactivamos los que no son carrusel para evitar confusión
                    const isDisabled = isCarouselMode && type.id !== 'carrusel';
                    
                    return (
                      <button 
                        key={type.id} 
                        onClick={() => {
                          if (isDisabled) {
                             toast.error("Formatos mezclados no permitidos en Modo Carrusel");
                             return;
                          }
                          setActiveCategory(type.id);
                          // Deseleccionar plataformas no soportadas si se elige carrusel
                          if (type.id === 'carrusel' && !['instagram', 'facebook'].includes(activePlatform)) {
                            setActivePlatform('instagram');
                          }
                        }}
                        className={`text-left p-3 rounded-xl border transition-all ${
                          isDisabled 
                            ? "opacity-30 grayscale cursor-not-allowed bg-neutral-900 border-neutral-800"
                            : activeCategory === type.id
                              ? "bg-purple-700 border-purple-500 text-white shadow-lg shadow-purple-900/50 scale-[1.02]"
                              : "bg-neutral-800/50 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-300"
                        }`}
                      >
                        <p className={`font-bold ${type.id === 'carrusel' ? 'text-base' : 'text-sm'}`}>
                          {type.id === 'carrusel' ? '🚀 ' : ''}{type.name}
                        </p>
                        <p className={`text-xs mt-0.5 ${activeCategory === type.id ? 'text-purple-200/80' : 'opacity-70'}`}>{type.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Add to Mix button */}
              <button onClick={addToMix}
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm transition-all flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" />
                Agregar: {PLATFORMS.find(p => p.id === activePlatform)?.emoji} {PLATFORMS.find(p => p.id === activePlatform)?.name} — {POST_TYPES.find(t => t.id === activeCategory)?.name}
              </button>
            </div>

            {/* Mix Queue */}
            {mixItems.length > 0 && (
              <div className="bg-white/50 dark:bg-black/50 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-lg shadow-black/5 dark:shadow-black/20 rounded-3xl p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-neutral-900 dark:text-white">
                    Cola de generación — {mixItems.length} post{mixItems.length !== 1 ? 's' : ''}
                  </p>
                  <button onClick={() => setMixItems([])} className="text-xs text-neutral-500 hover:text-red-500 dark:hover:text-red-400 font-medium transition-colors">
                    Limpiar todo
                  </button>
                </div>
                <div className="space-y-2">
                  {mixItems.map((item, idx) => {
                    const plat = PLATFORMS.find(p => p.id === item.platform);
                    const cat = POST_TYPES.find(t => t.id === item.categoryId);
                    return (
                      <div key={item.id} className="flex items-center justify-between bg-neutral-800/60 rounded-xl px-4 py-3 border border-neutral-700/60">
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-neutral-500 font-mono w-5">{idx + 1}</span>
                          <PlatformBadge platformId={item.platform} />
                          <span className="text-xs text-neutral-300 font-medium">{cat?.name}</span>
                        </div>
                        <button onClick={() => removeFromMix(item.id)} className="text-neutral-600 hover:text-red-400 transition-colors p-1">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <button onClick={() => setStep(1)}
                className="px-5 py-2.5 border border-neutral-700 hover:border-neutral-600 text-neutral-300 text-sm font-bold rounded-xl transition-all">
                ← Atrás
              </button>
              <button
                onClick={() => { if (mixItems.length === 0) { toast.error("Agrega al menos un post"); return; } setStep(3); handleGenerate(); }}
                disabled={mixItems.length === 0}
                className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-all shadow-xl shadow-purple-900/40">
                <Wand2 className="w-4 h-4" />
                Generar {mixItems.length} Post{mixItems.length !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: GENERATING ───────────────────────────────────────────── */}
        {step === 3 && (
          <div className="bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-xl shadow-black/5 dark:shadow-black/20 rounded-3xl p-12 text-center">
            <div className="w-24 h-24 mx-auto rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6 relative">
              <Loader2 className="w-10 h-10 text-purple-600 dark:text-purple-400 animate-spin absolute" />
              <div className="w-20 h-20 rounded-full border-t-2 border-purple-600 dark:border-purple-500 animate-spin absolute" style={{ animationDirection: 'reverse', animationDuration: '3s' }} />
            </div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">Donna está generando...</h2>
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {mixItems.map((item, i) => (
                <PlatformBadge key={i} platformId={item.platform} />
              ))}
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-sm mx-auto leading-relaxed font-medium">
              Copy nativo por plataforma — cada post tendrá el tono, longitud y estructura de su red social.
            </p>
          </div>
        )}

        {/* ── STEP 4: RESULTADOS ───────────────────────────────────────────── */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-xl shadow-black/5 dark:shadow-black/20 rounded-3xl p-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Resultados</h2>
                <p className="text-sm text-emerald-600 dark:text-emerald-500 font-bold mt-1">
                  ✓ {generatedPosts.length} posts generados con copy nativo
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setStep(1); setGeneratedPosts([]); setMixItems([]); setCentralIdea(""); }}
                  className="flex items-center gap-2 px-3 py-2 border border-neutral-700 hover:border-neutral-600 text-neutral-400 text-xs font-bold rounded-xl transition-all">
                  <RotateCcw className="w-3.5 h-3.5" /> Nuevo lote
                </button>
                <button onClick={saveAll}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl transition-all">
                  <Save className="w-4 h-4" /> Guardar Todos
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {generatedPosts.map((post, idx) => (
                <div key={idx}
                  className={`backdrop-blur-md rounded-3xl p-6 space-y-4 transition-all shadow-md ${
                    post.saved 
                      ? "bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-500/30" 
                      : "bg-white/50 dark:bg-black/50 border border-white/40 dark:border-white/10 hover:border-purple-300 dark:hover:border-purple-500/50 hover:bg-white/70 dark:hover:bg-black/60"
                  }`}>
                  {/* Post header */}
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-800/60">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] uppercase font-black tracking-widest text-neutral-600">#{idx + 1}</span>
                      <PlatformBadge platformId={post.platform} />
                      <span className="text-[10px] bg-purple-500/10 border border-purple-500/20 text-purple-400 px-2 py-1 rounded-full font-black uppercase tracking-widest">
                        {catName(post.categoryId)}
                      </span>
                      {post.style.id !== 'no-image' && (
                        <button 
                           onClick={() => {
                             setActivePostForImage(idx);
                             setShowImageGen(true);
                           }}
                           className="flex items-center gap-1.5 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-bold rounded-lg transition-all shadow-lg shadow-purple-500/20"
                        >
                           <Sparkles className="w-3 h-3" /> Generar con IA ✨
                        </button>
                      )}
                      {post.imagePrompt && (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(post.imagePrompt);
                            toast.success('Prompt copiado 📋', { duration: 2000 });
                          }}
                          className="flex items-center gap-1.5 px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] font-bold rounded-lg transition-all border border-neutral-700 hover:border-neutral-500"
                          title="Copiar prompt para Midjourney / Flux"
                        >
                          <Copy className="w-3 h-3" /> Copiar Prompt
                        </button>
                      )}
                    </div>
                    {post.saved ? (
                      <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 rounded-xl">
                        <Check className="w-4 h-4" /> Guardado
                      </span>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-xl px-2 py-1">
                          <Zap className="w-3 h-3 text-yellow-500" />
                          <input 
                            type="datetime-local" 
                            className="bg-transparent text-[10px] text-neutral-300 focus:outline-none"
                            value={post.scheduled_for || ''}
                            onChange={(e) => {
                              const updated = [...generatedPosts];
                              updated[idx].scheduled_for = e.target.value;
                              setGeneratedPosts(updated);
                            }}
                          />
                        </div>
                        <button onClick={() => savePost(idx)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all border border-neutral-700 hover:border-emerald-500">
                          <Save className="w-3.5 h-3.5" /> Guardar
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Content + Image */}
                  <div className={`grid grid-cols-1 ${post.selectedMediaUrl || (post.carouselSlides && post.carouselSlides.length > 0) ? 'md:grid-cols-2' : ''} gap-4`}>
                    {/* Copy */}
                    <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 overflow-y-auto max-h-[800px] scrollbar-thin scrollbar-thumb-neutral-800">
                      <textarea 
                        className={`w-full bg-transparent ${(!post.selectedMediaUrl && !post.carouselSlides?.length) ? 'text-base md:text-lg' : 'text-sm'} text-neutral-300 leading-relaxed resize-none focus:outline-none ${post.carouselSlides && post.carouselSlides.length > 0 ? "mb-6" : ""}`}
                        rows={8}
                        value={post.content}
                        onChange={(e) => {
                          const updated = [...generatedPosts];
                          updated[idx].content = e.target.value;
                          setGeneratedPosts(updated);
                        }}
                      />

                      {/* Carousel Slides Rendering */}
                      {post.carouselSlides && post.carouselSlides.length > 0 && (
                        <div className="space-y-4">
                          <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-widest border-b border-neutral-800 pb-2">Láminas Visuales</h4>
                          {post.carouselSlides.map((slide, sIdx) => (
                             <div key={sIdx} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-3 shadow-inner">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">
                                    Lámina {slide.slideNumber}
                                  </span>
                                </div>
                                <p className="text-sm text-neutral-300 leading-relaxed">{slide.copy}</p>
                                <div className="bg-black/50 border border-neutral-800 rounded-lg p-3 group/prompt">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] text-neutral-500 font-bold uppercase">Super Prompt (Pipeline Manus)</span>
                                    <button
                                      onClick={() => {
                                        navigator.clipboard.writeText(slide.imagePrompt);
                                        toast.success(`Prompt Lámina ${slide.slideNumber} Copiado`);
                                      }}
                                      className="text-purple-400 hover:text-purple-300 transition-colors bg-purple-500/10 px-2 py-1 rounded-md flex items-center gap-1 opacity-0 group-hover/prompt:opacity-100"
                                    >
                                      <Copy className="w-3 h-3" /> <span className="text-[10px] font-bold">Copiar</span>
                                    </button>
                                  </div>
                                  <p className="text-[10px] text-neutral-400 font-mono line-clamp-3 hover:line-clamp-none transition-all cursor-text select-all">{slide.imagePrompt}</p>
                                </div>
                                <div className="pt-2 border-t border-neutral-800">
                                  {slide.mediaUrl ? (
                                    <div className="relative group/slide overflow-hidden rounded-lg border border-neutral-800">
                                      <img src={slide.mediaUrl} alt={`Slide ${slide.slideNumber}`} className="w-full h-auto object-cover" />
                                      <button 
                                        onClick={() => {
                                          const updated = [...generatedPosts];
                                          updated[idx].carouselSlides![sIdx].mediaUrl = undefined;
                                          setGeneratedPosts(updated);
                                        }}
                                        className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-md text-white opacity-0 group-hover/slide:opacity-100 transition-opacity hover:bg-red-500"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>
                                  ) : (
                                    <MediaUploader 
                                      multiple={false}
                                      onUploadComplete={(urls) => {
                                         const updated = [...generatedPosts];
                                         updated[idx].carouselSlides![sIdx].mediaUrl = urls[0];
                                         setGeneratedPosts(updated);
                                      }}
                                    />
                                  )}
                                </div>
                             </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Image / Link Preview (Fallback for Non-Carousels) */}
                    {!post.carouselSlides?.length && post.selectedMediaUrl && (
                      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden min-h-[300px] relative group flex flex-col">
                        <div className="flex-1 relative overflow-hidden bg-black flex items-center justify-center">
                          {(post.selectedMediaUrl.includes('http') && !post.selectedMediaUrl.includes('/api/ai/image-proxy') && !post.selectedMediaUrl.includes('supabase')) ? (
                            <LinkCard url={post.selectedMediaUrl} />
                          ) : (
                            <>
                              <img src={post.selectedMediaUrl} alt="Visual" className="max-h-full max-w-full object-contain" />
                              {/* Variant picker */}
                              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                {post.mediaUrls.map((variant, vIdx) => (
                                  <button key={vIdx}
                                    onClick={() => setGeneratedPosts(prev => prev.map((p, i) => i === idx ? { ...p, selectedMediaUrl: variant } : p))}
                                    className={`w-12 h-12 rounded-lg border-2 overflow-hidden transition-all ${
                                      post.selectedMediaUrl === variant ? "border-purple-500 scale-110" : "border-transparent opacity-50 hover:opacity-100"
                                    }`}>
                                    <img src={variant} className="w-full h-full object-cover" alt="" />
                                  </button>
                                ))}
                                <button
                                  onClick={() => {
                                    const newUrl = `/api/ai/image-proxy?prompt=${encodeURIComponent(post.imagePrompt)}&seed=${Math.floor(Math.random() * 1000000)}`;
                                    setGeneratedPosts(prev => prev.map((p, i) => i === idx ? { ...p, mediaUrls: [...p.mediaUrls, newUrl], selectedMediaUrl: newUrl } : p));
                                    toast.success("Variante generada ✓");
                                  }}
                                  className="w-12 h-12 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
                                  <RotateCcw className="w-4 h-4" />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* --- MODAL: NUEVO OBJETIVO --- */}
      {showObjModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white/95 dark:bg-neutral-900/90 backdrop-blur-2xl border border-white/20 dark:border-neutral-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-black/5 dark:border-neutral-800">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Nuevo Objetivo Estratégico</h3>
              <button type="button" onClick={() => setShowObjModal(false)} className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateObjective} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wide">Nombre</label>
                <input required autoFocus value={newObj.name} onChange={e => setNewObj({...newObj, name: e.target.value})} placeholder="Ej: Educación Digital" className="mt-1.5 w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:border-purple-500 outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wide">Descripción Contextual</label>
                <textarea value={newObj.description} onChange={e => setNewObj({...newObj, description: e.target.value})} placeholder="Brief estratégico..." rows={3} className="mt-1.5 w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:border-purple-500 outline-none resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-neutral-400 uppercase tracking-wide">Emoji</label>
                  <input value={newObj.emoji} onChange={e => setNewObj({...newObj, emoji: e.target.value})} className="mt-1.5 w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-center text-xl outline-none focus:border-purple-500" />
                </div>
                <div>
                  <label className="text-xs font-bold text-neutral-400 uppercase tracking-wide">Color</label>
                  <input type="color" value={newObj.color} onChange={e => setNewObj({...newObj, color: e.target.value})} className="mt-1.5 w-full h-[52px] bg-neutral-950 border border-neutral-800 rounded-xl p-1 outline-none cursor-pointer focus:border-purple-500" />
                </div>
              </div>
              <div className="pt-4">
                <button type="submit" className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-colors">
                  Guardar Objetivo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: NUEVA CAMPAÑA --- */}
      {showCampModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white/95 dark:bg-neutral-900/90 backdrop-blur-2xl border border-white/20 dark:border-neutral-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-black/5 dark:border-neutral-800">
              <div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Nueva Campaña</h3>
                <p className="text-xs text-neutral-500 mt-1">Para el objetivo seleccionado</p>
              </div>
              <button type="button" onClick={() => setShowCampModal(false)} className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateCampaign} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wide">Nombre de la Campaña / Tema</label>
                <input required autoFocus value={newCamp.name} onChange={e => setNewCamp({...newCamp, name: e.target.value})} placeholder="Ej: Webinar IA 2026..." className="mt-1.5 w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:border-purple-500 outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wide">Descripción (Brief IA)</label>
                <textarea value={newCamp.description} onChange={e => setNewCamp({...newCamp, description: e.target.value})} placeholder="Instrucciones u objetivo específico de esta campaña..." rows={4} className="mt-1.5 w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:border-purple-500 outline-none resize-none" />
              </div>
              <div className="pt-4">
                <button type="submit" className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-colors">
                  Iniciar Campaña
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI IMAGE GENERATOR SIDE PANEL */}
      {showImageGen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] animate-in fade-in duration-300"
            onClick={() => {
              setShowImageGen(false);
              setActivePostForImage(null);
            }}
          />
          <div className="fixed inset-y-4 right-4 w-[400px] z-[70] animate-in slide-in-from-right duration-500">
            <AiImageGenerator
              initialPrompt={activePostForImage !== null ? generatedPosts[activePostForImage].imagePrompt : ""}
              onImageUsed={(url) => {
                if (activePostForImage !== null) {
                  setGeneratedPosts(prev => prev.map((p, i) =>
                    i === activePostForImage ? { ...p, selectedMediaUrl: url, mediaUrls: [...p.mediaUrls, url] } : p
                  ));
                }
                setShowImageGen(false);
                setActivePostForImage(null);
              }}
            />
            <button 
              onClick={() => {
                setShowImageGen(false);
                setActivePostForImage(null);
              }}
              className="absolute top-4 -left-14 p-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-full shadow-2xl hover:text-red-500 transition-all flex items-center justify-center group"
            >
              <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
            </button>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
