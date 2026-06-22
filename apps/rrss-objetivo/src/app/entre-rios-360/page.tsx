'use client';

import { Metadata } from "next";
import { 
  ChevronRight, 
  BarChart3, 
  Clock, 
  Users, 
  TrendingUp, 
  Zap, 
  ShieldCheck, 
  ArrowRight, 
  Cpu, 
  Smartphone, 
  Globe, 
  PlayCircle, 
  Lock 
} from "lucide-react";

// Remuevo el objeto metadata estático ya que en Client Components de Next.js se debe usar de forma dinámica o omitir si no es crítico, para evitar errores de compilación.


const EntreRios360 = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-montserrat selection:bg-yellow-500/30 selection:text-yellow-200 overflow-x-hidden">
      {/* --- CINEMATIC OVERLAY (Surveillance Effect) --- */}
      <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      <div className="fixed inset-0 pointer-events-none z-[101] bg-gradient-to-b from-transparent via-black/20 to-transparent h-2 animate-scanline" />

      {/* --- STICKY NAV --- */}
      <nav className="fixed top-0 left-0 right-0 z-[90] p-6 flex justify-between items-center backdrop-blur-md bg-black/20 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center font-black text-black text-xs">ER</div>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-50">Objetivo</span>
        </div>
        <a 
          href="#propuesta" 
          className="px-5 py-2 bg-white/10 hover:bg-yellow-500 hover:text-black transition-all rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10"
        >
          Propuesta 360
        </a>
      </nav>

      {/* --- BLOQUE 1: HERO (Interrupción de Patrón) --- */}
      <header className="relative h-screen flex flex-col justify-center items-center overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 scale-105 animate-slow-zoom" 
            style={{ backgroundImage: "url('/entre_rios_hero_fleet_1778188742232.png')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-black/60" />
        </div>

        <div className="relative z-10 container mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 animate-fade-in-down">
            <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
            <span className="text-xs font-medium tracking-[0.2em] uppercase text-neutral-400">Cooperativa Entre Ríos</span>
          </div>
          
          <h1 className="text-5xl md:text-8xl font-black mb-6 tracking-tighter leading-[0.9] animate-fade-in">
            De la Gestión Manual al <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 via-yellow-500 to-yellow-200 animate-gradient-x">Liderazgo Digital.</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-neutral-400 font-light mb-10 animate-fade-in-up">
            Propuesta de Plataforma de Gestión, Rentabilidad y Posicionamiento <br className="hidden md:block" /> 
            para la Cooperativa de Transporte Escolar Entre Ríos.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-200">
            <button className="px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-yellow-500 transition-all duration-300 flex items-center gap-2 group">
              Explorar Ecosistema <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <div className="text-sm text-neutral-500 border-l border-white/10 pl-4 py-2 text-left italic">
              Preparado para: <br />
              <span className="text-white font-medium">Sr. Jimmy Quezada</span>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-30">
          <div className="w-px h-12 bg-gradient-to-b from-transparent via-white to-transparent" />
        </div>
      </header>

      {/* --- BLOQUE 2: EL DIAGNÓSTICO (El Espejo) --- */}
      <section className="py-24 md:py-32 container mx-auto px-6 relative overflow-hidden text-white">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="relative group">
            <div className="absolute -inset-4 bg-yellow-500/10 rounded-3xl blur-2xl group-hover:bg-yellow-500/20 transition-all duration-500" />
            <div className="relative bg-neutral-900/50 border border-white/5 p-8 md:p-12 rounded-3xl backdrop-blur-sm">
              <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight">
                La pregunta <span className="text-yellow-500 italic font-poiret">incómoda...</span>
              </h2>
              <p className="text-xl text-neutral-400 font-light leading-relaxed mb-6">
                Entre Ríos es una cooperativa sólida. 52 unidades, años de confianza ganada. Pero, ¿qué tan diferente sería el resultado si cada proceso que hoy se hace a mano, se hiciera solo?
              </p>
              <div className="space-y-4">
                {[
                  "Mensajes sin respuesta por falta de tiempo",
                  "Mantenimientos que nadie anticipó",
                  "Contabilidad hecha a mano bajo estrés",
                  "Invisible para padres de familia en Google"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-neutral-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500/50" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="space-y-8">
            <div className="p-8 bg-white/5 rounded-2xl border-l-4 border-yellow-500">
              <h3 className="text-2xl font-bold mb-4 text-white">Costos Silenciosos</h3>
              <p className="text-neutral-400 font-light leading-relaxed">
                Los costos de operar sin tecnología no llegan con una factura. Son una fuga constante de tiempo, dinero y reputación que no aparece en los estados de cuenta, pero que la directiva siente al final del mes.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                <BarChart3 className="w-10 h-10 text-yellow-500 mb-4" />
                <div className="text-2xl font-bold text-white">Invisibilidad</div>
                <div className="text-xs text-neutral-500 uppercase tracking-widest mt-1">Si no está en Google, no existe.</div>
              </div>
              <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                <Clock className="w-10 h-10 text-yellow-500 mb-4" />
                <div className="text-2xl font-bold text-white">Fuga de Tiempo</div>
                <div className="text-xs text-neutral-500 uppercase tracking-widest mt-1">Tareas manuales redundantes.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- BLOQUE 3: INVERSIÓN CON RETORNO (ROI) --- */}
      <section className="py-24 bg-neutral-900/30 border-y border-white/5" id="propuesta">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black mb-6 text-white">Inversión con Retorno Visible</h2>
            <p className="text-xl text-neutral-400 font-light">
              Hablemos de lo único que importa para la asamblea de socios: los números.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 flex flex-col justify-between hover:border-yellow-500/50 transition-colors">
              <div>
                <div className="text-yellow-500 mb-4">
                  <Users className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">Inversión por Socio</h3>
                <p className="text-neutral-400 text-sm mb-8">Pago único y definitivo sin licencias mensuales.</p>
              </div>
              <div>
                <div className="text-4xl font-black text-white">$288</div>
                <div className="text-xs text-neutral-500 mt-1 uppercase tracking-widest">Costo por socio activo</div>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-yellow-500 text-black flex flex-col justify-between scale-105 shadow-2xl shadow-yellow-500/20">
              <div>
                <div className="mb-4">
                  <TrendingUp className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">Impacto Total Año 1</h3>
                <p className="text-black/60 text-sm mb-8 font-medium">Ahorro en tiempo administrativo y nuevos ingresos generados.</p>
              </div>
              <div>
                <div className="text-4xl font-black">$9,000 – $11,500</div>
                <div className="text-xs text-black/60 mt-1 uppercase tracking-widest font-bold underline">Referencia conservadora</div>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 flex flex-col justify-between hover:border-yellow-500/50 transition-colors">
              <div>
                <div className="text-yellow-500 mb-4">
                  <Zap className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">Tiempo Liberado</h3>
                <p className="text-neutral-400 text-sm mb-8">Personal enfocado en gestión y crecimiento estratégico.</p>
              </div>
              <div>
                <div className="text-4xl font-black text-white">400 hrs+</div>
                <div className="text-xs text-neutral-500 mt-1 uppercase tracking-widest">Anuales proyectadas</div>
              </div>
            </div>
          </div>

          <div className="max-w-3xl mx-auto p-6 bg-yellow-500/10 rounded-2xl border border-yellow-500/20 flex items-start gap-4">
            <ShieldCheck className="w-6 h-6 text-yellow-500 shrink-0 mt-1" />
            <p className="text-sm text-yellow-200/80 leading-relaxed italic">
              "Una sola avería mayor evitada gracias a las alertas automáticas ya cubre el 100% de la inversión individual del socio."
            </p>
          </div>
        </div>
      </section>

      {/* --- BLOQUE 4: ARQUITECTURA POR BLOQUES --- */}
      <section className="py-24 md:py-32 container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-20">
          <div className="max-w-2xl text-white">
            <h2 className="text-4xl md:text-6xl font-black mb-4">Arquitectura Modular</h2>
            <p className="text-xl text-neutral-400 font-light">
              El sistema no es una lista de funciones. Es un organismo construido en capas donde cada bloque potencia al siguiente.
            </p>
          </div>
          <div className="flex items-center gap-2 text-yellow-500 font-bold group cursor-pointer">
            Ver Ficha Técnica <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 text-white">
          {/* BLOQUE BASE */}
          <div className="group relative">
            <div className="h-full p-8 rounded-3xl bg-neutral-900 border border-white/5 hover:border-white/20 transition-all flex flex-col">
              <div className="mb-6 w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-yellow-500 group-hover:text-black transition-colors duration-500">
                <Cpu className="w-6 h-6" />
              </div>
              <div className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Bloque Base</div>
              <h3 className="text-2xl font-bold mb-4">Cimientos de IA</h3>
              <p className="text-sm text-neutral-400 font-light leading-relaxed flex-grow">
                Servidor propio, IA independiente y Sitio Web Institucional. Sin dependencias de terceros.
              </p>
              <div className="mt-6 pt-6 border-t border-white/5">
                <span className="text-xs text-yellow-500 font-medium">GARANTIZA:</span>
                <p className="text-xs text-neutral-500 mt-1">Infraestructura propia y posicionamiento en Google.</p>
              </div>
            </div>
          </div>

          {/* BLOQUE 1 */}
          <div className="group relative">
            <div className="h-full p-8 rounded-3xl bg-neutral-900 border border-white/5 hover:border-white/20 transition-all flex flex-col">
              <div className="mb-6 w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-yellow-500 group-hover:text-black transition-colors duration-500">
                <Users className="w-6 h-6" />
              </div>
              <div className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Bloque 1</div>
              <h3 className="text-2xl font-bold mb-4">Control del Socio</h3>
              <p className="text-sm text-neutral-400 font-light leading-relaxed flex-grow">
                Gestión de padres, contabilidad del socio, rutas, mantenimientos y tracking en tiempo real.
              </p>
              <div className="mt-6 pt-6 border-t border-white/5">
                <span className="text-xs text-yellow-500 font-medium">ACCESO:</span>
                <p className="text-xs text-neutral-500 mt-1">Cada dueño tendrá su propio panel de control móvil.</p>
              </div>
            </div>
          </div>

          {/* BLOQUE ESTRELLA */}
          <div className="group relative lg:-translate-y-8">
            <div className="h-full p-8 rounded-3xl bg-neutral-800 border border-yellow-500/30 hover:border-yellow-500 transition-all flex flex-col shadow-2xl">
              <div className="mb-6 w-12 h-12 rounded-xl bg-yellow-500 flex items-center justify-center text-black">
                <Smartphone className="w-6 h-6" />
              </div>
              <div className="text-xs font-bold text-yellow-500 uppercase tracking-widest mb-2 text-white">Bloque Estrella</div>
              <h3 className="text-2xl font-bold mb-4 text-white">Call Center IA</h3>
              <p className="text-sm text-neutral-300 font-light leading-relaxed flex-grow">
                Cobranza automatizada vía WhatsApp, atención 24/7 y semáforo de morosidad en tiempo real.
              </p>
              <div className="mt-6 pt-6 border-t border-white/10">
                <span className="text-xs text-yellow-500 font-medium uppercase tracking-tighter">EL MÓDULO QUE SE PAGA SOLO:</span>
                <p className="text-xs text-white font-bold mt-1">$4,000 anuales liberados en tiempo.</p>
              </div>
              <div className="absolute top-4 right-4 bg-yellow-500 text-black text-[10px] font-black px-2 py-1 rounded-md">HOT</div>
            </div>
          </div>

          {/* BLOQUE 2 */}
          <div className="group relative">
            <div className="h-full p-8 rounded-3xl bg-neutral-900 border border-white/5 hover:border-white/20 transition-all flex flex-col">
              <div className="mb-6 w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-yellow-500 group-hover:text-black transition-colors duration-500">
                <Globe className="w-6 h-6" />
              </div>
              <div className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Bloque 2</div>
              <h3 className="text-2xl font-bold mb-4">Generación de Ingresos</h3>
              <p className="text-sm text-neutral-400 font-light leading-relaxed flex-grow">
                Marketing digital avanzado y plataforma de publicidad QR para monetizar la flota.
              </p>
              <div className="mt-6 pt-6 border-t border-white/5">
                <span className="text-xs text-yellow-500 font-medium">META:</span>
                <p className="text-xs text-neutral-500 mt-1">$5,000 - $7,500 en ingresos por pauta.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- SECCIÓN NUEVA: VIDEO EXPERIENCIA (La Alternativa) --- */}
      <section className="py-24 bg-white text-black overflow-hidden relative">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-black/5 rounded-md mb-6">
                <span className="w-2 h-2 rounded-full bg-black" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Contenido Real</span>
              </div>
              <h2 className="text-4xl md:text-7xl font-black mb-8 leading-[0.95] tracking-tighter">
                Vea el sistema en <span className="text-yellow-600">funcionamiento.</span>
              </h2>
              <p className="text-xl text-neutral-600 font-light leading-relaxed mb-8">
                No me crea a mí. Vea cómo el sistema resuelve problemas reales en segundos. Estas son las piezas clave del ecosistema que Entre Ríos operará.
              </p>
              <div className="space-y-6">
                {[
                  { title: "Dashboard de Gerencia", desc: "Visión global de los 52 socios en 3 clics.", icon: <BarChart3 className="w-5 h-5" /> },
                  { title: "Chatbot de Cobranza", desc: "Cómo la IA cobra sin fricción humana.", icon: <Smartphone className="w-5 h-5" /> },
                  { title: "Panel del Socio", desc: "Control total desde el asiento del conductor.", icon: <Users className="w-5 h-5" /> }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4 group cursor-pointer p-4 rounded-2xl hover:bg-black/5 transition-all">
                    <div className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center shrink-0 group-hover:bg-yellow-500 group-hover:text-black transition-all">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{item.title}</h4>
                      <p className="text-neutral-500 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              {/* Video Player Mockup */}
              <div className="relative rounded-[2rem] overflow-hidden shadow-2xl shadow-black/20 aspect-video bg-neutral-900 border-[12px] border-neutral-100 group">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=1200')] bg-cover bg-center opacity-60 group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-all">
                   <PlayCircle className="w-20 h-20 text-white/50 group-hover:scale-110 group-hover:text-yellow-500 transition-all duration-500 cursor-pointer" />
                </div>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full w-1/3 bg-yellow-500" />
                  </div>
                  <div className="flex justify-between items-center mt-3 text-[10px] font-black text-white uppercase tracking-widest">
                    <span className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      Módulo 1: Comando Central
                    </span>
                    <span>01:45 / 03:20</span>
                  </div>
                </div>
              </div>
              
              {/* Floating element */}
              <div className="absolute -bottom-10 -right-6 p-6 bg-yellow-500 text-black rounded-2xl shadow-xl flex items-center gap-4 animate-bounce-slow">
                <div className="w-12 h-12 rounded-xl bg-black text-yellow-500 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Status</div>
                  <div className="text-sm font-black italic">Sistema Operativo</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- BLOQUE 5: AUTONOMÍA --- */}
      <section className="py-24 container mx-auto px-6 text-white">
        <div className="max-w-5xl mx-auto p-12 md:p-20 rounded-[3rem] bg-gradient-to-br from-neutral-900 to-black border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-10 text-white">
             <Lock className="w-48 h-48" />
          </div>
          <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-black mb-6">Autonomía Tecnológica</h2>
              <p className="text-xl text-neutral-400 font-light leading-relaxed mb-8">
                La cooperativa adquiere el sistema para uso perpetuo. Sin licencias mensuales. Sin ataduras. El software pasa a ser propiedad de Entre Ríos de forma definitiva.
              </p>
              <div className="flex items-center gap-4 text-sm text-yellow-500 font-bold tracking-widest uppercase">
                <ShieldCheck className="w-5 h-5" /> Protección de Inversión
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                <h4 className="font-bold text-lg mb-2">Escalabilidad Garantizada</h4>
                <p className="text-sm text-neutral-500 font-light">Cada nuevo socio que ingrese se incorpora a una infraestructura ya pagada.</p>
              </div>
              <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                <h4 className="font-bold text-lg mb-2">Soporte y Evolución</h4>
                <p className="text-sm text-neutral-500 font-light">Mantenimiento opcional para asegurar que la infraestructura siempre funcione al 100%.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- BLOQUE FINAL: CTA & PASOS --- */}
      <footer className="py-24 bg-[#0a0a0a] relative text-white">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-5xl md:text-8xl font-black mb-10 tracking-tighter">¿Podemos permitirnos <span className="text-neutral-600">no tenerlo?</span></h2>
            <p className="text-xl text-neutral-400 font-light mb-16 leading-relaxed">
              Cada mes que pasa sin automatización es un mes de cobros no gestionados, mantenimientos que no se anticiparon y padres de familia que encontraron a otra cooperativa antes de encontrar a Entre Ríos.
            </p>
            
            <div className="flex flex-col items-center gap-8">
              <a 
                href="https://wa.me/593983237491?text=Hola%20C%C3%A9sar%2C%20soy%20Jimmy%20de%20Entre%20R%C3%ADos.%20Revisemos%20la%20propuesta%20360%20para%20los%2052%20socios."
                target="_blank"
                className="inline-flex items-center gap-3 px-10 py-5 bg-yellow-500 text-black font-black rounded-2xl hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/30 transition-all duration-300 no-underline"
              >
                AGENDAR PRESENTACIÓN <ArrowRight className="w-6 h-6" />
              </a>
              
              <div className="text-neutral-500 font-light italic">
                Inversión Total: <span className="text-white font-bold">$19,600 + IVA</span> | Equivalente: <span className="text-white font-bold">$288 por socio</span>
              </div>
            </div>

            <div className="mt-32 pt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 opacity-50">
              <div className="flex flex-col items-start gap-1">
                <span className="text-xs uppercase tracking-widest font-black italic">Ing. César Reyes Jaramillo</span>
                <span className="text-[10px] uppercase tracking-widest">OBJETIVO — Estrategia Digital y Automatización</span>
              </div>
              <div className="text-[10px] uppercase tracking-[0.3em] font-light">
                Loja, Ecuador · 2026
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* --- CUSTOM CSS FOR ANIMATIONS --- */}
      <style jsx global>{`
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes slow-zoom {
          0% { transform: scale(1); }
          100% { transform: scale(1.1); }
        }
        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-scanline { animation: scanline 8s linear infinite; }
        .animate-slow-zoom { animation: slow-zoom 20s infinite alternate ease-in-out; }
        .animate-gradient-x { background-size: 200% 200%; animation: gradient-x 15s ease infinite; }
        .animate-fade-in { animation: fade-in 1s forwards; }
        .animate-fade-in-down { animation: fade-in 1s forwards cubic-bezier(0,0,0.2,1); }
        .animate-fade-in-up { opacity: 0; animation: fade-in 1s forwards 0.3s; }
        .animate-bounce-slow { animation: bounce-slow 4s infinite ease-in-out; }
        .delay-200 { animation-delay: 0.6s; }
      `}</style>
    </div>
  );
};

export default EntreRios360;

