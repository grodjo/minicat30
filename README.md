# Quiz Course d'Orientation

Une application PWA (Progressive Web App) mobile-first pour un quiz de course d'orientation gamifié.

## 🎯 Fonctionnalités

- **Quiz progressif** : Questions séquentielles avec validation côté serveur
- **Système d'indices** : Indices déblocables avec suivi d'utilisation
- **Chronométrage** : Temps global et par question
- **Tableau des scores** : Classement avec détails par joueur
- **PWA** : Installation sur mobile et fonctionnement hors-ligne
- **Sécurisé** : Réponses et validation exclusivement côté serveur

## 🛠 Stack Technique

- **Framework** : Next.js 14+ (App Router)
- **Base de données** : SQLite avec Prisma ORM
- **Styling** : Tailwind CSS (mobile-first)
- **PWA** : next-pwa
- **TypeScript** : Full TypeScript support

## 🚀 Installation et Lancement

```bash
# Installation des dépendances
npm install

# Configuration de la base de données
npx prisma migrate dev --name init

# Génération du client Prisma
npx prisma generate

# Lancement en développement
npm run dev
```

L'application sera disponible sur [http://localhost:3000](http://localhost:3000)

## 📊 Base de Données

Le schéma inclut :
- **User** : Gestion des pseudonymes
- **GameSession** : Sessions de jeu avec temps de début/fin
- **Attempt** : Tentatives de réponse avec temps et indices utilisés

## 🎮 Utilisation

1. **Accueil** : Saisir un pseudonyme pour commencer
2. **Quiz** : Répondre aux questions une par une
3. **Indices** : Demander des indices si nécessaire
4. **Fin** : Voir son temps total et accéder au classement

## 🔧 API Routes

- `POST /api/start` - Créer utilisateur et session
- `GET /api/session/:id/current-question` - Question actuelle
- `POST /api/session/:id/answer` - Valider une réponse
- `POST /api/session/:id/hint` - Obtenir un indice
- `GET /api/scoreboard` - Tableau des scores

## 📱 PWA

L'application peut être installée sur mobile via le navigateur pour une expérience native.

## 🔒 Sécurité

- Questions/réponses jamais exposées côté client
- Validation serveur uniquement
- Protection contre la triche via DevTools

## 🎨 Personnalisation

Modifiez `/src/lib/questions.ts` pour personnaliser les questions du quiz.
