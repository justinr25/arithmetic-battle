import { useState, useEffect } from "react";
import type { Room } from "../lib/gameTypes";
import { subscribeToRoom } from "../lib/firebase";

export function useRoom(roomId: string | undefined) {
    // We need 3 pieces of state to fully describe the network request
    const [room, setRoom] = useState<Room | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Guard clause: If there is no roomId yet, don't try to fetch anything.
        if (!roomId) {
            setLoading(false);
            return;
        }

        // Before starting the fetch, ensure the loading spinner turns on.
        setLoading(true);

        // Subscribe to the real-time Firebase document
        const unsubscribe = subscribeToRoom(
            roomId,
            (updatedRoom) => {
                // 1. Success Callback: Data arrived safely
                setRoom(updatedRoom);
                setError(null); // Clear any old errors if we recovered
                setLoading(false); // Turn off the spinner
            },
            (err) => {
                // 2. Error Callback: Room doesn't exist or network failed
                setError(err.message);
                setLoading(false); // Turn off the spinner so we can show the error
            }
        );

        // Cleanup Function: When the component using this hook unmounts,
        // this runs to close the database connection and prevent memory leaks.
        return () => {
            unsubscribe();
        };
    }, [roomId]); // Dependency Array: Only re-run this effect if the roomId changes

    // Return the 3 pieces of state as an object so components can destructure what they need.
    return { room, loading, error };
}
