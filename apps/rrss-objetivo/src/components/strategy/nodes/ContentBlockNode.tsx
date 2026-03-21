import { Handle, Position, useReactFlow } from '@xyflow/react';
import { Heading1, Heading2, Type, MousePointerClick, Edit2 } from 'lucide-react';

export function ContentBlockNode({ id, data, selected }: { id: string, data: any, selected: boolean }) {
  const { setNodes } = useReactFlow();

  const onChange = (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          node.data = { ...node.data, label: evt.target.value };
        }
        return node;
      })
    );
  };

  const typeConfig = {
    h1: { icon: Heading1, color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/50', ring: 'ring-violet-400/20' },
    h2: { icon: Heading2, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/50', ring: 'ring-blue-400/20' },
    p: { icon: Type, color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/50', ring: 'ring-slate-400/20' },
    cta: { icon: MousePointerClick, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/50', ring: 'ring-emerald-400/20' },
  };

  const blockType = (data.blockType as keyof typeof typeConfig) || 'p';
  const config = typeConfig[blockType];
  const Icon = config.icon;

  return (
    <div className={`relative group bg-slate-900 border ${selected ? `${config.border} ring-2 ${config.ring}` : config.border} rounded-xl p-3 shadow-xl hover:${config.border} w-64 transition-all`}>
      <Handle type="target" position={Position.Top} className={`w-3 h-3 ${config.bg.replace('/10', '')} border-2 border-slate-900`} />
      <div className="flex items-start gap-3">
        <div className={`p-2 ${config.bg} rounded-lg shrink-0 mt-0.5`}>
          <Icon className={`w-4 h-4 ${config.color}`} />
        </div>
        <div className="w-full relative">
          <span className={`text-[9px] font-bold tracking-wider ${config.color} uppercase mb-1 flex items-center gap-1 opacity-80`}>
            {blockType.toUpperCase()} <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </span>
          <textarea
            className="nodrag nopan nowheel w-full bg-transparent text-sm font-medium text-slate-200 leading-tight outline-none resize-none overflow-hidden placeholder:text-slate-600 block focus:ring-1 focus:ring-slate-500/50 rounded-md p-1 -ml-1 transition-all"
            value={data.label || ''}
            onChange={onChange}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            onFocus={(e) => e.target.select()}
            placeholder="Escribe el contenido aquí..."
            rows={Math.max(1, (data.label || '').split('\n').length)}
            style={{ minHeight: '30px' }}
          />
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className={`w-3 h-3 ${config.bg.replace('/10', '')} border-2 border-slate-900`} />
    </div>
  );
}
