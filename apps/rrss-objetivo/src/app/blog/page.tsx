"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  Type, Search, BrainCircuit, PenTool, Sparkles, ChevronRight, 
  Settings2, Loader2, CheckCircle2, Globe, FileText, ArrowRight, BookOpen, AlertCircle,
  Mic, MicOff, AlignLeft, Image as ImageIcon, X, Link2, Bold, Heading3, Undo, FolderOpen, Youtube, Lightbulb,
  Network, Target
} from "lucide-react";
import toast from "react-hot-toast";
import MediaUploader from "@/components/MediaUploader";
import AiImageGenerator from "@/components/AiImageGenerator";
import MediaGallery from "@/components/MediaGallery";

type LabStep = 'research' | 'brief' | 'generate';

const SILO_HUBS = {
  "marketing-para-pymes": [
    { url: "/analisis-estrategico", label: "Auditoría de Marketing y Embudo (Hub Principal)" },
    { url: "/analisis-estrategico/estudio-factibilidad", label: "Estudio de Nichos y Propuesta de Valor" },
    { url: "/analisis-estrategico/estrategia-ganar-clientes", label: "Plan Táctico Capación y Cierre" },
    { url: "/diseno-web", label: "Desarrollo Web (Landing Pages/Funnels)" }
  ],
  "automatizacion-de-ventas": [
    { url: "/desarrollo-web/tu-negocio-24-7", label: "Automatización WhatsApp y IA" },
    { url: "/desarrollo-web/tu-empresa-online", label: "Plataformas y Embudos Operativos" },
    { url: "/desarrollo-web/tarjeta-digital", label: "Softwares de Contacto y Venta Inmediata" },
    { url: "https://www.activaqr.com/contacto-digital", label: "ActivaQR: Tarjeta Digital Venta Directa" },
    { url: "https://www.activaqr.com/contacto-business", label: "ActivaQR: Business Teams" },
    { url: "https://www.activaqr.com/contacto-business-plus-catalogo", label: "ActivaQR: Business + Catálogo" }
  ],
  "posicionamiento-en-google": [
    { url: "/posicionamiento", label: "Consultoría SEO Local y Nacional" },
    { url: "/posicionamiento/seo-local-quito-ecuador", label: "Posicionamiento Local" },
    { url: "/posicionamiento/auditoria-seo-rediseno", label: "Auditoría SEO Express" },
    { url: "/posicionamiento/consultoria-seo-y-posicionamiento", label: "Plan Integral SEO Escala" }
  ],
  "activaqr-gastronomia": [
    { url: "https://www.activaqr.com/contacto-business-plus-catalogo", label: "ActivaQR Gastronomía (Menú + Pedidos)" }
  ],
  "activaqr-networking": [
    { url: "https://www.activaqr.com/contacto-digital", label: "ActivaQR Networking (Tarjeta Digital)" },
    { url: "https://www.activaqr.com/contacto-business", label: "ActivaQR Business Teams" }
  ]
};

function SeoLabContent() {
  const [currentStep, setCurrentStep] = useState<LabStep>('research');
  const searchParams = useSearchParams();
  const nodeId = searchParams.get('node_id');
  
  // -- FORMS & DATA --
  const [keyword, setKeyword] = useState('');
  const [humanExperience, setHumanExperience] = useState('');
  const [notebookLmContext, setNotebookLmContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [researchData, setResearchData] = useState<any>(null); 
  const [articleData, setArticleData] = useState<any>(null);
  const [coverImage, setCoverImage] = useState<string>('');
  const [showImageGen, setShowImageGen] = useState(false);
  const [showGalleryPicker, setShowGalleryPicker] = useState(false);
  
  // -- IDEAS SIDEBAR --
  const [showIdeas, setShowIdeas] = useState(false);
  const [plannedArticles, setPlannedArticles] = useState<any[]>([]);
  const [loadingIdeas, setLoadingIdeas] = useState(false);
  
  // -- NEW FEATURES: Mic & Word Count --
  const [wordCount, setWordCount] = useState('Media (~1000 palabras)');
  const [isRecording, setIsRecording] = useState(false);
  const [mounted, setMounted] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [importedIds, setImportedIds] = useState<string[]>([]);

  // -- LocalStorage Persistence --
  useEffect(() => {
    const savedStep = localStorage.getItem('seo_lab_currentStep');
    const savedKeyword = localStorage.getItem('seo_lab_keyword');
    const savedHumanExp = localStorage.getItem('seo_lab_humanExperience');
    const savedNotebookLm = localStorage.getItem('seo_lab_notebookLmContext');
    const savedResearch = localStorage.getItem('seo_lab_researchData');
    const savedArticle = localStorage.getItem('seo_lab_articleData');
    const savedCover = localStorage.getItem('seo_lab_coverImage');
    const savedWordCount = localStorage.getItem('seo_lab_wordCount');
    const savedImportedIds = localStorage.getItem('seo_lab_importedIds');

    if (savedStep) setCurrentStep(savedStep as LabStep);
    if (savedKeyword) setKeyword(savedKeyword);
    if (savedHumanExp) setHumanExperience(savedHumanExp);
    if (savedNotebookLm) setNotebookLmContext(savedNotebookLm);
    if (savedResearch) {
      try {
        setResearchData(JSON.parse(savedResearch));
      } catch (e) {
        console.error("Error parsing saved research data", e);
      }
    }
    if (savedArticle) {
      try {
        setArticleData(JSON.parse(savedArticle));
      } catch (e) {
        console.error("Error parsing saved article data", e);
      }
    }
    if (savedCover) setCoverImage(savedCover);
    if (savedWordCount) setWordCount(savedWordCount);
    if (savedImportedIds) {
      try {
        setImportedIds(JSON.parse(savedImportedIds));
      } catch (e) {
        console.error("Error parsing imported ids", e);
      }
    }
    
    setMounted(true);
  }, []);

  // -- NEW: Strategic Pre-fill from Strategy Planner --
  useEffect(() => {
    if (!mounted || !nodeId) return;

    const fetchNodeData = async () => {
      try {
        const res = await fetch('/api/strategy-sessions');
        if (!res.ok) return;
        const { data: sessions } = await res.json();
        
        for (const session of sessions) {
          const detailRes = await fetch(`/api/strategy-sessions/${session.id}`);
          if (!detailRes.ok) continue;
          const { nodes } = await detailRes.json();
          const targetNode = nodes.find((n: any) => n.id === nodeId);
          
          if (targetNode) {
            setKeyword(targetNode.data.label || '');
            if (targetNode.data.notes) {
              setHumanExperience(targetNode.data.notes);
            }
            toast.success("🧠 Plan Estratégico cargado: " + targetNode.data.label);
            break;
          }
        }
      } catch (err) {
        console.error("Error pre-filling from node", err);
      }
    };

    fetchNodeData();
  }, [mounted, nodeId]);

  // -- NEW: Fetch all planned articles for the sidebar --
  useEffect(() => {
    if (!mounted) return;
    const loadPlannedArticles = async () => {
      setLoadingIdeas(true);
      try {
        const res = await fetch('/api/strategy-sessions');
        if (!res.ok) return;
        const { data: sessions } = await res.json();
        
        const allArticles: any[] = [];
        for (const session of sessions) {
          const detailRes = await fetch(`/api/strategy-sessions/${session.id}`);
          if (!detailRes.ok) continue;
          const { nodes } = await detailRes.json();
          const articlesInSession = nodes
            .filter((n: any) => n.type === 'articleNode')
            .map((n: any) => ({ ...n, sessionName: session.name }));
          allArticles.push(...articlesInSession);
        }
        setPlannedArticles(allArticles);
      } catch (err) {
        console.error("Error loading planned articles", err);
      } finally {
        setLoadingIdeas(false);
      }
    };
    loadPlannedArticles();
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('seo_lab_currentStep', currentStep);
    localStorage.setItem('seo_lab_keyword', keyword);
    localStorage.setItem('seo_lab_humanExperience', humanExperience);
    localStorage.setItem('seo_lab_notebookLmContext', notebookLmContext);
    localStorage.setItem('seo_lab_researchData', researchData ? JSON.stringify(researchData) : '');
    localStorage.setItem('seo_lab_articleData', articleData ? JSON.stringify(articleData) : '');
    localStorage.setItem('seo_lab_coverImage', coverImage);
    localStorage.setItem('seo_lab_wordCount', wordCount);
    localStorage.setItem('seo_lab_importedIds', JSON.stringify(importedIds));
  }, [currentStep, keyword, humanExperience, notebookLmContext, researchData, articleData, coverImage, wordCount, importedIds, mounted]);
  
  // -- Markdown Toolbar Handlers --
  const insertMarkdown = (prefix: string, suffix: string, defaultText: string = '') => {
    if (!textareaRef.current || !articleData) return;
    const textarea = textareaRef.current;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = articleData.markdown;
    const selectedText = text.substring(start, end) || defaultText;

    let replacement = '';
    if (prefix === '[') {
      let url = '';
      let linkText = text.substring(start, end);
      const isUrl = linkText.trim().startsWith('http');
      
      if (isUrl) {
        url = linkText.trim();
        linkText = window.prompt("Ingresa el texto para este enlace:", "Enlace") || "Enlace";
      } else {
        url = window.prompt(`Ingresa la URL para "${linkText || defaultText}":`, "https://") || "";
        if (!linkText) linkText = defaultText;
      }

      if (!url || url === "https://") return; 
      replacement = `[${linkText}](${url})`;
    } else {
      replacement = `${prefix}${selectedText}${suffix}`;
    }

    textarea.focus();
    textarea.setSelectionRange(start, end);
    const success = document.execCommand('insertText', false, replacement);

    if (!success) {
      const newText = text.substring(0, start) + replacement + text.substring(end);
      setArticleData({ ...articleData, markdown: newText });
    }

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
      }
    }, 0);
  };

  const handleResearch = async () => {
    if (!keyword.trim()) {
      toast.error('Ingresa una palabra clave.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/seo-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setResearchData(data);
      setCurrentStep('brief');
      toast.success('Análisis de SERP completado.');
    } catch (e: any) {
      toast.error(e.message || "Error al investigar la Keyword");
    } finally {
      setLoading(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      return; 
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Tu navegador no soporta dictado por voz.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.interimResults = false; 
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsRecording(true);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      setHumanExperience((prev) => prev ? prev + " " + transcript : transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsRecording(false);
      if (event.error !== 'aborted') toast.error("Error al grabar el audio.");
    };

    recognition.onend = () => setIsRecording(false);
    recognition.start();
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/seo-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          keyword, 
          rawContext: notebookLmContext ? `${researchData.rawContext}\n\n[CONTEXTO EXTERNO NOTEBOOKLM]:\n${notebookLmContext}` : researchData.rawContext, 
          analysis: researchData.analysis,
          humanExperience,
          wordCount
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      let finalArticleData = data.articleData;
      
      if (keyword.toLowerCase().includes('experimento') || keyword.toLowerCase().includes('video')) {
         finalArticleData.title = "Mi Experimento con Videos: Publicando Sin Drama y Midiendo Resultados";
      }

      setArticleData(finalArticleData);
      setCurrentStep('generate');
      toast.success('¡Artículo generado con éxito!');
    } catch (e: any) {
      toast.error(e.message || "Error al generar el artículo");
    } finally {
      setLoading(false);
    }
  };

  const TopBar = () => (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 pb-4 border-b border-white/20 dark:border-white/10 gap-4">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white drop-shadow-sm flex items-center gap-2 tracking-tight">
          <Globe className="w-6 h-6 text-blue-500 dark:text-blue-400" />
          SEO Content Lab
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 font-medium">Búsqueda de patrones SERP, análisis de vacíos y E-E-A-T builder.</p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 lg:gap-6">
        <Link href="/blog/rewrite" className="px-5 py-2 whitespace-nowrap bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 text-sm font-semibold rounded-xl flex items-center gap-2 transition-all shadow-sm">
           ✍️ Reescribir Artículos
        </Link>

        <button 
          onClick={() => setShowIdeas(!showIdeas)}
          className={`px-5 py-2 whitespace-nowrap border text-sm font-semibold rounded-xl flex items-center gap-2 transition-all shadow-sm ${showIdeas ? 'bg-indigo-600 text-white border-indigo-500 shadow-indigo-500/20' : 'bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300'}`}
        >
          <BrainCircuit className="w-4 h-4" /> 💡 Ideas del Planner
        </button>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto hide-scrollbar">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${currentStep === 'research' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' : 'bg-white/40 dark:bg-black/40 text-neutral-500'}`}>
            <Search className="w-3.5 h-3.5" /> 1. Research
          </div>
          <ChevronRight className="w-4 h-4 text-neutral-300 shrink-0" />
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${currentStep === 'brief' ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300' : 'bg-white/40 dark:bg-black/40 text-neutral-500'}`}>
            <BrainCircuit className="w-3.5 h-3.5" /> 2. Brief & UX
          </div>
          <ChevronRight className="w-4 h-4 text-neutral-300 shrink-0" />
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${currentStep === 'generate' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' : 'bg-white/40 dark:bg-black/40 text-neutral-500'}`}>
            <Sparkles className="w-3.5 h-3.5" /> 3. Generación
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto relative px-4 sm:px-6 lg:px-8">
        <TopBar />

        {/* IDEAS SIDEBAR (Slide-in) */}
        {showIdeas && (
          <div className="fixed top-24 right-6 w-80 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-2xl border border-indigo-200 dark:border-indigo-500/30 rounded-3xl shadow-2xl z-[100] animate-in fade-in slide-in-from-right-8 duration-300 flex flex-col max-h-[calc(100vh-120px)]">
            <div className="p-5 border-b border-indigo-100 dark:border-indigo-500/20 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-transparent dark:from-indigo-950/20 rounded-t-3xl">
              <div>
                <h3 className="font-black text-xs text-indigo-600 dark:text-indigo-400 tracking-widest uppercase">Estrategia Donna</h3>
                <p className="text-[10px] text-neutral-500 font-bold">Artículos Planificados</p>
              </div>
              <button onClick={() => setShowIdeas(false)} className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"><X className="w-4 h-4 text-neutral-400" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-indigo-500/20">
              {loadingIdeas ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-neutral-400">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <p className="text-xs font-semibold">Cargando planes...</p>
                </div>
              ) : plannedArticles.filter(a => !importedIds.includes(a.id)).length === 0 ? (
                <div className="text-center py-12 px-4">
                  <Lightbulb className="w-8 h-8 text-neutral-300 mx-auto mb-3" />
                  <p className="text-xs text-neutral-500">Has usado o descartado todas las ideas estratégicas.</p>
                </div>
              ) : (
                plannedArticles.filter(a => !importedIds.includes(a.id)).map((article) => (
                  <button 
                    key={article.id}
                    onClick={() => {
                      setKeyword(article.data.label);
                      if (article.data.notes) setHumanExperience(article.data.notes);
                      setImportedIds(prev => [...prev, article.id]);
                      toast.success("Importado: " + article.data.label);
                      setShowIdeas(false);
                    }}
                    className="w-full text-left p-4 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-800 hover:border-indigo-400 dark:hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/1 transition-all group relative"
                  >
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setImportedIds(prev => [...prev, article.id]);
                      }}
                      className="absolute top-4 right-4 p-1 rounded-md hover:bg-red-500/10 text-neutral-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                      title="Quitar de la lista"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <div className="flex items-center gap-2 mb-2">
                       <FileText className="w-3.5 h-3.5 text-indigo-500" />
                       <span className="text-[8px] font-black text-neutral-400 uppercase">{article.sessionName}</span>
                    </div>
                    <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 leading-tight">
                      {article.data.label}
                    </h4>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* STEP 1: RESEARCH */}
        {currentStep === 'research' && (
          <div className="bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-3xl p-8 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="max-w-2xl mx-auto text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">Análisis Inteligente de Intención</h2>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm">Escaneamos el Top 10 de Google para encontrar los patrones ganadores.</p>
            </div>

            <div className="max-w-xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Introduce la Palabra Clave..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="block w-full pl-6 pr-4 py-4 bg-white/60 dark:bg-black/60 border border-neutral-200 dark:border-neutral-800 rounded-2xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  onKeyDown={(e) => e.key === 'Enter' && handleResearch()}
                />
              </div>
              <div className="mt-6 flex justify-center">
                <button
                  onClick={handleResearch}
                  disabled={loading || !keyword}
                  className="flex items-center gap-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Escanear SERP <Sparkles className="w-4 h-4 text-blue-400" /></>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: BRIEF & EEAT */}
        {currentStep === 'brief' && researchData && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
            {/* Analysis Results Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Intent Card */}
              <div className="bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-3xl p-6 shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Search className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-bold text-neutral-900 dark:text-white">Intención de Búsqueda</h3>
                </div>
                <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-2">
                  <span className="font-semibold">Objetivo principal:</span> {researchData.analysis.searchIntent.primaryIntent}
                </p>
                <div className="inline-flex px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-md text-[10px] font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                  Etapa: {researchData.analysis.searchIntent.journeyStage}
                </div>
              </div>

              {/* Gaps Card */}
              <div className="bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-3xl p-6 shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="font-bold text-neutral-900 dark:text-white">Vacíos (Content Gaps)</h3>
                </div>
                <ul className="text-sm text-neutral-700 dark:text-neutral-300 space-y-2">
                  {researchData.analysis.contentGaps.missingTopics.slice(0, 3).map((gap: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                      <span className="leading-tight">{gap}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Structure Card */}
              <div className="bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-3xl p-6 shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="font-bold text-neutral-900 dark:text-white">Ángulo Dominante</h3>
                </div>
                <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  {researchData.analysis.patterns.dominantAngle}
                </p>
                <p className="text-[11px] text-neutral-500 mt-3 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Formato: {researchData.analysis.patterns.structureFormat}
                </p>
              </div>

            </div>

            {/* NotebookLM Context Input */}
            <div className="bg-white/80 dark:bg-black/60 backdrop-blur-2xl border border-purple-200 dark:border-purple-900/30 rounded-3xl p-8 shadow-xl shadow-purple-500/5 mb-6">
              <div className="flex items-center gap-3 mb-6">
                 <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/20">
                    <Sparkles className="w-5 h-5 text-white" />
                 </div>
                 <div>
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Contexto Externo Profundo (NotebookLM)</h2>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Pega aquí el resumen o puntos estratégicos extraídos de tus PDFs o análisis de mercado.</p>
                 </div>
              </div>

              <div className="relative mb-2">
                <textarea
                  value={notebookLmContext}
                  onChange={(e) => setNotebookLmContext(e.target.value)}
                  placeholder="Ejemplo: Según el PDF de tendencias 2026, los usuarios buscan automatización sin código. Los 3 vacíos del mercado son..."
                  className="w-full h-32 p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-y shadow-inner"
                />
              </div>
            </div>

            {/* Humanization Input */}
            <div className="bg-white/80 dark:bg-black/60 backdrop-blur-2xl border border-blue-200 dark:border-blue-900/30 rounded-3xl p-8 shadow-xl shadow-blue-500/5">
              <div className="flex items-center gap-3 mb-6">
                 <div className="p-2 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl shadow-lg shadow-pink-500/20">
                    <Sparkles className="w-5 h-5 text-white" />
                 </div>
                 <div>
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Inyección E-E-A-T (Experiencia y Autoridad)</h2>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Para no ser un artículo IA genérico, aporta tu experiencia única o punto de vista sobre <strong className="text-blue-600 dark:text-blue-400">"{keyword}"</strong>.</p>
                 </div>
              </div>

              <div className="relative mb-6">
                <textarea
                  value={humanExperience}
                  onChange={(e) => setHumanExperience(e.target.value)}
                  placeholder="Ejemplo: Llevo 5 años haciendo esto y descubrí que el error más común es... Un cliente logró X resultado cuando aplicó..."
                  className="w-full h-32 p-4 pb-12 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-pink-500/50 resize-none shadow-inner"
                />
                <button 
                  onClick={toggleRecording}
                  className={`absolute bottom-3 right-3 p-2 rounded-xl transition-all flex items-center gap-2 text-xs font-bold ${
                    isRecording 
                      ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30' 
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-blue-500 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  }`}
                  title={isRecording ? "Detener grabación" : "Dictar por voz"}
                >
                  {isRecording ? (
                    <><MicOff className="w-4 h-4" /> Escuchando...</>
                  ) : (
                    <><Mic className="w-4 h-4" /> Dictar</>
                  )}
                </button>
              </div>

              {/* Word Count Selector */}
              <div className="flex items-center gap-4 mb-8 p-4 bg-white/50 dark:bg-black/40 rounded-2xl border border-neutral-200 dark:border-neutral-800">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <AlignLeft className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-sm text-neutral-900 dark:text-white">Longitud del Artículo</h3>
                  <p className="text-xs text-neutral-500">Ajusta la profundidad y extensión del contenido generado.</p>
                </div>
                <select 
                  value={wordCount}
                  onChange={(e) => setWordCount(e.target.value)}
                  className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none font-medium cursor-pointer min-w-[200px]"
                >
                  <option value="Corta (~500 palabras)">Corta (~500 palabras)</option>
                  <option value="Media (~1000 palabras)">Media (~1000 palabras)</option>
                  <option value="Larga (~1500 palabras)">Larga (~1500 palabras)</option>
                  <option value="Muy Larga (Pilar SEO ~2000+ palabras)">Muy Larga (Pilar SEO ~2000+ palabras)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setCurrentStep('research')} 
                  className="px-6 py-2.5 rounded-xl font-bold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  Volver a Analizar
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/25 hover:-translate-y-0.5 disabled:opacity-50"
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Escribiendo Artículo SEO...</>
                  ) : (
                    <>Escribir Artículo Final <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: GENERATED ARTICLE */}
        {currentStep === 'generate' && articleData && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
            {/* H1 & Slug Editor at the top */}
            <div className="bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-3xl p-6 shadow-xl mb-6">
                <div className="mb-4">
                  <label className="text-[10px] uppercase font-black text-indigo-500 mb-2 block tracking-widest">Título Principal (H1)</label>
                  <input 
                    type="text"
                    value={articleData.title}
                    onChange={(e) => setArticleData({...articleData, title: e.target.value})}
                    className="w-full text-2xl font-black bg-transparent border-none focus:outline-none placeholder-neutral-300 text-neutral-900 dark:text-white"
                    placeholder="Título del artículo..."
                  />
                  <div className="mt-4">
                    <label className="text-[10px] uppercase font-black text-blue-500 mb-2 block tracking-widest">Slug URL (Corto y Editable)</label>
                    <div className="flex items-center bg-transparent border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
                      <span className="bg-neutral-100 dark:bg-neutral-800 text-neutral-500 text-sm px-3 py-2 border-r border-neutral-200 dark:border-neutral-800 select-none">/blog/</span>
                      <input 
                        type="text"
                        value={articleData.slug || ''}
                        onChange={(e) => setArticleData({...articleData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-')})}
                        className="w-full text-sm font-mono bg-transparent border-none px-3 py-2 focus:outline-none placeholder-neutral-300 text-neutral-900 dark:text-blue-400"
                        placeholder="ejemplo-slug-corto"
                      />
                    </div>
                    <p className="text-[10px] text-neutral-500 mt-1 pl-1">Generado por IA. Puedes editarlo para hacerlo aún más corto y SEO-friendly.</p>
                  </div>
                </div>
            </div>

            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Artículo Completado</h2>
                    <p className="text-xs font-medium text-neutral-500 uppercase tracking-widest mt-1">SEO Pipeline Success</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button 
                    onClick={async () => {
                      if (!coverImage) {
                        toast.error('Por favor sube o añade la URL de una imagen de portada primero.');
                        return;
                      }
                      const loadingToast = toast.loading('Publicando en tu sitio web...');
                      try {
                        const res = await fetch('/api/seo-publish', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            title: articleData.title,
                            slug: articleData.slug,
                            category: articleData.category || articleData.parent_silo, // fallback
                            excerpt: articleData.excerpt,
                            metaDescription: articleData.metaDescription,
                            image: coverImage,
                            markdown: articleData.markdown,
                            hub_url: articleData.hub_url || SILO_HUBS[articleData.parent_silo as keyof typeof SILO_HUBS]?.[0]?.url,
                            parent_silo: articleData.parent_silo || "marketing-para-pymes"
                          })
                        });
                        
                        const data = await res.json();
                        if (!res.ok) throw new Error(data.error);
                        
                        toast.dismiss(loadingToast);
                        toast.success('¡Artículo Publicado en tu Web!');
                      } catch (e: any) {
                        toast.dismiss(loadingToast);
                        toast.error(e.message || "Error al publicar en la web");
                      }
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-500/25 flex gap-2 items-center"
                  >
                    <Globe className="w-4 h-4" />
                    Publicar en la Web
                  </button>
                  <button 
                    onClick={() => {
                      if (window.confirm("¿Estás seguro de que quieres limpiar todo el lienzo? Se perderá el artículo actual.")) {
                        setKeyword('');
                        setHumanExperience('');
                        setNotebookLmContext('');
                        setResearchData(null);
                        setArticleData(null);
                        setCoverImage('');
                        localStorage.removeItem('seo_lab_articleData');
                        localStorage.removeItem('seo_lab_researchData');
                        setCurrentStep('research');
                      }
                    }}
                    className="px-4 py-2 border border-red-200 dark:border-red-900/30 rounded-xl text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Limpiar Lienzo
                  </button>
                  <button 
                    onClick={() => {
                      setKeyword('');
                      setHumanExperience('');
                      setNotebookLmContext('');
                      setResearchData(null);
                      setArticleData(null);
                      setCoverImage('');
                      setCurrentStep('research');
                    }}
                    className="px-4 py-2 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                  >
                    Nuevo Análisis
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Columna Izquierda: SEO Meta y Portada */}
                <div className="lg:col-span-4 space-y-6">
                  
                  {/* Carta de Metadatos SEO */}
                  <div className="bg-neutral-50 dark:bg-black/20 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5">
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                      <Search className="w-4 h-4 text-blue-500" /> Metadatos SEO
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="space-y-3 bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-xl border border-blue-100 dark:border-blue-900/30">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 mb-1 flex items-center gap-1">
                            <Network className="w-3 h-3" /> Silo Estratégico (Parent)
                          </span>
                          <select 
                            value={articleData.parent_silo || "marketing-para-pymes"}
                            onChange={(e) => {
                              const newSilo = e.target.value;
                              setArticleData({
                                ...articleData, 
                                parent_silo: newSilo,
                                hub_url: SILO_HUBS[newSilo as keyof typeof SILO_HUBS][0].url
                              });
                            }}
                            className="bg-white dark:bg-neutral-900 border border-blue-200 dark:border-blue-800 text-neutral-900 dark:text-white text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none font-medium w-full"
                          >
                            <option value="marketing-para-pymes">Marketing para PYMEs (Silo 1)</option>
                            <option value="automatizacion-de-ventas">Automatización de Ventas (Silo 2)</option>
                            <option value="posicionamiento-en-google">Posicionamiento en Google (Silo 3)</option>
                            <option value="activaqr-gastronomia">ActivaQR Gastronomía</option>
                            <option value="activaqr-networking">ActivaQR Networking</option>
                          </select>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 mb-1 flex items-center gap-1">
                            <Target className="w-3 h-3" /> Hub de Destino (URL Pilar)
                          </span>
                          <select 
                            value={articleData.hub_url || SILO_HUBS[(articleData.parent_silo || "marketing-para-pymes") as keyof typeof SILO_HUBS]?.[0]?.url}
                            onChange={(e) => setArticleData({...articleData, hub_url: e.target.value})}
                            className="bg-white dark:bg-neutral-900 border border-blue-200 dark:border-blue-800 text-neutral-900 dark:text-white text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none font-medium w-full"
                          >
                            {SILO_HUBS[(articleData.parent_silo || "marketing-para-pymes") as keyof typeof SILO_HUBS]?.map((hub) => (
                              <option key={hub.url} value={hub.url}>{hub.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-neutral-500 mb-1 block">Meta Description</span>
                        <textarea 
                          value={articleData.metaDescription}
                          onChange={(e) => setArticleData({...articleData, metaDescription: e.target.value})}
                          className="w-full text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed bg-white dark:bg-neutral-900 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-y min-h-[80px]"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-neutral-500 mb-1 block">Extracto Corto (Excerpt)</span>
                        <textarea 
                          value={articleData.excerpt}
                          onChange={(e) => setArticleData({...articleData, excerpt: e.target.value})}
                          className="w-full text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed bg-white dark:bg-neutral-900 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-y min-h-[100px]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Cover Image Prompt & Upload */}
                  <div className="bg-neutral-50 dark:bg-black/20 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5">
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-500" /> Generación de Imagen 🔥
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="bg-purple-500/5 dark:bg-purple-500/10 p-4 rounded-2xl border border-purple-100 dark:border-purple-800/30 mb-6">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] uppercase font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                            <ImageIcon className="w-3 h-3" /> Generar con IA ✨
                          </span>
                          <button 
                            onClick={() => setShowImageGen(true)} 
                            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-bold rounded-lg transition-all shadow-lg shadow-purple-500/20"
                          >
                            Abrir Creador Pro
                          </button>
                        </div>
                        <p className="text-[11px] text-neutral-600 dark:text-neutral-400 italic mb-2 leading-tight">
                          "{articleData.imagePrompt.substring(0, 100)}..."
                        </p>
                        <button 
                          onClick={() => {navigator.clipboard.writeText(articleData.imagePrompt); toast.success('Prompt copiado');}} 
                          className="text-[10px] text-blue-500 hover:text-blue-600 font-medium"
                        >
                          Copiar Prompt Completo
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-neutral-500 mb-2 block">1. URL de la Portada Final</span>
                          <input 
                            type="text"
                            value={coverImage}
                            onChange={(e) => setCoverImage(e.target.value)}
                            placeholder="Pega el link aquí después de generar..."
                            className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-sm outline-none focus:border-purple-500"
                          />
                        </div>

                        <div className="pt-2">
                          <span className="text-[10px] uppercase font-bold text-neutral-500 mb-2 block">Subida Manual (Opcional)</span>
                          <div className="bg-white dark:bg-neutral-900 p-3 border border-neutral-200 dark:border-neutral-800 rounded-xl">
                            <MediaUploader 
                              multiple={true} 
                              onUploadComplete={(urls) => {
                                if (urls.length > 0) {
                                  if (!coverImage) setCoverImage(urls[0]);
                                  toast.success(`Imágenes subidas`);
                                }
                              }} 
                            />
                          </div>
                        </div>

                        {coverImage && (
                          <div className="mt-3 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 aspect-video relative group">
                            <img src={coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                              <button 
                                onClick={() => {
                                  navigator.clipboard.writeText(`![Image](${coverImage})`);
                                  toast.success('Formato Markdown copiado');
                                }}
                                className="px-4 py-2 bg-white text-black text-xs font-bold rounded-lg flex items-center gap-2"
                              >
                                <ImageIcon className="w-4 h-4" /> Copiar para Markdown
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Columna Derecha: El Artículo Markdown */}
                <div className="lg:col-span-8 flex flex-col">
                  <div className="bg-neutral-50 dark:bg-black/20 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 lg:p-8 flex-grow flex flex-col">
                    
                    <div className="flex items-center justify-between mb-4">
                       <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                         <FileText className="w-4 h-4 text-blue-500" /> Editor Markdown (Live)
                       </h3>
                       <span className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500 rounded text-[10px] font-bold uppercase tracking-widest">
                         Borrador Editable
                       </span>
                    </div>

                    {/* Markdown Toolbar */}
                    <div className="flex items-center gap-2 mb-3 p-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-sm">
                      <button 
                        onMouseDown={(e) => { e.preventDefault(); document.execCommand('undo'); }}
                        title="Deshacer (Ctrl+Z)"
                        className="p-1.5 text-neutral-600 hover:text-red-600 hover:bg-red-50 dark:text-neutral-400 dark:hover:text-red-400 dark:hover:bg-red-900/20 rounded-md transition-colors mr-2"
                      >
                        <Undo className="w-4 h-4" />
                      </button>
                      <div className="w-px h-5 bg-neutral-200 dark:bg-neutral-700 mr-1"></div>
                      
                      <button 
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => insertMarkdown('**', '**', 'Texto en negrita')}
                        title="Negrita"
                        className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-neutral-800 rounded-md transition-colors"
                      >
                        <Bold className="w-4 h-4" />
                      </button>

                      <button 
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => insertMarkdown('### ', '', 'Subtítulo H3')}
                        title="Subtítulo H3"
                        className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-neutral-800 rounded-md transition-colors"
                      >
                        <Heading3 className="w-4 h-4" />
                      </button>

                      <button 
                        onClick={() => insertMarkdown('[', ']', 'Texto del enlace')}
                        title="Insertar Enlace"
                        className="flex items-center gap-1.5 px-3 py-1.5 text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 rounded-md transition-colors text-xs font-bold"
                      >
                        <Link2 className="w-3.5 h-3.5" /> Añadir Enlace
                      </button>

                      <div className="w-px h-5 bg-neutral-200 dark:bg-neutral-700 mx-2"></div>

                      <button 
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => setShowGalleryPicker(true)}
                        title="Elegir de Galería"
                        className="p-1.5 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded-md transition-all flex items-center justify-center p-2"
                      >
                        <FolderOpen className="w-5 h-5 stroke-[2.5px]" />
                      </button>

                      <button 
                        onClick={() => {
                          const url = window.prompt("Ingresa la URL de la imagen:") || "";
                          if (url) insertMarkdown(`\n![Descripción de la imagen](${url})\n`, '');
                        }}
                        title="Insertar Imagen"
                        className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-neutral-800 rounded-md transition-all flex items-center justify-center p-2"
                      >
                        <ImageIcon className="w-5 h-5 stroke-[2.5px]" />
                      </button>

                      <button 
                        onClick={() => {
                          if (!textareaRef.current) return;
                          const start = textareaRef.current.selectionStart;
                          const end = textareaRef.current.selectionEnd;
                          const selected = (articleData?.markdown || '').substring(start, end);
                          
                          let url = selected.trim();
                          if (!url.startsWith('http')) {
                            url = window.prompt("Ingresa la URL de YouTube:") || "";
                          }
                          
                          if (url) {
                            const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
                            const embed = `\n<div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:20px 0;"><iframe src="https://www.youtube.com/embed/${videoId}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allowfullscreen></iframe></div>\n`;
                            insertMarkdown(embed, '');
                          }
                        }}
                        title="Insertar Video YouTube"
                        className="p-1.5 text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-md transition-all flex items-center justify-center p-2"
                      >
                        <Youtube className="w-5 h-5 stroke-[2.5px]" />
                      </button>
                    </div>

                    <textarea
                      ref={textareaRef}
                      value={articleData.markdown}
                      onChange={(e) => setArticleData({...articleData, markdown: e.target.value})}
                      className="w-full flex-grow text-sm font-mono leading-loose bg-white dark:bg-neutral-900 p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-y min-h-[600px] lg:min-h-full text-neutral-800 dark:text-neutral-200"
                    />
                    <p className="text-xs text-neutral-500 mt-3 text-center">Puedes pegar códigos de imagen en markdown aquí `![Alt text](https://...)` antes de Publicar en la Web.</p>

                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* GALLERY PICKER MODAL */}
        {showGalleryPicker && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 overflow-hidden">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowGalleryPicker(false)} />
            <div className="relative w-full max-w-6xl h-[80vh] bg-neutral-900 rounded-[32px] border border-neutral-800 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
              <div className="p-6 border-b border-neutral-800 flex justify-between items-center bg-black/20">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-3">
                    <FolderOpen className="w-6 h-6 text-blue-500" />
                    Biblioteca de Medios
                  </h3>
                  <p className="text-sm text-neutral-400">Selecciona un archivo para insertar en el artículo</p>
                </div>
                <button 
                  onClick={() => setShowGalleryPicker(false)}
                  className="p-3 hover:bg-neutral-800 rounded-2xl text-neutral-400 transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="flex-1 overflow-hidden">
                 <MediaGallery 
                   isPicker 
                   onSelect={(url) => {
                     const isVideo = url.match(/\.(mp4|webm|ogg)$/i);
                     if (isVideo) {
                      const embed = `\n<div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:20px 0;"><iframe src="${url}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allowfullscreen></iframe></div>\n`;
                      insertMarkdown(embed, '');
                     } else {
                       insertMarkdown(`\n![Imagen](${url})\n`, '');
                     }
                     setShowGalleryPicker(false);
                     toast.success("Elemento insertado");
                   }} 
                 />
              </div>
            </div>
          </div>
        )}

        {/* AI IMAGE GENERATOR SIDE PANEL */}
        {showImageGen && (
          <>
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]" onClick={() => setShowImageGen(false)} />
            <div className="fixed inset-y-4 right-4 w-[400px] z-[70] animate-in slide-in-from-right duration-500">
              <AiImageGenerator 
                initialPrompt={articleData?.imagePrompt || ""} 
                onImageUsed={(url) => {
                  setCoverImage(url);
                  setShowImageGen(false);
                }}
              />
              <button 
                onClick={() => setShowImageGen(false)}
                className="absolute top-4 -left-14 p-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-full shadow-2xl hover:text-red-500 transition-all flex items-center justify-center group"
              >
                <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
              </button>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function SeoLabPage() {
  return (
    <Suspense fallback={
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        </div>
      </DashboardLayout>
    }>
      <SeoLabContent />
    </Suspense>
  );
}
