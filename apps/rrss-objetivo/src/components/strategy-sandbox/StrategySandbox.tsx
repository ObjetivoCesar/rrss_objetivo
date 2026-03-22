'use client';

import React, { useState, useCallback, useRef } from 'react';
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
  Panel,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { ObjectiveNode } from '../strategy/nodes/ObjectiveNode';
import { CampaignNode } from '../strategy/nodes/CampaignNode';
import { IdeaNode } from '../strategy/nodes/IdeaNode';
import { ContentBlockNode } from '../strategy/nodes/ContentBlockNode';
import { 
  Plus, 
  Trash2, 
  Layout, 
  MousePointer2, 
  Zap, 
  Lightbulb, 
  Target, 
  Rocket, 
  Type, 
  Heading1, 
  Heading2,
  Maximize2
} from 'lucide-react';

// Re-use current custom nodes
const nodeTypes = {
  objectiveNode: ObjectiveNode,
  campaignNode: CampaignNode,
  ideaNode: IdeaNode,
  contentBlockNode: ContentBlockNode,
};

const initialNodes: Node[] = [
  {
    id: 'intro-1',
    type: 'ideaNode',
    position: { x: 400, y: 200 },
    data: { label: '🚀 BIENVENIDO AL SANDBOX\n\nArrastra elementos desde la izquierda para probar el UX.' },
  }
];

let id = 0;
const getId = () => `sandbox_node_${id++}`;

function SandboxCanvas() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const { screenToFlowPosition } = useReactFlow();

  const onConnect = useCallback((params: Connection | Edge) => {
    const newEdge = { 
      ...params, 
      type: 'smoothstep', 
      animated: true,
      style: { stroke: '#6366f1', strokeWidth: 3 } 
    } as Edge;
    setEdges((eds) => addEdge(newEdge, eds));
  }, [setEdges]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      const label = event.dataTransfer.getData('application/reactflow-label');
      const blockType = event.dataTransfer.getData('application/reactflow-blocktype');

      if (!type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node = {
        id: getId(),
        type,
        position,
        data: { 
          label: label || 'Nuevo elemento',
          type: type === 'ideaNode' ? 'idea' : undefined,
          blockType: blockType || undefined
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes]
  );

  return (
    <div className="flex-1 h-full relative" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes as any}
        fitView
        className="bg-slate-950"
        defaultEdgeOptions={{
          type: 'smoothstep',
          style: { stroke: '#475569', strokeWidth: 2 }
        }}
      >
        <Background color="#1e293b" variant={BackgroundVariant.Dots} gap={24} size={1} />
        
        <Panel position="top-right" className="flex gap-2">
           <button 
             onClick={() => setNodes([])}
             className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
           >
             <Trash2 className="w-3.5 h-3.5" /> LIMPIAR TODO
           </button>
        </Panel>

        <Panel position="bottom-center" className="bg-slate-900/80 backdrop-blur-md border border-slate-700 p-2 rounded-2xl flex items-center gap-2 shadow-2xl">
           <div className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-r border-slate-800 mr-1">
             Status: Live UX Lab
           </div>
           <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase">React Flow v12+</span>
           </div>
        </Panel>

        <Controls className="!bg-slate-900/90 !border-slate-800 !text-slate-400 !shadow-2xl !rounded-2xl" />
        <MiniMap 
            className="!bg-slate-950/90 !border-slate-800 !rounded-2xl !shadow-2xl" 
            maskColor="rgba(0,0,0,0.8)"
        />
      </ReactFlow>
    </div>
  );
}

export function StrategySandbox() {
  const onDragStart = (event: React.DragEvent, nodeType: string, label: string, blockType?: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('application/reactflow-label', label);
    if (blockType) event.dataTransfer.setData('application/reactflow-blocktype', blockType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-screen h-screen flex bg-slate-950 text-white overflow-hidden font-sans">
      
      {/* 🛠 Enhanced Sidebar Palette */}
      <aside className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col z-10 shrink-0">
        <div className="p-8 border-b border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-500/20 rounded-xl">
               <Zap className="w-6 h-6 text-indigo-400" />
            </div>
            <h2 className="text-xl font-black tracking-tighter text-white">
              LABORATORIO <span className="text-indigo-400">UX</span>
            </h2>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed font-medium">
            Prueba arrastrar, conectar y editar nodos. Sin limitaciones de bases de datos.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
          
          {/* Section: Core Nodes */}
          <div>
            <h3 className="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase mb-4 flex items-center gap-2">
              <Layout className="w-3 h-3" /> ESTRUCTURA CORE
            </h3>
            <div className="grid grid-cols-1 gap-3">
               <div 
                 draggable
                 onDragStart={(e) => onDragStart(e, 'objectiveNode', 'Nuevo Objetivo Estratégico')}
                 className="flex items-center gap-3 p-4 bg-slate-800/30 border border-slate-700/50 rounded-2xl cursor-grab hover:bg-indigo-500/10 hover:border-indigo-500/40 transition-all group"
               >
                 <div className="p-2 bg-indigo-500/10 rounded-lg group-hover:scale-110 transition-transform">
                    <Target className="w-4 h-4 text-indigo-400" />
                 </div>
                 <span className="text-xs font-bold text-slate-300">Objetivo</span>
               </div>

               <div 
                 draggable
                 onDragStart={(e) => onDragStart(e, 'campaignNode', 'Nueva Campaña RRSS')}
                 className="flex items-center gap-3 p-4 bg-slate-800/30 border border-slate-700/50 rounded-2xl cursor-grab hover:bg-amber-500/10 hover:border-amber-500/40 transition-all group"
               >
                 <div className="p-2 bg-amber-500/10 rounded-lg group-hover:scale-110 transition-transform">
                    <Rocket className="w-4 h-4 text-amber-500" />
                 </div>
                 <span className="text-xs font-bold text-slate-300">Campaña</span>
               </div>
            </div>
          </div>

          {/* Section: Ideas */}
          <div>
            <h3 className="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase mb-4 flex items-center gap-2">
              <Lightbulb className="w-3 h-3" /> CREATIVIDAD
            </h3>
            <div 
              draggable
              onDragStart={(e) => onDragStart(e, 'ideaNode', 'Escribe tu idea aquí...')}
              className="flex items-center gap-3 p-4 bg-slate-800/30 border border-slate-700/50 rounded-2xl cursor-grab hover:bg-yellow-500/10 hover:border-yellow-500/40 transition-all group"
            >
              <div className="p-2 bg-yellow-500/10 rounded-lg group-hover:scale-110 transition-transform">
                 <Lightbulb className="w-4 h-4 text-yellow-400" />
              </div>
              <span className="text-xs font-bold text-slate-300">Idea Borrador</span>
            </div>
          </div>

          {/* Section: Content Blocks */}
          <div>
            <h3 className="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase mb-4 flex items-center gap-2">
              <Type className="w-3 h-3" /> BLOQUES DE CONTENIDO
            </h3>
            <div className="grid grid-cols-1 gap-2">
               {[
                 { type: 'h1', icon: Heading1, label: 'Título H1' },
                 { type: 'h2', icon: Heading2, label: 'Subtítulo H2' },
                 { type: 'p', icon: Type, label: 'Párrafo' },
               ].map((item) => (
                 <div 
                   key={item.type}
                   draggable
                   onDragStart={(e) => onDragStart(e, 'contentBlockNode', `Contenido ${item.label}`, item.type)}
                   className="flex items-center gap-3 p-3 bg-slate-800/20 border border-slate-700/30 rounded-xl cursor-grab hover:bg-slate-700 transition-all group"
                 >
                   <item.icon className="w-4 h-4 text-slate-400 group-hover:text-white" />
                   <span className="text-[11px] font-medium text-slate-400 group-hover:text-slate-200">{item.label}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-950/50 border-t border-slate-800">
           <div className="flex items-center gap-2 text-slate-600">
             <MousePointer2 className="w-3 h-3" />
             <span className="text-[9px] font-bold uppercase tracking-wider">Modo Prototipado</span>
           </div>
        </div>
      </aside>

      {/* Main Canvas Component */}
      <SandboxCanvas />

    </div>
  );
}

export default function SandboxWrapper() {
  return (
    <ReactFlowProvider>
      <StrategySandbox />
    </ReactFlowProvider>
  );
}
