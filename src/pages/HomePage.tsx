import { useState } from 'react'
import { useNavigate } from 'react-router'
import NameInput from '../components/NameInput'

export default function HomePage() {
  const [name, setName] = useState<string>('')
  const navigate = useNavigate()

//   TODO: Create room in database, get actual room ID from DB
  const handleCreateRoom = async () => {
    console.log("Creating room in database...")
    const roomId = "ABC123"

    navigate(`/room/${roomId}`)
  }

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="card shadow p-4 text-center border-0 bg-light-subtle">
        <h1 className="text-primary mb-2 fw-bold">
          <i className="bi bi-calculator me-2"></i>
          Arithmetic Battle
        </h1>
        <p className="text-muted small mb-4">Challenge players to a real-time mental math duel</p>
        
        {/* Pass down the 'name' state and the 'setName' function as props */}
        <NameInput value={name} onChange={setName} />
        
        {/* Render the greeting dynamically when name is typed */}
        {name ? (
          <>
            <div className="alert alert-success mt-3 py-2 shadow-sm border-0 animate-fade-in">
              <span className="fw-semibold">Hello, {name}!</span> 👋 Ready to play?
            </div>
            <button
                className="btn btn-success btn-lg shadow-sm w-100 fw-semibold"
                onClick={handleCreateRoom}
            >
              <i className="bi bi-people-fill me-2"></i>
              Create Room
            </button>
          </>
        ) : (
          <p className="text-muted mt-3 small">
            Start typing above to register your player name.
          </p>
        )}
      </div>
    </div>
  )
}