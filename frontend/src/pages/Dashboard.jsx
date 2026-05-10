import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = location.state?.user;

  const [trips, setTrips] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  if (!user) {
    return (
      <div className="login-container">
        <div className="login-card" style={{ textAlign: 'center' }}>
          <h2>Unauthorized</h2>
          <p className="subtitle" style={{ marginTop: '12px' }}>Please log in to access the dashboard.</p>
          <button onClick={() => navigate('/')} className="login-btn" style={{ marginTop: '24px' }}>Go to Login</button>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (user) {
      fetchTrips();
      fetchRecommendations();
    }
  }, [user]);

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
          <div className="dash-profile" onClick={handleLogout} title="Logout">
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
              <input type="text" placeholder="Where do you want to go?" />
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
              background: 'rgba(255, 255, 255, 0.4)',
              backdropFilter: 'blur(30px) saturate(150%)',
              WebkitBackdropFilter: 'blur(30px) saturate(150%)',
              border: '1px solid rgba(255, 255, 255, 0.6)',
              borderRadius: '32px',
              padding: '40px',
              boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.05), inset 0 2px 5px rgba(255, 255, 255, 0.8)'
             }}>
              <h3 style={{ fontSize: '24px', fontWeight: '700', fontFamily: "'Outfit', sans-serif", margin: '0 0 24px 0', color: 'var(--text-main)' }}>Upcoming Trips</h3>
              {trips.length > 0 ? (
                <div className="trips-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {trips.map(trip => (
                    <div key={trip.id} className="trip-item" style={{ 
                      background: 'rgba(255, 255, 255, 0.6)', 
                      padding: '24px', 
                      borderRadius: '20px', 
                      border: '1px solid rgba(255, 255, 255, 0.8)',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 25px rgba(0,0,0,0.08)'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.03)'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.6)'; }}
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
                          📋 Build Itinerary
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
              background: 'rgba(255, 255, 255, 0.3)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              borderRadius: '32px',
              padding: '40px',
              boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.03)'
           }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', fontFamily: "'Outfit', sans-serif", margin: '0 0 24px 0', color: 'var(--text-main)' }}>Recommended For You</h2>
            <div className="recommendations-scroll" style={{ display: 'flex', gap: '24px', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'none' }}>
              {recommendations.map(rec => (
                <div key={rec.id} className="recommendation-card" style={{ 
                  minWidth: '280px', 
                  background: 'rgba(255, 255, 255, 0.6)', 
                  borderRadius: '20px', 
                  overflow: 'hidden', 
                  border: '1px solid rgba(255, 255, 255, 0.8)',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.04)',
                  transition: 'transform 0.3s'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-6px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
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
