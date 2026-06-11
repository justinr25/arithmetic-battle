# Arithmetic Battle

Arithmetic Battle is a real-time, multiplayer mental math duel. Players go head-to-head to solve arithmetic problems as fast as they can before the timer runs out.

## Key Features

- **Instant Multiplayer Rooms:** Host matches and invite friends using unique 6-character room codes.
- **Fair Problem Sync:** Utilizes a custom seeded pseudo-random number generator (Mulberry32) so both players receive the **exact same math problems** in the **exact same order**.
- **Real-time Scoring:** Live opponent scores are synced on-screen using Firebase Firestore listener subscriptions.
- **Multiplayer Rematches:** Instantly launch a rematch that resets scores and generates a new math problem sequence.
- **Anonymous Authentication:** Zero-friction entry using Firebase Anonymous Authentication.

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, React Router, Bootstrap 5 (with Bootstrap Icons)
- **Backend:** Firebase (Firestore Database, Anonymous Auth)
- **Hosting:** Vercel

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

### 3. Setup environment variables
Create a `.env` file in the root directory and add your Firebase credentials:
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

---

## Available Scripts

- `npm run dev`: Starts the local Vite development server.
- `npm run build`: Compiles TypeScript and builds the optimized production static bundle in the `/dist` folder.
- `npm run preview`: Previews the built production site locally.
