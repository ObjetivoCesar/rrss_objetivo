"use client";

import DashboardLayout from '@/components/layout/DashboardLayout';
import { BrainCircuit, Sparkles } from 'lucide-react';
import { useEffect } from 'react';

export default function DonnaChatPage() {
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('open-donna'));
  }, []);

  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-pink-600 to-purple-800 flex items-center justify-center shadow-2xl shadow-pink-500/20 mb-8 border border-pink-500/30 animate-pulse">
          <BrainCircuit className="w-10 h-10 text-white" />
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
          Donna es ahora Persistente <Sparkles className="w-6 h-6 text-pink-400" />
        </h1>
        
        <p className="text-neutral-400 max-w-md leading-relaxed mb-8">
          Ya no necesitas venir a esta pestaña para hablar con Donna. Ahora vive permanentemente en el panel de la izquierda para que puedas consultarla mientras navegas por todo el sistema.
        </p>
        
        <div className="flex gap-4">
          <div className="px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-500 text-sm">
            ← Mira a la izquierda
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
