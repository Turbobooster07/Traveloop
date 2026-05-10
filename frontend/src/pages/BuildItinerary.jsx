import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const STOP_TYPES = ['attraction', 'restaurant', 'hotel', 'activity', 'other'];

const createStop = () => ({
  id: Date.now() + Math.random(),
  stop_name: '',
  stop_type: 'attraction',
  description: '',
  timing: '',
  budget: ''
});

const createCity = () => ({
  id: Date.now() + Math.random(),
  city_name: '',
  stops: []
});

const createSection = (num) => ({
  id: Date.now() + Math.random(),
  title: `Section ${num}`,
  description: '',
  from_date: '',
  to_date: '',
  budget: '',
  cities: []
});

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
  const [loading, setLoading] = useState(false);
  const [citySearch, setCitySearch] = useState({});
  const debounceRef = useRef({});

  useEffect(() => {
    if (trip?.id) loadItinerary();
  }, []);

  const loadItinerary = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/itinerary/${trip.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) {
          const mapped = data.map(s => ({
            ...s,
            id: s.id,
            from_date: s.from_date ? s.from_date.slice(0, 10) : '',
            to_date: s.to_date ? s.to_date.slice(0, 10) : '',
            budget: s.budget ? String(s.budget) : '',
            cities: (s.cities || []).map(c => ({
              ...c,
              id: c.id,
              stops: (c.stops || []).map(st => ({
                ...st,
                id: st.id,
                budget: st.budget ? String(st.budget) : ''
              }))
            }))
          }));
          setSections(mapped);
        }
      }
    } catch (err) {
      console.error('Load itinerary error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCitySearch = (sectionId, cityId, value) => {
    updateCity(sectionId, cityId, 'city_name', value);

    if (debounceRef.current[cityId]) clearTimeout(debounceRef.current[cityId]);

    if (value.trim().length < 2) {
      setCitySearch(prev => ({ ...prev, [cityId]: { suggestions: [], show: false, isSearching: false } }));
      return;
    }

    debounceRef.current[cityId] = setTimeout(async () => {
      setCitySearch(prev => ({ ...prev, [cityId]: { ...prev[cityId], isSearching: true } }));
      try {
        const res = await fetch(`http://localhost:5000/api/places/search?q=${encodeURIComponent(value)}`);
        const data = await res.json();
        setCitySearch(prev => ({ ...prev, [cityId]: { suggestions: data, show: data.length > 0, isSearching: false } }));
      } catch {
        setCitySearch(prev => ({ ...prev, [cityId]: { suggestions: [], show: false, isSearching: false } }));
      }
    }, 400);
  };

  const selectCity = (sectionId, cityId, place) => {
    updateCity(sectionId, cityId, 'city_name', place.name);
    setCitySearch(prev => ({ ...prev, [cityId]: { ...prev[cityId], show: false } }));
  };

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
        <div className="dash-actions" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
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
          <button
            onClick={() => navigate('/community', { state: { user } })}
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
          <button onClick={handleLogout} className="dash-btn-chip" style={{ background: 'transparent', border: '1px solid var(--border-medium)' }}>
            Logout
          </button>
          <div className="dash-profile" onClick={() => navigate('/profile')} title="View Profile">
            {user.profile_pic ? (
              <img src={user.profile_pic} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              `${user.first_name?.charAt(0)}${user.last_name?.charAt(0)}`
            )}
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

              {/* Cities */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-main)', fontFamily: "'Outfit', sans-serif" }}>🏙️ Cities & Stops</span>
                  <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }} />
                </div>

                {section.cities.map((city, cityIdx) => {
                  const cs = citySearch[city.id] || {};
                  return (
                    <div key={city.id} style={cardInnerStyle}>
                      {/* City Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, position: 'relative' }}>
                          <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-muted)', marginTop: '12px' }}>#{cityIdx + 1}</span>
                          <div style={{ flex: 1, position: 'relative' }}>
                            <input value={city.city_name}
                              onChange={e => handleCitySearch(section.id, city.id, e.target.value)}
                              onFocus={() => { if (cs.suggestions?.length > 0) setCitySearch(prev => ({ ...prev, [city.id]: { ...prev[city.id], show: true } })); }}
                              onBlur={() => setTimeout(() => setCitySearch(prev => ({ ...prev, [city.id]: { ...prev[city.id], show: false } })), 200)}
                              placeholder="Search for a city"
                              style={{ ...inputStyle, padding: '10px 14px', fontSize: '15px', fontWeight: '600' }} />
                            {cs.isSearching && (
                              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--card-bg)', border: '1px solid var(--border-medium)', borderRadius: '12px', marginTop: '4px', padding: '12px 16px', zIndex: 10, color: 'var(--text-muted)', fontSize: '14px', backdropFilter: 'blur(20px)' }}>Searching...</div>
                            )}
                            {cs.show && cs.suggestions?.length > 0 && (
                              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--card-bg)', border: '1px solid var(--border-medium)', borderRadius: '16px', marginTop: '4px', maxHeight: '200px', overflowY: 'auto', zIndex: 10, boxShadow: 'var(--shadow-hover)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}>
                                {cs.suggestions.map((place, idx) => (
                                  <div key={idx} onClick={() => selectCity(section.id, city.id, place)}
                                    style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: idx !== cs.suggestions.length - 1 ? '1px solid var(--border-light)' : 'none' }}
                                    onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.4)'}
                                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                                    <div style={{ fontWeight: '500', color: 'var(--text-main)' }}>{place.name}</div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <button onClick={() => removeCity(section.id, city.id)}
                          style={{ ...removeBtnStyle, marginLeft: '10px' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 100, 100, 0.22)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 100, 100, 0.12)'}>
                          Remove
                        </button>
                      </div>

                      {/* Stops */}
                      {city.stops.map((stop, stopIdx) => (
                        <div key={stop.id} style={{
                          background: 'rgba(255,255,255,0.4)',
                          borderRadius: '14px',
                          padding: '16px',
                          marginBottom: '12px',
                          border: '1px solid rgba(255,255,255,0.6)'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-muted)' }}>
                              Stop #{stopIdx + 1}
                            </span>
                            <button onClick={() => removeStop(section.id, city.id, stop.id)}
                              style={{ ...removeBtnStyle, padding: '4px 10px', fontSize: '12px' }}
                              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 100, 100, 0.22)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 100, 100, 0.12)'}>
                              Remove
                            </button>
                          </div>

                          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
                            <div style={{ flex: '2 1 200px' }}>
                              <label style={smallLabelStyle}>Name</label>
                              <input value={stop.stop_name}
                                onChange={e => updateStop(section.id, city.id, stop.id, 'stop_name', e.target.value)}
                                placeholder="e.g. Gateway of India"
                                style={{ ...inputStyle, padding: '10px 14px' }} />
                            </div>
                            <div style={{ flex: '1 1 140px' }}>
                              <label style={smallLabelStyle}>Type</label>
                              <select value={stop.stop_type}
                                onChange={e => updateStop(section.id, city.id, stop.id, 'stop_type', e.target.value)}
                                style={{ ...inputStyle, padding: '10px 14px', cursor: 'pointer' }}>
                                {STOP_TYPES.map(t => (
                                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div style={{ marginBottom: '12px' }}>
                            <label style={smallLabelStyle}>Description</label>
                            <input value={stop.description}
                              onChange={e => updateStop(section.id, city.id, stop.id, 'description', e.target.value)}
                              placeholder="Brief description of this stop"
                              style={{ ...inputStyle, padding: '10px 14px' }} />
                          </div>

                          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            <div style={{ flex: '1 1 160px' }}>
                              <label style={smallLabelStyle}>Timing</label>
                              <input value={stop.timing}
                                onChange={e => updateStop(section.id, city.id, stop.id, 'timing', e.target.value)}
                                placeholder="e.g. 10 AM - 6 PM"
                                style={{ ...inputStyle, padding: '10px 14px' }} />
                            </div>
                            <div style={{ flex: '1 1 140px' }}>
                              <label style={smallLabelStyle}>Budget (₹)</label>
                              <input type="number" value={stop.budget}
                                onChange={e => updateStop(section.id, city.id, stop.id, 'budget', e.target.value)}
                                placeholder="e.g. 500"
                                style={{ ...inputStyle, padding: '10px 14px' }} />
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Add Stop */}
                      <button onClick={() => addStop(section.id, city.id)}
                        style={addSubtleBtnStyle}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(162, 210, 255, 0.15)'; e.currentTarget.style.color = 'var(--text-main)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
                        <span style={{ fontSize: '18px' }}>＋</span>
                        Add Stop
                      </button>
                    </div>
                  );
                })}

                {/* Add City */}
                <button onClick={() => addCity(section.id)}
                  style={addSubtleBtnStyle}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255, 175, 204, 0.12)'; e.currentTarget.style.borderColor = 'var(--baby-pink, #ffafcc)'; e.currentTarget.style.color = 'var(--text-main)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
                  <span style={{ fontSize: '18px' }}>＋</span>
                  Add City
                </button>
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
