import { Handle, Position, useReactFlow } from '@xyflow/react';
import { Lightbulb, Edit2 } from 'lucide-react';

export function IdeaNode({ id, data, selected }: { id: string, data: any, selected: boolean }) {
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
    <div className={`relative group bg-slate-900 border ${selected ? 'border-yellow-400 ring-2 ring-yellow-400/20' : 'border-yellow-500/50'} rounded-2xl p-4 shadow-xl shadow-yellow-500/10 hover:border-yellow-400 w-64 transition-all`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-yellow-400 border-2 border-slate-900" />
      <div className="flex items-start gap-3">
        <div className="p-2 bg-yellow-400/10 rounded-xl shrink-0">
          <Lightbulb className="w-5 h-5 text-yellow-400" />
        </div>
        <div className="w-full relative">
          <span className="text-[10px] font-bold tracking-wider text-yellow-400/80 uppercase mb-1 flex items-center gap-1">
            Idea en Borrador <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </span>
          <textarea
            className="w-full bg-transparent text-sm font-semibold text-white leading-snug outline-none resize-none overflow-hidden placeholder:text-slate-600 block focus:ring-1 focus:ring-yellow-500/50 rounded-md p-1 -ml-1 transition-all"
            value={data.label || ''}
            onChange={onChange}
            onClick={(e) => e.stopPropagation()}
            onFocus={(e) => e.target.select()}
            placeholder="Escribe tu idea aquí..."
            rows={Math.max(2, (data.label || '').split('\n').length)}
            style={{ minHeight: '40px' }}
          />
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-yellow-400 border-2 border-slate-900" />
    </div>
  );
}
