"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { BarChart2 } from "lucide-react";

export default function MetricsPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="w-16 h-16 bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-lg shadow-black/5 dark:shadow-black/20 rounded-2xl flex items-center justify-center">
          <BarChart2 className="w-8 h-8 text-blue-600 dark:text-blue-500 drop-shadow-sm" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white drop-shadow-sm">Métricas de Rendimiento</h1>
          <p className="text-neutral-600 dark:text-neutral-400 font-medium text-sm mt-2 max-w-sm">
            Estadísticas por video/post. Preparado para futuras integraciones API (Meta, YouTube, LinkedIn). (En construcción)
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
