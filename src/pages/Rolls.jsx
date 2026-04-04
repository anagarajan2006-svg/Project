import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, User, Users, BarChart3 } from 'lucide-react';

const Rolls = () => {
  const options = [
    { label: 'Admin', icon: <Shield size={24} />, path: '/admin/login', color: 'var(--primary)' },
    { label: 'Voter', icon: <User size={24} />, path: '/voter', color: 'var(--secondary)' },
    { label: 'Parties', icon: <Users size={24} />, path: '/party/register', color: '#10b981' },
    { label: 'Result', icon: <BarChart3 size={24} />, path: '/results', color: '#f59e0b' },
  ];

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '3rem' }}>
      <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>Select Your Role</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem', width: '100%', maxWidth: '700px' }}>
        {options.map((opt) => (
          <Link
            key={opt.label}
            to={opt.path}
            className="glass fade-in"
            style={{
              padding: '2.5rem',
              textAlign: 'center',
              textDecoration: 'none',
              color: 'white',
              transition: 'transform 0.3s ease, border-color 0.3s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1.2rem',
              cursor: 'pointer',
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.borderColor = opt.color;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
            }}
          >
            <div style={{ padding: '1rem', background: `${opt.color}20`, borderRadius: '1rem', color: opt.color }}>
              {opt.icon}
            </div>
            <span style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>{opt.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Rolls;
