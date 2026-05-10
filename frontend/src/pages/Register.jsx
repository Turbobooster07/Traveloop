import React from 'react';
import { Link } from 'react-router-dom';

const Register = () => {
  return (
    <div className="login-container register-container-wrapper">
      <div className="logo-container logo-outside">
        <img src="/logo.png" alt="Traveloop Logo" className="logo" />
      </div>

      <div className="login-card register-card">
        <h1>Create Account</h1>
        <p className="subtitle">Join Traveloop today.</p>
        
        <form id="register-form" action="#" method="POST" className="login-form register-form-grid">
          <div className="form-row">
            <div className="input-group">
              <label htmlFor="firstName">First Name</label>
              <input type="text" id="firstName" name="firstName" placeholder="First Name" required />
            </div>
            <div className="input-group">
              <label htmlFor="lastName">Last Name</label>
              <input type="text" id="lastName" name="lastName" placeholder="Last Name" required />
            </div>
          </div>
          
          <div className="form-row">
            <div className="input-group">
              <label htmlFor="email">Email Address</label>
              <input type="email" id="email" name="email" placeholder="Email Address" required />
            </div>
            <div className="input-group">
              <label htmlFor="phone">Phone Number</label>
              <input type="tel" id="phone" name="phone" placeholder="Phone Number" required />
            </div>
          </div>

          <div className="form-row">
            <div className="input-group">
              <label htmlFor="city">City</label>
              <input type="text" id="city" name="city" placeholder="City" required />
            </div>
            <div className="input-group">
              <label htmlFor="country">Country</label>
              <input type="text" id="country" name="country" placeholder="Country" required />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="additionalInfo">Additional Info</label>
            <textarea id="additionalInfo" name="additionalInfo" placeholder="Tell us more about your travel preferences..." rows="3"></textarea>
          </div>
        </form>
      </div>

      <div className="button-outside-container">
        <button type="submit" form="register-form" className="login-btn register-btn">Register users</button>
        <div className="signup-link center-text">
          Already have an account? <Link to="/">Log in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
