import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";

import { generateProblem } from "../lib/problems";
import type { Problem } from "../lib/gameTypes";
import { finishGame, updateScore } from "../lib/firebase";
import { useRoom } from "../hooks/useRoom";
import { useGameTimer } from "../hooks/useGameTimer";

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

    // Handle Error State
    if (error) {
        return (
            <div className="container d-flex justify-content-center align-items-center min-vh-100">
                <div className="text-center">
                    <h3 className="text-danger mb-3">Oops!</h3>
                    <p className="text-muted">{error}</p>
                    <button className="btn btn-primary mt-2" onClick={() => navigate("/")}>
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    // Guard Clause: show a loading indicator until database data AND timer are ready
    if (loading || !room || timeLeft === null) {
        return (
            <div className="container d-flex justify-content-center align-items-center min-vh-100">
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading game...</span>
                    </div>
                    <p className="mt-2 text-muted">Loading game...</p>
                </div>
            </div>
        );
    }

    // render countdown until game starts
    if (countdown !== null) {
        return (
            <div className="container d-flex justify-content-center align-items-center min-vh-100">
                <div className="text-center">
                    <h1 className="display-1 fw-bold text-primary animate-pulse">
                        {countdown}
                    </h1>
                    <p className="fs-4 text-muted">Get Ready...</p>
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
        <div className="container d-flex justify-content-center align-items-center min-vh-100">
            <div className="card shadow p-4 text-center border-0 bg-light-subtle">
                <p>
                    {currentProblem.a} {currentProblem.op} {currentProblem.b}
                </p>
                <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="off"
                    autoFocus
                    className="form-control form-control-lg text-center shadow-sm"
                    value={inputValue}
                    onChange={(e) => handleInputValueChange(e.target.value)}
                />
                <p className="fs-5 mt-4 fw-semibold">Score: {score}</p>
                <p className="fs-5 mt-2 fw-semibold">
                    Opponent Score: {oppScore}
                </p>
                <p className="mt-2 fw-semibold">Time: {timeLeft}</p>
            </div>
        </div>
    );
}

