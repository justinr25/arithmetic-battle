import { useState, useEffect } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth, signInWithGoogle, signOutUser, subscribeToUser, initUserDoc, subscribeToMatchHistory, updateUserDisplayName, type UserStats, type MatchRecord } from "../lib/firebase";

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [userStats, setUserStats] = useState<UserStats | null>(null);
    const [matchHistory, setMatchHistory] = useState<MatchRecord[]>([]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser && !currentUser.isAnonymous) {
                await initUserDoc(currentUser.uid);
            }
            setUser(currentUser);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        let unsubscribeStats = () => {};
        let unsubscribeHistory = () => {};
        const isLoggedIn = user !== null && !user.isAnonymous;
        if (isLoggedIn) {
            unsubscribeStats = subscribeToUser(user.uid, (stats) => {
                setUserStats(stats);
            });
            unsubscribeHistory = subscribeToMatchHistory(user.uid, (matches) => {
                setMatchHistory(matches);
            });
        } else {
            setUserStats(null);
            setMatchHistory([]);
        }
        return () => {
            unsubscribeStats();
            unsubscribeHistory();
        };
    }, [user]);

    // We consider a user strictly "logged in" if they have an account (not anonymous guest)
    const isLoggedIn = user !== null && !user.isAnonymous;

    return {
        user,
        loading,
        isLoggedIn,
        userStats,
        matchHistory,
        signInWithGoogle,
        signOut: signOutUser,
        updateUserDisplayName,
    };
}
