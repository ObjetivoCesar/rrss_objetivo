'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { BrainCircuit, Sparkles, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      toast.error('Error al iniciar sesión');
      setIsLoading(false);
    } else {
      toast.success('¡Bienvenido de nuevo!');
      // La redirección la maneja el middleware o hacemos un hard reload
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-[#fbf9f6] dark:bg-[#0a0a0a] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-pink-500/10 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/10 blur-[120px] rounded-full animate-pulse style={{ animationDelay: '1s' }}" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo Area */}
        <div className="flex flex-col items-center mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-700 flex items-center justify-center shadow-2xl border border-white/20 mb-4">
            <BrainCircuit className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight flex items-center gap-2">
            DONNA AI <Sparkles className="w-4 h-4 text-pink-500" />
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm font-medium mt-1">Tu Board de Expertos Digitales</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/70 dark:bg-neutral-900/40 backdrop-blur-2xl border border-white/20 dark:border-white/10 rounded-[32px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] animate-in fade-in zoom-in duration-500">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-neutral-500 dark:text-neutral-400 uppercase tracking-widest mb-2 ml-1">Email Corporativo</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="w-full bg-white dark:bg-black/20 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 text-sm text-neutral-900 dark:text-white focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500/50 outline-none transition-all placeholder:text-neutral-400/50 font-medium"
                placeholder="tu@empresa.com"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-neutral-500 dark:text-neutral-400 uppercase tracking-widest mb-2 ml-1">Contraseña</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full bg-white dark:bg-black/20 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 text-sm text-neutral-900 dark:text-white focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500/50 outline-none transition-all placeholder:text-neutral-400/50 font-medium"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-600 dark:text-red-400 text-xs font-bold animate-in shake">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <button
              disabled={isLoading}
              type="submit"
              className="w-full bg-neutral-900 dark:bg-white text-white dark:text-black py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 shadow-xl"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Entrar al Sistema <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <p className="text-center text-[10px] text-neutral-500 dark:text-neutral-500 mt-8 font-bold uppercase tracking-[0.2em]">
          ACCESO RESTRINGIDO · GRUPO EMPRESARIAL REYES
        </p>
      </div>
    </div>
  );
}
