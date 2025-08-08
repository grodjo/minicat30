import { NextRequest, NextResponse } from 'next/server';
import { createUser, createGameSession } from '@/lib/game';

export async function POST(request: NextRequest) {
  try {
    const { pseudo } = await request.json();

    if (!pseudo || typeof pseudo !== 'string' || pseudo.trim().length === 0) {
      return NextResponse.json(
        { error: 'Pseudonyme requis' },
        { status: 400 }
      );
    }

    // Créer utilisateur (gérer pseudo déjà pris)
    let user;
    try {
      user = await createUser(pseudo.trim());
    } catch (e) {
      interface KnownError { code?: string }
      const k = e as KnownError
      if (k.code === 'P2002') {
        return NextResponse.json(
          { error: 'Ce pseudonyme est déjà pris. Veuillez en choisir un autre.' },
          { status: 409 }
        );
      }
      throw e;
    }

    const session = await createGameSession(user.id);

    return NextResponse.json({
      sessionId: session.id,
      userId: user.id,
      pseudo: user.pseudo
    });

  } catch (error: unknown) {
    console.error('Error starting game:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la session' },
      { status: 500 }
    );
  }
}
