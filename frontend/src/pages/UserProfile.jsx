import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

const UserProfile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Try to get user from state, otherwise fallback to localStorage
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : (location.state?.user || null);
  });

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Re-check localStorage in case we came back from settings
    const freshUser = localStorage.getItem('user');
    if (freshUser) {
      const parsed = JSON.parse(freshUser);
      setUser(parsed);
      fetchUserData(parsed.id);
      fetchTrips(parsed.id);
    } else if (user?.id) {
      fetchUserData(user.id);
      fetchTrips(user.id);
    } else {
      navigate('/');
      setLoading(false);
    }
  }, [navigate]);

  const fetchUserData = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      }
    } catch (err) {
      console.error("Failed to fetch user data", err);
    }
  };

  const fetchTrips = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/trips/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setTrips(data);
      }
    } catch (err) {
      console.error("Failed to fetch trips", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const getInitials = (first, last) => {
    return `${first?.charAt(0) || ''}${last?.charAt(0) || ''}`;
  };

  if (loading) {
    return <div className="dash-wrapper" style={{ justifyContent: 'center', alignItems: 'center', height: '100vh' }}><h3>Loading Profile...</h3></div>;
  }

  if (!user) {
    // This part is mostly redundant now because of the useEffect redirect, but kept as a safety
    return null;
  }

  // Filter trips into upcoming (preplanned) and previous
  const now = new Date();
  const preplannedTrips = trips.filter(trip => new Date(trip.start_date) >= now);
  const previousTrips = trips.filter(trip => new Date(trip.end_date) < now);

  // Helper to get image based on destination (or fallback)
  const getTripImage = (destination) => {
    const dest = destination.toLowerCase();
    if (dest.includes('bali')) return 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=600&h=400';
    if (dest.includes('paris')) return 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&q=80&w=600&h=400';
    if (dest.includes('kyoto') || dest.includes('japan')) return 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=600&h=400';
    if (dest.includes('santorini') || dest.includes('greece')) return 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?auto=format&fit=crop&q=80&w=600&h=400';
    if (dest.includes('peru') || dest.includes('machu')) return 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?auto=format&fit=crop&q=80&w=600&h=400';
    if (dest.includes('banff') || dest.includes('canada')) return 'https://images.unsplash.com/photo-1561134643-66c98f98126d?auto=format&fit=crop&q=80&w=600&h=400';
    
    // Default fallback images using a nature/travel theme
    return `https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=600&h=400&sig=${destination.length}`;
  };

  return (
    <div className="dash-wrapper">
      {/* Background Shapes */}
      <div className="bg-shape-yellow"></div>
      <div className="bg-shape-blue-square"></div>
      <div className="bg-shape-pink-blob"></div>
      <div className="bg-shape-purple-circle"></div>
      <div className="bg-shape-green-blob"></div>

      {/* Header Section */}
      <nav className="dash-nav">
        <div className="dash-logo">
          <Link to="/dashboard" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h1>Traveloop</h1>
          </Link>
        </div>
        <div className="dash-actions" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <Link to="/dashboard" className="dash-section-link" style={{ textDecoration: 'none' }}>Dashboard</Link>
          <Link to="/community" className="dash-section-link" style={{ textDecoration: 'none' }}>Community</Link>
          <div className="dash-profile" onClick={handleLogout} title="Logout">
            {getInitials(user.first_name, user.last_name)}
          </div>
        </div>
      </nav>

      <div className="profile-container">
        {/* User Information Section */}
        <section className="profile-user-info">
          <div className="profile-image-wrapper">
            <img src={(user.profile_pic && user.profile_pic.length > 50) ? user.profile_pic : `https://ui-avatars.com/api/?name=${user.first_name}+${user.last_name}&background=ffc8dd&color=96426b&size=200`} alt="User Profile" />
          </div>
          <div className="profile-details-container">
            <h2>{user.first_name} {user.last_name}</h2>
            <p className="profile-email">{user.email}</p>
            <p className="profile-bio">{user.additional_info || 'Welcome to your travel profile! Start planning your next adventure.'}</p>
            <button className="edit-profile-btn" onClick={() => navigate('/settings')}>Edit Profile</button>
          </div>
        </section>

        {/* Preplanned Trips Section */}
        <section className="profile-trip-section">
          <div className="dash-section-header">
            <h3>Preplanned Trips</h3>
            <span className="dash-section-link">View all</span>
          </div>
          {preplannedTrips.length > 0 ? (
            <div className="profile-trips-grid">
              {preplannedTrips.map(trip => (
                <div key={trip.id} className="profile-trip-card">
                  <div className="trip-card-img">
                    <img src={getTripImage(trip.destination)} alt={trip.destination} />
                  </div>
                  <div className="trip-card-body">
                    <h4>{trip.destination}</h4>
                    <p className="trip-card-date">{new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}</p>
                    <button className="view-trip-btn" onClick={() => navigate('/build-itinerary', { state: { user, trip } })}>View</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="subtitle" style={{ textAlign: 'left', margin: '20px 0' }}>No preplanned trips found. Time to explore!</p>
          )}
        </section>

        {/* Previous Trips Section */}
        <section className="profile-trip-section">
          <div className="dash-section-header">
            <h3>Previous Trips</h3>
            <span className="dash-section-link">View all</span>
          </div>
          {previousTrips.length > 0 ? (
            <div className="profile-trips-grid">
              {previousTrips.map(trip => (
                <div key={trip.id} className="profile-trip-card">
                  <div className="trip-card-img">
                    <img src={getTripImage(trip.destination)} alt={trip.destination} />
                  </div>
                  <div className="trip-card-body">
                    <h4>{trip.destination}</h4>
                    <p className="trip-card-date">{new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}</p>
                    <button className="view-trip-btn" onClick={() => navigate('/build-itinerary', { state: { user, trip } })}>View</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="subtitle" style={{ textAlign: 'left', margin: '20px 0' }}>No previous trips yet. Your journey is just beginning.</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default UserProfile;
