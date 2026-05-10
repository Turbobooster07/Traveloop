import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = location.state?.user;

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

  const handleLogout = () => {
    // In a real app, you would clear the JWT token here
    navigate('/');
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-logo">
          <img src="/logo.png" alt="Traveloop Logo" />
          <h2>Traveloop</h2>
        </div>
        
        <div className="sidebar-user">
          <div className="user-avatar">
            {user.first_name.charAt(0)}{user.last_name.charAt(0)}
          </div>
          <h3>{user.first_name} {user.last_name}</h3>
          <p className="user-username">@{user.username}</p>
          <p className="user-email">{user.email}</p>
        </div>

        <nav className="sidebar-nav">
          <ul>
            <li className="active">Overview</li>
            <li>My Trips</li>
            <li>Saved Destinations</li>
            <li>Settings</li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">Log Out</button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-main">
        <header className="dashboard-header">
          <h1>Welcome back, {user.first_name}!</h1>
          <p className="subtitle">Here's what's happening with your travels today.</p>
        </header>
        
        <div className="dashboard-content">
          <div className="dashboard-card">
            <h3>Upcoming Trips</h3>
            <p className="subtitle">You have no upcoming trips. Start planning your next adventure!</p>
            <button className="login-btn" style={{ width: 'auto', padding: '10px 24px', marginTop: '16px' }}>Plan a Trip</button>
          </div>
          <div className="dashboard-card">
            <h3>Recent Activity</h3>
            <p className="subtitle">Your recent activity will appear here.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
