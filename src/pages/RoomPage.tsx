import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router"
import type { Room } from "../lib/gameTypes";
import { startGame, subscribeToRoom, updateTimeLimit } from "../lib/firebase";

export default function RoomPage() {
    const { roomId } = useParams<{ roomId: string }>();
    const cleanRoomId = roomId || ""
    const navigate = useNavigate();

    const [room, setRoom] = useState<Room | null>(null)
    const [copied, setCopied] = useState<boolean>(false)

    const myId = sessionStorage.getItem("playerId")
    const amHost = room ? myId === room.hostId : false

    // subscribe to room changes
    useEffect(() => {
        if (!cleanRoomId) return

        const unsubscribe = subscribeToRoom(cleanRoomId, (updatedRoom) => {
            setRoom(updatedRoom)
        })

        return unsubscribe
    }, [cleanRoomId])

    // redirect if the game has already started
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
                        <span className="visually-hidden">Loading room...</span>
                    </div>
                    <p className="mt-2 text-muted">Connecting to lobby...</p>
                </div>
            </div>
        )
    }

    const handleCopyRoomId = () => {
        try {
            navigator.clipboard.writeText(cleanRoomId)
            setCopied(true)
            setTimeout(() => setCopied(false), 1000)
        } catch (err) {
            console.error("Failed to copy room code:", err)
        }
    }

    const handleStartGame = () => {
        console.log("Starting game...")

        startGame(cleanRoomId)

        navigate(`/game/${cleanRoomId}`)
    }

    return (
        <div className="container d-flex justify-content-center align-items-center min-vh-100">
            <div className="card shadow p-4 text-center border-0 bg-light-subtle">
                <h1>Room {cleanRoomId}</h1>

                <ul className="list-group">
                    <li className="list-group-item"><strong>{room.hostName}</strong> <span className="text-muted">(Host)</span></li>
                    <li className="list-group-item"><strong>{room.guestName || <span className="fw-light text-muted">Waiting for opponent...</span>}</strong></li>
                </ul>

                {/* adjust game settings (time) */}
                {amHost && (
                    <div className="mt-3">
                        <label htmlFor="timeLimit" className="form-label">
                            Time Limit: {room.timeLimit} seconds
                        </label>
                        <input
                            type="range"
                            className="form-range"
                            id="timeLimit"
                            min="15"
                            max="180"
                            step="15"
                            value={room.timeLimit}
                            onChange={(e) => updateTimeLimit(cleanRoomId, Number(e.target.value))}
                        />
                    </div>
                )}

                {amHost && !room.guestId && (
                    <button className="btn btn-primary mt-2" onClick={handleCopyRoomId}>
                        {copied ? "Copied!" : "Copy Room ID"}
                    </button>
                )}

                {amHost && room.guestId && (
                    <button
                        className="btn btn-success btn-lg shadow-sm w-100 fw-semibold mt-2"
                        onClick={handleStartGame}
                    >
                        <i className="bi bi-play-fill me-2"></i>
                        Start Game
                    </button>
                )}

                {!amHost && (
                    // waiting for host to start the game
                    <p className="text-muted mt-3 mb-0 small">
                        Waiting for the host to start the game...
                    </p>
                )}
            </div>
        </div>
    )
}