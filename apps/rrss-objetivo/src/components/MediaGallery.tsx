"use client";

import { useState, useEffect } from "react";
import { 
  Search, Image as ImageIcon, Video, Folder, 
  Trash2, Link2, Plus, X, Loader2, Check, RefreshCw
} from "lucide-react";
import toast from "react-hot-toast";

interface MediaAsset {
  id: string;
  url: string;
  filename: string;
  type: 'image' | 'video';
  category: string;
  created_at: string;
}

interface MediaGalleryProps {
  onSelect?: (url: string) => void;
  isPicker?: boolean;
}

const CATEGORIES = [
  { id: 'all', label: 'Todos', icon: Folder },
  { id: 'general', label: 'General', icon: ImageIcon },
  { id: 'marketing', label: 'Marketing', icon: Folder },
  { id: 'personal-brand', label: 'Marca Personal', icon: Folder },
];

export default function MediaGallery({ onSelect, isPicker = false }: MediaGalleryProps) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchAssets();
  }, [activeCategory]);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        category: activeCategory,
        search: search
      });
      const res = await fetch(`/api/media?${params}`);
      const data = await res.json();
      if (data.success) {
        setAssets(data.assets);
      }
    } catch (error) {
      console.error("Error fetching assets:", error);
      toast.error("No se pudieron cargar los archivos");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que quieres eliminar este archivo?")) return;
    try {
      setDeletingId(id);
      const res = await fetch(`/api/media?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setAssets(assets.filter(a => a.id !== id));
        toast.success("Archivo eliminado");
      }
    } catch (error) {
      toast.error("Error al eliminar");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      const res = await fetch('/api/media/sync', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        toast.success(`Sincronizados ${data.count} archivos de Bunny.net`);
        fetchAssets();
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast.error("Error al sincronizar: " + error.message);
    } finally {
      setSyncing(false);
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Enlace copiado");
  };

  const filteredAssets = assets.filter(a => 
    a.filename.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-black/40 backdrop-blur-xl border border-neutral-800 rounded-3xl overflow-hidden">
      {/* Header / Sidebar Control */}
      <div className="p-6 border-b border-neutral-800 bg-neutral-900/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Folder className="w-5 h-5 text-blue-500" />
              Galería de Medios
            </h2>
            <p className="text-sm text-neutral-400">Organiza y reutiliza tus contenidos</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleSync}
              disabled={syncing}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all ${
                syncing 
                ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 active:scale-95'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Sincronizando...' : 'Sincronizar Bunny.net'}
            </button>

            <div className="relative flex-1 min-w-[280px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input 
                type="text" 
                placeholder="Buscar por nombre..."
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-800/50 border border-neutral-700 rounded-2xl text-sm focus:border-blue-500/50 outline-none transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchAssets()}
              />
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  isActive 
                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                  : 'bg-neutral-800/30 text-neutral-400 border border-transparent hover:bg-neutral-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid Content */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-neutral-800">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-neutral-500 text-sm">Cargando galería...</p>
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 bg-neutral-900 rounded-full flex items-center justify-center mb-4">
              <ImageIcon className="w-8 h-8 text-neutral-700" />
            </div>
            <p className="text-neutral-400 font-medium">No se encontraron archivos</p>
            <p className="text-xs text-neutral-600 mt-1">Sube algo nuevo o cambia el filtro</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredAssets.map((asset) => (
              <div 
                key={asset.id} 
                className="group relative flex flex-col bg-neutral-900/40 border border-neutral-800 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all aspect-square"
              >
                {/* Media Preview */}
                <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center">
                  {asset.type === 'video' ? (
                    <div className="flex flex-col items-center gap-2">
                      <Video className="w-10 h-10 text-blue-500/50" />
                      <span className="text-[10px] text-neutral-500 font-mono">VIDEO</span>
                    </div>
                  ) : (
                    <img 
                      src={asset.url} 
                      alt={asset.filename} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                  
                  {/* Hover Actions Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {isPicker ? (
                      <button 
                        onClick={() => onSelect?.(asset.url)}
                        className="p-3 bg-blue-500 hover:bg-blue-400 text-white rounded-2xl transition-all transform hover:scale-110 shadow-xl"
                        title="Seleccionar e insertar"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                    ) : (
                      <button 
                        onClick={() => copyUrl(asset.url)}
                        className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl backdrop-blur-md transition-all"
                        title="Copiar enlace"
                      >
                        <Link2 className="w-5 h-5" />
                      </button>
                    )}
                    
                    <button 
                      onClick={() => handleDelete(asset.id)}
                      disabled={deletingId === asset.id}
                      className="p-3 bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white rounded-2xl transition-all"
                      title="Eliminar"
                    >
                      {deletingId === asset.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Footer Info */}
                <div className="p-3 bg-neutral-900/60 border-t border-neutral-800 backdrop-blur-sm">
                   <p className="text-[10px] text-white font-medium truncate mb-0.5">{asset.filename}</p>
                   <div className="flex items-center justify-between">
                     <span className="text-[9px] text-neutral-500 uppercase">{asset.category}</span>
                     <span className="text-[9px] text-neutral-600">{new Date(asset.created_at).toLocaleDateString()}</span>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
