'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Quiz Course d&apos;Orientation
          </h1>
          <p className="text-gray-600">
            Entrez votre pseudonyme pour commencer l&apos;aventure
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" suppressHydrationWarning>
          <div>
            <label htmlFor="pseudo" className="block text-sm font-medium text-gray-700 mb-2">
              Pseudonyme
            </label>
            <input
              type="text"
              id="pseudo"
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Votre pseudonyme..."
              required
              maxLength={50}
              disabled={isLoading}
              suppressHydrationWarning
            />
          </div>

          <button
            type="submit"
            disabled={!pseudo.trim() || isLoading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            suppressHydrationWarning
          >
            {isLoading ? 'Création...' : 'Commencer le Quiz'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Répondez aux questions dans l&apos;ordre</p>
          <p>Utilisez les indices si nécessaire</p>
          <p>Votre temps sera chronométré</p>
        </div>
      </div>
    </div>
  );
}
