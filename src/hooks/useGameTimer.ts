import { useState, useEffect } from "react";
import type { Room } from "../lib/gameTypes";

export function useGameTimer(room: Room | null) {
    const [countdown, setCountdown] = useState<number | null>(3);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);

    // Sync timeLeft with Firestore timeLimit when room first loads
    useEffect(() => {
        if (room && timeLeft === null) {
            setTimeLeft(room.timeLimit);
        }
    }, [room, timeLeft]);

    // 1. Pre-game countdown (e.g., 3... 2... 1...)
    useEffect(() => {
        const startTime = room?.startTime;
        if (!startTime) return;

        const interval = setInterval(() => {
            const timeUntilStart = startTime - Date.now();

            if (timeUntilStart <= 0) {
                // Time's up! Start the game.
                setCountdown(null);
                clearInterval(interval);
            } else {
                // Convert milliseconds to whole seconds
                setCountdown(Math.ceil(timeUntilStart / 1000));
            }
        }, 100); // 100ms delay: runs this function 10 times a second to ensure high precision and avoid lagging updates

        return () => clearInterval(interval);
    }, [room?.startTime]);

    // 2. Core gameplay timer loop
    useEffect(() => {
        // Only run this if the game has started (countdown is finished)
        if (!room?.startTime || countdown !== null) return;

        const gameEndTime = room.startTime + (room.timeLimit * 1000);

        const interval = setInterval(() => {
            const timeRemaining = gameEndTime - Date.now();

            if (timeRemaining <= 0) {
                // Game over!
                setTimeLeft(0);
                clearInterval(interval);
            } else {
                setTimeLeft(Math.ceil(timeRemaining / 1000));
            }
        }, 100); // 100ms delay: ticks 10 times a second to keep the visual countdown extremely accurate and responsive

        return () => clearInterval(interval);
    }, [room?.startTime, room?.timeLimit, countdown]);

    return { countdown, timeLeft };
}
