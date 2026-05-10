import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const BuildItinerary = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.user;
  const trip = location.state?.trip;

  const [sections, setSections] = useState([
    { id: 1, title: 'Section 1', description: '', from_date: '', to_date: '', budget: '' }
  ]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!user) {
    return (
      <div className="login-container">
        <div className="login-card" style={{ textAlign: 'center' }}>
          <h2>Unauthorized</h2>
          <p className="subtitle" style={{ marginTop: '12px' }}>Please log in to build an itinerary.</p>
          <button onClick={() => navigate('/')} className="login-btn" style={{ marginTop: '24px' }}>Go to Login</button>
        </div>
      </div>
    );
  }

  const addSection = () => {
    setSections(prev => [
      ...prev,
      { id: Date.now(), title: `Section ${prev.length + 1}`, description: '', from_date: '', to_date: '', budget: '' }
    ]);
  };

  const removeSection = (id) => {
    if (sections.length === 1) return;
    setSections(prev => prev.filter(s => s.id !== id));
  };

  const updateSection = (id, field, value) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('http://localhost:5000/api/itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trip_id: trip?.id,
          user_id: user.id,
          sections
        })
      });
      if (response.ok) {
        setSaved(true);
        setTimeout(() => {
          navigate('/dashboard', { state: { user } });
        }, 1500);
      } else {
        alert('Failed to save itinerary');
      }
    } catch (err) {
      console.error('Save itinerary error:', err);
      alert('Failed to connect to server');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    background: 'var(--input-bg)',
    border: '1px solid var(--input-border)',
    borderRadius: '14px',
    color: 'var(--text-main)',
    fontSize: '15px',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  };

  const labelStyle = {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text-muted)',
    marginBottom: '6px',
    display: 'block',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  return (
    <div className="dash-wrapper">
      {/* Navbar */}
      <nav className="dash-nav">
        <div className="dash-logo" onClick={() => navigate('/dashboard', { state: { user } })} style={{ cursor: 'pointer' }}>
          <h1>Traveloop</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {trip && (
            <span style={{ fontSize: '15px', color: 'var(--text-muted)', fontWeight: '600', background: 'var(--card-bg-lavender)', padding: '6px 14px', borderRadius: '100px' }}>
              ✈️ {trip.destination}
            </span>
          )}
          <button onClick={() => navigate('/dashboard', { state: { user } })} 
            style={{
              padding: '8px 20px',
              background: 'var(--card-bg)',
              border: '1px solid var(--border-medium)',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-main)'; e.currentTarget.style.borderColor = 'var(--input-focus)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border-medium)'; }}>
            Dashboard
          </button>
          <div className="dash-profile">
            {user.first_name.charAt(0)}{user.last_name.charAt(0)}
          </div>
        </div>
      </nav>

      <div className="dash-container">
        {/* Header */}
        <header style={{ padding: '0 8px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: '800', fontFamily: "'Outfit', sans-serif", color: 'var(--text-main)', letterSpacing: '-1px', margin: '0 0 8px 0' }}>
            Build Itinerary
          </h1>
          <p style={{ fontSize: '16px', margin: 0, color: 'var(--text-muted)' }}>
            {trip ? `Planning sections for your trip to ${trip.destination}` : 'Plan your trip sections, dates and budget'}
          </p>
        </header>

        {/* Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '860px' }}>
          {sections.map((section, index) => (
            <div
              key={section.id}
              style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--border-card)',
                borderRadius: '24px',
                padding: '32px',
                boxShadow: 'var(--shadow-card)',
                position: 'relative',
                transition: 'box-shadow 0.3s, transform 0.3s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-hover)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-card)'; }}
            >
              {/* Section Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: 'var(--cta-gradient)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '16px', fontWeight: '800', color: '#fff',
                    boxShadow: 'var(--cta-shadow)'
                  }}>
                    {index + 1}
                  </div>
                  <input
                    value={section.title}
                    onChange={e => updateSection(section.id, 'title', e.target.value)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      fontSize: '20px',
                      fontWeight: '700',
                      fontFamily: "'Outfit', sans-serif",
                      color: 'var(--text-main)',
                      width: '260px'
                    }}
                  />
                </div>
                {sections.length > 1 && (
                  <button
                    onClick={() => removeSection(section.id)}
                    style={{
                      background: 'rgba(255, 100, 100, 0.12)',
                      border: '1px solid rgba(255, 100, 100, 0.2)',
                      borderRadius: '10px',
                      padding: '6px 14px',
                      color: '#e05c5c',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '600',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 100, 100, 0.22)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 100, 100, 0.12)'}
                  >
                    Remove
                  </button>
                )}
              </div>

              {/* Description */}
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Description</label>
                <textarea
                  rows={3}
                  value={section.description}
                  onChange={e => updateSection(section.id, 'description', e.target.value)}
                  placeholder="All the necessary information about this section. This can be anything like travel details, hotel or any other activity..."
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.6' }}
                />
              </div>

              {/* Date Range + Budget Row */}
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div style={{ flex: '1 1 180px' }}>
                  <label style={labelStyle}>Date Range: From</label>
                  <input
                    type="date"
                    value={section.from_date}
                    onChange={e => updateSection(section.id, 'from_date', e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div style={{ flex: '1 1 180px' }}>
                  <label style={labelStyle}>To</label>
                  <input
                    type="date"
                    value={section.to_date}
                    onChange={e => updateSection(section.id, 'to_date', e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div style={{ flex: '1 1 180px' }}>
                  <label style={labelStyle}>Budget of this section (₹)</label>
                  <input
                    type="number"
                    value={section.budget}
                    onChange={e => updateSection(section.id, 'budget', e.target.value)}
                    placeholder="e.g. 15000"
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Add Section Button */}
          <button
            onClick={addSection}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              width: '100%',
              maxWidth: '860px',
              padding: '20px',
              background: 'var(--card-bg)',
              border: '2px dashed var(--border-medium)',
              borderRadius: '24px',
              cursor: 'pointer',
              fontSize: '17px',
              fontWeight: '700',
              color: 'var(--text-muted)',
              fontFamily: "'Outfit', sans-serif",
              transition: 'all 0.3s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--accent-purple-bg)';
              e.currentTarget.style.borderColor = 'var(--accent-purple)';
              e.currentTarget.style.color = 'var(--accent-purple-text)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'var(--card-bg)';
              e.currentTarget.style.borderColor = 'var(--border-medium)';
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
          >
            <span style={{ fontSize: '22px' }}>＋</span>
            Add another Section
          </button>

          {/* Save Button */}
          <div style={{ display: 'flex', gap: '16px', maxWidth: '860px' }}>
            <button
              onClick={() => navigate('/dashboard', { state: { user } })}
              style={{
                flex: 1,
                padding: '16px',
                background: 'var(--card-bg)',
                border: '1px solid var(--border-medium)',
                borderRadius: '16px',
                color: 'var(--text-muted)',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-color)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--card-bg)'; }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || saved}
              className="login-btn"
              style={{
                flex: 2,
                padding: '16px',
                fontSize: '17px',
                borderRadius: '16px',
                boxShadow: 'var(--cta-shadow)',
                opacity: saving || saved ? 0.8 : 1,
                cursor: saving || saved ? 'default' : 'pointer'
              }}
            >
              {saved ? '✅ Saved! Redirecting...' : saving ? 'Saving...' : 'Save Itinerary'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuildItinerary;
