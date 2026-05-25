import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import RoomPage from './pages/RoomPage'
import GamePage from './pages/GamePage'
import ResultsPage from './pages/ResultsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/room/:roomId" element={<RoomPage />} />
        <Route path="/game/:roomId" element={<GamePage />} />
        <Route path="/results/:roomId" element={<ResultsPage />} />
      </Routes>
    </BrowserRouter>
  )
}
