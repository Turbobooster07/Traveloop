import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const DayWiseItinerary = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.user;
  const trip = location.state?.trip;

  // Initial structure: 2 days, each with 2 activities
  const [days, setDays] = useState([
    {
      id: 1,
      dayNumber: 1,
      activities: [
        { id: 101, text: '', expense: '' },
        { id: 102, text: '', expense: '' }
      ]
    },
    {
      id: 2,
      dayNumber: 2,
      activities: [
        { id: 201, text: '', expense: '' },
        { id: 202, text: '', expense: '' }
      ]
    }
  ]);

  if (!user) {
    return (
      <div className="login-container">
        <div className="login-card" style={{ textAlign: 'center' }}>
          <h2>Unauthorized</h2>
          <p className="subtitle" style={{ marginTop: '12px' }}>Please log in to build your day plan.</p>
          <button onClick={() => navigate('/')} className="login-btn" style={{ marginTop: '24px' }}>Go to Login</button>
        </div>
      </div>
    );
  }

  const handleActivityChange = (dayId, activityId, field, value) => {
    setDays(days.map(day => {
      if (day.id === dayId) {
        return {
          ...day,
          activities: day.activities.map(act => 
            act.id === activityId ? { ...act, [field]: value } : act
          )
        };
      }
      return day;
    }));
  };

  const addActivity = (dayId) => {
    setDays(days.map(day => {
      if (day.id === dayId) {
        return {
          ...day,
          activities: [...day.activities, { id: Date.now(), text: '', expense: '' }]
        };
      }
      return day;
    }));
  };

  const addDay = () => {
    setDays([
      ...days,
      {
        id: Date.now(),
        dayNumber: days.length + 1,
        activities: [{ id: Date.now() + 1, text: '', expense: '' }]
      }
    ]);
  };

  const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    background: 'var(--input-bg)',
    border: '1px solid var(--input-border)',
    borderRadius: '12px',
    color: 'var(--text-main)',
    fontSize: '15px',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  };

  return (
    <div className="dash-wrapper">
      {/* Navbar matching other screens */}
      <nav className="dash-nav">
        <div className="dash-logo" onClick={() => navigate('/dashboard', { state: { user } })} style={{ cursor: 'pointer' }}>
          <h1>Traveloop</h1>
        </div>
        <div className="dash-actions" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <button
            onClick={() => navigate('/my-trips', { state: { user } })}
            style={{
              padding: '10px 20px',
              background: 'var(--card-bg)',
              backdropFilter: 'blur(16px)',
              border: '1px solid var(--border-medium)',
              borderRadius: '14px',
              fontSize: '14px',
              fontWeight: '600',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-main)'; e.currentTarget.style.background = 'rgba(255,255,255,0.6)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'var(--card-bg)'; }}
          >
            🗺️ My Trips
          </button>
          <button
            onClick={() => navigate('/community', { state: { user } })}
            style={{
              padding: '10px 20px',
              background: 'var(--card-bg)',
              backdropFilter: 'blur(16px)',
              border: '1px solid var(--border-medium)',
              borderRadius: '14px',
              fontSize: '14px',
              fontWeight: '600',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-main)'; e.currentTarget.style.background = 'rgba(255,255,255,0.6)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'var(--card-bg)'; }}
          >
            👥 Community
          </button>
          <button
            onClick={() => navigate('/notes', { state: { user } })}
            style={{
              padding: '10px 20px',
              background: 'var(--card-bg)',
              backdropFilter: 'blur(16px)',
              border: '1px solid var(--border-medium)',
              borderRadius: '14px',
              fontSize: '14px',
              fontWeight: '600',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-main)'; e.currentTarget.style.background = 'rgba(255,255,255,0.6)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'var(--card-bg)'; }}
          >
            📔 Trip Notes
          </button>
          <button onClick={() => navigate('/')} className="dash-btn-chip" style={{ background: 'transparent', border: '1px solid var(--border-medium)' }}>
            Logout
          </button>
          <div className="dash-profile" onClick={() => navigate('/profile')} title="View Profile">
            {user.profile_pic ? (
              <img src={user.profile_pic} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              `${user.first_name?.charAt(0)}${user.last_name?.charAt(0)}`
            )}
          </div>
        </div>
      </nav>

      <div className="dash-container" style={{ maxWidth: '900px', padding: '40px 5%' }}>
        <header style={{ marginBottom: '40px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '800', fontFamily: "'Outfit', sans-serif", color: 'var(--text-main)', margin: '0 0 12px 0' }}>
            Itinerary for {trip ? trip.destination : 'a selected place'}
          </h1>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '80px', marginTop: '24px' }}>
            <span style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>Physical Activity</span>
            <span style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>Expense</span>
          </div>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
          {days.map((day) => (
            <div key={day.id} style={{ display: 'flex', gap: '32px' }}>
              {/* Day Label */}
              <div style={{ width: '80px', flexShrink: 0 }}>
                <div style={{
                  padding: '10px',
                  background: 'var(--card-bg)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '700',
                  color: 'var(--text-main)',
                  textAlign: 'center',
                  boxShadow: 'var(--shadow-card)'
                }}>
                  Day {day.dayNumber}
                </div>
              </div>

              {/* Activities list */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {day.activities.map((act, index) => (
                  <React.Fragment key={act.id}>
                    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                      {/* Physical Activity Input */}
                      <div style={{ flex: 3 }}>
                        <input
                          type="text"
                          placeholder="E.g. Visit Museum..."
                          value={act.text}
                          onChange={(e) => handleActivityChange(day.id, act.id, 'text', e.target.value)}
                          style={{
                            ...inputStyle,
                            background: '#ffffff',
                            boxShadow: 'var(--shadow-soft)'
                          }}
                        />
                      </div>
                      {/* Expense Input */}
                      <div style={{ flex: 1 }}>
                        <input
                          type="number"
                          placeholder="₹ 0"
                          value={act.expense}
                          onChange={(e) => handleActivityChange(day.id, act.id, 'expense', e.target.value)}
                          style={{
                            ...inputStyle,
                            background: '#ffffff',
                            boxShadow: 'var(--shadow-soft)'
                          }}
                        />
                      </div>
                    </div>
                    {/* Arrow between activities (if not the last one) */}
                    {index < day.activities.length - 1 && (
                      <div style={{ display: 'flex', justifyContent: 'flex-start', paddingLeft: '40%' }}>
                        <span style={{ color: 'var(--border-medium)', fontSize: '24px', lineHeight: '1' }}>↓</span>
                      </div>
                    )}
                  </React.Fragment>
                ))}
                
                {/* Add new activity for this day */}
                <button
                  onClick={() => addActivity(day.id)}
                  style={{
                    alignSelf: 'flex-start',
                    marginTop: '8px',
                    padding: '8px 16px',
                    background: 'transparent',
                    border: '1px dashed var(--border-medium)',
                    borderRadius: '8px',
                    color: 'var(--text-muted)',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-main)'; e.currentTarget.style.borderColor = 'var(--input-focus)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border-medium)'; }}
                >
                  + Add Activity
                </button>
              </div>
            </div>
          ))}

          {/* Add Day Button */}
          <button
            onClick={addDay}
            style={{
              padding: '20px',
              background: 'var(--card-bg)',
              border: '2px dashed var(--border-medium)',
              borderRadius: '24px',
              cursor: 'pointer',
              fontSize: '17px',
              fontWeight: '700',
              color: 'var(--text-muted)',
              fontFamily: "'Outfit', sans-serif",
              transition: 'all 0.3s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--accent-purple-bg)';
              e.currentTarget.style.borderColor = 'var(--accent-purple)';
              e.currentTarget.style.color = 'var(--accent-purple-text)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'var(--card-bg)';
              e.currentTarget.style.borderColor = 'var(--border-medium)';
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
          >
            <span style={{ fontSize: '22px' }}>＋</span>
            Add another Day
          </button>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
            <button
              onClick={() => { alert('Saved day plan!'); navigate('/dashboard', { state: { user }}); }}
              style={{
                padding: '14px 40px',
                background: 'var(--cta-gradient)',
                color: '#fff',
                border: 'none',
                borderRadius: '16px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: 'var(--cta-shadow)'
              }}
            >
              Save Day Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DayWiseItinerary;
