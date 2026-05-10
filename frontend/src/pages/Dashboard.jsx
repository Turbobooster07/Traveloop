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



  const handleLogout = () => {
    // In a real app, you would clear the JWT token here
    navigate('/');
  };

  return (
    <div className="dashboard-layout">
      {/* Top Navbar */}
      <nav className="dashboard-navbar">
        <div className="navbar-logo">
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
        {/* Banner */}
        <div className="dashboard-banner">
          <img src="/banner.png" alt="Traveloop Banner" />
        </div>

        {/* Toolbar */}
        <div className="dashboard-toolbar">
          <div className="toolbar-search">
            <input type="text" placeholder="Search trips, destinations..." />
          </div>
          <div className="toolbar-actions">
            <div className="toolbar-group">
              <label>Group By:</label>
              <select>
                <option>None</option>
                <option>Month</option>
                <option>Status</option>
              </select>
            </div>
            <div className="toolbar-group">
              <label>Filter:</label>
              <select>
                <option>All</option>
                <option>Upcoming</option>
                <option>Past</option>
              </select>
            </div>
            <div className="toolbar-group">
              <label>Sort By:</label>
              <select>
                <option>Date (Closest)</option>
                <option>Date (Furthest)</option>
                <option>Name (A-Z)</option>
              </select>
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
      </main>
    </div>
  </div>
  );
};

export default Dashboard;
