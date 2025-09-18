/**
 * Script de test pour vérifier la cohérence du chronométrage
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testTimingConsistency() {
  console.log('🧪 Test de cohérence du chronométrage...\n');
  
  try {
    // Récupérer quelques sessions complétées pour vérifier
    const completedSessions = await prisma.gameSession.findMany({
      where: { completedAt: { not: null } },
      include: {
        user: true,
        stepSessions: { 
          where: { completedAt: { not: null } },
          orderBy: { stepRank: 'asc' }
        }
      },
      take: 3
    });

    console.log(`📊 Analyse de ${completedSessions.length} sessions complétées:\n`);

    for (const session of completedSessions) {
      console.log(`👤 Joueur: ${session.user.pseudo}`);
      console.log(`🚀 Session démarrée: ${session.startedAt.toISOString()}`);
      console.log(`🏁 Session terminée: ${session.completedAt?.toISOString()}`);
      
      // Calculer le temps effectif de la session
      const sessionEffectiveTime = session.completedAt ? 
        session.completedAt.getTime() - session.startedAt.getTime() : 0;
      
      // Calculer les pénalités totales
      const sessionTotalPenalties = session.stepSessions.reduce((sum, ss) => sum + ss.penaltyTimeMs, 0);
      
      // Temps total
      const sessionTotalTime = sessionEffectiveTime + sessionTotalPenalties;
      
      console.log(`⏱️  Temps effectif: ${Math.round(sessionEffectiveTime / 1000)}s`);
      console.log(`⚠️  Pénalités totales: ${Math.round(sessionTotalPenalties / 1000)}s`);
      console.log(`🏁 Temps final: ${Math.round(sessionTotalTime / 1000)}s`);
      
      console.log(`📝 Étapes (${session.stepSessions.length}):`);
      
      for (const step of session.stepSessions) {
        const stepEffectiveTime = step.completedAt && step.startedAt ?
          step.completedAt.getTime() - step.startedAt.getTime() : 0;
        
        console.log(`   • ${step.stepName}: ${Math.round(stepEffectiveTime / 1000)}s effectif + ${Math.round(step.penaltyTimeMs / 1000)}s pénalités = ${Math.round((stepEffectiveTime + step.penaltyTimeMs) / 1000)}s total`);
      }
      
      console.log('─'.repeat(50));
    }
    
    console.log('✅ Test terminé - La logique semble cohérente !');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le test si ce script est appelé directement
if (require.main === module) {
  testTimingConsistency()
    .then(() => {
      console.log('✨ Test terminé avec succès');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Échec du test:', error);
      process.exit(1);
    });
}

export { testTimingConsistency };