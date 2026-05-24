import { useState } from 'react'
import NameInput from './components/NameInput'

export default function App() {
  const [name, setName] = useState<string>('')

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
          <div className="alert alert-success mt-3 py-2 shadow-sm border-0 animate-fade-in">
            <span className="fw-semibold">Hello, {name}!</span> 👋 Ready to play?
          </div>
        ) : (
          <p className="text-muted mt-3 small">
            Start typing above to register your player name.
          </p>
        )}
      </div>
    </div>
  )
}
