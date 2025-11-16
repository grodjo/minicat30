'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface CollectedKeysModalProps {
  sessionId: string;
  trigger?: React.ReactNode;
}

export const CollectedKeysModal = ({ sessionId, trigger }: CollectedKeysModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [keys, setKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Charger les clés depuis l'API quand le modal s'ouvre
  const loadKeys = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/session/${sessionId}/keys`);
      if (response.ok) {
        const data = await response.json();
        setKeys(data.keys || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des clés:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && sessionId) {
      loadKeys();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, sessionId]);

  const defaultTrigger = (
    <Button
      variant="outline"
      size="sm"
      className="h-10 px-4 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white border-0 shadow-md font-medium text-base font-semibold"
    >
      <span className="mr-2 text-lg">🗝️</span>
      Voir les clés
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-md mx-auto max-h-[80vh] bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 border-2 border-violet-300/30 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-white drop-shadow-lg">
            🗝️ Clés Collectées
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-white/80 font-medium">Chargement...</p>
            </div>
          ) : keys.length > 0 ? (
            <div className="space-y-2">
              {keys.map((key, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm"
                >
                  <div className="text-white/80 text-sm font-semibold">
                    Étape {index + 1}
                  </div>
                  <div className="text-xl font-bold drop-shadow-md">
                    {key ? (
                      <span className="text-yellow-300">{key}</span>
                    ) : (
                      <span className="text-white/30">???</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <span className="text-6xl mb-4 block">🔍</span>
              <p className="text-white/80 font-medium text-lg">Aucune étape trouvée</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
