import { NextRequest, NextResponse } from 'next/server';
import { findActiveSession } from '@/lib/game';

export async function POST(request: NextRequest) {
  try {
    const { pseudo } = await request.json();

    if (!pseudo || typeof pseudo !== 'string' || pseudo.trim().length === 0) {
      return NextResponse.json(
        { error: 'Pseudonyme requis' },
        { status: 400 }
      );
    }

    const activeSession = await findActiveSession(pseudo.trim());
    
    return NextResponse.json({
      hasActiveSession: !!activeSession,
      sessionId: activeSession?.sessionId || null
    });

  } catch (error: unknown) {
    console.error('Error checking session:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification' },
      { status: 500 }
    );
  }
}
