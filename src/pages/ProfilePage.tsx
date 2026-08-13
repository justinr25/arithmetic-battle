import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { ChevronLeft, Pencil } from "lucide-react";

export default function ProfilePage() {
    const {
        user,
        isLoggedIn,
        signOut,
        userStats,
        matchHistory,
        loading,
        updateUserDisplayName,
    } = useAuth();
    const navigate = useNavigate();

    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState("");

    useEffect(() => {
        if (!loading && (!isLoggedIn || !user)) {
            navigate("/");
        }
    }, [isLoggedIn, user, loading, navigate]);

    if (loading || !isLoggedIn || !user) {
        return null;
    }

    const handleSignOut = async () => {
        try {
            await signOut();
            sessionStorage.removeItem("playerId");
            sessionStorage.removeItem("playerName");
            navigate("/");
        } catch (error) {
            console.error("Sign out error:", error);
        }
    };

    const handleSaveName = async () => {
        if (!user || !editName.trim()) {
            setIsEditing(false);
            return;
        }
        try {
            await updateUserDisplayName(user.uid, editName);
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update name:", error);
        }
    };

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        });
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-base font-sans text-text w-full px-8 py-12">
            <button
                className="absolute top-8 left-8 text-overlay0 hover:text-text flex items-center gap-2 transition-colors font-bold text-sm tracking-widest"
                onClick={() => navigate("/")}
            >
                <ChevronLeft size={16} />
                Back
            </button>

            <button
                className="absolute top-8 right-8 text-red hover:text-red/80 flex items-center gap-2 transition-colors font-bold text-sm tracking-widest"
                onClick={handleSignOut}
            >
                Sign Out
            </button>

            <div className="flex flex-col items-center gap-8 mb-16 animate-fade-in">
                <div className="w-40 h-40 rounded-3xl overflow-hidden border-4 border-surface1">
                    <img
                        src={
                            user.photoURL ||
                            "https://api.dicebear.com/7.x/avataaars/svg?seed=Guest"
                        }
                        alt="Profile Avatar"
                        className="w-full h-full object-cover"
                    />
                </div>

                <div className="flex flex-col items-center">
                    {isEditing ? (
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                className="bg-surface0 border border-surface1 focus:border-mauve rounded-lg text-text px-4 py-2 font-bold outline-none transition-colors text-center text-2xl"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleSaveName();
                                }}
                            />
                            <button
                                className="bg-mauve hover:opacity-90 text-base px-4 py-2 rounded-lg font-bold transition-opacity"
                                onClick={handleSaveName}
                            >
                                Save
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-text text-center">
                                {userStats?.displayName || "Player"}
                            </h1>
                            <button
                                className="text-overlay0 hover:text-mauve transition-colors"
                                onClick={() => {
                                    setEditName(userStats?.displayName || "");
                                    setIsEditing(true);
                                }}
                                title="Edit Display Name"
                            >
                                <Pencil size={20} />
                            </button>
                        </div>
                    )}
                    <span className="text-overlay0 text-sm mt-2">
                        {user.email}
                    </span>
                </div>

                <div className="flex gap-16 mt-4">
                    <div className="flex flex-col items-center">
                        <span className="text-overlay0 text-xs font-bold tracking-widest uppercase mb-1">
                            Personal Best
                        </span>
                        <span className="text-2xl font-bold text-mauve">
                            {userStats?.personalBest || 0}
                        </span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-overlay0 text-xs font-bold tracking-widest uppercase mb-1">
                            Total Games
                        </span>
                        <span className="text-2xl font-bold text-mauve">
                            {userStats?.totalGames || 0}
                        </span>
                    </div>
                </div>
            </div>

            <h3 className="text-2xl font-bold tracking-tight text-text mt-12 mb-4">
                Match History
            </h3>
            <div
                className="w-full max-w-lg flex flex-col gap-3 mb-12 animate-fade-in"
                style={{ animationDelay: "0.1s" }}
            >
                {matchHistory.length === 0 ? (
                    <p className="text-overlay0 text-center py-4 italic">
                        No matches played yet.
                    </p>
                ) : (
                    matchHistory.map((match) => (
                        <div
                            key={match.id}
                            className="flex items-center justify-between bg-surface0 border border-surface1 p-4 rounded-xl shadow-sm"
                        >
                            <div className="flex flex-col">
                                <span className="font-bold text-text">
                                    vs {match.opponentName}
                                </span>
                                <span className="text-xs text-subtext0 font-bold uppercase tracking-widest mt-1">
                                    {formatDate(match.timestamp)} •{" "}
                                    {match.timeLimit}s Match
                                </span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-xl font-bold tracking-widest text-text">
                                    {match.myScore} - {match.opponentScore}
                                </span>
                                <span
                                    className={`px-3 py-1 rounded font-bold text-xs uppercase tracking-widest ${
                                        match.outcome === "win"
                                            ? "bg-green/10 text-green"
                                            : match.outcome === "loss"
                                              ? "bg-red/10 text-red"
                                              : "bg-overlay0/10 text-overlay0"
                                    }`}
                                >
                                    {match.outcome}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
