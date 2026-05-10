import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const SearchActivities = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.user;

  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const [groupBy, setGroupBy] = useState('none');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortBy, setSortBy] = useState('relevance');
  
  const [showGroupMenu, setShowGroupMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  
  const debounceTimer = useRef(null);

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

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (value.trim().length < 2) {
      setResults([]);
      return;
    }

    debounceTimer.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(`http://localhost:5000/api/places/search?q=${encodeURIComponent(value)}`);
        if (response.ok) {
          const data = await response.json();
          // Generate some mock activity details for the places to fit the "Option and its details" layout
          const enrichedData = data.map((item, index) => {
            const types = ['Sightseeing', 'Adventure', 'Relaxation', 'Cultural', 'Gastronomy'];
            const type = types[index % types.length];
            const price = Math.floor(Math.random() * 5000) + 1000;
            const rating = (Math.random() * 1.5 + 3.5).toFixed(1);
            return { ...item, type, price, rating, id: index };
          });
          setResults(enrichedData);
        }
      } catch (err) {
        console.error('Place search error', err);
      } finally {
        setIsSearching(false);
      }
    }, 400);
  };

  // Grouping logic (mock)
  const grouped = {};
  if (groupBy === 'type') {
    results.forEach(r => {
      if (!grouped[r.type]) grouped[r.type] = [];
      grouped[r.type].push(r);
    });
  } else {
    grouped['All Results'] = results;
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
      {/* Navbar exactly like the reference UI */}
      <nav className="dash-nav">
        <div className="dash-logo" onClick={() => navigate('/dashboard', { state: { user } })} style={{ cursor: 'pointer' }}>
          <h1>Traveloop</h1>
        </div>
        
        {/* Main Search Bar in Navbar */}
        <div style={{ flex: 1, maxWidth: '500px', margin: '0 32px', position: 'relative' }}>
          <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', color: 'var(--text-muted)' }}>🔍</span>
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search activities or cities... (e.g. Paragliding)"
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
          {isSearching && (
            <span style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '13px', color: 'var(--text-muted)' }}>
              Loading...
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Group By */}
          <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => { setShowGroupMenu(v => !v); setShowSortMenu(false); setShowFilterMenu(false); }} style={chipBtnStyle(groupBy !== 'none')}>
              Group by
            </button>
            {showGroupMenu && (
              <div style={dropdownStyle}>
                {[['none','None'], ['type','By Activity Type']].map(([val, label]) => (
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
                {['All', 'Under ₹2000', 'Highly Rated'].map(val => (
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
            <button onClick={() => { setShowSortMenu(v => !v); setShowGroupMenu(false); setShowFilterMenu(false); }} style={chipBtnStyle(sortBy !== 'relevance')}>
              Sort by
            </button>
            {showSortMenu && (
              <div style={{ ...dropdownStyle, right: 0, left: 'auto' }}>
                {[['relevance','Relevance'], ['price_low','Price: Low to High'], ['rating','Highest Rated']].map(([val, label]) => (
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

      {/* Main Container */}
      <div className="dash-container" style={{ maxWidth: '1000px', padding: '40px 5%' }}>
        <header style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '800', fontFamily: "'Outfit', sans-serif", color: 'var(--text-main)', margin: '0 0 8px 0' }}>
            Search Results
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--text-muted)', margin: 0 }}>
            {search.length < 2 ? "Start typing to search for cities or activities." : `${results.length} option(s) found for "${search}"`}
          </p>
        </header>

        {results.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {Object.entries(grouped).map(([groupTitle, items]) => (
              <div key={groupTitle}>
                {groupBy !== 'none' && (
                  <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '16px', fontFamily: "'Outfit', sans-serif", borderBottom: '1px solid var(--border-medium)', paddingBottom: '8px' }}>
                    {groupTitle}
                  </h3>
                )}
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {items.map(item => (
                    <div key={item.id} style={{
                      background: '#ffffff',
                      border: '1px solid var(--border-card)',
                      borderRadius: '20px',
                      padding: '24px',
                      boxShadow: 'var(--shadow-card)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '24px',
                      transition: 'transform 0.25s, box-shadow 0.25s',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-hover)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-card)'; }}
                    >
                      <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flex: 1 }}>
                        <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'var(--card-bg-lavender)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                          {item.type === 'Sightseeing' ? '🏛️' : item.type === 'Adventure' ? '🪂' : item.type === 'Relaxation' ? '🏖️' : item.type === 'Gastronomy' ? '🍽️' : '🗺️'}
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '700', color: 'var(--text-main)' }}>{item.name}</h4>
                          <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.4' }}>{item.full}</p>
                          <div style={{ display: 'flex', gap: '12px' }}>
                            <span style={{ fontSize: '12px', fontWeight: '600', padding: '4px 10px', borderRadius: '8px', background: 'var(--card-bg-blue)', color: 'var(--accent-blue-text)' }}>
                              ⭐ {item.rating} / 5.0
                            </span>
                            <span style={{ fontSize: '12px', fontWeight: '600', padding: '4px 10px', borderRadius: '8px', background: 'var(--card-bg-pink)', color: 'var(--accent-pink-text)' }}>
                              ₹{item.price} estimated
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <button style={{
                        padding: '10px 20px',
                        background: 'var(--cta-gradient)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        boxShadow: 'var(--cta-shadow)',
                        whiteSpace: 'nowrap'
                      }}
                      onClick={(e) => { e.stopPropagation(); navigate('/plan-trip', { state: { user } }); }}
                      >
                        Plan Activity
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          search.length >= 2 && !isSearching && (
            <div style={{
              background: '#ffffff',
              border: '2px dashed var(--border-medium)',
              borderRadius: '24px',
              padding: '60px 40px',
              textAlign: 'center'
            }}>
              <p style={{ fontSize: '40px', margin: '0 0 16px 0' }}>🔍</p>
              <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-main)', fontFamily: "'Outfit', sans-serif", fontSize: '20px' }}>
                No results found
              </h3>
              <p style={{ margin: 0, color: 'var(--text-muted)' }}>
                Try adjusting your search terms or filters.
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default SearchActivities;
