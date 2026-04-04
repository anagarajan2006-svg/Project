import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { VotingProvider } from './context/VotingContext';
import './styles/index.css';

// Importing Pages (to be created)
import Home from './pages/Home';
import Rolls from './pages/Rolls';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import VoterHome from './pages/VoterHome';
import VoterRegister from './pages/VoterRegister';
import VoterLogin from './pages/VoterLogin';
import VoterDashboard from './pages/VoterDashboard';
import PartyRegister from './pages/PartyRegister';
import PartyLogin from './pages/PartyLogin';
import PartyDashboard from './pages/PartyDashboard';
import ResultsPage from './pages/ResultsPage';

// Common Back Button Component
const BackButton = () => {
  const navigate = useNavigate();
  return (
    <button onClick={() => navigate(-1)} className="back-btn">
      ← Back
    </button>
  );
};

const App = () => {
  return (
    <VotingProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/rolls" element={<><BackButton /><Rolls /></>} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<><BackButton /><AdminLogin /></>} />
          <Route path="/admin/dashboard" element={<><BackButton /><AdminDashboard /></>} />
          
          {/* Voter Routes */}
          <Route path="/voter" element={<><BackButton /><VoterHome /></>} />
          <Route path="/voter/register" element={<><BackButton /><VoterRegister /></>} />
          <Route path="/voter/login" element={<><BackButton /><VoterLogin /></>} />
          <Route path="/voter/dashboard" element={<><BackButton /><VoterDashboard /></>} />
          
          {/* Party Routes */}
          <Route path="/party/register" element={<><BackButton /><PartyRegister /></>} />
          <Route path="/party/login" element={<><BackButton /><PartyLogin /></>} />
          <Route path="/party/dashboard" element={<><BackButton /><PartyDashboard /></>} />
          
          {/* Shared Results */}
          <Route path="/results" element={<><BackButton /><ResultsPage /></>} />
        </Routes>
      </BrowserRouter>
    </VotingProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
);
