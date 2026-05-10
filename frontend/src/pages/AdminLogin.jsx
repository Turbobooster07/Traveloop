import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if already logged in as admin
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      if (user.role === 'admin') {
        navigate('/admin');
      }
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        if (data.user.role === 'admin') {
          localStorage.setItem('user', JSON.stringify(data.user));
          navigate('/admin');
        } else {
          setError('Access denied. Admin credentials required.');
        }
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Background Shapes from index.css */}
      <div className="bg-shape-yellow"></div>
      <div className="bg-shape-blue-square"></div>
      <div className="bg-shape-pink-blob"></div>

      <div className="login-card" style={{ maxWidth: '450px' }}>
        <div className="logo-container" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <h1 style={{ color: 'var(--accent-purple)', fontSize: '32px', fontWeight: '800' }}>Traveloop</h1>
        </div>
        <h1 style={{ marginTop: '10px' }}>Admin Portal</h1>
        <p className="subtitle">Please enter your administrative credentials to continue.</p>
        
        {error && (
          <div style={{ 
            background: 'rgba(239, 68, 68, 0.1)', 
            border: '1px solid #ef4444', 
            color: '#ef4444', 
            padding: '12px', 
            borderRadius: '12px', 
            marginBottom: '20px', 
            textAlign: 'center', 
            fontSize: '14px', 
            fontWeight: '500' 
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="username">Admin ID</label>
            <input 
              type="text" 
              id="username" 
              placeholder="Enter Admin ID" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required 
              style={{ borderRadius: '14px' }}
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              placeholder="Enter Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              style={{ borderRadius: '14px' }}
            />
          </div>
          
          <button 
            type="submit" 
            className="login-btn" 
            disabled={loading}
            style={{ 
              marginTop: '10px', 
              background: 'var(--cta-gradient)', 
              boxShadow: 'var(--cta-shadow)',
              height: '52px',
              fontSize: '16px'
            }}
          >
            {loading ? 'Authenticating...' : 'Access Panel'}
          </button>
        </form>
        
        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <button 
            onClick={() => navigate('/login')} 
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--text-muted)', 
              cursor: 'pointer',
              fontSize: '14px',
              textDecoration: 'underline'
            }}
          >
            Back to User Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
