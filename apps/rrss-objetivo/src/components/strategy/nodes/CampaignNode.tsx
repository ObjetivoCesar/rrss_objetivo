import { Handle, Position } from '@xyflow/react';
import { Flag } from 'lucide-react';

export function CampaignNode({ data }: any) {
  return (
    <div className="px-4 py-2 shadow-lg shadow-amber-500/10 rounded-xl bg-slate-900 border border-amber-500/30 min-w-[200px]">
      <Handle type="target" position={Position.Top} className="w-12 !bg-amber-500" />
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
           <div className="p-1.5 bg-amber-500/20 rounded-lg">
             <Flag className="w-4 h-4 text-amber-500" />
           </div>
           <div className="text-xs font-medium text-amber-500 tracking-wider uppercase">Campaña</div>
        </div>
        <div className="text-[10px] uppercase font-bold text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
           {data.status || 'DRAFT'}
        </div>
      </div>
      <div className="text-sm font-bold text-white mb-1">{data.label}</div>
      <Handle type="source" position={Position.Bottom} className="w-12 !bg-amber-500" />
    </div>
  );
}
