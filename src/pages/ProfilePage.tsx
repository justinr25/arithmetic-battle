import { useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { ChevronLeft } from "lucide-react";

export default function ProfilePage() {
    const { user, isLoggedIn, signOut } = useAuth();
    const navigate = useNavigate();

    if (!isLoggedIn || !user) {
        navigate("/");
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

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-base font-sans text-text w-full px-8 py-12">
            
            <button
                className="absolute top-8 left-8 text-overlay0 hover:text-text flex items-center gap-2 transition-colors font-bold text-sm uppercase tracking-widest"
                onClick={() => navigate("/")}
            >
                <ChevronLeft size={16} />
                Back
            </button>

            <div className="flex flex-col items-center gap-8 mb-16 animate-fade-in">
                <div className="w-40 h-40 rounded-3xl overflow-hidden border-4 border-surface1">
                    <img
                        src={user.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=Guest"}
                        alt="Profile Avatar"
                        className="w-full h-full object-cover"
                    />
                </div>
                
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-text text-center">
                    {user.displayName || "Player"}
                </h1>

                <div className="flex gap-16 mt-4">
                    <div className="flex flex-col items-center">
                        <span className="text-overlay0 text-xs font-bold tracking-widest uppercase mb-1">
                            Personal Best
                        </span>
                        <span className="text-2xl font-bold text-mauve">0</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-overlay0 text-xs font-bold tracking-widest uppercase mb-1">
                            Total Games
                        </span>
                        <span className="text-2xl font-bold text-mauve">0</span>
                    </div>
                </div>
            </div>

            <div className="w-full max-w-xs animate-fade-in" style={{animationDelay: '0.1s'}}>
                <button 
                    className="w-full bg-surface0 hover:bg-surface1 text-red border border-surface1 py-4 rounded-lg font-bold transition-colors uppercase tracking-widest"
                    onClick={handleSignOut}
                >
                    Sign Out
                </button>
            </div>
        </div>
    );
}
