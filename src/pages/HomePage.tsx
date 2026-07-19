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
        console.log("Creating room in database...");

        const cred = await signInAnonymously(auth);
        const uid = cred.user.uid;
        sessionStorage.setItem("playerId", uid);
        sessionStorage.setItem("playerName", name);
        const roomId = await createRoom(uid, name);

        navigate(`/room/${roomId}`);
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
            sessionStorage.setItem("playerName", name);

            // update room in Firestore with guest details
            await joinRoom(roomId, uid, name);

            // go to lobby
            navigate(`/room/${roomId}`);
        } catch (error) {
            console.error("Error joining room:", error);
            toast.error("Failed to join room. Please try again.");
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center min-vh-100">
            <div className="card shadow p-4 text-center border-0 bg-light-subtle">
                <h1 className="text-primary mb-2 fw-bold">
                    <i className="bi bi-calculator me-2"></i>
                    Arithmetic Battle
                </h1>
                <p className="text-muted small mb-4">
                    Challenge players to a real-time mental math duel
                </p>

                {/* Pass down the 'name' state and the 'setName' function as props */}
                {!isJoining && <NameInput value={name} onChange={setName} />}

                {/* Render the greeting dynamically when name is typed */}
                {name && !isJoining ? (
                    <>
                        <div className="alert alert-success mt-3 py-2 shadow-sm border-0 animate-fade-in">
                            <span className="fw-semibold">Hello, {name}!</span>{" "}
                            👋 Ready to play?
                        </div>

                        <button
                            className="btn btn-success btn-lg shadow-sm w-100 fw-semibold"
                            onClick={handleCreateRoom}
                        >
                            <i className="bi bi-people-fill me-2"></i>
                            Create Room
                        </button>

                        <button
                            className="btn btn-primary btn-lg shadow-sm w-100 fw-semibold mt-2"
                            onClick={() => setIsJoining(true)}
                        >
                            <i className="bi bi-door-open me-2"></i>
                            Join Room
                        </button>
                    </>
                ) : name && isJoining ? (
                    <>
                        {/* room code input field */}
                        <RoomIdInput value={roomId} onChange={setRoomId} />

                        {/* join room button */}
                        <button
                            className="btn btn-primary btn-lg shadow-sm w-100 fw-semibold"
                            onClick={handleJoinRoom}
                        >
                            <i className="bi bi-door-open me-2"></i>
                            Join Room
                        </button>

                        {/* back to options button */}
                        <button
                            className="btn btn-secondary btn-lg shadow-sm w-100 fw-semibold mt-2"
                            onClick={() => setIsJoining(false)}
                        >
                            <i className="bi bi-arrow-left me-2"></i>
                            Back to options
                        </button>
                    </>
                ) : (
                    <p className="text-muted mt-3 small">
                        Start typing above to register your player name.
                    </p>
                )}
            </div>
        </div>
    );
}

