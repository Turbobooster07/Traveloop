import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const credentials = location.state?.credentials;

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (credentials) {
      setUsername(credentials.username);
      setPassword(credentials.password);
    }
  }, [credentials]);

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
        navigate('/dashboard', { state: { user: data.user } });
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
      <div className="login-card">
        <div className="logo-container">
          <img src="/logo.png" alt="Traveloop Logo" className="logo" />
        </div>
        <h1>Welcome Back</h1>
        <p className="subtitle">Enter your details to access your account.</p>
        
        {credentials && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)', 
            border: '1px solid #10b981', 
            padding: '12px', 
            borderRadius: '8px', 
            marginBottom: '20px', 
            width: '100%', 
            textAlign: 'center'
          }}>
            <p style={{ color: '#10b981', fontWeight: 'bold', marginBottom: '8px' }}>Registration Successful!</p>
            <p style={{ fontSize: '13px', color: '#f8fafc' }}>
              Your auto-generated credentials are:<br/>
              <strong>ID:</strong> {credentials.username}<br/>
              <strong>Password:</strong> {credentials.password}
            </p>
          </div>
        )}

        {error && <div style={{ color: '#f77062', marginBottom: '15px', textAlign: 'center', fontSize: '14px', fontWeight: '500' }}>{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input 
              type="text" 
              id="username" 
              name="username" 
              placeholder="Enter your username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required 
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              placeholder="Enter your password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          
          <div className="form-actions">
            <label className="remember-me">
              <input type="checkbox" name="remember" /> Remember me
            </label>
            <a href="#" className="forgot-password">Forgot password?</a>
          </div>
          
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
        <div className="signup-link">
          Don't have an account? <Link to="/register">Sign up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
