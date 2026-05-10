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
        <div className="dash-profile" onClick={handleLogout} title="Logout">
          {getInitials(user.first_name, user.last_name)}
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

        <div className="dashboard-inner">
          <header className="dashboard-header">
            <h1>Welcome back, {user.first_name}!</h1>
            <p className="subtitle">Here's what's happening with your travels today.</p>
          </header>

          <div className="dashboard-content">
            <div className="dashboard-card" style={{ flex: 1 }}>
              <h3>Upcoming Trips</h3>
              {trips.length > 0 ? (
                <div className="trips-list" style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {trips.map(trip => (
                    <div key={trip.id} className="trip-item" style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <h4 style={{ margin: '0 0 4px 0', color: 'var(--primary-color)' }}>{trip.destination}</h4>
                      <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                        {new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}
                      </p>
                      <span style={{ fontSize: '12px', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '4px 8px', borderRadius: '4px' }}>{trip.status}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="subtitle" style={{ marginTop: '12px' }}>You have no upcoming trips. Start planning your next adventure!</p>
              )}
              <button className="login-btn" style={{ width: 'auto', padding: '10px 24px', marginTop: '20px' }} onClick={() => navigate('/plan-trip', { state: { user } })}>Plan a Trip</button>
            </div>
          </div>

          {/* Recommendations Section */}
          <div className="recommendations-section" style={{ marginTop: '40px' }}>
            <h2 style={{ marginBottom: '20px' }}>Recommended For You</h2>
            <div className="recommendations-scroll">
              {recommendations.map(rec => (
                <div key={rec.id} className="recommendation-card">
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
