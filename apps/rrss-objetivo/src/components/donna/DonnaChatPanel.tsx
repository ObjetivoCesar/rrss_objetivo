"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Bot, User, Send, BrainCircuit, Sparkles, AlertCircle, Mic, Square, Loader2, X, ChevronLeft, Zap, RotateCcw, LayoutDashboard, ImagePlus, Link, Globe, Video, Play, FileVideo } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Role = 'user' | 'assistant';

interface ToolActionResult {
  tool: string;
  result: { status: string; id?: string; message?: string };
}

interface UiAction {
  action?: string;
  payload?: {
    central_idea?: string;
    objective_id?: string | null;
    campaign_id?: string | null;
    target_month?: string;
    suggested_platforms?: string[];
    plan?: any[];
  };
  toolActions?: ToolActionResult[];
}

interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  uiAction?: UiAction;
}

const WELCOME: ChatMessage = {
  id: 'welcome-0',
  role: 'assistant',
  content: `Hola César. Soy **Donna**, tu Directora Estratégica Digital.

¿Qué quieres atacar hoy?`,
};

const SLASH_COMMANDS = [
  { cmd: '/crear', desc: 'Desarrolla o estructura un módulo estratégico' },
  { cmd: '/generar', desc: 'Crear contenido rápido, borradores masivos o ideas' },
  { cmd: '/objetivo', desc: 'Crear o discutir un objetivo estratégico' },
  { cmd: '/estrategia', desc: 'Planificar una nueva campaña' },
  { cmd: '/reels', desc: 'Redactar guiones o ideas para Reels' },
  { cmd: '/carrusel', desc: 'Invocación del Motor de Carruseles 2026' }
];

export default function DonnaChatPanel() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [input, setInput] = useState('');
  const [provider, setProvider] = useState<'gemini' | 'deepseek'>('gemini');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Persistence for messages and isOpen state
  useEffect(() => {
    const savedOpen = localStorage.getItem('donna-panel-open');
    if (savedOpen !== null) setIsOpen(savedOpen === 'true');
    else setIsOpen(true); 

    const savedMessages = localStorage.getItem('donna-chat-history');
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (e) {
        setMessages([WELCOME]);
      }
    } else {
      setMessages([WELCOME]);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('donna-chat-history', JSON.stringify(messages));
    }
  }, [messages, isInitialized]);

  useEffect(() => {
    localStorage.setItem('donna-panel-open', String(isOpen));
  }, [isOpen]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // Strip raw XML/HTML tags that Donna sometimes emits (create_objective, SAVE_NOTE, etc.)
  function stripDonnaTags(text: string): string {
    return text
      .replace(/<create_objective[^>]*>[\s\S]*?(<\/create_objective>|$)/gi, '')
      .replace(/<manage_campaign[^>]*>[\s\S]*?(<\/manage_campaign>|$)/gi, '')
      .replace(/<propose_post[^>]*>[\s\S]*?(<\/propose_post>|$)/gi, '')
      .replace(/<SAVE_NOTE[^>]*>[\s\S]*?(<\/SAVE_NOTE>|$)/gi, '')
      .trim();
  }
  const audioChunksRef = useRef<Blob[]>([]);

  // Listen for external events
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    const handlePrefill = (e: CustomEvent) => {
      setIsOpen(true);
      setTimeout(() => {
        setInput(e.detail);
        textareaRef.current?.focus();
      }, 50);
    };
    
    window.addEventListener('open-donna', handleOpen);
    window.addEventListener('donna-prefill', handlePrefill as EventListener);
    
    return () => {
      window.removeEventListener('open-donna', handleOpen);
      window.removeEventListener('donna-prefill', handlePrefill as EventListener);
    };
  }, []);

  // Auto-scroll to bottom using scroll container to prevent page jump
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const [attachments, setAttachments] = useState<string[]>([]);
  // stickyAttachments persiste la imagen/video entre turnos hasta que propose_post la use
  const [stickyAttachments, setStickyAttachments] = useState<string[]>([]);
  
  // NUEVO: Gestión de Links externos (YouTube, artículos)
  const [stickyLinks, setStickyLinks] = useState<string[]>([]);
  const [linkInput, setLinkInput] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);
  
  const [isUploading, setIsUploading] = useState(false);

  // WhatsApp-style auto-growing textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  /**
   * Converts an image File to JPEG format (required by Instagram API)
   */
  async function convertToJPEG(file: File, quality = 0.88): Promise<{ file: File; converted: boolean }> {
    if (file.type === "image/jpeg") return { file, converted: false };
    return new Promise((resolve) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) { resolve({ file, converted: false }); return; }
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (!blob) { resolve({ file, converted: false }); return; }
          const jpegName = file.name.replace(/\.[^.]+$/, "") + ".jpg";
          resolve({ file: new File([blob], jpegName, { type: "image/jpeg" }), converted: true });
        }, "image/jpeg", quality);
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve({ file, converted: false });
      };
      img.src = objectUrl;
    });
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    try {
      const fileList = Array.from(files).slice(0, 10); // Máximo 10 archivos
      
      for (const file of fileList) {
        const isVideo = file.type.startsWith('video/') || file.name.endsWith('.mp4') || file.name.endsWith('.mov');
        
        if (isVideo) {
          // SUBIDA A BUNNY.NET (Proxy seguro)
          const formData = new FormData();
          formData.append('file', file);
          formData.append('folder', 'donna-chat/videos');

          const uploadRes = await fetch('/api/upload-media', {
            method: 'POST',
            body: formData,
          });

          if (!uploadRes.ok) throw new Error('Error subiendo video a Bunny.net');
          const { url } = await uploadRes.json();
          setAttachments(prev => [...prev, url]);
          setStickyAttachments(prev => [...prev, url]);
          toast.success('Video listo en la nube 🎬');
        } else {
          // SUBIDA A SUPABASE (Imágenes optimizadas)
          const { file: optimizedFile } = await convertToJPEG(file);
          const fileName = `${Date.now()}-${optimizedFile.name}`;
          const filePath = `donna-chat/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from("posts-assets")
            .upload(filePath, optimizedFile, {
              contentType: "image/jpeg",
              upsert: false,
            });

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage.from("posts-assets").getPublicUrl(filePath);
          setAttachments(prev => [...prev, publicUrl]);
          setStickyAttachments(prev => [...prev, publicUrl]);
          toast.success('Imagen lista 🚀');
        }
      }
    } catch (err: any) {
      toast.error('Error en la carga: ' + err.message);
    } finally {
      setIsUploading(false);
      if (textareaRef.current) textareaRef.current.focus();
    }
  };

  const handleLinkAdd = () => {
    if (!linkInput.trim()) return;
    let url = linkInput.trim();
    if (!url.startsWith('http')) url = 'https://' + url;
    
    try {
      new URL(url);
      setStickyLinks(prev => [...prev, url]);
      setLinkInput('');
      setShowLinkInput(false);
      toast.success('Link agregado 🔗');
    } catch (e) {
      toast.error('URL inválida');
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
    setStickyAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const removeLink = (index: number) => {
    setStickyLinks(prev => prev.filter((_, i) => i !== index));
  };

  const sendMessage = useCallback(async (userText: string) => {
    if (!userText.trim() || isLoading) return;

    setError(null);
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: userText.trim(),
    };

    const assistantId = `a-${Date.now()}`;
    setMessages(prev => [
      ...prev,
      userMsg,
      { id: assistantId, role: 'assistant', content: '' },
    ]);
    setInput('');
    setIsLoading(true);

    const history = [...messages, userMsg].map(m => ({
      role: m.role,
      content: m.content,
    }));

    try {
      abortRef.current = new AbortController();
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Enviamos media y links persistentes (sticky)
        body: JSON.stringify({ 
          messages: history, 
          provider, 
          attachments: stickyAttachments,
          links: stickyLinks
        }),
        signal: abortRef.current.signal,
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || `Error ${response.status}`);
      }

      const text = data.text || '';
      const uiAction: UiAction | null = data.uiAction || null;

      setMessages(prev =>
        prev.map(m =>
          m.id === assistantId
            ? { ...m, content: text || '(Donna no respondió)', uiAction: uiAction || undefined }
            : m
        )
      );

      // 🌉 THE BRIDGE: si Donna activa pilot_editor, crear evento y navegar
      if (uiAction?.action === 'pilot_editor') {
        window.dispatchEvent(new CustomEvent('donna-pilot-editor', { detail: uiAction.payload }));
        setTimeout(() => {
          router.push('/editor');
        }, 1800);
      } else if (uiAction?.toolActions?.some((t: any) => ['create_objective', 'manage_campaign'].includes(t.tool))) {
        window.dispatchEvent(new CustomEvent('donna-refresh-campaigns'));
        router.refresh();
      }

      // Si Donna ejecutó propose_post exitosamente, podemos limpiar media y links
      const didPublish = uiAction?.toolActions?.some((t: any) => t.tool === 'propose_post');
      if (didPublish) {
        setStickyAttachments([]);
        setStickyLinks([]);
      }
    } catch (err: unknown) {
      if ((err as Error).name === 'AbortError') return;
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      setMessages(prev => prev.filter(m => m.id !== assistantId));
    } finally {
      setIsLoading(false);
      setAttachments([]); // Limpiar preview temporal después de cada envío
      textareaRef.current?.focus();
    }
  }, [messages, isLoading, provider, router, stickyAttachments, stickyLinks]);

  
  const clearSession = useCallback(() => {
    setMessages([WELCOME]);
    localStorage.removeItem('donna-chat-history');
    setShowClearConfirm(false);
    toast.success('Sesión limpiada. ¡Nuevo inicio!');
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await handleAudioTranscription(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setError(null);
    } catch (err) {
      toast.error("Error al acceder al micrófono");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleAudioTranscription = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      const res = await fetch('/api/transcribe', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.text) setInput(prev => prev ? `${prev} ${data.text}` : data.text);
    } catch (err: any) {
      setError(err.message || "Error de transcripción");
    } finally {
      setIsTranscribing(false);
      textareaRef.current?.focus();
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed left-4 bottom-24 md:bottom-8 z-50 bg-[#fbf9f6] dark:bg-neutral-900 hover:bg-[#fffdfa] dark:hover:bg-neutral-800 text-neutral-900 dark:text-white p-4 rounded-2xl shadow-[0_4px_20px_rgba(219,39,119,0.15)] dark:shadow-[0_0_20px_rgba(219,39,119,0.3)] transition-all border border-pink-500/20 dark:border-pink-500/40 group animate-in fade-in zoom-in"
      >
        <BrainCircuit className="w-6 h-6 text-pink-600 dark:text-pink-500 animate-pulse" />
        <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#fbf9f6] dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl border-l-4 border-l-pink-500 pointer-events-none">
          Consultar a Donna
        </div>
      </button>
    );
  }

  return (
    <>
      {/* Mobile Overlay Background */}
      <div 
        className={`md:hidden fixed inset-0 z-[60] bg-black/40 dark:bg-black/60 backdrop-blur-sm transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />

      <aside className={`fixed md:sticky flex flex-col left-0 top-0 bottom-0 z-[70] md:z-40 w-80 md:w-96 bg-white/40 dark:bg-black/40 border-r border-white/20 dark:border-white/10 backdrop-blur-2xl shadow-[15px_0_40px_rgba(0,0,0,0.05)] dark:shadow-[15px_0_40px_rgba(0,0,0,0.5)] transition-all duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full md:w-0 md:opacity-0'}`}>
        {/* Visible glow border - Pink Expert Line */}
        <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-pink-400/30 dark:via-pink-500/40 to-transparent shadow-[0_0_15px_rgba(219,39,119,0.1)] dark:shadow-[0_0_15px_rgba(219,39,119,0.3)] pointer-events-none" />
      {/* Header */}
      <div className="p-4 border-b border-white/20 dark:border-white/10 bg-white/10 dark:bg-black/10 backdrop-blur-md flex items-center gap-3 shrink-0">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-700 dark:from-pink-600 dark:to-purple-800 flex items-center justify-center shadow-[0_4px_10px_rgba(219,39,119,0.2)] dark:shadow-[0_0_15px_rgba(219,39,119,0.3)] border border-pink-400/10 dark:border-pink-400/20">
          <BrainCircuit className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-neutral-900 dark:text-white text-sm flex items-center gap-1.5 tracking-tight">
            Donna AI <Sparkles className="w-3 h-3 text-pink-500 dark:text-pink-400" />
          </h3>
          <p className="text-[10px] text-neutral-500 dark:text-neutral-500 font-medium uppercase tracking-wider">Board de Expertos</p>
        </div>
        <button 
          onClick={() => setShowClearConfirm(true)}
          title="Nueva sesión"
          className="p-2 text-neutral-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/10 rounded-lg transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button 
          onClick={() => setIsOpen(false)}
          className="p-2 text-neutral-500 hover:text-pink-600 dark:hover:text-pink-400 hover:bg-pink-100 dark:hover:bg-pink-500/10 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Provider Toggle */}
      <div className="px-4 py-2 bg-white/10 dark:bg-black/10 backdrop-blur-md flex justify-center border-b border-white/20 dark:border-white/10">
        <div className="flex bg-white/50 dark:bg-black/50 p-0.5 rounded-lg border border-white/20 dark:border-white/10 w-full shadow-sm backdrop-blur-sm">
          <button
            onClick={() => setProvider('gemini')}
            className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${provider === 'gemini' ? 'bg-pink-100 text-pink-700 dark:bg-pink-600/20 dark:text-pink-400 border border-pink-200 dark:border-pink-500/20' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'}`}
          >
            GEMINI
          </button>
          <button
            onClick={() => setProvider('deepseek')}
            className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${provider === 'deepseek' ? 'bg-blue-100 text-blue-700 dark:bg-blue-600/20 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'}`}
          >
            DEEPSEEK
          </button>
        </div>
      </div>
      {provider === 'deepseek' && (
        <p className="text-[9px] text-center text-blue-600 dark:text-blue-400/80 px-2 pb-1 -mt-1 pt-1 opacity-90">
          🧠 <strong>DeepSeek R1 (Razonamiento Profundo)</strong>. Lento, pero analítico. Para superpoderes (Herramientas y Jarvis) usa <strong>Gemini</strong>.
        </p>
      )}

      {/* Messages */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-800 scroll-smooth"
      >
        {messages.map((m) => (
          <div key={m.id}>
            <div className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm transition-all shadow-sm backdrop-blur-md ${
                m.role === 'user' 
                  ? 'bg-blue-600/90 text-white rounded-tr-sm border border-blue-500/30' 
                  : 'bg-white/60 dark:bg-black/60 border border-white/40 dark:border-white/10 text-neutral-800 dark:text-neutral-100 rounded-tl-sm shadow-[0_4px_12px_rgba(0,0,0,0.05)]'
              }`}>
                {m.content === '' ? (
                  <div className="flex gap-1 py-1">
                    <div className="w-1 h-1 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1 h-1 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1 h-1 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                ) : (
                  <div className="leading-relaxed markdown-body break-words">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-bold text-pink-700 dark:text-pink-400" {...props} />,
                        em: ({node, ...props}) => <em className="italic text-neutral-700 dark:text-neutral-300" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-2 space-y-1" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-2 space-y-1" {...props} />,
                        li: ({node, ...props}) => <li className="" {...props} />,
                        a: ({node, ...props}) => <a className="text-pink-600 dark:text-pink-400 underline hover:text-pink-700 break-all" target="_blank" rel="noopener noreferrer" {...props} />,
                        pre: ({node, ...props}) => <pre className="overflow-x-auto w-full max-w-full bg-neutral-100 dark:bg-neutral-800/60 p-3 rounded-lg my-2 scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700" {...props} />,
                        code: ({node, inline, className, ...props}: any) => {
                          const isBlock = className?.includes('language-');
                          return (
                            <code 
                              className={`${isBlock ? 'bg-transparent' : 'bg-neutral-100 dark:bg-neutral-800/60 rounded px-1.5 py-0.5 break-words whitespace-pre-wrap'} text-[13px] font-mono text-neutral-800 dark:text-neutral-200 ${className || ''}`} 
                              {...props} 
                            />
                          );
                        },
                        h1: ({node, ...props}) => <h1 className="text-lg font-bold mt-4 mb-2" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-md font-bold mt-3 mb-2" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-base font-semibold mt-2 mb-1" {...props} />
                      }}
                    >
                      {stripDonnaTags(m.content)}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
            {/* 🌉 JARVIS CARD — se muestra cuando Donna activa pilot_editor */}
            {m.uiAction?.action === 'pilot_editor' && (
              <div className="mt-2 ml-1 max-w-[90%]">
                <div className="bg-gradient-to-br from-violet-950/80 to-pink-950/60 border border-pink-500/40 rounded-2xl rounded-tl-sm p-3 shadow-lg shadow-pink-500/10">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-pink-500/20 rounded-lg flex items-center justify-center">
                      <Zap className="w-3.5 h-3.5 text-pink-400" />
                    </div>
                    <span className="text-[10px] font-bold text-pink-400 uppercase tracking-widest">Modo Jarvis Activado</span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed mb-2">
                    <span className="font-semibold text-white">Idea:</span> {m.uiAction?.payload?.central_idea}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {m.uiAction?.payload?.suggested_platforms?.map(p => (
                      <span key={p} className="px-2 py-0.5 bg-pink-500/10 border border-pink-500/20 rounded-full text-[9px] text-pink-300 font-bold uppercase">{p}</span>
                    ))}
                    {m.uiAction?.payload?.target_month && (
                      <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-[9px] text-blue-300 font-bold">{m.uiAction?.payload?.target_month}</span>
                    )}
                  </div>
                  <p className="text-[9px] text-neutral-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    Abriendo Editor con contexto precargado...
                  </p>
                </div>
              </div>
            )}
            {/* 🗺️ STRATEGY MAP GENERATED CARD */}
            {m.uiAction?.action === 'generate_strategy_map' && (
              <div className="mt-2 ml-1 max-w-[90%]">
                <div className="bg-gradient-to-br from-violet-950/80 to-purple-950/60 border border-violet-500/40 rounded-2xl rounded-tl-sm p-3 shadow-lg shadow-violet-500/10 flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-violet-500/20 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                    </div>
                    <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Mapa Estratégico Extraído</span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    He estructurado conceptualmente todo el flujo conversado en bloques visuales listos para ser despachados.
                  </p>
                  <button 
                    onClick={() => {
                      if (m.uiAction?.payload?.plan) {
                         window.dispatchEvent(new CustomEvent('donna-load-strategy', { detail: m.uiAction.payload.plan }));
                      }
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95"
                  >
                    <LayoutDashboard className="w-4 h-4" /> Cargar al Canvas
                  </button>
                </div>
              </div>
            )}

            {/* ✅ TOOL RESULT CARDS — se muestran cuando Donna ejecuta herramientas de DB */}
            {m.uiAction?.toolActions?.map((ta, idx) => (
              <div key={`tool-${idx}`} className="mt-2 ml-1 max-w-[90%]">
                <div className="bg-gradient-to-br from-emerald-950/60 to-green-950/40 border border-green-500/30 rounded-2xl rounded-tl-sm p-3 shadow-lg shadow-green-500/10">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-green-400 text-xs">✓</span>
                    </div>
                    <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">
                      {ta.tool === 'create_objective' ? 'Objetivo Creado' : ta.tool === 'manage_campaign' ? ((ta.result as any)?.action === 'create' ? 'Campaña Creada' : (ta.result as any)?.action === 'delete' ? 'Campaña Archivada' : 'Campaña Actualizada') : ta.tool === 'propose_post' ? 'Borrador Guardado' : 'Acción Ejecutada'}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    {(ta.result as any)?.message || 'Ejecutado correctamente.'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Bar */}
      {error && (
        <div className="mx-4 mb-2 p-2 bg-red-950/50 border border-red-900/50 rounded-lg text-[10px] text-red-400 flex items-center justify-between">
          <span className="truncate">{error}</span>
          <button onClick={() => setError(null)}><X className="w-3 h-3" /></button>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 bg-[#f4f2ee] dark:bg-[#0a0a0a] border-t border-neutral-200 dark:border-neutral-800 relative">
        {/* Slash Commands Menu */}
        {input.startsWith('/') && (
          <div className="absolute bottom-[calc(100%-8px)] left-4 right-4 mb-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-2xl shadow-xl overflow-hidden z-10 animate-in slide-in-from-bottom-2">
            <div className="px-3 py-2 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-black/50">
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-1.5"><Zap className="w-3 h-3 text-amber-500" /> COMANDOS RÁPIDOS</span>
            </div>
            <div className="p-1 max-h-48 overflow-y-auto scrollbar-thin">
              {SLASH_COMMANDS.filter(c => c.cmd.toLowerCase().startsWith(input.toLowerCase())).map((cmd) => (
                <button
                  key={cmd.cmd}
                  onClick={() => { setInput(cmd.cmd + ' '); textareaRef.current?.focus(); }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-pink-50 dark:hover:bg-pink-500/10 flex items-center gap-2 group transition-colors"
                >
                  <span className="text-sm font-bold text-pink-600 dark:text-pink-400">{cmd.cmd}</span>
                  <span className="text-[11px] text-neutral-500 group-hover:text-neutral-700 dark:group-hover:text-neutral-300 truncate">{cmd.desc}</span>
                </button>
              ))}
              {SLASH_COMMANDS.filter(c => c.cmd.toLowerCase().startsWith(input.toLowerCase())).length === 0 && (
                <div className="px-3 py-2 text-xs text-neutral-500 text-center">No hay comandos coincidentes</div>
              )}
            </div>
          </div>
        )}

        {/* Attachments Preview (Imágenes, Videos y Links) */}
        {(attachments.length > 0 || stickyLinks.length > 0) && (
          <div className="flex flex-wrap gap-2 mb-2 p-2 bg-white/50 dark:bg-black/50 rounded-xl border border-dashed border-pink-500/30">
            {/* Visual Media (Imágenes y Videos) */}
            {attachments.map((url, i) => {
              const isVideo = url.toLowerCase().includes('.mp4') || url.toLowerCase().includes('.mov') || url.includes('donna-chat/videos');
              return (
                <div key={`media-${i}`} className="relative group w-16 h-16">
                  {isVideo ? (
                    <div className="w-full h-full bg-neutral-800 rounded-lg border border-white/20 flex flex-col items-center justify-center overflow-hidden">
                      <Play className="w-6 h-6 text-white mb-1" />
                      <span className="text-[7px] text-white/70 uppercase font-bold">Video</span>
                    </div>
                  ) : (
                    <img src={url} alt="Attachment" className="w-full h-full object-cover rounded-lg border border-white/20" />
                  )}
                  <button 
                    onClick={() => removeAttachment(i)}
                    className="absolute -top-1.5 -right-1.5 bg-red-500 text-white p-0.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
            
            {/* Links chips */}
            {stickyLinks.map((url, i) => (
              <div key={`link-${i}`} className="relative group h-16 px-3 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 flex flex-col justify-center gap-1 max-w-[120px]">
                <div className="flex items-center gap-1.5 text-pink-500">
                  <Globe className="w-3 h-3" />
                  <span className="text-[9px] font-bold uppercase tracking-tighter">Link</span>
                </div>
                <span className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate font-mono">{url.replace(/^https?:\/\//, '')}</span>
                <button 
                  onClick={() => removeLink(i)}
                  className="absolute -top-1.5 -right-1.5 bg-red-500 text-white p-0.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

            {isUploading && (
              <div className="w-16 h-16 rounded-lg border border-pink-500/20 bg-pink-500/5 flex items-center justify-center animate-pulse">
                <Loader2 className="w-4 h-4 text-pink-500 animate-spin" />
              </div>
            )}
          </div>
        )}

        {/* Input Bar */}
        <div className="relative flex items-end gap-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-2xl p-2 focus-within:border-pink-500/50 dark:focus-within:border-pink-500/50 transition-colors shadow-sm dark:shadow-inner z-20">
          <input
            type="file"
            id="donna-attachment"
            className="hidden"
            accept="image/*,video/mp4,video/quicktime"
            multiple
            onChange={handleFileUpload}
            disabled={isUploading}
          />
          <div className="flex items-center">
            <button
              onClick={() => document.getElementById('donna-attachment')?.click()}
              disabled={isUploading || isLoading}
              className={`p-2 transition-colors ${isUploading ? 'text-pink-500 animate-pulse' : 'text-neutral-500 hover:text-pink-600'}`}
              title="Adjuntar Fotos o Video (.mp4)"
            >
              {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImagePlus className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setShowLinkInput(!showLinkInput)}
              disabled={isLoading}
              className={`p-2 transition-colors ${showLinkInput ? 'text-pink-500' : 'text-neutral-500 hover:text-pink-600'}`}
              title="Añadir Link (YouTube o Artículo)"
            >
              <Link className="w-5 h-5" />
            </button>
          </div>

          {showLinkInput && (
            <div className="absolute bottom-[calc(100%+8px)] left-0 right-0 p-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-xl flex items-center gap-2 animate-in slide-in-from-bottom-2 z-30">
              <Globe className="w-4 h-4 text-pink-500 shrink-0" />
              <input 
                type="text"
                placeholder="Pega una URL..."
                className="flex-1 bg-transparent border-none outline-none text-sm dark:text-white"
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleLinkAdd();
                  }
                  if (e.key === 'Escape') setShowLinkInput(false);
                }}
                autoFocus
              />
              <button 
                onClick={handleLinkAdd}
                className="bg-pink-600 text-white px-3 py-1 rounded-full text-xs font-bold hover:bg-pink-700 transition-colors"
              >
                Añadir
              </button>
            </div>
          )}

          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage(input);
              }
            }}
            placeholder="¿Pregúntame algo, César?"
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-neutral-900 dark:text-white resize-none py-2 px-2 scrollbar-none"
          />
          
          <div className="flex items-center gap-1 pb-1">
            {isTranscribing ? (
              <Loader2 className="w-5 h-5 text-pink-500 animate-spin m-2" />
            ) : isRecording ? (
              <button 
                onClick={stopRecording}
                className="p-2 bg-red-500 text-white rounded-xl animate-pulse shadow-lg shadow-red-500/20"
              >
                <Square className="w-4 h-4 fill-current" />
              </button>
            ) : (
              <button 
                onClick={startRecording}
                disabled={isLoading}
                className="p-2 text-neutral-500 hover:text-white transition-colors"
              >
                <Mic className="w-5 h-5" />
              </button>
            )}

            <button
              onClick={() => sendMessage(input)}
              disabled={isLoading || !input.trim() || isRecording}
              className={`p-2 rounded-xl transition-all ${
                input.trim() && !isLoading && !isRecording
                  ? 'bg-pink-600 text-white'
                  : 'text-neutral-600'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
        <p className="text-[9px] text-neutral-600 text-center mt-2 font-medium">SOCI@ ESTRATÉGICO · RRSS OBJETIVO</p>
      </div>


      {/* Clear Session Confirmation Modal */}
      {showClearConfirm && (
        <div className="absolute inset-0 z-[100] bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-end justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 w-full shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center mb-4">
              <RotateCcw className="w-6 h-6 text-amber-600 dark:text-amber-500" />
            </div>
            <h3 className="font-bold text-neutral-900 dark:text-white text-lg mb-1">¿Nueva sesión con Donna?</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">El historial de este chat se borrará permanentemente de tu memoria local.</p>
            <div className="flex gap-3">
              <button 
                onClick={clearSession} 
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-white text-sm font-bold rounded-2xl transition-all shadow-lg shadow-amber-500/20 active:scale-95"
              >
                Limpiar y empezar
              </button>
              <button 
                onClick={() => setShowClearConfirm(false)} 
                className="flex-1 py-3 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm font-bold rounded-2xl hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all active:scale-95"
              >
                Ahora no
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
    </>
  );
}
