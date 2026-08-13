import { useState, useEffect } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth, signInWithGoogle, signOutUser } from "../lib/firebase";

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // We consider a user strictly "logged in" if they have an account (not anonymous guest)
    const isLoggedIn = user !== null && !user.isAnonymous;

    return {
        user,
        loading,
        isLoggedIn,
        signInWithGoogle,
        signOut: signOutUser,
    };
}
