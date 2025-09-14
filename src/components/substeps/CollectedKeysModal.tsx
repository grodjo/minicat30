'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface CollectedKeysModalProps {
  sessionId: string;
  trigger?: React.ReactNode;
}

interface KeysData {
  keys: string[];
  total: number;
}

export const CollectedKeysModal = ({ sessionId, trigger }: CollectedKeysModalProps) => {
  const [keysData, setKeysData] = useState<KeysData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const fetchKeys = useCallback(async () => {
    if (!isOpen || keysData) return; // Ne pas recharger si déjà ouvert ou si les données existent

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/session/${sessionId}/keys`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des clés');
      }
      const data = await response.json();
      setKeysData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, [isOpen, keysData, sessionId]);

  useEffect(() => {
    if (isOpen) {
      fetchKeys();
    }
  }, [isOpen, fetchKeys]);

  const defaultTrigger = (
    <Button
      variant="outline"
      size="sm"
      className="h-10 px-4 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white border-0 shadow-md font-medium"
    >
      <span className="mr-2 text-lg">🗝️</span>
      Nos clés
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-lg mx-auto max-h-[80vh] bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 border-2 border-yellow-200 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-yellow-800">
            🗝️ Clés Collectées
          </DialogTitle>
          <DialogDescription className="sr-only">
            Liste des clés collectées pendant le quiz
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-2">
          {loading ? (
            <div className="text-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mx-auto mb-4"></div>
              <p className="text-yellow-700">Chargement des clés...</p>
            </div>
          ) : error ? (
            <div className="text-center py-6">
              <p className="text-red-600 mb-4">{error}</p>
              <Button
                onClick={fetchKeys}
                variant="outline"
                size="sm"
                className="text-yellow-700 border-yellow-400 hover:bg-yellow-100"
              >
                Réessayer
              </Button>
            </div>
          ) : keysData ? (
            <>
              {keysData.keys && keysData.keys.length > 0 ? (
                <div className="space-y-2 max-h-100 overflow-y-auto pr-2 grid grid-cols-2 gap-2">
                  {keysData.keys.map((key, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-r from-yellow-100/80 to-amber-100/80 border border-yellow-300/60 rounded-lg p-3 flex items-center backdrop-blur-sm"
                    >
                      <span className="text-lg mr-3 flex-shrink-0">🗝️</span>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs text-yellow-700 font-medium block">Étape {index + 1}</span>
                        <p className="font-semibold text-yellow-900 text-sm leading-tight truncate" title={key}>
                          {key}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <span className="text-4xl mb-3 block">🔍</span>
                  <p className="text-yellow-700 font-medium">Aucune clé trouvée</p>
                </div>
              )}
            </>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};
