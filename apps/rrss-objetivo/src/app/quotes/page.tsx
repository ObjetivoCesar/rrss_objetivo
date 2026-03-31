"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { Briefcase, Plus, Trash2, Send, FileText, Layout, List, CheckCircle, ChevronRight, Info, Eye, EyeOff, Sparkles, Clock, DollarSign, Calendar, Globe } from "lucide-react";
import { clsx } from "clsx";

interface Etapa {
  numero: string;
  etiqueta_tiempo: string;
  nombre: string;
  eslogan: string;
  precio: string;
  precio_subtitulo: string;
  descripcion: string;
  entregables: string[];
  nota_especial: string;
  detalles_pie: string[];
}

interface QuoteData {
  id: string;
  portada: {
    etiqueta: string;
    titulo_principal: string;
    titulo_destacado: string;
    subtitulo: string;
    preparado_para: string;
    preparado_por: string;
    fecha: string;
    url_fondo: string;
    url_logo_cliente: string;
  };
  introduccion: {
    titulo: string;
    parrafos: string[];
  };
  etapas: Etapa[];
  cierre: {
    titulo: string;
    texto: string;
    frase_final: string;
  };
}

const INITIAL_DATA: QuoteData = {
  id: "",
  portada: {
    etiqueta: "Propuesta de Transformación Digital",
    titulo_principal: "Su empresa merece una presencia digital",
    titulo_destacado: "a la altura de su nombre.",
    subtitulo: "Impulsando el crecimiento mediante ingeniería de eficiencia y diseño estratégico.",
    preparado_para: "",
    preparado_por: "Ing. César Augusto Reyes Jaramillo",
    fecha: new Date().toLocaleDateString("es-EC", { month: "long", year: "numeric" }),
    url_fondo: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2000",
    url_logo_cliente: "",
  },
  introduccion: {
    titulo: "Transformando la visión en\nresultados medibles.",
    parrafos: [""],
  },
  etapas: [
    {
      numero: "1",
      etiqueta_tiempo: "Etapa 1 · 2–3 semanas",
      nombre: "Diagnóstico y Estrategia",
      eslogan: "\"La base de todo éxito es un plan sólido\"",
      precio: "$1.200",
      precio_subtitulo: "pago inicial / reserva",
      descripcion: "Análisis exhaustivo de la situación actual y definición de la hoja de ruta estratégica.",
      entregables: ["Auditoría técnica", "Mapa de arquitectura", "Roadmap de implementación"],
      nota_especial: "",
      detalles_pie: ["⏱ <strong>Duración:</strong> 3 semanas", "📄 <strong>Facturación:</strong> RUC 1103421531001"],
    },
  ],
  cierre: {
    titulo: "El siguiente paso",
    texto: "Estamos listos para comenzar esta transformación. ¿Programamos una breve llamada para definir la fecha de inicio?",
    frase_final: "Construyamos el futuro <span>hoy mismo.</span>",
  },
};

export default function QuotesPage() {
  const [data, setData] = useState<QuoteData>(INITIAL_DATA);
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageFilename, setImageFilename] = useState("");
  const [lastUrl, setLastUrl] = useState<string | null>(null);

  const handleUpdate = (section: keyof QuoteData, field: string, value: any) => {
    setData((prev) => ({
      ...prev,
      [section]: typeof prev[section] === "object" && !Array.isArray(prev[section])
        ? { ...(prev[section] as object), [field]: value }
        : value,
    }));
  };

  const handleUpdateNested = (section: keyof QuoteData, field: string, value: any) => {
    setData((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] as object),
        [field]: value,
      },
    }));
  };

  const addArrayItem = (path: string[], newItem: string = "") => {
    setData((prev: any) => {
      const newData = { ...prev };
      let current = newData;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      const lastKey = path[path.length - 1];
      current[lastKey] = [...current[lastKey], newItem];
      return newData;
    });
  };

  const removeArrayItem = (path: string[], index: number) => {
    setData((prev: any) => {
      const newData = { ...prev };
      let current = newData;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      const lastKey = path[path.length - 1];
      current[lastKey] = current[lastKey].filter((_: any, i: number) => i !== index);
      return newData;
    });
  };

  const updateArrayItem = (path: string[], index: number, value: string) => {
    setData((prev: any) => {
      const newData = { ...prev };
      let current = newData;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      const lastKey = path[path.length - 1];
      current[lastKey][index] = value;
      return newData;
    });
  };

  const addEtapa = () => {
    const nextNum = (data.etapas.length + 1).toString();
    const newEtapa: Etapa = {
      numero: nextNum,
      etiqueta_tiempo: `Etapa ${nextNum} · TBD`,
      nombre: "Nueva Etapa",
      eslogan: "\"Frase de impacto\"",
      precio: "$0",
      precio_subtitulo: "pago único",
      descripcion: "",
      entregables: [""],
      nota_especial: "",
      detalles_pie: ["⏱ <strong>Duración:</strong> TBD"],
    };
    setData((prev) => ({ ...prev, etapas: [...prev.etapas, newEtapa] }));
  };

  const updateEtapa = (index: number, field: keyof Etapa, value: any) => {
    const newEtapas = [...data.etapas];
    newEtapas[index] = { ...newEtapas[index], [field]: value };
    setData((prev) => ({ ...prev, etapas: newEtapas }));
  };

  const removeEtapa = (index: number) => {
    setData((prev) => ({ ...prev, etapas: prev.etapas.filter((_, i) => i !== index) }));
  };

  const publishQuote = async () => {
    if (!data.id) {
       toast.error("El ID de la cotización es obligatorio.");
       return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading("Publicando cotización...");

    try {
      // ✅ Proxy local → evita bloqueo CORS desde localhost
      const response = await fetch("/api/cotizaciones/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const resData = await response.json();

      if (response.ok && resData.success) {
        toast.success("¡Cotización publicada con éxito! 🚀", { id: loadingToast });
        setLastUrl(`https://cesarreyesjaramillo.com${resData.url}`);
      } else {
        throw new Error(resData.message || "Error al publicar");
      }
    } catch (error: any) {
      toast.error(`Error: ${error.message}`, { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  const uploadImageFromUrl = async () => {
    const externalUrl = data.portada.url_logo_cliente;
    if (!externalUrl || !externalUrl.startsWith("http")) {
      toast.error("Pega primero una URL de imagen válida en el campo.");
      return;
    }

    setIsUploadingImage(true);
    const loadingToast = toast.loading("Subiendo imagen al servidor...");

    try {
      const slug = imageFilename || data.id || "logo-cliente";
      const response = await fetch("/api/cotizaciones/upload-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: externalUrl, filename: slug }),
      });

      const resData = await response.json();

      if (response.ok && resData.success) {
        // Actualizar el campo con la URL permanente
        handleUpdateNested("portada", "url_logo_cliente", resData.url);
        toast.success("✅ Imagen subida permanentemente al servidor", { id: loadingToast });
      } else {
        throw new Error(resData.message || "Error al subir la imagen");
      }
    } catch (error: any) {
      toast.error(`Error: ${error.message}`, { id: loadingToast });
    } finally {
      setIsUploadingImage(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8 pb-20">
        {/* Header con Toggle de Preview */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/40 dark:bg-black/40 border border-white/20 dark:border-white/5 backdrop-blur-xl rounded-3xl p-6 shadow-xl shadow-black/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-xl shadow-blue-500/30">
                <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div>
                <h1 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
                  Generador de Cotizaciones
                </h1>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 font-bold uppercase tracking-widest mt-0.5">
                  cesarreyesjaramillo.com • Engine v2.0
                </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 bg-neutral-900/5 dark:bg-white/5 p-1.5 rounded-2xl border border-neutral-200 dark:border-white/10">
             <button 
              onClick={() => setShowPreview(false)}
              className={clsx(
                "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
                !showPreview 
                  ? "bg-white dark:bg-neutral-800 text-blue-600 dark:text-white shadow-lg" 
                  : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              )}
             >
               <Layout className="w-4 h-4" />
               Editor
             </button>
             <button 
               onClick={() => setShowPreview(true)}
               className={clsx(
                "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
                showPreview 
                  ? "bg-white dark:bg-neutral-800 text-blue-600 dark:text-white shadow-lg" 
                  : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              )}
             >
               <Eye className="w-4 h-4" />
               Vista Previa
             </button>
          </div>
          
          <div className="flex items-center gap-3">
             <button 
               onClick={publishQuote}
               disabled={isSubmitting}
               className={clsx(
                 "flex items-center gap-3 px-8 py-3 rounded-2xl text-sm font-black transition-all shadow-2xl",
                 isSubmitting 
                  ? "bg-neutral-800 text-neutral-500 cursor-not-allowed" 
                  : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98]"
               )}
             >
               <Send className="w-5 h-5" />
               {isSubmitting ? "Enviando..." : "Publicar"}
             </button>
          </div>
        </div>

        {lastUrl && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 shadow-2xl shadow-emerald-500/10 rounded-3xl p-6 flex items-center justify-between animate-in fade-in slide-in-from-top-6 duration-700">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <CheckCircle className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">¡Cotización Publicada!</p>
                <p className="text-sm text-emerald-700/60 dark:text-emerald-400/60 font-medium tracking-tight">Tu propuesta ya se encuentra activa en el servidor.</p>
              </div>
            </div>
            <a 
              href={lastUrl} 
              target="_blank" 
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-black rounded-2xl transition-all shadow-xl shadow-emerald-500/30 flex items-center gap-3 active:scale-95"
            >
              Abrir Cotización <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        )}

        {/* View Switcher: Editor or Preview */}
        {!showPreview ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500">
            {/* Main Form Area */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* ID Section */}
              <section className="bg-white/60 dark:bg-neutral-900/60 border border-neutral-200 dark:border-white/5 rounded-[2.5rem] p-8 shadow-sm backdrop-blur-md">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-1.5 bg-blue-500/20 rounded-lg">
                    <Info className="w-4 h-4 text-blue-500" />
                  </div>
                  <h2 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400">Configuración Base</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-neutral-500 uppercase mb-2.5 ml-2 tracking-widest">Slug Identificador (URL)</label>
                    <input 
                      type="text" 
                      placeholder="ej: propuesta-clinica-san-jose"
                      value={data.id}
                      onChange={(e) => handleUpdate("id", "", e.target.value)}
                      className="w-full bg-neutral-100 dark:bg-black/50 border border-transparent focus:border-blue-500/30 rounded-3xl px-6 py-4 text-sm font-medium transition-all outline-none"
                    />
                    <div className="bg-blue-500/5 dark:bg-white/5 rounded-2xl p-4 mt-4 border border-blue-500/10">
                      <p className="text-[11px] text-neutral-600 dark:text-neutral-400 flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5 text-blue-400" />
                        URL Final: <span className="font-bold text-blue-500 dark:text-blue-400">cesarreyesjaramillo.com/cotizaciones/{data.id || "su-slug"}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Portada Section */}
              <section className="bg-white/60 dark:bg-neutral-900/60 border border-neutral-200 dark:border-white/5 rounded-[2.5rem] p-8 shadow-sm backdrop-blur-md">
                <div className="flex items-center gap-3 mb-8">
                   <div className="p-1.5 bg-indigo-500/20 rounded-lg">
                    <Layout className="w-4 h-4 text-indigo-500" />
                  </div>
                  <h2 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400">Información de Portada</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-neutral-500 uppercase mb-2.5 ml-2">Etiqueta de Propuesta (Header)</label>
                    <input 
                      type="text" 
                      value={data.portada.etiqueta}
                      onChange={(e) => handleUpdateNested("portada", "etiqueta", e.target.value)}
                      className="w-full bg-neutral-100 dark:bg-black/50 border border-transparent focus:border-blue-500/30 rounded-3xl px-6 py-4 text-sm font-medium transition-all outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-neutral-500 uppercase mb-2.5 ml-2 tracking-[0.1em]">Título Principal (Base)</label>
                    <input 
                      type="text" 
                      value={data.portada.titulo_principal}
                      onChange={(e) => handleUpdateNested("portada", "titulo_principal", e.target.value)}
                      className="w-full bg-neutral-100 dark:bg-black/50 border border-transparent focus:border-blue-500/30 rounded-3xl px-6 py-4 text-sm font-medium transition-all outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-neutral-500 uppercase mb-2.5 ml-2 tracking-[0.1em]">Título Destacado (Acento)</label>
                    <input 
                      type="text" 
                      value={data.portada.titulo_destacado}
                      onChange={(e) => handleUpdateNested("portada", "titulo_destacado", e.target.value)}
                      className="w-full bg-neutral-100 dark:bg-black/50 border border-transparent focus:border-blue-500/30 rounded-3xl px-6 py-4 text-sm font-black transition-all outline-none text-blue-600 dark:text-blue-400"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-neutral-500 uppercase mb-2.5 ml-2 tracking-[0.1em]">Subtítulo Descriptivo</label>
                    <textarea 
                      rows={3}
                      value={data.portada.subtitulo}
                      onChange={(e) => handleUpdateNested("portada", "subtitulo", e.target.value)}
                      className="w-full bg-neutral-100 dark:bg-black/50 border border-transparent focus:border-blue-500/30 rounded-3xl px-6 py-4 text-sm font-medium transition-all outline-none resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-neutral-500 uppercase mb-2.5 ml-2 tracking-[0.1em]">Preparado para (Cliente)</label>
                    <input 
                      type="text" 
                      placeholder="ej: Hospital Reina Sofía"
                      value={data.portada.preparado_para}
                      onChange={(e) => handleUpdateNested("portada", "preparado_para", e.target.value)}
                      className="w-full bg-white dark:bg-black/80 border border-neutral-200 dark:border-white/10 focus:border-blue-500/30 rounded-3xl px-6 py-4 text-sm font-bold transition-all outline-none shadow-inner"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-neutral-500 uppercase mb-2.5 ml-2 tracking-[0.1em]">Fecha de Propuesta</label>
                    <input 
                      type="text" 
                      value={data.portada.fecha}
                      onChange={(e) => handleUpdateNested("portada", "fecha", e.target.value)}
                      className="w-full bg-neutral-100 dark:bg-black/50 border border-transparent focus:border-blue-500/30 rounded-3xl px-6 py-4 text-xs font-medium transition-all outline-none"
                    />
                  </div>
                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-neutral-200 dark:border-white/5">
                    <div className="space-y-4">
                      <label className="block text-[10px] font-black text-[#3b82f6] uppercase mb-2 ml-2 tracking-widest">URL Fondo Hero</label>
                      <input 
                        type="text" 
                        value={data.portada.url_fondo}
                        onChange={(e) => handleUpdateNested("portada", "url_fondo", e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-neutral-100 dark:bg-black/50 border border-transparent focus:border-blue-500/30 rounded-3xl px-6 py-4 text-xs font-medium transition-all outline-none"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="block text-[10px] font-black text-[#3b82f6] uppercase mb-2 ml-2 tracking-widest">URL Logo/Imagen Cliente</label>
                      <input 
                        type="text" 
                        value={data.portada.url_logo_cliente}
                        onChange={(e) => handleUpdateNested("portada", "url_logo_cliente", e.target.value)}
                        placeholder="https://... (Facebook, Drive, etc.)"
                        className="w-full bg-neutral-100 dark:bg-black/50 border border-transparent focus:border-blue-500/30 rounded-3xl px-6 py-4 text-xs font-medium transition-all outline-none"
                      />
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={imageFilename}
                          onChange={(e) => setImageFilename(e.target.value)}
                          placeholder="Nombre archivo (ej: logo-apple)"
                          className="flex-1 bg-white/50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-2xl px-4 py-2 text-[10px] font-medium outline-none focus:border-blue-500/30"
                        />
                        <button
                          onClick={uploadImageFromUrl}
                          disabled={isUploadingImage || !data.portada.url_logo_cliente}
                          className={clsx(
                            "px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                            isUploadingImage || !data.portada.url_logo_cliente
                              ? "bg-neutral-100 dark:bg-white/5 text-neutral-400 cursor-not-allowed"
                              : "bg-blue-500 text-white shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98]"
                          )}
                        >
                          {isUploadingImage ? "..." : "⬇️ Subir"}
                        </button>
                      </div>
                      <p className="text-[9px] text-zinc-400 ml-2 italic">Esto guarda la imagen permanentemente para el preview de WhatsApp.</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Introducción Section */}
              <section className="bg-white/60 dark:bg-neutral-900/60 border border-neutral-200 dark:border-white/5 rounded-[2.5rem] p-8 shadow-sm backdrop-blur-md">
                 <div className="flex items-center gap-3 mb-8">
                   <div className="p-1.5 bg-amber-500/20 rounded-lg">
                    <FileText className="w-4 h-4 text-amber-500" />
                  </div>
                  <h2 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400">Cuerpo de la Introducción</h2>
                </div>
                <div className="space-y-8">
                  <div>
                    <label className="block text-[10px] font-black text-neutral-500 uppercase mb-2.5 ml-2">Título Interior (Soporta \n)</label>
                    <textarea 
                      rows={2}
                      value={data.introduccion.titulo}
                      onChange={(e) => handleUpdateNested("introduccion", "titulo", e.target.value)}
                      className="w-full bg-neutral-100 dark:bg-black/50 border border-transparent focus:border-blue-500/30 rounded-3xl px-6 py-4 text-base font-bold transition-all outline-none resize-none leading-tight"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-4 px-2">
                       <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest">Párrafos de Introducción</label>
                       <button 
                        onClick={() => addArrayItem(["introduccion", "parrafos"])}
                        className="text-[10px] font-black flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-400 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" /> AÑADIR BLOQUE
                      </button>
                    </div>
                    <div className="space-y-4">
                      {data.introduccion.parrafos.map((p, idx) => (
                        <div key={idx} className="group relative">
                          <textarea 
                            rows={4}
                            value={p}
                            onChange={(e) => updateArrayItem(["introduccion", "parrafos"], idx, e.target.value)}
                            className="w-full bg-neutral-100 dark:bg-black/50 border border-transparent focus:border-blue-500/30 rounded-3xl px-6 py-5 text-sm font-medium transition-all outline-none resize-y leading-relaxed"
                            placeholder="Describe el contexto o problema que esta propuesta soluciona..."
                          />
                          <button 
                            onClick={() => removeArrayItem(["introduccion", "parrafos"], idx)}
                            className="absolute -right-3 -top-3 w-8 h-8 bg-red-500 text-white rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-xl"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Etapas Section */}
              <section className="space-y-8">
                 <div className="flex items-center justify-between px-6 py-4 bg-indigo-600 rounded-[2rem] shadow-xl shadow-indigo-600/20">
                  <div className="flex items-center gap-3">
                    <List className="w-5 h-5 text-white" />
                    <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white">Configuración de Etapas</h2>
                  </div>
                  <button 
                    onClick={addEtapa}
                    className="flex items-center gap-3 bg-white text-indigo-600 px-6 py-3 rounded-2xl text-xs font-black transition-all hover:scale-105 active:scale-95 shadow-lg"
                  >
                    <Plus className="w-4 h-4" /> AGREGAR ETAPA
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-8">
                  {data.etapas.map((etapa, idx) => (
                    <div key={idx} className="bg-white/60 dark:bg-neutral-900/60 border border-neutral-200 dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-sm backdrop-blur-md group animate-in slide-in-from-bottom-8 duration-500 delay-75">
                      <div className="bg-neutral-100 dark:bg-white/5 px-8 py-5 flex items-center justify-between border-b border-neutral-200 dark:border-white/5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-base font-black shadow-lg shadow-indigo-600/20">
                            {idx + 1}
                          </div>
                          <input 
                            type="text" 
                            value={etapa.nombre}
                            onChange={(e) => updateEtapa(idx, "nombre", e.target.value)}
                            className="bg-transparent border-none text-lg font-black text-neutral-900 dark:text-white outline-none w-80 tracking-tight"
                          />
                        </div>
                        <button 
                          onClick={() => removeEtapa(idx)}
                          className="text-neutral-400 hover:text-red-500 transition-all p-3 hover:bg-red-500/10 rounded-2xl"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      
                      <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <label className="block text-[10px] font-black text-neutral-500 uppercase mb-2.5 ml-2 tracking-widest">Número Ref (ej: 0)</label>
                          <input 
                            type="text" 
                            value={etapa.numero}
                            onChange={(e) => updateEtapa(idx, "numero", e.target.value)}
                            className="w-full bg-neutral-100 dark:bg-black/50 border border-transparent focus:border-indigo-500/30 rounded-3xl px-6 py-4 text-xs font-bold transition-all outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-neutral-500 uppercase mb-2.5 ml-2 tracking-widest">Tiempo estimado</label>
                          <input 
                            type="text" 
                            value={etapa.etiqueta_tiempo}
                            onChange={(e) => updateEtapa(idx, "etiqueta_tiempo", e.target.value)}
                            className="w-full bg-neutral-100 dark:bg-black/50 border border-transparent focus:border-indigo-500/30 rounded-3xl px-6 py-4 text-xs font-bold transition-all outline-none"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-[10px] font-black text-neutral-500 uppercase mb-2.5 ml-2 tracking-widest">Slogan de la Etapa</label>
                          <input 
                            type="text" 
                            value={etapa.eslogan}
                            onChange={(e) => updateEtapa(idx, "eslogan", e.target.value)}
                            className="w-full bg-neutral-100 dark:bg-black/50 border border-transparent focus:border-indigo-500/30 rounded-3xl px-6 py-4 text-sm italic font-bold transition-all outline-none text-indigo-600 dark:text-indigo-400"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-neutral-500 uppercase mb-2.5 ml-2 tracking-widest">Costo Inversión</label>
                          <div className="relative">
                            <input 
                              type="text" 
                              value={etapa.precio}
                              onChange={(e) => updateEtapa(idx, "precio", e.target.value)}
                              className="w-full bg-neutral-100 dark:bg-black/50 border border-transparent focus:border-emerald-500/30 rounded-3xl px-6 py-4 text-lg font-black transition-all outline-none text-emerald-600 dark:text-emerald-400"
                            />
                            <DollarSign className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500/40" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-neutral-500 uppercase mb-2.5 ml-2 tracking-widest">Subtítulo Costo</label>
                          <input 
                            type="text" 
                            value={etapa.precio_subtitulo}
                            onChange={(e) => updateEtapa(idx, "precio_subtitulo", e.target.value)}
                            className="w-full bg-neutral-100 dark:bg-black/50 border border-transparent focus:border-indigo-500/30 rounded-3xl px-6 py-4 text-xs font-bold transition-all outline-none"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-[10px] font-black text-neutral-500 uppercase mb-2.5 ml-2 tracking-widest">Descripción Operativa</label>
                          <textarea 
                            rows={4}
                            value={etapa.descripcion}
                            onChange={(e) => updateEtapa(idx, "descripcion", e.target.value)}
                            className="w-full bg-neutral-100 dark:bg-black/50 border border-transparent focus:border-indigo-500/30 rounded-3xl px-6 py-4 text-sm font-medium transition-all outline-none resize-none leading-relaxed"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-[10px] font-black text-[#3b82f6] uppercase mb-2.5 ml-2 tracking-widest">Nota Especial (Opcional)</label>
                          <textarea 
                            rows={2}
                            value={etapa.nota_especial}
                            onChange={(e) => updateEtapa(idx, "nota_especial", e.target.value)}
                            className="w-full bg-[#3b82f6]/5 border border-transparent focus:border-[#3b82f6]/30 rounded-3xl px-6 py-4 text-sm font-medium transition-all outline-none resize-none leading-relaxed italic"
                            placeholder="Aclaraciones sobre implementaciones rápidas, bonos, etc."
                          />
                        </div>
                        
                        {/* Sub-arrays for Etapa */}
                        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-neutral-200 dark:border-white/5">
                           <div className="space-y-4">
                              <div className="flex items-center justify-between mb-4">
                                <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Entregables Clave</label>
                                <button 
                                  onClick={() => {
                                    const newE = [...etapa.entregables, ""];
                                    updateEtapa(idx, "entregables", newE);
                                  }}
                                  className="text-[10px] font-black text-indigo-500 hover:text-indigo-400 flex items-center gap-1.5 transition-colors"
                                >
                                  <Plus className="w-3 h-3" /> AÑADIR
                                </button>
                              </div>
                              <div className="space-y-3">
                                {etapa.entregables.map((ent, eIdx) => (
                                  <div key={eIdx} className="group/item relative flex items-center gap-4 animate-in fade-in slide-in-from-right-4">
                                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full shrink-0" />
                                    <input 
                                      type="text" 
                                      value={ent}
                                      onChange={(e) => {
                                        const newE = [...etapa.entregables];
                                        newE[eIdx] = e.target.value;
                                        updateEtapa(idx, "entregables", newE);
                                      }}
                                      className="flex-1 bg-neutral-100 dark:bg-black/40 border-none rounded-2xl px-5 py-3 text-sm font-medium outline-none focus:ring-1 focus:ring-indigo-500/30"
                                      placeholder="ej: Auditoría de UX"
                                    />
                                    <button onClick={() => {
                                      const newE = etapa.entregables.filter((_, i) => i !== eIdx);
                                      updateEtapa(idx, "entregables", newE);
                                    }} className="text-neutral-500 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-all p-2">
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                           </div>
                           <div className="space-y-4">
                              <div className="flex items-center justify-between mb-4">
                                <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Detalles Legales/Protéicos</label>
                                <button 
                                  onClick={() => {
                                    const newD = [...etapa.detalles_pie, ""];
                                    updateEtapa(idx, "detalles_pie", newD);
                                  }}
                                  className="text-[10px] font-black text-indigo-500 hover:text-indigo-400 flex items-center gap-1.5 transition-colors"
                                >
                                  <Plus className="w-3 h-3" /> AÑADIR
                                </button>
                              </div>
                              <div className="space-y-3">
                                {etapa.detalles_pie.map((det, dIdx) => (
                                  <div key={dIdx} className="group/item relative flex items-center gap-4 animate-in fade-in slide-in-from-left-4">
                                    <div className="w-1.5 h-1.5 bg-neutral-500 rounded-full shrink-0" />
                                    <input 
                                      type="text" 
                                      value={det}
                                      onChange={(e) => {
                                        const newD = [...etapa.detalles_pie];
                                        newD[dIdx] = e.target.value;
                                        updateEtapa(idx, "detalles_pie", newD);
                                      }}
                                      className="flex-1 bg-neutral-100 dark:bg-black/40 border-none rounded-2xl px-5 py-3 text-xs font-bold outline-none focus:ring-1 focus:ring-neutral-500/30 font-mono"
                                      placeholder="ej: RUC 1103421531001"
                                    />
                                    <button onClick={() => {
                                      const newD = etapa.detalles_pie.filter((_, i) => i !== dIdx);
                                      updateEtapa(idx, "detalles_pie", newD);
                                    }} className="text-neutral-500 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-all p-2">
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                           </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Sidebar Sticky Area: Cierre & Status */}
            <div className="lg:col-span-4 space-y-8">
               <section className="bg-white/60 dark:bg-neutral-900/60 border border-neutral-200 dark:border-white/5 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-md sticky top-28">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-1.5 bg-emerald-500/20 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    </div>
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400">Finalizar Propuesta</h2>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-black text-neutral-500 uppercase mb-2.5 ml-2 tracking-widest">Título de Despedida</label>
                      <input 
                        type="text" 
                        value={data.cierre.titulo}
                        onChange={(e) => handleUpdateNested("cierre", "titulo", e.target.value)}
                        className="w-full bg-neutral-100 dark:bg-black/50 border border-transparent focus:border-emerald-500/30 rounded-3xl px-6 py-4 text-sm font-bold transition-all outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-neutral-500 uppercase mb-2.5 ml-2 tracking-widest">Llamada a la Acción (CTA)</label>
                      <textarea 
                        rows={4}
                        value={data.cierre.texto}
                        onChange={(e) => handleUpdateNested("cierre", "texto", e.target.value)}
                        className="w-full bg-neutral-100 dark:bg-black/50 border border-transparent focus:border-emerald-500/30 rounded-3xl px-6 py-4 text-sm font-medium transition-all outline-none resize-none leading-relaxed"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-neutral-500 uppercase mb-2.5 ml-2 tracking-widest">Frase Final (Usa &lt;span&gt;)</label>
                      <input 
                        type="text" 
                        value={data.cierre.frase_final}
                        onChange={(e) => handleUpdateNested("cierre", "frase_final", e.target.value)}
                        className="w-full bg-neutral-100 dark:bg-black/50 border border-transparent focus:border-emerald-500/30 rounded-3xl px-6 py-4 text-sm font-black transition-all outline-none text-emerald-600 dark:text-emerald-400"
                      />
                    </div>

                    <div className="pt-8 mt-8 border-t border-neutral-200 dark:border-white/5 space-y-4">
                      <button 
                         onClick={publishQuote}
                         disabled={isSubmitting}
                         className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 text-white font-black py-5 rounded-[2rem] shadow-2xl shadow-blue-600/30 transition-all active:scale-95 flex items-center justify-center gap-4 group"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                            Publicando...
                          </>
                        ) : (
                          <>
                            <Send className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            Publicar Ahora
                          </>
                        )}
                      </button>
                      <div className="bg-amber-500/5 rounded-2xl p-4 border border-amber-500/10">
                        <p className="text-[9px] text-amber-600 dark:text-amber-400 font-black uppercase text-center leading-normal">
                          Acción Irreversible: Publicación Directa en Producción
                        </p>
                      </div>
                    </div>
                  </div>
               </section>
            </div>
          </div>
        ) : (
          /* PREVIEW MODE: BRAND-ACCURATE RENDER */
          <div className="bg-white border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-700 min-h-[90vh] font-montserrat selection:bg-blue-500/30">
             
             {/* 1. HERO SECTION (Cover with Background Image) */}
             <section 
               className="relative min-h-[70vh] flex flex-col justify-center px-8 md:px-20 py-24 md:py-32 overflow-hidden"
               style={{ 
                 backgroundImage: `url(${data.portada.url_fondo || "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2000"})`,
                 backgroundSize: 'cover',
                 backgroundPosition: 'center'
               }}
             >
                {/* Dark Overlay for Legibility */}
                <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" />
                
                <div className="relative z-10 space-y-12 max-w-5xl">
                   <div className="flex items-center gap-6">
                      {data.portada.url_logo_cliente && (
                        <div className="w-16 h-16 bg-white rounded-2xl p-3 shadow-2xl flex items-center justify-center">
                           <img src={data.portada.url_logo_cliente} alt="Logo Cliente" className="max-w-full max-h-full object-contain" />
                        </div>
                      )}
                      <div className="inline-flex items-center gap-3 px-6 py-2 bg-blue-500/10 rounded-full border border-blue-500/20 backdrop-blur-md">
                         <Sparkles className="w-4 h-4 text-[#3b82f6]" />
                         <span className="text-[11px] font-bold text-[#3b82f6] uppercase tracking-[0.2em]">{data.portada.etiqueta}</span>
                      </div>
                   </div>
                   
                   <div className="space-y-8">
                      <h1 className="text-5xl md:text-[5.5rem] font-poiret tracking-tight leading-[1] text-white">
                        {data.portada.titulo_principal} <br />
                        <span className="text-[#3b82f6] italic">{data.portada.titulo_destacado}</span>
                      </h1>
                      <div className="w-24 h-1 bg-gradient-to-r from-[#3b82f6] to-transparent rounded-full" />
                      <p className="text-xl md:text-3xl text-zinc-300 leading-relaxed max-w-3xl font-light">
                        {data.portada.subtitulo}
                      </p>
                   </div>
                </div>

                <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-12 pt-16 mt-16 border-t border-white/10 uppercase font-bold tracking-widest text-[10px]">
                   <div className="space-y-2">
                      <span className="text-zinc-500">Preparado para</span>
                      <p className="text-lg font-bold normal-case tracking-normal text-white">{data.portada.preparado_para || "[Nombre Cliente]"}</p>
                   </div>
                   <div className="space-y-2">
                      <span className="text-zinc-500">Preparado por</span>
                      <p className="text-lg font-bold normal-case tracking-normal text-white">{data.portada.preparado_por}</p>
                   </div>
                   <div className="space-y-2 lg:text-right">
                      <span className="text-zinc-500">Fecha y Origen</span>
                      <p className="text-lg font-bold normal-case tracking-normal text-white">{data.portada.fecha}</p>
                   </div>
                </div>
             </section>

             {/* 2. INTRODUCCION (Section Light) */}
             <section className="bg-white text-zinc-900 px-8 md:px-20 py-24 md:py-32 border-b border-zinc-100">
                <div className="max-w-4xl space-y-16">
                   <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight whitespace-pre-line text-zinc-900">
                      {data.introduccion.titulo}
                   </h2>
                   <div className="space-y-10 max-w-3xl">
                      {data.introduccion.parrafos.map((p, i) => (
                        <p key={i} className="text-xl text-zinc-500 leading-relaxed font-light ">
                          {p}
                        </p>
                      ))}
                   </div>
                </div>
             </section>

             {/* 3. ETAPAS (Section Lightest) */}
             <section className="bg-zinc-50/50 text-zinc-900 px-8 md:px-20 py-24 md:py-32 space-y-20">
                <div className="space-y-4 max-w-4xl">
                   <span className="text-[11px] font-black text-blue-600 uppercase tracking-[0.3em]">Hoja de Ruta Estratégica</span>
                   <h3 className="text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-900">Fases de Implementación y Presupuesto</h3>
                </div>

                <div className="max-w-5xl space-y-8">
                   {data.etapas.map((etapa, i) => {
                     const colors = [
                       { bg: "rgba(59,130,246,0.1)", text: "#3b82f6", border: "rgba(59,130,246,0.2)" }, // Azul
                       { bg: "rgba(139,92,246,0.1)", text: "#8b5cf6", border: "rgba(139,92,246,0.2)" }, // Violeta
                       { bg: "rgba(16,185,129,0.1)", text: "#10b981", border: "rgba(16,185,129,0.2)" }, // Verde
                       { bg: "rgba(245,158,11,0.1)", text: "#f59e0b", border: "rgba(245,158,11,0.2)" }  // Ambar
                     ];
                     const color = colors[i % colors.length];

                     return (
                       <div key={i} className="bg-white border border-zinc-200 rounded-[2.5rem] overflow-hidden shadow-xl shadow-zinc-200/50 hover:shadow-2xl hover:border-zinc-300 transition-all group">
                          <div className="p-10 md:p-14 flex flex-col md:flex-row md:items-start gap-12">
                             
                             {/* Indicator Column */}
                             <div className="flex flex-col items-center gap-6 shrink-0">
                                <div 
                                  className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-2xl font-extrabold shadow-inner"
                                  style={{ backgroundColor: color.bg, color: color.text, border: `1px solid ${color.border}` }}
                                >
                                   {etapa.numero}
                                </div>
                                <div className="w-px h-full bg-gradient-to-b from-zinc-200 to-transparent" />
                             </div>

                             <div className="flex-1 space-y-10">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-10 border-b border-zinc-100">
                                   <div className="space-y-3">
                                      <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full" style={{ backgroundColor: color.bg, color: color.text }}>
                                        {etapa.etiqueta_tiempo}
                                      </span>
                                      <h4 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900">{etapa.nombre}</h4>
                                      <p className="text-base italic text-zinc-400 font-light">{etapa.eslogan}</p>
                                   </div>
                                   <div className="lg:text-right bg-zinc-50 p-6 md:p-8 rounded-[2rem] border border-zinc-100 min-w-[220px]">
                                      <p className="text-4xl md:text-5xl font-extrabold text-zinc-900 tracking-tighter">{etapa.precio}</p>
                                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1.5">{etapa.precio_subtitulo}</p>
                                   </div>
                                </div>

                                <p className="text-lg text-zinc-500 leading-relaxed max-w-3xl font-light">
                                   {etapa.descripcion}
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                                   <div className="space-y-6">
                                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                         <span className="w-4 h-px bg-zinc-300" /> Entregables Clave
                                      </p>
                                      <ul className="space-y-4">
                                         {etapa.entregables.map((ent, ei) => (
                                            <li key={ei} className="flex items-center gap-4 text-[15px] font-medium text-zinc-700">
                                               <CheckCircle className="w-4 h-4 text-emerald-500" />
                                               {ent}
                                            </li>
                                         ))}
                                      </ul>
                                   </div>
                                   <div className="space-y-6">
                                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                         <span className="w-4 h-px bg-zinc-300" /> Detalles Operativos
                                      </p>
                                      <div className="space-y-3">
                                         {etapa.detalles_pie.map((det, di) => (
                                            <p key={di} className="text-xs font-mono text-zinc-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: det }} />
                                         ))}
                                      </div>
                                   </div>
                                </div>

                                {etapa.nota_especial && (
                                   <div className="bg-blue-50/50 border-l-2 border-blue-500 p-6 rounded-r-[2rem] animate-in fade-in duration-1000">
                                      <div className="flex items-center gap-2 mb-2 text-blue-600">
                                         <Info className="w-4 h-4" />
                                         <span className="text-[10px] font-black uppercase tracking-widest">Nota Estratégica</span>
                                      </div>
                                      <p className="text-sm text-zinc-600 italic leading-relaxed">{etapa.nota_especial}</p>
                                   </div>
                                )}
                             </div>
                          </div>
                       </div>
                     );
                   })}
                </div>
             </section>

             {/* 4. CIERRE (Section Dark for Transition) */}
             <section className="bg-[#0a0a0a] text-white px-8 md:px-20 py-24 md:py-40 flex flex-col items-center overflow-hidden relative">
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                   <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-blue-500/20 blur-[120px] rounded-full" />
                </div>
                
                <div className="max-w-4xl w-full text-center space-y-16 relative z-10">
                   <h4 className="text-[11px] font-black text-blue-500 uppercase tracking-[0.4em]">{data.cierre.titulo}</h4>
                   <p className="text-2xl md:text-3xl text-zinc-400 leading-tight font-light">
                      {data.cierre.texto}
                   </p>
                   
                   <div 
                      className="text-4xl md:text-[5rem] font-extrabold tracking-tighter leading-none py-16 border-y border-white/5"
                      dangerouslySetInnerHTML={{ __html: data.cierre.frase_final.replace('<span>', '<span class="text-blue-500 italic">') }}
                   />
                   
                   <div className="pt-12 space-y-4">
                      <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                        ESTRATEGA RESPONSABLE
                      </p>
                      <div className="flex flex-col items-center">
                         <span className="text-2xl font-bold text-white uppercase tracking-widest">Ing. César Reyes Jaramillo</span>
                         <span className="w-12 h-px bg-blue-500 mt-2" />
                      </div>
                   </div>
                </div>
             </section>

             {/* Resumen Final Table (Panorama Completo) */}
             <section className="bg-white text-zinc-900 px-8 md:px-20 py-24 md:py-32">
                <div className="max-w-5xl mx-auto space-y-12">
                   <div className="flex items-center justify-between gap-4 border-b border-zinc-100 pb-6">
                      <h3 className="text-3xl font-extrabold tracking-tight text-zinc-900 italic">Panorama Completo</h3>
                      <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">Resumen de Inversión</p>
                   </div>
                   
                   <div className="overflow-x-auto">
                      <table className="w-full text-left font-montserrat text-sm">
                         <thead>
                            <tr className="text-[10px] uppercase tracking-widest text-zinc-400 border-b border-zinc-100">
                               <th className="pb-6 pr-8">Etapa</th>
                               <th className="pb-6 pr-8">Nombre del Servicio</th>
                               <th className="pb-6 pr-8">Duración Estimada</th>
                               <th className="pb-6 text-right">Inversión</th>
                            </tr>
                         </thead>
                         <tbody className="text-zinc-600">
                            {data.etapas.map((etapa, idx) => (
                               <tr key={idx} className="border-b border-zinc-50 group hover:bg-zinc-50/50 transition-colors">
                                  <td className="py-6 pr-8 font-black text-zinc-400 text-lg">{etapa.numero}</td>
                                  <td className="py-6 pr-8 font-bold text-zinc-900">{etapa.nombre}</td>
                                  <td className="py-6 pr-8 italic text-zinc-400">{etapa.etiqueta_tiempo}</td>
                                  <td className="py-6 text-right font-bold text-zinc-900">{etapa.precio}</td>
                               </tr>
                            ))}
                         </tbody>
                         <tfoot>
                            <tr className="text-lg">
                               <td colSpan={3} className="pt-12 text-zinc-400 uppercase tracking-widest text-[11px] font-black">Totales Acumulados</td>
                               <td className="pt-12 text-right font-bold text-zinc-900 text-3xl">
                                  {data.etapas.reduce((acc, current) => {
                                      const val = current.precio.replace(/[^\d]/g, '');
                                      return acc + (parseInt(val) || 0);
                                  }, 0).toLocaleString('es-EC', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })}
                               </td>
                            </tr>
                         </tfoot>
                      </table>
                   </div>
                   
                   <div className="bg-zinc-50 rounded-[2rem] p-8 border border-zinc-100 flex flex-col md:flex-row items-center justify-between gap-6">
                      <p className="text-xs text-zinc-500 font-medium italic">
                         * Los precios no incluyen IVA. Todos los servicios están sujetos a disponibilidad técnica.
                      </p>
                      <button className="bg-zinc-900 text-white px-10 py-4 rounded-full text-xs font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-zinc-900/10">
                         Export PDF (Próximamente)
                      </button>
                   </div>
                </div>
             </section>

             {/* Footer Barra (Dark Mode Accent) */}
             <footer className="bg-[#0a0a0a] border-t border-white/5 px-8 md:px-20 py-12 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="space-y-1">
                   <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] mb-1">PROPIEDAD DE</p>
                   <p className="text-sm font-bold text-white tracking-[0.4em] uppercase">César Reyes Jaramillo</p>
                </div>
                <p className="text-xs text-zinc-500 font-medium tracking-widest uppercase">
                   © 2026 — <span className="text-white">cesarreyesjaramillo.com</span>
                </p>
                <div className="flex items-center gap-6">
                   <div className="flex flex-col items-end">
                      <span className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.2em]">SISTEMA</span>
                      <span className="text-xs text-blue-500 font-bold uppercase tracking-widest">DINÁMICO V2.0</span>
                   </div>
                   <div className="w-12 h-px bg-white/10" />
                </div>
             </footer>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
