"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  Settings, Database, Webhook, MessageSquare, 
  BrainCircuit, ShieldCheck, Activity, Key, BookOpen
} from "lucide-react";

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white drop-shadow-sm flex items-center gap-2">
            <Settings className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
            Configuración y ADN del Sistema
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 font-medium">
            Panel de control principal. Estado de integraciones y arquitectura central.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Panel de Conexiones */}
          <div className="bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-lg shadow-black/5 dark:shadow-black/20 rounded-3xl p-6">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
              Estado de Integraciones
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/50 dark:bg-neutral-950/50 backdrop-blur-md rounded-2xl border border-white/40 dark:border-neutral-800/50 hover:bg-white/70 dark:hover:bg-neutral-950 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <Database className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900 dark:text-white text-sm">Base de Datos (Supabase)</h3>
                    <p className="text-xs text-neutral-600 dark:text-neutral-500 font-medium">PostgreSQL conectado y sincronizado</p>
                  </div>
                </div>
                <div className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-lg border border-emerald-500/20">
                  Operativo
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/50 dark:bg-neutral-950/50 backdrop-blur-md rounded-2xl border border-white/40 dark:border-neutral-800/50 hover:bg-white/70 dark:hover:bg-neutral-950 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                    <Webhook className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900 dark:text-white text-sm">Automatización (Make.com)</h3>
                    <p className="text-xs text-neutral-600 dark:text-neutral-500 font-medium">Webhook principal de publicación</p>
                  </div>
                </div>
                <div className="px-3 py-1 bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 text-xs font-bold rounded-lg border border-emerald-500/20">
                  Conectado
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/50 dark:bg-neutral-950/50 backdrop-blur-md rounded-2xl border border-white/40 dark:border-neutral-800/50 hover:bg-white/70 dark:hover:bg-neutral-950 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/20">
                    <MessageSquare className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900 dark:text-white text-sm">Notificaciones (Evolution API)</h3>
                    <p className="text-xs text-neutral-600 dark:text-neutral-500 font-medium">Alertas de WhatsApp configuradas</p>
                  </div>
                </div>
                <div className="px-3 py-1 bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 text-xs font-bold rounded-lg border border-emerald-500/20">
                  Activo
                </div>
              </div>
            </div>
          </div>

          {/* Panel de IA */}
          <div className="bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-lg shadow-black/5 dark:shadow-black/20 rounded-3xl p-6">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              Motor de Inteligencia Artificial
            </h2>
            
            <div className="space-y-4">
              <div className="p-5 bg-blue-500/5 backdrop-blur-md border border-blue-500/10 rounded-2xl">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-blue-600 dark:text-blue-400">Gemini 2.0 Flash</h3>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 font-medium">Modelo actual predeterminado para generación de contenido y copy estratégico.</p>
                  </div>
                  <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                </div>
                <div className="flex gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-blue-500/20 text-blue-300 rounded-lg">Rápido</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded-lg">Contexto Largo</span>
                </div>
              </div>

              <div className="p-4 bg-white/50 dark:bg-neutral-950/50 backdrop-blur-md border border-white/40 dark:border-neutral-800/50 rounded-2xl">
                <h3 className="font-bold text-neutral-900 dark:text-white text-sm mb-2 flex items-center gap-2">
                  <Key className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                  Rotación de API Keys
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-500 font-medium">
                  El sistema cuenta con prevención de límites de tasa mediante el uso de claves estructuradas en las variables de entorno locales.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ADN del Sistema */}
        <div className="bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-lg shadow-black/5 dark:shadow-black/20 rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
              <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-indigo-800 dark:text-indigo-300">ADN del Sistema (Reglas Base)</h2>
              <p className="text-xs text-indigo-600 max-dark:font-medium dark:text-indigo-400/70 mt-0.5">La arquitectura inmutable de esta aplicación.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white/50 dark:bg-neutral-900/60 backdrop-blur-md border border-white/40 dark:border-neutral-800 rounded-2xl hover:border-indigo-400 dark:hover:border-indigo-500/50 transition-colors">
              <h3 className="font-bold text-amber-600 dark:text-amber-500 text-sm mb-2 tracking-wide">1. frontend-backend-system</h3>
              <p className="text-xs text-neutral-700 dark:text-neutral-400 leading-relaxed font-medium">
                Define el modelo de datos (Supabase), las restricciones de seguridad (Cron Auth, No Mass-Assignment), el tratamiento de fallos, retiros y recuperación de posts estancados.
              </p>
            </div>
            <div className="p-4 bg-white/50 dark:bg-neutral-900/60 backdrop-blur-md border border-white/40 dark:border-neutral-800 rounded-2xl hover:border-indigo-400 dark:hover:border-indigo-500/50 transition-colors">
              <h3 className="font-bold text-purple-600 dark:text-purple-400 text-sm mb-2 tracking-wide">2. make-automation</h3>
              <p className="text-xs text-neutral-700 dark:text-neutral-400 leading-relaxed font-medium">
                Controla la salida final del calendario hacia Make.com. Si hay un error 500 o de red, el sistema espera, reintenta (Backoff) y de no lograrlo notifica por WhatsApp mediante Evolution API.
              </p>
            </div>
            <div className="p-4 bg-white/50 dark:bg-neutral-900/60 backdrop-blur-md border border-white/40 dark:border-neutral-800 rounded-2xl hover:border-indigo-400 dark:hover:border-indigo-500/50 transition-colors">
              <h3 className="font-bold text-emerald-600 dark:text-emerald-400 text-sm mb-2 tracking-wide">3. content-ecosystem</h3>
              <p className="text-xs text-neutral-700 dark:text-neutral-400 leading-relaxed font-medium">
                Garantiza que ningún post viva aislado. Todo post nace de una <strong className="text-neutral-900 dark:text-white">Campaña</strong>, y toda campaña responde a un <strong className="text-neutral-900 dark:text-white">Objetivo Estratégico</strong>, creando un sistema relacional de métricas puras.
              </p>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
