import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import RoomPage from './pages/RoomPage'
import GamePage from './pages/GamePage'
import ResultsPage from './pages/ResultsPage'
import ProfilePage from './pages/ProfilePage'
import { Toaster } from 'react-hot-toast'

function Layout() {
    return (
        <div className="min-h-screen flex flex-col bg-base text-text font-sans">
            <main className="flex-1">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/room/:roomId" element={<RoomPage />} />
                    <Route path="/game/:roomId" element={<GamePage />} />
                    <Route path="/results/:roomId" element={<ResultsPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                </Routes>
            </main>
        </div>
    );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
      <Toaster position="bottom-right" />
    </BrowserRouter>
  )
}
