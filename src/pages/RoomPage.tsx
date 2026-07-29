import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { startGame, updateTimeLimit } from "../lib/firebase";
import { useRoom } from "../hooks/useRoom";
import toast from "react-hot-toast";

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
                    <p className="mt-2 text-base-content/70">
                        Connecting to lobby...
                    </p>
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
        <div className="flex justify-center items-center min-h-screen w-full px-6 py-12">
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-start">
                {/* Left Column: Room Code and Settings */}
                <div className="flex flex-col gap-6 text-left">
                    <div>
                        <span className="text-xs uppercase tracking-widest text-base-content/60 font-bold">
                            Lobby Code
                        </span>
                        <h1 className="text-5xl md:text-6xl font-black text-primary tracking-wider mt-1 mb-4">
                            {cleanRoomId}
                        </h1>
                        {amHost && !room.guestId && (
                            <button
                                className="btn btn-outline btn-primary btn-sm font-semibold tracking-wide"
                                onClick={handleCopyRoomId}
                            >
                                {copied
                                    ? "Copied to Clipboard!"
                                    : "Copy Room ID"}
                            </button>
                        )}
                    </div>

                    {/* adjust game settings (time) */}
                    {amHost && (
                        <div className="mt-4 bg-base-200/50 p-6 rounded-xl border border-base-300/50">
                            <label
                                htmlFor="timeLimit"
                                className="label px-0 pt-0"
                            >
                                <span className="label-text font-semibold text-base">
                                    Time Limit: {room.timeLimit} seconds
                                </span>
                            </label>
                            <input
                                type="range"
                                className="range range-primary my-2"
                                id="timeLimit"
                                min="15"
                                max="180"
                                step="15"
                                value={room.timeLimit}
                                onChange={(e) =>
                                    updateTimeLimit(
                                        cleanRoomId,
                                        Number(e.target.value),
                                    )
                                }
                            />
                            <div className="w-full flex justify-between text-xs text-base-content/60 px-1">
                                <span>15s</span>
                                <span>180s</span>
                            </div>
                        </div>
                    )}

                    {/* show the selected time limit to the guest */}
                    {!amHost && (
                        <div className="alert bg-base-200 border border-base-300 shadow-none py-4 text-left">
                            <div>
                                <div className="text-xs font-semibold uppercase tracking-wider opacity-70">
                                    Time Limit
                                </div>
                                <div className="text-lg font-bold text-base-content">
                                    {room.timeLimit} seconds
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Player Matchup & Actions */}
                <div className="flex flex-col gap-6 w-full bg-base-200/40 p-6 md:p-8 rounded-2xl border border-base-300/40">
                    <div>
                        <span className="text-xs uppercase tracking-widest text-base-content/60 font-bold mb-3 block text-left">
                            Matchup
                        </span>
                        <div className="divide-y divide-base-300/50">
                            <div className="py-3 flex justify-between items-center text-left">
                                <span className="font-bold text-lg text-base-content">
                                    {room.hostName}
                                </span>
                                <span className="badge badge-success badge-outline font-light">
                                    Host
                                </span>
                            </div>
                            <div className="py-3 flex justify-between items-center text-left">
                                {room.guestName ? (
                                    <>
                                        <span className="font-bold text-lg text-base-content">
                                            {room.guestName}
                                        </span>
                                        <span className="badge badge-ghost badge-outline font-light">
                                            Guest
                                        </span>
                                    </>
                                ) : (
                                    <span className="font-light italic text-base-content/50">
                                        Waiting for opponent...
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 mt-4">
                        {amHost && room.guestId && (
                            <button
                                className="btn btn-success btn-lg w-full font-bold tracking-wide shadow-sm"
                                onClick={handleStartGame}
                            >
                                Start Game
                            </button>
                        )}

                        {!amHost && (
                            <div className="text-base-content/70 text-sm font-light italic text-left py-2">
                                Waiting for the host to start the game...
                            </div>
                        )}

                        <button
                            className="btn btn-ghost text-error w-full font-semibold mt-2 hover:bg-error/10"
                            onClick={() => navigate("/")}
                        >
                            Leave Room
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
