'use client';
import dynamic from 'next/dynamic';

import DashboardLayout from "@/components/layout/DashboardLayout";

// Import dynamically to avoid SSR issues with React Flow
const StrategyPlanner = dynamic(
  () => import('@/components/strategy/StrategyPlanner'),
  { ssr: false, loading: () => (
    <div className="flex items-center justify-center h-96">
      <div className="text-center p-8 bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl">
        <div className="w-10 h-10 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-neutral-400 text-sm font-semibold tracking-wide">Sincronizando Planner...</p>
      </div>
    </div>
  )}
);

export default function StrategyPlannerPage() {
  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-160px)] w-full relative">
        <StrategyPlanner />
      </div>
    </DashboardLayout>
  );
}
