'use client';

import React, { useCallback, useEffect, useState, useMemo } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  Connection,
  Edge,
  Node,
  Position,
  useReactFlow
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import { ObjectiveNode } from './nodes/ObjectiveNode';
import { CampaignNode } from './nodes/CampaignNode';
import { ArticleNode } from './nodes/ArticleNode';
import { PostNode } from './nodes/PostNode';
import { IdeaNode } from './nodes/IdeaNode';
import { 
  Loader2, X, Globe, Link2, Target, FileText, Tag, 
  Filter, Rocket, CheckCircle2,
  AlertCircle, Info, Hash, Clock, Maximize2, Minimize2, Search, PlusCircle, Lightbulb, RefreshCw,
  Heading1, Heading2, Type, MousePointerClick, Save, Check, Trash2, Layers
} from 'lucide-react';

// ─── Custom Node Types ────────────────────────────────────────────────────────
const nodeTypes = {
  objectiveNode: ObjectiveNode,
  campaignNode: CampaignNode,
  articleNode: ArticleNode,
  postNode: PostNode,
  ideaNode: IdeaNode,
  rootNode: ({ data }: { data: any }) => (
    <div className="relative">
      <div className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl shadow-2xl shadow-violet-500/30 text-white font-bold text-base border border-violet-400">
        🧠 {data.label}
      </div>
      <div className="absolute left-1/2 -bottom-1 w-2 h-2 bg-violet-400 rounded-full transform -translate-x-1/2" />
    </div>
  )
};

// ─── Dagre Auto-Layout ────────────────────────────────────────────────────────
const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  if (!nodes.length) return { nodes, edges };

  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ 
    rankdir: direction, // 'TB' = Vertical
    ranksep: 200, // More vertical space between levels
    nodesep: 150, // More horizontal space between siblings
    marginx: 50,
    marginy: 50
  });

  nodes.forEach((node) => {
    const width = node.type === 'rootNode' ? 220 : node.type === 'postNode' ? 200 : 280;
    const height = node.type === 'rootNode' ? 60 : 100;
    g.setNode(node.id, { width, height });
  });

  edges.forEach((edge) => {
    if (nodes.find(n => n.id === edge.source) && nodes.find(n => n.id === edge.target)) {
      g.setEdge(edge.source, edge.target);
    }
  });

  dagre.layout(g);

  const isHorizontal = direction === 'LR';
  const layoutedNodes = nodes.map((node) => {
    const pos = g.node(node.id);
    if (!pos) return node;
    // Don't reposition nodes that were manually added and are positioned (like Idea nodes) unless needed.
    // For simplicity, auto-layout all of them.
    return {
      ...node,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      position: {
        x: pos.x - (pos.width ?? 0) / 2,
        y: pos.y - (pos.height ?? 0) / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

// ─── Filter Bar Component ───────────────────────────────────────────────────
// ─── Sidebar component ──────────────────────────────────────────────────────
function Sidebar({ 
  objectives, 
  filters, 
  setFilters,
  onAddIdea,
  onAutoArrange,
  onSave,
  isSaving,
  hasChanges,
  onDragStart
}: { 
  objectives: any[], 
  filters: any, 
  setFilters: (f: any) => void,
  onAddIdea: () => void,
  onAutoArrange: () => void,
  onSave: () => void,
  isSaving: boolean,
  hasChanges: boolean,
  onDragStart: (e: any, type: string, label: string) => void
}) {
  return (
    <div className="w-80 border-r border-slate-800 bg-slate-900/95 backdrop-blur-xl flex flex-col h-full z-20 shrink-0 overflow-y-auto custom-scrollbar shadow-2xl">
      {/* 1. Header & Save Section */}
      <div className="p-6 border-b border-slate-800 space-y-4 pt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
            <div className="w-2 h-6 bg-violet-600 rounded-full"></div>
            CONTROLES
          </h2>
          <button 
            onClick={onSave}
            disabled={isSaving}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all text-[10px] font-black border ${
              isSaving 
                ? 'bg-slate-800 text-slate-500 border-slate-700' 
                : hasChanges
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-600/20 active:scale-95'
                  : 'bg-slate-800/50 hover:bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : hasChanges ? <Save className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5 text-emerald-500" />}
            {isSaving ? '...' : hasChanges ? 'GUARDAR' : 'GUARDADO'}
          </button>
        </div>

        <button 
          onClick={onAutoArrange}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl transition-all text-xs font-bold active:scale-[0.98]"
        >
          <RefreshCw className="w-4 h-4 text-violet-400" />
          AUTO-ORDENAR VERTICAL
        </button>
      </div>

      {/* 2. Exploration Filters */}
      <div className="p-6 border-b border-slate-800 space-y-5 bg-slate-900/40">
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Search className="w-3 h-3" /> BUSCAR ESTRATEGIA
          </label>
          <input 
            type="text" 
            placeholder="Ej: Lanzamiento..." 
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full bg-slate-950 text-xs text-white px-4 py-3 rounded-xl border border-slate-800 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all outline-none placeholder:text-slate-600"
          />
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Target className="w-3 h-3" /> RAMA DE OBJETIVOS
          </label>
          <select 
            value={filters.objectiveId}
            onChange={(e) => setFilters({ ...filters, objectiveId: e.target.value })}
            className="w-full bg-slate-950 text-xs text-white px-4 py-3 rounded-xl border border-slate-800 focus:border-violet-500/50 transition-all outline-none appearance-none cursor-pointer"
          >
            <option value="">Todas las ramas</option>
            {objectives.map(obj => (
              <option key={obj.id} value={obj.id}>{obj.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Filter className="w-3 h-3" /> FILTRAR MAPA
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'all', label: 'Todo' },
              { id: 'objective', label: 'Objetivos' },
              { id: 'campaign', label: 'Campañas' },
              { id: 'article', label: 'Artículos' },
              { id: 'post', label: 'Social' },
              { id: 'idea', label: 'Ideas' }
            ].map(btn => (
              <button
                key={btn.id}
                onClick={() => setFilters({ ...filters, type: btn.id })}
                className={`px-3 py-2.5 rounded-xl text-[10px] font-bold transition-all border ${
                  filters.type === btn.id 
                    ? 'bg-violet-600 border-violet-400 text-white shadow-lg shadow-violet-600/20' 
                    : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300'
                }`}
              >
                {btn.label.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Drag & Drop Palette */}
      <div className="p-6 space-y-5 bg-slate-900/20 flex-1">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <Layers className="w-3 h-3" /> ESTRUCTURA DE ARTÍCULOS
        </label>
        
        <div className="space-y-2">
          {[
            { id: 'h1', label: 'Título (H1)', icon: Heading1, color: 'text-violet-400', bg: 'bg-violet-500/10' },
            { id: 'h2', label: 'Subtítulo (H2)', icon: Heading2, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { id: 'p', label: 'Párrafo de Texto', icon: Type, color: 'text-slate-400', bg: 'bg-slate-500/10' },
            { id: 'cta', label: 'Botón de Acción', icon: MousePointerClick, color: 'text-emerald-400', bg: 'bg-emerald-500/10' }
          ].map(item => (
            <div 
              key={item.id}
              className="flex items-center gap-3 p-3.5 bg-slate-800/40 border border-slate-800 rounded-2xl cursor-grab hover:border-slate-600 hover:bg-slate-800/80 transition-all group active:cursor-grabbing"
              draggable
              onDragStart={(e) => onDragStart(e, item.id, item.label)}
            >
              <div className={`w-8 h-8 rounded-xl ${item.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <item.icon className={`w-4 h-4 ${item.color}`} />
              </div>
              <span className="text-xs font-bold text-slate-200">{item.label}</span>
            </div>
          ))}
        </div>

        <div className="pt-4 mt-auto">
          <button 
            onClick={onAddIdea}
            className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-yellow-500 hover:bg-yellow-400 text-slate-950 rounded-2xl transition-all text-[11px] font-black uppercase tracking-wider shadow-2xl shadow-yellow-500/20 active:scale-[0.98]"
          >
            <PlusCircle className="w-5 h-5" />
            NUEVA IDEA LIBRE
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Article Detail Panel ─────────────────────────────────────────────────────
function ArticleDetailPanel({ node, onClose, isExpanded, onExpandToggle }: { node: Node; onClose: () => void, isExpanded: boolean, onExpandToggle: () => void }) {
  const [articleData, setLoading] = useState<any>(null);
  const [loading, setArticleData] = useState(false);

  useEffect(() => {
    const mysqlId = node.data?.id || node.id.replace('art-', '');
    if (!mysqlId) return;

    setArticleData(true);
    fetch(`/api/articles/mysql?id=${mysqlId}`)
      .then(r => r.json())
      .then(d => setLoading(d))
      .catch(() => setLoading(null))
      .finally(() => setArticleData(false));
  }, [node]);

  const mappings: any[] = (node.data as any)?.mappings || [];
  const slug: string = (node.data?.slug as string) || '';
  const title: string = (node.data?.label as string) || '';

  const PanelContainer = ({ children }: { children: React.ReactNode }) => (
    <div className={`absolute right-0 bg-slate-900/95 backdrop-blur-xl border-slate-700 shadow-2xl z-50 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${
      isExpanded 
        ? 'top-4 left-4 bottom-4 w-[calc(100%-32px)] rounded-3xl border animate-in zoom-in-95' 
        : 'top-0 w-96 h-full border-l animate-in slide-in-from-right'
    }`}>
      {children}
    </div>
  );

  return (
    <PanelContainer>
      <div className="flex items-start justify-between p-5 border-b border-slate-800 shrink-0 bg-slate-900/50">
        <div className="flex-1 min-w-0 mr-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1 bg-emerald-500/10 rounded">
              <FileText className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            </div>
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Artículo de Contenido</span>
          </div>
          <h3 className={`${isExpanded ? 'text-2xl' : 'text-base'} text-white font-bold leading-snug transition-all`}>{title}</h3>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={onExpandToggle} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors" title={isExpanded ? "Contraer" : "Pantalla Completa"}>
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors" title="Cerrar">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        <div className={`${isExpanded ? 'grid grid-cols-2 gap-8' : 'space-y-6'}`}>
          {/* Column 1 for Expanded Mode */}
          <div className="space-y-6">
            {/* Mapping Badge Section */}
            <div className="flex flex-wrap gap-2">
               {mappings.map((m: any, i: number) => (
                 <div key={i} className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700">
                   <div className={`w-1.5 h-1.5 rounded-full ${m.role === 'pillar' ? 'bg-blue-400' : 'bg-amber-400'}`} />
                   <span className="text-[10px] text-slate-300 font-semibold uppercase">{m.role || 'Vínculo'}</span>
                 </div>
               ))}
            </div>

            {/* Slug Section */}
            <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Globe className="w-3.5 h-3.5" /> Dirección Permanente
              </h4>
              <div className="flex items-center gap-2 bg-slate-900 p-2.5 rounded-xl border border-slate-800 font-mono text-[11px] text-blue-400 group cursor-copy" onClick={() => navigator.clipboard.writeText(`https://cesarreyesjaramillo.com/${slug}`)}>
                <div className="truncate flex-1">/{slug}</div>
                <Link2 className="w-3 h-3 text-slate-600 group-hover:text-blue-400 transition-colors" />
              </div>
            </div>

            {/* Strategy Description */}
            {mappings.length > 0 && mappings[0].strategic_notes && (
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Target className="w-3.5 h-3.5" /> Nota Estratégica
                </h4>
                <div className="bg-blue-500/5 border border-blue-500/20 p-4 rounded-2xl text-xs text-slate-300 leading-relaxed italic">
                  "{mappings[0].strategic_notes}"
                </div>
              </div>
            )}
          </div>

          {/* Column 2 for Expanded Mode */}
          <div className="space-y-6">
            {/* SEO Data */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3 border border-dashed border-slate-700 rounded-3xl h-full min-h-[200px]">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                <span className="text-xs text-slate-500">Analizando SEO...</span>
              </div>
            ) : articleData?.article ? (
              <div className="space-y-6 h-full flex flex-col">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5" /> Posicionamiento SEO
                  </h4>
                  <div className="grid gap-3">
                    <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                       <div className="text-[10px] text-slate-500 font-bold uppercase mb-1.5">Meta Title</div>
                       <div className="text-xs text-white leading-snug">{articleData.article.post_title}</div>
                    </div>
                    
                    {articleData.article.focus_keyword && (
                      <div className="bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10">
                        <div className="text-[10px] text-emerald-500/70 font-bold uppercase mb-1.5">Palabra Clave Objetivo</div>
                        <div className="text-sm text-emerald-400 font-bold">#{articleData.article.focus_keyword}</div>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <div className="flex-1 bg-slate-800/50 p-3 rounded-2xl border border-slate-700/50 text-center">
                        <div className="text-[9px] text-slate-500 font-bold uppercase mb-1">Estado</div>
                        <div className="flex items-center justify-center gap-1.5">
                          <div className={`w-1.5 h-1.5 rounded-full ${articleData.article.post_status === 'publish' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          <span className="text-[10px] text-slate-200 font-bold uppercase">{articleData.article.post_status}</span>
                        </div>
                      </div>
                      <div className="flex-1 bg-slate-800/50 p-3 rounded-2xl border border-slate-700/50 text-center">
                        <div className="text-[9px] text-slate-500 font-bold uppercase mb-1">Categorías</div>
                        <div className="text-[10px] text-slate-200 font-bold truncate px-2">{articleData.article.categories || 'Sin Categoría'}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {articleData.article.post_excerpt && (
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex-1">
                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Resumen / Hook</h4>
                    <p className="text-xs text-slate-400 leading-relaxed italic line-clamp-[10]">
                      {articleData.article.post_excerpt}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-800/20 rounded-3xl border border-slate-800 border-dashed h-full flex flex-col items-center justify-center min-h-[200px]">
                <Info className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                <p className="text-xs text-slate-500">No se encontraron datos SEO adicionales para este slug en MySQL.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-5 border-t border-slate-800 bg-slate-900/80 backdrop-blur-md">
        <a
          href={`https://cesarreyesjaramillo.com/${slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98]"
        >
          <Globe className="w-4 h-4" />
          Ver Artículo en cesarreyesjaramillo.com
        </a>
      </div>
    </PanelContainer>
  );
}

// ─── Objective Detail Panel ───────────────────────────────────────────────────
function ObjectiveDetailPanel({ node, onClose, isExpanded, onExpandToggle, onAddIdeaChild }: { node: Node; onClose: () => void, isExpanded: boolean, onExpandToggle: () => void, onAddIdeaChild: (parentId: string) => void }) {
  const data = node.data.raw || {};
  
  const PanelContainer = ({ children }: { children: React.ReactNode }) => (
    <div className={`absolute right-0 bg-slate-900/95 backdrop-blur-xl border-slate-700 shadow-2xl z-50 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${
      isExpanded 
        ? 'top-4 left-4 bottom-4 w-[calc(100%-32px)] rounded-3xl border animate-in zoom-in-95' 
        : 'top-0 w-96 h-full border-l animate-in slide-in-from-right'
    }`}>
      {children}
    </div>
  );

  return (
    <PanelContainer>
      <div className="flex items-start justify-between p-5 border-b border-slate-800 shrink-0">
        <div className="flex-1 min-w-0 mr-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1 bg-blue-500/10 rounded">
              <Target className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            </div>
            <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">Objetivo de Marca</span>
          </div>
          <h3 className={`${isExpanded ? 'text-2xl' : 'text-base'} text-white font-bold leading-snug transition-all`}>{node.data.label as string}</h3>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={onExpandToggle} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors" title={isExpanded ? "Contraer" : "Pantalla Completa"}>
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className={`flex-1 overflow-y-auto p-5 space-y-6 ${isExpanded ? 'max-w-4xl mx-auto w-full mt-10' : ''}`}>
        <div className="bg-blue-600/10 border border-blue-500/20 p-5 rounded-3xl">
          <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Info className="w-3.5 h-3.5" /> Descripción Estratégica
          </h4>
          <p className={`${isExpanded ? 'text-xl' : 'text-sm'} text-slate-300 leading-relaxed font-medium`}>
            {(node.data as any).description || 'Sin descripción detallada.'}
          </p>
        </div>

        <div className="space-y-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
            <Hash className="w-3.5 h-3.5" /> Datos Técnicos
          </h4>
          <div className="grid gap-3">
            <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 flex items-center justify-between">
               <span className="text-[11px] text-slate-500 font-bold uppercase">ID Único</span>
               <span className="text-[10px] text-slate-300 font-mono truncate ml-4">{node.id}</span>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 flex items-center justify-between">
               <span className="text-[11px] text-slate-500 font-bold uppercase">Creado en</span>
               <span className="text-[10px] text-slate-300 font-mono italic">
                 {(data as any).created_at ? new Date((data as any).created_at).toLocaleDateString() : 'N/A'}
               </span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800">
           <div className="flex items-center gap-3 text-emerald-400 text-xs px-2 mb-4">
             <CheckCircle2 className="w-4 h-4" />
             <span>Este objetivo guía el 100% de los artículos hijos.</span>
           </div>
           <button
             onClick={() => onAddIdeaChild(node.id)}
             className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-yellow-500/20 hover:text-yellow-400 text-slate-300 py-3 rounded-xl text-xs font-bold transition-all border border-dashed border-slate-600 hover:border-yellow-500/50 mt-2"
           >
             <Lightbulb className="w-4 h-4" />
             AÑADIR IDEA AQUÍ
           </button>
        </div>
      </div>
    </PanelContainer>
  );
}

// ─── Campaign Detail Panel ───────────────────────────────────────────────────
function CampaignDetailPanel({ node, onClose, isExpanded, onExpandToggle, onAddIdeaChild }: { node: Node; onClose: () => void, isExpanded: boolean, onExpandToggle: () => void, onAddIdeaChild: (parentId: string) => void }) {
  const data = node.data.raw || {};
  const status = node.data.status || 'draft';
  
  const PanelContainer = ({ children }: { children: React.ReactNode }) => (
    <div className={`absolute right-0 bg-slate-900/95 backdrop-blur-xl border-slate-700 shadow-2xl z-50 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${
      isExpanded 
        ? 'top-4 left-4 bottom-4 w-[calc(100%-32px)] rounded-3xl border animate-in zoom-in-95' 
        : 'top-0 w-96 h-full border-l animate-in slide-in-from-right'
    }`}>
      {children}
    </div>
  );

  return (
    <PanelContainer>
      <div className="flex items-start justify-between p-5 border-b border-slate-800 shrink-0">
        <div className="flex-1 min-w-0 mr-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1 bg-amber-500/10 rounded">
              <Rocket className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            </div>
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Campaña Activa</span>
          </div>
          <h3 className={`${isExpanded ? 'text-2xl' : 'text-base'} text-white font-bold leading-snug transition-all`}>{node.data.label as string}</h3>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={onExpandToggle} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors" title={isExpanded ? "Contraer" : "Pantalla Completa"}>
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className={`flex-1 overflow-y-auto p-5 space-y-6 ${isExpanded ? 'max-w-4xl mx-auto w-full mt-10' : ''}`}>
        <div className="flex items-center justify-between bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
           <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase">
             <Clock className="w-3.5 h-3.5" /> Estado Actual
           </div>
            <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
              status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 
              'bg-slate-700 text-slate-400 border border-slate-600'
            }`}>
              {status as any}
            </div>
        </div>

        <div className="bg-amber-600/10 border border-amber-500/20 p-5 rounded-3xl">
          <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5" /> Foco Mental
          </h4>
          <p className={`${isExpanded ? 'text-lg' : 'text-sm'} text-slate-300 leading-relaxed font-medium capitalize`}>
             Enfoque temporal diseñado para capturar la atención en el corto plazo.
          </p>
        </div>

        <div className="space-y-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
            <Hash className="w-3.5 h-3.5" /> Identificadores
          </h4>
          <div className="grid gap-3">
            <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 flex items-center justify-between">
               <span className="text-[11px] text-slate-500 font-bold uppercase">Referencia</span>
               <span className="text-[10px] text-slate-300 font-mono truncate ml-4">{node.id}</span>
            </div>
          </div>
        </div>
        
        <div className="p-6 bg-slate-950/50 rounded-3xl border border-slate-800 border-dashed text-center">
           <div className="text-[10px] text-slate-500 font-bold uppercase mb-2">Social Impact</div>
           <div className="flex justify-center -space-x-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center border-2 border-slate-900 text-[10px] font-bold">FB</div>
              <div className="w-8 h-8 rounded-full bg-pink-600 flex items-center justify-center border-2 border-slate-900 text-[10px] font-bold">IG</div>
              <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center border-2 border-slate-900 text-[10px] font-bold text-white">TK</div>
           </div>
        </div>

        <div className="pt-4 border-t border-slate-800">
           <button
             onClick={() => onAddIdeaChild(node.id)}
             className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-yellow-500/20 hover:text-yellow-400 text-slate-300 py-3 rounded-xl text-xs font-bold transition-all border border-dashed border-slate-600 hover:border-yellow-500/50 mt-2"
           >
             <Lightbulb className="w-4 h-4" />
             AÑADIR IDEA AQUÍ
           </button>
        </div>
      </div>
    </PanelContainer>
  );
}

// ─── Inner Map ──────────────────────────────────────────────────────────────
function StrategyMapInner() {
  const [rawData, setRawData] = useState<{ nodes: Node[], edges: Edge[] }>({ nodes: [], edges: [] });
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [forceLayout, setForceLayout] = useState(0); // Counter to trigger re-layout

  // Filters State
  const [filters, setFilters] = useState({
    objectiveId: '',
    type: 'objective', // Default to Objective to avoid lag from Articles
    search: ''
  });

  const objectives = useMemo(() => {
    return rawData.nodes.filter(n => n.type === 'objectiveNode').map(n => ({
      id: n.id.replace('obj-', ''),
      name: n.data.label
    }));
  }, [rawData.nodes]);

  useEffect(() => {
    async function loadGraph() {
      try {
        const res = await fetch('/api/strategy-map');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.error) throw new Error(data.error);

        setRawData({ nodes: data.nodes || [], edges: data.edges || [] });
      } catch (err: any) {
        console.error('Failed to load strategy map:', err);
        setError(err.message || 'Error desconocido');
      } finally {
        setLoading(false);
      }
    }
    loadGraph();
  }, []);

  // Filter & Layout Logic
  useEffect(() => {
    if (!rawData.nodes.length) return;

    let filteredNodes = [...rawData.nodes];
    let filteredEdges = [...rawData.edges];

    // Build parent mappings to keep ancestors
    const parentMap = new Map<string, string>();
    rawData.edges.forEach(e => parentMap.set(e.target, e.source));
    const rootId = 'root';

    // 1. Type & Search Filter
    // Combine Type and Search to find exactly what we are looking for.
    if (filters.type !== 'all' || filters.search.trim() !== '') {
      const typeKey = filters.type !== 'all' ? filters.type + 'Node' : null;
      
      const normalize = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      const qWords = normalize(filters.search).split(/\s+/).filter(Boolean);
      
      // Find directly matched nodes
      const matchedNodes = filteredNodes.filter(n => {
         const label = normalize((n.data.label as string) || '');
         const desc = normalize((n.data.description as string) || '');
         const isSearchMatch = qWords.length === 0 || qWords.every(word => label.includes(word) || desc.includes(word));
         
         // If a type filter is active, match it exactly. Special nodes like ideas and blocks show up with their types.
         // If "all" is active, we show EVERYTHING (root is always added back in the nodesToKeep set anyway).
         const isTypeMatch = (filters.type === 'all') 
            ? true 
            : (typeKey ? (n.type === typeKey || n.type === 'ideaNode' || n.type === 'contentBlockNode') : true);
            
         return isSearchMatch && isTypeMatch;
      });

      const matchedIds = new Set(matchedNodes.map(n => n.id));
      const nodesToKeep = new Set<string>();
      nodesToKeep.add(rootId);
      
      matchedIds.forEach(id => {
         nodesToKeep.add(id);
         let curr = id;
         while (parentMap.has(curr)) {
            curr = parentMap.get(curr)!;
            nodesToKeep.add(curr);
         }
      });
      
      filteredNodes = filteredNodes.filter(n => nodesToKeep.has(n.id));
    }

    // 2. Filter by Objective Branch (Cascading)
    if (filters.objectiveId) {
      const targetObjId = `obj-${filters.objectiveId}`;
      const reachableNodes = new Set([targetObjId, rootId]);
      
      // Calculate reachable nodes downwards
      const childrenMap = new Map<string, string[]>();
      rawData.edges.forEach(e => {
        if (!childrenMap.has(e.source)) childrenMap.set(e.source, []);
        childrenMap.get(e.source)!.push(e.target);
      });
      
      const queue = [targetObjId];
      while (queue.length > 0) {
        const curr = queue.shift()!;
        if (childrenMap.has(curr)) {
          childrenMap.get(curr)!.forEach(child => {
            reachableNodes.add(child);
            queue.push(child);
          });
        }
      }
      
      filteredNodes = filteredNodes.filter(n => reachableNodes.has(n.id));
    }

    // Keep only edges where both ends are visible
    const nodeIds = new Set(filteredNodes.map(n => n.id));
    filteredEdges = rawData.edges.filter(e => nodeIds.has(e.source) && nodeIds.has(e.target));

    // ONLY apply dagre if it's the first time or explicitly requested
    // Otherwise, use the positions from rawData (which include manual ones)
    if (forceLayout > 0 || (rawData.nodes.length > 0 && nodes.length === 0)) {
      const { nodes: ln, edges: le } = getLayoutedElements(filteredNodes, filteredEdges);
      setNodes(ln);
      setEdges(le);
      if (forceLayout > 0) setForceLayout(0);
    } else {
      setNodes(filteredNodes);
      setEdges(filteredEdges);
    }
  }, [rawData, filters, forceLayout, setNodes, setEdges]);

  const handleAutoArrange = useCallback(() => {
    setForceLayout(prev => prev + 1);
  }, []);

  const handleSave = useCallback(async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      // 1. Collect positions of ALL current nodes in the map
      const positions: Record<string, { x: number, y: number }> = {};
      nodes.forEach(node => {
        positions[node.id] = { x: node.position.x, y: node.position.y };
      });

      // 2. Collect current custom ideas/blocks
      const ideas = rawData.nodes
        .filter(n => n.type === 'ideaNode' || n.type === 'contentBlockNode')
        .map(n => {
          const currentInNodes = nodes.find(node => node.id === n.id);
          return {
            id: n.id.startsWith('temp-') || n.id.includes('-') && n.id.length < 30 ? undefined : n.id.replace('idea-', '').replace('block-', ''),
            label: n.data.label,
            description: n.data.description,
            node_type: n.data.type || (n.type === 'ideaNode' ? 'idea' : n.data.blockType),
            parent_id: rawData.edges.find(e => e.target === n.id)?.source || null,
            pos_x: currentInNodes?.position.x || 0,
            pos_y: currentInNodes?.position.y || 0
          };
        });

      const res = await fetch('/api/strategy-map/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ positions, ideas })
      });

      if (!res.ok) throw new Error('Error al guardar');
      
      setHasChanges(false);
      // Small feedback toast could go here
    } catch (err: any) {
      console.error('Save failed:', err);
      alert('Error al guardar: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  }, [nodes, rawData, isSaving]);

  const onNodeDragStop = useCallback(() => {
    setHasChanges(true);
  }, []);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge({ ...params, type: 'smoothstep', style: { stroke: '#64748b', strokeWidth: 2 } } as any, eds)),
    [setEdges],
  );

  const onNodeClick = (_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setIsPanelExpanded(false); // Reset expansion on new selection
  };
  
  // Create a new Idea Node
  const handleAddIdea = useCallback(() => {
    const newId = `idea-${Date.now()}`;
    const newNode: Node = {
      id: newId,
      type: 'ideaNode',
      data: { label: 'Nueva Idea Estratégica' },
      position: { x: 0, y: 0 },
    };
    const newEdge: Edge = {
      id: `e-root-${newId}`,
      source: 'root',
      target: newId,
      type: 'smoothstep',
      style: { stroke: '#eab308', strokeWidth: 1.5, strokeDasharray: '5,5' },
    };

    setRawData(prev => ({
      nodes: [...prev.nodes, newNode],
      edges: [...prev.edges, newEdge]
    }));
    
    // Automatically select it to open the detail panel instantly!
    setTimeout(() => {
       setSelectedNode(newNode);
    }, 50);
  }, [setRawData, setSelectedNode]);

  const handleAddIdeaChild = useCallback((parentId: string) => {
    // Find parent position to spawn the new idea nearby
    const parentNode = nodes.find(n => n.id === parentId);
    const spawnX = parentNode ? parentNode.position.x : 0;
    const spawnY = parentNode ? parentNode.position.y + 150 : 0;

    const newId = `idea-${Date.now()}`;
    const newNode: Node = {
      id: newId,
      type: 'ideaNode',
      data: { label: 'Nueva Idea Estratégica' },
      position: { x: spawnX, y: spawnY },
    };
    const newEdge: Edge = {
      id: `e-${parentId}-${newId}`,
      source: parentId,
      target: newId,
      type: 'smoothstep',
      style: { stroke: '#eab308', strokeWidth: 1.5, strokeDasharray: '4,4' }
    };
    
    setRawData(prev => ({
      nodes: [...prev.nodes, newNode],
      edges: [...prev.edges, newEdge]
    }));
    
    // Clear type filter so the new idea is not hidden!
    setFilters(f => ({ ...f, type: 'all' }));
    
    setTimeout(() => {
       setSelectedNode(newNode);
    }, 50);
  }, [setRawData, setSelectedNode, setFilters]);

  // Handle Drag & Drop
  const { screenToFlowPosition } = useReactFlow();

  const onDragOver = useCallback((event: any) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: any) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (typeof type === 'undefined' || !type) {
        return;
      }

      const blockLabel = event.dataTransfer.getData('application/reactflow-label');

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node = {
        id: `block-${Date.now()}`,
        type: 'contentBlockNode',
        position,
        data: { label: blockLabel, blockType: type },
      };

      setRawData((prev) => ({
        ...prev,
        nodes: prev.nodes.concat(newNode),
      }));
    },
    [screenToFlowPosition, setRawData]
  );

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-violet-400 mb-4" />
        <p className="text-white font-semibold">Iniciando Cerebro Estratégico...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950">
        <div className="text-6xl mb-4">🧩</div>
        <p className="text-red-400 font-mono text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-full h-full flex bg-slate-950 text-slate-300 z-[9999] overflow-hidden">
      
      {/* 🚀 Integrated Sidebar Control */}
      <Sidebar 
        objectives={objectives} 
        filters={filters} 
        setFilters={setFilters} 
        onAddIdea={handleAddIdea}
        onAutoArrange={handleAutoArrange}
        onSave={handleSave}
        isSaving={isSaving}
        hasChanges={hasChanges}
        onDragStart={(e, type, label) => {
          e.dataTransfer.setData('application/reactflow', type);
          e.dataTransfer.setData('application/reactflow-label', label);
          e.dataTransfer.effectAllowed = 'move';
        }}
      />

      {/* 🔮 Flow Canvas Area */}
      <div className="flex-1 h-full relative group">
        
        {/* Floating Top Header (Workspace Context) */}
        <div className="absolute top-8 left-8 z-20 pointer-events-none">
          <div className="flex items-center gap-4">
             <div className="px-6 py-3 bg-slate-950/80 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl flex items-center gap-4">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
               <span className="text-xs font-black text-white tracking-[0.2em]">
                 {filters.objectiveId 
                   ? String(objectives.find(o => o.id === filters.objectiveId)?.name || 'CARGANDO...').toUpperCase() 
                   : 'MODO: ECOSISTEMA COMPLETO'}
               </span>
             </div>
          </div>
        </div>

        {/* Exit UI */}
        <div className="absolute top-8 right-8 z-20 flex gap-3">
           <button 
            onClick={() => window.location.href = '/'}
            className="p-4 bg-slate-900/80 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-800 hover:border-red-500/30 rounded-2xl transition-all backdrop-blur-md shadow-2xl pointer-events-auto active:scale-95"
            title="Escapar de Cerebro"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={(changes) => {
            onNodesChange(changes);
            if (changes.some(c => c.type === 'position')) setHasChanges(true);
          }}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onNodeDragStop={onNodeDragStop}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes as any}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.05}
          maxZoom={2}
          selectNodesOnDrag={false}
          panOnScroll={true}
          selectionOnDrag={true}
          defaultEdgeOptions={{
            type: 'smoothstep',
            style: { stroke: '#475569', strokeWidth: 2.5 },
          }}
        >
          <Background color="#1e293b" variant={BackgroundVariant.Dots} gap={30} size={1} />
          
          <div className="absolute bottom-10 left-10 z-10">
             <Controls 
              className="!bg-slate-900/90 !border-slate-800 !shadow-2xl !rounded-3xl !p-1.5 !text-slate-400 overflow-hidden !m-0 !gap-1" 
              showInteractive={false}
            />
          </div>

          <MiniMap 
            className="!bg-slate-950/90 !border-slate-800 !rounded-3xl !shadow-2xl border-2 border-slate-800 mb-10 mr-10 scale-125 origin-bottom-right"
            maskColor="rgba(0,0,0,0.7)"
            nodeColor={(n) => {
              if (n.type === 'objectiveNode') return '#8b5cf6';
              if (n.type === 'campaignNode') return '#f59e0b';
              if (n.type === 'articleNode') return '#10b981';
              return '#475569';
            }}
          />
        </ReactFlow>

        {/* Selected Data Panels */}
        {selectedNode && (
          <>
            {selectedNode.type === 'articleNode' && (
              <ArticleDetailPanel
                node={selectedNode}
                onClose={() => setSelectedNode(null)}
                isExpanded={isPanelExpanded}
                onExpandToggle={() => setIsPanelExpanded(!isPanelExpanded)}
              />
            )}
            {selectedNode.type === 'objectiveNode' && (
              <ObjectiveDetailPanel
                node={selectedNode}
                onClose={() => setSelectedNode(null)}
                isExpanded={isPanelExpanded}
                onExpandToggle={() => setIsPanelExpanded(!isPanelExpanded)}
                onAddIdeaChild={handleAddIdeaChild}
              />
            )}
            {selectedNode.type === 'campaignNode' && (
              <CampaignDetailPanel
                node={selectedNode}
                onClose={() => setSelectedNode(null)}
                isExpanded={isPanelExpanded}
                onExpandToggle={() => setIsPanelExpanded(!isPanelExpanded)}
                onAddIdeaChild={handleAddIdeaChild}
              />
            )}
            {/* rootNode: No detail panel needed — it's the brain center */}
            {(selectedNode.type === 'ideaNode' || selectedNode.type === 'contentBlockNode') && (
              <div className="absolute top-0 right-0 w-96 h-full bg-slate-900/95 backdrop-blur-xl border-l border-slate-700 shadow-2xl z-30 flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
                <div className="flex items-start justify-between p-6 border-b border-white/5 shrink-0">
                  <div className="flex-1 min-w-0 mr-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`p-1 rounded ${selectedNode.type === 'contentBlockNode' ? 'bg-violet-500/10' : 'bg-yellow-500/10'}`}>
                        {selectedNode.type === 'contentBlockNode' ? (
                          <Type className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                        ) : (
                          <Lightbulb className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                        )}
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${selectedNode.type === 'contentBlockNode' ? 'text-violet-400' : 'text-yellow-500'}`}>
                        {selectedNode.type === 'contentBlockNode' ? `Bloque: ${selectedNode.data.blockType}` : 'Idea en Borrador'}
                      </span>
                    </div>
                    <h3 className="text-white font-black leading-tight truncate">{selectedNode.data.label as string}</h3>
                  </div>
                  <button onClick={() => setSelectedNode(null)} className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-slate-800/50 transition-all">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Contenido del Nodo</label>
                    <textarea 
                      value={selectedNode.data.label as string}
                      onChange={(e) => {
                        const newName = e.target.value;
                        setRawData(prev => ({
                          ...prev,
                          nodes: prev.nodes.map(n => n.id === selectedNode.id ? { ...n, data: { ...n.data, label: newName } } : n)
                        }));
                        setSelectedNode(prev => prev ? { ...prev, data: { ...prev.data, label: newName } } : prev);
                        setHasChanges(true);
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white text-sm focus:border-violet-500/50 outline-none transition-all placeholder:text-slate-700 min-h-[160px] resize-none font-medium leading-relaxed"
                      placeholder="Escribe tu idea aquí..."
                    />
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-slate-400 leading-relaxed italic">
                        Los cambios en el texto se guardarán permanentemente cuando presiones el botón "GUARDAR" en el panel izquierdo.
                      </p>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      setRawData(prev => ({
                        nodes: prev.nodes.filter(n => n.id !== selectedNode.id),
                        edges: prev.edges.filter(e => e.source !== selectedNode.id && e.target !== selectedNode.id)
                      }));
                      setSelectedNode(null);
                      setHasChanges(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all text-xs font-black uppercase tracking-widest mt-10 active:scale-95"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar Nodo
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function StrategyMap() {
  return (
    <ReactFlowProvider>
      <StrategyMapInner />
    </ReactFlowProvider>
  );
}
