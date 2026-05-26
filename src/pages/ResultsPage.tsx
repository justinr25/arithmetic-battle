import { useNavigate, useLocation } from "react-router"

export default function ResultsPage() {
    const location = useLocation()
    const navigate = useNavigate()

    const finalScore = location.state?.finalScore ?? 0

    return (
        <div className="container d-flex justify-content-center align-items-center min-vh-100">
            <div className="card shadow p-4 text-center border-0 bg-light-subtle">
                <h1 className="text-primary mb-3 fw-bold">
                    Results
                </h1>
                <p className="display-6 fw-bold">{finalScore}</p>
                <p className="text-muted small mb-4">Your score</p>
                <button
                    className="btn btn-primary btn-lg shadow-sm w-100 fw-semibold"
                    onClick={() => navigate('/')}
                >
                    <i className="bi bi-house-door-fill me-2"></i>
                    Back to Home
                </button>
            </div>
        </div>
    )
}