"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  Megaphone, Webhook, Facebook, Instagram, Linkedin, 
  Youtube, PlayCircle, Image as ImageIcon, Layers, 
  Activity, CheckCircle2, AlertCircle, RefreshCw
} from "lucide-react";
import { useState } from "react";

export default function MarketingPage() {
  const [testing, setTesting] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<{status: number, message: string} | null>(null);

  const testIntegration = async (platform: string, type: 'image' | 'carousel' | 'video' | 'text') => {
    setTesting(`${platform}-${type}`);
    setLastResult(null);
    
    try {
      const response = await fetch('/api/marketing/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, type })
      });
      
      const data = await response.json();
      setLastResult({ status: response.status, message: data.message || data.error });
    } catch (error: any) {
      setLastResult({ status: 500, message: error.message });
    } finally {
      setTesting(null);
    }
  };

  const platforms = [
    { 
      id: 'facebook', 
      name: 'Facebook', 
      icon: Facebook, 
      color: 'text-blue-600', 
      bg: 'bg-blue-500/10',
      tests: [
        { label: 'Imagen', type: 'image', icon: ImageIcon },
        { label: 'Carrusel', type: 'carousel', icon: Layers },
        { label: 'Video', type: 'video', icon: PlayCircle },
      ]
    },
    { 
      id: 'instagram', 
      name: 'Instagram', 
      icon: Instagram, 
      color: 'text-pink-600', 
      bg: 'bg-pink-500/10',
      tests: [
        { label: 'Imagen', type: 'image', icon: ImageIcon },
        { label: 'Carrusel', type: 'carousel', icon: Layers },
        { label: 'Reel', type: 'video', icon: PlayCircle },
      ]
    },
    { 
      id: 'linkedin', 
      name: 'LinkedIn', 
      icon: Linkedin, 
      color: 'text-blue-700', 
      bg: 'bg-blue-700/10',
      tests: [
        { label: 'Post Texto', type: 'text', icon: Megaphone },
        { label: 'Imagen', type: 'image', icon: ImageIcon },
        { label: 'Video', type: 'video', icon: PlayCircle },
      ]
    },
    { 
      id: 'youtube', 
      name: 'YouTube', 
      icon: Youtube, 
      color: 'text-red-600', 
      bg: 'bg-red-500/10',
      tests: [
        { label: 'Video', type: 'video', icon: PlayCircle },
      ]
    }
  ];

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
              <Megaphone className="w-8 h-8 text-blue-600 animate-pulse" />
              Centro de Control de Marketing
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 mt-2 font-medium">
              Gestión centralizada de integraciones y automatización de redes sociales.
            </p>
          </div>
          
          <div className="flex items-center gap-3 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-xl p-3 rounded-2xl border border-white/20 dark:border-white/10 shadow-sm">
            <Webhook className="w-5 h-5 text-purple-500" />
            <div className="text-sm font-bold">
              Make.com: <span className="text-emerald-500">Activo</span>
            </div>
          </div>
        </div>

        {/* Diagnostic Results Banner */}
        {lastResult && (
          <div className={`p-4 rounded-2xl border flex items-center gap-4 animate-in slide-in-from-top duration-300 ${lastResult.status === 200 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' : 'bg-red-500/10 border-red-500/20 text-red-600'}`}>
            {lastResult.status === 200 ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <div className="flex-1 text-sm font-bold">
              Resultado de la prueba: {lastResult.status} - {lastResult.message}
            </div>
            <button onClick={() => setLastResult(null)} className="text-xs uppercase tracking-wider font-black hover:opacity-70 transition-opacity">Cerrar</button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {platforms.map((p) => (
            <div key={p.id} className="bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-lg rounded-3xl p-6 hover:translate-y--1 transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-12 h-12 ${p.bg} rounded-2xl flex items-center justify-center border border-white/20`}>
                  <p.icon className={`w-6 h-6 ${p.color}`} />
                </div>
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">{p.name}</h2>
              </div>

              <div className="space-y-3">
                {p.tests.map((t) => (
                  <button
                    key={`${p.id}-${t.type}`}
                    onClick={() => testIntegration(p.id, t.type as any)}
                    disabled={!!testing}
                    className="w-full flex items-center justify-between p-3 bg-white/50 dark:bg-neutral-900/50 hover:bg-white dark:hover:bg-neutral-800 rounded-xl border border-white/40 dark:border-neutral-800 transition-all group disabled:opacity-50"
                  >
                    <div className="flex items-center gap-3">
                      <t.icon className="w-4 h-4 text-neutral-400 group-hover:text-blue-500 transition-colors" />
                      <span className="text-sm font-bold text-neutral-700 dark:text-neutral-300">{t.label}</span>
                    </div>
                    {testing === `${p.id}-${t.type}` ? (
                      <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
                    ) : (
                      <Activity className="w-4 h-4 text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Meta Review Section */}
        <div className="bg-gradient-to-br from-indigo-600/10 to-blue-600/10 border border-blue-500/20 rounded-3xl p-8 backdrop-blur-md">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2 underline decoration-blue-500 underline-offset-4">Meta App Review Helper</h2>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-6 max-w-2xl leading-relaxed">
                Utiliza este panel para generar la actividad de prueba requerida por los revisores de Meta. 
                Cada prueba realizada arriba genera un log real en Make.com que puedes grabar como evidencia para tu solicitud de API.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white/40 dark:bg-black/40 p-5 rounded-2xl border border-white/20">
                  <h3 className="font-bold text-xs uppercase tracking-widest text-blue-500 mb-3 block">Instrucciones</h3>
                  <ul className="text-sm space-y-2 text-neutral-700 dark:text-neutral-300 font-medium list-disc list-inside">
                    <li>Selecciona el tipo de contenido a grabar.</li>
                    <li>Presiona el botón de prueba.</li>
                    <li>Verifica que el post se envió correctamente a Make.</li>
                    <li>Sube el link/ID al Dashboard de Meta.</li>
                  </ul>
                </div>
                <div className="bg-white/40 dark:bg-black/40 p-5 rounded-2xl border border-white/20">
                  <h3 className="font-bold text-xs uppercase tracking-widest text-emerald-500 mb-3 block">Estado Actual</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-bold">Webhook configurado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                    <span className="text-xs font-bold">Modo Desarrollo activo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
