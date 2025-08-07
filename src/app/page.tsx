'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Home() {
  const [pseudo, setPseudo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pseudo.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pseudo: pseudo.trim() }),
      });

      if (response.ok) {
        const { sessionId } = await response.json();
        router.push(`/quiz/${sessionId}`);
      } else {
        alert('Erreur lors de la création de la session');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Erreur lors de la création de la session');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-900 to-purple-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Grille futuriste en arrière-plan - plus visible */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(147,51,234,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(147,51,234,0.08)_1px,transparent_1px)] bg-[size:60px_60px] opacity-60"></div>

      <div className="relative z-10 text-center space-y-16 max-w-lg w-full">
        {/* Titre principal avec effet de brillance */}
        <div className="space-y-6">
          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight animate-title-shine drop-shadow-2xl font-sans filter brightness-110">
            MINICAT 30
          </h1>
          <div className="w-32 h-1 bg-gradient-to-r from-transparent via-violet-400 to-transparent mx-auto rounded-full shadow-lg shadow-violet-400/50"></div>
        </div>

        {/* Interface de connexion - contraste amélioré */}
        <form onSubmit={handleSubmit} className="space-y-8" suppressHydrationWarning>
          <div className="space-y-4">
            <div className="relative">
              <Input
                type="text"
                value={pseudo}
                onChange={(e) => setPseudo(e.target.value)}
                placeholder="Votre nom d'équipe"
                required
                maxLength={50}
                disabled={isLoading}
                className="w-full h-16 bg-white/95 border-violet-300/50 text-slate-900 placeholder:text-violet-600/60 text-center text-lg font-medium tracking-wide backdrop-blur-md focus:border-violet-400 focus:ring-2 focus:ring-violet-400/70 transition-all duration-300 rounded-2xl shadow-2xl shadow-black/20"
                suppressHydrationWarning
              />
              <div className="absolute inset-0 border border-violet-400/40 rounded-2xl pointer-events-none shadow-inner"></div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={!pseudo.trim() || isLoading}
            className="w-full h-16 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:via-purple-500 hover:to-indigo-500 text-white font-semibold text-lg tracking-wide transition-all duration-300 shadow-2xl shadow-violet-600/40 hover:shadow-violet-500/60 hover:shadow-2xl disabled:from-slate-600 disabled:to-slate-600 disabled:text-slate-300 border-0 relative overflow-hidden group rounded-2xl"
            suppressHydrationWarning
          >
            <span className="relative z-10 drop-shadow-lg">
              {isLoading ? 'Chargement...' : '🦆 C\'est tipar mes canards !'}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          </Button>
        </form>
      </div>
    </div>
  );
}
