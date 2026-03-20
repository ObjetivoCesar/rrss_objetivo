import { Handle, Position } from '@xyflow/react';
import { Target, Layers } from 'lucide-react';

export function ObjectiveNode({ data }: any) {
  return (
    <div className="px-4 py-2 shadow-xl shadow-blue-500/20 rounded-xl bg-slate-900 border border-blue-500/50 min-w-[200px]">
      <Handle type="target" position={Position.Top} className="w-16 !bg-blue-500" />
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 bg-blue-500/20 rounded-lg">
          <Target className="w-4 h-4 text-blue-400" />
        </div>
        <div className="text-xs font-medium text-blue-400 tracking-wider uppercase">Objetivo</div>
      </div>
      <div className="text-sm font-bold text-white mb-1">{data.label}</div>
      {data.description && (
        <div className="text-xs text-slate-400 line-clamp-2">{data.description}</div>
      )}
      <Handle type="source" position={Position.Bottom} className="w-16 !bg-blue-500" />
    </div>
  );
}
