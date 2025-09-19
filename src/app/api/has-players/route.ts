import { NextResponse } from 'next/server';
import { getScoreboard } from '@/lib/game';

export async function GET() {
  try {
    const scoreboard = await getScoreboard();
    return NextResponse.json({ hasPlayers: scoreboard.length > 0 });
  } catch (error) {
    console.error('Error checking players:', error);
    return NextResponse.json({ hasPlayers: false });
  }
}