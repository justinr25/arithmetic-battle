import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { signInAnonymously } from "firebase/auth";
import { auth, createRoom, joinRoom } from "../lib/firebase";
import { useAuth } from "../hooks/useAuth";
import AuthModal from "../components/AuthModal";
import { User, LogIn, Play } from "lucide-react";

export default function HomePage() {
    const { isLoggedIn, userStats } = useAuth();
    const [name, setName] = useState<string>("");
    const [isJoining, setIsJoining] = useState<boolean>(false);
    const [roomId, setRoomId] = useState<string>("");
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (isLoggedIn && userStats?.displayName) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setName(userStats.displayName);
        } else if (!isLoggedIn) {
            // Assign a random fun name if not logged in
            setName(
                (prev) => prev || `Guest${Math.floor(Math.random() * 1000)}`,
            );
        }
    }, [isLoggedIn, userStats]);

    const getOrSignInUser = async () => {
        if (isLoggedIn && auth.currentUser) return auth.currentUser.uid;
        const cred = await signInAnonymously(auth);
        return cred.user.uid;
    };

    const handleCreateRoom = async () => {
        if (!name.trim()) return;
        const uid = await getOrSignInUser();
        sessionStorage.setItem("playerId", uid);
        sessionStorage.setItem("playerName", name.trim());
        const newRoomId = await createRoom(uid, name.trim());
        navigate(`/room/${newRoomId}`);
    };

    const handleJoinRoom = async () => {
        if (!roomId.trim()) return;
        const uid = await getOrSignInUser();
        sessionStorage.setItem("playerId", uid);
        sessionStorage.setItem("playerName", name.trim());
        await joinRoom(roomId, uid, name.trim());
        navigate(`/room/${roomId}`);
    };

    return (
        <div className="flex flex-col min-h-screen bg-base text-text relative px-8 py-8">
            {/* Header */}
            <div className="absolute top-8 right-8 text-subtext0 text-sm font-medium z-10">
                <button
                    className="flex items-center gap-2 hover:text-text transition-colors font-bold tracking-widest"
                    onClick={() =>
                        isLoggedIn
                            ? navigate("/profile")
                            : setIsAuthModalOpen(true)
                    }
                >
                    {isLoggedIn ? <User size={16} /> : <LogIn size={16} />}
                    {isLoggedIn ? userStats?.displayName || "Profile" : "Login"}
                </button>
            </div>

            {/* Center Area */}
            <div className="flex-1 flex flex-col items-center justify-center">
                <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-text mb-8">
                    Arithmetic Battle
                </h1>

                {!isJoining ? (
                    <div className="flex gap-4">
                        <button
                            className="bg-mauve hover:opacity-90 text-base px-8 py-3 rounded-lg font-bold flex items-center gap-2 transition-opacity"
                            onClick={handleCreateRoom}
                        >
                            <Play size={18} fill="currentColor" />
                            Create Room
                        </button>
                        <button
                            className="bg-surface0 hover:bg-surface1 text-text px-8 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors border border-surface1"
                            onClick={() => setIsJoining(true)}
                        >
                            Join Room
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4 w-full max-w-xs animate-fade-in">
                        <input
                            type="text"
                            className="w-full bg-surface0 border border-surface1 focus:border-mauve rounded-lg text-text px-4 py-3 font-bold outline-none transition-colors uppercase tracking-widest text-center"
                            placeholder="ROOM ID"
                            value={roomId}
                            onChange={(e) =>
                                setRoomId(e.target.value.toUpperCase())
                            }
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleJoinRoom();
                                }
                            }}
                        />
                        <div className="flex gap-2">
                            <button
                                className="flex-1 bg-mauve hover:opacity-90 text-base px-4 py-3 rounded-lg font-bold transition-opacity"
                                onClick={handleJoinRoom}
                            >
                                Join
                            </button>
                            <button
                                className="flex-1 bg-surface0 hover:bg-surface1 text-text px-4 py-3 rounded-lg font-bold transition-colors border border-surface1"
                                onClick={() => setIsJoining(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
            />
        </div>
    );
}
