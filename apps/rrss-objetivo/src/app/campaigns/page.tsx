"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState, useEffect } from "react";
import { 
  Target, Plus, PlusCircle, LayoutGrid, 
  MoreVertical, Calendar, BarChart3, Clock, CheckCircle2,
  Trash2, X, Sparkles, Pencil
} from "lucide-react";
import toast from "react-hot-toast";

interface Campaign {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'completed';
  postsCount: number;
  created_at: string;
}

interface Objective {
  id: string;
  name: string;
  description: string;
  color: string;
  emoji: string;
  campaigns: Campaign[];
  strategy_session?: { id: string; name: string } | null;
}

export default function CampaignsPage() {
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [selectedObjId, setSelectedObjId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Create Modals
  const [showObjModal, setShowObjModal] = useState(false);
  const [showCampModal, setShowCampModal] = useState(false);
  
  // Edit Modals
  const [editObjModal, setEditObjModal] = useState<Objective | null>(null);
  const [editCampModal, setEditCampModal] = useState<{ campaign: Campaign, objectiveId: string } | null>(null);
  
  // Delete Modals
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  
  // Reassignment State
  const [fallbackObjId, setFallbackObjId] = useState<string>("new");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  
  // Forms
  const [newObj, setNewObj] = useState({ name: "", description: "", emoji: "🎯", color: "#6366f1" });
  const [newCamp, setNewCamp] = useState({ name: "", description: "" });

  useEffect(() => {
    fetchData();
    
    const handleRefresh = () => fetchData();
    window.addEventListener('donna-refresh-campaigns', handleRefresh);
    
    return () => {
      window.removeEventListener('donna-refresh-campaigns', handleRefresh);
    };
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const res = await fetch("/api/campaigns");
      const data = await res.json();
      if (res.ok) {
        setObjectives(data);
        if (data.length > 0 && !selectedObjId) {
          setSelectedObjId(data[0].id);
        }
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast.error(error.message || "Error al cargar campañas");
    } finally {
      setLoading(false);
    }
  }

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
      
      const createdData = await res.json();
      toast.success("Objetivo creado");
      setShowObjModal(false);
      setNewObj({ name: "", description: "", emoji: "🎯", color: "#6366f1" });
      
      // Si veniamos de intentar borrar y reasignar a uno nuevo:
      if (pendingDeleteId) {
        await executeDeleteObjective(pendingDeleteId, createdData.id);
        setPendingDeleteId(null);
      } else {
        fetchData();
      }
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function handleEditObjective(e: React.FormEvent) {
    e.preventDefault();
    if (!editObjModal || !editObjModal.name) return;
    try {
      const res = await fetch(`/api/campaigns/${editObjModal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "objective",
          name: editObjModal.name,
          description: editObjModal.description,
          emoji: editObjModal.emoji,
          color: editObjModal.color
        }),
      });
      if (!res.ok) throw new Error("Error editando objetivo");
      
      toast.success("Objetivo actualizado");
      setEditObjModal(null);
      fetchData();
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
      
      toast.success("Campaña creada");
      setShowCampModal(false);
      setNewCamp({ name: "", description: "" });
      fetchData();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function handleEditCampaign(e: React.FormEvent) {
    e.preventDefault();
    if (!editCampModal || !editCampModal.campaign.name) return;
    try {
      const res = await fetch(`/api/campaigns/${editCampModal.campaign.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "campaign",
          name: editCampModal.campaign.name,
          description: editCampModal.campaign.description
        }),
      });
      if (!res.ok) throw new Error("Error editando campaña");
      
      toast.success("Campaña actualizada");
      setEditCampModal(null);
      fetchData();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function handleDeleteCampaign(id: string) {
    if (!confirm("¿Estás seguro de que quieres archivar esta campaña para empezar de cero?")) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/campaigns/${id}?type=campaign`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al archivar campaña");
      
      toast.success("Campaña archivada");
      fetchData();
    } catch (e: any) {
      setLoading(false);
      toast.error(e.message);
    }
  }

  function handleDeleteObjectivePrompt(id: string) {
    setShowDeleteModal(id);
    setFallbackObjId("new");
  }

  async function executeDeleteObjective(id: string, fallbackId: string) {
    try {
      setLoading(true);
      const res = await fetch(`/api/campaigns/${id}?type=objective&fallback=${fallbackId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al archivar objetivo y reasignar");
      
      toast.success("Objetivo archivado y contenido reasignado exitosamente");
      if (selectedObjId === id) setSelectedObjId(null);
      fetchData();
    } catch (e: any) {
      setLoading(false);
      toast.error(e.message);
    }
  }

  async function confirmDeleteObjective() {
    if (!showDeleteModal) return;
    const id = showDeleteModal;
    setShowDeleteModal(null);
    
    if (fallbackObjId === "new") {
      setPendingDeleteId(id);
      setShowObjModal(true);
      toast("Crea el nuevo objetivo para reasignarle el contenido del que estás archivando.", { icon: "ℹ️" });
    } else {
      await executeDeleteObjective(id, fallbackObjId);
    }
  }

  const selectedObjective = objectives.find((o) => o.id === selectedObjId);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white drop-shadow-sm flex items-center gap-2 tracking-tight">
              <Target className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
              Gestión de Campañas
            </h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 font-medium">Cerebro central: Objetivos estratégicos y campañas de contenido.</p>
          </div>
          <button onClick={() => setShowObjModal(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25">
            <Plus className="w-4 h-4" /> Nuevo Objetivo
          </button>
        </div>

        {/* Layout Split */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* LEFT PANEL: Objectives List */}
          <div className="w-full lg:w-1/3 xl:w-1/4 flex flex-col gap-3">
            <h2 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1 px-1">Tus Objetivos</h2>
            
            {loading ? (
              <div className="text-center py-10 text-neutral-600 dark:text-neutral-400 text-sm font-medium">Cargando...</div>
            ) : objectives.length === 0 ? (
              <div className="bg-white/40 dark:bg-black/40 border border-white/20 dark:border-white/10 backdrop-blur-md rounded-2xl p-6 text-center shadow-sm">
                <Target className="w-8 h-8 text-neutral-400 mx-auto mb-3" />
                <p className="text-sm text-neutral-500 font-medium">No hay objetivos aún</p>
              </div>
            ) : (
              objectives.map(obj => {
                const totalPosts = obj.campaigns.reduce((sum, c) => sum + c.postsCount, 0);
                const isActive = selectedObjId === obj.id;
                
                return (
                  <button
                    key={obj.id}
                    onClick={() => setSelectedObjId(obj.id)}
                    className={`text-left w-full p-4 rounded-2xl border transition-all backdrop-blur-md ${
                      isActive 
                        ? "bg-white/80 dark:bg-black/60 border-indigo-200 dark:border-indigo-500/30 shadow-lg shadow-black/5 dark:shadow-black/20" 
                        : "bg-white/40 dark:bg-black/40 border-white/30 dark:border-white/10 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:bg-white/60 dark:hover:bg-black/50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${obj.color}20`, border: `1px solid ${obj.color}40` }}>
                        <span className="text-lg">{obj.emoji}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-neutral-900 dark:text-white truncate">{obj.name}</h3>
                        <div className="flex items-center gap-3 mt-1.5 opacity-70">
                          <span className="text-xs text-neutral-400 flex items-center gap-1"><LayoutGrid className="w-3 h-3" /> {obj.campaigns.length}</span>
                          <span className="text-xs text-neutral-400 flex items-center gap-1"><BarChart3 className="w-3 h-3" /> {totalPosts} posts</span>
                          {obj.strategy_session && (
                            <span className="text-[10px] font-bold bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400 px-1.5 py-0.5 rounded flex items-center gap-1" title="Tiene un mapa estratégico visual">
                              <Sparkles className="w-3 h-3" /> Plan
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>

          {/* RIGHT PANEL: Objective Details & Campaigns */}
          <div className="flex-1 w-full bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-white/30 dark:border-white/10 shadow-xl shadow-black/5 dark:shadow-black/20 rounded-3xl min-h-[500px] p-6 lg:p-8">
            {selectedObjective ? (
              <div className="space-y-8">
                {/* Objective details header */}
                <div className="flex items-start justify-between group">
                  <div className="flex gap-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg" style={{ backgroundColor: `${selectedObjective.color}20`, border: `1px solid ${selectedObjective.color}50` }}>
                      <span className="text-3xl">{selectedObjective.emoji}</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-neutral-900 dark:text-white drop-shadow-sm tracking-tight flex items-center gap-3">
                        {selectedObjective.name}
                      </h2>
                      <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-1 max-w-xl font-medium">{selectedObjective.description || "Sin descripción estratégica."}</p>
                      
                      {selectedObjective.strategy_session && (
                        <div className="mt-4">
                          <a href="/strategy-planner" className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-600/10 hover:bg-violet-600/20 text-violet-700 dark:text-violet-300 border border-violet-500/30 rounded-lg text-xs font-bold transition-all shadow-sm">
                            <Sparkles className="w-3.5 h-3.5" /> Ver Mapa Estratégico Asociado
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => setEditObjModal(selectedObjective)}
                      className="p-2 text-neutral-500 hover:text-indigo-400 hover:bg-neutral-800 rounded-xl transition-colors shrink-0"
                      title="Editar Objetivo"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteObjectivePrompt(selectedObjective.id)}
                      className="p-2 text-neutral-500 hover:text-red-400 hover:bg-neutral-800 rounded-xl transition-colors shrink-0"
                      title="Archivar Objetivo Completo"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Campaigns List */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                       Campañas Activas <span className="bg-neutral-800 text-neutral-400 text-[10px] px-2 py-0.5 rounded-full">{selectedObjective.campaigns.length}</span>
                    </h3>
                    <button onClick={() => setShowCampModal(true)} className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-1.5 rounded-lg transition-colors">
                      <Plus className="w-3.5 h-3.5" /> Agregar Campaña
                    </button>
                  </div>
                  
                  {selectedObjective.campaigns.length === 0 ? (
                    <div className="border border-dashed border-neutral-300 dark:border-neutral-800 rounded-2xl p-10 text-center bg-white/30 dark:bg-black/20">
                      <LayoutGrid className="w-8 h-8 text-neutral-400 dark:text-neutral-600 mx-auto mb-3" />
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">No tienes campañas para este objetivo.</p>
                      <button onClick={() => setShowCampModal(true)} className="mt-4 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl transition-colors shadow-md shadow-indigo-500/20">
                        Crear la primera
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedObjective.campaigns.map(camp => (
                        <div key={camp.id} className="bg-white/50 dark:bg-black/50 backdrop-blur-md border border-white/40 dark:border-white/10 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:shadow-lg hover:bg-white/70 dark:hover:bg-black/60 transition-all rounded-2xl p-5 group relative">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-[15px] leading-tight font-bold text-neutral-900 dark:text-white pr-6 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{camp.name}</h4>
                            {camp.status === 'active' && <span className="absolute top-5 right-5 w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" title="Activa" />}
                          </div>
                          <p className="text-xs text-neutral-700 dark:text-neutral-400 font-medium line-clamp-2 mb-4 min-h-[32px]">{camp.description}</p>
                          
                          <div className="flex items-center justify-between pt-4 border-t border-neutral-300/50 dark:border-neutral-700/50 mt-auto">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                                <Sparkles className="w-3.5 h-3.5" /> {camp.postsCount} posts
                              </div>
                              <div className="flex opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setEditCampModal({ campaign: camp, objectiveId: selectedObjective.id }); }}
                                  className="text-neutral-600 hover:text-indigo-400"
                                  title="Editar campaña"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleDeleteCampaign(camp.id); }}
                                  className="text-neutral-600 hover:text-red-400"
                                  title="Eliminar campaña"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            <span className="text-[10px] text-neutral-500 dark:text-neutral-500 font-mono">
                              {new Date(camp.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-neutral-500">
                <Target className="w-12 h-12 text-neutral-800 mb-4" />
                <p>Selecciona un objetivo para ver sus detalles o crea uno nuevo.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showObjModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white/95 dark:bg-neutral-900/90 backdrop-blur-2xl border border-white/20 dark:border-neutral-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-black/5 dark:border-neutral-800">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Nuevo Objetivo Estratégico</h3>
              <button onClick={() => setShowObjModal(false)} className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateObjective} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wide">Nombre</label>
                <input required autoFocus value={newObj.name} onChange={e => setNewObj({...newObj, name: e.target.value})} placeholder="Ej: ActivaQR Consultorios" className="mt-1.5 w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wide">Descripción Contextual</label>
                <textarea value={newObj.description} onChange={e => setNewObj({...newObj, description: e.target.value})} placeholder="Brief estratégico..." rows={3} className="mt-1.5 w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-neutral-400 uppercase tracking-wide">Emoji</label>
                  <input value={newObj.emoji} onChange={e => setNewObj({...newObj, emoji: e.target.value})} className="mt-1.5 w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-center text-xl outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-neutral-400 uppercase tracking-wide">Color</label>
                  <input type="color" value={newObj.color} onChange={e => setNewObj({...newObj, color: e.target.value})} className="mt-1.5 w-full h-[52px] bg-neutral-950 border border-neutral-800 rounded-xl p-1 outline-none cursor-pointer" />
                </div>
              </div>
              <div className="pt-4">
                <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors">
                  Guardar Objetivo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editObjModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white/95 dark:bg-neutral-900/90 backdrop-blur-2xl border border-white/20 dark:border-neutral-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-black/5 dark:border-neutral-800">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Editar Objetivo Estratégico</h3>
              <button onClick={() => setEditObjModal(null)} className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditObjective} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wide">Nombre</label>
                <input required autoFocus value={editObjModal.name} onChange={e => setEditObjModal({...editObjModal, name: e.target.value})} className="mt-1.5 w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wide">Descripción Contextual</label>
                <textarea value={editObjModal.description || ""} onChange={e => setEditObjModal({...editObjModal, description: e.target.value})} rows={3} className="mt-1.5 w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-neutral-400 uppercase tracking-wide">Emoji</label>
                  <input value={editObjModal.emoji} onChange={e => setEditObjModal({...editObjModal, emoji: e.target.value})} className="mt-1.5 w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-center text-xl outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-neutral-400 uppercase tracking-wide">Color</label>
                  <input type="color" value={editObjModal.color} onChange={e => setEditObjModal({...editObjModal, color: e.target.value})} className="mt-1.5 w-full h-[52px] bg-neutral-950 border border-neutral-800 rounded-xl p-1 outline-none cursor-pointer" />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setEditObjModal(null)} className="flex-1 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-xl transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors">
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCampModal && selectedObjective && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white/95 dark:bg-neutral-900/90 backdrop-blur-2xl border border-white/20 dark:border-neutral-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-black/5 dark:border-neutral-800">
              <div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Nueva Campaña</h3>
                <p className="text-xs text-neutral-500 mt-1">Para: {selectedObjective.emoji} {selectedObjective.name}</p>
              </div>
              <button onClick={() => setShowCampModal(false)} className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateCampaign} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wide">Nombre de la Campaña / Tema</label>
                <input required autoFocus value={newCamp.name} onChange={e => setNewCamp({...newCamp, name: e.target.value})} placeholder="Ej: Artículo Blog - Por qué el WiFi gratis..." className="mt-1.5 w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wide">Descripción (Brief IA)</label>
                <textarea value={newCamp.description} onChange={e => setNewCamp({...newCamp, description: e.target.value})} placeholder="Instrucciones u objetivo específico de esta campaña..." rows={4} className="mt-1.5 w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none resize-none" />
              </div>
              <div className="pt-4">
                <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors">
                  Iniciar Campaña
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editCampModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white/95 dark:bg-neutral-900/90 backdrop-blur-2xl border border-white/20 dark:border-neutral-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-black/5 dark:border-neutral-800">
              <div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Editar Campaña</h3>
              </div>
              <button onClick={() => setEditCampModal(null)} className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditCampaign} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wide">Nombre de la Campaña / Tema</label>
                <input required autoFocus value={editCampModal.campaign.name} onChange={e => setEditCampModal({...editCampModal, campaign: {...editCampModal.campaign, name: e.target.value}})} className="mt-1.5 w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wide">Descripción (Brief IA)</label>
                <textarea value={editCampModal.campaign.description || ""} onChange={e => setEditCampModal({...editCampModal, campaign: {...editCampModal.campaign, description: e.target.value}})} rows={4} className="mt-1.5 w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none resize-none" />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setEditCampModal(null)} className="flex-1 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-xl transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors">
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white/95 dark:bg-neutral-900/90 backdrop-blur-2xl border border-white/20 dark:border-neutral-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-500 dark:text-red-400" /> Archivar y Reasignar
              </h3>
              <button onClick={() => setShowDeleteModal(null)} className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-sm text-neutral-400 mb-6 leading-relaxed">
              Estás a punto de archivar este objetivo. Para no perder las métricas históricas ni dejar contenido "huérfano" en la interfaz, debes seleccionar un objetivo destino que heredará sus campañas y posts.
            </p>
            
            <div className="mb-6">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-wide">Destino del contenido</label>
              <select 
                value={fallbackObjId} 
                onChange={e => setFallbackObjId(e.target.value)}
                className="mt-1.5 w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none"
              >
               <option value="new">✨ Crear uno nuevo...</option>
               <optgroup label="Objetivos Existentes">
                 {objectives.filter(o => o.id !== showDeleteModal).map(o => (
                   <option key={o.id} value={o.id}>{o.emoji} {o.name}</option>
                 ))}
               </optgroup>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800">
               <button onClick={() => setShowDeleteModal(null)} className="px-5 py-2.5 text-sm font-bold text-neutral-400 hover:text-white transition-colors">
                 Cancelar
               </button>
               <button 
                 onClick={confirmDeleteObjective}
                 className="px-5 py-2.5 bg-red-600/10 text-red-500 border border-red-500/20 hover:bg-red-600 hover:text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-red-500/10"
               >
                 {fallbackObjId === "new" ? "Siguiente: Crear Objetivo" : "Archivar y Transferir"}
               </button>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
