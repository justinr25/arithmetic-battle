export type GameStatus = "waiting" | "playing" | "finished"

export type Operation = "+" | "-" | "*" | "/"

export interface Problem {
    a: number
    b: number
    op: Operation
    answer: number
}

export interface Room {
    id: string
    hostId: string
    hostName: string
    guestId: string | null
    guestName: string | null
    status: GameStatus
    seed: number
    startTime: number | null
    scores: Record<string, number> // { "uid123": 5, uid456": 3 }
    timeLimit: number // seconds
}