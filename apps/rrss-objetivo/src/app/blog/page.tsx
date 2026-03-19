"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Type, Search, BrainCircuit, PenTool, Sparkles, ChevronRight, 
  Settings2, Loader2, CheckCircle2, Globe, FileText, ArrowRight, BookOpen, AlertCircle,
  Mic, MicOff, AlignLeft, Image as ImageIcon, X
} from "lucide-react";
import toast from "react-hot-toast";
import MediaUploader from "@/components/MediaUploader";
import AiImageGenerator from "@/components/AiImageGenerator";

type LabStep = 'research' | 'brief' | 'generate';

export default function SeoLabPage() {
  const [currentStep, setCurrentStep] = useState<LabStep>('research');
  
  // -- FORMS & DATA --
  const [keyword, setKeyword] = useState('');
  const [humanExperience, setHumanExperience] = useState('');
  const [loading, setLoading] = useState(false);
  const [researchData, setResearchData] = useState<any>(null); // To hold the scraped content & analysis
  const [articleData, setArticleData] = useState<any>(null);
  const [coverImage, setCoverImage] = useState<string>('');
  const [showImageGen, setShowImageGen] = useState(false);
  
  // -- NEW FEATURES: Mic & Word Count --
  const [wordCount, setWordCount] = useState('Media (~1000 palabras)');
  const [isRecording, setIsRecording] = useState(false);
  const [mounted, setMounted] = useState(false);

  // -- LocalStorage Persistence --
  useEffect(() => {
    const savedStep = localStorage.getItem('seo_lab_currentStep');
    const savedKeyword = localStorage.getItem('seo_lab_keyword');
    const savedHumanExp = localStorage.getItem('seo_lab_humanExperience');
    const savedResearch = localStorage.getItem('seo_lab_researchData');
    const savedArticle = localStorage.getItem('seo_lab_articleData');
    const savedCover = localStorage.getItem('seo_lab_coverImage');
    const savedWordCount = localStorage.getItem('seo_lab_wordCount');

    if (savedStep) setCurrentStep(savedStep as LabStep);
    if (savedKeyword) setKeyword(savedKeyword);
    if (savedHumanExp) setHumanExperience(savedHumanExp);
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
    
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('seo_lab_currentStep', currentStep);
    localStorage.setItem('seo_lab_keyword', keyword);
    localStorage.setItem('seo_lab_humanExperience', humanExperience);
    localStorage.setItem('seo_lab_researchData', researchData ? JSON.stringify(researchData) : '');
    localStorage.setItem('seo_lab_articleData', articleData ? JSON.stringify(articleData) : '');
    localStorage.setItem('seo_lab_coverImage', coverImage);
    localStorage.setItem('seo_lab_wordCount', wordCount);
  }, [currentStep, keyword, humanExperience, researchData, articleData, coverImage, wordCount, mounted]);
  
  // -- Handlers --
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
    // Use true for interimResults directly if we wanted live typing, but false is safer for a single block
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
          rawContext: researchData.rawContext, 
          analysis: researchData.analysis,
          humanExperience,
          wordCount
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setArticleData(data.articleData);
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
      <div className="max-w-5xl mx-auto">
        <TopBar />

        {/* STEP 1: RESEARCH */}
        {currentStep === 'research' && (
          <div className="bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-3xl p-8 shadow-xl shadow-black/5 dark:shadow-black/20 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            <div className="max-w-2xl mx-auto text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-200 dark:border-blue-500/20">
                <Search className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">Análisis Inteligente de Intención</h2>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm">Nuestros agentes analizarán los artículos posicionados actualmente, determinando los patrones, intenciones de búsqueda y vacíos críticos para sugerirte el Brief perfecto.</p>
            </div>

            <div className="max-w-xl mx-auto">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Type className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  type="text"
                  placeholder="Introduce la Palabra Clave (ej: estrategias para linkedin B2B)"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-4 bg-white/60 dark:bg-black/60 border border-neutral-200 dark:border-neutral-800 rounded-2xl text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-inner"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleResearch();
                  }}
                />
              </div>

              <div className="mt-6 flex justify-center">
                <button
                  onClick={handleResearch}
                  disabled={loading || !keyword}
                  className="group relative flex items-center gap-3 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Extrayendo SERP...
                    </>
                  ) : (
                    <>
                      Escanear y Analizar <Sparkles className="w-4 h-4 text-blue-400" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: BRIEF & EEAT HUMANIZATION */}
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
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 shadow-xl animate-in fade-in slide-in-from-right-8 duration-500">
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
                      // Usamos la NUEVA API directa a www.cesarreyesjaramillo.com
                      const res = await fetch('/api/seo-publish', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          title: articleData.title,
                          category: articleData.category,
                          excerpt: articleData.excerpt,
                          metaDescription: articleData.metaDescription,
                          image: coverImage,
                          markdown: articleData.markdown
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
                  onClick={async () => {
                    const loadingToast = toast.loading('Guardando borrador...');
                    try {
                      const res = await fetch('/api/posts/save-ai-post', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          content: articleData.markdown,
                          targetMonth: new Date().toISOString().substring(0, 7), // YYYY-MM
                          topic: keyword,
                          platforms: ['blog'], 
                          categoryId: 'seo-lab-article',
                          media_urls: coverImage ? [coverImage] : [],
                          status: 'pending'
                        })
                      });
                      
                      const data = await res.json();
                      if (!res.ok) throw new Error(data.error);
                      
                      toast.dismiss(loadingToast);
                      toast.success('¡Guardado en posts pendientes!');
                    } catch (e: any) {
                      toast.dismiss(loadingToast);
                      toast.error(e.message || "Error al guardar borrador");
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors shadow-lg shadow-blue-500/25"
                >
                  Guardar Borrador (Supabase)
                </button>
                <button 
                  onClick={() => {
                    setKeyword('');
                    setHumanExperience('');
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
                    <div>
                      <span className="text-[10px] uppercase font-bold text-neutral-500 mb-1 block">Categoría Destino</span>
                      <select 
                        value={articleData.category}
                        onChange={(e) => setArticleData({...articleData, category: e.target.value})}
                        className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none font-medium w-full"
                      >
                        <option value="automatizacion">Automatización</option>
                        <option value="diseno-web">Diseño Web</option>
                        <option value="marketing-digital">Marketing Digital</option>
                        <option value="asesoria">Asesoría</option>
                        <option value="desarrollo-web">Desarrollo Web</option>
                        <option value="posicionamiento-marca">Posicionamiento Marca</option>
                      </select>
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

                  <textarea
                    value={articleData.markdown}
                    onChange={(e) => setArticleData({...articleData, markdown: e.target.value})}
                    className="w-full flex-grow text-sm font-mono leading-loose bg-white dark:bg-neutral-900 p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-y min-h-[600px] lg:min-h-full text-neutral-800 dark:text-neutral-200"
                  />
                  <p className="text-xs text-neutral-500 mt-3 text-center">Puedes pegar códigos de imagen en markdown aquí `![Alt text](https://...)` antes de Publicar en la Web.</p>

                </div>
              </div>
            </div>
            
          </div>
        )}

        {/* AI IMAGE GENERATOR SIDE PANEL */}
        {showImageGen && (
          <>
            {/* Overlay to close when clicking outside */}
            <div 
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] animate-in fade-in duration-300"
              onClick={() => setShowImageGen(false)}
            />
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
