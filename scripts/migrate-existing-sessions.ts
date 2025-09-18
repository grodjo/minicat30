/**
 * Script de migration pour mettre à jour les sessions existantes
 * avec le nouveau champ completedAt
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateExistingSessions() {
  console.log('🔄 Début de la migration des sessions existantes...');
  
  try {
    // Récupérer toutes les stepSessions qui ont keyCompletedAt mais pas completedAt
    const stepSessionsToMigrate = await prisma.stepSession.findMany({
      where: {
        keyCompletedAt: { not: null },
        completedAt: null
      }
    });

    console.log(`📊 ${stepSessionsToMigrate.length} étapes à migrer`);

    let migratedCount = 0;
    
    for (const stepSession of stepSessionsToMigrate) {
      // Pour les sessions existantes, utiliser keyCompletedAt comme completedAt
      await prisma.stepSession.update({
        where: { id: stepSession.id },
        data: {
          completedAt: stepSession.keyCompletedAt
        }
      });
      
      migratedCount++;
      
      if (migratedCount % 10 === 0) {
        console.log(`✅ ${migratedCount}/${stepSessionsToMigrate.length} étapes migrées`);
      }
    }

    console.log(`🎉 Migration terminée avec succès ! ${migratedCount} étapes migrées.`);
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter la migration si ce script est appelé directement
if (require.main === module) {
  migrateExistingSessions()
    .then(() => {
      console.log('✨ Migration terminée avec succès');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Échec de la migration:', error);
      process.exit(1);
    });
}

export { migrateExistingSessions };