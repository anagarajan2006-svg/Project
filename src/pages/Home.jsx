import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', textAlign: 'center' }}>
      <div className="glass fade-in" style={{ padding: '4rem', maxWidth: '600px' }}>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '1.5rem', background: 'linear-gradient(to right, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Welcome to Online Voting
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', fontSize: '1.1rem' }}>
          A secure, real-time, and transparent platform to cast your valuable vote. Your voice matters.
        </p>
        <Link to="/rolls" className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.2rem' }}>
          Rolls →
        </Link>
      </div>
    </div>
  );
};

export default Home;
