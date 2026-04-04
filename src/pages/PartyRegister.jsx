import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useVoting } from '../context/VotingContext';
import { Users, Flag, Lock, User, Image, ArrowRight } from 'lucide-react';

const PartyRegister = () => {
  const { registerParty } = useVoting();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    partyName: '',
    password: '',
    confirmPassword: ''
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [flagFile, setFlagFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [flagPreview, setFlagPreview] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (type === 'photo') {
        setPhotoFile(file);
        setPhotoPreview(URL.createObjectURL(file));
      } else {
        setFlagFile(file);
        setFlagPreview(URL.createObjectURL(file));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) return setError('Passwords do not match!');
    if (!photoFile || !flagFile) return setError('Please upload both a photo and a flag.');
    
    const data = new FormData();
    Object.keys(formData).forEach(key => {
        if (key !== 'confirmPassword') {
            data.append(key, formData[key]);
        }
    });
    data.append('photo', photoFile);
    data.append('flag', flagFile);

    const result = await registerParty(data);
    if (result.success) {
      alert('Request Sent to Admin! Please wait for approval.');
      navigate('/party/login');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '5rem 0' }}>
      <div className="glass fade-in" style={{ padding: '3.5rem', width: '100%', maxWidth: '600px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2.5rem', textAlign: 'center' }}>
          <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '1.2rem', color: 'var(--accent)', marginBottom: '1.2rem' }}>
            <Flag size={40} />
          </div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 'bold' }}>Candidate Registration</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Apply to participate in the upcoming election.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Candidate Full Name</label>
            <input type="text" name="name" className="input-field" placeholder="Enter your name" onChange={handleChange} required />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Political Party Name</label>
            <input type="text" name="partyName" className="input-field" placeholder="e.g. Progressive Party" onChange={handleChange} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <div style={{ width: '100%', height: '120px', borderRadius: '1rem', background: 'var(--glass)', border: '2px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {photoPreview ? <img src={photoPreview} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={32} style={{ opacity: 0.2 }} />}
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Candidate Photo</label>
                <input type="file" accept="image/*" className="input-field" onChange={(e) => handleFileChange(e, 'photo')} required />
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <div style={{ width: '100%', height: '120px', borderRadius: '1rem', background: 'var(--glass)', border: '2px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {flagPreview ? <img src={flagPreview} alt="Flag" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Flag size={32} style={{ opacity: 0.2 }} />}
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Party Flag</label>
                <input type="file" accept="image/*" className="input-field" onChange={(e) => handleFileChange(e, 'flag')} required />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Password</label>
              <input type="password" name="password" className="input-field" placeholder="••••••••" onChange={handleChange} required />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Confirm Password</label>
              <input type="password" name="confirmPassword" className="input-field" placeholder="••••••••" onChange={handleChange} required />
            </div>
          </div>

          {error && <p style={{ color: 'var(--error)', fontSize: '0.8rem' }}>{error}</p>}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', background: 'linear-gradient(135deg, var(--accent), #10b981)' }}>
            Submit for Approval
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Already approved? <Link to="/party/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 'bold' }}>Login here <ArrowRight size={14} /></Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PartyRegister;
