import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";

import { generateProblem } from "../lib/problems";
import type { Problem } from "../lib/gameTypes";
import { finishGame, updateScore } from "../lib/firebase";
import { useRoom } from "../hooks/useRoom";
import { useGameTimer } from "../hooks/useGameTimer";
import toast from "react-hot-toast";

export default function GamePage() {
    const { roomId } = useParams<{ roomId: string }>();
    const cleanRoomId = roomId || "";
    const navigate = useNavigate();

    const [problemIndex, setProblemIndex] = useState<number>(0);
    const [score, setScore] = useState<number>(0);
    const [inputValue, setInputValue] = useState<string>("");

    const { room, loading, error } = useRoom(cleanRoomId);
    const { countdown, timeLeft } = useGameTimer(room);

    const myId = sessionStorage.getItem("playerId") || "";

    // Game Over Trigger (Listens for timeLeft to hit 0 and handles navigation with the LATEST score)
    useEffect(() => {
        if (timeLeft === 0) {
            // mark game as finished in Firestore
            finishGame(cleanRoomId);
        }
    }, [timeLeft, cleanRoomId]);

    // Game Finished Redirect (Listens for status to flip to "finished" and handles navigation)
    useEffect(() => {
        if (room?.status === "finished") {
            navigate(`/results/${cleanRoomId}`);
        }
    }, [room?.status, cleanRoomId, navigate]);

    // Handle Error State: Automatically redirect to home
    useEffect(() => {
        if (error) {
            toast.error(error);
            navigate("/");
        }
    }, [error, navigate]);

    // Guard Clause: show a loading indicator until database data AND timer are ready (or if we are redirecting due to error)
    if (loading || !room || timeLeft === null || error) {
        return (
            <div className="flex justify-center items-center min-h-screen w-full">
                <div className="text-center">
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                    <p className="mt-2 text-base-content/70">Loading game...</p>
                </div>
            </div>
        );
    }

    // render countdown until game starts
    if (countdown !== null) {
        return (
            <div className="flex justify-center items-center min-h-screen w-full">
                <div className="text-center">
                    <h1 className="text-9xl font-bold text-primary animate-pulse">
                        {countdown}
                    </h1>
                    <p className="text-2xl mt-4 text-base-content/70">Get Ready...</p>
                </div>
            </div>
        );
    }

    // retrieve seed from Firestore
    const seed = room.seed;
    const currentProblem: Problem = generateProblem(seed, problemIndex);
    const oppId = room.hostId === myId ? room.guestId : room.hostId;
    const oppScore = oppId ? (room.scores[oppId] ?? 0) : 0;

    const handleInputValueChange = (value: string) => {
        // Restrict input strictly to digits 0-9 (allow clearing with empty string)
        if (value !== "" && !/^[0-9]*$/.test(value)) return;
        setInputValue(value);
        const numValue = Number(value);
        if (isNaN(numValue)) return;

        // increment score and reset input if correct
        if (numValue === currentProblem.answer) {
            setScore(score + 1);
            setProblemIndex(problemIndex + 1);
            updateScore(cleanRoomId, myId, score + 1);
            setInputValue("");
        }
    };

    return (
        <div className="flex flex-col min-h-screen w-full bg-base-100">
            {/* Full-width minimalist Top Bar HUD */}
            <header className="w-full px-8 py-6 flex justify-between items-center border-b border-base-300/30">
                <div className="text-left">
                    <span className="text-xs uppercase tracking-widest text-base-content/60 block font-semibold">You</span>
                    <span className="text-3xl font-black text-primary">{score}</span>
                </div>

                <div className="text-center">
                    <span className="text-xs uppercase tracking-widest text-base-content/60 block font-semibold">Time Remaining</span>
                    <span className={`text-4xl font-black font-mono tracking-tight ${timeLeft <= 10 ? 'text-error animate-pulse' : 'text-base-content'}`}>
                        {timeLeft}s
                    </span>
                </div>

                <div className="text-right">
                    <span className="text-xs uppercase tracking-widest text-base-content/60 block font-semibold">Opponent</span>
                    <span className="text-3xl font-black text-secondary">{oppScore}</span>
                </div>
            </header>

            {/* Spacious Borderless Center Stage */}
            <main className="flex-1 flex flex-col justify-center items-center px-6 pb-20">
                <div className="w-full max-w-lg text-center">
                    <h2 className="text-7xl md:text-8xl font-black tracking-wider text-base-content my-8 select-none">
                        {currentProblem.a} {currentProblem.op} {currentProblem.b}
                    </h2>

                    <div className="max-w-xs mx-auto">
                        <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            autoComplete="off"
                            autoFocus
                            className="input input-bordered input-lg w-full text-center text-3xl font-bold h-16 shadow-inner focus:outline-primary bg-base-200/50 rounded-xl"
                            placeholder="?"
                            value={inputValue}
                            onChange={(e) => handleInputValueChange(e.target.value)}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}
