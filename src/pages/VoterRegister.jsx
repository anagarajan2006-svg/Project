import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVoting } from '../context/VotingContext';
import { Fingerprint, Lock, Mail, CheckCircle, Camera } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const VoterRegister = () => {
  const { registerVoter } = useVoting();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    voterId: '',
    name: '',
    dob: '',
    gender: 'male',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [photoPreview, setPhotoPreview] = useState(null);
  const [phi, setPhi] = useState(null);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhi(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSendOTP = async () => {
    const phone = formData.phone.trim();
    if (phone.length < 10) return setError('Enter a valid 10-digit phone number');
    setError('');
    setLoading(true);
    try {
      await axios.post(`${API_URL}/otp/send`, { phone });
      setOtpSent(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) return setError('Enter the 6-digit OTP');
    setError('');
    setLoading(true);
    try {
      await axios.post(`${API_URL}/otp/verify`, { phone: formData.phone.trim(), code: otp });
      setOtpVerified(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validateAge = (dateString) => {
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age >= 18;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otpVerified) return setError('Please verify your OTP first.');
    if (!validateAge(formData.dob)) return setError('You must be at least 18 years old to register!');
    if (formData.password.length < 8) return setError('Password must be at least 8 characters!');
    if (formData.password !== formData.confirmPassword) return setError('Passwords do not match!');
    if (!phi) return setError('Please upload a photo.');

    setLoading(true);
    setError('');
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (key !== 'confirmPassword') data.append(key, formData[key]);
    });
    data.append('photo', phi);

    const result = await registerVoter(data);
    setLoading(false);
    if (result.success) {
      alert('Registration Successful! Please login to vote.');
      navigate('/voter/login');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', paddingTop: '5rem', paddingBottom: '5rem' }}>
      <div className="glass fade-in" style={{ padding: '3rem', width: '100%', maxWidth: '900px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>

        {/* Left Side */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', borderRight: '1px solid var(--border)', paddingRight: '2rem' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Secure Voter Registration</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Provide your official government-issued Voter ID and personal details to participate in the election.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {[
              { icon: <Fingerprint size={18} />, text: 'Voter ID Verification' },
              { icon: <Mail size={18} />, text: 'SMS OTP Authentication' },
              { icon: <Lock size={18} />, text: 'AES-256 Encrypted Security' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--text-primary)' }}>
                <div style={{ padding: '0.5rem', borderRadius: '50%', background: 'var(--primary-hover)', color: 'white' }}>{item.icon}</div>
                {item.text}
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>

          {/* Photo Upload */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--glass)', border: '2px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
              {photoPreview
                ? <img src={photoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <Camera size={24} style={{ opacity: 0.3 }} />}
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Upload Voter Photo</label>
              <input type="file" accept="image/*" className="input-field" onChange={handleFileChange} required />
            </div>
          </div>

          {/* Name + Voter ID */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Full Name</label>
              <input type="text" name="name" className="input-field" placeholder="John Doe" onChange={handleChange} required />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Voter ID Number</label>
              <input type="text" name="voterId" className="input-field" placeholder="VTR-12345678" onChange={handleChange} required />
            </div>
          </div>

          {/* DOB + Gender */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Date of Birth</label>
              <input type="date" name="dob" className="input-field" onChange={handleChange} required />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Gender</label>
              <select name="gender" className="input-field" onChange={handleChange} required>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Phone + Send OTP */}
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Phone Number</label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
              <input
                type="tel"
                name="phone"
                className="input-field"
                placeholder="9876543210"
                onChange={handleChange}
                disabled={otpSent}
                maxLength={10}
                style={{ flex: 1 }}
                required
              />
              {!otpSent ? (
                <button type="button" onClick={handleSendOTP} className="btn btn-secondary"
                  style={{ whiteSpace: 'nowrap', padding: '0.6rem 1.2rem' }} disabled={loading}>
                  {loading ? 'Sending...' : 'Send OTP'}
                </button>
              ) : !otpVerified && (
                <button type="button" onClick={() => { setOtpSent(false); setOtp(''); }}
                  className="btn btn-secondary"
                  style={{ whiteSpace: 'nowrap', padding: '0.6rem 1rem', opacity: 0.7, fontSize: '0.75rem' }}>
                  Resend
                </button>
              )}
            </div>
          </div>

          {/* OTP Input - show after sent, hide after verified */}
          {otpSent && !otpVerified && (
            <div style={{ background: 'rgba(139,92,246,0.08)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--border)' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                📱 OTP sent to {formData.phone} — enter 6-digit code below
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                <input
                  type="text"
                  className="input-field"
                  placeholder="••••••"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  style={{ fontSize: '1.3rem', letterSpacing: '0.5rem', textAlign: 'center', flex: 1 }}
                  autoFocus
                />
                <button type="button" onClick={handleVerifyOTP} className="btn btn-secondary"
                  style={{ whiteSpace: 'nowrap', padding: '0.6rem 1.2rem' }}
                  disabled={loading || otp.length !== 6}>
                  {loading ? 'Verifying...' : 'Verify'}
                </button>
              </div>
            </div>
          )}

          {/* Verified Badge */}
          {otpVerified && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#22c55e', fontSize: '0.85rem', padding: '0.6rem 1rem', background: 'rgba(34,197,94,0.1)', borderRadius: '0.5rem', border: '1px solid rgba(34,197,94,0.2)' }}>
              <CheckCircle size={16} /> Phone verified successfully ✓
            </div>
          )}

          {/* Password fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Password (Min 8 chars)</label>
              <input type="password" name="password" className="input-field" placeholder="••••••••" onChange={handleChange} required />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Confirm Password</label>
              <input type="password" name="confirmPassword" className="input-field" placeholder="••••••••" onChange={handleChange} required />
            </div>
          </div>

          {error && (
            <div style={{ color: '#f87171', fontSize: '0.82rem', padding: '0.6rem 1rem', background: 'rgba(239,68,68,0.08)', borderRadius: '0.5rem', border: '1px solid rgba(239,68,68,0.2)' }}>
              ⚠ {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary"
            style={{ marginTop: '0.5rem', padding: '1rem', opacity: otpVerified ? 1 : 0.5 }}
            disabled={!otpVerified || loading}>
            {loading ? 'Registering...' : '🗳 Complete Registration'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VoterRegister;
