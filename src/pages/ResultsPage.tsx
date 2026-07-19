import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router"
import { startGame, subscribeToRoom, updateRematchRequest } from "../lib/firebase";
import type { Room } from "../lib/gameTypes";

export default function ResultsPage() {
    const { roomId } = useParams<{ roomId: string }>();
    const cleanRoomId = roomId || ""
    const navigate = useNavigate()
    const myId = sessionStorage.getItem("playerId") || ""

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

    // Auto-start rematch when both players have voted
    useEffect(() => {
        if (!room) return

        const hostId = room.hostId
        const guestId = room.guestId

        if (hostId && guestId) {
            const hostAgreed = room.rematchRequests?.[hostId] === true
            const guestAgreed = room.rematchRequests?.[guestId] === true

            if (hostAgreed && guestAgreed && room.status === "finished") {
                // Only the host writes the status update to Firestore to prevent races
                if (myId === hostId) {
                    startGame(cleanRoomId)
                }
            }
        }
    }, [room, myId, cleanRoomId])

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

    // get results from Firestore
    const myScore = room.scores[myId] ?? 0
    const oppId = room.hostId === myId ? room.guestId : room.hostId
    const oppScore = oppId ? (room.scores[oppId] ?? 0) : 0

    const rematchRequests = room.rematchRequests || {}
    const isMyRematchRequested = rematchRequests[myId] || false

    const handleRematch = () => {
        updateRematchRequest(cleanRoomId, myId, !isMyRematchRequested)
    }

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

                {/* rematch status indicators */}
                <div className="mt-3 p-2 bg-body-secondary rounded-2">
                    <p className="small mb-1 fw-semibold text-muted">Rematch Status</p>
                    <div className="d-flex justify-content-around small">
                        <span>
                            {room.hostName}: {room.rematchRequests?.[room.hostId] ? "✅ Ready" : "⏳ Thinking"}
                        </span>
                        {room.guestId && (
                            <span>
                                {room.guestName}: {room.rematchRequests?.[room.guestId] ? "✅ Ready" : "⏳ Thinking"}
                            </span>
                        )}
                    </div>
                </div>

                {/* rematch button */}
                <button
                    className={`btn btn-lg shadow-sm w-100 fw-semibold mt-2 ${
                        isMyRematchRequested ? "btn-success" : "btn-secondary"
                    }`}
                    onClick={handleRematch}
                >
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    {isMyRematchRequested ? "Waiting for opponent..." : "Rematch"}
                </button>
            </div>
        </div>
    )
}