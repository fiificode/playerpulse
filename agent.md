:::writing{variant=“standard” id=“48261”}
You are a senior frontend engineer and product designer.

Your task is to build a gamified football voting web application called “PlayerPulse”.

The goal of the app is to allow users to vote for the Best Football Player of the Week, similar to the Premier League Player of the Week voting experience, but with a gamified interface, animations, and leaderboard elements.

This is an MVP prototype, so no backend or database should be used. All data must be stored locally in the frontend using Zustand state management.

⸻

Tech Stack

Use the following technologies:
• Next.js (App Router)
• TypeScript
• TailwindCSS
• Zustand for state management
• Framer Motion for animations
• Lucide React for icons

No backend.
No database.
No authentication.

All data must be mocked locally.

⸻

Core Concept

Users visit a gamified landing page where they can: 1. View the Player of the Week nominees 2. Vote for one player 3. See live vote counts 4. View a leaderboard 5. Experience fun animations and gamification feedback

Votes should persist in local state (Zustand) during the session.

⸻

Application Structure

Use the following folder structure:

/app
page.tsx
layout.tsx
/globals.css

/components
Hero.tsx
PlayerCard.tsx
VoteButton.tsx
Leaderboard.tsx
AnimatedBackground.tsx
VoteResults.tsx

/store
useVoteStore.ts

/data
players.ts

/types
player.ts

⸻

Data Model

Create a mock list of 8 football players.

Each player should have:

```
type Player = {
  id: string
  name: string
  club: string
  position: string
  image: string
  votes: number
}

```

Mock realistic football data.

⸻

Zustand Store

Create a Zustand store called useVoteStore.

State should contain:
• players
• selectedPlayer
• vote()

Example behavior:

```
vote(playerId)
→ increments vote count
→ prevents voting twice
→ triggers animation feedback

```

Landing Page UX

The landing page should feel modern, energetic, and gamified.

Sections:

1. Hero Section

Contains:
• Title: “Vote for the Player of the Week”
• Subtitle
• CTA button → “Start Voting”

Include animated background effects.

⸻

2. Nominee Section

Grid of player cards.

Each card contains:
• Player image
• Name
• Club
• Position
• Current vote count
• Vote button

Card interactions:
• Hover lift animation
• Glow effect
• Button animation on click

Use Framer Motion for animations.

⸻

3. Voting Feedback

When a vote is cast:
• Confetti style animation
• Button changes to “Voted”
• Vote count updates
• Small celebration animation

⸻

4. Leaderboard Section

Show ranking of players based on votes.

Top 3 should have special styling:

🥇 Gold
🥈 Silver
🥉 Bronze

Include animated number counters.

UI / Design Style

Design style should be:
• Modern
• Slightly gaming inspired
• Dark mode
• Neon highlights
• Smooth animations

Use TailwindCSS.

Color palette suggestion:

Primary: Indigo / Purple
Accent: Neon Blue
Background: Dark gradient

Animations

Use Framer Motion for:
• Page entrance animations
• Card hover effects
• Vote button press
• Leaderboard transitions
• Background particle animation

⸻

Gamification Elements

Include:
• Progress bars for vote percentages
• Animated leaderboard ranking
• Celebration effect when voting
• Dynamic ranking updates

⸻

Constraints

Important rules:
• No backend
• No API
• No database
• All data stored locally
• Must be responsive (mobile + desktop)
• Use reusable components

Deliverables

Generate: 1. Full project structure 2. All component code 3. Zustand store implementation 4. Mock player dataset 5. Fully styled UI with Tailwind 6. Framer Motion animations 7. Clean, maintainable code

Ensure the code runs immediately in a fresh Next.js project.

Bonus Features (Optional but Recommended)

If possible, also implement:
• Animated vote percentage bars
• Random crowd cheering sound effect
• Weekly countdown timer
• Player spotlight animation
• “Share winner” UI

⸻

Output the code component by component with clear file names.
:::
