"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, // Keep for Dashboard
  Calendar, // Keep for Calendar, will be aliased
  ListChecks, // Keep for Publicaciones
  PenSquare, // Keep for Nuevo Post
  BookOpen, // Keep for Blog Admin
  BarChart2, // Keep for Métricas
  Settings, // Keep for Configuración
  DatabaseZap, // Keep for Logo
  BrainCircuit, // Keep for Expert Lens
  Target, // Keep for Campañas
  Sparkles, // Keep for Donna AI
  Sun, // Keep for ThemeToggle
  Moon, // Keep for ThemeToggle
  BarChart3, // New icon for Metrics
  MessageSquare, // New icon for Editor de Posts
  FileText, // New icon for Blog
  Network, // New icon for Estrategia
  Map // New icon for Map
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const NAV_ITEMS = [
  { href: "/",          label: "Dashboard",     icon: LayoutDashboard },
  { href: "/campaigns", label: "Campañas",      icon: Target },
  { href: "/calendar",  label: "Calendario",    icon: Calendar },
  { href: "/posts",     label: "Publicaciones", icon: ListChecks },
  { href: "/editor",    label: "Nuevo Post",    icon: PenSquare },
  { href: "/blog",      label: "Blog Admin",    icon: BookOpen },
  { href: "/pipeline",  label: "Expert Lens",   icon: BrainCircuit },
  { href: "/donna",     label: "Donna AI",      icon: Sparkles },
  { href: "/metrics",   label: "Métricas",      icon: BarChart2 },
  { href: "/strategy",  label: "Estrategia",    icon: Network },
  { href: "/settings",  label: "Configuración", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 h-screen sticky top-0 bg-white/40 dark:bg-black/40 border-r border-white/20 dark:border-white/10 backdrop-blur-2xl shadow-[4px_0_24px_rgba(0,0,0,0.02)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.2)] transition-colors">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/20 dark:border-white/10">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <DatabaseZap className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-neutral-900 dark:text-white leading-tight">RRSS Objetivo</p>
            <p className="text-[10px] text-neutral-500 dark:text-neutral-500">Cerebro de Contenidos</p>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => {
                  if (href === '/donna') {
                    window.dispatchEvent(new CustomEvent('open-donna'));
                  }
                }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? "bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-600/20 dark:text-blue-400 dark:border-blue-500/30 font-semibold shadow-sm dark:shadow-none"
                    : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60 border border-transparent"
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-blue-600 dark:text-blue-400" : "text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-600 dark:group-hover:text-neutral-300"}`} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Make.com Status & Theme Control */}
        <div className="px-4 py-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800/60 rounded-xl px-3 py-2 flex-1 mr-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_6px_rgba(34,197,94,0.4)] dark:shadow-[0_0_6px_rgba(34,197,94,0.6)]" />
            <span className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">Make.com activo</span>
          </div>
          <ThemeToggle />
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-neutral-900/95 border-t border-neutral-800 backdrop-blur-xl flex items-center justify-around px-2 py-2 safe-area-pb">
        {NAV_ITEMS.slice(0, 5).map(({ href, label, icon: Icon }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
                isActive ? "text-blue-400" : "text-neutral-500"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[9px] font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
