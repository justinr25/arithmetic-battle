import { useState } from "react";
import { useNavigate } from "react-router";
import { signInAnonymously } from "firebase/auth";
import toast from "react-hot-toast";
import { Calculator, Users, DoorOpen, ArrowLeft } from "lucide-react";

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
        } catch (error: any) {
            console.error("Error joining room:", error);
            toast.error(error.message || "Failed to join room. Please try again.");
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen w-full p-4">
            <div className="card bg-base-200 shadow-xl p-6 text-center w-full max-w-md">
                <h1 className="text-primary mb-2 font-bold text-3xl flex items-center justify-center">
                    <Calculator className="w-8 h-8 mr-2" />
                    Arithmetic Battle
                </h1>
                <p className="text-base-content/70 text-sm mb-4">
                    Challenge players to a real-time mental math duel
                </p>

                {/* Pass down the 'name' state and the 'setName' function as props */}
                {!isJoining && <NameInput value={name} onChange={setName} />}

                {/* Render the greeting dynamically when name is typed */}
                {name && !isJoining ? (
                    <div className="flex flex-col gap-3 mt-4">
                        <div className="alert alert-success shadow-sm">
                            <span className="font-semibold">Hello, {name}!</span>{" "}
                            👋 Ready to play?
                        </div>

                        <button
                            className="btn btn-success btn-lg w-full font-semibold shadow-sm"
                            onClick={handleCreateRoom}
                        >
                            <Users className="w-5 h-5 mr-2" />
                            Create Room
                        </button>

                        <button
                            className="btn btn-primary btn-lg w-full font-semibold shadow-sm"
                            onClick={() => setIsJoining(true)}
                        >
                            <DoorOpen className="w-5 h-5 mr-2" />
                            Join Room
                        </button>
                    </div>
                ) : name && isJoining ? (
                    <div className="flex flex-col gap-3 mt-4">
                        {/* room code input field */}
                        <RoomIdInput value={roomId} onChange={setRoomId} />

                        {/* join room button */}
                        <button
                            className="btn btn-primary btn-lg w-full font-semibold shadow-sm"
                            onClick={handleJoinRoom}
                        >
                            <DoorOpen className="w-5 h-5 mr-2" />
                            Join Room
                        </button>

                        {/* back to options button */}
                        <button
                            className="btn btn-secondary btn-lg w-full font-semibold shadow-sm"
                            onClick={() => setIsJoining(false)}
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            Back to options
                        </button>
                    </div>
                ) : (
                    <p className="text-base-content/70 mt-4 text-sm">
                        Start typing above to register your player name.
                    </p>
                )}
            </div>
        </div>
    );
}
