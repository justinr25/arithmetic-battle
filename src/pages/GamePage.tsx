import { useEffect, useState, useRef } from "react"
import { useParams, useNavigate } from "react-router"
import { generateProblem } from "../lib/problems"
import type { Problem } from "../lib/gameTypes"

export default function GamePage() {
    const { roomId } = useParams<{ roomId: string}>()
    const navigate = useNavigate()

    const [problemIndex, setProblemIndex] = useState<number>(0)
    const [score, setScore] = useState<number>(0)
    const [inputValue, setInputValue] = useState<string>('')
    const [timeLeft, setTimeLeft] = useState<number>(15)
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
        
    
    // Hard coded for now, will need to retrive from Firestore
    // TODO: Retrieve seed from Firestore
    const seed: number = 12345
    
    const currentProblem: Problem = generateProblem(seed, problemIndex)
    
    // Core Timer Loop (Runs once on mount, purely decrements time)
    useEffect(() => {
        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => Math.max(0, prev - 1))
        }, 1000)

        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [])

    // Game Over Trigger (Listens for timeLeft to hit 0 and handles navigation with the LATEST score)
    useEffect(() => {
        if (timeLeft === 0) {
            if (timerRef.current) {
                clearInterval(timerRef.current)
                timerRef.current = null
            }
            // TODO: don't pass in score, use Firestore
            navigate(`/results/${roomId}`, { state: { finalScore: score } })
        }
    }, [timeLeft, score, roomId, navigate])
    const handleInputValueChange = (value: string) => {
        // Restrict input strictly to digits 0-9 (allow clearing with empty string)
        if (value !== "" && !/^[0-9]*$/.test(value)) return;

        setInputValue(value)

        const numValue = Number(value)
        if (isNaN(numValue)) return

        if (numValue === currentProblem.answer) {
            setScore(score + 1)
            setProblemIndex(problemIndex + 1)
            setInputValue('')
        }
    }
    
    return (
        <div className="container d-flex justify-content-center align-items-center min-vh-100">
            <div className="card shadow p-4 text-center border-0 bg-light-subtle">
                <p>{currentProblem.a} {currentProblem.op} {currentProblem.b}</p>
                <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="off"
                    className="form-control form-control-lg text-center shadow-sm"
                    value={inputValue}
                    onChange={(e) => handleInputValueChange(e.target.value)}
                />
                <p>Score: {score}</p>
                {/* TODO: Add opponent's score */}
                <p>Opponent Score: *TODO*</p>
                <p>Time: {timeLeft}</p>
            </div>
        </div>
    )
}