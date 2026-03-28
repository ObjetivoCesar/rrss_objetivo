"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import PostCard from "@/components/posts/PostCard";
import EditPostModal from "@/components/posts/EditPostModal";
import PostPreview from "@/components/posts/PostPreview";
import { ListChecks, Eye, Filter, Play } from "lucide-react";

type FilterStatus = "all" | "draft_ai" | "pending" | "published" | "failed";

export default function PostsPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>("all");
  
  // States para Modales
  const [editingPost, setEditingPost] = useState<any | null>(null);
  const [previewPost, setPreviewPost] = useState<any | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    setLoading(true);
    const { data, error } = await supabase
      .from("social_posts")
      .select("*")
      .is('archived_at', null)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Error cargando posts: " + error.message);
    } else {
      setPosts(data || []);
    }
    setLoading(false);
  }

  // --- ACTIONS --- //

  const handleApprove = async (id: string) => {
    // Si queremos, podemos usar loading state específico por id, 
    // pero toast.promise es más elegante aquí
    const promise = (async () => {
      const { error } = await supabase
        .from("social_posts")
        .update({ status: "pending" })
        .eq("id", id);
      if (error) throw error;
    })();

    toast.promise(promise, {
      loading: 'Aprobando...',
      success: 'Post aprobado y en cola!',
      error: 'Error al aprobar',
    });

    await promise;
    // Update local state optimistic UI
    setPosts(prev => prev.map(p => p.id === id ? { ...p, status: "pending" } : p));
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/posts/delete?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo eliminar");
      
      toast.success("Post eliminado definitivamente");
      setPosts(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      toast.error("No se pudo eliminar: " + err.message);
    }
  };

    const handleSaveEdit = async (updatedPost: any) => {
    const promise = (async () => {
      const res = await fetch('/api/posts/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: updatedPost.id,
          content_text: updatedPost.content_text,
          platforms: updatedPost.platforms,
          scheduled_for: updatedPost.scheduled_for,
          status: updatedPost.status
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo actualizar");
      return data;
    })();

    toast.promise(promise, {
      loading: 'Guardando cambios...',
      success: 'Post actualizado correctamente',
      error: (err: any) => `Error al guardar: ${err.message}`
    });

    try {
      await promise;
      setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
      setEditingPost(null);
    } catch (e) {
      // toast ya maneja el error
    }
  };

  // --- RENDER --- //

  const filteredPosts = posts.filter(p => filter === "all" ? true : p.status === filter);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Header & Filtros */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white drop-shadow-sm flex items-center gap-2">
              <ListChecks className="w-6 h-6 text-blue-600 dark:text-blue-500" /> Banco de Publicaciones
            </h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 font-medium">Revisa, aprueba o edita los borradores generados por Donna.</p>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={async () => {
                const promise = fetch('/api/cron/trigger', { method: 'POST' });
                toast.promise(promise, {
                  loading: 'Disparando scheduler...',
                  success: 'Scheduler ejecutado con éxito',
                  error: 'Error al ejecutar scheduler',
                });
                await promise;
                fetchPosts();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-300 rounded-xl text-xs font-bold transition-all"
            >
              <Play className="w-4 h-4 text-green-500" /> Disparar Scheduler (Manual)
            </button>
          </div>
          <div className="flex items-center gap-2 bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm p-1 rounded-xl shrink-0 overflow-x-auto">
            <Filter className="w-4 h-4 text-neutral-500 dark:text-neutral-400 ml-2 shrink-0" />
            {[
              { id: "all", label: "Todos" },
              { id: "draft_ai", label: "Revisión IA" },
              { id: "pending", label: "Aprobados" },
              { id: "published", label: "En Redes" },
              { id: "failed", label: "Errores" }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id as FilterStatus)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                  filter === f.id 
                    ? "bg-blue-600/20 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30" 
                    : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-black/50"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Lista / Grid de Posts */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-white/40 dark:bg-black/40 backdrop-blur-md rounded-2xl border border-white/20 dark:border-white/10" />
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-20 bg-white/30 dark:bg-black/20 backdrop-blur-sm rounded-3xl border border-neutral-300 dark:border-neutral-800 border-dashed">
            <p className="text-neutral-500 dark:text-neutral-400 text-sm font-medium">No hay posts en esta categoría.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {filteredPosts.map(post => (
              <div key={post.id} className="relative group">
                <PostCard 
                  post={post} 
                  onApprove={handleApprove}
                  onDelete={handleDelete}
                  onEdit={() => setEditingPost(post)}
                />
                
                {/* Botoncito para previsualizar encima de la card */}
                <button 
                  onClick={() => setPreviewPost(post)}
                  className="absolute top-4 right-4 bg-white/90 dark:bg-neutral-900/90 hover:bg-white dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white p-2 rounded-xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 text-xs font-bold shadow-xl shadow-black/10 dark:shadow-black/30"
                >
                  <Eye className="w-4 h-4" /> Preview
                </button>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* --- MODALES --- */}

      {/* Edit Modal */}
      {editingPost && (
        <EditPostModal 
          post={editingPost} 
          onClose={() => setEditingPost(null)}
          onSave={handleSaveEdit}
        />
      )}

      {/* Preview Modal (muy simple wrapper para PostPreview) */}
      {previewPost && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm cursor-pointer"
          onClick={() => setPreviewPost(null)}
        >
          <div className="w-full max-w-sm max-h-[90vh] overflow-y-auto rounded-3xl hide-scrollbar" onClick={(e) => e.stopPropagation()}>
            <p className="text-center text-xs text-neutral-400 mb-4 flex items-center justify-center gap-2 sticky top-0 bg-black/80 py-2 z-10">
              <Eye className="w-4 h-4" /> Previsualización simulada — Haga clic fuera para cerrar
            </p>
            {/* Si el post tiene múltiples redes, renderizamos 1 pestaña por red (simplificado: renderizamos la primera del array por ahora) */}
            <PostPreview 
              platform={previewPost.platforms?.[0] || "facebook"} 
              contentText={previewPost.content_text}
              mediaUrls={previewPost.media_urls || (previewPost.media_url ? [previewPost.media_url] : [])}
            />
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
