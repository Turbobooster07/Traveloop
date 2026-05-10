import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const statusOrder = ['Ongoing', 'Upcoming', 'Completed'];

const statusColors = {
  Ongoing:   { bg: 'var(--icy-blue, #bde0fe)',   text: '#1a5fa8' },
  Upcoming:  { bg: 'var(--pastel-petal, #ffc8dd)', text: '#96426b' },
  Completed: { bg: 'var(--tea-green, #ccd5ae, #b5c99a)', text: '#3d5a27' },
};

const TripListing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.user;

  const [trips, setTrips] = useState([]);
  const [search, setSearch] = useState('');
  const [groupBy, setGroupBy] = useState('status'); // 'status' | 'month' | 'destination'
  const [sortBy, setSortBy] = useState('date');     // 'date' | 'destination' | 'budget'
  const [filterStatus, setFilterStatus] = useState('All');
  const [showGroupMenu, setShowGroupMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  useEffect(() => {
    if (user) fetchTrips();
  }, [user]);

  const fetchTrips = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/trips/${user.id}`);
      if (res.ok) setTrips(await res.json());
    } catch (err) {
      console.error('Failed to fetch trips', err);
    }
  };

  if (!user) {
    return (
      <div className="login-container">
        <div className="login-card" style={{ textAlign: 'center' }}>
          <h2>Unauthorized</h2>
          <p className="subtitle" style={{ marginTop: '12px' }}>Please log in.</p>
          <button onClick={() => navigate('/')} className="login-btn" style={{ marginTop: '24px' }}>Go to Login</button>
        </div>
      </div>
    );
  }

  // Derive status dynamically from dates
  const enrichedTrips = trips.map(trip => {
    const now = new Date();
    const start = new Date(trip.start_date);
    const end = new Date(trip.end_date);
    let dynamicStatus = trip.status || 'Upcoming';
    if (now >= start && now <= end) dynamicStatus = 'Ongoing';
    else if (now > end) dynamicStatus = 'Completed';
    else dynamicStatus = 'Upcoming';
    return { ...trip, dynamicStatus };
  });

  // Filter
  const filtered = enrichedTrips.filter(trip => {
    const matchesSearch =
      trip.destination.toLowerCase().includes(search.toLowerCase()) ||
      (trip.description || '').toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterStatus === 'All' || trip.dynamicStatus === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'date') return new Date(a.start_date) - new Date(b.start_date);
    if (sortBy === 'destination') return a.destination.localeCompare(b.destination);
    return 0;
  });

  // Group
  const grouped = {};
  if (groupBy === 'status') {
    statusOrder.forEach(s => { grouped[s] = []; });
    sorted.forEach(t => {
      if (!grouped[t.dynamicStatus]) grouped[t.dynamicStatus] = [];
      grouped[t.dynamicStatus].push(t);
    });
  } else if (groupBy === 'month') {
    sorted.forEach(t => {
      const label = new Date(t.start_date).toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!grouped[label]) grouped[label] = [];
      grouped[label].push(t);
    });
  } else {
    sorted.forEach(t => {
      const label = t.destination.split(',')[0].trim();
      if (!grouped[label]) grouped[label] = [];
      grouped[label].push(t);
    });
  }

  const dropdownStyle = {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    left: 0,
    background: 'rgba(255,255,255,0.85)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid var(--border-medium)',
    borderRadius: '16px',
    boxShadow: 'var(--shadow-hover)',
    padding: '8px',
    zIndex: 100,
    minWidth: '160px'
  };

  const dropdownItemStyle = (active) => ({
    padding: '10px 16px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: active ? '700' : '500',
    color: active ? 'var(--text-main)' : 'var(--text-muted)',
    background: active ? 'rgba(162, 210, 255, 0.25)' : 'transparent',
    transition: 'background 0.15s',
    whiteSpace: 'nowrap'
  });

  const chipBtnStyle = (active) => ({
    padding: '10px 18px',
    background: active ? 'var(--cta-gradient)' : 'var(--card-bg)',
    border: active ? 'none' : '1px solid var(--border-medium)',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
    color: active ? '#fff' : 'var(--text-muted)',
    cursor: 'pointer',
    backdropFilter: 'blur(16px)',
    transition: 'all 0.2s',
    boxShadow: active ? 'var(--cta-shadow)' : 'none',
    fontFamily: 'inherit',
    position: 'relative'
  });

  return (
    <div className="dash-wrapper" onClick={() => { setShowGroupMenu(false); setShowSortMenu(false); setShowFilterMenu(false); }}>

      {/* Navbar */}
      <nav className="dash-nav">
        <div className="dash-logo" onClick={() => navigate('/dashboard', { state: { user } })} style={{ cursor: 'pointer' }}>
          <h1>Traveloop</h1>
        </div>

        {/* Search Bar */}
        <div style={{ flex: 1, maxWidth: '420px', margin: '0 32px', position: 'relative' }}>
          <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', color: 'var(--text-muted)' }}>🔍</span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search trips..."
            style={{
              width: '100%',
              padding: '12px 16px 12px 44px',
              background: 'var(--input-bg)',
              border: '1px solid var(--input-border)',
              borderRadius: '14px',
              fontSize: '15px',
              color: 'var(--text-main)',
              outline: 'none',
              fontFamily: 'inherit',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Group By */}
          <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => { setShowGroupMenu(v => !v); setShowSortMenu(false); setShowFilterMenu(false); }} style={chipBtnStyle(false)}>
              Group by
            </button>
            {showGroupMenu && (
              <div style={dropdownStyle}>
                {[['status','By Status'], ['month','By Month'], ['destination','By Destination']].map(([val, label]) => (
                  <div key={val} style={dropdownItemStyle(groupBy === val)} onClick={() => { setGroupBy(val); setShowGroupMenu(false); }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(162,210,255,0.15)'}
                    onMouseLeave={e => e.currentTarget.style.background = groupBy === val ? 'rgba(162,210,255,0.25)' : 'transparent'}>
                    {label}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Filter */}
          <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => { setShowFilterMenu(v => !v); setShowGroupMenu(false); setShowSortMenu(false); }} style={chipBtnStyle(filterStatus !== 'All')}>
              Filter {filterStatus !== 'All' ? `· ${filterStatus}` : ''}
            </button>
            {showFilterMenu && (
              <div style={dropdownStyle}>
                {['All', 'Ongoing', 'Upcoming', 'Completed'].map(val => (
                  <div key={val} style={dropdownItemStyle(filterStatus === val)} onClick={() => { setFilterStatus(val); setShowFilterMenu(false); }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(162,210,255,0.15)'}
                    onMouseLeave={e => e.currentTarget.style.background = filterStatus === val ? 'rgba(162,210,255,0.25)' : 'transparent'}>
                    {val}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sort By */}
          <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => { setShowSortMenu(v => !v); setShowGroupMenu(false); setShowFilterMenu(false); }} style={chipBtnStyle(false)}>
              Sort by
            </button>
            {showSortMenu && (
              <div style={{ ...dropdownStyle, right: 0, left: 'auto' }}>
                {[['date','Date'], ['destination','Destination (A-Z)']].map(([val, label]) => (
                  <div key={val} style={dropdownItemStyle(sortBy === val)} onClick={() => { setSortBy(val); setShowSortMenu(false); }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(162,210,255,0.15)'}
                    onMouseLeave={e => e.currentTarget.style.background = sortBy === val ? 'rgba(162,210,255,0.25)' : 'transparent'}>
                    {label}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="dash-profile" style={{ marginLeft: '8px' }}>
            {user.first_name.charAt(0)}{user.last_name.charAt(0)}
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <div className="dash-container">
        <header style={{ padding: '0 8px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: '800', fontFamily: "'Outfit', sans-serif", color: 'var(--text-main)', letterSpacing: '-1px', margin: '0 0 8px 0' }}>
            My Trips
          </h1>
          <p style={{ fontSize: '16px', margin: 0, color: 'var(--text-muted)' }}>
            {filtered.length} trip{filtered.length !== 1 ? 's' : ''} found
          </p>
        </header>

        {/* Grouped Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          {Object.entries(grouped).map(([group, groupTrips]) => {
            if (groupTrips.length === 0 && filterStatus === 'All') return null;
            return (
              <section key={group}>
                {/* Section Label */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  <h2 style={{ fontSize: '22px', fontWeight: '800', fontFamily: "'Outfit', sans-serif", color: 'var(--text-main)', margin: 0 }}>
                    {group}
                  </h2>
                  <span style={{
                    fontSize: '13px', fontWeight: '700',
                    background: groupBy === 'status' && statusColors[group] ? statusColors[group].bg : 'var(--card-bg)',
                    color: groupBy === 'status' && statusColors[group] ? statusColors[group].text : 'var(--text-muted)',
                    padding: '4px 12px', borderRadius: '100px',
                    border: '1px solid rgba(0,0,0,0.06)'
                  }}>
                    {groupTrips.length}
                  </span>
                  <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }} />
                </div>

                {/* Trip Cards */}
                {groupTrips.length === 0 ? (
                  <div style={{
                    background: 'var(--card-bg)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '2px dashed var(--border-medium)',
                    borderRadius: '24px',
                    padding: '40px',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontSize: '15px'
                  }}>
                    No {group.toLowerCase()} trips yet.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {groupTrips.map(trip => {
                      const sc = statusColors[trip.dynamicStatus] || statusColors['Upcoming'];
                      const startDate = new Date(trip.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
                      const endDate = new Date(trip.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
                      const totalDays = Math.ceil((new Date(trip.end_date) - new Date(trip.start_date)) / (1000 * 60 * 60 * 24));

                      return (
                        <div
                          key={trip.id}
                          style={{
                            background: 'var(--card-bg)',
                            backdropFilter: 'blur(24px) saturate(150%)',
                            WebkitBackdropFilter: 'blur(24px) saturate(150%)',
                            border: '1px solid var(--border-medium)',
                            borderRadius: '24px',
                            padding: '28px 32px',
                            boxShadow: 'var(--shadow-soft)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '24px',
                            transition: 'transform 0.25s, box-shadow 0.25s',
                            cursor: 'pointer',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-hover)'; }}
                          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-soft)'; }}
                        >
                          {/* Status Bar */}
                          <div style={{ width: '6px', minHeight: '80px', borderRadius: '999px', background: sc.bg, flexShrink: 0 }} />

                          {/* Trip Info */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                              <div>
                                <h3 style={{ margin: '0 0 6px 0', fontSize: '20px', fontWeight: '800', fontFamily: "'Outfit', sans-serif", color: 'var(--text-main)' }}>
                                  ✈️ {trip.destination}
                                </h3>
                                <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: 'var(--text-muted)' }}>
                                  {startDate} → {endDate} · {totalDays} day{totalDays !== 1 ? 's' : ''}
                                </p>
                                {trip.description && (
                                  <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6', maxWidth: '600px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {trip.description}
                                  </p>
                                )}
                              </div>
                              <span style={{ fontSize: '13px', fontWeight: '700', background: sc.bg, color: sc.text, padding: '6px 14px', borderRadius: '100px', flexShrink: 0, border: '1px solid rgba(0,0,0,0.06)' }}>
                                {trip.dynamicStatus}
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flexShrink: 0 }}>
                            <button
                              onClick={e => { e.stopPropagation(); navigate('/build-itinerary', { state: { user, trip } }); }}
                              style={{ padding: '8px 18px', background: 'var(--cta-gradient)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', boxShadow: 'var(--cta-shadow)', whiteSpace: 'nowrap' }}>
                              📋 Itinerary
                            </button>
                            <button
                              onClick={e => { e.stopPropagation(); navigate('/day-itinerary', { state: { user, trip } }); }}
                              style={{ padding: '8px 18px', background: 'var(--accent-purple-bg)', color: 'var(--accent-purple-text)', border: 'none', borderRadius: '12px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                              📅 Day Plan
                            </button>
                            <button
                              onClick={e => { e.stopPropagation(); navigate('/plan-trip', { state: { user } }); }}
                              style={{ padding: '8px 18px', background: 'var(--card-bg)', color: 'var(--text-muted)', border: '1px solid var(--border-medium)', borderRadius: '12px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                              ✏️ Edit
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}

          {filtered.length === 0 && (
            <div style={{
              background: 'var(--card-bg)',
              backdropFilter: 'blur(20px)',
              border: '2px dashed var(--border-medium)',
              borderRadius: '28px',
              padding: '80px 40px',
              textAlign: 'center'
            }}>
              <p style={{ fontSize: '48px', margin: '0 0 16px 0' }}>🌍</p>
              <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-main)', fontFamily: "'Outfit', sans-serif", fontSize: '22px' }}>
                {search ? 'No trips match your search' : 'No trips yet'}
              </h3>
              <p style={{ margin: '0 0 24px 0', color: 'var(--text-muted)' }}>
                {search ? 'Try a different search term.' : 'Start planning your first adventure!'}
              </p>
              <button className="login-btn" onClick={() => navigate('/plan-trip', { state: { user } })} style={{ padding: '14px 32px', fontSize: '15px', borderRadius: '14px' }}>
                Plan a Trip
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripListing;
