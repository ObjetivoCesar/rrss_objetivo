import { Metadata } from 'next';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StrategyMap from '@/components/strategy/StrategyMap';

export const metadata: Metadata = {
  title: 'Cerebro Estratégico | RRSS Objetivo',
  description: 'Mapa mental interactivo de toda la estrategia de contenido',
};

export default function StrategyPage() {
  return (
    <DashboardLayout>
      <div className="w-full h-[calc(100vh-2rem)] flex flex-col">
        <div className="flex justify-between items-center mb-4 px-6 md:px-0">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-emerald-400 bg-clip-text text-transparent">Cerebro Estratégico</h1>
            <p className="text-slate-400 text-sm mt-1">Mapa interactivo: Objetivos → Campañas → Artículos → Posts</p>
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-slate-800 rounded-full text-xs text-slate-400 border border-slate-700">Modo: Ecosistema Completo</span>
          </div>
        </div>
        
        <div className="flex-1 w-full bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden relative">
          <StrategyMap />
        </div>
      </div>
    </DashboardLayout>
  );
}
