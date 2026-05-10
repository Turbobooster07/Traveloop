import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const PlanTrip = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.user;

  const [recommendations, setRecommendations] = useState([]);
  const [tripForm, setTripForm] = useState({
    destination: location.state?.initialDestination || '',
    start_date: '',
    end_date: '',
    description: location.state?.initialDescription || ''
  });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceTimer = useRef(null);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/recommendations');
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data);
      }
    } catch (err) {
      console.error("Failed to fetch recommendations", err);
    }
  };

  const handleDestinationChange = (e) => {
    const value = e.target.value;
    setTripForm({...tripForm, destination: value});
    
    // Clear existing timer
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (value.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Debounce 400ms before calling API
    debounceTimer.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(`http://localhost:5000/api/places/search?q=${encodeURIComponent(value)}`);
        const data = await response.json();
        setSuggestions(data);
        setShowSuggestions(data.length > 0);
      } catch (err) {
        console.error('Place search error', err);
      } finally {
        setIsSearching(false);
      }
    }, 400);
  };

  const handleSelectPlace = (place) => {
    setTripForm({...tripForm, destination: place.name});
    setShowSuggestions(false);
  };

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
        navigate('/dashboard', { state: { user } });
      } else {
        alert('Failed to plan trip');
      }
    } catch (err) {
      console.error("Failed to submit trip", err);
    }
  };

  const handleLogout = () => {
    navigate('/');
  };

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

  return (
    <div className="dash-wrapper">
      {/* Unified Navbar identical to Dashboard.jsx */}
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
          <button onClick={handleLogout} className="dash-btn-chip" style={{ background: 'transparent', border: '1px solid var(--border-medium)' }}>
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

      <div className="dash-container">
        <header className="dashboard-header" style={{ textAlign: 'left', padding: '0 8px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: '800', fontFamily: "'Outfit', sans-serif", color: 'var(--text-main)', letterSpacing: '-1px', margin: '0 0 8px 0' }}>Plan Your Next Adventure</h1>
          <p className="subtitle" style={{ fontSize: '16px', margin: 0, textAlign: 'left' }}>Where would you like to go, {user.first_name}?</p>
        </header>

        <div className="dashboard-content" style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          {/* Form Card */}
          <div className="dashboard-card" style={{ 
            flex: '1 1 60%',
            background: 'var(--card-bg)',
            backdropFilter: 'blur(20px) saturate(150%)',
            WebkitBackdropFilter: 'blur(20px) saturate(150%)',
            border: '1px solid var(--border-medium)',
            borderRadius: '32px',
            padding: '40px',
            boxShadow: 'var(--shadow-soft)'
           }}>
            <h3 style={{ fontSize: '24px', fontWeight: '700', fontFamily: "'Outfit', sans-serif", margin: '0 0 24px 0', color: 'var(--text-main)' }}>Trip Details</h3>
            
            <form onSubmit={handleTripSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative' }}>
                <label style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-main)' }}>Destination</label>
                <input 
                  type="text" 
                  required 
                  value={tripForm.destination} 
                  onChange={handleDestinationChange}
                  onFocus={() => {
                    if (tripForm.destination && suggestions.length > 0) setShowSuggestions(true);
                  }}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="e.g. Paris, France"
                  className="login-input"
                  style={{ width: '100%', padding: '16px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '16px', color: 'var(--text-main)', fontSize: '16px', outline: 'none' }}
                />
                {isSearching && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--card-bg)', border: '1px solid var(--border-medium)', borderRadius: '12px', marginTop: '4px', padding: '12px 16px', zIndex: 10, color: 'var(--text-muted)', fontSize: '14px', backdropFilter: 'blur(20px)' }}>
                    Searching...
                  </div>
                )}
                {showSuggestions && suggestions.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '16px',
                    marginTop: '4px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    zIndex: 10,
                    boxShadow: 'var(--shadow-hover)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)'
                  }}>
                    {suggestions.map((place, idx) => (
                      <div 
                        key={idx}
                        onClick={() => handleSelectPlace(place)}
                        style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: idx !== suggestions.length - 1 ? '1px solid var(--border-light)' : 'none' }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.4)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{ fontWeight: '500', color: 'var(--text-main)' }}>{place.name}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: '1 1 200px' }}>
                  <label style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-main)' }}>Start Date</label>
                  <input 
                    type="date" 
                    required 
                    value={tripForm.start_date} 
                    onChange={e => setTripForm({...tripForm, start_date: e.target.value})}
                    style={{ width: '100%', padding: '16px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '16px', color: 'var(--text-main)', fontSize: '16px', outline: 'none' }}
                  />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: '1 1 200px' }}>
                  <label style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-main)' }}>End Date</label>
                  <input 
                    type="date" 
                    required 
                    value={tripForm.end_date} 
                    onChange={e => setTripForm({...tripForm, end_date: e.target.value})}
                    style={{ width: '100%', padding: '16px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '16px', color: 'var(--text-main)', fontSize: '16px', outline: 'none' }}
                  />
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-main)' }}>Trip Notes</label>
                <textarea
                  rows={4}
                  value={tripForm.description}
                  onChange={e => setTripForm({...tripForm, description: e.target.value})}
                  placeholder="What are you planning to do? Any notes about this trip..."
                  style={{ width: '100%', padding: '16px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '16px', color: 'var(--text-main)', fontSize: '16px', outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: '1.6' }}
                />
              </div>

              <button type="submit" className="login-btn" style={{ padding: '16px', fontSize: '18px', marginTop: '8px', borderRadius: '16px', boxShadow: 'var(--cta-shadow)' }}>
                Save Trip
              </button>
            </form>
          </div>

          {/* Inspiration Area */}
          <div className="dashboard-card" style={{ 
            flex: '1 1 35%',
            background: 'var(--card-bg)',
            backdropFilter: 'blur(20px) saturate(150%)',
            WebkitBackdropFilter: 'blur(20px) saturate(150%)',
            border: '1px solid var(--border-medium)',
            borderRadius: '32px',
            padding: '40px',
            boxShadow: 'var(--shadow-soft)',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            height: 'fit-content'
           }}>
             <h3 style={{ fontSize: '24px', fontWeight: '700', fontFamily: "'Outfit', sans-serif", margin: '0', color: 'var(--text-main)' }}>Inspiration</h3>
             <p style={{ margin: '0', color: 'var(--text-muted)' }}>Need ideas? Here are some top destinations.</p>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {recommendations.slice(0, 3).map(rec => (
                  <div key={rec.id} style={{ display: 'flex', gap: '16px', alignItems: 'center', cursor: 'pointer', padding: '8px', borderRadius: '16px', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.4)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'} onClick={() => { setTripForm({...tripForm, destination: rec.location}); }}>
                    <img src={rec.image} alt={rec.title} style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover' }} />
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', color: 'var(--text-main)' }}>{rec.title}</h4>
                      <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)' }}>{rec.location}</p>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanTrip;
