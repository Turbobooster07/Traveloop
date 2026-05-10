import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const PlanTrip = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.user;

  const [recommendations, setRecommendations] = useState([]);
  const [tripForm, setTripForm] = useState({
    destination: '',
    start_date: '',
    end_date: '',
    description: ''
  });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceTimer = useRef(null);

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

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="dashboard-layout">
      {/* Top Navbar */}
      <nav className="dashboard-navbar">
        <div className="navbar-logo" onClick={() => navigate('/dashboard', { state: { user } })} style={{ cursor: 'pointer' }}>
          <img src="/logo.png" alt="Traveloop Logo" />
          <h2>Traveloop</h2>
        </div>
        <div className="navbar-user">
          <div className="user-details">
            <span className="user-name">{user.first_name} {user.last_name}</span>
            <span className="user-username">@{user.username}</span>
          </div>
          <div className="user-avatar">
            {user.first_name.charAt(0)}{user.last_name.charAt(0)}
          </div>
          <button onClick={handleLogout} className="logout-btn navbar-logout">Log Out</button>
        </div>
      </nav>

      <div className="dashboard-body">
        <main className="dashboard-main">
          <div className="dashboard-inner" style={{ paddingTop: '20px' }}>
            
            <div className="dashboard-content">
              <div style={{ width: '100%', maxWidth: '700px', padding: '20px 0 40px 0' }}>
                <div style={{ marginBottom: '24px' }}>
                  <h2 style={{ margin: 0, color: 'var(--text-main)', fontSize: '32px' }}>Plan a New Trip</h2>
                </div>
                
                <form onSubmit={handleTripSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '32px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative' }}>
                    <label style={{ fontSize: '16px', fontWeight: '500', color: 'var(--text-main)' }}>Select Place</label>
                    <input 
                      type="text" 
                      required 
                      value={tripForm.destination} 
                      onChange={handleDestinationChange}
                      onFocus={() => {
                        if (tripForm.destination && suggestions.length > 0) setShowSuggestions(true);
                      }}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      placeholder="Where are you going?"
                      style={{ width: '100%', padding: '16px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'var(--text-main)', fontSize: '16px', outline: 'none' }}
                    />
                    {isSearching && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--card-bg)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', marginTop: '4px', padding: '12px 16px', zIndex: 10, color: 'var(--text-muted)', fontSize: '14px' }}>
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
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        marginTop: '4px',
                        maxHeight: '200px',
                        overflowY: 'auto',
                        zIndex: 10,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                        backdropFilter: 'blur(16px)',
                        WebkitBackdropFilter: 'blur(16px)'
                      }}>
                        {suggestions.map((place, idx) => (
                          <div 
                            key={idx}
                            onClick={() => handleSelectPlace(place)}
                            style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: idx !== suggestions.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}
                            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <div style={{ fontWeight: '500', color: 'var(--text-main)' }}>{place.name}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                      <label style={{ fontSize: '16px', fontWeight: '500', color: 'var(--text-main)' }}>Start Date</label>
                      <input 
                        type="date" 
                        required 
                        value={tripForm.start_date} 
                        onChange={e => setTripForm({...tripForm, start_date: e.target.value})}
                        style={{ width: '100%', padding: '16px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'var(--text-main)', fontSize: '16px', outline: 'none' }}
                      />
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                      <label style={{ fontSize: '16px', fontWeight: '500', color: 'var(--text-main)' }}>End Date</label>
                      <input 
                        type="date" 
                        required 
                        value={tripForm.end_date} 
                        onChange={e => setTripForm({...tripForm, end_date: e.target.value})}
                        style={{ width: '100%', padding: '16px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'var(--text-main)', fontSize: '16px', outline: 'none' }}
                      />
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '16px', fontWeight: '500', color: 'var(--text-main)' }}>Trip Description</label>
                    <textarea
                      rows={4}
                      value={tripForm.description}
                      onChange={e => setTripForm({...tripForm, description: e.target.value})}
                      placeholder="What are you planning to do? Any notes about this trip..."
                      style={{ width: '100%', padding: '16px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'var(--text-main)', fontSize: '16px', outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: '1.6' }}
                    />
                  </div>

                  <button type="submit" className="login-btn" style={{ padding: '16px', fontSize: '18px', marginTop: '8px', borderRadius: '12px' }}>Save Trip</button>
                </form>
              </div>
            </div>

            {/* Recommendations Section */}
            <div className="recommendations-section" style={{ marginTop: '60px', width: '100%' }}>
              <h2 style={{ marginBottom: '24px', color: 'var(--text-main)' }}>Recommended Places to Visit</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                {recommendations.map(rec => (
                  <div key={rec.id} className="recommendation-card" style={{ minWidth: '240px' }}>
                    <img src={rec.image} alt={rec.title} />
                    <div className="recommendation-content">
                      <h4>{rec.title}</h4>
                      <p className="location">{rec.location}</p>
                      <p className="desc">{rec.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default PlanTrip;
