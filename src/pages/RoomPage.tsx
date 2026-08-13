import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { startGame, updateTimeLimit } from "../lib/firebase";
import { useRoom } from "../hooks/useRoom";

export default function RoomPage() {
    const { roomId } = useParams<{ roomId: string }>();
    const cleanRoomId = roomId || "";
    const navigate = useNavigate();

    const { room, loading, error } = useRoom(cleanRoomId);
    const [copied, setCopied] = useState<boolean>(false);

    const myId = sessionStorage.getItem("playerId");
    const amHost = room ? myId === room.hostId : false;

    useEffect(() => {
        if (room?.status === "playing") {
            navigate(`/game/${cleanRoomId}`);
        }
    }, [room?.status, cleanRoomId, navigate]);

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

    const handleCopyRoomId = () => {
        try {
            navigator.clipboard.writeText(cleanRoomId);
            setCopied(true);
            setTimeout(() => setCopied(false), 1000);
        } catch {
            // ignore error
        }
    };

    const handleStartGame = () => {
        startGame(cleanRoomId);
    };

    return (
        <div className="flex flex-col items-center min-h-screen bg-base text-text font-sans relative px-8 py-12 justify-center">
            
            <div className="w-full text-center mb-16 animate-fade-in">
                <div className="text-overlay0 text-xs font-bold uppercase tracking-widest mb-2">
                    Room Code
                </div>
                <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-mauve mb-6">
                    {cleanRoomId}
                </h1>
                {amHost && !room.guestId && (
                    <button
                        className="bg-surface0 hover:bg-surface1 text-text px-6 py-2 rounded-lg text-sm font-bold transition-colors border border-surface1"
                        onClick={handleCopyRoomId}
                    >
                        {copied ? "Copied!" : "Copy Code"}
                    </button>
                )}
            </div>

            <div className="w-full max-w-md bg-surface0 rounded-2xl p-6 mb-12 border border-surface1 animate-fade-in" style={{animationDelay: '0.1s'}}>
                <div className="text-overlay0 text-xs font-bold uppercase tracking-widest mb-6 border-b border-surface1 pb-2">
                    Players
                </div>
                <div className="flex flex-col gap-6">
                    <div className="flex justify-between items-center text-text">
                        <span className="font-bold text-xl">{room.hostName}</span>
                        <span className="text-xs text-overlay0 font-bold uppercase tracking-widest">Host</span>
                    </div>
                    <div className="flex justify-between items-center text-text">
                        {room.guestName ? (
                            <>
                                <span className="font-bold text-xl">{room.guestName}</span>
                                <span className="text-xs text-overlay0 font-bold uppercase tracking-widest">Guest</span>
                            </>
                        ) : (
                            <span className="text-overlay0 italic">Waiting for opponent...</span>
                        )}
                    </div>
                </div>
            </div>

            {amHost && (
                <div className="w-full max-w-md mb-12 animate-fade-in" style={{animationDelay: '0.2s'}}>
                    <div className="flex justify-between text-overlay0 text-xs font-bold uppercase tracking-widest mb-4">
                        <span>Time Limit</span>
                        <span className="text-text">{room.timeLimit}s</span>
                    </div>
                    <div className="flex justify-between gap-2">
                        {[15, 30, 60, 120].map((time) => (
                            <button
                                key={time}
                                onClick={() => updateTimeLimit(cleanRoomId, time)}
                                className={`flex-1 py-2 rounded-lg font-bold transition-colors border ${
                                    room.timeLimit === time
                                        ? "bg-mauve text-base border-mauve"
                                        : "bg-surface0 text-text hover:bg-surface1 border-surface1"
                                }`}
                            >
                                {time}s
                            </button>
                        ))}
                    </div>
                </div>
            )}
            {!amHost && (
                <div className="w-full max-w-md mb-12 flex justify-between text-overlay0 text-xs font-bold uppercase tracking-widest border-b border-surface1 pb-2 animate-fade-in" style={{animationDelay: '0.2s'}}>
                    <span>Time Limit</span>
                    <span className="text-text">{room.timeLimit}s</span>
                </div>
            )}

            <div className="w-full max-w-md flex flex-col gap-4 animate-fade-in" style={{animationDelay: '0.3s'}}>
                {amHost && room.guestId ? (
                    <button
                        className="w-full bg-mauve hover:opacity-90 text-base py-4 rounded-lg font-bold text-lg transition-opacity"
                        onClick={handleStartGame}
                    >
                        Start Game
                    </button>
                ) : !amHost && !room.guestId ? (
                    <div className="text-subtext0 text-center py-4 font-bold border border-surface1 rounded-lg border-dashed">
                        Joining...
                    </div>
                ) : !amHost ? (
                    <div className="text-subtext0 text-center py-4 font-bold border border-surface1 rounded-lg border-dashed">
                        Waiting for Host to start
                    </div>
                ) : null}

                <button
                    className="w-full text-overlay0 hover:text-text text-sm py-4 font-bold transition-colors"
                    onClick={() => navigate("/")}
                >
                    Leave Room
                </button>
            </div>
        </div>
    );
}
