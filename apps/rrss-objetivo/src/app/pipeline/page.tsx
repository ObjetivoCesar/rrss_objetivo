'use client'

import { useState, useEffect } from 'react'
import {
  generateScript,
  saveFullPipelineAction,
  generateVideoFrames,
  getSavedPipelinesAction,
  getPipelineDetailsAction
} from './actions'
import { formatPipelineForExport } from '@/lib/pipeline/utils/export'
import { extractVoiceScript, synthesizeVoiceOff, generateMusicPrompt, generateGeminiMusic } from './voice-actions'
import { GEMINI_VOICES } from '@/lib/pipeline/audio/voices'
import type { PipelineResult, LensResult } from '@/lib/pipeline/executor'
import DashboardLayout from '@/components/layout/DashboardLayout'

export const maxDuration = 300;

// ── Types ────────────────────────────────────────────────────────────────
interface VideoStyle {
  id: string
  title: string
  prompt: string
  image: string
  category: string
}

// Pipeline phases
type PipelinePhase = 'idle' | 'generating' | 'done'

const MAX_IDEA_LENGTH = 1500

// ── Component ─────────────────────────────────────────────────────────────
export default function PipelinePage() {
  // ── Form state ──
  const [idea, setIdea] = useState('')
  const [duration, setDuration] = useState('30s')
  const [style, setStyle] = useState('retorical')
  const [llmProvider, setLlmProvider] = useState<'gemini' | 'deepseek'>('gemini')
  const [seoKeywords, setSeoKeywords] = useState('')

  // ── Pipeline orchestration state ──
  const [phase, setPhase] = useState<PipelinePhase>('idle')
  const [error, setError] = useState<string | null>(null)
  const [finalScript, setFinalScript] = useState('')
  const [isRunning, setIsRunning] = useState(false)

  // ── Result state ──
  const [result, setResult] = useState<PipelineResult | null>(null)

  // ── Visual style state ──
  const [styles, setStyles] = useState<VideoStyle[]>([])
  const [selectedStyle, setSelectedStyle] = useState<VideoStyle | null>(null)
  const [frames, setFrames] = useState<any[]>([])
  const [generatingFrames, setGeneratingFrames] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  // ── Voice & Music state ──
  const [voiceScript, setVoiceScript] = useState('')
  const [voiceProfile, setVoiceProfile] = useState('')
  const [selectedVoice, setSelectedVoice] = useState('Charon')
  const [audioBase64, setAudioBase64] = useState<string | null>(null)
  const [audioMime, setAudioMime] = useState('audio/wav')
  const [extractingVoice, setExtractingVoice] = useState(false)
  const [synthesizing, setSynthesizing] = useState(false)
  const [sunoPrompt, setSunoPrompt] = useState('')
  const [udioPrompt, setUdioPrompt] = useState('')
  const [mixNotes, setMixNotes] = useState('')
  const [generatingMusic, setGeneratingMusic] = useState(false)
  const [geminiMusicUrl, setGeminiMusicUrl] = useState<string | null>(null)
  const [generatingGeminiMusic, setGeneratingGeminiMusic] = useState(false)
  const [productionData, setProductionData] = useState<any>(null)

  // ── History state ──
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [historyItems, setHistoryItems] = useState<any[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  const [mounted, setMounted] = useState(false)
  
  const categories = ['All', '3D & Cartoon', 'Photo-realistic', 'Satirical & Art', 'Creative Pixels']

  // ── Load styles and localStorage on mount ──
  useEffect(() => {
    fetch('/video-styles/styles.json').then(r => r.json()).then(setStyles).catch(console.error)
    const savedIdea = localStorage.getItem('pipeline_idea')
    const savedDuration = localStorage.getItem('pipeline_duration')
    const savedStyle = localStorage.getItem('pipeline_style')
    if (savedIdea) setIdea(savedIdea)
    if (savedDuration) setDuration(savedDuration)
    if (savedStyle) setStyle(savedStyle)
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    localStorage.setItem('pipeline_idea', idea)
    localStorage.setItem('pipeline_duration', duration)
    localStorage.setItem('pipeline_style', style)
  }, [idea, duration, style, mounted])

  const filteredStyles = styles.filter(st => {
    const matchesCategory = selectedCategory === 'All' || st.category === selectedCategory
    const matchesSearch = st.title.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // ── Fetch History ──
  const handleOpenHistory = async () => {
    setIsHistoryOpen(true)
    if (historyItems.length === 0) {
      setLoadingHistory(true)
      const res = await getSavedPipelinesAction()
      if (res.success && res.scripts) setHistoryItems(res.scripts)
      setLoadingHistory(false)
    }
  }

  // ── Load Script from History ──
  const loadFromHistory = async (scriptId: string) => {
    setIsRunning(true)
    setError(null)
    const res = await getPipelineDetailsAction(scriptId)
    setIsRunning(false)

    if (!res.success || !res.data) {
      setError(res.error || 'No se pudo cargar el guion del historial.')
      return
    }

    const { script, lensResults: savedLenses, productionOutputs } = res.data

    setIdea(script.original_idea || '')
    setFinalScript(script.current_body)

    if (productionOutputs) {
      setFrames(productionOutputs.video_prompts || [])
      setSunoPrompt(productionOutputs.music_prompt || '')
      setVoiceScript(productionOutputs.voice_prompt || '')
    }

    setResult({
      scriptId: script.id,
      finalScript: script.current_body,
      currentVersion: script.version,
      scriptOptions: [script.current_body],
      versions: [{ version: script.version, body: script.current_body, triggeredBy: 'restored_from_history' }],
      lensResults: savedLenses,
      productionPrompts: {
        videoPrompts: productionOutputs?.video_prompts || [],
        voicePrompt: productionOutputs?.voice_prompt || '',
        musicPrompt: productionOutputs?.music_prompt || '',
        tokensUsed: 0
      }
    })

    setPhase('done')
    setIsHistoryOpen(false)
  }

  // ── STEP 1: Generate draft ──
  const handleGenerateScript = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!idea.trim() || idea.length > MAX_IDEA_LENGTH) return

    setIsRunning(true)
    setError(null)
    setPhase('generating')
    
    setFinalScript('')
    setResult(null)
    setFrames([])
    setSelectedStyle(null)
    setVoiceScript('')
    setAudioBase64(null)

    const res = await generateScript(idea, { duration, style })
    setIsRunning(false)

    if (!res.success || !res.data) {
      setError(res.error || 'Error generando el guion.')
      setPhase('idle')
      return
    }

    setResult(res.data)
    setFinalScript(res.data.finalScript)
    if (res.data.productionPrompts) {
      setProductionData(res.data.productionPrompts)
    }
    setPhase('done')
  }

  // ── Save / Export ──
  const handleSaveAll = async () => {
    if (!result || !idea) return
    setIsRunning(true)

    const updatedResult = {
      ...result,
      finalScript: result.finalScript,
      productionPrompts: productionData || result.productionPrompts
    }

    const res = await saveFullPipelineAction(idea, updatedResult, {
      frames: frames.length > 0 ? frames : undefined,
      voicePrompt: voiceScript || undefined,
      musicPrompt: sunoPrompt || undefined
    })

    setIsRunning(false)
    if (!res.success) setError(res?.error || 'Error al guardar.')
    else alert('¡Guardado completo en base de datos! ✅')
  }

  const handleExport = () => {
    if (!result || !idea) return
    const content = formatPipelineForExport(idea, result, {
      frames: frames.length > 0 ? frames : undefined,
      voiceScript: voiceScript || undefined,
      sunoPrompt: sunoPrompt || undefined
    })
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `guion-produccion-${Date.now()}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleGenerateFrames = async () => {
    if (!selectedStyle) return
    const scriptToUse = finalScript
    if (!scriptToUse?.trim()) { setError('No hay guion disponible.'); return }
    setError(null); setGeneratingFrames(true)
    const res = await generateVideoFrames(scriptToUse, selectedStyle.prompt)
    if (res.success) setFrames(res.data || [])
    else setError(res.error || 'Error al generar escenas.')
    setGeneratingFrames(false)
  }

  const handleExtractVoice = async () => {
    const script = finalScript
    if (!script) return
    setExtractingVoice(true); setError(null)
    const res = await extractVoiceScript(script, duration)
    if (res.success) { setVoiceScript(res.voiceScript || ''); setVoiceProfile(res.voiceProfile || ''); setAudioBase64(null) }
    else setError(res.error || 'Error al extraer narración.')
    setExtractingVoice(false)
  }

  const handleSynthesizeVoice = async () => {
    if (!voiceScript) return
    setSynthesizing(true); setError(null)
    const res = await synthesizeVoiceOff(voiceScript, selectedVoice)
    if (res.success) { setAudioBase64(res.audioBase64 || null); setAudioMime(res.mimeType || 'audio/wav') }
    else setError(res.error || 'Error al generar audio.')
    setSynthesizing(false)
  }

  const handleGenerateMusicPrompt = async () => {
    const musicBrief = productionData?.musicPrompt || result?.productionPrompts?.musicPrompt
    if (!musicBrief) { setError('No hay brief musical. Orquesta el guion primero.'); return }
    setGeneratingMusic(true); setError(null)
    const res = await generateMusicPrompt(musicBrief, duration)
    if (res.success) { setSunoPrompt(res.sunoPrompt || ''); setUdioPrompt(res.udioPrompt || ''); setMixNotes(res.mixNotes || '') }
    else setError(res.error || 'Error generando prompt de música.')
    setGeneratingMusic(false)
  }

  const handleGenerateGeminiMusic = async () => {
    const musicBrief = productionData?.musicPrompt || result?.productionPrompts?.musicPrompt
    if (!musicBrief) { setError('No hay brief musical.'); return }
    setGeneratingGeminiMusic(true); setError(null)
    try {
      const res = await generateGeminiMusic(musicBrief)
      if (res.success && res.audioBase64) setGeminiMusicUrl(`data:audio/wav;base64,${res.audioBase64}`)
      else setError(res.error || 'Error al generar música.')
    } catch (err: any) { setError(err.message) }
    setGeneratingGeminiMusic(false)
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <div className="min-h-screen">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-950/60 border border-violet-800/40 text-violet-400 text-xs font-semibold tracking-widest uppercase mb-2">
              ActivaQR.com
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-2">
              Expert Lens <span className="text-violet-500">Pipeline™</span>
            </h1>
            <p className="text-neutral-400 max-w-2xl text-sm leading-relaxed">
              Sistema avanzado de orquestación de videos. <span className="text-violet-400 font-semibold">Modo Director</span> — Debate de 7 IA expertos para crear el guion perfecto de tu próximo reel.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenHistory}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                isHistoryOpen 
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20" 
                  : "bg-neutral-900 text-neutral-400 border border-neutral-800 hover:border-neutral-700 hover:text-white"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Historial
            </button>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/40 text-red-400 text-sm flex items-start gap-3 mb-6">
            <span className="text-lg">⚠️</span>
            <div>
              <p className="font-bold mb-1">Error en el pipeline</p>
              <p>{error}</p>
              <button onClick={() => setError(null)} className="mt-2 text-xs text-red-300 hover:text-white underline">Cerrar</button>
            </div>
          </div>
        )}

        {/* Content Tabs/Sections */}
        <div className="space-y-8">
          {/* STEP 1: Idea Form */}
          <section className="bg-neutral-900/40 backdrop-blur border border-neutral-800/60 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-5">
              <span className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center text-xs font-bold text-white">1</span>
              <h2 className="text-lg font-bold text-white">Tu idea estratégica</h2>
            </div>

            <form onSubmit={handleGenerateScript} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Duración</label>
                  <select value={duration} onChange={(e) => setDuration(e.target.value)} disabled={isRunning}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white focus:border-violet-500 outline-none transition-colors">
                    <option value="15s">15 seg — Viral</option>
                    <option value="30s">30 seg — Promocional</option>
                    <option value="60s">60 seg — Educativo</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Estructura</label>
                  <select value={style} onChange={(e) => setStyle(e.target.value)} disabled={isRunning}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white focus:border-violet-500 outline-none transition-colors">
                    <option value="retorical">Retórica Clásica</option>
                    <option value="cta_disimulado">Soft Sell (CTA Disimulado)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Motor AI</label>
                  <select value={llmProvider} onChange={(e) => setLlmProvider(e.target.value as any)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white focus:border-violet-500 outline-none transition-colors">
                    <option value="gemini">Gemini 2.0 Flash</option>
                    <option value="deepseek">DeepSeek Reasoner</option>
                  </select>
                </div>
              </div>

              <textarea
                rows={4} value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="Describe tu idea para el video..."
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:border-violet-500 outline-none transition-colors resize-none"
              />

              <button type="submit" disabled={isRunning || !idea.trim()}
                className="w-full py-3 rounded-xl font-bold text-sm bg-violet-600 hover:bg-violet-500 text-white transition-all shadow-lg shadow-violet-600/20 disabled:opacity-50">
                {isRunning ? 'Procesando con Debate de Expertos...' : '🚀 Generar Guion de Alta Conversión'}
              </button>
            </form>
          </section>

          {/* STEP 2: Results */}
          {finalScript && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-4">
              {/* Script Column */}
              <div className="lg:col-span-12 space-y-6">
                <section className="bg-neutral-900/40 border border-neutral-800/60 rounded-2xl p-6 shadow-xl">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-pink-600 flex items-center justify-center text-xs font-bold text-white">2</span>
                      <h2 className="text-lg font-bold text-white">Guion Final Optimizado</h2>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleSaveAll} className="px-3 py-1.5 bg-emerald-600/20 text-emerald-400 text-xs font-bold rounded-lg border border-emerald-600/30">Guardar</button>
                      <button onClick={handleExport} className="px-3 py-1.5 bg-neutral-800 text-neutral-400 text-xs font-bold rounded-lg border border-neutral-700">Exportar</button>
                    </div>
                  </div>
                  <pre className="whitespace-pre-wrap text-sm text-neutral-300 bg-black/40 border border-neutral-800 p-5 rounded-xl font-mono leading-relaxed max-h-[600px] overflow-y-auto">
                    {finalScript}
                  </pre>
                </section>
              </div>

              {/* Assets Section */}
              <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Visual Style */}
                <section className="bg-neutral-900/40 border border-neutral-800/60 rounded-2xl p-6 shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold flex items-center gap-2 text-white">🎬 Estilo Visual</h3>
                    <div className="relative w-48">
                      <input
                        type="text"
                        placeholder="Buscar estilo..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:border-violet-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* Category Tabs */}
                  <div className="flex gap-2 overflow-x-auto pb-4 mb-2 scrollbar-hide">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap transition-all ${
                          selectedCategory === cat
                            ? 'bg-violet-600 text-white shadow-md shadow-violet-600/20'
                            : 'bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-4 gap-2 mb-4 max-h-48 overflow-y-auto pr-1">
                    {filteredStyles.slice(0, 12).map(st => (
                      <button key={st.id} onClick={() => setSelectedStyle(st)}
                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${selectedStyle?.id === st.id ? 'border-violet-500' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                        <img src={st.image} className="w-full h-full object-cover" alt="" title={st.title} />
                      </button>
                    ))}
                  </div>
                  <button onClick={handleGenerateFrames} disabled={generatingFrames || !selectedStyle}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50">
                    {generatingFrames ? 'Generando Escenas...' : 'Crear Secuencia Visual'}
                  </button>
                </section>

                {/* Voice Section */}
                <section className="bg-neutral-900/40 border border-neutral-800/60 rounded-2xl p-6 shadow-xl">
                  <h3 className="font-bold flex items-center gap-2 mb-4 text-white">🔊 Narración (AI Voice)</h3>
                  <div className="space-y-3">
                    <button onClick={handleExtractVoice} disabled={extractingVoice}
                            className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold rounded-xl border border-neutral-700 transition-colors disabled:opacity-50">
                      {extractingVoice ? 'Analizando script...' : 'Extraer Voz en Off'}
                    </button>
                    {voiceScript && (
                      <div className="space-y-3 mt-4 p-4 bg-black/30 rounded-xl border border-neutral-800/50">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] uppercase font-bold text-neutral-500">Texto a narrar</label>
                          <span className="text-[10px] text-violet-400 font-medium">{voiceProfile}</span>
                        </div>
                        <textarea
                          rows={3}
                          value={voiceScript}
                          onChange={(e) => setVoiceScript(e.target.value)}
                          className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:border-violet-500 outline-none resize-none"
                        />
                        <div className="flex items-end gap-2">
                          <div className="flex-1">
                            <label className="text-[10px] uppercase font-bold text-neutral-500 mb-1 block">Actor de Voz</label>
                            <select value={selectedVoice} onChange={(e) => setSelectedVoice(e.target.value)}
                              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-2 py-2 text-xs text-white outline-none">
                              {GEMINI_VOICES.map(v => <option key={v.id} value={v.id}>{v.label} ({v.gender})</option>)}
                            </select>
                          </div>
                          <button onClick={handleSynthesizeVoice} disabled={synthesizing || !voiceScript.trim()}
                            className="py-2 px-4 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50">
                            {synthesizing ? 'Generando...' : 'Sintetizar'}
                          </button>
                        </div>
                      </div>
                    )}
                    {audioBase64 && <audio src={`data:${audioMime};base64,${audioBase64}`} controls className="w-full h-8 mt-2 opacity-90" />}
                  </div>
                </section>

                {/* Music & SFX Section */}
                <section className="bg-neutral-900/40 border border-neutral-800/60 rounded-2xl p-6 shadow-xl lg:col-span-2">
                  <h3 className="font-bold flex items-center gap-2 mb-4 text-white">🎵 Soundtrack & SFX</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <button onClick={handleGenerateMusicPrompt} disabled={generatingMusic}
                        className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold rounded-xl border border-neutral-700 transition-colors disabled:opacity-50 mb-4">
                        {generatingMusic ? 'Diseñando Audio...' : 'Generar Prompts Musicales'}
                      </button>
                      
                      {sunoPrompt && (
                        <div className="space-y-3">
                          <div>
                            <label className="text-[10px] uppercase font-bold text-neutral-500 flex justify-between">
                              Prompt para Suno v3.5
                              <button onClick={() => navigator.clipboard.writeText(sunoPrompt)} className="text-violet-400 hover:text-white">Copiar</button>
                            </label>
                            <p className="p-3 bg-black/40 border border-neutral-800 rounded-lg text-xs text-neutral-300 font-mono mt-1">{sunoPrompt}</p>
                          </div>
                          {mixNotes && (
                            <div>
                              <label className="text-[10px] uppercase font-bold text-neutral-500 flex justify-between">
                                SFX & Mix Notes
                                <button onClick={() => navigator.clipboard.writeText(mixNotes)} className="text-violet-400 hover:text-white">Copiar</button>
                              </label>
                              <p className="p-3 bg-black/40 border border-neutral-800 rounded-lg text-xs text-amber-200/80 font-mono mt-1">{mixNotes}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Gemini Experimental Native Music */}
                    <div className="bg-gradient-to-br from-violet-900/20 to-fuchsia-900/10 border border-violet-800/30 rounded-xl p-4 flex flex-col items-center justify-center text-center space-y-4">
                      <div className="w-12 h-12 rounded-full bg-violet-900/50 flex items-center justify-center mb-2">
                        <span className="text-xl">✨</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white mb-1">Gemini Audio (Experimental)</h4>
                        <p className="text-[10px] text-neutral-400 mb-4 px-4">Genera pistas musicales nativas directamente desde el prompt creativo usando Gemini 1.5 Pro</p>
                      </div>
                      
                      <button 
                        onClick={handleGenerateGeminiMusic} 
                        disabled={generatingGeminiMusic || !result?.productionPrompts?.musicPrompt}
                        className="w-full py-2 bg-gradient-to-r from-violet-600 space-x-2 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-violet-500/20 transition-all disabled:opacity-50"
                      >
                        {generatingGeminiMusic ? 'Componiendo Track...' : 'Generar Track con Gemini'}
                      </button>
                      
                      {geminiMusicUrl && (
                        <div className="w-full mt-2 animate-in fade-in zoom-in duration-300">
                          <audio src={geminiMusicUrl} controls className="w-full h-8 opacity-90" />
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* History Sidebar */}
      {isHistoryOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsHistoryOpen(false)} />
          <div className="relative w-full max-w-sm bg-neutral-900 h-full border-l border-neutral-800 p-6 shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Mis Guiones</h2>
              <button onClick={() => setIsHistoryOpen(false)} className="text-neutral-500 hover:text-white">✕</button>
            </div>
            {loadingHistory ? (
              <p className="text-neutral-500 text-center py-8 text-sm">Cargando historial...</p>
            ) : (
              <div className="space-y-3">
                {historyItems.map(item => (
                  <button key={item.id} onClick={() => loadFromHistory(item.id)}
                    className="w-full text-left p-4 rounded-xl bg-neutral-950/50 border border-neutral-800 hover:border-violet-500/50 transition-all">
                    <p className="font-bold text-sm text-neutral-200 truncate">{item.title}</p>
                    <p className="text-[10px] text-neutral-500 mt-1">{new Date(item.created_at).toLocaleDateString()}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
