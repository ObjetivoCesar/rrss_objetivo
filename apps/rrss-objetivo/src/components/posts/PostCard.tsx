import { useState, useEffect } from "react";
import { CheckCircle, Edit, Trash2, Clock, AlertCircle, Play, Undo2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import toast from "react-hot-toast";

interface PostCardProps {
  post: any;
  onApprove: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onEdit: (post: any) => void;
}

export default function PostCard({ post, onApprove, onDelete, onEdit }: PostCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteTimer, setDeleteTimer] = useState(3);
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isDeleting && deleteTimer > 0) {
      interval = setInterval(() => setDeleteTimer(prev => prev - 1), 1000);
    } else if (isDeleting && deleteTimer === 0) {
      onDelete(post.id);
      setIsDeleting(false); // Reset just in case component unmounts late
    }
    return () => clearInterval(interval);
  }, [isDeleting, deleteTimer, post.id, onDelete]);

  const handleDeleteClick = () => {
    setIsDeleting(true);
    setDeleteTimer(3);
  };

  const handleUndoDelete = () => {
    setIsDeleting(false);
    toast("Eliminación cancelada", { icon: "↩️" });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published": return "text-green-400 bg-green-500/10 border-green-500/20";
      case "pending": return "text-blue-400 bg-blue-500/10 border-blue-500/20";
      case "failed": return "text-red-400 bg-red-500/10 border-red-500/20";
      case "draft_ai": return "text-purple-400 bg-purple-500/10 border-purple-500/20";
      default: return "text-neutral-400 bg-neutral-800 border-neutral-700";
    }
  };

  /**
   * 🛠️ Normaliza URLs para el UI local.
   * Si es una URL absoluta de nuestro proxy pero estamos en localhost,
   * la convertimos a relativa para que el explorador la cargue bien.
   */
  const normalizeUrl = (url: string) => {
    if (!url) return "";
    if (url.includes("/api/ai/image-proxy")) {
      const parts = url.split("/api/ai/image-proxy");
      return "/api/ai/image-proxy" + parts[parts.length - 1];
    }
    return url;
  };

  // Si está en proceso de borrado, mostramos el UI temporal de Undo
  if (isDeleting) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 backdrop-blur-md rounded-2xl p-6 flex flex-col items-center justify-center space-y-3 h-[200px] transition-all">
        <p className="text-red-600 dark:text-red-400 text-sm font-bold animate-pulse">Eliminando en {deleteTimer} segundos...</p>
        <button 
          onClick={handleUndoDelete}
          className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-800 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:border-neutral-400 dark:hover:border-neutral-500 transition-all text-sm font-bold shadow-sm"
        >
          <Undo2 className="w-4 h-4" /> Deshacer Mágicamente
        </button>
      </div>
    );
  }

  return (
    <div className={`
      relative group flex flex-col
      bg-white/80 dark:bg-neutral-900/60 
      backdrop-blur-xl
      border ${post.status === "failed" ? "border-red-500/30" : "border-neutral-200 dark:border-neutral-800"} 
      rounded-3xl p-6 
      transition-all duration-300 ease-out
      hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.4)]
      hover:border-blue-500/30 dark:hover:border-neutral-600
      hover:-translate-y-1
    `}>
      {/* Cabecera: Status y Plataformas */}
      <div className="flex justify-between items-start gap-2 mb-4">
        <div className="flex flex-wrap gap-1.5">
          {post.metrics_snapshot?.category && (
            <span className="text-[9px] bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-lg uppercase font-black tracking-widest">
              {post.metrics_snapshot.category}
            </span>
          )}
          {(post.platforms || []).map((p: string) => (
             <span key={p} className="text-[9px] bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 px-2.5 py-1 rounded-lg uppercase font-bold tracking-wider">
               {p}
             </span>
          ))}
        </div>
        <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg border flex items-center gap-1.5 tracking-tighter ${getStatusColor(post.status)}`}>
          {post.status === "published" && <CheckCircle className="w-3 h-3" />}
          {post.status === "pending" && <Clock className="w-3 h-3" />}
          {post.status === "failed" && <AlertCircle className="w-3 h-3" />}
          {post.status.toUpperCase()}
        </span>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 space-y-4">
        <p className="text-sm text-neutral-700 dark:text-neutral-300 line-clamp-3 leading-relaxed font-medium">
          {post.content_text}
        </p>

        {/* Manejo de imágenes (Soporta media_url string y media_urls array) */}
        {(post.media_urls?.length > 0 || post.media_url) && (
          <div className="flex gap-2.5 overflow-x-auto scrollbar-hide py-1">
            {(post.media_urls || (post.media_url ? [post.media_url] : [])).map((url: string, i: number) => (
              <div key={i} className="relative w-20 h-20 rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 shrink-0 shadow-sm group/media">
                <div className="absolute inset-0 bg-black/0 group-hover/media:bg-black/20 transition-colors z-10" />
                {url.endsWith(".mp4") ? (
                  <div className="w-full h-full bg-neutral-900 flex items-center justify-center">
                    <Play className="w-5 h-5 text-white/50" />
                  </div>
                ) : (
                  <img src={normalizeUrl(url)} alt="Media" className="w-full h-full object-cover transition-transform duration-500 group-hover/media:scale-110" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Metadata & Actions (ApproveBar) */}
      <div className="mt-6 pt-5 border-t border-neutral-100 dark:border-neutral-800/80 flex flex-wrap items-center justify-between gap-3">
        <div className="text-[10px] text-neutral-500 dark:text-neutral-500 font-mono font-bold tracking-tight">
          {format(new Date(post.scheduled_for), "d MMM, HH:mm", { locale: es })}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {(post.status === "draft_ai" || post.status === "failed") && (
            <button
              onClick={() => onApprove(post.id)}
              className="bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-600 dark:text-green-400 px-3.5 py-1.5 rounded-xl text-[11px] font-black tracking-wide transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <CheckCircle className="w-3.5 h-3.5" /> Aprobar
            </button>
          )}

          <button
            onClick={() => onEdit(post)}
            className="bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 px-3.5 py-2 rounded-xl text-[11px] font-black tracking-wide transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <Edit className="w-3.5 h-3.5" /> Editar
          </button>

          <button
            onClick={handleDeleteClick}
            className="bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 text-red-500/80 p-2 rounded-xl transition-all active:scale-90"
            title="Eliminar Post"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
