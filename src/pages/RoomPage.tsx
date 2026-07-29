import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { startGame, updateTimeLimit } from "../lib/firebase";
import { useRoom } from "../hooks/useRoom";
import toast from "react-hot-toast";
import { Play, Copy, Check, LogOut, Clock } from "lucide-react";

export default function RoomPage() {
    const { roomId } = useParams<{ roomId: string }>();
    const cleanRoomId = roomId || "";
    const navigate = useNavigate();

    const { room, loading, error } = useRoom(cleanRoomId);
    const [copied, setCopied] = useState<boolean>(false);

    const myId = sessionStorage.getItem("playerId");
    const amHost = room ? myId === room.hostId : false;

    // redirect if the game has already started
    useEffect(() => {
        if (room?.status === "playing") {
            navigate(`/game/${cleanRoomId}`);
        }
    }, [room?.status, cleanRoomId, navigate]);

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
            <div className="flex justify-center items-center min-h-screen w-full">
                <div className="text-center">
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                    <p className="mt-2 text-base-content/70">Connecting to lobby...</p>
                </div>
            </div>
        );
    }

    const handleCopyRoomId = () => {
        try {
            navigator.clipboard.writeText(cleanRoomId);
            setCopied(true);
            setTimeout(() => setCopied(false), 1000);
        } catch (err) {
            console.error("Failed to copy room code:", err);
        }
    };

    const handleStartGame = () => {
        console.log("Starting game...");
        startGame(cleanRoomId);
        navigate(`/game/${cleanRoomId}`);
    };

    return (
        <div className="flex justify-center items-center min-h-screen w-full p-4">
            <div className="card bg-base-200 shadow-xl w-full max-w-md border border-base-300">
                <div className="card-body text-center p-6">
                    <h1 className="text-3xl font-bold mb-4">Room {cleanRoomId}</h1>

                    <div className="border border-base-300 rounded-box divide-y divide-base-300 bg-base-100">
                        <div className="p-4">
                            <strong>{room.hostName}</strong>{" "}
                            <span className="text-base-content/70 text-sm">(Host)</span>
                        </div>
                        <div className="p-4">
                            <strong>
                                {room.guestName || (
                                    <span className="font-light text-base-content/70">
                                        Waiting for opponent...
                                    </span>
                                )}
                            </strong>
                        </div>
                    </div>

                    {/* adjust game settings (time) */}
                    {amHost && (
                        <div className="mt-6 text-left">
                            <label htmlFor="timeLimit" className="label">
                                <span className="label-text flex items-center gap-2 text-base">
                                    <Clock className="w-5 h-5" /> Time Limit: {room.timeLimit} seconds
                                </span>
                            </label>
                            <input
                                type="range"
                                className="range range-primary"
                                id="timeLimit"
                                min="15"
                                max="180"
                                step="15"
                                value={room.timeLimit}
                                onChange={(e) =>
                                    updateTimeLimit(cleanRoomId, Number(e.target.value))
                                }
                            />
                            <div className="w-full flex justify-between text-xs px-2 mt-2">
                                <span>15s</span>
                                <span>180s</span>
                            </div>
                        </div>
                    )}

                    {/* show the selected time limit to the guest */}
                    {!amHost && (
                        <div className="mt-6 alert alert-info py-2 shadow-sm flex justify-center">
                            <Clock className="w-5 h-5" />
                            <span>
                                Selected Time Limit: <strong>{room.timeLimit} seconds</strong>
                            </span>
                        </div>
                    )}

                    {amHost && !room.guestId && (
                        <button className="btn btn-primary mt-6 w-full" onClick={handleCopyRoomId}>
                            {copied ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Check className="w-5 h-5" /> Copied!
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    <Copy className="w-5 h-5" /> Copy Room ID
                                </span>
                            )}
                        </button>
                    )}

                    {amHost && room.guestId && (
                        <button
                            className="btn btn-success btn-lg shadow-sm w-full font-semibold mt-6 flex items-center justify-center gap-2"
                            onClick={handleStartGame}
                        >
                            <Play className="w-5 h-5" />
                            Start Game
                        </button>
                    )}

                    {!amHost && (
                        // waiting for host to start the game
                        <p className="text-base-content/70 mt-6 mb-0 text-sm">
                            Waiting for the host to start the game...
                        </p>
                    )}

                    <button 
                        className="btn btn-outline btn-error mt-6 w-full font-semibold flex items-center justify-center gap-2"
                        onClick={() => navigate("/")}
                    >
                        <LogOut className="w-5 h-5" />
                        Leave Room
                    </button>
                </div>
            </div>
        </div>
    );
}
