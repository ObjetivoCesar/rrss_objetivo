/**
 * ═══════════════════════════════════════════════════════════
 * COMPARACIÓN: Brainstorm Único (DeepSeek Reasoner) vs Pipeline Completo
 * ═══════════════════════════════════════════════════════════
 *
 * Ejecutar:
 *   npx tsx scripts/test-brainstorm.ts
 *
 * Genera dos archivos de salida:
 *   scripts/output-brainstorm.md   → Resultado del nuevo prompt (1 llamada)
 *   scripts/output-pipeline.md     → Resultado del pipeline clásico (multi-call)
 */

import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

// Usar la infraestructura del proyecto
import { loadPrompt } from '@/lib/prompts/loader'
import { runBrainstormPipeline } from '@/lib/pipeline/executor'

// ─── IDEA DE PRUEBA ────────────────────────────────────────────────────────────
const IDEA = `
Quiero un video para vender mis asesorías de embudos automáticos. 
Quiero decirles a los coaches y consultores que no necesitan estar bailando
en TikTok ni haciendo trends vacíos para conseguir clientes, que la clave
es tener un embudo automatizado que trabaje 24/7.
`.trim()

const DURACION = '45 segundos'
const ESTILO   = 'cta_disimulado'

// ─── Helpers de output ─────────────────────────────────────────────────────────
function saveOutput(filename: string, content: string) {
    const outputPath = path.join(process.cwd(), 'scripts', filename)
    fs.writeFileSync(outputPath, content, 'utf-8')
    console.log(`\n📄 Guardado en: scripts/${filename}`)
}

function banner(title: string) {
    const line = '═'.repeat(60)
    console.log(`\n╔${line}╗`)
    console.log(`║  ${title.padEnd(58)}║`)
    console.log(`╚${line}╝\n`)
}

// ─── TEST 1: Brainstorm con DeepSeek Reasoner (1 sola llamada) ────────────────
async function runBrainstormTest(): Promise<{ content: string, tokens: number, elapsed: string }> {
    banner('TEST 1 — Brainstorm (1 llamada DeepSeek Reasoner)')

    // Forzar deepseek-reasoner para este test
    const originalModel = process.env.DEEPSEEK_MODEL
    process.env.DEEPSEEK_MODEL = 'deepseek-reasoner'

    const { getLLMProvider } = await import('@/lib/llm/provider')
    const adn              = loadPrompt('adn-activaqr')
    const brainstormPrompt = loadPrompt('draft-brainstorm')

    const userMessage = [
        brainstormPrompt,
        '',
        '---',
        '## PARÁMETROS DEL USUARIO',
        `**IDEA:** ${IDEA}`,
        `**DURACIÓN OBJETIVO:** ${DURACION}`,
        `**ESTILO:** ${ESTILO}`,
        '---',
    ].join('\n')

    console.log('🤔 DeepSeek Reasoner procesando (razonamiento profundo)...')
    const start = Date.now()

    const llm = getLLMProvider('deepseek')
    const response = await llm.complete({
        system: adn,
        messages: [{ role: 'user', content: userMessage }],
        modelLevel: 'advanced',
    })

    const elapsed = ((Date.now() - start) / 1000).toFixed(1)
    process.env.DEEPSEEK_MODEL = originalModel  // restaurar

    console.log(`✅ Completado en ${elapsed}s | Tokens: ${response.tokensUsed}`)
    return { content: response.content, tokens: response.tokensUsed, elapsed }
}

// ─── TEST 2: Pipeline Clásico con DeepSeek Chat ────────────────────────────────
async function runPipelineTest(): Promise<{ result: any, elapsed: string }> {
    banner('TEST 2 — Pipeline Clásico (Multi-llamada DeepSeek Chat)')

    // Asegurar deepseek-chat para el pipeline (más rápido para 7+ llamadas)
    process.env.DEEPSEEK_MODEL = 'deepseek-chat'
    process.env.LLM_PROVIDER   = 'deepseek'

    console.log('⚙️  Ejecutando el pipeline completo...')
    const start = Date.now()

    const result = await runPipeline({
        scriptId: `test-comparacion-dental-${Date.now()}`,
        idea: IDEA,
        duration: DURACION,
        style: ESTILO,
    })

    const elapsed = ((Date.now() - start) / 1000).toFixed(1)
    console.log(`✅ Pipeline completado en ${elapsed}s`)

    return { result, elapsed }
}

// ─── MAIN ──────────────────────────────────────────────────────────────────────
async function main() {
    console.log('\n🦷  IDEA: Consultorio dental — WiFi como captación de contactos')
    console.log(`📋  Duración: ${DURACION} | Estilo: ${ESTILO}`)
    console.log(`\n⚠️  Ejecutando TEST 1 primero — luego TEST 2 (el pipeline es más lento)\n`)

    // ── TEST 1: Brainstorm ──
    let brainstormContent = ''
    let brainstormTokens  = 0
    let brainstormElapsed = '?'

    try {
        const r1 = await runBrainstormTest()
        brainstormContent = r1.content
        brainstormTokens  = r1.tokens
        brainstormElapsed = r1.elapsed
    } catch (err: any) {
        console.error('❌ Error en Brainstorm:', err.message)
        brainstormContent = `ERROR: ${err.message}`
    }

    saveOutput('output-brainstorm.md', [
        `# 🏆 Resultado: Brainstorm Único (DeepSeek Reasoner)`,
        `**Fecha:** ${new Date().toISOString()}`,
        `**Tiempo:** ${brainstormElapsed}s | **Tokens:** ${brainstormTokens}`,
        `**Modelo:** deepseek-reasoner (1 sola llamada)`,
        '',
        '---',
        '',
        brainstormContent,
    ].join('\n'))

    // ── TEST 2: Pipeline ──
    let pipelineContent = ''
    let pipelineElapsed = '?'

    try {
        const r2 = await runPipelineTest()
        pipelineElapsed = r2.elapsed

        const lensReport = r2.result.lensResults.map((l: any, i: number) =>
            `### [${i + 1}] ${l.lens.toUpperCase()} — ${l.verdict.toUpperCase()}\n${l.feedback.substring(0, 400)}...`
        ).join('\n\n')

        const variantsSection = r2.result.scriptOptions?.map((v: string, i: number) =>
            `## Variante ${['Clásica', 'Conversión', 'Narrativa'][i] ?? i + 1}\n\n${v}`
        ).join('\n\n---\n\n') ?? ''

        pipelineContent = [
            `# ⚙️ Resultado: Pipeline Clásico (DeepSeek Chat, múltiples llamadas)`,
            `**Fecha:** ${new Date().toISOString()}`,
            `**Tiempo Total:** ${pipelineElapsed}s`,
            `**Versiones generadas:** ${r2.result.versions.length}`,
            '',
            '---',
            '',
            '## Guion Final (Variante Clásica ganadora)',
            '',
            r2.result.finalScript,
            '',
            '---',
            '',
            '## Las 3 Variantes Generadas (Las 3 Bombas)',
            '',
            variantsSection,
            '',
            '---',
            '',
            '## Reporte del Panel de Expertos',
            '',
            lensReport,
        ].join('\n')

    } catch (err: any) {
        console.error('❌ Error en Pipeline:', err.message)
        pipelineContent = `ERROR: ${err.message}`
    }

    saveOutput('output-pipeline.md', pipelineContent)

    // ── Resumen final ──
    banner('COMPARACIÓN COMPLETADA')
    console.log(`📊 Brainstorm (Reasoner): ${brainstormElapsed}s | ${brainstormTokens} tokens (1 llamada)`)
    console.log(`📊 Pipeline (Chat):       ${pipelineElapsed}s (8+ llamadas secuenciales)`)
    console.log('\n📂 Revisa los archivos generados:')
    console.log('   → scripts/output-brainstorm.md')
    console.log('   → scripts/output-pipeline.md\n')
}

main().catch(err => {
    console.error('\n💥 Error fatal:', err)
    process.exit(1)
})
