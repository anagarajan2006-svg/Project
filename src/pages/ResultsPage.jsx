import React from 'react';
import { useVoting } from '../context/VotingContext';
import { Trophy, BarChart3, Users, Clock } from 'lucide-react';

const ResultsPage = () => {
  const { parties, votes, resultsAnnounced, votingTime } = useVoting();

  const getWinner = () => {
    if (votes.length === 0) return null;
    const counts = {};
    votes.forEach(v => counts[v.partyName] = (counts[v.partyName] || 0) + 1);
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted[0]; // [partyName, count]
  };

  const winnerData = getWinner();
  const approvedParties = parties.filter(p => p.status === 'approved');

  if (!resultsAnnounced) {
    return (
      <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', textAlign: 'center' }}>
        <div className="glass fade-in" style={{ padding: '4rem', maxWidth: '600px' }}>
          <Clock size={64} style={{ color: 'var(--primary)', marginBottom: '2rem', opacity: 0.5 }} />
          <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Results Pending</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem' }}>
            The final election results have not been announced by the admin yet. 
            Please check back once the voting period is officially over.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h2 style={{ fontSize: '3rem', fontWeight: 'bold', background: 'linear-gradient(to right, #f59e0b, #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '1rem' }}>
          Official Election Results
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>Transparency in Democracy</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) 1.5fr', gap: '3rem' }}>
        
        {/* Winner Highlight Card */}
        <div className="glass" style={{ padding: '3rem', textAlign: 'center', background: 'rgba(245, 158, 11, 0.05)', border: '2px solid rgba(245, 158, 11, 0.2)' }}>
          <Trophy size={80} style={{ color: '#f59e0b', marginBottom: '2rem' }} />
          <h3 style={{ fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '0.2rem', color: '#f59e0b', marginBottom: '1rem' }}>Election Winner</h3>
          {winnerData ? (
            <div>
              <div style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{winnerData[0]}</div>
              <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>With {winnerData[1]} total votes</p>
            </div>
          ) : (
            <p style={{ color: 'var(--text-secondary)' }}>No votes cast in this election.</p>
          )}
        </div>

        {/* Full Stats Card */}
        <div className="glass" style={{ padding: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
            <BarChart3 size={32} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '1.8rem' }}>Live Tally Statistics</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {approvedParties.map(party => {
              const partyVotes = votes.filter(v => v.partyName === party.partyName).length;
              const percentage = votes.length > 0 ? (partyVotes / votes.length) * 100 : 0;
              
              return (
                <div key={party._id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{party.partyName}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{party.name}</div>
                    </div>
                    <div style={{ fontWeight: 'bold' }}>{partyVotes} Votes</div>
                  </div>
                  <div style={{ height: '12px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '6px', overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        height: '100%', 
                        width: `${percentage}%`, 
                        background: 'linear-gradient(to right, var(--primary), var(--secondary))',
                        transition: 'width 1s ease-out'
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={16} /> Total Votes: {votes.length}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={16} /> Finalized: {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ResultsPage;
