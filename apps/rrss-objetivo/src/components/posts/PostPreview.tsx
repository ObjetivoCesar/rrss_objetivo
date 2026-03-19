import { Play, Image as ImageIcon } from "lucide-react";

interface PostPreviewProps {
  platform: string;
  contentText: string;
  mediaUrls?: string[];
}

export default function PostPreview({ platform, contentText, mediaUrls }: PostPreviewProps) {
  // Configuración visual por plataforma inspirada en herramientas pro (Metricool/Hootsuite)
  const PLATFORM_STYLES: Record<string, { headerBg: string, icon: string, name: string }> = {
    facebook: { headerBg: "bg-blue-600", icon: "📘", name: "Facebook" },
    instagram: { headerBg: "bg-pink-600", icon: "📸", name: "Instagram" },
    tiktok: { headerBg: "bg-cyan-600", icon: "🎵", name: "TikTok" },
    linkedin: { headerBg: "bg-sky-600", icon: "💼", name: "LinkedIn" },
    youtube: { headerBg: "bg-red-600", icon: "▶️", name: "YouTube" },
  };

  const style = PLATFORM_STYLES[platform] || { headerBg: "bg-neutral-600", icon: "💬", name: "Genérico" };

  /**
   * 🛠️ Normaliza URLs para el UI local.
   */
  const normalizeUrl = (url: string) => {
    if (!url) return "";
    if (url.includes("/api/ai/image-proxy")) {
      const parts = url.split("/api/ai/image-proxy");
      return "/api/ai/image-proxy" + parts[parts.length - 1];
    }
    return url;
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Header falso */}
      <div className={`${style.headerBg} px-4 py-2 flex items-center gap-2`}>
        <span className="text-sm">{style.icon}</span>
        <span className="text-xs font-bold text-white tracking-wider uppercase">{style.name} Preview</span>
      </div>

      {/* Contenido (Media si existe) */}
      {mediaUrls && mediaUrls.length > 0 && (
        <div className="relative w-full aspect-square bg-neutral-950 flex items-center justify-center border-b border-neutral-800">
          {mediaUrls[0].endsWith(".mp4") ? (
             <div className="absolute inset-0 flex items-center justify-center bg-black/50">
               <Play className="w-12 h-12 text-white opacity-80" />
             </div>
          ) : (
            <img 
              src={normalizeUrl(mediaUrls[0])} 
              alt="Preview" 
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
              className="w-full h-full object-cover" 
            />
          )}
        </div>
      )}

      {/* Texto del post */}
      <div className="p-4 space-y-3">
        {/* Fake avatar/name */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-neutral-800" />
          <div className="space-y-1">
            <div className="w-24 h-2.5 bg-neutral-800 rounded-full" />
            <div className="w-16 h-2 bg-neutral-800/50 rounded-full" />
          </div>
        </div>
        
        <p className="text-sm text-neutral-300 whitespace-pre-wrap break-words leading-relaxed">
          {contentText || "Escribe algo para ver la previsualización..."}
        </p>
      </div>
    </div>
  );
}
