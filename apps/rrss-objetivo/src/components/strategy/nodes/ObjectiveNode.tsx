import { Handle, Position, useReactFlow } from '@xyflow/react';
import { Target, Edit2 } from 'lucide-react';

export function ObjectiveNode({ id, data, selected }: any) {
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
    <div className={`px-4 py-2 shadow-xl ${selected ? 'ring-2 ring-blue-500/50 border-blue-400' : 'border-blue-500/50'} rounded-xl bg-slate-900 border min-w-[200px] group transition-all`}>
      <Handle type="target" position={Position.Top} className="w-16 !bg-blue-500" />
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 bg-blue-500/20 rounded-lg">
          <Target className="w-4 h-4 text-blue-400" />
        </div>
        <div className="text-[10px] font-bold text-blue-400 tracking-wider uppercase flex items-center gap-1.5">
          Objetivo <Edit2 className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
      
      <textarea
        className="nodrag nopan nowheel w-full bg-transparent text-sm font-bold text-white leading-tight outline-none resize-none overflow-hidden placeholder:text-slate-600 block focus:ring-1 focus:ring-blue-500/50 rounded-md p-1 -ml-1 transition-all"
        value={data.label || ''}
        onChange={onChange}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        onFocus={(e) => e.target.select()}
        placeholder="Nombre del objetivo..."
        rows={Math.max(1, (data.label || '').split('\n').length)}
        style={{ minHeight: '24px' }}
      />

      {data.description && (
        <div className="text-[11px] text-slate-400 line-clamp-2 mt-1 border-t border-white/5 pt-1 uppercase font-medium tracking-tight">
          {data.description}
        </div>
      )}
      <Handle type="source" position={Position.Bottom} className="w-16 !bg-blue-500" />
    </div>
  );
}
