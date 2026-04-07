import { useState, useEffect } from "react";
import { X, Save } from "lucide-react";

interface EditPostModalProps {
  post: any;
  onClose: () => void;
  onSave: (updatedPost: any) => Promise<void>;
}

const AVAILABLE_PLATFORMS = [
  { id: "facebook", label: "FB" },
  { id: "instagram", label: "IG" },
  { id: "linkedin", label: "IN" },
  { id: "tiktok", label: "TK" },
  { id: "youtube", label: "YT" },
];

export default function EditPostModal({ post, onClose, onSave }: EditPostModalProps) {
  const [content, setContent] = useState(post?.content_text || "");
  const [platforms, setPlatforms] = useState<string[]>(post?.platforms || []);
  const [scheduledAt, setScheduledAt] = useState(post?.scheduled_for ? new Date(post.scheduled_for).toISOString().slice(0, 16) : "");
  // Default: siempre aprobado. El usuario puede descheckear si solo quiere guardar el borrador.
  const [shouldApprove, setShouldApprove] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Escapar para cerrar con tecla ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!post) return null;

  const togglePlatform = (id: string) => {
    setPlatforms(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    // Primero, guardar los cambios en base de datos
    await onSave({ 
      ...post, 
      content_text: content, 
      platforms,
      scheduled_for: new Date(scheduledAt).toISOString(),
      status: shouldApprove ? "pending" : post.status
    });

    // Si el usuario lo aprueba y la fecha de programación es en el pasado o ahora,
    // disparamos el scheduler automáticamente para publicación instantánea.
    if (shouldApprove) {
      // Comparamos la fecha programada vs ahora, ambas en hora local.
      // new Date(scheduledAt) puede tener offset si scheduledAt no incluye timezone,
      // así que construimos la fecha explícitamente desde el string datetime-local.
      const scheduledTime = scheduledAt ? new Date(scheduledAt).getTime() : 0;
      const now = Date.now();
      // Si el post debe publicarse en los próximos 5 minutos (o ya pasó), disparamos el scheduler.
      if (scheduledTime <= now + 5 * 60 * 1000) {
        try {
          await fetch('/api/cron/trigger', { method: 'POST' });
        } catch (e) {
          console.error("Error auto-triggering cron:", e);
        }
      }
    }

    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[32px] w-full max-w-2xl overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] flex flex-col max-h-[90vh] transition-all animate-in fade-in zoom-in duration-300">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-neutral-100 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-xl">
          <div className="space-y-1">
            <h3 className="text-xl font-black text-neutral-900 dark:text-white tracking-tight">Editar Publicación</h3>
            <p className="text-[11px] text-neutral-500 font-bold uppercase tracking-widest">Ajusta los detalles de Donna</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-2xl transition-all active:scale-90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 overflow-y-auto space-y-8 custom-scrollbar">
          {/* Editor de Texto */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-[0.2em]">Contenido del Post</label>
            <div className="relative group">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-44 bg-neutral-50 dark:bg-neutral-950/50 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 text-sm text-neutral-700 dark:text-neutral-200 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all resize-none font-medium leading-relaxed"
                placeholder="¿Qué quieres decir al mundo?"
              />
              <div className="absolute bottom-4 right-4 flex items-center gap-2">
                <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${content.length > 2200 ? "bg-red-500/10 text-red-500" : "bg-neutral-200/50 dark:bg-neutral-800/50 text-neutral-500"}`}>
                  {content.length} / 2200
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Toggle Platforms */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-[0.2em]">Canales de Envío</label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_PLATFORMS.map((plat) => {
                  const isSelected = platforms.includes(plat.id);
                  return (
                    <button
                      key={plat.id}
                      onClick={() => togglePlatform(plat.id)}
                      className={`px-4 py-2 rounded-xl text-[11px] font-black border transition-all active:scale-95 ${
                        isSelected 
                          ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20" 
                          : "bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-600"
                      }`}
                    >
                      {plat.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Programación de Fecha y Hora */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-[0.2em]">Programación</label>
              <input 
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full bg-neutral-50 dark:bg-neutral-950/50 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-neutral-700 dark:text-neutral-200 focus:outline-none focus:border-blue-500/50 transition-all font-bold"
              />
            </div>
          </div>

          {/* Opción de Aprobación */}
          <div className="flex items-center gap-4 bg-blue-500/[0.03] dark:bg-blue-500/[0.05] border border-blue-500/10 dark:border-blue-500/10 rounded-[24px] p-5 group cursor-pointer" onClick={() => setShouldApprove(!shouldApprove)}>
            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${shouldApprove ? "bg-blue-600 border-blue-600 shadow-lg shadow-blue-500/30" : "border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"}`}>
              {shouldApprove && <Save className="w-3.5 h-3.5 text-white" />}
            </div>
            <div className="space-y-0.5">
              <p className="text-sm font-black text-neutral-900 dark:text-blue-400 tracking-tight">Listo para publicar</p>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-500 font-bold uppercase">Aprobar y agendar para envío automático</p>
            </div>
          </div>

          {/* Advertencia Media */}
          {post.media_urls && post.media_urls.length > 0 && (
            <div className="flex items-start gap-3 bg-neutral-50 dark:bg-neutral-800/30 border border-neutral-100 dark:border-neutral-800 rounded-2xl p-4">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed font-medium">
                Este post incluye <span className="text-neutral-900 dark:text-white font-bold">{post.media_urls.length} adjuntos</span>. Para cambios visuales profundos usa el OmniEditor.
              </p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-6 px-8 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900 flex justify-end items-center gap-4">
          <button 
            onClick={onClose}
            className="px-6 py-3 rounded-2xl text-[11px] font-black text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-all uppercase tracking-widest"
            disabled={isSaving}
          >
            Ignorar
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className={`flex items-center gap-2.5 px-8 py-3 rounded-2xl text-[11px] font-black transition-all shadow-xl uppercase tracking-widest ${shouldApprove ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20" : "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:scale-[1.02] dark:shadow-white/5"}`}
          >
            {isSaving ? (
              <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {shouldApprove ? "Guardar y Agendar" : "Guardar Cambios"}
          </button>
        </div>

      </div>
    </div>
  );
}
