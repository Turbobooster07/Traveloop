import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ user }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const getInitials = (first, last) => {
    return `${first?.charAt(0) || ''}${last?.charAt(0) || ''}`;
  };

  if (!user) return null;

  return (
    <nav className="dash-nav">
      <div className="dash-logo" onClick={() => navigate('/dashboard', { state: { user } })} style={{ cursor: 'pointer' }}>
        <h1>Traveloop</h1>
      </div>
      <div className="dash-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={() => navigate('/dashboard', { state: { user } })}
          className="dash-btn-chip"
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
          Dashboard
        </button>
        <button
          onClick={() => navigate('/my-trips', { state: { user } })}
          className="dash-btn-chip"
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
        <button
          onClick={() => navigate('/community', { state: { user } })}
          className="dash-btn-chip"
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
          className="dash-btn-chip"
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
        <button
          onClick={() => navigate('/billing', { state: { user } })}
          className="dash-btn-chip"
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
          💳 Billing
        </button>
        <button onClick={handleLogout} className="dash-btn-chip" style={{ background: 'transparent', border: '1px solid var(--border-medium)' }}>
          Logout
        </button>
        <div className="dash-profile" onClick={() => navigate('/profile', { state: { user } })} title="View Profile">
          {user && getInitials(user.first_name, user.last_name)}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
