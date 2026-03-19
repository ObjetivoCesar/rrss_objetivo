"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { CheckCircle, Clock, AlertCircle, Zap, Globe, TrendingUp, Target } from "lucide-react";

interface Stats {
  pending: number;
  published: number;
  failed: number;
  draft_ai: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ pending: 0, published: 0, failed: 0, draft_ai: 0 });
  const [nextPost, setNextPost] = useState<any>(null);
  const [activeCampaigns, setActiveCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    setLoading(true);
    const { data } = await supabase.from("social_posts").select("status, scheduled_for, content_text, platforms").order("scheduled_for", { ascending: true });
    if (data) {
      const counts: Stats = { pending: 0, published: 0, failed: 0, draft_ai: 0 };
      data.forEach((p) => {
        if (p.status in counts) counts[p.status as keyof Stats]++;
      });
      setStats(counts);
      const next = data.find((p) => p.status === "pending" && new Date(p.scheduled_for) > new Date());
      setNextPost(next || null);
      setNextPost(next || null);

      const { data: camps } = await supabase
        .from('campaigns')
        .select('*, objectives(name, emoji), social_posts(count)')
        .eq('status', 'active')
        .is('archived_at', null)
        .order('created_at', { ascending: false })
        .limit(3);
        
      if (camps) setActiveCampaigns(camps);
    }
    setLoading(false);
  }

  const KPI_CARDS = [
    { label: "Pendientes",  value: stats.pending,   icon: Clock,        color: "text-blue-600 dark:text-blue-400",   bg: "bg-blue-500/10 dark:bg-blue-500/20 border-blue-500/20 dark:border-blue-500/30 backdrop-blur-md" },
    { label: "Publicados",  value: stats.published, icon: CheckCircle,  color: "text-green-600 dark:text-green-400",  bg: "bg-green-500/10 dark:bg-green-500/20 border-green-500/20 dark:border-green-500/30 backdrop-blur-md" },
    { label: "Fallidos",    value: stats.failed,    icon: AlertCircle,  color: "text-red-600 dark:text-red-400",    bg: "bg-red-500/10 dark:bg-red-500/20 border-red-500/20 dark:border-red-500/30 backdrop-blur-md" },
    { label: "Borradores IA", value: stats.draft_ai, icon: Zap,         color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-500/10 dark:bg-purple-500/20 border-purple-500/20 dark:border-purple-500/30 backdrop-blur-md" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white drop-shadow-sm">Dashboard</h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 font-medium mt-1">Estado del sistema · {new Date().toLocaleDateString("es-EC", { weekday: "long", day: "numeric", month: "long" })}</p>
        </div>

        {/* Alerta si hay posts fallidos */}
        {stats.failed > 0 && (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-2xl px-5 py-4">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <p className="text-sm text-red-300 font-medium">
              {stats.failed} post{stats.failed > 1 ? "s" : ""} fallaron al publicar. Revisa la sección de <a href="/posts" className="underline">Publicaciones</a>.
            </p>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {KPI_CARDS.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className={`${bg} border rounded-2xl p-5 shadow-sm`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">{label}</span>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <span className={`text-3xl font-bold ${color} drop-shadow-sm`}>
                {loading ? "—" : value}
              </span>
            </div>
          ))}
        </div>

        {/* Estado del sistema + Próximo post */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Estado */}
          <div className="bg-white/40 dark:bg-black/40 border border-white/30 dark:border-white/10 backdrop-blur-xl rounded-2xl p-6 space-y-4 shadow-lg shadow-black/5 dark:shadow-black/20">
            <h2 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-neutral-600 dark:text-neutral-500" /> Estado del Sistema
            </h2>
            <div className="space-y-3">
              {[
                { label: "Make.com Webhook", status: "activo" },
                { label: "Supabase DB", status: "activo" },
                { label: "Bunny.net CDN", status: "activo" },
              ].map(({ label, status }) => (
                <div key={label} className="flex items-center justify-between bg-white/50 dark:bg-black/30 px-3 py-2 rounded-xl backdrop-blur-sm border border-white/20 dark:border-white/5">
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{label}</span>
                  <span className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 font-bold tracking-wide">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                    {status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Próximo post */}
          <div className="bg-white/40 dark:bg-black/40 border border-white/30 dark:border-white/10 backdrop-blur-xl rounded-2xl p-6 space-y-4 shadow-lg shadow-black/5 dark:shadow-black/20 flex flex-col">
            <h2 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-neutral-600 dark:text-neutral-500" /> Próximo Post Programado
            </h2>
            {nextPost ? (
              <div className="space-y-4 flex-1 flex flex-col justify-center">
                <p className="text-[15px] font-medium text-neutral-800 dark:text-white line-clamp-3 leading-relaxed">"{nextPost.content_text}"</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {(nextPost.platforms || []).map((p: string) => (
                    <span key={p} className="text-[10px] px-2 py-0.5 bg-neutral-800 rounded-full text-neutral-400 uppercase font-bold">{p}</span>
                  ))}
                </div>
                <p className="text-xs text-neutral-500 font-mono">
                  {new Date(nextPost.scheduled_for).toLocaleString("es-EC")}
                </p>
              </div>
            ) : (
              <p className="text-sm text-neutral-500">No hay posts pendientes programados.</p>
            )}
          </div>
        </div>

        {/* Campañas Activas */}
        <div className="bg-white/40 dark:bg-black/40 border border-white/30 dark:border-white/10 backdrop-blur-xl rounded-2xl p-6 space-y-4 shadow-xl shadow-black/5 dark:shadow-black/20">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-500 dark:text-indigo-400" /> Campañas Activas
            </h2>
            <a href="/campaigns" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">Ver todas →</a>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {activeCampaigns.length === 0 ? (
              <div className="col-span-3 text-center py-6 text-sm text-neutral-500 border border-dashed border-neutral-800 rounded-xl">
                No hay campañas activas
              </div>
            ) : (
              activeCampaigns.map(camp => (
                <a key={camp.id} href="/campaigns" className="flex flex-col bg-white/60 dark:bg-black/50 backdrop-blur-md border border-white/40 dark:border-white/10 rounded-xl p-5 hover:border-indigo-400/50 dark:hover:border-indigo-500/50 hover:shadow-lg transition-all group">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-bold text-neutral-700 dark:text-neutral-300 px-2.5 py-1 bg-white/50 dark:bg-black/50 border border-white/20 dark:border-white/5 rounded-md truncate max-w-full shadow-sm">
                      {camp.objectives?.emoji} {camp.objectives?.name}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-4 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 leading-tight">{camp.name}</h3>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-neutral-300/50 dark:border-neutral-700/50">
                    <span className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">{camp.social_posts?.[0]?.count || 0} posts vinculados</span>
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                  </div>
                </a>
              ))
            )}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
