import { Handle, Position, useReactFlow } from '@xyflow/react';
import { Rocket, Edit2 } from 'lucide-react';

export function CampaignNode({ id, data, selected }: any) {
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

  return (
    <div className={`px-4 py-2 shadow-lg ${selected ? 'ring-2 ring-amber-500/50 border-amber-400' : 'border-amber-500/30'} rounded-xl bg-slate-900 border min-w-[200px] group transition-all`}>
      <Handle type="target" position={Position.Top} className="w-12 !bg-amber-500" />
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
           <div className="p-1.5 bg-amber-500/20 rounded-lg">
             <Rocket className="w-4 h-4 text-amber-500" />
           </div>
           <div className="text-[10px] font-bold text-amber-500 tracking-wider uppercase flex items-center gap-1.5">
             Campaña <Edit2 className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
           </div>
        </div>
        <div className="text-[9px] uppercase font-black text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded-full border border-white/5">
           {data.status || 'DRAFT'}
        </div>
      </div>
      
      <textarea
        className="nodrag nopan nowheel w-full bg-transparent text-sm font-bold text-white leading-tight outline-none resize-none overflow-hidden placeholder:text-slate-600 block focus:ring-1 focus:ring-amber-500/50 rounded-md p-1 -ml-1 transition-all"
        value={data.label || ''}
        onChange={onChange}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        onFocus={(e) => e.target.select()}
        placeholder="Nombre de la campaña..."
        rows={Math.max(1, (data.label || '').split('\n').length)}
        style={{ minHeight: '22px' }}
      />

      <Handle type="source" position={Position.Bottom} className="w-12 !bg-amber-500" />
    </div>
  );
}
