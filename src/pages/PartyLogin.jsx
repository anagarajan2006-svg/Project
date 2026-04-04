import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVoting } from '../context/VotingContext';
import { Flag, LogIn, Lock } from 'lucide-react';

const PartyLogin = () => {
  const { loginParty } = useVoting();
  const navigate = useNavigate();
  const [nameOrParty, setNameOrParty] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginParty(nameOrParty, password)) {
      navigate('/party/dashboard');
    } else {
      setError('Invalid Name/Party or Password. Only approved parties can login.');
    }
  };

  return (
    <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div className="glass fade-in" style={{ padding: '3rem', width: '100%', maxWidth: '450px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2.5rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '1.2rem', color: 'var(--accent)', marginBottom: '1.2rem' }}>
            <Flag size={40} />
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Party Login</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Check your stats and results.</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Full Name or Party Name</label>
            <input type="text" className="input-field" placeholder="Enter your registered name" value={nameOrParty} onChange={(e) => setNameOrParty(e.target.value)} required />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Password</label>
            <input type="password" className="input-field" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          {error && <p style={{ color: 'var(--error)', fontSize: '0.9rem' }}>{error}</p>}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', background: 'var(--accent)' }}>
            Login to Dashboard
          </button>
        </form>
      </div>
    </div>
  );
};

export default PartyLogin;
