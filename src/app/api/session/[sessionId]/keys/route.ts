import { NextRequest, NextResponse } from 'next/server';
import { getCollectedKeys } from '@/lib/game';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ sessionId: string }> }
) {
  try {
    const params = await context.params;
    const sessionId = params.sessionId;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'ID de session requis' },
        { status: 400 }
      );
    }

    const keys = await getCollectedKeys(sessionId);

    return NextResponse.json({
      keys,
      total: keys.length
    });

  } catch (error) {
    console.error('Error getting collected keys:', error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des clés" },
      { status: 500 }
    );
  }
}
