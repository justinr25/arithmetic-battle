import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { startGame, updateRematchRequest } from "../lib/firebase";
import { useRoom } from "../hooks/useRoom";
import toast from "react-hot-toast";

export default function ResultsPage() {
    const { roomId } = useParams<{ roomId: string }>();
    const cleanRoomId = roomId || "";
    const navigate = useNavigate();
    const myId = sessionStorage.getItem("playerId") || "";

    const { room, loading, error } = useRoom(cleanRoomId);

    // redirect if the game is started again
    useEffect(() => {
        if (room?.status === "playing") {
            navigate(`/game/${cleanRoomId}`);
        }
    }, [room?.status, cleanRoomId, navigate]);

    // Auto-start rematch when both players have voted
    useEffect(() => {
        if (!room) return;
        const hostId = room.hostId;
        const guestId = room.guestId;
        if (hostId && guestId) {
            const hostAgreed = room.rematchRequests?.[hostId] === true;
            const guestAgreed = room.rematchRequests?.[guestId] === true;
            if (hostAgreed && guestAgreed && room.status === "finished") {
                // Only the host writes the status update to Firestore to prevent races
                if (myId === hostId) {
                    startGame(cleanRoomId);
                }
            }
        }
    }, [room, myId, cleanRoomId]);

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
                    <p className="mt-2 text-base-content/70">
                        Loading results...
                    </p>
                </div>
            </div>
        );
    }

    // get results from Firestore
    const myScore = room.scores[myId] ?? 0;
    const oppId = room.hostId === myId ? room.guestId : room.hostId;
    const oppScore = oppId ? (room.scores[oppId] ?? 0) : 0;
    const rematchRequests = room.rematchRequests || {};
    const isMyRematchRequested = rematchRequests[myId] || false;
    const resultMessage =
        myScore > oppScore
            ? "You win!"
            : myScore < oppScore
              ? "You lose!"
              : "It's a tie!";
    const resultColor =
        myScore > oppScore
            ? "text-success"
            : myScore < oppScore
              ? "text-error"
              : "text-warning";

    const hostScore = room.scores[room.hostId] ?? 0;
    const guestScore = room.guestId ? (room.scores[room.guestId] ?? 0) : 0;
    const isHostWinner = hostScore > guestScore;
    const isGuestWinner = guestScore > hostScore;

    const handleRematch = () => {
        updateRematchRequest(cleanRoomId, myId, !isMyRematchRequested);
    };

    return (
        <div className="flex flex-col justify-center items-center min-h-screen w-full px-6 py-12">
            <div className="w-full max-w-4xl text-center">
                {/* Result Header */}
                <h1
                    className={`text-6xl md:text-7xl font-black tracking-tight mb-3 ${resultColor}`}
                >
                    {resultMessage}
                </h1>
                <p className="text-base-content/60 text-base uppercase tracking-widest font-bold mb-12">
                    Match Final Scores
                </p>

                {/* Side-by-Side Oversized Scores */}
                <div className="grid grid-cols-2 gap-8 max-w-2xl mx-auto my-6 p-8 bg-base-200/40 rounded-3xl border border-base-300/40">
                    <div className="flex flex-col items-center border-r border-base-300/30">
                        <span className="text-lg font-bold text-base-content/90 flex items-center gap-2">
                            {room.hostName}{" "}
                            {isHostWinner && (
                                <span className="text-xs uppercase tracking-wider text-warning font-black">
                                    (Winner)
                                </span>
                            )}
                        </span>
                        <span className="text-6xl md:text-7xl font-black text-primary my-4">
                            {hostScore}
                        </span>
                        <span className="text-xs text-base-content/50 uppercase font-semibold">
                            Host
                        </span>
                    </div>

                    <div className="flex flex-col items-center">
                        <span className="text-lg font-bold text-base-content/90 flex items-center gap-2">
                            {room.guestName}{" "}
                            {isGuestWinner && (
                                <span className="text-xs uppercase tracking-wider text-warning font-black">
                                    (Winner)
                                </span>
                            )}
                        </span>
                        <span className="text-6xl md:text-7xl font-black text-secondary my-4">
                            {guestScore}
                        </span>
                        <span className="text-xs text-base-content/50 uppercase font-semibold">
                            Opponent
                        </span>
                    </div>
                </div>

                {/* Clean Action Bar & Rematch Coordination */}
                <div className="max-w-xl mx-auto mt-12 flex flex-col gap-6">
                    <div className="flex justify-between items-center py-3 px-6 bg-base-200/50 rounded-xl border border-base-300/30">
                        <div className="flex items-center gap-3">
                            <span className="font-semibold text-sm">
                                {room.hostName}
                            </span>
                            <span
                                className={`badge badge-sm font-bold ${room.rematchRequests?.[room.hostId] ? "badge-success" : "badge-neutral"}`}
                            >
                                {room.rematchRequests?.[room.hostId]
                                    ? "Ready"
                                    : "Thinking"}
                            </span>
                        </div>
                        <span className="text-xs uppercase tracking-wider font-bold text-base-content/40">
                            Rematch Status
                        </span>
                        {room.guestId && (
                            <div className="flex items-center gap-3">
                                <span className="font-semibold text-sm">
                                    {room.guestName}
                                </span>
                                <span
                                    className={`badge badge-sm font-bold ${room.rematchRequests?.[room.guestId] ? "badge-success" : "badge-neutral"}`}
                                >
                                    {room.rematchRequests?.[room.guestId]
                                        ? "Ready"
                                        : "Thinking"}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                            className={`btn btn-lg font-bold tracking-wide w-full shadow-sm ${
                                isMyRematchRequested
                                    ? "btn-success"
                                    : "btn-primary"
                            }`}
                            onClick={handleRematch}
                        >
                            {isMyRematchRequested
                                ? "Waiting for opponent..."
                                : "Request Rematch"}
                        </button>

                        <button
                            className="btn btn-outline btn-neutral btn-lg font-bold tracking-wide w-full"
                            onClick={() => navigate("/")}
                        >
                            Back to Home
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

