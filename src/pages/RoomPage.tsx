import { useNavigate, useParams } from "react-router"

export default function RoomPage() {
    const { roomId } = useParams<{ roomId: string }>();
    const navigate = useNavigate();

    const handleStartGame = () => {
        console.log("Starting game...");
        navigate(`/game/${roomId}`);
    }

    return (
        <div className="container d-flex justify-content-center align-items-center min-vh-100">
            <div className="card shadow p-4 text-center border-0 bg-light-subtle">
                <button
                    className="btn btn-success btn-lg shadow-sm w-100 fw-semibold"
                    onClick={handleStartGame}
                >
                    <i className="bi bi-play-fill me-2"></i>
                    Start Game
                </button>
            </div>
        </div>
    )
}