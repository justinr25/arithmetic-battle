import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { updateScore, finishGame, recordUserMatch } from "../lib/firebase";
import { useAuth } from "../hooks/useAuth";
import { RotateCcw } from "lucide-react";
import { useRoom } from "../hooks/useRoom";
import { useGameTimer } from "../hooks/useGameTimer";
import { generateProblem } from "../lib/problems";

export default function GamePage() {
    const { roomId } = useParams<{ roomId: string }>();
    const cleanRoomId = roomId || "";
    const navigate = useNavigate();
    const { room, loading, error } = useRoom(cleanRoomId);

    const [input, setInput] = useState("");

    const myId = sessionStorage.getItem("playerId");
    const { isLoggedIn } = useAuth();

    const { timeLeft } = useGameTimer(room);
    const isFinished = timeLeft === 0;

    // Problem Generation Seeded
    const myScore = room?.scores?.[myId || ""] || 0;

    useEffect(() => {
        if (isFinished && room?.status === "playing") {
            const end = async () => {
                if (isLoggedIn && myId) {
                    try {
                        await recordUserMatch(myId, room);
                    } catch (err) {
                        console.error("Failed to record stats", err);
                    }
                }
                if (myId === room.hostId) {
                    await finishGame(cleanRoomId);
                }
            };
            end();
        }
        if (room?.status === "finished") {
            navigate(`/results/${cleanRoomId}`);
        }
    }, [
        isFinished,
        room?.status,
        cleanRoomId,
        navigate,
        myId,
        room?.hostId,
        isLoggedIn,
        myScore,
    ]);

    useEffect(() => {
        if (error) {
            navigate("/");
        }
    }, [error, navigate]);

    // Problem Generation Seeded
    let problem = { a: 0, b: 0, op: "+", answer: 0 } as ReturnType<
        typeof generateProblem
    >;
    if (room?.seed) {
        problem = generateProblem(room.seed, myScore);
    }

    // Replace '*' and '/' with nice symbols
    let opSymbol: string = problem.op;
    if (problem.op === "*") opSymbol = "×";
    if (problem.op === "/") opSymbol = "÷";
    const problemText = `${problem.a} ${opSymbol} ${problem.b}`;

    const handleNumberClick = useCallback(
        (num: string) => {
            if (input.length < 5) {
                setInput((prev) => prev + num);
            }
        },
        [input],
    );

    const handleBackspace = useCallback(() => {
        setInput((prev) => prev.slice(0, -1));
    }, []);

    useEffect(() => {
        if (input && parseInt(input) === problem.answer && myId) {
            updateScore(cleanRoomId, myId, myScore + 1);
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setInput("");
        }
    }, [input, problem.answer, myId, cleanRoomId, myScore]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key >= "0" && e.key <= "9") {
                handleNumberClick(e.key);
            } else if (e.key === "Backspace") {
                handleBackspace();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleNumberClick, handleBackspace]);

    if (loading || !room || error) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-base text-subtext0 font-sans">
                LOADING...
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen w-full px-8 py-8 bg-base text-text relative font-sans">
            {/* Top Bar */}
            <div className="flex justify-between items-start w-full max-w-5xl mx-auto">
                <div className="flex gap-12">
                    <div className="flex flex-col">
                        <span className="text-subtext0 text-xs font-bold tracking-widest uppercase mb-1">
                            Time
                        </span>
                        <span className="text-3xl font-bold">{timeLeft}s</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-subtext0 text-xs font-bold tracking-widest uppercase mb-1">
                            Score
                        </span>
                        <span className="text-3xl font-bold">{myScore}</span>
                    </div>
                </div>
                {/* Restart icon */}
                <button
                    className="p-3 text-subtext0 hover:text-red transition-colors rounded-full hover:bg-surface0"
                    onClick={() => navigate("/")}
                >
                    <RotateCcw size={20} />
                </button>
            </div>

            {/* Center Play Area */}
            <div className="flex-1 flex flex-col items-center justify-center">
                <h2 className="text-6xl md:text-7xl font-bold mb-8 select-none tracking-tight text-text">
                    {problemText}
                </h2>

                {/* Input Area */}
                <div className="relative flex items-center justify-center min-w-[200px] mb-24">
                    <div className="text-5xl md:text-6xl font-bold text-mauve tracking-widest flex items-center h-20">
                        {input}
                        <span className="inline-block w-1 h-14 bg-pink animate-blink ml-1"></span>
                    </div>
                    {/* Line underneath */}
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-48 h-1 bg-surface1"></div>
                </div>
            </div>
        </div>
    );
}
