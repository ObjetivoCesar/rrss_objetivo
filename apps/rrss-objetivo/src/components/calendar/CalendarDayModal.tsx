"use client";

import { X, Clock, CheckCircle, AlertCircle, Zap, PlusCircle, Check, Loader2, ImageIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

interface CalendarDayPost {
  id: string;
  content_text: string;
  platforms: string[];
  status: string;
  scheduled_for: string;
  media_urls?: string[];
  metrics_snapshot?: { category?: string };
}

interface CalendarDayModalProps {
  date: string; // "2026-03-13"
  posts: CalendarDayPost[];
  onClose: () => void;
  onPostUpdated?: () => void; // callback para refrescar el calendario
}

// Badges de plataforma con colores oficiales
const PLATFORM_BADGE: Record<string, { label: string; cls: string }> = {
  instagram: { label: "IG", cls: "bg-pink-500/15 text-pink-400 border-pink-500/30" },
  facebook:  { label: "FB", cls: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  linkedin:  { label: "LI", cls: "bg-sky-500/15 text-sky-400 border-sky-500/30" },
  tiktok:    { label: "TK", cls: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30" },
  youtube:   { label: "YT", cls: "bg-red-500/15 text-red-400 border-red-500/30" },
};

// Configuración de estado del post
const STATUS_CONFIG: Record<string, { icon: ReactNode; label: string; color: string }> = {
  draft_ai: {
    icon: <Zap className="w-3 h-3" />,
    label: "Borrador IA",
    color: "text-purple-400 bg-purple-500/10 border-purple-500/30",
  },
  pending: {
    icon: <Clock className="w-3 h-3" />,
    label: "Programado",
    color: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  },
  processing: {
    icon: <Loader2 className="w-3 h-3 animate-spin" />,
    label: "Publicando…",
    color: "text-blue-400 bg-blue-500/10 border-blue-500/30",
  },
  published: {
    icon: <CheckCircle className="w-3 h-3" />,
    label: "Publicado ✓",
    color: "text-green-400 bg-green-500/10 border-green-500/30",
  },
  failed: {
    icon: <AlertCircle className="w-3 h-3" />,
    label: "Error",
    color: "text-red-400 bg-red-500/10 border-red-500/30",
  },
};

function PostCard({
  post,
  onApproved,
}: {
  post: CalendarDayPost;
  onApproved: (id: string) => void;
}) {
  const router = useRouter();
  const [approving, setApproving] = useState(false);
  const statusCfg = STATUS_CONFIG[post.status] || STATUS_CONFIG["pending"];
  const canApprove = post.status === "draft_ai";
  const hora = format(new Date(post.scheduled_for), "HH:mm");
  const thumbnail = post.media_urls?.[0];

  const handleApprove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setApproving(true);
    const { error } = await supabase
      .from("social_posts")
      .update({ status: "pending" })
      .eq("id", post.id);

    if (error) {
      toast.error("No se pudo aprobar el post");
    } else {
      toast.success("✓ Post aprobado y programado");
      onApproved(post.id);
    }
    setApproving(false);
  };

  return (
    <div
      className="bg-neutral-800/60 border border-neutral-700/50 rounded-2xl overflow-hidden hover:border-neutral-600 transition-all group cursor-pointer"
      onClick={() => router.push(`/posts?highlight=${post.id}`)}
    >
      {/* Imagen thumbnail */}
      {thumbnail ? (
        <div className="w-full h-28 bg-neutral-900 overflow-hidden">
          <img
            src={thumbnail}
            alt="Portada del post"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      ) : (
        <div className="w-full h-16 bg-neutral-900/60 flex items-center justify-center border-b border-neutral-800">
          <ImageIcon className="w-5 h-5 text-neutral-700" />
        </div>
      )}

      <div className="p-4">
        {/* Hora + Plataformas + Status */}
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Hora prominente */}
            <span className="text-xs font-mono font-bold text-white/90 bg-neutral-700/60 px-2 py-0.5 rounded-lg">
              {hora}h
            </span>
            {/* Plataformas */}
            {(post.platforms || []).map((p) => {
              const badge = PLATFORM_BADGE[p];
              return (
                <span
                  key={p}
                  className={`text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider ${badge?.cls || "bg-neutral-700 text-neutral-300 border-neutral-600"}`}
                >
                  {badge?.label || p.slice(0, 2).toUpperCase()}
                </span>
              );
            })}
          </div>

          {/* Badge de estado */}
          <span className={`text-[9px] px-2 py-0.5 rounded-full border flex items-center gap-1 font-bold shrink-0 ${statusCfg.color}`}>
            {statusCfg.icon}
            {statusCfg.label}
          </span>
        </div>

        {/* Texto del post */}
        <p className="text-sm text-neutral-300 line-clamp-3 leading-relaxed group-hover:text-white transition-colors">
          {post.content_text}
        </p>

        {/* Botón Aprobar (solo si es draft_ai) */}
        {canApprove && (
          <button
            onClick={handleApprove}
            disabled={approving}
            className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-black text-xs font-black rounded-xl transition-all"
          >
            {approving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
            Aprobar y Programar
          </button>
        )}
      </div>
    </div>
  );
}

export default function CalendarDayModal({ date, posts, onClose, onPostUpdated }: CalendarDayModalProps) {
  const router = useRouter();
  const parsedDate = new Date(date + "T12:00:00"); // Fix timezone

  // Refresca el post localmente sin cerrar el modal
  const [localStatuses, setLocalStatuses] = useState<Record<string, string>>({});

  const handleApproved = (id: string) => {
    setLocalStatuses((prev) => ({ ...prev, [id]: "pending" }));
    onPostUpdated?.();
  };

  // Merge local status overrides
  const displayPosts = posts.map((p) => ({
    ...p,
    status: localStatuses[p.id] || p.status,
  }));

  const pendingCount = displayPosts.filter((p) => p.status === "draft_ai").length;
  const scheduledCount = displayPosts.filter((p) => p.status === "pending").length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/75 backdrop-blur-md" />

      {/* Modal */}
      <div
        className="relative bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-lg shadow-2xl shadow-black/60 overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-800 bg-gradient-to-r from-neutral-900 to-neutral-800/40 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-white capitalize">
              {format(parsedDate, "EEEE d 'de' MMMM", { locale: es })}
            </h2>
            <div className="flex items-center gap-3 mt-1">
              {posts.length === 0 ? (
                <p className="text-xs text-neutral-500">Día libre — sin posts programados</p>
              ) : (
                <>
                  <span className="text-xs text-neutral-500">{posts.length} post{posts.length > 1 ? "s" : ""}</span>
                  {pendingCount > 0 && (
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
                      {pendingCount} sin aprobar
                    </span>
                  )}
                  {scheduledCount > 0 && (
                    <span className="text-[10px] font-bold text-green-400 bg-green-500/10 border border-green-500/30 px-2 py-0.5 rounded-full">
                      {scheduledCount} programados
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-all shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content scrollable */}
        <div className="p-4 space-y-3 overflow-y-auto flex-1">
          {displayPosts.length === 0 ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center mx-auto">
                <PlusCircle className="w-7 h-7 text-neutral-600" />
              </div>
              <div>
                <p className="text-neutral-400 text-sm font-medium">Día libre</p>
                <p className="text-neutral-600 text-xs mt-1">No tienes contenido para esta fecha</p>
              </div>
              <button
                onClick={() => router.push(`/editor?date=${date}`)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl transition-all"
              >
                Crear post para este día
              </button>
            </div>
          ) : (
            displayPosts.map((post) => (
              <PostCard key={post.id} post={post} onApproved={handleApproved} />
            ))
          )}
        </div>

        {/* Footer */}
        {displayPosts.length > 0 && (
          <div className="px-4 py-3 border-t border-neutral-800 flex items-center justify-between shrink-0">
            <span className="text-xs text-neutral-600">Clic en un post → ir al editor</span>
            <button
              onClick={() => router.push(`/editor?date=${date}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Añadir post
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
