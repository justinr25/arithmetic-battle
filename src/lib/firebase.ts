import { initializeApp } from 'firebase/app'
import { getFirestore, doc, setDoc, updateDoc, onSnapshot, getDoc, increment, collection, query, orderBy, limit } from 'firebase/firestore'
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'
import type { Room } from './gameTypes'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)

// helper to generate random 6-character room id (e.g. "ABC123")
function generateRandomId(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 6; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return result
}

// create new game room document in Firestore
export async function createRoom(hostId: string, hostName: string): Promise<string> {
  const roomId = generateRandomId();
  const roomRef = doc(db, "rooms", roomId)
  const seed = Math.floor(Math.random() * 1000000) // shared random seed

  const newRoom: Room = {
    id: roomId,
    hostId,
    hostName,
    guestId: null,
    guestName: null,
    status: 'waiting',
    seed,
    startTime: null,
    scores: { [hostId]: 0 },
    timeLimit: 120,
    rematchRequests: {}
  }

  await setDoc(roomRef, newRoom)
  return roomId
}
    
// add guest to an existing room
export async function joinRoom(roomId: string, guestId: string, guestName: string): Promise<void> {
  const roomRef = doc(db, "rooms", roomId)
  const roomSnap = await getDoc(roomRef)

  if (!roomSnap.exists()) {
    throw new Error("Room not found")
  }

  const room = roomSnap.data() as Room
  if (room.guestId && room.guestId !== guestId) {
    throw new Error("Room is already full")
  }

  await updateDoc(roomRef, {
    guestId,
    guestName,
    [`scores.${guestId}`]: 0 
  })
}

// update a single player's score using dot-notation to avoid overwriting other scores
export async function updateScore(roomId: string, playerId: string, score: number): Promise<void> {
  const roomRef = doc(db, "rooms", roomId)

  await updateDoc(roomRef, {
    [`scores.${playerId}`]: score
  })
}

// 
export async function updateTimeLimit(roomId: string, timeLimit: number): Promise<void> {
    const roomRef = doc(db, "rooms", roomId)

    await updateDoc(roomRef, {
        timeLimit
    })
}

export async function updateRematchRequest(roomId: string, playerId: string, requested: boolean): Promise<void> {
    const roomRef = doc(db, "rooms", roomId)

    await updateDoc(roomRef, {
        [`rematchRequests.${playerId}`]: requested
    })
}

// listen to real-time updates to the room document
export function subscribeToRoom(
  roomId: string, 
  onSuccess: (room: Room) => void,
  onError?: (error: Error) => void
): () => void {
  const roomRef = doc(db, "rooms", roomId)

  return onSnapshot(
    roomRef, 
    (snapshot) => {
      if (snapshot.exists()) {
        onSuccess(snapshot.data() as Room)
      } else if (onError) {
        onError(new Error("Room not found. Please check the code and try again."))
      }
    },
    (error) => {
      if (onError) onError(error)
    }
  )
}

// flip status to "playing" — both players' listeners will react immediately
export async function startGame(roomId: string): Promise<void> {
    const roomRef = doc(db, "rooms", roomId)
    const seed = Math.floor(Math.random() * 1000000)

    await updateDoc(roomRef, {
        status: "playing",
        seed,
        scores: {},
        startTime: Date.now() + 5000, // shared start time (5 sec into future)
        rematchRequests: {}
    })
}

// flip status to "finished" — triggers navigation to results on all clients
export async function finishGame(roomId: string): Promise<void> {
    const roomRef = doc(db, "rooms", roomId)
    await updateDoc(roomRef, { status: "finished" })
}

// Google Auth Helpers
const googleProvider = new GoogleAuthProvider()

export async function signInWithGoogle() {
    const result = await signInWithPopup(auth, googleProvider);
    if (result.user) {
        await initUserDoc(result.user.uid, result.user.displayName || "Player");
    }
    return result;
}

export interface UserStats {
    personalBest: number;
    totalGames: number;
    displayName: string;
}

export async function initUserDoc(uid: string, displayName: string): Promise<void> {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
        await setDoc(userRef, {
            personalBest: 0,
            totalGames: 0,
            displayName
        });
    }
}

export interface MatchRecord {
    id: string; // The original roomId
    timestamp: number; // For sorting
    opponentName: string; // Exact name at the time
    myScore: number;
    opponentScore: number;
    outcome: "win" | "loss" | "draw";
    timeLimit: number;
}

export async function recordUserMatch(uid: string, room: Room): Promise<void> {
    const isHost = uid === room.hostId;
    const opponentId = isHost ? room.guestId : room.hostId;
    const opponentName = isHost ? room.guestName : room.hostName;
    const myScore = room.scores[uid] || 0;
    const opponentScore = opponentId ? (room.scores[opponentId] || 0) : 0;
    
    let outcome: "win" | "loss" | "draw" = "draw";
    if (myScore > opponentScore) outcome = "win";
    else if (myScore < opponentScore) outcome = "loss";
    
    const matchRecord: MatchRecord = {
        id: room.id,
        timestamp: Date.now(),
        opponentName: opponentName || "Unknown",
        myScore,
        opponentScore,
        outcome,
        timeLimit: room.timeLimit || 60
    };

    const userRef = doc(db, "users", uid);
    const matchRef = doc(db, "users", uid, "matches", room.id);

    // Save match
    await setDoc(matchRef, matchRecord);

    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
        const data = userSnap.data() as UserStats;
        const updates: any = {
            totalGames: increment(1)
        };
        if (myScore > data.personalBest) {
            updates.personalBest = myScore;
        }
        await updateDoc(userRef, updates);
    } else {
        await setDoc(userRef, {
            personalBest: myScore,
            totalGames: 1,
            displayName: "Player"
        });
    }
}

export function subscribeToMatchHistory(
  uid: string,
  onSuccess: (matches: MatchRecord[]) => void
): () => void {
  const matchesRef = collection(db, "users", uid, "matches");
  const q = query(matchesRef, orderBy("timestamp", "desc"), limit(20));
  
  return onSnapshot(q, (snapshot) => {
      const matches: MatchRecord[] = [];
      snapshot.forEach((doc) => matches.push(doc.data() as MatchRecord));
      onSuccess(matches);
  });
}

export function subscribeToUser(
  uid: string,
  onSuccess: (stats: UserStats) => void
): () => void {
  const userRef = doc(db, "users", uid);
  return onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
          onSuccess(snapshot.data() as UserStats);
      }
  });
}

export async function signOutUser() {
    return signOut(auth)
}
