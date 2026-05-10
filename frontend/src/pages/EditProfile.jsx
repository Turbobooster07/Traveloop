import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

const EditProfile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : (location.state?.user || null);
  });

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    city: '',
    country: '',
    additional_info: '',
    language: 'English'
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    fetchUserData();
  }, [user]);

  const fetchUserData = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setUser(data);
        setFormData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          email: data.email || '',
          phone: data.phone || '',
          city: data.city || '',
          country: data.country || '',
          additional_info: data.additional_info || '',
          language: data.language || 'English'
        });
      }
    } catch (err) {
      console.error("Failed to fetch user data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch(`http://localhost:5000/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update profile' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you absolutely sure you want to delete your account? This action cannot be undone.')) {
      try {
        const response = await fetch(`http://localhost:5000/api/users/${user.id}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          localStorage.removeItem('user');
          navigate('/');
        }
      } catch (err) {
        alert('Failed to delete account');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const getInitials = (first, last) => {
    return `${first?.charAt(0) || ''}${last?.charAt(0) || ''}`;
  };

  if (loading) return <div className="dash-wrapper" style={{ justifyContent: 'center', alignItems: 'center', height: '100vh' }}><h3>Loading Settings...</h3></div>;

  return (
    <div className="dash-wrapper">
      {/* Background Shapes */}
      <div className="bg-shape-yellow"></div>
      <div className="bg-shape-blue-square"></div>
      <div className="bg-shape-pink-blob"></div>
      <div className="bg-shape-purple-circle"></div>
      <div className="bg-shape-green-blob"></div>

      {/* Header Section */}
      <nav className="dash-nav">
        <div className="dash-logo">
          <Link to="/dashboard" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h1>Traveloop</h1>
          </Link>
        </div>
        <div className="dash-actions" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <Link to="/dashboard" className="dash-section-link" style={{ textDecoration: 'none' }}>Dashboard</Link>
          <Link to="/profile" className="dash-section-link" style={{ textDecoration: 'none' }}>Profile</Link>
          <button onClick={handleLogout} className="dash-btn-chip" style={{ background: 'transparent', border: '1px solid var(--border-medium)' }}>Logout</button>
          <div className="dash-profile" onClick={() => navigate('/profile')} title="View Profile">
            {getInitials(user.first_name, user.last_name)}
          </div>
        </div>
      </nav>

      <div className="settings-container">
        <div className="dash-section-header">
          <h2 style={{ fontSize: '32px', fontWeight: '800', fontFamily: "'Outfit', sans-serif" }}>Account Settings</h2>
        </div>

        <form onSubmit={handleSave} className="settings-card">
          {message.text && (
            <div style={{ 
              padding: '16px', 
              borderRadius: '16px', 
              background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: message.type === 'success' ? '#10b981' : '#ef4444',
              border: `1px solid ${message.type === 'success' ? '#10b981' : '#ef4444'}`,
              textAlign: 'center',
              fontWeight: '600'
            }}>
              {message.text}
            </div>
          )}

          {/* Profile Section */}
          <section className="settings-section">
            <h3>Profile Information</h3>
            <div className="settings-avatar-upload">
              <div className="settings-avatar-preview">
                <img src={`https://ui-avatars.com/api/?name=${user.first_name}+${user.last_name}&background=ffc8dd&color=96426b&size=200`} alt="Avatar" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button type="button" className="upload-btn">Change Photo</button>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>JPG, PNG or GIF. Max size 2MB.</p>
              </div>
            </div>

            <div className="settings-grid">
              <div className="input-group">
                <label>First Name</label>
                <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required />
              </div>
              <div className="input-group">
                <label>Last Name</label>
                <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required />
              </div>
              <div className="input-group settings-full-width">
                <label>Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="input-group settings-full-width">
                <label>Bio / Additional Info</label>
                <textarea name="additional_info" value={formData.additional_info} onChange={handleChange} placeholder="Tell us about your travel style..." />
              </div>
            </div>
          </section>

          {/* Preferences Section */}
          <section className="settings-section">
            <h3>Preferences</h3>
            <div className="settings-grid">
              <div className="input-group">
                <label>Language</label>
                <select name="language" value={formData.language} onChange={handleChange}>
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                  <option>German</option>
                  <option>Japanese</option>
                </select>
              </div>
              <div className="input-group">
                <label>Currency</label>
                <select name="currency">
                  <option>USD ($)</option>
                  <option>EUR (€)</option>
                  <option>GBP (£)</option>
                  <option>JPY (¥)</option>
                  <option>INR (₹)</option>
                </select>
              </div>
            </div>
          </section>

          {/* Saved Destinations */}
          <section className="settings-section">
            <h3>Saved Destinations</h3>
            <div className="saved-destinations-list">
              {['Paris, France', 'Bali, Indonesia', 'Kyoto, Japan'].map((dest, idx) => (
                <div key={idx} className="destination-item">
                  <div className="destination-info">
                    <h5>{dest}</h5>
                  </div>
                  <button type="button" className="remove-dest-btn">×</button>
                </div>
              ))}
            </div>
          </section>

          <button type="submit" className="save-settings-btn" disabled={saving}>
            {saving ? 'Saving Changes...' : 'Save All Changes'}
          </button>

          {/* Danger Zone */}
          <div className="danger-zone">
            <h4>Danger Zone</h4>
            <p>Once you delete your account, there is no going back. Please be certain.</p>
            <button type="button" onClick={handleDeleteAccount} className="delete-btn">Delete Account</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
