import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router"
import { startGame, subscribeToRoom } from "../lib/firebase";
import type { Room } from "../lib/gameTypes";

export default function ResultsPage() {
    const { roomId } = useParams<{ roomId: string }>();
    const cleanRoomId = roomId || ""
    const navigate = useNavigate()

    const [room, setRoom] = useState<Room | null>(null)
    
    // subscribe to room changes
    useEffect(() => {
        if (!cleanRoomId) return

        const unsubscribe = subscribeToRoom(cleanRoomId, (updatedRoom) => {
            setRoom(updatedRoom)
        })

        return unsubscribe
    }, [cleanRoomId])

    // redirect if the game is started again
    useEffect(() => {
        if (room?.status === "playing") {
            navigate(`/game/${cleanRoomId}`)
        }
    }, [room?.status, cleanRoomId, navigate])

    // Guard Clause: show a loading indicator until database data arrives
    if (!room) {
        return (
            <div className="container d-flex justify-content-center align-items-center min-vh-100">
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading results...</span>
                    </div>
                    <p className="mt-2 text-muted">Loading results...</p>
                </div>
            </div>
        )
    }

    const handleRematch = () => {
        console.log("Starting game...")

        startGame(cleanRoomId)

        navigate(`/game/${cleanRoomId}`)
    }

    // get results from Firestore
    const myId = sessionStorage.getItem("playerId") || ""
    const myScore = room.scores[myId] ?? 0
    const oppId = room.hostId === myId ? room.guestId : room.hostId
    const oppScore = oppId ? (room.scores[oppId] ?? 0) : 0
    
    const resultMessage = myScore > oppScore ? "You win!" : myScore < oppScore ? "You lose!" : "It's a tie!"

    return (
        <div className="container d-flex justify-content-center align-items-center min-vh-100">
            <div className="card shadow p-4 text-center border-0 bg-light-subtle">

                <h1 className="text-primary mb-3 fw-bold">
                    Results
                </h1>

                {/* scores */}
                <ul className="list-group">
                    <li className="list-group-item"><strong>{room.hostName}</strong> {room.scores[room.hostId] ?? 0}</li>
                    <li className="list-group-item"><strong>{room.guestName}</strong> {room.guestId ? (room.scores[room.guestId] ?? 0) : 0}</li>
                </ul>

                {/* display result message */}
                <p className="fs-5 mt-4 fw-semibold">{resultMessage}</p>

                {/* home button */}
                <button
                    className="btn btn-primary btn-lg shadow-sm w-100 fw-semibold"
                    onClick={() => navigate('/')}
                >
                    <i className="bi bi-house-door-fill me-2"></i>
                    Back to Home
                </button>

                {/* rematch button */}
                {/* TODO: implement requiring both players to click rematch */}
                <button
                    className="btn btn-secondary btn-lg shadow-sm w-100 fw-semibold mt-2"
                    onClick={handleRematch}
                >
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    Rematch
                </button>
            </div>
        </div>
    )
}