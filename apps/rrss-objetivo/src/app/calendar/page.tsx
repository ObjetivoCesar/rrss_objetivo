"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
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

const PLATFORM_COLORS: Record<string, string> = {
  facebook: "#2563eb",
  instagram: "#db2777",
  tiktok: "#0891b2",
  linkedin: "#0284c7",
  youtube: "#dc2626",
  text_only: "#52525b",
};

interface Post {
  id: string;
  content_text: string;
  platforms: string[];
  status: string;
  scheduled_for: string;
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
      .select("id, content_text, scheduled_for, platforms, status, metrics_snapshot")
      .is('archived_at', null)
      .order("scheduled_for", { ascending: true });

    if (data) {
      setAllPosts(data);

      const calendarEvents = data.flatMap((post) => {
        const plats = post.platforms || ["text_only"];
        return plats.map((platform: string) => ({
          id: `${post.id}-${platform}`,
          title: `[${platform.substring(0, 2).toUpperCase()}] ${post.content_text.substring(0, 28)}…`,
          date: post.scheduled_for,
          backgroundColor: PLATFORM_COLORS[platform] || "#52525b",
          borderColor: "transparent",
          extendedProps: { postId: post.id, status: post.status },
          classNames: [post.status === "failed" ? "opacity-50 ring-2 ring-red-500" : ""],
        }));
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
    // Filter posts for this date
    const postsForDay = allPosts.filter((p) => {
      const postDate = new Date(p.scheduled_for).toISOString().split("T")[0];
      return postDate === clickedDate;
    });

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
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            locale={esLocale}
            events={events}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            eventDrop={handleEventDrop}
            editable={true}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,dayGridWeek",
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
        />
      )}

      <style jsx global>{`
        .calendar-wrapper {
          --fc-border-color: #262626;
          --fc-daygrid-event-dot-width: 8px;
          --fc-button-text-color: #e5e5e5;
          --fc-button-bg-color: #171717;
          --fc-button-border-color: #262626;
          --fc-button-hover-bg-color: #262626;
          --fc-button-hover-border-color: #404040;
          --fc-button-active-bg-color: #7c3aed;
          --fc-button-active-border-color: #6d28d9;
          --fc-today-bg-color: rgba(124, 58, 237, 0.08);
        }
        .fc-theme-standard th {
          border-color: var(--fc-border-color);
          padding: 12px 0;
          font-weight: 600;
          color: #a3a3a3;
          text-transform: uppercase;
          font-size: 0.7rem;
          letter-spacing: 0.08em;
        }
        .fc-theme-standard td {
          border-color: var(--fc-border-color);
        }
        .fc-daygrid-day-number {
          color: #e5e5e5;
          padding: 8px !important;
          font-size: 0.8rem;
        }
        .fc-daygrid-day:hover .fc-daygrid-day-frame {
          background: rgba(124, 58, 237, 0.05);
          cursor: pointer;
        }
        .fc-event {
          border-radius: 6px;
          padding: 2px 5px;
          font-size: 0.68rem;
          font-weight: 500;
          border: none;
          margin-bottom: 2px;
          cursor: pointer;
          transition: all 0.15s;
        }
        .fc-event:hover {
          transform: scale(1.03);
          filter: brightness(1.15);
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
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .fc-daygrid-event-harness-abs {
          right: 0 !important;
        }
        .holiday-event {
          opacity: 0.75;
          font-style: italic;
        }
        .fc-more-link {
          color: #a78bfa !important;
          font-size: 0.7rem;
        }
      `}</style>
    </DashboardLayout>
  );
}
