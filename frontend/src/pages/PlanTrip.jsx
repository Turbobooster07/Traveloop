import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const PlanTrip = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.user;

  const [tripForm, setTripForm] = useState({
    destination: '',
    start_date: '',
    end_date: ''
  });

  if (!user) {
    return (
      <div className="login-container">
        <div className="login-card" style={{ textAlign: 'center' }}>
          <h2>Unauthorized</h2>
          <p className="subtitle" style={{ marginTop: '12px' }}>Please log in to plan a trip.</p>
          <button onClick={() => navigate('/')} className="login-btn" style={{ marginTop: '24px' }}>Go to Login</button>
        </div>
      </div>
    );
  }

  const handleTripSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          ...tripForm
        })
      });

      if (response.ok) {
        // Pass user back to dashboard so state is preserved
        navigate('/dashboard', { state: { user } });
      } else {
        alert('Failed to plan trip');
      }
    } catch (err) {
      console.error("Failed to submit trip", err);
    }
  };

  return (
    <div className="login-container" style={{ padding: '40px' }}>
      <div className="login-card" style={{ width: '100%', maxWidth: '600px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2>Plan a New Trip</h2>
          <button onClick={() => navigate('/dashboard', { state: { user } })} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--text-main)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
        </div>
        
        <form onSubmit={handleTripSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="form-group">
            <label>Destination</label>
            <input 
              type="text" 
              required 
              value={tripForm.destination} 
              onChange={e => setTripForm({...tripForm, destination: e.target.value})}
              placeholder="Where are you going?"
            />
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Start Date</label>
              <input 
                type="date" 
                required 
                value={tripForm.start_date} 
                onChange={e => setTripForm({...tripForm, start_date: e.target.value})}
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>End Date</label>
              <input 
                type="date" 
                required 
                value={tripForm.end_date} 
                onChange={e => setTripForm({...tripForm, end_date: e.target.value})}
              />
            </div>
          </div>
          <button type="submit" className="login-btn" style={{ marginTop: '12px' }}>Save Trip</button>
        </form>
      </div>
    </div>
  );
};

export default PlanTrip;
