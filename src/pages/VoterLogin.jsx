import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVoting } from '../context/VotingContext';
import { User, LogIn, Lock } from 'lucide-react';

const VoterLogin = () => {
  const { loginVoter } = useVoting();
  const navigate = useNavigate();

  const [voterId, setVoterId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await loginVoter(voterId, password);
    setLoading(false);
    if (result.success) {
      navigate('/voter/dashboard');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div className="glass fade-in" style={{ padding: '3rem', width: '100%', maxWidth: '450px' }}>

        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2.5rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '1.2rem', color: 'var(--secondary)', marginBottom: '1.2rem' }}>
            <LogIn size={40} />
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Voter Login</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Secure login portal.</p>
        </div>

        <form onSubmit={handleLogin} className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                <User size={16} /> Voter ID Number
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="VTR-12345678"
                value={voterId}
                onChange={(e) => setVoterId(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                <Lock size={16} /> Password
              </label>
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            {error && <div style={{ color: '#f87171', fontSize: '0.82rem', padding: '0.6rem 1rem', background: 'rgba(239,68,68,0.08)', borderRadius: '0.5rem' }}>⚠ {error}</div>}
            
            <button type="submit" className="btn btn-primary"
              style={{ width: '100%', background: 'linear-gradient(135deg, var(--secondary), #ec4899)' }}
              disabled={loading}>
              {loading ? 'Logging in...' : '🔐 Login'}
            </button>
        </form>
      </div>
    </div>
  );
};

export default VoterLogin;
