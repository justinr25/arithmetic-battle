import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";

import { generateProblem } from "../lib/problems";
import type { Problem, Room } from "../lib/gameTypes";
import { finishGame, subscribeToRoom, updateScore } from "../lib/firebase";

export default function GamePage() {
    const { roomId } = useParams<{ roomId: string }>();
    const cleanRoomId = roomId || "";
    const navigate = useNavigate();

    const [problemIndex, setProblemIndex] = useState<number>(0);
    const [score, setScore] = useState<number>(0);
    const [inputValue, setInputValue] = useState<string>("");
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [room, setRoom] = useState<Room | null>(null);
    const [countdown, setCountdown] = useState<number | null>(3); // starts at 3 seconds, goes to null

    const myId = sessionStorage.getItem("playerId") || "";

    // subscribe to room changes
    useEffect(() => {
        if (!cleanRoomId) return;

        const unsubscribe = subscribeToRoom(cleanRoomId, (updatedRoom) => {
            setRoom(updatedRoom);
        });

        return unsubscribe;
    }, [cleanRoomId]);

    // 5-second countdown before game starts
    useEffect(() => {
        const startTime = room?.startTime;
        if (!startTime) return;

        const interval = setInterval(() => {
            const timeUntilStart = startTime - Date.now();

            if (timeUntilStart <= 0) {
                // start the game
                setCountdown(null);
                clearInterval(interval);
                return;
            } else {
                // count down until game starts
                // convert milliseconds to seconds (rounded up)
                setCountdown(Math.ceil(timeUntilStart / 1000));
            }
        }, 100); // update every 100ms for high accuracy

        return () => clearInterval(interval);
    }, [room?.startTime]);

    // sync timeLeft with Firestore timeLimit when room loads
    useEffect(() => {
        if (room && timeLeft === null) {
            setTimeLeft(room.timeLimit);
        }
    }, [room, timeLeft]);

    // Core Timer Loop
    useEffect(() => {
        // only start counting down if room has startTime and countdown has finished
        if (!room?.startTime || countdown !== null) return;

        const gameEndTime = room.startTime + room.timeLimit * 1000;

        const interval = setInterval(() => {
            const now = Date.now();
            const timeRemaining = gameEndTime - now;

            if (timeRemaining <= 0) {
                // end game
                setTimeLeft(0);
                clearInterval(interval);
            } else {
                // still playing
                // convert milliseconds to remaining whole seconds (e.g. 100ms left -> 1s)
                setTimeLeft(Math.ceil(timeRemaining / 1000));
            }
        }, 100); // update every 100ms for accuracy

        return () => clearInterval(interval);
    }, [room?.startTime, room?.timeLimit, countdown]);

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

    // Guard Clause: show a loading indicator until database data AND timer are ready
    if (!room || timeLeft === null) {
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

