import { NextRequest, NextResponse } from 'next/server';
import { createUser, createGameSession, findActiveSession } from '@/lib/game';

export async function POST(request: NextRequest) {
  try {
    const { pseudo } = await request.json();

    if (!pseudo || typeof pseudo !== 'string' || pseudo.trim().length === 0) {
      return NextResponse.json(
        { error: 'Pseudonyme requis' },
        { status: 400 }
      );
    }

    const trimmedPseudo = pseudo.trim();

    // D'abord, vérifier s'il existe une session active pour ce pseudo
    const activeSession = await findActiveSession(trimmedPseudo);
    
    if (activeSession) {
      return NextResponse.json({
        sessionId: activeSession.sessionId,
        userId: activeSession.userId,
        pseudo: activeSession.pseudo,
        isResuming: true
      });
    }

    // Si pas de session active, créer un nouvel utilisateur et une nouvelle session
    let user;
    try {
      user = await createUser(trimmedPseudo);
    } catch (e) {
      // Si l'utilisateur existe déjà mais n'a pas de session active, 
      // récupérer l'utilisateur existant
      interface KnownError { code?: string }
      const k = e as KnownError
      if (k.code === 'P2002') {
        // L'utilisateur existe mais n'a pas de session active, on peut créer une nouvelle session
        const { prisma } = await import('@/lib/prisma');
        user = await prisma.user.findUnique({ where: { pseudo: trimmedPseudo } });
        if (!user) {
          return NextResponse.json(
            { error: 'Erreur lors de la récupération de l\'utilisateur' },
            { status: 500 }
          );
        }
      } else {
        throw e;
      }
    }

    const session = await createGameSession(user.id);

    return NextResponse.json({
      sessionId: session.id,
      userId: user.id,
      pseudo: user.pseudo,
      isResuming: false
    });

  } catch (error: unknown) {
    console.error('Error starting game:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la session' },
      { status: 500 }
    );
  }
}
