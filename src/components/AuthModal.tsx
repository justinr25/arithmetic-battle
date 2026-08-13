import { LogIn } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const { signInWithGoogle } = useAuth();
    if (!isOpen) return null;

    const handleGoogleSignIn = async () => {
        try {
            const result = await signInWithGoogle();
            if (result.user) {
                sessionStorage.setItem("playerId", result.user.uid);
                sessionStorage.setItem("playerName", result.user.displayName || "Player");
            }
            onClose();
        } catch (error) {
            console.error("Google Sign In Error:", error);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-crust/80 backdrop-blur-sm p-4 animate-fade-in font-sans">
            <div className="bg-base border border-surface1 rounded-2xl w-full max-w-sm p-8 text-center shadow-xl">
                <h3 className="font-bold text-2xl text-text mb-8">Sign In</h3>
                
                <button 
                    className="w-full bg-mauve hover:opacity-90 text-base font-bold py-4 rounded-lg transition-opacity mb-4 flex items-center justify-center gap-3"
                    onClick={handleGoogleSignIn}
                >
                    <LogIn size={20} />
                    Continue with Google
                </button>
                
                <button 
                    className="w-full text-overlay0 font-bold hover:text-text transition-colors py-3"
                    onClick={onClose}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}
