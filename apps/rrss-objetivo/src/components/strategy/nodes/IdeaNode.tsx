import { Handle, Position } from '@xyflow/react';
import { Lightbulb } from 'lucide-react';

export function IdeaNode({ data }: { data: any }) {
  return (
    <div className="relative group bg-slate-900 border border-yellow-500/50 rounded-2xl p-4 shadow-xl shadow-yellow-500/10 hover:border-yellow-400 w-64 transition-all">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-yellow-400 border-2 border-slate-900" />
      <div className="flex items-start gap-3">
        <div className="p-2 bg-yellow-400/10 rounded-xl shrink-0">
          <Lightbulb className="w-5 h-5 text-yellow-400" />
        </div>
        <div>
          <span className="text-[10px] font-bold tracking-wider text-yellow-400/80 uppercase mb-1 block">
            Idea en Borrador
          </span>
          <h3 className="text-sm font-semibold text-white leading-snug">
            {data.label}
          </h3>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-yellow-400 border-2 border-slate-900" />
    </div>
  );
}
