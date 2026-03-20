import { Handle, Position } from '@xyflow/react';
import { FileText, Link, AlertCircle } from 'lucide-react';

export function ArticleNode({ data }: any) {
  // If no mappings, it's orphan. If mapping length > 1, it's multi-bridge.
  const isOrphan = !data.mappings || data.mappings.length === 0;

  return (
    <div className={`px-4 py-2 shadow-md rounded-xl bg-slate-900 border min-w-[220px] transition-all
      ${isOrphan ? 'border-red-500 shadow-red-500/20 animate-pulse' : 'border-emerald-500/40 shadow-emerald-500/10'}`}>
      
      <Handle type="target" position={Position.Top} className={`w-8 ${isOrphan ? '!bg-red-500' : '!bg-emerald-500'}`} />
      
      <div className="flex items-center justify-between gap-2 mb-2">
         <div className="flex items-center gap-2">
           <div className={`p-1.5 rounded-lg ${isOrphan ? 'bg-red-500/20' : 'bg-emerald-500/20'}`}>
             {isOrphan ? <AlertCircle className="w-4 h-4 text-red-400" /> : <FileText className="w-4 h-4 text-emerald-400" />}
           </div>
           <div className={`text-xs font-medium tracking-wider uppercase ${isOrphan ? 'text-red-400' : 'text-emerald-400'}`}>
             Artículo
           </div>
         </div>
         
         {!isOrphan && (
             <div className="flex gap-1">
                 {data.mappings.map((m: any, i:number) => (
                    <span key={i} className="text-[9px] uppercase font-bold text-slate-300 bg-emerald-900/50 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                        {m.role || 'LINK'}
                    </span>
                 ))}
             </div>
         )}
      </div>

      <div className="text-sm font-bold text-white mb-1 line-clamp-2">{data.label}</div>
      <div className="text-[10px] text-slate-400 font-mono truncate">{data.slug}</div>
      
      <Handle type="source" position={Position.Bottom} className={`w-8 ${isOrphan ? '!bg-red-500' : '!bg-emerald-500'}`} />
    </div>
  );
}
