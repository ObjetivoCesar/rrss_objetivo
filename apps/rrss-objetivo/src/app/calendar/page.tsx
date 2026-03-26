"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import esLocale from "@fullcalendar/core/locales/es";
import CalendarDayModal from "@/components/calendar/CalendarDayModal";
import toast from "react-hot-toast";

// Feriados Ecuador 2026
const ECUADOR_HOLIDAYS = [
  { title: "Año Nuevo", date: "2026-01-01", color: "#ef4444" },
  { title: "Carnaval", date: "2026-02-16", color: "#f97316" },
  { title: "Carnaval", date: "2026-02-17", color: "#f97316" },
  { title: "Viernes Santo", date: "2026-04-03", color: "#8b5cf6" },
  { title: "Día del Trabajo", date: "2026-05-01", color: "#ef4444" },
  { title: "Batalla de Pichincha", date: "2026-05-24", color: "#ef4444" },
  { title: "Primer Grito de Independencia", date: "2026-08-10", color: "#ef4444" },
  { title: "Independencia de Guayaquil", date: "2026-10-09", color: "#ef4444" },
  { title: "Día de los Difuntos", date: "2026-11-02", color: "#a855f7" },
  { title: "Independencia de Cuenca", date: "2026-11-03", color: "#ef4444" },
  { title: "Navidad", date: "2026-12-25", color: "#10b981" },
  // Fechas comerciales clave
  { title: "🌸 Día de la Madre", date: "2026-05-10", color: "#ec4899" },
  { title: "👔 Día del Padre", date: "2026-06-21", color: "#3b82f6" },
  { title: "🛍 Black Friday", date: "2026-11-27", color: "#111827" },
];

// Colores por STATUS — hace el calendario operativo de un vistazo
const STATUS_COLORS: Record<string, string> = {
  draft_ai:   "#9333ea", // Violeta — Borrador IA
  pending:    "#f59e0b", // Naranja — Programado
  processing: "#3b82f6", // Azul — Publicando
  published:  "#10b981", // Verde — Publicado ✓
  failed:     "#ef4444", // Rojo — Error
};

interface Post {
  id: string;
  content_text: string;
  platforms: string[];
  status: string;
  scheduled_for: string;
  media_urls?: string[];
  metrics_snapshot?: { category?: string };
}

export default function CalendarPage() {
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  
  // Modal state
  const [modalDate, setModalDate] = useState<string | null>(null);
  const [modalPosts, setModalPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    const { data } = await supabase
      .from("social_posts")
      .select("id, content_text, scheduled_for, platforms, status, media_urls, metrics_snapshot")
      .is('archived_at', null)
      .order("scheduled_for", { ascending: true });

    if (data) {
      setAllPosts(data);

      const calendarEvents = data.map((post) => {
        const plats = (post.platforms || []).map((p: string) => p.substring(0, 2).toUpperCase()).join(" · ");
        const hora = new Date(post.scheduled_for).toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit", hour12: false });
        return {
          id: post.id,
          title: `${hora} · ${plats} · ${post.content_text.substring(0, 22)}…`,
          date: post.scheduled_for,
          backgroundColor: STATUS_COLORS[post.status] || "#6b7280",
          borderColor: "transparent",
          extendedProps: { postId: post.id, status: post.status },
          classNames: [post.status === "failed" ? "fc-event-failed" : ""],
        };
      });

      const allEvents = [
        ...calendarEvents,
        ...ECUADOR_HOLIDAYS.map((h) => ({
          ...h,
          id: `holiday-${h.date}`,
          classNames: ["holiday-event"],
          display: "block",
        })),
      ];

      setEvents(allEvents);
    }
  }

  const handleDateClick = (arg: { dateStr: string }) => {
    const clickedDate = arg.dateStr;
    const postsForDay = allPosts.filter((p) => {
      const postDate = new Date(p.scheduled_for).toISOString().split("T")[0];
      return postDate === clickedDate;
    });
    postsForDay.sort((a, b) => new Date(a.scheduled_for).getTime() - new Date(b.scheduled_for).getTime());
    setModalDate(clickedDate);
    setModalPosts(postsForDay);
  };

  const handleEventClick = (arg: { event: any }) => {
    const { postId } = arg.event.extendedProps;
    if (!postId) return;

    // Find the date of this post
    const post = allPosts.find((p) => p.id === postId);
    if (post) {
      const dateStr = new Date(post.scheduled_for).toISOString().split("T")[0];
      const postsForDay = allPosts.filter((p) => {
        const d = new Date(p.scheduled_for).toISOString().split("T")[0];
        return d === dateStr;
      });
      setModalDate(dateStr);
      setModalPosts(postsForDay);
    }
  };

  const handleEventDrop = async (info: any) => {
    const { postId } = info.event.extendedProps;
    const newDate = info.event.startStr;

    const { error } = await supabase
      .from("social_posts")
      .update({ scheduled_for: newDate })
      .eq("id", postId);

    if (error) {
      toast.error("Error al reprogramar");
      info.revert();
    } else {
      toast.success("Post reprogramado ✓");
      fetchPosts();
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white drop-shadow-sm">Calendario de Contenidos</h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 font-medium">
            Haz clic en cualquier día para ver o crear posts. ¡También puedes arrastrarlos!
          </p>
        </div>

        <div className="bg-white/40 dark:bg-black/40 border border-white/20 dark:border-white/10 shadow-xl shadow-black/5 dark:shadow-black/20 rounded-3xl p-6 backdrop-blur-xl calendar-wrapper">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin, listPlugin]}
            initialView="dayGridMonth"
            locale={esLocale}
            events={events}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            eventDrop={handleEventDrop}
            editable={true}
            buttonText={{
              month: 'Mes',
              listWeek: 'Agenda (Semanas)'
            }}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,listWeek",
            }}
            height="auto"
            dayMaxEvents={3}
          />
        </div>
      </div>

      {/* Day Modal */}
      {modalDate && (
        <CalendarDayModal
          date={modalDate}
          posts={modalPosts}
          onClose={() => setModalDate(null)}
          onPostUpdated={fetchPosts}
        />
      )}

      {/* Leyenda de Estados */}
      <div className="mt-8 flex flex-wrap gap-4 px-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: STATUS_COLORS.draft_ai }}></div>
          <span className="text-xs font-medium text-neutral-500">Borrador IA (Revisar)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: STATUS_COLORS.pending }}></div>
          <span className="text-xs font-medium text-neutral-500">Programado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: STATUS_COLORS.published }}></div>
          <span className="text-xs font-medium text-neutral-500">Publicado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: STATUS_COLORS.failed }}></div>
          <span className="text-xs font-medium text-neutral-500">Error / Falló</span>
        </div>
      </div>

      <style jsx global>{`
        .calendar-wrapper {
          --fc-border-color: rgba(163, 163, 163, 0.2);
          --fc-daygrid-event-dot-width: 8px;
          --fc-button-text-color: #4b5563;
          --fc-button-bg-color: #f3f4f6;
          --fc-button-border-color: #e5e7eb;
          --fc-button-hover-bg-color: #e5e7eb;
          --fc-button-hover-border-color: #d1d5db;
          --fc-button-active-bg-color: #7c3aed;
          --fc-button-active-border-color: #6d28d9;
          --fc-today-bg-color: rgba(124, 58, 237, 0.08);
        }
        
        /* Dark Mode support */
        @media (prefers-color-scheme: dark) {
          .calendar-wrapper {
            --fc-border-color: #262626;
            --fc-button-text-color: #e5e5e5;
            --fc-button-bg-color: #171717;
            --fc-button-border-color: #262626;
            --fc-button-hover-bg-color: #262626;
            --fc-button-hover-border-color: #404040;
          }
        }
        
        .fc-theme-standard th {
          border-color: var(--fc-border-color);
          padding: 12px 0;
          font-weight: 700;
          color: #6b7280; /* Neutral-500 */
          text-transform: uppercase;
          font-size: 0.8rem;
          letter-spacing: 0.05em;
        }
        
        @media (prefers-color-scheme: dark) {
          .fc-theme-standard th {
            color: #a3a3a3;
          }
        }
        
        .fc-theme-standard td {
          border-color: var(--fc-border-color);
        }
        
        .fc-daygrid-day-number {
          color: #111827; /* Dark text for light mode */
          padding: 8px 12px !important;
          font-size: 1.1rem;
          font-weight: 700;
          text-decoration: none !important;
        }
        
        @media (prefers-color-scheme: dark) {
          .fc-daygrid-day-number {
            color: #f3f4f6; /* Light text for dark mode */
          }
        }
        
        .fc-daygrid-day:hover .fc-daygrid-day-frame {
          background: rgba(124, 58, 237, 0.05);
          cursor: pointer;
        }
        
        .fc-event {
          border-radius: 6px;
          padding: 3px 6px;
          font-size: 0.75rem;
          font-weight: 500;
          border: none;
          margin-bottom: 3px;
          cursor: pointer;
          transition: all 0.15s;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
        
        .fc-event:hover {
          transform: scale(1.02);
          filter: brightness(1.1);
        }
        
        .fc-event-main-frame {
          display: flex;
          flex-direction: column;
          align-items: flex-start !important;
        }
        
        .fc-event-title-container {
          width: 100%;
          overflow: hidden !important;
        }
        
        .fc-event-title {
          white-space: normal !important;
          word-break: break-word;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          line-height: 1.2;
        }
        
        .fc-daygrid-event-harness-abs {
          right: 0 !important;
        }
        
        .holiday-event {
          opacity: 0.8;
          font-style: italic;
          border-left: 3px solid;
        }
        
        .fc-more-link {
          color: #7c3aed !important;
          font-size: 0.8rem;
          font-weight: bold;
        }
        
        @media (prefers-color-scheme: dark) {
          .fc-more-link {
            color: #a78bfa !important;
          }
        }
      `}</style>
    </DashboardLayout>
  );
}
