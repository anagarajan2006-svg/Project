import React, { useState } from 'react';
import { useVoting } from '../context/VotingContext';
import { Users, Clock, ListOrdered, Megaphone, CheckCircle, XCircle } from 'lucide-react';

const AdminDashboard = () => {
  const { parties, updatePartyStatus, setElectionTimer, votingTime, votes, announceResults, resultsAnnounced } = useVoting();
  const [activeTab, setActiveTab] = useState('requests');

  const tabs = [
    { id: 'requests', label: 'Party Requests', icon: <Users size={18} /> },
    { id: 'timer', label: 'Voting Time', icon: <Clock size={18} /> },
    { id: 'stats', label: 'Approve List & Stats', icon: <ListOrdered size={18} /> },
    { id: 'announce', label: 'Announce Result', icon: <Megaphone size={18} /> },
  ];

  return (
    <div className="container" style={{ paddingTop: '5rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>Admin Dashboard</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Manage election operations and security.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem' }}>
        {/* Navigation Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="btn btn-secondary"
              style={{
                justifyContent: 'flex-start',
                background: activeTab === tab.id ? 'var(--primary)' : 'var(--glass)',
                borderColor: activeTab === tab.id ? 'var(--primary)' : 'var(--border)',
                color: 'white'
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="glass" style={{ padding: '2.5rem', minHeight: '500px' }}>
          
          {/* 1. Party Requests */}
          {activeTab === 'requests' && (
            <div className="fade-in">
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Party Registration Requests</h3>
              {parties.filter(p => p.status === 'pending').length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>No pending requests.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {parties.filter(p => p.status === 'pending').map(party => (
                    <div key={party._id} className="glass" style={{ padding: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 255, 255, 0.03)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{ position: 'relative' }}>
                          <img src={useVoting().BASE_URL + party.photo} alt={party.name} style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }} />
                          <img src={useVoting().BASE_URL + party.flag} alt="flag" style={{ position: 'absolute', bottom: -5, right: -5, width: '25px', height: '25px', borderRadius: '4px', border: '1px solid white' }} />
                        </div>
                        <div>
                          <h4 style={{ fontSize: '1.1rem' }}>{party.name}</h4>
                          <p style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 'bold' }}>{party.partyName}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => updatePartyStatus(party._id, 'approved')} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', background: 'var(--accent)' }}>Approve</button>
                        <button onClick={() => updatePartyStatus(party._id, 'rejected')} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', border: '1px solid var(--error)', color: 'var(--error)' }}>Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 2. Voting Time */}
          {activeTab === 'timer' && (
            <div className="fade-in">
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Set Election Duration</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="glass" style={{ padding: '1.5rem', textAlign: 'center', background: 'rgba(99, 102, 241, 0.05)' }}>
                  <Clock size={40} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
                  {votingTime ? (
                    <div>
                      <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Election is LIVE for <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>3 Days</span></p>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Ends: {new Date(votingTime.end).toLocaleString()}</p>
                    </div>
                  ) : (
                    <p style={{ color: 'var(--text-secondary)' }}>Voting time has not been set yet.</p>
                  )}
                </div>
                <button 
                  onClick={() => setElectionTimer(3)} 
                  className="btn btn-primary" 
                  style={{ width: '100%', padding: '1rem' }}
                  disabled={!!votingTime}
                >
                  {votingTime ? 'Timer Already Set' : 'Start 3-Day Election Period'}
                </button>
              </div>
            </div>
          )}

          {/* 3. Stats & Approved List */}
          {activeTab === 'stats' && (
            <div className="fade-in">
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Current Approved Parties & Live Counts</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {parties.filter(p => p.status === 'approved').length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)' }}>No approved parties yet.</p>
                ) : (
                  parties.filter(p => p.status === 'approved').map(party => (
                    <div key={party._id} className="glass" style={{ padding: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <img src={useVoting().BASE_URL + party.photo} alt={party.partyName} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                        <h4 style={{ fontSize: '1.1rem' }}>{party.partyName}</h4>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>{votes.filter(v => v.partyName === party.partyName).length}</span>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Votes</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 4. Announce Result */}
          {activeTab === 'announce' && (
            <div className="fade-in text-center">
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Publish Election Results</h3>
              <div className="glass" style={{ padding: '2rem', textAlign: 'center' }}>
                <Megaphone size={48} style={{ color: resultsAnnounced ? 'var(--accent)' : 'var(--text-secondary)', marginBottom: '1.5rem' }} />
                {resultsAnnounced ? (
                  <div>
                    <h4 style={{ color: 'var(--accent)', fontSize: '1.4rem', marginBottom: '0.5rem' }}>Results Announced!</h4>
                    <p style={{ color: 'var(--text-secondary)' }}>Voters and parties can now view the final outcome.</p>
                  </div>
                ) : (
                  <div>
                    <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
                      Announcing the results will make the final counts public to all users. 
                      This button only works after the 3-day voting window expires.
                    </p>
                    <button 
                      onClick={() => announceResults()} 
                      className="btn btn-primary"
                      disabled={!votingTime}
                    >
                      Announce Result
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
