import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVoting } from '../context/VotingContext';
import { ShieldCheck, Lock, User } from 'lucide-react';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { loginAdmin } = useVoting();
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginAdmin(username, password)) {
      navigate('/admin/dashboard');
    } else {
      setError('Invalid username or password. Check credentials.');
    }
  };

  return (
    <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div className="glass fade-in" style={{ padding: '3rem', width: '100%', maxWidth: '450px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2.5rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '1.2rem', color: 'var(--primary)', marginBottom: '1.2rem' }}>
            <ShieldCheck size={40} />
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Admin Login</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Welcome back, administrator.</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              <User size={16} /> Username
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="Enter admin username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
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

          {error && <p style={{ color: 'var(--error)', fontSize: '0.9rem', textAlign: 'center' }}>{error}</p>}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem' }}>
            Verify & Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
