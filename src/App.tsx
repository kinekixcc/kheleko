import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ElectronTitleBar } from './components/ui/ElectronTitleBar';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Home } from './pages/Home';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { PlayerDashboard } from './pages/PlayerDashboard';
import { OrganizerDashboard } from './pages/OrganizerDashboard';
import { Facilities } from './pages/Facilities';
import { AdminDashboard } from './pages/AdminDashboard';
import { CreateTournament } from './pages/CreateTournament';
import { TournamentRegistration } from './pages/TournamentRegistration';
import { TournamentMap } from './pages/TournamentMap';
import { TournamentDetails } from './pages/TournamentDetails';
import { PaymentSuccess } from './pages/payment/PaymentSuccess';
import { PaymentFailure } from './pages/payment/PaymentFailure';
import { TestingPanel } from './components/ui/TestingPanel';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router basename={import.meta.env.BASE_URL}>
          <ElectronTitleBar />
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/player-dashboard" element={<PlayerDashboard />} />
                <Route path="/organizer-dashboard" element={<OrganizerDashboard />} />
                <Route path="/facilities" element={<Facilities />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/create-tournament" element={<CreateTournament />} />
                <Route path="/tournament/:tournamentId" element={<TournamentDetails />} />
                <Route path="/tournament/:tournamentId/register" element={<TournamentRegistration />} />
                <Route path="/tournament-map" element={<TournamentMap />} />
                <Route path="/payment/success" element={<PaymentSuccess />} />
                <Route path="/payment/failure" element={<PaymentFailure />} />
              </Routes>
            </main>
            <Footer />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
              }}
            />
          </div>
          <TestingPanel />
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;