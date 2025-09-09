"use client"

import { useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { createPortal } from 'react-dom';

interface WrongAnswerToastProps {
  message?: string;
}

export interface WrongAnswerToastRef {
  show: () => void;
}

export const WrongAnswerToast = forwardRef<WrongAnswerToastRef, WrongAnswerToastProps>(
  ({ message }, ref) => {
    const [mounted, setMounted] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
      setMounted(true);
    }, []);

    useImperativeHandle(ref, () => ({
      show: () => {
        setShouldRender(true);
        setIsVisible(true);
        
        // Lance l'animation de sortie après 1 seconde
        setTimeout(() => {
          setIsVisible(false);
          // Retire du DOM après l'animation
          setTimeout(() => {
            setShouldRender(false);
          }, 150); // Durée de l'animation de sortie
        }, 1000);
      }
    }));

    if (!mounted || !shouldRender) return null;

    return createPortal(
      <div 
        className={`fixed bottom-24 left-1/2 z-[100] ${
          isVisible ? 'animate-slide-in-left' : 'animate-slide-out-right'
        }`}
        style={{
          background: 'linear-gradient(135deg, #7f1d1d, #881337, #831843)',
          border: '1px solid rgba(248, 113, 113, 0.4)',
          color: 'white',
          fontSize: '20px',
          fontWeight: '600',
          padding: '16px 24px',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(239, 68, 68, 0.25), 0 0 0 1px rgba(248, 113, 113, 0.1)',
          minHeight: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '90vw',
          textAlign: 'center',
          transform: 'translateX(-50%)'
        }}
      >
        {message}
      </div>,
      document.body
    );
  }
);

WrongAnswerToast.displayName = 'WrongAnswerToast';
