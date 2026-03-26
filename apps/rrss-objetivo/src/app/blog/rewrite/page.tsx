"use client";

import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  FileText, Search, Loader2, Save, ExternalLink, Image as ImageIcon, CheckCircle2,
  Link2, Bold, Heading3, Undo
} from "lucide-react";
import toast from "react-hot-toast";
import MediaUploader from "@/components/MediaUploader";
import Link from "next/link";

type Article = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover_image: string;
  category_id: string;
  meta_description: string;
  published: boolean;
  meta_title?: string;
};

export default function RewriteBlogPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/articles/mysql');
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to fetch articles');
      setArticles((data as Article[]) || []);
    } catch (error: any) {
      console.error(error);
      toast.error('Error cargando artículos de MySQL: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const insertMarkdown = (prefix: string, suffix: string, defaultText: string = '') => {
    if (!textareaRef.current || !selectedArticle) return;
    const textarea = textareaRef.current;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = selectedArticle.content;
    const selectedText = text.substring(start, end) || defaultText;

    let replacement = '';
    if (prefix === '[') {
      let linkText = text.substring(start, end);
      if (!linkText) {
        linkText = window.prompt('Texto del enlace:', defaultText) || defaultText;
      }
      const url = window.prompt(`Ingresa la URL del enlace para "${linkText}":`, 'https://');
      if (!url) return;
      replacement = `[${linkText}](${url})`;
    } else {
      replacement = `${prefix}${selectedText}${suffix}`;
    }

    // Preserve undo history using native execCommand
    textarea.focus();
    textarea.setSelectionRange(start, end);
    const success = document.execCommand('insertText', false, replacement);

    if (!success) {
      const newText = text.substring(0, start) + replacement + text.substring(end);
      setSelectedArticle({ ...selectedArticle, content: newText });
    } else {
      // execCommand updates the value, so we sync the state
      setSelectedArticle({ ...selectedArticle, content: textarea.value });
    }
  };

  const handleSave = async () => {
    if (!selectedArticle) return;
    try {
      setIsSaving(true);
      
      const res = await fetch('/api/articles/mysql', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedArticle),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save article');
      
      toast.success('Cambios guardados correctamente en MySQL');
      
      // Update local list
      setArticles(prev => prev.map(a => a.id === selectedArticle.id ? selectedArticle : a));
    } catch(error: any) {
      console.error(error);
      toast.error('Error guardando en MySQL: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredArticles = articles.filter(a => 
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link href="/blog" className="text-sm text-neutral-500 hover:text-blue-500 transition-colors font-medium">← Volver a SEO Lab</Link>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neutral-900 to-neutral-600 dark:from-white dark:to-neutral-400">
              Reescritura de Artículos
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Edita textos, títulos, slugs y metadatos de los artículos existentes publicados en tu web.
            </p>
          </div>
          
          <Link href="/blog" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20">
             ✨ Crear Nuevo Artículo
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[80vh] min-h-[600px]">
          
          {/* Listado Izquierdo */}
          <div className="lg:col-span-4 flex flex-col bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl overflow-hidden shadow-xl shadow-blue-500/5">
            <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Buscar artículos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white dark:bg-black/40 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all dark:text-neutral-200"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-40 text-neutral-400">
                  <Loader2 className="w-6 h-6 animate-spin mb-2" />
                  <span className="text-xs">Cargando base de datos...</span>
                </div>
              ) : filteredArticles.length === 0 ? (
                <div className="text-center p-6 text-neutral-500 text-sm">
                  No se encontraron artículos.
                </div>
              ) : (
                filteredArticles.map(article => (
                  <button
                    key={article.id}
                    onClick={() => setSelectedArticle(article)}
                    className={`w-full text-left p-4 rounded-xl transition-all ${
                      selectedArticle?.id === article.id 
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/50 border shadow-sm' 
                      : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50 border border-transparent'
                    }`}
                  >
                     <div className="flex justify-between items-start mb-1">
                        <h4 className={`text-sm font-bold line-clamp-2 leading-tight ${selectedArticle?.id === article.id ? 'text-blue-700 dark:text-blue-400' : 'text-neutral-800 dark:text-neutral-200'}`}>
                          {article.title}
                        </h4>
                     </div>
                     <span className="text-[10px] font-mono text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">/{article.category_id}</span>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Área de Edición Derecha */}
          <div className="lg:col-span-8 flex flex-col bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl overflow-hidden shadow-xl shadow-blue-500/5">
            {selectedArticle ? (
              <div className="flex flex-col h-full">
                
                {/* Header del Editor */}
                <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-4 bg-neutral-50/50 dark:bg-neutral-900/50">
                   <div className="flex items-center gap-3">
                     <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                       <FileText className="w-5 h-5" />
                     </div>
                     <div>
                       <h3 className="font-bold text-neutral-900 dark:text-white text-sm">Editor en Vivo</h3>
                       <a href={`https://www.cesarreyesjaramillo.com/blog/${selectedArticle.category_id}/${selectedArticle.slug}`} target="_blank" rel="noreferrer" className="text-[11px] text-blue-500 hover:underline flex items-center gap-1">
                         Ver en la Web <ExternalLink className="w-3 h-3" />
                       </a>
                     </div>
                   </div>

                   <button 
                     onClick={handleSave}
                     disabled={isSaving}
                     className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20"
                   >
                     {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                     Guardar Cambios
                   </button>
                </div>

                {/* Formulario */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                       <div>
                         <label className="text-[10px] uppercase font-bold text-neutral-500 mb-1 block">Título del Artículo (H1)</label>
                         <input 
                           type="text"
                           value={selectedArticle.title}
                           onChange={(e) => setSelectedArticle({...selectedArticle, title: e.target.value})}
                           className="w-full bg-neutral-50 dark:bg-black/20 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500"
                         />
                       </div>
                       <div>
                         <label className="text-[10px] uppercase font-bold text-neutral-500 mb-1 flex justify-between">
                            Slug (URL)
                            <span className="text-[9px] text-amber-500 font-normal normal-case">⚠️ Cuidado al cambiar si ya está indexado</span>
                         </label>
                         <input 
                           type="text"
                           value={selectedArticle.slug}
                           onChange={(e) => setSelectedArticle({...selectedArticle, slug: e.target.value})}
                           className="w-full font-mono text-blue-600 dark:text-blue-400 bg-neutral-50 dark:bg-black/20 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500"
                         />
                       </div>
                       <div>
                         <label className="text-[10px] uppercase font-bold text-neutral-500 mb-1 block">Categoría</label>
                         <select 
                           value={selectedArticle.category_id}
                           onChange={(e) => setSelectedArticle({...selectedArticle, category_id: e.target.value})}
                           className="w-full bg-neutral-50 dark:bg-black/20 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500 appearance-none"
                         >
                                                         <option value="marketing-para-pymes">Marketing para PYMEs</option>
                             <option value="automatizacion-de-ventas">Automatización de Ventas</option>
                             <option value="posicionamiento-en-google">Posicionamiento en Google</option>
                             <option value="activaqr-gastronomia">ActivaQR Gastronomía</option>
                             <option value="activaqr-networking">ActivaQR Networking</option>
                         </select>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <div>
                         <label className="text-[10px] uppercase font-bold text-neutral-500 mb-1 block">Meta Description</label>
                         <textarea 
                           value={selectedArticle.meta_description || ''}
                           onChange={(e) => setSelectedArticle({...selectedArticle, meta_description: e.target.value})}
                           className="w-full bg-neutral-50 dark:bg-black/20 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 text-xs outline-none focus:border-blue-500 min-h-[80px]"
                         />
                       </div>
                       <div>
                         <label className="text-[10px] uppercase font-bold text-neutral-500 mb-1 block">Excerpt (Resumen visible en listados)</label>
                         <textarea 
                           value={selectedArticle.excerpt || ''}
                           onChange={(e) => setSelectedArticle({...selectedArticle, excerpt: e.target.value})}
                           className="w-full bg-neutral-50 dark:bg-black/20 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 text-xs outline-none focus:border-blue-500 min-h-[80px]"
                         />
                       </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
                     <label className="text-[10px] uppercase font-bold text-neutral-500 mb-2 block">Imagen de Portada (URL)</label>
                     <div className="flex gap-4">
                        <div className="flex-1 space-y-3">
                           <input 
                              type="text"
                              value={selectedArticle.cover_image || ''}
                              onChange={(e) => setSelectedArticle({...selectedArticle, cover_image: e.target.value})}
                              placeholder="https://..."
                              className="w-full bg-neutral-50 dark:bg-black/20 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500"
                           />
                           {selectedArticle.cover_image && (
                              <div className="rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 aspect-video relative">
                                <img src={selectedArticle.cover_image} className="w-full h-full object-cover" alt="Cover" />
                              </div>
                           )}
                        </div>
                        <div className="w-1/3 min-w-[200px]">
                           <div className="bg-neutral-50 dark:bg-black/20 p-3 border border-neutral-200 dark:border-neutral-800 rounded-xl h-full">
                             <MediaUploader 
                                multiple={false} 
                                onUploadComplete={(urls) => {
                                   if (urls.length > 0) {
                                      setSelectedArticle({...selectedArticle, cover_image: urls[0]});
                                      toast.success('Nueva portada cargada');
                                   }
                                }} 
                             />
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
                     <div className="flex items-center justify-between mb-2">
                       <label className="text-[10px] uppercase font-bold text-neutral-500">Cuerpo del Artículo (Markdown)</label>
                       <span className="px-2 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded text-[10px] font-bold tracking-widest uppercase">
                          Editor Raw
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
                        <div className="w-px h-5 bg-neutral-200 dark:bg-neutral-700 mx-1"></div>
                        <button 
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => insertMarkdown('[', '](url)', 'Texto del enlace')}
                          title="Insertar Enlace (Interlinking)"
                          className="flex items-center gap-1.5 px-3 py-1.5 text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 rounded-md transition-colors text-xs font-bold"
                        >
                          <Link2 className="w-3.5 h-3.5" /> Añadir Enlace
                        </button>
                     </div>

                     <textarea 
                        ref={textareaRef}
                        value={selectedArticle.content || ''}
                        onChange={(e) => setSelectedArticle({...selectedArticle, content: e.target.value})}
                        className="w-full font-mono text-sm leading-loose bg-neutral-50 dark:bg-black/20 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 outline-none focus:border-blue-500 min-h-[600px] text-neutral-800 dark:text-neutral-200"
                     />
                  </div>
                  
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8 text-neutral-400">
                <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-neutral-300 dark:text-neutral-600" />
                </div>
                <h3 className="text-lg font-bold text-neutral-800 dark:text-white mb-2">Selecciona un artículo</h3>
                <p className="text-sm max-w-sm">
                  Haz clic en un artículo de la lista de la izquierda para comenzar a reescribir y modificar su contenido.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
