import { useState } from "react";
import { useNavigate } from "react-router";
import { signInAnonymously } from "firebase/auth";
import toast from "react-hot-toast";

import NameInput from "../components/NameInput";
import { auth, createRoom, joinRoom } from "../lib/firebase";
import RoomIdInput from "../components/RoomIdInput";

export default function HomePage() {
    const [name, setName] = useState<string>("");
    const [isJoining, setIsJoining] = useState<boolean>(false);
    const [roomId, setRoomId] = useState<string>("");
    const navigate = useNavigate();

    const handleCreateRoom = async () => {
        if (!name.trim()) {
            toast.error("Please enter a valid name.");
            return;
        }

        try {
            console.log("Creating room in database...");

            const cred = await signInAnonymously(auth);
            const uid = cred.user.uid;
            sessionStorage.setItem("playerId", uid);
            sessionStorage.setItem("playerName", name.trim());
            const roomId = await createRoom(uid, name.trim());

            navigate(`/room/${roomId}`);
        } catch (error) {
            console.error("Error creating room:", error);
            toast.error("Failed to create room. Please try again.");
        }
    };

    const handleJoinRoom = async () => {
        if (!roomId.trim()) {
            toast.error("Please enter a room ID.");
            return;
        }

        try {
            // authenticate guest anonymously
            const cred = await signInAnonymously(auth);
            const uid = cred.user.uid;

            // save info so we remember who they are on page refresh
            sessionStorage.setItem("playerId", uid);
            sessionStorage.setItem("playerName", name.trim());

            // update room in Firestore with guest details
            await joinRoom(roomId, uid, name.trim());

            // go to lobby
            navigate(`/room/${roomId}`);
        } catch (error: unknown) {
            console.error("Error joining room:", error);
            const errorMessage =
                error instanceof Error ? error.message : "Failed to join room. Please try again.";
            toast.error(errorMessage);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen w-full px-6 py-12">
            <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
                {/* Left Column: Clean bold typography */}
                <div className="text-left">
                    <h1 className="text-primary font-black text-5xl md:text-6xl tracking-tight mb-4">
                        Arithmetic Battle
                    </h1>
                    <p className="text-base-content/80 text-lg md:text-xl font-light leading-relaxed max-w-md">
                        Challenge players to a real-time mental math duel. Fast-paced, competitive arithmetic with no distraction.
                    </p>
                </div>

                {/* Right Column: Roomy uncluttered controls */}
                <div className="w-full max-w-md mx-auto md:mx-0">
                    {/* Pass down the 'name' state and the 'setName' function as props */}
                    {!isJoining && <NameInput value={name} onChange={setName} />}

                    {/* Render the greeting dynamically when name is typed */}
                    {name && !isJoining ? (
                        <div className="flex flex-col gap-4 mt-4">
                            <div className="alert bg-success/10 text-success border border-success/20 py-3 px-4 rounded-lg">
                                <div>
                                    <span className="font-bold">Hello, {name}!</span> Ready to play?
                                </div>
                            </div>

                            <button
                                className="btn btn-primary btn-lg w-full font-bold tracking-wide shadow-sm"
                                onClick={handleCreateRoom}
                            >
                                Create Room
                            </button>

                            <button
                                className="btn btn-neutral btn-outline btn-lg w-full font-bold tracking-wide"
                                onClick={() => setIsJoining(true)}
                            >
                                Join Room
                            </button>
                        </div>
                    ) : name && isJoining ? (
                        <div className="flex flex-col gap-4 mt-4">
                            {/* Subtle back navigation */}
                            <button
                                className="btn btn-ghost btn-sm self-start text-base-content/70 hover:text-base-content font-normal pl-0"
                                onClick={() => setIsJoining(false)}
                            >
                                ← Back to options
                            </button>

                            {/* room code input field */}
                            <RoomIdInput value={roomId} onChange={setRoomId} />

                            {/* join room button */}
                            <button
                                className="btn btn-primary btn-lg w-full font-bold tracking-wide shadow-sm"
                                onClick={handleJoinRoom}
                            >
                                Join Room
                            </button>
                        </div>
                    ) : (
                        <p className="text-base-content/60 mt-4 text-sm font-light">
                            Start typing above to register your player display name.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
