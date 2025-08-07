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

    // Créer l'utilisateur
    const user = await createUser(pseudo.trim());

    // Créer une session de jeu
    const session = await createGameSession(user.id);

    return NextResponse.json({
      sessionId: session._id.toString(),
      userId: user._id.toString(),
      pseudo: user.pseudo
    });

  } catch (error) {
    console.error('Error starting game:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la session' },
      { status: 500 }
    );
  }
}
