import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // We'll use a mock user if one isn't provided so we can see the design
  const user = location.state?.user || { first_name: 'Jane', last_name: 'Doe' };

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
                <img src="/regional_1.png" alt="Asia" style={{filter: 'hue-rotate(90deg)'}}/>
              </div>
              <div className="dash-card-square-info">
                <h4>Southeast Asia</h4>
              </div>
            </div>
            <div className="dash-card-square">
              <div className="dash-card-square-img">
                <img src="/regional_1.png" alt="Americas" style={{filter: 'hue-rotate(180deg)'}}/>
              </div>
              <div className="dash-card-square-info">
                <h4>Latin America</h4>
              </div>
            </div>
            <div className="dash-card-square">
              <div className="dash-card-square-img">
                <img src="/regional_1.png" alt="Nordics" style={{filter: 'hue-rotate(270deg)'}}/>
              </div>
              <div className="dash-card-square-info">
                <h4>The Nordics</h4>
              </div>
            </div>
            <div className="dash-card-square">
              <div className="dash-card-square-img">
                <img src="/regional_1.png" alt="Africa" style={{filter: 'sepia(0.5)'}}/>
              </div>
              <div className="dash-card-square-info">
                <h4>North Africa</h4>
              </div>
            </div>
          </div>
        </div>

        {/* Previous Trips */}
        <div className="dash-section">
          <div className="dash-section-header">
            <h3>Previous Trips</h3>
            <span className="dash-section-link">View history</span>
          </div>
          <div className="dash-cards-scroll-container">
            {/* Trip Card 1 */}
            <div className="dash-card-vert">
              <img src="/trip_1.png" alt="Maldives" />
              <div className="dash-card-vert-overlay">
                <h4>Maldives Escape</h4>
                <p>June 2025</p>
              </div>
            </div>
            {/* Duplicate cards for UI demonstration */}
            <div className="dash-card-vert">
              <img src="/trip_1.png" alt="Bali" style={{filter: 'hue-rotate(45deg)'}}/>
              <div className="dash-card-vert-overlay">
                <h4>Bali Retreat</h4>
                <p>March 2025</p>
              </div>
            </div>
            <div className="dash-card-vert">
              <img src="/trip_1.png" alt="Alps" style={{filter: 'hue-rotate(135deg)'}}/>
              <div className="dash-card-vert-overlay">
                <h4>Swiss Alps</h4>
                <p>December 2024</p>
              </div>
            </div>
            <div className="dash-card-vert">
              <img src="/trip_1.png" alt="Tokyo" style={{filter: 'hue-rotate(225deg)'}}/>
              <div className="dash-card-vert-overlay">
                <h4>Tokyo Lights</h4>
                <p>October 2024</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Floating Action Button */}
      <button className="dash-fab">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Plan a trip
      </button>

    </div>
  );
};

export default Dashboard;
