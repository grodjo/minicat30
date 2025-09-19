'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { steps } from '@/lib/steps';

interface CollectedKeysModalProps {
  trigger?: React.ReactNode;
}

export const CollectedKeysModal = ({ trigger }: CollectedKeysModalProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // Récupérer les clés directement depuis les étapes (première valeur acceptedAnswers)
  const getCollectedKeys = () => {
    return steps
      .filter(step => step.key && step.key.acceptedAnswers && step.key.acceptedAnswers.length > 0)
      .map((step, index) => ({
        stepIndex: index + 1,
        stepName: step.name,
        key: step.key!.acceptedAnswers![0] // Première valeur de acceptedAnswers
      }));
  };

  const keysData = getCollectedKeys();

  const defaultTrigger = (
    <Button
      variant="outline"
      size="sm"
      className="h-10 px-4 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white border-0 shadow-md font-medium"
    >
      <span className="mr-2 text-lg font-semibold">🗝️</span>
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
          <DialogDescription className="sr-only">
            Liste des clés collectées pendant le quiz
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {keysData.length > 0 ? (
            <div className="space-y-2">
              {keysData.map((keyInfo, index) => (
                <div
                  key={index}
                  className="flex items-center justify-center px-2 space-x-4"
                >
                  <div className="text-white/80 text-sm font-semibold mr-4">
                    Étape {keyInfo.stepName === 'FINAL' ? 'finale' : keyInfo.stepName}&nbsp;:
                  </div>
                  <div className="text-xl font-bold text-yellow-300 drop-shadow-md">
                    {keyInfo.key}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <span className="text-6xl mb-4 block">🔍</span>
              <p className="text-white/80 font-medium text-lg">Aucune clé trouvée</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
