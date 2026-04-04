import React from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, LogIn } from 'lucide-react';

const VoterHome = () => {
  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '3rem' }}>
      <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>Voter Gateway</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem', width: '100%', maxWidth: '600px' }}>
        <Link to="/voter/register" className="glass fade-in" style={{ padding: '3rem', textAlign: 'center', textDecoration: 'none', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <UserPlus size={48} style={{ color: 'var(--primary)' }} />
          <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Register</span>
        </Link>
        <Link to="/voter/login" className="glass fade-in" style={{ padding: '3rem', textAlign: 'center', textDecoration: 'none', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <LogIn size={48} style={{ color: 'var(--secondary)' }} />
          <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Login</span>
        </Link>
      </div>
    </div>
  );
};

export default VoterHome;
