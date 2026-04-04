import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useVoting } from '../context/VotingContext';
import { Trophy, Frown, BarChart3, LogOut, CheckCircle2 } from 'lucide-react';

const PartyDashboard = () => {
  const { currentUser, votes, parties, resultsAnnounced, logout } = useVoting();
  const navigate = useNavigate();

  if (!currentUser) return <div className="container">Please login first.</div>;

  const partyVotes = votes.filter(v => v.partyName === currentUser.partyName).length;
  
  // Logic to determine if this party is the winner
  const getWinner = () => {
    if (votes.length === 0) return null;
    const counts = {};
    votes.forEach(v => counts[v.partyName] = (counts[v.partyName] || 0) + 1);
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted[0][0];
  };

  const isWinner = getWinner() === currentUser.partyName;

  return (
    <div className="container" style={{ paddingTop: '5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem' }}>
        <div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>Candidate Dashboard</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Welcome, {currentUser.name}</p>
        </div>
        <button onClick={() => { logout(); navigate('/'); }} className="btn btn-secondary" style={{ color: 'var(--error)' }}>
          <LogOut size={18} /> Logout
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        {/* Status Card */}
        <div className="glass" style={{ padding: '2.5rem', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Application Status</h3>
          <div style={{ display: 'inline-flex', padding: '1.2rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '1.5rem', color: 'var(--accent)', marginBottom: '1rem', alignItems: 'center', gap: '0.8rem' }}>
            <CheckCircle2 size={32} />
            <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Approved</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '1rem' }}>
            Your party "{currentUser.partyName}" is officially recognized for the election.
          </p>
        </div>

        {/* Live Vote Count Card */}
        <div className="glass" style={{ padding: '2.5rem', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Vote Standings</h3>
          <div style={{ padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '50%', color: 'var(--primary)', display: 'inline-flex', marginBottom: '1.5rem' }}>
            <BarChart3 size={48} />
          </div>
          <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'white' }}>{partyVotes}</div>
          <p style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.1rem' }}>Total Votes Received</p>
        </div>

        {/* Final Result Card */}
        <div className="glass" style={{ padding: '2.5rem', textAlign: 'center', background: resultsAnnounced ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Final Standing</h3>
          {!resultsAnnounced ? (
            <div style={{ padding: '2rem', color: 'var(--text-secondary)' }}>
              <p>Waiting for admin to announce results...</p>
            </div>
          ) : (
            <div className="fade-in">
              {isWinner ? (
                <div>
                  <Trophy size={64} style={{ color: '#f59e0b', marginBottom: '1.5rem' }} />
                  <h4 style={{ fontSize: '2rem', color: '#f59e0b', fontWeight: 'bold', marginBottom: '0.5rem' }}>CONGRATULATIONS!</h4>
                  <p style={{ color: 'white', fontSize: '1.1rem' }}>You have won the election!</p>
                </div>
              ) : (
                <div>
                  <Frown size={64} style={{ color: 'var(--error)', marginBottom: '1.5rem' }} />
                  <h4 style={{ fontSize: '2rem', color: 'white', fontWeight: 'bold', marginBottom: '0.5rem' }}>Better Luck Next Time</h4>
                  <p style={{ color: 'var(--text-secondary)' }}>You received {partyVotes} votes.</p>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default PartyDashboard;
