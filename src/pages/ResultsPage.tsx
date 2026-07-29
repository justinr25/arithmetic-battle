import { useEffect } from "react"
import { useNavigate, useParams } from "react-router"
import { startGame, updateRematchRequest } from "../lib/firebase";
import { useRoom } from "../hooks/useRoom";
import toast from "react-hot-toast";
import { Home, RotateCcw, Trophy } from "lucide-react";

export default function ResultsPage() {
    const { roomId } = useParams<{ roomId: string }>();
    const cleanRoomId = roomId || ""
    const navigate = useNavigate()
    const myId = sessionStorage.getItem("playerId") || ""

    const { room, loading, error } = useRoom(cleanRoomId);

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

    // Handle Error State: Automatically redirect to home
    useEffect(() => {
        if (error) {
            toast.error(error);
            navigate("/");
        }
    }, [error, navigate]);

    // Guard Clause: show a loading indicator until database data arrives (or if we are redirecting due to error)
    if (loading || !room || error) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center flex flex-col items-center gap-2">
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                    <p className="mt-2 text-base-content/70">Loading results...</p>
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
    const resultMessage = myScore > oppScore ? "You win!" : myScore < oppScore ? "You lose!" : "It's a tie!"
    const resultColor = myScore > oppScore ? "text-success" : myScore < oppScore ? "text-error" : "text-warning"
    
    const hostScore = room.scores[room.hostId] ?? 0
    const guestScore = room.guestId ? (room.scores[room.guestId] ?? 0) : 0
    const isHostWinner = hostScore > guestScore
    const isGuestWinner = guestScore > hostScore

    const handleRematch = () => {
        updateRematchRequest(cleanRoomId, myId, !isMyRematchRequested)
    }

    return (
        <div className="flex justify-center items-center min-h-screen p-4">
            <div className="card w-full max-w-md bg-base-200 shadow-xl text-center">
                <div className="card-body items-center">

                    <h1 className="text-4xl font-bold text-primary mb-6 flex items-center gap-3">
                        <Trophy className="w-8 h-8 text-warning" />
                        Results
                        <Trophy className="w-8 h-8 text-warning" />
                    </h1>

                    {/* scores */}
                    <div className="stats shadow bg-base-100 w-full mb-4">
                        <div className="stat place-items-center">
                            <div className="stat-title font-semibold text-base-content flex items-center gap-2">
                                {room.hostName} {isHostWinner && <Trophy className="w-4 h-4 text-warning" />}
                            </div>
                            <div className="stat-value text-primary">{hostScore}</div>
                        </div>
                        <div className="stat place-items-center">
                            <div className="stat-title font-semibold text-base-content flex items-center gap-2">
                                {room.guestName} {isGuestWinner && <Trophy className="w-4 h-4 text-warning" />}
                            </div>
                            <div className="stat-value text-secondary">{guestScore}</div>
                        </div>
                    </div>

                    {/* display result message */}
                    <p className={`text-2xl mt-4 font-bold ${resultColor}`}>{resultMessage}</p>

                    <div className="w-full mt-6 space-y-3">
                        {/* home button */}
                        <button
                            className="btn btn-primary btn-lg w-full"
                            onClick={() => navigate('/')}
                        >
                            <Home className="w-5 h-5" />
                            Back to Home
                        </button>

                        {/* rematch status indicators */}
                        <div className="bg-base-300 rounded-xl p-4 mt-4">
                            <p className="text-sm mb-3 font-semibold text-base-content/70">Rematch Status</p>
                            <div className="flex justify-around text-sm">
                                <span className="flex flex-col items-center">
                                    <span className="font-bold">{room.hostName}</span>
                                    <span className={`mt-1 badge ${room.rematchRequests?.[room.hostId] ? "badge-success" : "badge-warning"}`}>
                                        {room.rematchRequests?.[room.hostId] ? "Ready" : "Thinking..."}
                                    </span>
                                </span>
                                {room.guestId && (
                                    <span className="flex flex-col items-center">
                                        <span className="font-bold">{room.guestName}</span>
                                        <span className={`mt-1 badge ${room.rematchRequests?.[room.guestId] ? "badge-success" : "badge-warning"}`}>
                                            {room.rematchRequests?.[room.guestId] ? "Ready" : "Thinking..."}
                                        </span>
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* rematch button */}
                        <button
                            className={`btn btn-lg w-full mt-2 ${
                                isMyRematchRequested ? "btn-success" : "btn-secondary"
                            }`}
                            onClick={handleRematch}
                        >
                            <RotateCcw className={`w-5 h-5 ${isMyRematchRequested ? "animate-spin" : ""}`} />
                            {isMyRematchRequested ? "Waiting for opponent..." : "Rematch"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}