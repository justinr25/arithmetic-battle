import { useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useRoom } from "../hooks/useRoom";

export default function ResultsPage() {
    const { roomId } = useParams<{ roomId: string }>();
    const cleanRoomId = roomId || "";
    const navigate = useNavigate();
    const { room, loading, error } = useRoom(cleanRoomId);

    const myId = sessionStorage.getItem("playerId");

    useEffect(() => {
        if (error) {
            navigate("/");
        }
    }, [error, navigate]);

    if (loading || !room || error) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-base font-sans text-subtext0">
                LOADING...
            </div>
        );
    }

    const hostScore = room.scores?.[room.hostId] || 0;
    const guestScore = room.guestId ? room.scores?.[room.guestId] || 0 : 0;
    const myScore = room.scores?.[myId || ""] || 0;
    const opponentScore = myId === room.hostId ? guestScore : hostScore;

    let resultMessage = "Tie";
    if (myScore > opponentScore) resultMessage = "You Won!";
    else if (myScore < opponentScore) resultMessage = "You Lost";

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-base font-sans text-text w-full px-8 py-12">
            <div className="text-center mb-16 animate-fade-in">
                <p className="text-overlay0 text-xs font-bold uppercase tracking-widest mb-4">
                    Room {cleanRoomId}
                </p>
                <h1 className="text-6xl md:text-7xl font-bold tracking-tight mb-4 text-text">
                    {resultMessage}
                </h1>
            </div>

            <div className="w-full max-w-lg mb-16 animate-fade-in" style={{animationDelay: '0.1s'}}>
                <div className="flex justify-between items-center border-b border-surface1 pb-6 mb-6">
                    <div className="flex flex-col">
                        <span className="text-overlay0 text-xs font-bold uppercase tracking-widest mb-1">You</span>
                        <span className="text-text text-4xl font-bold">{myScore}</span>
                    </div>
                </div>

                <div className="flex justify-between items-center border-b border-surface1 pb-6">
                    <div className="flex flex-col">
                        <span className="text-overlay0 text-xs font-bold uppercase tracking-widest mb-1">
                            {myId === room.hostId ? room.guestName : room.hostName}
                        </span>
                        <span className="text-subtext0 text-4xl font-bold">{opponentScore}</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col w-full max-w-sm gap-4 animate-fade-in" style={{animationDelay: '0.2s'}}>
                <button
                    className="w-full bg-mauve hover:opacity-90 text-base py-4 rounded-lg font-bold text-lg transition-opacity"
                    onClick={() => navigate(`/room/${cleanRoomId}`)}
                >
                    Play Again
                </button>
                <button
                    className="w-full text-overlay0 hover:text-text text-sm py-4 font-bold transition-colors"
                    onClick={() => navigate("/")}
                >
                    Return to Home
                </button>
            </div>
        </div>
    );
}
