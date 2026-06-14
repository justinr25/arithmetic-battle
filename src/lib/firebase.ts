import { initializeApp } from 'firebase/app'
import { getFirestore, doc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
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
export function subscribeToRoom(roomId: string, callback: (room: Room) => void): () => void {
  const roomRef = doc(db, "rooms", roomId)

  return onSnapshot(roomRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data() as Room)
    }
  })
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
