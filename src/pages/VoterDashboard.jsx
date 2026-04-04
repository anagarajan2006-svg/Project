import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVoting } from '../context/VotingContext';
import { Vote, BarChart, LogOut, CheckCircle, ShieldCheck } from 'lucide-react';

const VoterDashboard = () => {
  const { currentUser, parties, votingTime, votes, castVote, resultsAnnounced, logout, BASE_URL } = useVoting();
  const navigate = useNavigate();
  const [selectedParty, setSelectedParty] = useState('');
  const [voterIdConfirm, setVoterIdConfirm] = useState('');
  const [passConfirm, setPassConfirm] = useState('');
  const [votedStatus, setVotedStatus] = useState(votes.some(v => v.voterId === currentUser?.voterId));
  const [error, setError] = useState('');

  if (!currentUser) return <div className="container">Please login first.</div>;

  const handleVote = async (e) => {
    e.preventDefault();
    setError('');
    
    const result = await castVote(selectedParty, voterIdConfirm, passConfirm);
    if (result.success) {
      setVotedStatus(true);
      alert('Vote Cast Successfully! Your voice has been heard.');
    } else {
      setError(result.message);
    }
  };

  const isVotingActive = () => {
    const now = new Date();
    return votingTime && now >= new Date(votingTime.start) && now <= new Date(votingTime.end);
  };

  return (
    <div className="container" style={{ paddingTop: '5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem' }}>
        <div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>Voter Dashboard</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Welcome, {currentUser.name}</p>
        </div>
        <button onClick={() => { logout(); navigate('/'); }} className="btn btn-secondary" style={{ color: 'var(--error)' }}>
          <LogOut size={18} /> Logout
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        {/* 1. Register Your Vote Section */}
        <div className="glass" style={{ padding: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <Vote size={32} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '1.5rem' }}>Register Your Vote</h3>
          </div>

          {votedStatus ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', color: 'var(--accent)', display: 'inline-flex', marginBottom: '1rem' }}>
                <CheckCircle size={48} />
              </div>
              <h4 style={{ color: 'var(--accent)', fontSize: '1.3rem', marginBottom: '0.5rem' }}>Vote Registered</h4>
              <p style={{ color: 'var(--text-secondary)' }}>You have already cast your vote in this election.</p>
            </div>
          ) : !isVotingActive() ? (
            <div className="glass" style={{ padding: '1.5rem', background: 'rgba(239, 68, 68, 0.05)', textAlign: 'center' }}>
              <p style={{ color: 'var(--error)' }}>Voting window is currently closed.</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                Admin has not started the election or it has ended.
              </p>
            </div>
          ) : (
            <form onSubmit={handleVote} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem', display: 'block' }}>Choose your Candidate</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                  {parties.filter(p => p.status === 'approved').map(p => (
                    <div 
                      key={p._id}
                      onClick={() => setSelectedParty(p.partyName)}
                      className="glass"
                      style={{
                        padding: '1rem',
                        cursor: 'pointer',
                        border: selectedParty === p.partyName ? '2px solid var(--primary)' : '1px solid var(--border)',
                        textAlign: 'center',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        background: selectedParty === p.partyName ? 'rgba(99, 102, 241, 0.1)' : 'var(--glass)'
                      }}
                    >
                      <div style={{ width: '60px', height: '60px', borderRadius: '50%', margin: '0 auto 0.8rem', overflow: 'hidden', border: '2px solid var(--border)' }}>
                        <img src={BASE_URL + p.photo} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.2rem' }}>{p.name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                        <img src={BASE_URL + p.flag} alt="flag" style={{ width: '16px', height: '12px', objectFit: 'cover' }} />
                        {p.partyName}
                      </div>
                      {selectedParty === p.partyName && (
                        <div style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--primary)', borderRadius: '50%', padding: '2px' }}>
                          <CheckCircle size={16} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Confirm Voter ID" 
                  value={voterIdConfirm} 
                  onChange={(e) => setVoterIdConfirm(e.target.value)} 
                  required 
                />
              </div>

              <div>
                <input 
                  type="password" 
                  className="input-field" 
                  placeholder="Confirm Password" 
                  value={passConfirm} 
                  onChange={(e) => setPassConfirm(e.target.value)} 
                  required 
                />
              </div>

              {error && <p style={{ color: 'var(--error)', fontSize: '0.8rem' }}>{error}</p>}

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                Confirm & Cast Vote
              </button>
            </form>
          )}
        </div>

        {/* 2. Results Preview / Summary */}
        <div className="glass" style={{ padding: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <BarChart size={32} style={{ color: 'var(--secondary)' }} />
            <h3 style={{ fontSize: '1.5rem' }}>Election Results</h3>
          </div>

          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <ShieldCheck size={64} style={{ color: resultsAnnounced ? 'var(--accent)' : 'var(--text-secondary)', opacity: 0.2, marginBottom: '1.5rem' }} />
            {resultsAnnounced ? (
              <div>
                <h4 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>Results are LIVE!</h4>
                <button onClick={() => navigate('/results')} className="btn btn-primary" style={{ background: 'var(--secondary)' }}>
                  View Full Results
                </button>
              </div>
            ) : (
              <div>
                <p style={{ color: 'var(--text-secondary)' }}>Results will be available here once the admin announces them after the voting period.</p>
                <button disabled className="btn btn-secondary" style={{ marginTop: '1.5rem', opacity: 0.5 }}>
                  Wait for Announcement
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default VoterDashboard;
