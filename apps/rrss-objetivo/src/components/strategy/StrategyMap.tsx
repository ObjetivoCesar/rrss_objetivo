'use client';

import React, { useCallback, useEffect, useState, useMemo, useRef } from 'react';
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
  Filter, Calendar, ChevronDown, Rocket, CheckCircle2, 
  AlertCircle, Info, Hash, Clock, Maximize2, Minimize2, Search, PlusCircle, Lightbulb, RefreshCw,
  Heading1, Heading2, Type, MousePointerClick
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
  g.setGraph({ rankdir: direction, ranksep: 120, nodesep: 80 });

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
function FilterBar({ 
  objectives, 
  filters, 
  setFilters,
  onAddIdea,
  onAutoArrange
}: { 
  objectives: any[], 
  filters: any, 
  setFilters: (f: any) => void,
  onAddIdea: () => void,
  onAutoArrange: () => void
}) {
  return (
    <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2 items-center bg-slate-900/80 backdrop-blur-md p-3 rounded-2xl border border-slate-700 shadow-xl">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-xl text-xs font-semibold text-slate-300">
        <Filter className="w-3.5 h-3.5" />
        Explorar:
      </div>

      {/* 1. Node Type Selector (What am I looking for?) */}
      <div className="flex flex-wrap bg-slate-800 p-1 rounded-xl border border-slate-700 max-w-[400px]">
        {[
          { id: 'objective', label: 'Objetivos' },
          { id: 'campaign', label: 'Campañas' },
          { id: 'article', label: 'Artículos' },
          { id: 'post', label: 'Social' },
          { id: 'idea', label: 'Ideas' },
          { id: 'contentBlock', label: 'Estructura' }
        ].map(btn => (
          <button
            key={btn.id}
            onClick={() => setFilters({ ...filters, type: filters.type === btn.id ? 'all' : btn.id })}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              filters.type === btn.id 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* 2. Search Input */}
      <div className="relative flex items-center">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5" />
        <input 
          type="text" 
          placeholder="Buscar..." 
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="bg-slate-800 text-xs text-white pl-8 pr-3 py-1.5 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all w-32 focus:w-48 placeholder-slate-500"
        />
      </div>

      {/* 3. Objective Filter (Branch Context) */}
      <select 
        value={filters.objectiveId}
        onChange={(e) => setFilters({ ...filters, objectiveId: e.target.value })}
        className="bg-slate-800 text-xs text-white px-3 py-1.5 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none cursor-pointer pr-8 relative max-w-[150px] truncate"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0\' stroke=\'white\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', backgroundSize: '12px' }}
      >
        <option value="">Ramas (Todas)</option>
        {objectives.map(obj => (
          <option key={obj.id} value={obj.id}>{obj.name}</option>
        ))}
      </select>

      {/* Reset Filter */}
      {(filters.objectiveId !== '' || filters.type !== 'all' || filters.search !== '') && (
        <button 
          onClick={() => setFilters({ objectiveId: '', type: 'all', search: '' })}
          className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors border border-red-500/20"
          title="Limpiar filtros"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Divider */}
      <div className="w-px h-6 bg-slate-700 mx-1"></div>

      {/* Auto-ordenar Tool */}
      <button 
        onClick={onAutoArrange}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl transition-colors text-xs font-medium"
        title="Reorganizar nodos automáticamente (Auto-Layout)"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        Auto-ordenar
      </button>

      {/* Brainstorm / Add Idea Tool */}
      <button 
        onClick={onAddIdea}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-xl transition-colors text-xs font-bold uppercase tracking-wider shadow-lg shadow-yellow-500/10"
      >
        <PlusCircle className="w-3.5 h-3.5" />
        Añadir Idea
      </button>
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

    const { nodes: ln, edges: le } = getLayoutedElements(filteredNodes, filteredEdges);
    setNodes(ln);
    setEdges(le);
  }, [rawData, filters, setNodes, setEdges]);

  const handleAutoArrange = useCallback(() => {
    const { nodes: ln, edges: le } = getLayoutedElements(nodes, edges);
    setNodes(ln);
    setEdges(le);
  }, [nodes, edges, setNodes, setEdges]);

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
    const newId = `idea-${Date.now()}`;
    const newNode: Node = {
      id: newId,
      type: 'ideaNode',
      data: { label: 'Nueva Idea Estratégica' },
      position: { x: 0, y: 0 },
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
    <div className="w-full h-full flex bg-slate-950 text-slate-300">
      
      {/* Drag & Drop Palette Sidebar */}
      <div className="w-64 border-r border-slate-800 bg-slate-900/50 flex flex-col pt-24 px-4 z-10 shrink-0">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Estructurar Idea</h3>
        <p className="text-[10px] text-slate-400 mb-6 leading-relaxed">Arrastra estas figuras al centro para mapear visualmente la estructura de un artículo, guion o idea.</p>
        
        <div className="space-y-3">
          <div 
            className="flex items-center gap-3 p-3 bg-slate-800 border border-slate-700 rounded-xl cursor-grab hover:border-violet-500/50 hover:bg-slate-800/80 transition-colors"
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('application/reactflow', 'h1');
              e.dataTransfer.setData('application/reactflow-label', 'Título Principal (H1)');
              e.dataTransfer.effectAllowed = 'move';
            }}
          >
            <Heading1 className="w-4 h-4 text-violet-400" />
            <span className="text-xs font-bold text-slate-300">Título (H1)</span>
          </div>
          
          <div 
            className="flex items-center gap-3 p-3 bg-slate-800 border border-slate-700 rounded-xl cursor-grab hover:border-blue-500/50 hover:bg-slate-800/80 transition-colors"
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('application/reactflow', 'h2');
              e.dataTransfer.setData('application/reactflow-label', 'Subtítulo (H2)');
              e.dataTransfer.effectAllowed = 'move';
            }}
          >
            <Heading2 className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-bold text-slate-300">Subtítulo (H2)</span>
          </div>

          <div 
            className="flex items-center gap-3 p-3 bg-slate-800 border border-slate-700 rounded-xl cursor-grab hover:border-slate-500/50 hover:bg-slate-800/80 transition-colors"
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('application/reactflow', 'p');
              e.dataTransfer.setData('application/reactflow-label', 'Párrafo de contenido');
              e.dataTransfer.effectAllowed = 'move';
            }}
          >
            <Type className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-300">Párrafo Texto</span>
          </div>

          <div 
            className="flex items-center gap-3 p-3 bg-slate-800 border border-slate-700 rounded-xl cursor-grab hover:border-emerald-500/50 hover:bg-slate-800/80 transition-colors"
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('application/reactflow', 'cta');
              e.dataTransfer.setData('application/reactflow-label', 'Llamado a la Acción (Botón)');
              e.dataTransfer.effectAllowed = 'move';
            }}
          >
            <MousePointerClick className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-slate-300">Llamado a Acción</span>
          </div>
        </div>
      </div>

      <div className="flex-1 h-full relative group">
        <FilterBar 
          objectives={objectives} 
          filters={filters} 
          setFilters={setFilters} 
          onAddIdea={handleAddIdea}
          onAutoArrange={handleAutoArrange}
        />

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes as any}
          fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.05}
        maxZoom={1.5}
        defaultEdgeOptions={{
          type: 'smoothstep',
          style: { stroke: '#334155', strokeWidth: 2 },
        }}
      >
        <Controls className="!bg-slate-900 !border-slate-800 !shadow-2xl !rounded-2xl overflow-hidden scale-90 origin-bottom-left" />
        <MiniMap
          zoomable
          pannable
          nodeColor={(node) => {
            if (node.type === 'rootNode') return '#7c3aed';
            if (node.type === 'objectiveNode') return '#3b82f6';
            if (node.type === 'campaignNode') return '#f59e0b';
            if (node.type === 'articleNode') return '#10b981';
            if (node.type === 'ideaNode') return '#eab308';
            return '#475569';
          }}
          maskColor="rgba(2, 6, 23, 0.7)"
          className="!bg-slate-900/80 !border-slate-800 !shadow-2xl !rounded-2xl !bottom-4 !right-4 overflow-hidden border backdrop-blur-sm"
        />
        <Background variant={BackgroundVariant.Dots} color="#1e293b" gap={24} size={1} />
      </ReactFlow>

      {/* Detail Panels */}
      {selectedNode && (
        <>
          {selectedNode.type === 'articleNode' && 
             <ArticleDetailPanel node={selectedNode} onClose={() => setSelectedNode(null)} isExpanded={isPanelExpanded} onExpandToggle={() => setIsPanelExpanded(!isPanelExpanded)} />
          }
          {selectedNode.type === 'objectiveNode' && 
             <ObjectiveDetailPanel node={selectedNode} onClose={() => setSelectedNode(null)} isExpanded={isPanelExpanded} onExpandToggle={() => setIsPanelExpanded(!isPanelExpanded)} onAddIdeaChild={handleAddIdeaChild} />
          }
          {selectedNode.type === 'campaignNode' && 
             <CampaignDetailPanel node={selectedNode} onClose={() => setSelectedNode(null)} isExpanded={isPanelExpanded} onExpandToggle={() => setIsPanelExpanded(!isPanelExpanded)} onAddIdeaChild={handleAddIdeaChild} />
          }
          {selectedNode.type === 'ideaNode' || selectedNode.type === 'contentBlockNode' ? (
             <div className="absolute top-0 right-0 w-96 h-full bg-slate-900/95 backdrop-blur-xl border-l border-slate-700 shadow-2xl z-20 flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
               <div className="flex items-start justify-between p-5 border-b border-slate-800 shrink-0">
                 <div className="flex-1 min-w-0 mr-3">
                   <div className="flex items-center gap-2 mb-1">
                     <div className={`p-1 rounded ${selectedNode.type === 'contentBlockNode' ? 'bg-violet-500/10' : 'bg-yellow-500/10'}`}>
                       {selectedNode.type === 'contentBlockNode' ? (
                         <Type className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                       ) : (
                         <Lightbulb className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                       )}
                     </div>
                     <span className={`text-[10px] font-bold uppercase tracking-wider ${selectedNode.type === 'contentBlockNode' ? 'text-violet-400' : 'text-yellow-500'}`}>
                       {selectedNode.type === 'contentBlockNode' ? `Bloque de Contenido (${selectedNode.data.blockType})` : 'Idea en Borrador'}
                     </span>
                   </div>
                   <h3 className="text-white font-bold leading-snug">{selectedNode.data.label as string}</h3>
                 </div>
                 <button onClick={() => setSelectedNode(null)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                   <X className="w-4 h-4" />
                 </button>
               </div>
               <div className="flex-1 overflow-y-auto p-5 space-y-6">
                 <div className={`${selectedNode.type === 'contentBlockNode' ? 'bg-violet-600/10 border-violet-500/20' : 'bg-yellow-600/10 border-yellow-500/20'} border p-5 rounded-3xl`}>
                    <label className={`text-[10px] font-bold uppercase mb-2 block tracking-wider ${selectedNode.type === 'contentBlockNode' ? 'text-violet-400' : 'text-yellow-500'}`}>Texto / Contenido</label>
                    <textarea 
                      value={selectedNode.data.label as string}
                      onChange={(e) => {
                        const newName = e.target.value;
                        setRawData(prev => ({
                          ...prev,
                          nodes: prev.nodes.map(n => n.id === selectedNode.id ? { ...n, data: { ...n.data, label: newName } } : n)
                        }));
                        setSelectedNode(prev => prev ? { ...prev, data: { ...prev.data, label: newName } } : prev);
                      }}
                      className={`w-full bg-slate-900 border rounded-xl px-4 py-3 text-white text-sm focus:ring-2 outline-none transition-all placeholder-slate-500 min-h-[100px] resize-y ${selectedNode.type === 'contentBlockNode' ? 'border-violet-500/30 focus:ring-violet-500' : 'border-yellow-500/30 focus:ring-yellow-500'}`}
                      placeholder="Escribe el contenido aquí..."
                    />
                 </div>
                 <div className="bg-slate-800/50 p-5 rounded-3xl text-center">
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">Arrastra un enlace (cable) desde este nodo hacia otro para conectarlos estructuralmente en el mapa.</p>
                 </div>
               </div>
             </div>
          ) : null}
          {selectedNode.type === 'rootNode' && (
            <div className={`absolute right-0 bg-slate-900/95 border-slate-700 p-8 flex flex-col items-center justify-center text-center transition-all ${isPanelExpanded ? 'inset-0 z-50 border-0' : 'top-0 w-80 h-full border-l z-20 animate-in slide-in-from-right'}`}>
                <div className="absolute top-4 right-4 flex gap-2">
                  <button onClick={() => setIsPanelExpanded(!isPanelExpanded)} className="p-1.5 text-slate-400 hover:text-white"><Maximize2 className="w-5 h-5"/></button>
                  <button onClick={() => setSelectedNode(null)} className="p-1.5 text-slate-400 hover:text-white"><X className="w-5 h-5"/></button>
                </div>
                <div className="w-16 h-16 bg-violet-600 rounded-full flex items-center justify-center text-3xl mb-4 shadow-xl shadow-violet-500/20">🧠</div>
                <h3 className={`${isPanelExpanded ? 'text-4xl' : 'text-xl'} font-bold text-white mb-2 transition-all`}>Cerebro 2026</h3>
                <p className={`${isPanelExpanded ? 'text-lg max-w-xl' : 'text-sm'} text-slate-400 leading-relaxed transition-all`}>
                  Esta es la vista centralizada de tu estrategia. Usa los filtros superiores para aislar objetivos específicos o "Añadir Idea" para hacer brainstorming visual.
                </p>
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
