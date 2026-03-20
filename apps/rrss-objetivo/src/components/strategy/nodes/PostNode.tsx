import { Handle, Position } from '@xyflow/react';
import { Share2 } from 'lucide-react';

export function PostNode({ data }: any) {
  const isOrphan = data.isOrphan;

  return (
    <div className={`px-4 py-2 shadow-sm rounded-xl bg-slate-900 border min-w-[200px]
      ${isOrphan ? 'border-red-500/50' : 'border-slate-700'}`}>
      
      <Handle type="target" position={Position.Top} className="w-6 !bg-slate-500" />
      
      <div className="flex items-center justify-between gap-2 mb-2">
         <div className="flex items-center gap-2">
           <div className="p-1.5 bg-slate-800 rounded-lg">
             <Share2 className="w-4 h-4 text-slate-400" />
           </div>
           <div className="text-xs font-medium text-slate-400 tracking-wider uppercase">Post Social</div>
         </div>
         <div className="text-[9px] uppercase font-bold text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">
           {data.platform || 'DESCONOCIDO'}
         </div>
      </div>

      <div className="text-sm font-medium text-slate-300 mb-1 line-clamp-2">{data.label}</div>
      <div className="text-[10px] text-slate-500 flex justify-between">
         <span>{data.status}</span>
         {data.publishAt && <span>{new Date(data.publishAt).toLocaleDateString()}</span>}
      </div>
      
    </div>
  );
}
