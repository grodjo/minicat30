<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Quiz App - Course d'Orientation

This is a Next.js 14+ PWA application for an orienteering quiz game with the following key characteristics:

## Architecture
- Next.js App Router with TypeScript
- Progressive Web App (PWA) with next-pwa
- Tailwind CSS for mobile-first responsive design
- - MongoDB with Mongoose ODM for database management
- Server Actions for backend logic

## Game Flow
1. User enters pseudonym to start session
2. Sequential quiz questions (one at a time)
3. Server-side answer validation only
4. Hints system with usage tracking
5. Timer tracking per question and total session
6. Final scoreboard with detailed statistics

## Database Schema
- User: id, pseudo, createdAt, sessions[]
- GameSession: id, userId, startedAt, completedAt, attempts[]
- Attempt: id, sessionId, questionId, startedAt, answeredAt, usedHints[], isCorrect

## Security Requirements
- Questions/answers never exposed to client
- All validation server-side only
- No sensitive data in client-side code
- Anti-cheat mechanisms

## API Structure
- POST /api/start - Create user and session
- GET /api/session/:id/current-question - Get next question
- POST /api/session/:id/answer - Validate answer
- POST /api/session/:id/hint - Get next hint
- GET /api/scoreboard - Get final scores

## UI/UX Guidelines
- Mobile-first responsive design
- Linear experience (no free navigation)
- Immediate feedback on correct answers
- Smooth transitions between states
- Full-screen mobile experience
