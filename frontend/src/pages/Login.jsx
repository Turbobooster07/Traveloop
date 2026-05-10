import React from 'react';
import { Link } from 'react-router-dom';

const Login = () => {
  return (
    <div className="login-container">
      <div className="login-card">
        <div className="logo-container">
          <img src="/logo.png" alt="Traveloop Logo" className="logo" />
        </div>
        <h1>Welcome Back</h1>
        <p className="subtitle">Enter your details to access your account.</p>
        
        <form action="#" method="POST" className="login-form">
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input type="text" id="username" name="username" placeholder="Enter your username" required />
          </div>
          
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" name="password" placeholder="Enter your password" required />
          </div>
          
          <div className="form-actions">
            <label className="remember-me">
              <input type="checkbox" name="remember" /> Remember me
            </label>
            <a href="#" className="forgot-password">Forgot password?</a>
          </div>
          
          <button type="submit" className="login-btn">Log In</button>
        </form>
        <div className="signup-link">
          Don't have an account? <Link to="/register">Sign up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
