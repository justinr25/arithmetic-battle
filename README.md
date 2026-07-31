# Arithmetic Battle

Arithmetic Battle is a real-time, multiplayer mental math duel. Players compete head-to-head in synchronized game rooms, solving algorithmic arithmetic problems against a countdown timer.

---

## Key Features

- **Instant Lobbies:** Create or join multiplayer rooms using unique 6-character codes and zero-friction Firebase Anonymous Authentication.
- **Fair Problem Synchronization:** Powered by a custom seeded pseudo-random number generator (Mulberry32) to ensure both players receive identical problems in identical sequence without latency.
- **Real-Time Score Syncing:** Live opponent scores and game room states are synchronized via Firebase Firestore persistent WebSocket listeners.
- **Interactive Rematches:** At the end of a match, players can initiate rematch requests to generate a fresh problem seed and reset scores for another round.
- **Defensive Room & Input Protection:**
  - **Full-Room Prevention:** Implements read-before-write validation to protect active duels from being interrupted or hijacked by a third player.
  - **Error Boundaries:** Attempting to access an expired, full, or non-existent room URL automatically terminates loading and safely redirects the user to the lobby with a non-blocking toast notification.
  - **Input Validation:** Enforces strict whitespace trimming on usernames and room codes, while gameplay inputs strictly filter for numerical characters.

---

## Architecture & Engineering Design

### 1. Deterministic Seeded RNG
A major challenge in competitive real-time puzzle games is synchronizing state between clients without introducing network latency or backend polling overhead for every generated puzzle.

To solve this, Arithmetic Battle implements a custom Mulberry32 seeded pseudo-random number generator (RNG) in `src/lib/problems.ts`:
- When a game session initializes, a single random `seed` integer is saved to the Firestore room document.
- Each client independently generates math equations on their local CPU using the formula `seed + problemIndex`.
- Because the Mulberry32 algorithm is deterministically invariant, both players receive identical questions in the same sequence with zero network round-trip overhead per problem.

### 2. Custom React Hooks Architecture
To decouple complex Firestore listener subscriptions and gameplay countdown timers from UI components, business logic is separated into specialized custom hooks:
- `useRoom(roomId)`: Governs active Firestore snapshot listeners, manages connection lifecycles, parses player roles (Host vs. Guest), and provides structured error handling.
- `useGameTimer(room)`: Manages the pre-game countdown sequence and ensures accurate gameplay timer synchronization across sessions.

---

## Technical Stack

- **Frontend:** React 19, TypeScript, Vite, React Router, Tailwind CSS v4, DaisyUI (Dracula theme), Lucide React, React Hot Toast
- **Backend:** Firebase Firestore, Firebase Anonymous Authentication
- **Testing & Tooling:** Vitest, ESLint, TypeScript Compiler (tsc)
- **Deployment:** Vercel

---

## Automated Test Integrity

The core problem generator is protected by a fast unit testing suite built with Vitest (`src/lib/problems.test.ts`). The test harness evaluates thousands of sample mathematical transformations to verify:
- **Absolute Determinism:** Identical seeds consistently produce identical operators and operands.
- **Arithmetic Invariants:**
  - **Subtraction:** Guarantees minuends are strictly greater than subtrahends so results are always positive integers.
  - **Division:** Guarantees operands divide cleanly without decimal remainders.
  - **Difficulty Bounds:** Asserts all generated integers remain within established fair gameplay boundaries.

---

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/justinr25/arithmetic-battle.git
cd arithmetic-battle
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory and populate it with your Firebase project configuration:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Run the development server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser. To test interactive multiplayer sessions locally on a single machine, open a second browser window using an Incognito or Private window.

---

## Available Scripts

- `npm run dev`: Starts the Vite local development server with Hot Module Replacement.
- `npm test`: Executes the Vitest automated testing suite for the core game engine.
- `npm run build`: Compiles TypeScript and packages an optimized production static build in `/dist`.
- `npm run preview`: Launches a local preview server to inspect the compiled production build.
- `npm run lint`: Runs ESLint across the codebase to enforce syntactic best practices.
