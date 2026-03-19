"use client";

import { X, Clock, CheckCircle, AlertCircle, Zap, Instagram, Facebook, Linkedin, PlusCircle } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

interface CalendarDayPost {
  id: string;
  content_text: string;
  platforms: string[];
  status: string;
  scheduled_for: string;
  metrics_snapshot?: { category?: string };
}

interface CalendarDayModalProps {
  date: string; // "2026-03-13"
  posts: CalendarDayPost[];
  onClose: () => void;
}

const PLATFORM_ICONS: Record<string, ReactNode> = {
  instagram: <Instagram className="w-3.5 h-3.5" />,
  facebook: <Facebook className="w-3.5 h-3.5" />,
  linkedin: <Linkedin className="w-3.5 h-3.5" />,
};

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  facebook: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  linkedin: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  tiktok: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
};

const STATUS_CONFIG: Record<string, { icon: ReactNode; label: string; color: string }> = {
  draft_ai: {
    icon: <Zap className="w-3 h-3" />,
    label: "Borrador IA",
    color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  },
  pending: {
    icon: <Clock className="w-3 h-3" />,
    label: "Programado",
    color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  },
  published: {
    icon: <CheckCircle className="w-3 h-3" />,
    label: "Publicado",
    color: "text-green-400 bg-green-500/10 border-green-500/20",
  },
  failed: {
    icon: <AlertCircle className="w-3 h-3" />,
    label: "Falló",
    color: "text-red-400 bg-red-500/10 border-red-500/20",
  },
};

export default function CalendarDayModal({ date, posts, onClose }: CalendarDayModalProps) {
  const router = useRouter();
  const parsedDate = new Date(date + "T12:00:00"); // Fix timezone

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-lg shadow-2xl shadow-black/50 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-800 bg-gradient-to-r from-neutral-900 to-neutral-800/50">
          <div>
            <h2 className="text-lg font-bold text-white capitalize">
              {format(parsedDate, "EEEE d 'de' MMMM", { locale: es })}
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              {posts.length === 0
                ? "No hay posts programados"
                : `${posts.length} post${posts.length > 1 ? "s" : ""} programado${posts.length > 1 ? "s" : ""}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
          {posts.length === 0 ? (
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
            posts.map((post) => {
              const statusCfg = STATUS_CONFIG[post.status] || STATUS_CONFIG["pending"];
              return (
                <div
                  key={post.id}
                  className="bg-neutral-800/50 border border-neutral-700/50 rounded-2xl p-4 hover:border-neutral-600 transition-all cursor-pointer group"
                  onClick={() => router.push(`/posts?highlight=${post.id}`)}
                >
                  {/* Top row: platforms + status */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex flex-wrap gap-1.5">
                      {post.metrics_snapshot?.category && (
                        <span className="text-[9px] bg-purple-500/10 border border-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full uppercase font-black tracking-widest">
                          {post.metrics_snapshot.category}
                        </span>
                      )}
                      {(post.platforms || []).map((p) => (
                        <span
                          key={p}
                          className={`text-[9px] px-2 py-0.5 rounded-full border uppercase font-bold flex items-center gap-1 ${PLATFORM_COLORS[p] || "bg-neutral-700 text-neutral-300 border-neutral-600"}`}
                        >
                          {PLATFORM_ICONS[p]}
                          {p}
                        </span>
                      ))}
                    </div>
                    <span className={`text-[9px] px-2.5 py-1 rounded-full border flex items-center gap-1 font-bold shrink-0 ${statusCfg.color}`}>
                      {statusCfg.icon}
                      {statusCfg.label}
                    </span>
                  </div>

                  {/* Content */}
                  <p className="text-sm text-neutral-300 line-clamp-3 leading-relaxed group-hover:text-white transition-colors">
                    {post.content_text}
                  </p>

                  {/* Time */}
                  <p className="text-[10px] text-neutral-600 font-mono mt-3">
                    {format(new Date(post.scheduled_for), "HH:mm", { locale: es })}h
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {posts.length > 0 && (
          <div className="px-4 py-3 border-t border-neutral-800 flex items-center justify-between">
            <span className="text-xs text-neutral-600">Click en un post para editarlo</span>
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
