---
name: playerpulse-gamified-voting-app
overview: Implement PlayerPulse, a responsive, gamified football Player of the Week voting app in Next.js with local Zustand state, animations, and leaderboard, including all specified bonus features.
todos:
  - id: setup-project-structure
    content: Set up Next.js App Router project with TypeScript, Tailwind, Framer Motion, Lucide, and base layout/styles
    status: completed
  - id: define-types-and-data
    content: Create Player type and mock players dataset
    status: completed
  - id: implement-zustand-store
    content: Implement useVoteStore with players, voting logic, and derived leaderboard data
    status: completed
  - id: build-core-ui
    content: Implement Hero, nominee grid with PlayerCard and VoteButton, and basic layout
    status: completed
  - id: style-and-animations
    content: Apply dark neon theme and add Framer Motion animations for cards, buttons, and sections
    status: completed
  - id: add-gamification-elements
    content: Implement vote feedback, VoteResults, leaderboard with animated counts and progress bars
    status: completed
  - id: implement-bonus-features
    content: Add crowd cheer audio with toggle, countdown timer, spotlight animations, and share winner UI
    status: completed
  - id: final-responsive-polish
    content: Test and refine responsiveness and accessibility across devices and input methods
    status: completed
isProject: false
---

## Goal

Build the **PlayerPulse** MVP as a single-page, fully responsive, gamified football voting experience using **Next.js App Router, TypeScript, TailwindCSS, Zustand, Framer Motion, and Lucide React**, with all data mocked locally and all state held client-side. Implement **all core features plus the bonus features** from `agent.md`.

## Architecture & Project Setup

- **Framework & App Router**
  - Use **Next.js (latest, App Router)** with a single main route at `/` for the voting experience.
  - Configure **TypeScript** and **TailwindCSS** following the standard Next.js + Tailwind setup.
  - Ensure the app is fully client-rendered where needed (e.g. `"use client"` at the right component boundaries for Zustand and Framer Motion).
- **Directory Structure** (as specified)
  - `app/layout.tsx`: Root layout with global dark theme, base typography, and background gradient.
  - `app/page.tsx`: Main page that wires together hero, nominees grid, leaderboard, vote results, background, etc.
  - `app/globals.css`: Tailwind base imports + any custom utility classes (e.g. for neon glow, gradients, scroll behavior).
  - `components/`
    - `Hero.tsx`
    - `PlayerCard.tsx`
    - `VoteButton.tsx`
    - `Leaderboard.tsx`
    - `AnimatedBackground.tsx`
    - `VoteResults.tsx`
    - (Additional small shared components as needed, e.g. `CountdownTimer.tsx`, `MuteToggle.tsx`, `ProgressBar.tsx`, but keep them lean and reusable.)
  - `store/useVoteStore.ts`: Zustand vote store.
  - `data/players.ts`: Static mock data for 8 players.
  - `types/player.ts`: `Player` type definition.
  - `public/players/`: Player images and any static audio (e.g. crowd cheer).
- **Styling & Design System**
  - Tailwind configuration for **dark mode**, using suggested palette:
    - Background: dark gradient (e.g. `from-slate-950 via-slate-900 to-slate-950`).
    - Primary: Indigo/Purple.
    - Accent: Neon Blue for highlights, borders, glows, and CTAs.
  - Reusable **utility patterns**:
    - Neon borders and glow (using Tailwind shadows + custom CSS for outer glows).
    - Card base style shared between `PlayerCard` and leaderboard rows.
    - Responsive grid breakpoints for mobile, tablet, and desktop.

## Data Model & State Management

- **Type Definition** (`types/player.ts`)
  - Implement `Player` exactly as defined:

```ts
type Player = {
  id: string;
  name: string;
  club: string;
  position: string;
  image: string;
  votes: number;
};
```

- **Mock Data** (`data/players.ts`)
  - Define 8 players with realistic names, clubs, positions, and image paths.
  - Initialize `votes` to 0 for all players.
- **Zustand Store** (`store/useVoteStore.ts`)
  - State:
    - `players: Player[]`
    - `selectedPlayerId: string | null`
    - `hasVoted: boolean` (to prevent multiple votes in a session)
    - `totalVotes: number` (derived or stored for convenience)
    - `voteInProgress: boolean` (for button loading / animation gating)
    - `celebrationPlayerId: string | null` (to trigger celebration UI for the last voted player)
    - `weekDeadline: Date` or ISO string for countdown.
  - Actions:
    - `vote(playerId: string)`: if `hasVoted` is false, increment that player's `votes`, set `selectedPlayerId`, `hasVoted`, `totalVotes`, and set `celebrationPlayerId` for a short time.
    - `resetCelebration()`: clear `celebrationPlayerId` after animation completes.
  - Expose convenient **selectors** for performance (e.g. derived sorted leaderboard, vote percentages per player).

## Core UI Flows & Components

### 1. Animated Background & Layout

- `**AnimatedBackground.tsx`
  - Use Framer Motion to render **soft particle-like blobs** or gradient orbs moving slowly behind the content.
  - Ensure low performance impact; keep animation subtle, with opacity and blur.
- `**layout.tsx`
  - Wrap body in a dark gradient background with `AnimatedBackground` layered behind the main content.
  - Use a centered max-width container and responsive padding.
  - Configure a global font and base text color.

### 2. Hero Section (`Hero.tsx`)

- Content:
  - Title: **"Vote for the Player of the Week"**.
  - Subtitle describing the experience (gamified, live leaderboard, etc.).
  - Primary CTA button: **"Start Voting"** that smoothly scrolls to the nominees section.
- Animations:
  - Page entrance animation for title, subtitle, and CTA using Framer Motion (fade-in + slide-up).
  - Subtle hover animation on CTA (scale, shadow, glow).
- Responsiveness:
  - Stack text and CTA vertically on mobile; side-by-side or centered layout on larger screens.

### 3. Nominee Section (`PlayerCard.tsx` & `VoteButton.tsx`)

- **Nominee Grid (in `page.tsx`)**
  - Use Zustand store to get players list and pass each to `PlayerCard`.
  - Responsive grid:
    - 1 column on small screens, 2 on tablets, 3–4 on large screens.
- `**PlayerCard.tsx`
  - Display player image (using Next Image), name, club, position.
  - Show current vote count and **percentage bar** (progress towards total votes).
  - Use Framer Motion for:
    - Hover lift with scale and shadow.
    - Glow border on hover.
  - Accept props such as `player`, `percentage`, `isSelected`, `onVote`, `isDisabled`, `isCelebrating`.
- `**VoteButton.tsx`
  - Renders a Lucide icon (e.g. `ThumbsUp` or `Sparkles`) with label "Vote" or "Voted".
  - Handles states:
    - Default: bright neon outline / fill.
    - Hover: slight scale and glow.
    - Disabled / already voted: muted but still clear state.
    - Loading (optional) when `voteInProgress` is true.
  - Animations:
    - Press animation using Framer Motion (`whileTap` scale-down, etc.).

### 4. Voting Feedback & Gamification (`VoteResults.tsx`)

- **Immediate Feedback on Vote**
  - When `vote(playerId)` succeeds:
    - Trigger a **confetti-style** animation (using Framer Motion patterns or a simple particle burst component).
    - Update button to "Voted" with checkmark icon.
    - Highlight selected player's card with a celebratory border/shine.
  - Use `celebrationPlayerId` from store to control which `PlayerCard` plays the celebration.
- `**VoteResults.tsx` Section
  - Show summary after user has voted:
    - Short text like **"You voted for [Player Name]!"**.
    - Small spotlight animation on the selected player (e.g. pulsing ring or shine across card).
    - Display vote percentage for selected player and how they rank vs others.

### 5. Leaderboard Section (`Leaderboard.tsx`)

- Data & Sorting:
  - Use derived state from store to get players **sorted by votes descending**.
  - Compute rank and percentages.
- Layout:
  - Show top 3 with **special styling**:
    - Rank 1: gold accent, crown icon, slightly larger row/card.
    - Rank 2: silver accent.
    - Rank 3: bronze accent.
  - Remaining players: standard dark card rows with neon accents.
- Animations:
  - Animate list entrance and updates using Framer Motion’s `AnimatePresence` / `layout` props.
  - Add **animated number counters** for vote counts and percentages (e.g. using Framer Motion `useMotionValue` → `useTransform` or a lightweight count-up effect).

## Bonus Features Implementation

### 6. Animated Vote Percentage Bars

- **Progress Bars**
  - Shared `ProgressBar` component that:
    - Animates width from 0 to the computed percentage when votes change.
    - Applies neon accent color and subtle inner glow.
  - Each `PlayerCard` displays a progress bar below the vote count.

### 7. Crowd Cheering Sound Effect

- **Static Audio Asset**
  - Place a short `crowd-cheer.mp3` (or similar) in `public/audio/`.
- **Playback Logic**
  - Create a small hook or utility (e.g. `useSound` or inline logic) to:
    - Load the audio via `HTMLAudioElement` on client only.
    - Play once on successful vote if **audio is enabled**.
- **Mute/Audio Toggle**
  - Add a `MuteToggle` UI, e.g. in the header or floating in a corner:
    - Uses Lucide icons (`Volume2` / `VolumeX`).
    - State kept in a small local `useState` or a separate slice in `useVoteStore` (e.g. `soundEnabled: boolean`).
    - The `vote` handler will check this flag before triggering `play()`.

### 8. Weekly Countdown Timer

- **Countdown Logic**
  - Store a "week end" timestamp in the Zustand store (e.g. `weekDeadline` one week from now, or a fixed date for the demo).
  - In a `CountdownTimer` component:
    - Use `useEffect` + `setInterval` to compute remaining `days/hours/minutes/seconds`.
    - Clear interval on unmount.
- **UI Placement**
  - Display countdown prominently in the hero or near the nominees section with text like **"Voting ends in"**.
  - Style with neon digits and subtle pulse animation as time runs low.

### 9. Player Spotlight Animation

- **Spotlight on Leader**
  - In `Leaderboard`, highlight the current leader with a **spotlight animation**:
    - Animated radial gradient or light sweep using Framer Motion.
    - Slight scale/float effect on the top-ranked row/card.
- **Spotlight on User’s Choice**
  - In `VoteResults`, also animate the player the user chose using a brief shine/halo effect.

### 10. “Share Winner” UI

- **Share Section**
  - Add a small `ShareWinner` UI near the leaderboard:
    - If totalVotes > 0, compute current top player and show: **"Share the current winner: [Player Name]"**.
  - Provide a "Copy link" button (copy current URL plus query like `?highlight=[playerId]` or just plain root URL for MVP).
  - Optionally, use `navigator.share` API when available to open native share sheet on mobile.
  - Show toast / temporary message when link is copied.

## Responsiveness & Accessibility

- **Responsive Layout Rules**
  - Mobile-first grid and flex layouts:
    - Single-column stacked sections on small screens.
    - Nominee cards in 1-column on small, 2-column on medium, 3–4 columns on large.
    - Leaderboard and results stack vertically on mobile; sit side-by-side on desktop if space allows.
  - Ensure all typography scales appropriately (Tailwind `text-sm` up to `text-3xl/4xl` with breakpoints).
- **Accessibility**
  - All interactive elements (`VoteButton`, audio toggle, share button) should be **keyboard focusable** with visible focus rings.
  - Add `aria-pressed`/`aria-disabled` where appropriate on buttons.
  - Provide descriptive alt text for player images.

## Integration Flow in `page.tsx`

- Fetch state from `useVoteStore` via hooks/selectors.
- Render sections in order:
  1. `Hero` (with scroll-to-nominees CTA)
  2. Nominee grid (using `PlayerCard` + `VoteButton` + progress bars)
  3. `VoteResults` (conditional on `hasVoted`)
  4. `Leaderboard`
  5. `Share winner` CTA
- Use Framer Motion to add **section entrance animations** as user scrolls (e.g. simple fade/slide on viewport entry) while keeping performance in mind.

## Implementation Order

1. **Scaffold Next.js + Tailwind project** (App Router, TypeScript, base config, dark theme in `layout.tsx`, add Lucide React and Framer Motion dependencies).
2. **Create types and data**: `Player` type and `players` mock dataset.
3. **Implement Zustand store** for players, selection, voting logic, leaderboard derivations, countdown deadline, and optional audio enabled flag.
4. **Build structural components**: `Hero`, base nominee grid in `page.tsx`, basic `PlayerCard` and `VoteButton` without advanced animations.
5. **Style the UI** with Tailwind to achieve the dark, neon, gaming-inspired look and ensure base responsiveness.
6. **Enhance with Framer Motion**: card hovers, button presses, section entrances, leaderboard transitions.
7. **Add gamification elements**: progress bars, vote celebration, `VoteResults` feedback section, animated ranking.
8. **Integrate bonus features**: crowd cheer sound with toggle, countdown timer, spotlight animations, and share winner UI.
9. **Polish responsiveness & accessibility**: test on small/medium/large viewports and keyboard navigation.
10. **Final cleanup**: remove unused code, ensure consistent naming and types, and verify the app runs cleanly in a fresh `npm install` + `npm run dev` setup.
