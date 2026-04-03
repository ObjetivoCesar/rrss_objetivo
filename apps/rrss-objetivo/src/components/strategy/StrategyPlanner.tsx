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
  Panel,
  Connection,
  Edge,
  Node,
  Position,
  useReactFlow,
  Handle,
  NodeResizer,
  NodeToolbar,
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  EdgeProps,
  MarkerType,
} from '@xyflow/react';
import { useRouter } from 'next/navigation';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import {
  Target, Rocket, FileText, Lightbulb, Smartphone,
  Plus, Save, Download, FolderOpen, Trash2, RefreshCw,
  X, ChevronRight, ChevronDown, Loader2, Check, Copy,
  LayoutDashboard, Sparkles, Link2, Unlink, Zap,
  BookOpen, Pen, Video, Image as ImageIcon
} from 'lucide-react';
import toast from 'react-hot-toast';

// ─── Types ──────────────────────────────────────────────────────────────────
interface Session { id: string; name: string; description?: string; created_at: string; updated_at: string; }
type NodeKind = 'objectiveNode' | 'campaignNode' | 'articleNode' | 'postNode' | 'ideaNode' | 'strategicPostNode';

// ─── Node Color config ───────────────────────────────────────────────────────
const NODE_CONFIG: Record<NodeKind, { color: string; bg: string; border: string; ring: string; label: string; icon: React.FC<any> }> = {
  objectiveNode: { color: 'text-violet-300', bg: 'from-violet-900 to-violet-950', border: 'border-violet-500/60', ring: 'ring-violet-400/50', label: 'OBJETIVO', icon: Target },
  campaignNode:  { color: 'text-amber-300',  bg: 'from-amber-900 to-amber-950',   border: 'border-amber-500/60',  ring: 'ring-amber-400/50',  label: 'CAMPAÑA',  icon: Rocket },
  articleNode:   { color: 'text-emerald-300',bg: 'from-emerald-900 to-emerald-950',border: 'border-emerald-500/60',ring: 'ring-emerald-400/50',label: 'ARTÍCULO', icon: FileText },
  postNode:      { color: 'text-sky-300',    bg: 'from-sky-900 to-sky-950',        border: 'border-sky-500/60',    ring: 'ring-sky-400/50',    label: 'POST',     icon: Smartphone },
  ideaNode:      { color: 'text-yellow-300', bg: 'from-yellow-900 to-yellow-950',  border: 'border-yellow-500/60', ring: 'ring-yellow-400/50', label: 'IDEA',     icon: Lightbulb },
  strategicPostNode: { color: 'text-orange-300', bg: 'from-neutral-900 to-neutral-950', border: 'border-orange-500/60', ring: 'ring-orange-400/50', label: 'POST ESTRATÉGICO', icon: Sparkles },
};

// ─── Generic Plan Node ──────────────────────────────────────────────────────
function PlanNode({ id, data, selected, type }: { id: string; data: any; selected: boolean; type: NodeKind }) {
  const { setNodes, deleteElements, getNodes, getEdges } = useReactFlow();
  const router = useRouter();
  const cfg = NODE_CONFIG[type] || NODE_CONFIG.ideaNode;
  const Icon = cfg.icon;

  const onLabelChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNodes(nds => nds.map(n => n.id === id ? { ...n, data: { ...n.data, label: e.target.value } } : n));
  };
  const onNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNodes(nds => nds.map(n => n.id === id ? { ...n, data: { ...n.data, notes: e.target.value } } : n));
  };

  return (
    <div className={`relative group w-full h-full rounded-2xl border bg-gradient-to-br ${cfg.bg} ${cfg.border} shadow-2xl transition-all backdrop-blur-md ${selected ? `ring-2 ${cfg.ring} shadow-lg` : ''}`}>
      <NodeResizer minWidth={200} minHeight={80} isVisible={selected} color="#64748b" handleStyle={{ borderRadius: 4, background: '#64748b', border: '1px solid #94a3b8' }} />
      <NodeToolbar isVisible={selected} position={Position.Top} className="flex gap-1.5 bg-white/10 dark:bg-black/80 border border-white/10 rounded-xl p-1.5 shadow-2xl backdrop-blur-xl">
        <button onClick={() => deleteElements({ nodes: [{ id }] })} className="p-1.5 rounded-lg hover:bg-red-500/20 hover:text-red-400 text-neutral-500 dark:text-neutral-400 transition-all" title="Eliminar nodo"><Trash2 className="w-3.5 h-3.5" /></button>
        <button onClick={() => { navigator.clipboard.writeText(data.label || ''); toast.success("Texto copiado"); }} className="p-1.5 rounded-lg hover:bg-white/10 dark:hover:bg-white/5 text-neutral-500 dark:text-neutral-400 transition-all" title="Copiar texto"><Copy className="w-3.5 h-3.5" /></button>
        
        {(type === 'postNode' || type === 'strategicPostNode') && (
          <button 
            onClick={() => {
              // 🌉 CONTENT BRIDGE LOGIC
              const nodes = getNodes();
              const edges = getEdges();
              
              // 1. Encontrar ancestros (Campaña/Objetivo)
              const findParent = (nodeId: string): Node | null => {
                const edge = edges.find((e: any) => e.target === nodeId);
                if (!edge) return null;
                return nodes.find((n: any) => n.id === edge.source) || null;
              };

              let campaignNode = null;
              let objectiveNode = null;
              let current: Node | null = nodes.find(n => n.id === id) || null;
              
              // Subir por el árbol hasta encontrar Campaña u Objetivo
              let safety = 0;
              while (current && safety < 10) {
                const parent = findParent(current.id);
                if (!parent) break;
                if (parent.type === 'campaignNode' && !campaignNode) campaignNode = parent;
                if (parent.type === 'objectiveNode' && !objectiveNode) objectiveNode = parent;
                current = parent;
                safety++;
              }

              // 2. Preparar el payload
              const bridgeData = {
                content: type === 'strategicPostNode' 
                  ? `${data.header || ''}\n\n${data.tag || ''}\n${data.line1 || ''}\n${data.line2 || ''}\n\n${data.body_text || ''}\n\n${data.cta || ''}`
                  : (data.notes || data.label || ""),
                node_id: id,
                objective_id: objectiveNode?.data?.objective_id || null, // Si tiene link directo a DB
                objective_name: objectiveNode?.data?.label || null,
                campaign_name: campaignNode?.data?.label || null,
                target_month: new Date().toLocaleString('es-ES', { month: 'long' }),
                suggested_platforms: ['instagram'] // Fallback
              };

              // 3. Persistir y Redirigir
              localStorage.setItem('rrss_content_bridge', JSON.stringify(bridgeData));
              router.push('/editor?source=planner');
              toast.success("Enviado al Editor de Contenidos 🚀");
            }} 
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-orange-500/20 text-orange-600 dark:text-orange-400 hover:bg-orange-500/30 transition-all border border-orange-500/30" 
            title="Enviar a Editor de Contenidos"
          >
            <Zap className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold">ENVIAR A EDITOR</span>
          </button>
        )}

        {type === 'articleNode' && (
          <button 
            onClick={() => {
              const url = new URL(window.location.origin + '/blog');
              url.searchParams.set('node_id', id);
              // Intentar pasar el session_id si está en el contexto global o si lo buscamos
              router.push(url.pathname + url.search);
              toast.success("Teletransportando al SEO Lab...");
            }} 
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/30 transition-all border border-emerald-500/30" 
            title="Escribir en SEO Lab"
          >
            <Pen className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold">ESCRIBIR ARTÍCULO</span>
          </button>
        )}
      </NodeToolbar>

      {/* Handles */}
      <Handle 
        type="target" 
        position={Position.Top} 
        className="!w-3 !h-3 !rounded-full !bg-neutral-600 !border-2 !border-neutral-400 !cursor-crosshair hover:!bg-violet-400 !transition-colors !-top-1.5"
      />

      <div className="nodrag px-4 pt-4 pb-6 flex flex-col h-full overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <div className={`flex items-center gap-2 mb-3 shrink-0`}>
          <div className={`p-1.5 rounded-lg bg-white/5 shrink-0`}><Icon className={`w-4 h-4 ${cfg.color}`} /></div>
          <span className={`text-[9px] font-black tracking-[0.2em] uppercase ${cfg.color} truncate`}>{cfg.label}</span>
        </div>

        <textarea
          className="nodrag nopan nowheel w-full bg-transparent text-sm font-bold text-white leading-tight resize-none outline-none overflow-hidden placeholder:text-white/30 rounded-lg p-1 focus:bg-white/5 transition-all shadow-none border-none shrink-0"
          value={data.label || ''}
          onChange={onLabelChange}
          onPointerDown={e => e.stopPropagation()}
          onClick={e => e.stopPropagation()}
          onKeyDown={e => e.stopPropagation()}
          placeholder={`Nombre del ${cfg.label.toLowerCase()}...`}
          rows={Math.max(1, Math.ceil((data.label || '').length / 28))}
          style={{ minHeight: 28 }}
        />

        {selected && (
          <textarea
            className="nodrag nopan nowheel w-full mt-2 bg-black/20 text-xs text-white/70 resize-none outline-none rounded-lg p-2 placeholder:text-white/25 border border-white/10 focus:border-white/30 transition-all shadow-none flex-grow min-h-[60px]"
            value={data.notes || ''}
            onChange={onNotesChange}
            onPointerDown={e => e.stopPropagation()}
            onClick={e => e.stopPropagation()}
            onKeyDown={e => e.stopPropagation()}
            placeholder="Notas / descripción..."
            style={{ height: '100%' }}
          />
        )}

        {/* ── Visual Replica for Strategic Post ── */}
        {type === 'strategicPostNode' && (
          <div className="mt-4 border border-white/10 rounded-xl overflow-hidden shadow-2xl flex flex-col flex-grow min-h-0">
            {/* Black Header */}
            <div className="bg-black px-3 py-2 flex items-center gap-2 shrink-0">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              <input 
                className="bg-transparent border-none outline-none text-[10px] font-black text-white uppercase tracking-tighter w-full"
                value={data.header || 'PRIMER REPORTE — fenómeno local'}
                onChange={e => setNodes(nds => nds.map(n => n.id === id ? { ...n, data: { ...n.data, header: e.target.value } } : n))}
                placeholder="ENCABEZADO..."
              />
            </div>
            
            {/* Dark Body Section */}
            <div className="bg-[#1C0A00] p-4 space-y-3 shrink-0">
              <input 
                className="bg-transparent border-none outline-none text-[10px] font-bold text-orange-400 uppercase tracking-widest block w-full"
                value={data.tag || '#NEGOCIOSLOCALES'}
                onChange={e => setNodes(nds => nds.map(n => n.id === id ? { ...n, data: { ...n.data, tag: e.target.value } } : n))}
                placeholder="#TAG"
              />
              <div className="space-y-1">
                <textarea 
                  className="bg-transparent border-none outline-none text-sm font-black text-white uppercase leading-none w-full resize-none overflow-hidden"
                  value={data.line1 || 'TU CLIENTE TE BUSCA'}
                  onChange={e => setNodes(nds => nds.map(n => n.id === id ? { ...n, data: { ...n.data, line1: e.target.value } } : n))}
                  rows={2}
                  placeholder="LÍNEA 1"
                />
                <div className="h-[1px] bg-orange-500/60 w-full" />
                <textarea 
                  className="bg-transparent border-none outline-none text-sm font-black text-orange-400 uppercase leading-none w-full resize-none overflow-hidden"
                  value={data.line2 || 'Y ENCUENTRA A OTRO'}
                  onChange={e => setNodes(nds => nds.map(n => n.id === id ? { ...n, data: { ...n.data, line2: e.target.value } } : n))}
                  rows={2}
                  placeholder="LÍNEA 2"
                />
              </div>
            </div>

            {/* Light Bottom Section */}
            <div className="bg-[#f0f0f0] p-4 space-y-3 flex-grow flex flex-col min-h-0 overflow-hidden">
              <textarea 
                className="bg-transparent border-none outline-none text-[11px] text-neutral-600 font-medium leading-relaxed w-full resize-none flex-grow min-h-[40px] focus:bg-black/5 rounded-md p-1 transition-all"
                value={data.body_text || ''}
                onChange={e => setNodes(nds => nds.map(n => n.id === id ? { ...n, data: { ...n.data, body_text: e.target.value } } : n))}
                placeholder="Tono / Caption principal..."
                style={{ height: '100%', minHeight: '60px' }}
              />
              <div className="flex shrink-0">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-neutral-300 rounded-full shadow-sm">
                  <span className="text-[9px] font-bold text-neutral-500 dark:text-neutral-500">CTA →</span>
                  <input 
                    className="bg-transparent border-none outline-none text-[9px] font-black text-neutral-800 tracking-tight w-24"
                    value={data.cta || 'Comenta y vota'}
                    onChange={e => setNodes(nds => nds.map(n => n.id === id ? { ...n, data: { ...n.data, cta: e.target.value } } : n))}
                    placeholder="Acción..."
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {data.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {data.tags.map((t: string) => (
              <span key={t} className={`text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/10 ${cfg.color}`}>{t}</span>
            ))}
          </div>
        )}
      </div>

      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="!w-3 !h-3 !rounded-full !bg-neutral-600 !border-2 !border-neutral-400 !cursor-crosshair hover:!bg-violet-400 !transition-colors !-bottom-1.5"
      />
    </div>
  );
}

// Wrap for each type
const ObjectiveNodeC = (p: any) => <PlanNode {...p} type="objectiveNode" />;
const CampaignNodeC  = (p: any) => <PlanNode {...p} type="campaignNode" />;
const ArticleNodeC   = (p: any) => <PlanNode {...p} type="articleNode" />;
const PostNodeC          = (p: any) => <PlanNode {...p} type="postNode" />;
const IdeaNodeC          = (p: any) => <PlanNode {...p} type="ideaNode" />;
const StrategicPostNodeC = (p: any) => <PlanNode {...p} type="strategicPostNode" />;

const nodeTypes = {
  objectiveNode: ObjectiveNodeC,
  campaignNode:  CampaignNodeC,
  articleNode:   ArticleNodeC,
  postNode:      PostNodeC,
  ideaNode:      IdeaNodeC,
  strategicPostNode: StrategicPostNodeC,
};

// ─── Deletable Edge ─────────────────────────────────────────────────────────
function DeletableEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style = {}, selected }: EdgeProps) {
  const { setEdges } = useReactFlow();
  const [path, lx, ly] = getSmoothStepPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
  return (
    <>
      <BaseEdge path={path} style={style} />
      <EdgeLabelRenderer>
        <div 
          style={{ transform: `translate(-50%,-50%) translate(${lx}px,${ly}px)`, pointerEvents: 'all', position: 'absolute' }} 
          className={`transition-all duration-200 nodrag nopan z-50 flex items-center justify-center rounded-full bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 shadow-md ${selected ? 'opacity-100 scale-125 ring-2 ring-red-400' : 'opacity-0 hover:opacity-100 hover:scale-110'}`}
        >
          <button 
           onClick={e => { e.stopPropagation(); setEdges(eds => eds.filter(e => e.id !== id)); }} 
           className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center text-neutral-500 hover:text-red-500 text-[10px] md:text-xs font-black transition-colors" 
           title="Eliminar conexión">
            ✕
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

const edgeTypes = { deletable: DeletableEdge };

// ─── Dagre Layout ───────────────────────────────────────────────────────────
function applyDagreLayout(nodes: Node[], edges: Edge[]) {
  if (!nodes.length) return { nodes, edges };
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'TB', ranksep: 120, nodesep: 80, marginx: 40, marginy: 40 });
  nodes.forEach(n => g.setNode(n.id, { width: 260, height: 110 }));
  edges.forEach(e => { if (nodes.find(n => n.id === e.source) && nodes.find(n => n.id === e.target)) g.setEdge(e.source, e.target); });
  dagre.layout(g);
  const root = g.node('root');
  const xOff = root ? root.x : (g.node(nodes[0].id)?.x ?? 0);
  return {
    nodes: nodes.map(n => {
      const p = g.node(n.id);
      if (!p) return n;
      return { ...n, position: { x: p.x - xOff - 130, y: p.y - 55 } };
    }),
    edges,
  };
}

// ─── Palette Item ────────────────────────────────────────────────────────────
function PaletteItem({ type, label, icon: Icon, color, bg }: any) {
  const onDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/planner-node-type', type);
    e.dataTransfer.effectAllowed = 'move';
  };
  return (
    <div draggable onDragStart={onDragStart} className={`flex items-center gap-3 p-3 rounded-xl border cursor-grab active:cursor-grabbing hover:scale-[1.02] transition-all bg-white/5 backdrop-blur-sm ${color.replace('text-', 'border-').replace('300', '500/30')} group`}>
      <div className="p-2 rounded-lg bg-white/5"><Icon className={`w-4 h-4 ${color}`} /></div>
      <div>
        <p className={`text-xs font-bold ${color}`}>{label}</p>
        <p className="text-[10px] text-neutral-500">Arrastra al canvas</p>
      </div>
    </div>
  );
}

// ─── Main Inner Component ────────────────────────────────────────────────────
function StrategyPlannerInner() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [sessionName, setSessionName] = useState('Nueva Planificación');
  const [objectives, setObjectives] = useState<any[]>([]);
  const [selectedObjectiveId, setSelectedObjectiveId] = useState<string>('');
  const [newObjectiveName, setNewObjectiveName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showSessions, setShowSessions] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [exportJson, setExportJson] = useState('');
  const [strategyRules, setStrategyRules] = useState('');
  const { screenToFlowPosition, fitView, getNodes, getEdges } = useReactFlow();

  // Canvas arranca en blanco — el usuario construye su plan desde cero
  useEffect(() => {
    loadSessions();
    loadObjectives();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Escuchar a Donna para inyectar plan automático
  useEffect(() => {
    const handleLoadStrategy = (e: CustomEvent) => {
      const plan = e.detail;
      if (!plan || !Array.isArray(plan)) return;

      if (plan.length > 0 && plan[0].name) {
        setSessionName(`Estrategia: ${plan[0].name}`);
      }

      const newNodes: Node[] = [];
      const newEdges: Edge[] = [];

      function traverse(item: any, parentId: string | null = null) {
        // Enforce valid types
        const type = item.type || 'ideaNode';
        const id = `${type}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
        
        // Define cfg or fallback
        const cfg = NODE_CONFIG[type as NodeKind] || NODE_CONFIG.ideaNode;

        const node: Node = {
          id,
          type,
          position: { x: 0, y: 0 }, // Dagre arreglará esto
          data: {
            label: item.name || `Nuevo ${cfg.label}`,
            notes: item.notes || '',
            tags: item.tags || []
          }
        };
        newNodes.push(node);

        if (parentId) {
          newEdges.push({
            id: `e-${parentId}-${id}`,
            source: parentId,
            target: id,
            type: 'deletable',
            style: { stroke: '#475569', strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#475569' }
          });
        }

        if (item.children && Array.isArray(item.children)) {
          item.children.forEach((child: any) => traverse(child, id));
        }
      }

      // Procesar cada árbol raíz
      plan.forEach(rootItem => traverse(rootItem));

      // Si tenemos algo, aplicamos Dagre
      if (newNodes.length > 0) {
        // Concatenamos con los nodos actuales o reemplazamos? 
        // Mejor añadir al lienzo actual pero reordenar TODO.
        setNodes(prev => {
          const combinedNodes = [...prev, ...newNodes];
          setEdges(prevE => {
            const combinedEdges = [...prevE, ...newEdges];
            const { nodes: layoutedNodes, edges: layoutedEdges } = applyDagreLayout(combinedNodes, combinedEdges);
            setTimeout(() => fitView({ duration: 800, padding: 0.2 }), 100);
            return layoutedEdges;
          });
          return applyDagreLayout(combinedNodes, [...edges, ...newEdges]).nodes;
        });
        toast.success("🧠 Mapa Estratégico cargado por Donna");
      }
    };

    window.addEventListener('donna-load-strategy', handleLoadStrategy as EventListener);
    return () => window.removeEventListener('donna-load-strategy', handleLoadStrategy as EventListener);
  }, [setNodes, setEdges, fitView, edges]);

  async function loadObjectives() {
    const res = await fetch('/api/objectives', { cache: 'no-store' });
    if (res.ok) {
      const result = await res.json();
      setObjectives(result.data || []);
    }
  }

  async function loadSessions() {
    const res = await fetch('/api/strategy-sessions', { cache: 'no-store' });
    if (res.ok) {
      const result = await res.json();
      setSessions(result.data || []);
    }
  }

  async function loadSession(s: Session) {
    const res = await fetch(`/api/strategy-sessions/${s.id}`, { cache: 'no-store' });
    if (!res.ok) return;
    const data = await res.json();
    setNodes(data.nodes || []);
    setEdges(data.edges || []);
    setStrategyRules(data.description || '');
    setCurrentSession(s);
    setSessionName(s.name);
    setShowSessions(false);
    setTimeout(() => fitView({ duration: 600, padding: 0.2 }), 200);
  }

  async function saveSession() {
    if (!selectedObjectiveId) {
      toast.error('Selecciona o crea un Objetivo Estratégico Asociado');
      return;
    }
    if (selectedObjectiveId === 'new' && !newObjectiveName.trim()) {
      toast.error('Escribe el nombre del nuevo objetivo');
      return;
    }
    
    setIsSaving(true);
    const payload = { 
      id: currentSession?.id, 
      name: sessionName.trim() || 'Nueva Planificación', 
      description: strategyRules,
      nodes: getNodes(), 
      edges: getEdges(),
      objective_id: selectedObjectiveId === 'new' ? null : selectedObjectiveId,
      new_objective_name: selectedObjectiveId === 'new' ? newObjectiveName.trim() : undefined
    };
    const res = await fetch('/api/strategy-sessions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (res.ok) {
      const savedResult = await res.json();
      setCurrentSession(savedResult);
      setSessionName(savedResult.name || sessionName);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      loadSessions();
      toast.success("Plan guardado");
    } else {
      const errorMsg = await res.json();
      toast.error(`❌ Falló al guardar: ${errorMsg.error || 'Desconocido'}`);
      console.error("SaveSession error:", errorMsg);
    }
    setIsSaving(false);
  }

  async function deleteSession(id: string) {
    if (!confirm('¿Eliminar esta sesión?')) return;
    await fetch(`/api/strategy-sessions/${id}`, { method: 'DELETE' });
    if (currentSession?.id === id) { setCurrentSession(null); setNodes([]); setEdges([]); }
    loadSessions();
    toast.success("Sesión eliminada");
  }

  function autoArrange() {
    const { nodes: ln, edges: le } = applyDagreLayout(getNodes(), getEdges());
    setNodes(ln);
    setEdges(le);
    setTimeout(() => fitView({ duration: 800, padding: 0.2 }), 100);
  }

  function exportForDonna() {
    const ns = getNodes();
    const es = getEdges();
    const childMap = new Map<string, string[]>();
    es.forEach(e => { if (!childMap.has(e.source)) childMap.set(e.source, []); childMap.get(e.source)!.push(e.target); });
    const nodeMap = new Map(ns.map(n => [n.id, n]));
    function buildTree(id: string): any {
      const node = nodeMap.get(id);
      if (!node) return null;
      const children = (childMap.get(id) || []).map(buildTree).filter(Boolean);
      const base: any = { id, type: node.type, name: node.data.label, notes: node.data.notes || '' };
      if (children.length) base.children = children;
      return base;
    }
    const roots = ns.filter(n => !es.find(e => e.target === n.id));
    const tree = { session: sessionName, created_at: new Date().toISOString(), plan: roots.map(r => buildTree(r.id)).filter(Boolean) };
    setExportJson(JSON.stringify(tree, null, 2));
    setShowExport(true);
  }

  function sendToDonna() {
    const ns = getNodes();
    const es = getEdges();
    const childMap = new Map<string, string[]>();
    es.forEach(e => { if (!childMap.has(e.source)) childMap.set(e.source, []); childMap.get(e.source)!.push(e.target); });
    const nodeMap = new Map(ns.map(n => [n.id, n]));
    
    function buildTextSummary(id: string, depth = 0): string {
      const node = nodeMap.get(id);
      if (!node) return '';
      const indent = '  '.repeat(depth);
      const typeMap: Record<string, string> = { objectiveNode: '🎯 Objetivo:', campaignNode: '🚀 Campaña:', articleNode: '📄 Artículo:', postNode: '📱 Post:', ideaNode: '💡 Idea:' };
      const prefix = typeMap[node.type as string] || '•';
      const label = node.data?.label || '(sin título)';
      let text = `${indent}${prefix} ${label}\n`;
      
      // Detalles extra para Post Estratégico
      if (node.type === 'strategicPostNode' && node.data) {
        if (node.data.header) text += `${indent}  [Cabecera]: ${node.data.header}\n`;
        if (node.data.tag)    text += `${indent}  [Tag]: ${node.data.tag}\n`;
        if (node.data.line1)  text += `${indent}  [Línea 1]: ${node.data.line1}\n`;
        if (node.data.line2)  text += `${indent}  [Línea 2]: ${node.data.line2}\n`;
        if (node.data.body_text) text += `${indent}  [Tono/Body]: ${node.data.body_text}\n`;
        if (node.data.cta)    text += `${indent}  [CTA]: ${node.data.cta}\n`;
      }

      const children = childMap.get(id) || [];
      children.forEach(cid => { text += buildTextSummary(cid, depth + 1); });
      return text;
    }
    
    const roots = ns.filter(n => !es.find(e => e.target === n.id));
    if (roots.length === 0) {
      toast.error('El lienzo está vacío. Agrega nodos primero.');
      return;
    }
    
    let planText = roots.map(r => buildTextSummary(r.id)).join('\n');
    
    // Inyectar reglas globales si existen
    if (strategyRules.trim()) {
      planText = `REGLAS DE ESTRATEGIA PARA ESTA SESIÓN:\n${strategyRules}\n\nESTRUCTURA DEL MAPA:\n${planText}`;
    }
    
    const prefillText = `Aquí tienes la estrategia que estoy diseñando:\n\n${planText}\n¿Qué opinas, o cómo podemos desglosar y ejecutar esto?`;
    window.dispatchEvent(new CustomEvent('donna-prefill', { detail: prefillText }));
    toast.success("Enviado a Donna");
  }

  // Drag & Drop from palette
  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/planner-node-type') as NodeKind;
    if (!type) return;
    const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
    const cfg = NODE_CONFIG[type];
    const newNode: Node = {
      id: `${type}-${Date.now()}`,
      type,
      position,
      data: { 
        label: type === 'strategicPostNode' ? 'Post Estratégico' : `Nuevo ${cfg.label.toLowerCase()}`, 
        notes: '', 
        tags: [],
        header: type === 'strategicPostNode' ? 'PRIMER REPORTE — fenómeno local' : undefined,
        tag: type === 'strategicPostNode' ? '#NEGOCIOSLOCALES' : undefined,
        line1: type === 'strategicPostNode' ? 'TU CLIENTE TE BUSCA' : undefined,
        line2: type === 'strategicPostNode' ? 'Y ENCUENTRA A OTRO' : undefined,
        body_text: type === 'strategicPostNode' ? 'Algo que nadie dice en voz alta sobre los negocios en Loja...' : undefined,
        cta: type === 'strategicPostNode' ? 'Comenta y vota' : undefined
      },
    };
    setNodes(nds => [...nds, newNode]);
  }, [screenToFlowPosition, setNodes]);

  const onDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }, []);
  const onConnect = useCallback((p: Connection) => setEdges(eds => addEdge({ ...p, type: 'deletable', style: { stroke: '#475569', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#475569' } } as any, eds)), [setEdges]);

  const paletteItems: Array<{ type: NodeKind; label: string; icon: any; color: string; bg: string }> = [
    { type: 'objectiveNode', label: 'Objetivo Estratégico', icon: Target,     color: 'text-violet-300', bg: 'bg-violet-500/5 hover:bg-violet-500/15' },
    { type: 'campaignNode',  label: 'Campaña / Iniciativa', icon: Rocket,     color: 'text-amber-300',  bg: 'bg-amber-500/5 hover:bg-amber-500/15' },
    { type: 'articleNode',   label: 'Artículo / Anchor',    icon: FileText,   color: 'text-emerald-300',bg: 'bg-emerald-500/5 hover:bg-emerald-500/15' },
    { type: 'postNode',      label: 'Post / Reel / Video',  icon: Smartphone, color: 'text-sky-300',    bg: 'bg-sky-500/5 hover:bg-sky-500/15' },
    { type: 'strategicPostNode', label: 'Post Estratégico', icon: Sparkles,   color: 'text-orange-300', bg: 'bg-orange-500/5 hover:bg-orange-500/15' },
    { type: 'ideaNode',      label: 'Idea libre',           icon: Lightbulb,  color: 'text-yellow-300', bg: 'bg-yellow-500/5 hover:bg-yellow-500/15' },
  ];

  return (
    <div className="absolute inset-0 flex overflow-hidden rounded-3xl border border-white/10 shadow-2xl">

      {/* ── Sidebar del Planner (Sub-Sidebar) ── */}
      <aside className="w-72 shrink-0 bg-white/10 dark:bg-black/40 border-r border-white/10 flex flex-col h-full overflow-hidden backdrop-blur-xl z-20">

        {/* Header */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-2 mb-1">
            <LayoutDashboard className="w-5 h-5 text-violet-500" />
            <h1 className="text-sm font-black text-neutral-900 dark:text-white tracking-tight leading-none">STRATEGY PLANNER</h1>
          </div>
          <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest mt-1">Cerebro de Campaña</p>
        </div>

        {/* Session Name */}
        <div className="px-4 pt-4 pb-2">
          <label className="text-[10px] font-bold text-neutral-500 dark:text-neutral-500 uppercase tracking-widest block mb-1.5">Nombre del plan</label>
          <input
            value={sessionName}
            onChange={e => setSessionName(e.target.value)}
            className="w-full bg-white/5 dark:bg-black/40 border border-white/10 text-neutral-900 dark:text-white text-xs px-3 py-2.5 rounded-xl outline-none focus:border-violet-500/50 transition-all placeholder:text-neutral-500"
            placeholder="ej: Planificación Q2 2026"
          />
        </div>

        {/* Objective Selector */}
        <div className="px-4 pb-2">
          <label className="text-[10px] font-bold text-neutral-500 dark:text-neutral-500 uppercase tracking-widest block mb-1.5">Objetivo Asociado</label>
          <select
            value={selectedObjectiveId}
            onChange={e => setSelectedObjectiveId(e.target.value)}
            className="w-full bg-white/5 dark:bg-black/40 border border-white/10 text-neutral-900 dark:text-white text-xs px-3 py-2.5 rounded-xl outline-none focus:border-violet-500/50 transition-all cursor-pointer"
          >
            <option value="" disabled>Selecciona un objetivo...</option>
            {objectives.map(o => (
              <option key={o.id} value={o.id}>{o.emoji || '🎯'} {o.name}</option>
            ))}
            <option value="new">✨ Crear NUEVO objetivo...</option>
          </select>
          
          {selectedObjectiveId === 'new' && (
            <input
              value={newObjectiveName}
              onChange={e => setNewObjectiveName(e.target.value)}
              className="mt-2 w-full bg-pink-500/5 dark:bg-pink-500/10 border border-pink-500/30 text-neutral-900 dark:text-white text-xs px-3 py-2.5 rounded-xl outline-none focus:border-pink-500 transition-all placeholder:text-pink-500/50"
              placeholder="Escribe el título del objetivo..."
              autoFocus
            />
          )}
        </div>

        {/* Global Strategy Rules */}
        <div className="px-4 pb-2">
          <label className="text-[10px] font-bold text-neutral-500 dark:text-neutral-500 uppercase tracking-widest block mb-1.5 flex items-center gap-1.5">
            <BookOpen className="w-3 h-3 text-amber-500" /> Reglas de Estrategia
          </label>
          <textarea
            value={strategyRules}
            onChange={e => setStrategyRules(e.target.value)}
            rows={5}
            className="w-full bg-white/5 dark:bg-black/40 border border-white/10 text-neutral-900 dark:text-white text-[11px] px-3 py-2.5 rounded-xl outline-none focus:border-amber-500/50 transition-all placeholder:text-neutral-500 resize-none scrollbar-thin scrollbar-thumb-white/10 font-medium leading-relaxed"
            placeholder="Pega aquí las reglas tácticas, tonos, restricciones y leyes de esta estrategia..."
          />
        </div>

        {/* Action Buttons */}
        <div className="px-4 py-3 space-y-2">
          <button onClick={saveSession} disabled={isSaving}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg ${saved ? 'bg-emerald-600/90 text-white' : 'bg-violet-600/90 hover:bg-violet-500 text-white'} active:scale-95`}>
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            {isSaving ? 'Guardando...' : saved ? 'Guardado ✓' : 'Guardar sesión'}
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={autoArrange} className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] font-bold bg-white/5 dark:bg-black/40 hover:bg-white/10 dark:hover:bg-white/5 text-neutral-700 dark:text-neutral-300 transition-all active:scale-95 border border-white/10">
              <RefreshCw className="w-3 h-3 text-violet-500" /> ORDENAR
            </button>
            <button onClick={sendToDonna} className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] font-bold bg-pink-500/10 dark:bg-pink-600/20 hover:bg-pink-500/20 text-pink-700 dark:text-pink-400 transition-all active:scale-95 border border-pink-500/20">
              <Sparkles className="w-3 h-3 text-pink-500" /> A DONNA
            </button>
          </div>
          <button onClick={exportForDonna} className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] font-bold bg-white/5 dark:bg-black/40 hover:bg-white/10 dark:hover:bg-white/5 text-neutral-700 dark:text-neutral-300 transition-all active:scale-95 border border-white/10">
            <Download className="w-3 h-3 text-emerald-500" /> EXPORTAR JSON MANUAL
          </button>
          <button onClick={() => setShowSessions(s => !s)} className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl text-xs font-bold bg-white/5 dark:bg-black/20 hover:bg-white/10 dark:hover:bg-black/40 text-neutral-600 dark:text-neutral-400 transition-all border border-white/10">
            <span className="flex items-center gap-2 font-bold"><FolderOpen className="w-3.5 h-3.5 text-amber-500" /> Mis sesiones ({sessions.length})</span>
            {showSessions ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>
          {showSessions && (
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10">
              {sessions.length === 0 && <p className="text-[10px] text-neutral-500 text-center py-4">Sin sesiones guardadas</p>}
              {sessions.map(s => (
                <div key={s.id} className="flex items-center gap-2 group/sess">
                  <button onClick={() => loadSession(s)} className={`flex-1 text-left px-3 py-2 rounded-lg text-xs font-medium transition-all truncate ${currentSession?.id === s.id ? 'bg-violet-600/20 text-violet-600 dark:text-violet-300 border border-violet-500/30' : 'hover:bg-white/10 dark:hover:bg-black/40 text-neutral-600 dark:text-neutral-400'}`}>
                    {s.name}
                  </button>
                  <button onClick={() => deleteSession(s.id)} className="opacity-0 group-hover/sess:opacity-100 p-1.5 rounded-lg hover:bg-red-500/20 hover:text-red-500 text-neutral-400 transition-all">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="mx-4 border-t border-white/10 my-2" />

        {/* Palette */}
        <div className="px-4 pb-4 flex-1 overflow-y-auto scrollbar-none">
          <label className="text-[10px] font-black text-neutral-500 dark:text-neutral-500 uppercase tracking-[0.2em] flex items-center gap-2 mb-3">
            <Sparkles className="w-3 h-3 text-pink-500" /> PALETA DE NODOS
          </label>
          <div className="space-y-2">
            {paletteItems.map(item => <PaletteItem key={item.type} {...item} />)}
          </div>

          <div className="mt-5 p-3 rounded-xl bg-violet-600/5 border border-violet-500/20 backdrop-blur-sm">
            <p className="text-[10px] font-bold text-violet-600 dark:text-violet-400 mb-1">💡 Cómo usar</p>
            <ul className="text-[10px] text-neutral-500 dark:text-neutral-400 space-y-1">
              <li>• Arrastra nodos al canvas</li>
              <li>• Conecta: tira desde el punto azul</li>
              <li>• Elimina conexión: hover → ✕</li>
              <li>• Redimensiona: selecciona el nodo</li>
              <li>• Edita: clic en cualquier texto</li>
            </ul>
          </div>
        </div>
      </aside>

      {/* ── Canvas ── */}
      <div className="flex-1 h-full relative">
        {/* Floating top badge */}
        <Panel position="top-center" className="pointer-events-none">
          <div className="px-5 py-2 bg-white/10 dark:bg-black/60 border border-white/10 rounded-2xl backdrop-blur-xl shadow-2xl">
            <span className="text-xs font-black text-neutral-800 dark:text-neutral-200 tracking-widest">{sessionName.toUpperCase()}</span>
            {currentSession && <span className="ml-3 text-[10px] text-neutral-500">ID: {currentSession.id.slice(0, 8)}</span>}
          </div>
        </Panel>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes as any}
          edgeTypes={edgeTypes as any}
          defaultEdgeOptions={{ type: 'deletable', style: { stroke: '#475569', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#475569' } }}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          minZoom={0.05}
          maxZoom={3}
          panOnScroll
          selectionOnDrag
          selectNodesOnDrag={false}
          deleteKeyCode={['Backspace', 'Delete']}
          multiSelectionKeyCode="Shift"
          connectionRadius={30}
        >
          <Background 
            color="#475569" 
            variant={BackgroundVariant.Dots} 
            gap={25} 
            size={0.5} 
            className="opacity-20"
          />
          <Controls 
            className="!bg-white/10 dark:!bg-black/60 !border-white/10 !rounded-2xl !shadow-2xl !bottom-8 !left-8 !backdrop-blur-xl" 
            showInteractive={false} 
          />
          <MiniMap 
            className="!bg-white/10 dark:!bg-black/80 !border-white/10 !rounded-2xl !shadow-2xl !bottom-8 !right-8 !backdrop-blur-xl" 
            maskColor="rgba(0,0,0,0.5)"
            nodeColor={n => {
              if (n.type === 'objectiveNode') return '#8b5cf6';
              if (n.type === 'campaignNode')  return '#f59e0b';
              if (n.type === 'articleNode')   return '#10b981';
              if (n.type === 'postNode')      return '#0ea5e9';
              return '#eab308';
            }}
          />
        </ReactFlow>
      </div>

      {/* ── Export Modal ── */}
      {showExport && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-[99999] flex items-center justify-center p-6" onClick={() => setShowExport(false)}>
          <div className="bg-white/40 dark:bg-black/60 border border-white/20 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col backdrop-blur-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div>
                <h2 className="text-sm font-black text-neutral-900 dark:text-white flex items-center gap-2 tracking-tight">
                  <Sparkles className="w-4 h-4 text-pink-500" /> CONTEXTO PARA DONNA
                </h2>
                <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mt-0.5">Cerebro de Estrategia Exportado</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { navigator.clipboard.writeText(exportJson); toast.success("JSON copiado"); }} className="px-3 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg"><Copy className="w-3 h-3" /> COPIAR</button>
                <button onClick={() => setShowExport(false)} className="p-1.5 rounded-lg hover:bg-white/10 dark:hover:bg-black/40 text-neutral-400"><X className="w-4 h-4" /></button>
              </div>
            </div>
            <pre className="flex-1 overflow-auto p-6 text-[11px] text-pink-600 dark:text-pink-400 font-mono leading-relaxed bg-black/5 dark:bg-black/20 m-4 rounded-2xl scrollbar-thin scrollbar-thumb-pink-500/20">{exportJson}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Root Export ─────────────────────────────────────────────────────────────
export default function StrategyPlanner() {
  return (
    <ReactFlowProvider>
      <StrategyPlannerInner />
    </ReactFlowProvider>
  );
}
