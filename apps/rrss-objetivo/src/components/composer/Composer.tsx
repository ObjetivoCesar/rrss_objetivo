"use client";

import { useState, useEffect } from "react";
import { 
  Check, Save, Loader2, X, Plus, Zap, Link as LinkIcon, 
  Image as ImageIcon, Video, Library, PlaySquare, Calendar, ChevronDown, Sparkles
} from "lucide-react";
import toast from "react-hot-toast";
import MediaUploader from '../MediaUploader';
import AiImageGenerator from '../AiImageGenerator';

// --- Types ---
type Platform = 'instagram' | 'facebook' | 'linkedin' | 'youtube';
type ContentType = 'image' | 'carousel' | 'video' | 'link' | 'text' | 'youtube' | 'ai' | 'library';

interface ComposerState {
  platforms: Platform[];
  contentText: string;
  contentType: ContentType;
  mediaUrls: string[];
  videoUrl: string;
  videoId?: string | null;
  linkUrl: string;
  linkPreviewData?: {
    title: string;
    description: string;
    image: string;
    domain: string;
  } | null;
  objectiveId: string;
  campaignId: string;
  scheduledFor: string; // ISO string
  isEvergreen: boolean;
  topic: string;
  targetMonth: string;
}

const PLATFORMS: { id: Platform; name: string; icon: string; color: string }[] = [
  { id: 'instagram', name: 'Instagram', icon: '📸', color: 'bg-pink-600' },
  { id: 'facebook', name: 'Facebook', icon: '👤', color: 'bg-blue-600' },
  { id: 'linkedin', name: 'LinkedIn', icon: '💼', color: 'bg-blue-700' },
  { id: 'youtube', name: 'YouTube', icon: '▶️', color: 'bg-red-600' },
];

export default function Composer() {
  const [state, setState] = useState<ComposerState>({
    platforms: ['instagram'],
    contentText: '',
    contentType: 'image',
    mediaUrls: [],
    videoUrl: '',
    linkUrl: '',
    objectiveId: '',
    campaignId: '',
    scheduledFor: '',
    isEvergreen: false,
    topic: 'General',
    targetMonth: new Date().toLocaleString('es-ES', { month: 'long' }),
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [showCampaigns, setShowCampaigns] = useState(false);

  const [objectives, setObjectives] = useState<any[]>([]);
  const [mediaErrors, setMediaErrors] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/campaigns")
      .then(res => res.json())
      .then(data => {
        if (!data.error) setObjectives(data);
      })
      .catch(console.error);
  }, []);

  // --- Validación de Aspect Ratio para Instagram ---
  useEffect(() => {
    if (!state.platforms.includes('instagram')) {
      setMediaErrors([]);
      return;
    }

    const checkRatios = async () => {
      const errors: string[] = [];
      const images = state.mediaUrls.filter(url => 
        url.match(/\.(jpeg|jpg|png|webp|avif|img)$/i) || url.includes('supabase.co/storage')
      );

      for (const url of images) {
        try {
          const img = new window.Image();
          // Si es una URL de Supabase, podemos añadirle parámetros para que sea más ligera si es necesario, 
          // pero aquí necesitamos las dimensiones reales.
          img.src = url;
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = () => {
              // Algunos navegadores bloquean CORS en Image() si no se especifica crossOrigin
              // Intentamos con crossOrigin if fails
              const img2 = new window.Image();
              img2.crossOrigin = "anonymous";
              img2.src = url;
              img2.onload = resolve;
              img2.onerror = reject;
            };
          });
          const ratio = img.width / img.height;
          if (ratio < 0.79 || ratio > 1.92) { // Un margen pequeño de error
            errors.push(`Relación de aspecto no compatible con Instagram: ${img.width}x${img.height} (Ratio: ${ratio.toFixed(2)}). Instagram requiere entre 0.8 y 1.91.`);
          }
        } catch (e) {
          console.warn("No se pudo validar el ratio de la imagen:", url);
        }
      }
      setMediaErrors(errors);
    };

    if (state.mediaUrls.length > 0 && state.contentType === 'image' || state.contentType === 'carousel') {
      checkRatios();
    } else {
      setMediaErrors([]);
    }
  }, [state.mediaUrls, state.platforms, state.contentType]);

  // --- Handlers ---
  const togglePlatform = (platform: Platform) => {
    setState(prev => {
      const isSelected = prev.platforms.includes(platform);
      if (isSelected && prev.platforms.length === 1) return prev; // Keep at least one
      return {
        ...prev,
        platforms: isSelected 
          ? prev.platforms.filter(p => p !== platform)
          : [...prev.platforms, platform]
      };
    });
  };

  const handleOptimize = async () => {
    if (state.mediaUrls.length === 0) return;
    
    setIsSubmitting(true);
    const toastId = toast.loading("Optimizando imágenes para Instagram...");
    
    try {
      const optimizedUrls = await Promise.all(
        state.mediaUrls.map(async (url) => {
          // Solo optimizar si detectamos un error en esta URL específica
          // Para simplificar, optimizamos todas las que no cumplan
          const res = await fetch("/api/media/optimize", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageUrl: url })
          });
          const data = await res.json();
          if (data.error) throw new Error(data.error);
          return data.url;
        })
      );
      
      setState({ ...state, mediaUrls: optimizedUrls });
      toast.success("¡Imágenes optimizadas!", { id: toastId });
    } catch (err: any) {
      toast.error("Error al optimizar: " + err.message, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const setScheduledNow = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    const localISO = new Date(now.getTime() - offset).toISOString().slice(0, 16);
    setState({ ...state, scheduledFor: localISO });
  };

  const setScheduledToday = () => {
    const now = new Date();
    const datePart = now.toISOString().split('T')[0];
    const timePart = state.scheduledFor.includes('T') ? state.scheduledFor.split('T')[1] : "10:00";
    setState({ ...state, scheduledFor: `${datePart}T${timePart}` });
  };

  const handlePublish = async () => {
    if (!state.contentText && state.contentType !== 'video') {
      toast.error("El contenido es obligatorio");
      return;
    }

    if (state.platforms.length === 0) {
      toast.error("Selecciona al menos una plataforma");
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading("Guardando publicación...");

    try {
      // Preparar media_urls según el tipo
      let finalMediaUrls = [...state.mediaUrls];
      
      // Si es YouTube, nos aseguramos de que el videoId esté presente si no hay mediaUrl
      const metadata: any = {
        source: 'unified-composer',
        content_type: state.contentType,
        is_evergreen: state.isEvergreen
      };

      if (state.contentType === 'youtube' && state.videoUrl) {
        if (state.videoId) metadata.youtube_id = state.videoId;
        metadata.youtube_url = state.videoUrl;
      }

      if (state.contentType === 'link' && state.linkUrl) {
        if (state.linkPreviewData) metadata.link_preview = state.linkPreviewData;
        metadata.link_url = state.linkUrl;
      }

      const payload = {
        content: state.contentText,
        targetMonth: state.targetMonth,
        topic: state.topic || "General",
        platforms: state.platforms,
        categoryId: state.contentType === 'carousel' ? 'carrusel' : 'educativo', // O mapear dinámicamente
        media_urls: finalMediaUrls,
        status: "pending",
        campaign_id: state.campaignId || null,
        objective_id: state.objectiveId || null,
        scheduled_for: state.scheduledFor || null,
        metadata
      };

      const res = await fetch("/api/posts/save-ai-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Error al guardar");

      toast.success("¡Publicación programada con éxito! 🚀", { id: loadingToast });
      
      // Reset opcional o redirección
      // window.location.href = '/dashboard';
    } catch (err: any) {
      toast.error(err.message, { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-black text-white font-sans overflow-hidden">
      
      {/* --- COLUMNA IZQUIERDA: CONFIGURACIÓN --- */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto border-r border-neutral-800">
        
        {/* Header Mobile Sticky */}
        <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-md border-b border-neutral-800 p-4 flex justify-between items-center">
          <h1 className="text-lg font-bold flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-500" />
            Compositor RRSS
          </h1>
          <button className="p-2 text-neutral-400 hover:text-white md:hidden" onClick={() => setIsPreviewOpen(true)}>
            Ver Preview
          </button>
        </div>

        <div className="p-4 space-y-6 pb-32">
          
          {/* Plataformas */}
          <section>
            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">
              1. Plataformas Destino
            </label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map(p => (
                <button
                  key={p.id}
                  onClick={() => togglePlatform(p.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                    state.platforms.includes(p.id) 
                      ? `${p.color} border-transparent text-white` 
                      : 'bg-neutral-900 border-neutral-700 text-neutral-400 hover:border-neutral-500'
                  }`}
                >
                  <span>{p.icon}</span>
                  {p.name}
                </button>
              ))}
            </div>
            {/* Validación en tiempo real (placeholder) */}
            <div className="mt-2 text-[11px] text-green-400 flex items-center gap-1">
              <Check className="w-3 h-3" /> Reglas de plataforma validadas
            </div>
          </section>

          {/* Copy */}
          <section>
            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">
              2. Copy del Post
            </label>
            <div className="relative">
              <textarea
                value={state.contentText}
                onChange={e => setState({ ...state, contentText: e.target.value })}
                placeholder="Escribe tu copy aquí..."
                className="w-full h-32 bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-sm focus:ring-1 focus:ring-purple-500 focus:border-purple-500 outline-none resize-none transition-all"
              />
              <div className="absolute bottom-3 right-3 text-[10px] text-neutral-500 font-mono">
                {state.contentText.length} / 2200
              </div>
            </div>
          </section>

          {/* Tipo de Media */}
          <section>
            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">
              3. Contenido Multimedia
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {[
                { id: 'ai', icon: Zap, label: 'Generar IA' },
                { id: 'image', icon: ImageIcon, label: 'Subir Imagen' },
                { id: 'video', icon: Video, label: 'Subir Video' },
                { id: 'link', icon: LinkIcon, label: 'Link / URL' },
                { id: 'youtube', icon: PlaySquare, label: 'YouTube URL' },
                { id: 'library', icon: Library, label: 'Mis Archivos' },
              ].map(type => (
                <button
                  key={type.id}
                  onClick={() => setState({ 
                    ...state, 
                    contentType: type.id as any,
                    mediaUrls: [],
                    videoUrl: '',
                    videoId: null,
                    linkUrl: '',
                    linkPreviewData: null
                  })}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                    state.contentType === type.id
                      ? 'bg-purple-900/20 border-purple-500 text-purple-400'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-600'
                  }`}
                >
                  <type.icon className="w-5 h-5 mb-1.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{type.label}</span>
                </button>
              ))}
            </div>
            
            {/* Espacio para el uploader/input dinámico según selección */}
            <div className="mt-3 p-4 bg-neutral-900/50 border border-neutral-800 rounded-xl text-sm text-neutral-400 border-dashed">
              {state.contentType === 'ai' && (
                <div className="w-full max-w-lg mx-auto">
                  <AiImageGenerator 
                    initialPrompt={state.contentText} 
                    onImageUsed={(url) => {
                      setState({ ...state, mediaUrls: [url], contentType: 'image' });
                    }}
                  />
                </div>
              )}
              {state.contentType === 'image' && (
                <MediaUploader 
                  multiple={true} 
                  onUploadComplete={(urls) => setState({ ...state, mediaUrls: urls })}
                />
              )}

              {/* Alertas de Media */}
              {mediaErrors.length > 0 && (
                <div className="bg-amber-900/20 border border-amber-500/50 rounded-xl p-4 mt-4 flex gap-3 animate-pulse">
                  <div className="text-amber-500 text-xl">⚠️</div>
                  <div className="flex-1">
                    <p className="text-amber-400 text-xs font-bold uppercase mb-1">Aviso de Optimización</p>
                    {mediaErrors.map((err, i) => (
                      <p key={i} className="text-amber-200/80 text-[11px] leading-relaxed mb-1">{err}</p>
                    ))}
                    <div className="mt-3 flex gap-2">
                      <button 
                        onClick={handleOptimize}
                        disabled={isSubmitting}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-bold rounded-lg transition-colors disabled:opacity-50"
                      >
                        {isSubmitting ? "Optimizando..." : "Optimizar Automáticamente"}
                      </button>
                      <button 
                        onClick={() => setState({ ...state, mediaUrls: [] })}
                        className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] font-bold rounded-lg transition-colors"
                      >
                        Subir otra versión
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {state.contentType === 'video' && (
                <div className="text-center">
                  <p className="text-xs text-neutral-500 mb-2">Sube tu video o Short (máximo 500MB).</p>
                  <p className="text-[10px] text-blue-400 font-bold uppercase mb-4 tracking-wider">⚡ Se subirá a Bunny.net</p>
                  
                  {state.mediaUrls.length > 0 && state.mediaUrls[0].includes('bunny') ? (
                    <div className="mb-4 relative rounded-xl overflow-hidden aspect-video bg-black border border-neutral-800 group">
                      <video 
                        src={state.mediaUrls[0]} 
                        className="w-full h-full object-cover opacity-80"
                        controls
                      />
                      <button 
                        onClick={() => setState({ ...state, mediaUrls: [] })}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-neutral-800 rounded-3xl cursor-pointer hover:bg-neutral-900/50 hover:border-blue-500/50 transition-all group overflow-hidden">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Video className="w-8 h-8 text-neutral-500 mb-2 group-hover:text-blue-500 transition-colors" />
                        <p className="text-xs text-neutral-400 font-medium">Click para seleccionar video</p>
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="video/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          
                          toast.loading('Subiendo a Bunny.net...', { id: 'upload-bunny' });
                          try {
                            const formData = new FormData();
                            formData.append('file', file);
                            formData.append('folder', 'rrss-shorts');
                            
                            const res = await fetch('/api/upload-media', {
                              method: 'POST',
                              body: formData
                            });
                            
                            const data = await res.json();
                            if (data.error) throw new Error(data.error);
                            
                            setState(prev => ({ ...prev, mediaUrls: [data.url] }));
                            toast.success('Video subido con éxito', { id: 'upload-bunny' });
                          } catch (err: any) {
                            toast.error(err.message, { id: 'upload-bunny' });
                          }
                        }}
                      />
                    </label>
                  )}
                </div>
              )}
              {state.contentType === 'link' && (
                <div className="space-y-3">
                  <input 
                    type="url" 
                    placeholder="https://tu-articulo.com" 
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2.5 text-sm outline-none focus:border-purple-500"
                    value={state.linkUrl}
                    onChange={e => setState({ ...state, linkUrl: e.target.value, linkPreviewData: null })}
                  />
                  <div className="flex justify-end">
                    <button 
                      onClick={async () => {
                        if (!state.linkUrl) return;
                        toast.loading('Obteniendo preview...', { id: 'fetch-link' });
                        try {
                          const res = await fetch('/api/link-preview', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ url: state.linkUrl })
                          });
                          const data = await res.json();
                          if (data.error) throw new Error(data.error);
                          
                          setState(prev => ({ ...prev, linkPreviewData: data }));
                          toast.success('Preview obtenida', { id: 'fetch-link' });
                        } catch (err: any) {
                          toast.error(err.message, { id: 'fetch-link' });
                        }
                      }}
                      className="text-xs font-bold bg-neutral-800 hover:bg-neutral-700 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Fetch Preview
                    </button>
                  </div>
                  
                  {state.linkPreviewData && (
                    <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-left">
                      {state.linkPreviewData.image && (
                        <img src={state.linkPreviewData.image} alt="Preview" className="w-full h-32 object-cover rounded-md mb-2" />
                      )}
                      <h4 className="font-bold text-white text-sm line-clamp-1">{state.linkPreviewData.title}</h4>
                      <p className="text-[10px] text-neutral-500 line-clamp-2 mt-1">{state.linkPreviewData.description}</p>
                      <p className="text-[9px] text-purple-400 mt-2">{state.linkPreviewData.domain}</p>
                    </div>
                  )}
                </div>
              )}
              {state.contentType === 'youtube' && (
                <div className="space-y-3">
                  <input 
                    type="url" 
                    placeholder="https://youtube.com/watch?v=..." 
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2.5 text-sm outline-none focus:border-red-500"
                    value={state.videoUrl}
                    onChange={e => {
                      const url = e.target.value;
                      let videoId = null;
                      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                      const match = url.match(regExp);
                      if (match && match[2].length === 11) {
                        videoId = match[2];
                      }
                      setState({ ...state, videoUrl: url, videoId });
                    }}
                  />
                  
                  {state.videoId && (
                    <div className="relative aspect-video rounded-lg overflow-hidden border border-neutral-800 bg-black group">
                      <img 
                        src={`https://img.youtube.com/vi/${state.videoId}/mqdefault.jpg`} 
                        alt="YouTube Thumbnail" 
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
                          <PlaySquare className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-end">
                    <button className="text-xs font-bold bg-neutral-800 hover:bg-neutral-700 px-3 py-1.5 rounded-lg transition-colors">
                      {state.videoId ? 'Video Detectado ✓' : 'Detectar Video'}
                    </button>
                  </div>
                </div>
              )}
              {state.contentType === 'library' && (
                <div className="text-center">
                  <p className="text-xs text-neutral-500 mb-4">Conectando a tu bóveda permanente en Bunny.net...</p>
                  <button className="px-4 py-2 bg-neutral-800 text-neutral-300 border border-neutral-700 rounded-lg text-xs font-bold hover:bg-neutral-700">
                    Abrir Bóveda
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Campaña */}
          <section>
            <button 
              onClick={() => setShowCampaigns(!showCampaigns)}
              className="flex items-center justify-between w-full text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3"
            >
              4. Campaña y Estrategia
              <ChevronDown className={`w-4 h-4 transition-transform ${showCampaigns ? 'rotate-180' : ''}`} />
            </button>
            
            {showCampaigns && (
              <div className="space-y-3 p-3 bg-neutral-900 border border-neutral-800 rounded-xl animate-in slide-in-from-top-2">
                <div>
                  <label className="text-[10px] text-neutral-500 uppercase mb-1 block">Objetivo</label>
                  <select 
                    value={state.objectiveId}
                    onChange={e => setState({ ...state, objectiveId: e.target.value, campaignId: '' })}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg text-sm p-2 outline-none focus:border-purple-500 text-white"
                  >
                    <option value="">Seleccionar Objetivo...</option>
                    {objectives.map((obj: any) => (
                      <option key={obj.id} value={obj.id}>{obj.emoji} {obj.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-neutral-500 uppercase mb-1 block">Campaña</label>
                  <select 
                    value={state.campaignId}
                    onChange={e => setState({ ...state, campaignId: e.target.value })}
                    disabled={!state.objectiveId}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg text-sm p-2 outline-none focus:border-purple-500 text-white disabled:opacity-50"
                  >
                    <option value="">Seleccionar Campaña...</option>
                    {objectives.find((o: any) => o.id === state.objectiveId)?.campaigns?.map((camp: any) => (
                      <option key={camp.id} value={camp.id}>{camp.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="pt-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-tight">Contenido Evergreen</span>
                  </div>
                  <button
                    onClick={() => setState({ ...state, isEvergreen: !state.isEvergreen })}
                    className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none ${
                      state.isEvergreen ? "bg-amber-600" : "bg-neutral-800"
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                        state.isEvergreen ? "translate-x-5.5" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Programación */}
          <section>
            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">
              5. Fecha de Publicación
            </label>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-xl p-2.5">
                  <Calendar className="w-4 h-4 text-neutral-500" />
                  <input 
                    type="datetime-local" 
                    className="bg-transparent text-sm w-full outline-none"
                    value={state.scheduledFor}
                    onChange={e => setState({ ...state, scheduledFor: e.target.value })}
                  />
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={setScheduledToday}
                    className="px-2 py-2.5 bg-neutral-800 hover:bg-neutral-700 rounded-xl text-[10px] font-bold transition-colors border border-neutral-700"
                    title="Hoy"
                  >
                    Hoy
                  </button>
                  <button 
                    onClick={setScheduledNow}
                    className="px-2 py-2.5 bg-neutral-800 hover:bg-neutral-700 rounded-xl text-[10px] font-bold transition-colors border border-neutral-700"
                    title="Ahora"
                  >
                    🚀 Ahora
                  </button>
                </div>
                <button 
                  className="px-3 py-2.5 bg-neutral-800 hover:bg-neutral-700 rounded-xl text-xs font-bold transition-colors border border-neutral-700"
                  onClick={() => toast.success("Donna está analizando el mejor horario...")}
                >
                  IA
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-neutral-500 uppercase mb-1 block">Tópico</label>
                  <input 
                    type="text" 
                    value={state.topic}
                    onChange={e => setState({ ...state, topic: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-xs outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-neutral-500 uppercase mb-1 block">Mes Objetivo</label>
                  <input 
                    type="text" 
                    value={state.targetMonth}
                    onChange={e => setState({ ...state, targetMonth: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-xs outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>

      {/* --- COLUMNA DERECHA: PREVIEW (Desktop) / DRAWER (Mobile) --- */}
      <div className={`
        fixed inset-y-0 right-0 z-50 w-full md:w-96 bg-neutral-900 border-l border-neutral-800 transform transition-transform duration-300 ease-in-out md:relative md:transform-none flex flex-col
        ${isPreviewOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="p-4 border-b border-neutral-800 flex justify-between items-center bg-black/50 backdrop-blur-md">
          <h2 className="text-sm font-bold uppercase tracking-wider">Preview en Vivo</h2>
          <button className="p-1.5 bg-neutral-800 rounded-full md:hidden" onClick={() => setIsPreviewOpen(false)}>
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-6">
          {state.platforms.map(p => (
            <div key={p} className="bg-black border border-neutral-800 rounded-xl overflow-hidden shadow-xl">
              <div className="p-2 border-b border-neutral-800 bg-neutral-900/50 flex items-center gap-2">
                <span className="text-sm">{PLATFORMS.find(pl => pl.id === p)?.icon}</span>
                <span className="text-xs font-bold capitalize">{p}</span>
              </div>
              <div className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-neutral-800" />
                  <div>
                    <div className="text-xs font-bold">objetivoemprendo</div>
                    <div className="text-[10px] text-neutral-500">Justo ahora</div>
                  </div>
                </div>
                <div className="text-sm whitespace-pre-wrap mb-3 text-neutral-300">
                  {state.contentText || "Escribe algo para ver la previsualización..."}
                </div>
                
                {/* Media Preview Section */}
                <div className="w-full bg-neutral-900 border border-neutral-800 rounded overflow-hidden min-h-[200px] flex items-center justify-center">
                  {state.contentType === 'image' && state.mediaUrls.length > 0 ? (
                    <img src={state.mediaUrls[0]} alt="Preview" className="w-full h-full object-cover" />
                  ) : state.contentType === 'carousel' && state.mediaUrls.length > 0 ? (
                    <div className="relative w-full h-full">
                       <img src={state.mediaUrls[0]} alt="Slide 1" className="w-full h-full object-cover" />
                       <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-[10px] font-bold">1/{state.mediaUrls.length}</div>
                    </div>
                  ) : state.contentType === 'video' && state.mediaUrls.length > 0 ? (
                    <video src={state.mediaUrls[0]} className="w-full h-full object-cover" controls />
                  ) : state.contentType === 'youtube' && state.videoId ? (
                    <div className="relative w-full aspect-video bg-black flex items-center justify-center">
                      <img src={`https://img.youtube.com/vi/${state.videoId}/hqdefault.jpg`} alt="YT" className="w-full h-full object-cover opacity-50" />
                      <PlaySquare className="w-10 h-10 text-red-600 absolute" />
                    </div>
                  ) : state.contentType === 'link' && state.linkPreviewData ? (
                    <div className="w-full bg-white text-black p-3">
                       {state.linkPreviewData.image && <img src={state.linkPreviewData.image} className="w-full h-32 object-cover mb-2" />}
                       <h4 className="font-bold text-sm leading-tight">{state.linkPreviewData.title}</h4>
                       <p className="text-[10px] text-neutral-600 mt-1 line-clamp-2">{state.linkPreviewData.description}</p>
                       <p className="text-[9px] text-blue-600 mt-2">{state.linkPreviewData.domain}</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-neutral-600">
                      <ImageIcon className="w-8 h-8 opacity-20" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{state.contentType} Preview</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- STICKY BOTTOM ACTION BAR --- */}
      <div className="fixed bottom-0 left-0 right-0 md:right-96 p-4 bg-black/90 backdrop-blur-md border-t border-neutral-800 z-40 flex gap-2">
        <button className="flex-1 py-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-xl text-sm font-bold transition-all disabled:opacity-50" disabled={isSubmitting}>
          Guardar Borrador
        </button>
        <button 
          onClick={handlePublish}
          disabled={isSubmitting}
          className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl text-sm font-bold shadow-[0_0_20px_rgba(147,51,234,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {state.scheduledFor ? "Programar" : "Publicar Ahora"}
        </button>
      </div>

    </div>
  );
}
