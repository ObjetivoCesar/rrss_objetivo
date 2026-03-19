import { getLLMProvider } from '@/lib/llm/provider'
import { loadPrompt } from '@/lib/prompts/loader'
import { LENS_ORDER, LENSES, type LensType } from './lenses'

import { ChecklistResult } from './checklist'
import { ProductionPackage } from './production-prompts'
import { generateVisualOpening, SuggestedVisualOpening, ContentStyle, VISUAL_HOOKS } from './visual-hooks'

export interface LensResult {
    lens: string
    verdict: 'green' | 'yellow' | 'red'
    feedback: string
    tokensUsed: number
}

export interface PipelineResult {
    scriptId: string
    versions: Array<{ version: number; body: string; triggeredBy: string }>
    lensResults: LensResult[]
    finalScript: string
    currentVersion: number
    scriptOptions?: string[] // Las 3 bombas: Clásica, Conversión, Narrativa
    checklistResults?: ChecklistResult
    productionPrompts?: ProductionPackage
    visualHook?: SuggestedVisualOpening
}


export interface RunPipelineOptions {
    scriptId: string
    idea: string
    duration: string
    style: string
    startFromScript?: string
    startVersion?: number
}

/**
 * Ejecuta el pipeline Brainstorm (1 sola llamada con DeepSeek Reasoner).
 */
export async function runBrainstormPipeline(options: RunPipelineOptions): Promise<PipelineResult> {
    const { scriptId, idea, duration, style } = options

    const originalModel = process.env.DEEPSEEK_MODEL
    process.env.DEEPSEEK_MODEL = 'deepseek-reasoner'

    const adn = loadPrompt('adn-activaqr')
    const brainstormPrompt = loadPrompt('draft-brainstorm')

    const userMessage = [
        brainstormPrompt,
        '',
        '---',
        '## PARÁMETROS DEL USUARIO',
        `**IDEA:** ${idea}`,
        `**DURACIÓN OBJETIVO:** ${duration}`,
        `**ESTILO:** ${style}`,
        '---',
    ].join('\n')

    console.log(`[PIPELINE] Ejecutando Brainstorm Reasoner para: ${idea.substring(0, 30)}...`)
    const start = Date.now()

    const llm = getLLMProvider('deepseek')
    let response: any
    try {
        response = await llm.complete({
            system: adn,
            messages: [{ role: 'user', content: userMessage }],
            modelLevel: 'advanced',
        })
    } finally {
        process.env.DEEPSEEK_MODEL = originalModel // restaurar
    }

    const elapsed = ((Date.now() - start) / 1000).toFixed(1)
    console.log(`[PIPELINE] ✅ Brainstorm completado en ${elapsed}s | Tokens: ${response.tokensUsed}`)

    const finalScript = extractUpdatedScript(response.content, response.content)

    // ── Generar Prompts de Producción ──
    console.log(`[PIPELINE] Generando prompts de producción...`)
    const { generateProductionPrompts } = await import('./production-prompts')
    const productionPrompts = await generateProductionPrompts(finalScript)

    // ── Sugerir Hook Visual ──
    console.log(`[PIPELINE] Sugiriendo Hook Visual...`)
    const styleLower = style.toLowerCase()
    let mappedStyle: ContentStyle = 'vlog'
    if (styleLower.includes('educa') || styleLower.includes('enseña') || styleLower.includes('disimulado')) mappedStyle = 'educativo'
    else if (styleLower.includes('historia') || styleLower.includes('story')) mappedStyle = 'storytelling'
    else if (styleLower.includes('tuto') || styleLower.includes('paso')) mappedStyle = 'tutorial'
    else if (styleLower.includes('opini') || styleLower.includes('reac')) mappedStyle = 'opinion'
    else if (styleLower.includes('emo') || styleLower.includes('inspi')) mappedStyle = 'emocional'
    else if (styleLower.includes('tec') || styleLower.includes('pro')) mappedStyle = 'tecnico'

    const visualHook = generateVisualOpening(mappedStyle)

    return {
        scriptId,
        versions: [{ version: 1, body: finalScript, triggeredBy: 'brainstorm_reasoner' }],
        lensResults: [{
            lens: 'brainstorm_reasoner',
            verdict: 'green',
            feedback: `Generado con DeepSeek Reasoner en ${elapsed}s`,
            tokensUsed: response.tokensUsed
        }],
        finalScript,
        currentVersion: 1,
        scriptOptions: [finalScript], // Solo hay una bomba ganadora en brainstorm
        productionPrompts,
        visualHook
    }
}


export async function runOrchestratorPass(
    v0Script: string,
    expertCritiques: LensResult[],
    direction: 'classic' | 'conversion' | 'storytelling' = 'classic',
    preferredProvider?: string
): Promise<{
    updatedScript: string,
    verdict: 'green' | 'yellow' | 'red',
    feedback: string,
    tokensUsed: number
}> {
    const rawAdn = loadPrompt('adn-activaqr')
    const rawOrchPrompt = loadPrompt('lens-orchestrator')

    // FIX: Reemplazar placeholder del ADN
    const orchestratorPrompt = rawOrchPrompt.replace('[INSERCIÓN DEL ADN DE LA EMPRESA]', rawAdn)

    const directionInstructions = {
        classic: "DIRECCIÓN: Fiel al ADN puro y elegancia de la marca.",
        conversion: "DIRECCIÓN: High-Conversion. Enfócate en ganchos agresivos, escasez y neuroventas.",
        storytelling: "DIRECCIÓN: Narrativa emocional. Enfócate en la historia del usuario y conexión humana."
    }

    const critiquesText = expertCritiques
        .map(c => `EXPERT: ${c.lens.toUpperCase()}\nVERDICT: ${c.verdict}\nSUGGESTIONS: ${c.feedback}`)
        .join('\n\n---\n\n')

    const executeCall = async (providerName?: string) => {
        const llm = getLLMProvider(providerName)
        return await llm.complete({
            system: rawAdn,
            messages: [
                {
                    role: 'user',
                    content: [
                        orchestratorPrompt,
                        directionInstructions[direction],
                        '---',
                        'GUION BORRADOR (v0):',
                        v0Script,
                        '---',
                        'CRÍTICAS DEL PANEL DE EXPERTOS:',
                        critiquesText
                    ].join('\n\n'),
                },
            ],
            modelLevel: 'advanced',
        })
    }

    try {
        const response = await executeCall(preferredProvider)
        return {
            updatedScript: extractUpdatedScript(response.content, v0Script),
            verdict: extractVerdict(response.content),
            feedback: response.content,
            tokensUsed: response.tokensUsed,
        }
    } catch (error: any) {
        const isQuotaError = error.message.includes('429') || error.message.includes('quota')
        if ((preferredProvider || 'gemini') === 'gemini' && isQuotaError) {
            const response = await executeCall('deepseek')
            return {
                updatedScript: extractUpdatedScript(response.content, v0Script),
                verdict: extractVerdict(response.content),
                feedback: response.content,
                tokensUsed: response.tokensUsed,
            }
        }
        throw error
    }
}

export async function generateInitialDraft(options: {
    idea: string,
    duration: string,
    style: string,
    preferredProvider?: string
}): Promise<string> {
    const { idea, duration, style, preferredProvider } = options
    const adn = loadPrompt('adn-activaqr')
    const draftPrompt = loadPrompt('draft-initial')

    const executeCall = async (providerName?: string) => {
        const llm = getLLMProvider(providerName)
        return await llm.complete({
            system: adn,
            messages: [
                {
                    role: 'user',
                    content: `${draftPrompt}\n\n---\nIDEA DEL USUARIO: ${idea}\nDURACIÓN OBJETIVO: ${duration}\nESTILO REQUERIDO: ${style}`,
                },
            ],
            modelLevel: 'standard',
        })
    }

    try {
        console.log(`[PIPELINE] Generando borrador inicial (${preferredProvider || 'default'})...`)
        const response = await executeCall(preferredProvider)
        return response.content
    } catch (error: any) {
        const isQuotaError = error.message.includes('429') ||
            error.message.includes('quota') ||
            error.message.includes('RESOURCE_EXHAUSTED')

        // Fallback si el proveedor actual es gemini y falló por cuota
        const currentProvider = preferredProvider || process.env.LLM_PROVIDER || 'gemini'
        if (currentProvider === 'gemini' && isQuotaError) {
            console.warn(`[PIPELINE] Gemini quota hit. Falling back to DeepSeek for initial draft...`)
            const fallbackResponse = await executeCall('deepseek')
            return fallbackResponse.content
        }
        throw error
    }
}

/**
 * Aplica un lente específico a un guion existente.
 */
export async function runLensPass(
    lensId: LensType,
    currentScript: string,
    preferredProvider?: string,
    context?: string
): Promise<{
    updatedScript: string,
    verdict: 'green' | 'yellow' | 'red',
    feedback: string,
    tokensUsed: number
}> {
    const adn = loadPrompt('adn-activaqr')
    const lensConfig = LENSES[lensId]
    const lensPrompt = loadPrompt(lensConfig.promptFile)

    const executeCall = async (providerName?: string) => {
        const llm = getLLMProvider(providerName)
        return await llm.complete({
            system: adn,
            messages: [
                {
                    role: 'user',
                    content: [
                        lensPrompt,
                        '---',
                        context ? `CONTEXTO ADICIONAL DEL DIRECTOR:\n${context}\n---` : '',
                        'GUION ACTUAL (versión a evaluar):',
                        currentScript,
                    ].filter(Boolean).join('\n\n'),
                },
            ],
            modelLevel: lensConfig.modelLevel || 'advanced',
        })
    }

    try {
        console.log(`[PIPELINE] Aplicando lente: ${lensId.toUpperCase()} (${preferredProvider || 'default'})...`)
        const response = await executeCall(preferredProvider)
        const verdict = extractVerdict(response.content)
        const updatedScript = lensConfig.mutatesScript
            ? extractUpdatedScript(response.content, currentScript)
            : currentScript

        return {
            updatedScript,
            verdict,
            feedback: response.content,
            tokensUsed: response.tokensUsed,
        }
    } catch (error: any) {
        const isQuotaError = error.message.includes('429') ||
            error.message.includes('quota') ||
            error.message.includes('RESOURCE_EXHAUSTED')

        const currentProvider = preferredProvider || process.env.LLM_PROVIDER || 'gemini'
        if (currentProvider === 'gemini' && isQuotaError) {
            console.warn(`[PIPELINE] Gemini quota hit. Falling back to DeepSeek for lens ${lensId}...`)
            const response = await executeCall('deepseek')
            const verdict = extractVerdict(response.content)
            const updatedScript = lensConfig.mutatesScript
                ? extractUpdatedScript(response.content, currentScript)
                : currentScript

            return {
                updatedScript,
                verdict,
                feedback: response.content,
                tokensUsed: response.tokensUsed,
            }
        }
        throw error
    }
}

// ── Helpers ──────────────────────────────────────────────────────────────

export function extractVerdict(output: string): 'green' | 'yellow' | 'red' {
    const lower = output.toLowerCase()
    if (lower.includes('veredicto: verde') || lower.includes('verdict: green')) return 'green'
    if (lower.includes('veredicto: rojo') || lower.includes('verdict: red')) return 'red'
    return 'yellow'
}

/**
 * Extrae el guion actualizado del output del lente.
 * Usa múltiples estrategias para manejar variaciones de formato entre Gemini y DeepSeek.
 */
export function extractUpdatedScript(output: string, fallback: string): string {
    // Strategy 1: preferred format with exact delimiters (flexible CRLF)
    const m1 = output.match(/---\s*GUION ACTUALIZADO\s*---\s*[\r\n]+([\s\S]*?)[\r\n]+---\s*FIN GUION\s*---/i)
    if (m1) return m1[1].trim()

    // Strategy 2: legacy orchestrator format "GUION FINAL:\n...\n---"
    const m2 = output.match(/GUION FINAL:\s*[\r\n]+([\s\S]*?)(?:[\r\n]+---|\s*$)/i)
    if (m2 && m2[1].trim().length > 50) return m2[1].trim()

    // Strategy 3: raw output has script markers, strip editorial notes
    if (/\[VOZ|\[PANTALLA|\[TEXTO/i.test(output)) {
        const notasIdx = output.search(/NOTAS DE EDICI[ÓO]N/i)
        return notasIdx > 0 ? output.substring(0, notasIdx).trim() : output.trim()
    }

    return fallback
}
