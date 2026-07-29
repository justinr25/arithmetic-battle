import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Clock, Trophy } from "lucide-react";

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
        <div className="flex justify-center items-center min-h-screen w-full p-4">
            <div className="card w-full max-w-md bg-base-200 shadow-xl">
                <div className="card-body items-center text-center">
                    {/* Timer */}
                    <div className="flex items-center gap-2 mb-4">
                        <Clock className={`w-6 h-6 ${timeLeft <= 10 ? 'text-error animate-pulse' : 'text-primary'}`} />
                        <span className={`text-2xl font-bold ${timeLeft <= 10 ? 'text-error' : ''}`}>
                            {timeLeft}s
                        </span>
                    </div>

                    {/* Problem */}
                    <h2 className="text-5xl font-bold my-6 tracking-wider">
                        {currentProblem.a} {currentProblem.op} {currentProblem.b}
                    </h2>
                    
                    {/* Input */}
                    <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        autoComplete="off"
                        autoFocus
                        className="input input-bordered input-lg w-full text-center text-2xl font-bold mb-6"
                        value={inputValue}
                        onChange={(e) => handleInputValueChange(e.target.value)}
                    />

                    {/* Scores */}
                    <div className="w-full flex justify-between gap-4 mt-4">
                        <div className="stat bg-base-300 rounded-box p-4 shadow-sm w-1/2">
                            <div className="stat-figure text-primary">
                                <Trophy className="w-6 h-6" />
                            </div>
                            <div className="stat-title text-sm">You</div>
                            <div className="stat-value text-primary text-2xl">{score}</div>
                        </div>
                        <div className="stat bg-base-300 rounded-box p-4 shadow-sm w-1/2">
                            <div className="stat-figure text-secondary">
                                <Trophy className="w-6 h-6" />
                            </div>
                            <div className="stat-title text-sm">Opponent</div>
                            <div className="stat-value text-secondary text-2xl">{oppScore}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
