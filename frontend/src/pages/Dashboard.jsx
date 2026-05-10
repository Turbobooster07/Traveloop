import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Try to get user from state, otherwise fallback to localStorage
  const [user, setUser] = useState(() => {
    if (location.state?.user) return location.state.user;
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [trips, setTrips] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    if (!user) {
      // If still no user, redirect to login
      navigate('/');
      return;
    }
    fetchTrips();
    fetchRecommendations();
  }, [user, navigate]);

  const fetchTrips = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/trips/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setTrips(data);
      }
    } catch (err) {
      console.error("Failed to fetch trips", err);
    }
  };

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

  const upcomingTrips = trips.filter(trip => new Date(trip.end_date) >= new Date());
  const pastTrips = trips.filter(trip => new Date(trip.end_date) < new Date());

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const getInitials = (first, last) => {
    return `${first?.charAt(0) || ''}${last?.charAt(0) || ''}`;
  };

  return (
    <div className="dash-wrapper">
      <div className="bg-shape-yellow"></div>
      <div className="bg-shape-blue-square"></div>
      <div className="bg-shape-pink-blob"></div>
      <div className="bg-shape-purple-circle"></div>
      <div className="bg-shape-green-blob"></div>

      {/* Navbar */}
      <nav className="dash-nav">
        <div className="dash-logo">
          <h1>Traveloop</h1>
        </div>
        <div className="dash-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
            My Trips
          </button>
          <button onClick={handleLogout} className="dash-btn-chip" style={{ background: 'transparent', border: '1px solid var(--border-medium)' }}>
            Logout
          </button>
          <div className="dash-profile" onClick={() => navigate('/profile', { state: { user } })} title="View Profile">
            {getInitials(user.first_name, user.last_name)}
          </div>
        </div>
      </nav>

      <div className="dash-container">
        {/* Banner */}
        <div className="dash-banner">
          <img src="/banner.jpg" alt="Summer Sale Background" />
          <div className="dash-banner-overlay"></div>
          <div className="banner-shape-1"></div>
          <div className="banner-shape-2"></div>
          <div className="dash-banner-content">
            <h2>Discover the World</h2>
          </div>
        </div>

        {/* Toolbar */}
        <div className="dash-toolbar-wrapper">
          <div className="dash-toolbar">
            <div className="dash-search">
              <input 
                type="text" 
                placeholder="Where do you want to go?" 
                readOnly
                onClick={() => navigate('/search', { state: { user } })}
                onFocus={() => navigate('/search', { state: { user } })}
                style={{ cursor: 'pointer' }}
              />
            </div>
            <div className="dash-actions">
              <button className="dash-btn-chip">Dates</button>
              <button className="dash-btn-chip">Guests</button>
              <button className="dash-btn-chip">Filters</button>
            </div>
          </div>
        </div>

        {/* Top Regional Selections */}
        <div className="dash-section">
          <div className="dash-section-header">
            <h3>Top Regional Selections</h3>
            <span className="dash-section-link">View all</span>
          </div>
          <div className="dash-cards-scroll-container">
            {/* Card 1 */}
            <div className="dash-card-square">
              <div className="dash-card-square-img">
                <img src="/regional_1.png" alt="Europe" />
              </div>
              <div className="dash-card-square-info">
                <h4>Western Europe</h4>
              </div>
            </div>
            {/* Duplicate cards for UI demonstration */}
            <div className="dash-card-square">
              <div className="dash-card-square-img">
                <img src="/regional_1.png" alt="Asia" style={{ filter: 'hue-rotate(90deg)' }} />
              </div>
              <div className="dash-card-square-info">
                <h4>Southeast Asia</h4>
              </div>
            </div>
            <div className="dash-card-square">
              <div className="dash-card-square-img">
                <img src="/regional_1.png" alt="Americas" style={{ filter: 'hue-rotate(180deg)' }} />
              </div>
              <div className="dash-card-square-info">
                <h4>Latin America</h4>
              </div>
            </div>
            <div className="dash-card-square">
              <div className="dash-card-square-img">
                <img src="/regional_1.png" alt="Nordics" style={{ filter: 'hue-rotate(270deg)' }} />
              </div>
              <div className="dash-card-square-info">
                <h4>The Nordics</h4>
              </div>
            </div>
            <div className="dash-card-square">
              <div className="dash-card-square-img">
                <img src="/regional_1.png" alt="Africa" style={{ filter: 'sepia(0.5)' }} />
              </div>
              <div className="dash-card-square-info">
                <h4>North Africa</h4>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-inner" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <header className="dashboard-header" style={{ textAlign: 'left', padding: '0 8px' }}>
            <h1 style={{ fontSize: '36px', fontWeight: '800', fontFamily: "'Outfit', sans-serif", color: 'var(--text-main)', letterSpacing: '-1px', margin: '0 0 8px 0' }}>Welcome back, {user.first_name}!</h1>
            <p className="subtitle" style={{ fontSize: '16px', margin: 0, textAlign: 'left' }}>Here's what's happening with your travels today.</p>
          </header>

          <div className="dashboard-content">
            <div className="dashboard-card" style={{ 
              flex: 1,
              background: '#ffffff',
              border: '1px solid var(--border-card)',
              borderRadius: '20px',
              padding: '32px',
              boxShadow: 'var(--shadow-card)'
             }}>
              <h3 style={{ fontSize: '24px', fontWeight: '700', fontFamily: "'Outfit', sans-serif", margin: '0 0 24px 0', color: 'var(--text-main)' }}>Upcoming Trips</h3>
              {trips.length > 0 ? (
                <div className="trips-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {trips.map(trip => (
                    <div key={trip.id} className="trip-item" style={{ 
                      background: 'var(--accent-purple-bg, #ede9fe)', 
                      padding: '20px', 
                      borderRadius: '16px', 
                      border: '1px solid var(--border-card)',
                      boxShadow: 'none',
                      transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-hover)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                      <h4 style={{ margin: '0 0 8px 0', color: 'var(--text-main)', fontSize: '18px', fontWeight: '700' }}>{trip.destination}</h4>
                      <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: 'var(--text-muted)' }}>
                        {new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '13px', background: 'var(--accent-green-bg)', color: 'var(--accent-green-text)', padding: '6px 14px', borderRadius: '100px', fontWeight: '600' }}>{trip.status || 'Planned'}</span>
                        <button
                          onClick={() => navigate('/build-itinerary', { state: { user, trip } })}
                          style={{
                            fontSize: '13px',
                            background: 'var(--cta-gradient)',
                            color: '#fff',
                            padding: '6px 16px',
                            borderRadius: '100px',
                            fontWeight: '600',
                            border: 'none',
                            cursor: 'pointer',
                            boxShadow: 'var(--cta-shadow)',
                            transition: 'opacity 0.2s'
                          }}
                          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                        >
                          Build Itinerary
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="subtitle" style={{ margin: '20px 0', textAlign: 'left' }}>You have no upcoming trips. Start planning your next adventure!</p>
              )}
              <button className="dash-btn-chip" style={{ marginTop: '24px', background: 'var(--text-main)', color: 'white', border: 'none', padding: '14px 28px', fontSize: '15px' }} onClick={() => navigate('/plan-trip', { state: { user } })}>Plan a Trip</button>
            </div>
          </div>

          {/* Recommendations Section */}
          <div className="recommendations-section" style={{ 
              marginTop: '16px',
              background: '#ffffff',
              border: '1px solid var(--border-card)',
              borderRadius: '20px',
              padding: '32px',
              boxShadow: 'var(--shadow-card)'
           }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', fontFamily: "'Outfit', sans-serif", margin: '0 0 24px 0', color: 'var(--text-main)' }}>Recommended For You</h2>
            <div className="recommendations-scroll" style={{ display: 'flex', gap: '24px', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'none' }}>
              {recommendations.map(rec => (
                <div key={rec.id} className="recommendation-card" style={{ 
                  minWidth: '280px', 
                  background: 'var(--card-bg-lavender)', 
                  borderRadius: '16px', 
                  overflow: 'hidden', 
                  border: '1px solid var(--border-card)',
                  boxShadow: 'var(--shadow-card)',
                  transition: 'transform 0.25s, box-shadow 0.25s'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = 'var(--shadow-hover)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-card)'; }}
                >
                  <img src={rec.image} alt={rec.title} style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
                  <div className="recommendation-content" style={{ padding: '20px' }}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '700', color: 'var(--text-main)' }}>{rec.title}</h4>
                    <p className="location" style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#10b981', fontWeight: '600' }}>{rec.location}</p>
                    <p className="desc" style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.5' }}>{rec.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Floating Action Button */}
        <button className="dash-fab" onClick={() => navigate('/plan-trip', { state: { user } })}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Plan a trip
        </button>

      </div>
    </div>
  );
};

export default Dashboard;
