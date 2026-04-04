import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVoting } from '../context/VotingContext';
import { User, LogIn, Phone, Lock, CheckCircle } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const VoterLogin = () => {
  const { loginVoter, getVoterByVoterId } = useVoting();
  const navigate = useNavigate();

  const [voterId, setVoterId] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1: VoterID, 2: OTP, 3: Password
  const [error, setError] = useState('');
  const [maskedPhone, setMaskedPhone] = useState('');
  const [rawPhone, setRawPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await getVoterByVoterId(voterId);
      if (!res) {
        setLoading(false);
        return setError('Voter ID not found. Please register first.');
      }
      const phone = res.phone;
      setRawPhone(phone);
      setMaskedPhone(`******${phone.slice(-4)}`);

      await axios.post(`${API_URL}/otp/send`, { phone });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return setError('Enter the 6-digit OTP');
    setError('');
    setLoading(true);
    try {
      await axios.post(`${API_URL}/otp/verify`, { phone: rawPhone, code: otp });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
          <p style={{ color: 'var(--text-secondary)' }}>Secure OTP-based login portal.</p>
        </div>

        {/* Step Indicators */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem', marginBottom: '2rem' }}>
          {['Voter ID', 'OTP', 'Password'].map((label, i) => (
            <React.Fragment key={i}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
                <div style={{
                  width: '30px', height: '30px', borderRadius: '50%',
                  background: step > i + 1 ? '#22c55e' : step === i + 1 ? 'var(--secondary)' : 'rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: 'bold', color: 'white', transition: 'background 0.3s'
                }}>
                  {step > i + 1 ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: '0.65rem', color: step === i + 1 ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{label}</span>
              </div>
              {i < 2 && <div style={{ width: '30px', height: '2px', background: step > i + 1 ? '#22c55e' : 'rgba(255,255,255,0.1)', marginBottom: '1rem', transition: 'background 0.3s' }} />}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Voter ID */}
        {step === 1 && (
          <form onSubmit={handleRequestOTP} className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
            {error && <div style={{ color: '#f87171', fontSize: '0.82rem', padding: '0.6rem 1rem', background: 'rgba(239,68,68,0.08)', borderRadius: '0.5rem' }}>⚠ {error}</div>}
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Sending OTP...' : 'Next: Send OTP →'}
            </button>
          </form>
        )}

        {/* Step 2: OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--border)', textAlign: 'center' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>📱 OTP sent to:</p>
              <p style={{ fontWeight: 'bold', color: 'var(--accent)', fontSize: '1.1rem', letterSpacing: '0.1rem' }}>{maskedPhone}</p>
            </div>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                <Phone size={16} /> Enter 6-Digit OTP
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="• • • • • •"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                style={{ fontSize: '1.5rem', letterSpacing: '0.6rem', textAlign: 'center' }}
                autoFocus
                required
              />
            </div>
            {error && <div style={{ color: '#f87171', fontSize: '0.82rem', padding: '0.6rem 1rem', background: 'rgba(239,68,68,0.08)', borderRadius: '0.5rem' }}>⚠ {error}</div>}
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading || otp.length !== 6}>
              {loading ? 'Verifying...' : 'Verify OTP →'}
            </button>
            <button type="button" onClick={() => { setStep(1); setOtp(''); }}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.85rem' }}>
              ← Change Voter ID
            </button>
          </form>
        )}

        {/* Step 3: Password */}
        {step === 3 && (
          <form onSubmit={handleLogin} className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#22c55e', fontSize: '0.85rem', padding: '0.75rem 1rem', background: 'rgba(34,197,94,0.08)', borderRadius: '0.75rem', border: '1px solid rgba(34,197,94,0.2)' }}>
              <CheckCircle size={16} /> Phone verified successfully!
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
                autoFocus
                required
              />
            </div>
            {error && <div style={{ color: '#f87171', fontSize: '0.82rem', padding: '0.6rem 1rem', background: 'rgba(239,68,68,0.08)', borderRadius: '0.5rem' }}>⚠ {error}</div>}
            <button type="submit" className="btn btn-primary"
              style={{ width: '100%', background: 'linear-gradient(135deg, var(--secondary), #ec4899)' }}
              disabled={loading}>
              {loading ? 'Logging in...' : '🔐 Verify & Login'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default VoterLogin;
