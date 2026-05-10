import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Filter, ArrowDownUp, Layers, User, Loader2, AlertCircle, RefreshCw, ChevronUp, ChevronDown } from 'lucide-react';
import { PieChart, Pie, Cell, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import './admin.css';

const API_BASE = 'http://localhost:5000/api/admin';

const COLORS = ['#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#ef4444'];

const AdminPanel = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('trends');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Data states
  const [users, setUsers] = useState([]);
  const [cities, setCities] = useState([]);
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState(null);

  // Loading / Error
  const [loading, setLoading] = useState({});
  const [errors, setErrors] = useState({});

  // Fetch helpers
  const fetchData = useCallback(async (key, url, setter) => {
    setLoading(prev => ({ ...prev, [key]: true }));
    setErrors(prev => ({ ...prev, [key]: null }));
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setter(data);
    } catch (err) {
      setErrors(prev => ({ ...prev, [key]: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  }, []);

  // Auth Check
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) {
      navigate('/admin-login');
      return;
    }
    const user = JSON.parse(savedUser);
    if (user.role !== 'admin') {
      navigate('/admin-login');
    }
  }, [navigate]);

  // Fetch all data on mount
  useEffect(() => {
    fetchData('users', `${API_BASE}/users`, setUsers);
    fetchData('cities', `${API_BASE}/cities`, setCities);
    fetchData('activities', `${API_BASE}/activities`, setActivities);
    fetchData('stats', `${API_BASE}/stats`, setStats);
  }, [fetchData]);

  // Reset sort and filter when switching tabs
  useEffect(() => {
    setSortBy('default');
    setStatusFilter('all');
    setSearchTerm('');
    setShowFilterDropdown(false);
  }, [activeTab]);

  // ─── Processed (filtered + sorted) data ────────────────────

  const processedUsers = useMemo(() => {
    let result = [...users];

    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(u =>
        (u.first_name + ' ' + u.last_name).toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term) ||
        u.username?.toLowerCase().includes(term) ||
        u.city?.toLowerCase().includes(term) ||
        u.country?.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (statusFilter === 'has-trips') {
      result = result.filter(u => u.trip_count > 0);
    } else if (statusFilter === 'no-trips') {
      result = result.filter(u => u.trip_count === 0);
    }

    // Sort
    switch (sortBy) {
      case 'name-asc':
        result.sort((a, b) => (a.first_name + a.last_name).localeCompare(b.first_name + b.last_name));
        break;
      case 'name-desc':
        result.sort((a, b) => (b.first_name + b.last_name).localeCompare(a.first_name + a.last_name));
        break;
      case 'trips-desc':
        result.sort((a, b) => b.trip_count - a.trip_count);
        break;
      case 'trips-asc':
        result.sort((a, b) => a.trip_count - b.trip_count);
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      default:
        break;
    }

    return result;
  }, [users, searchTerm, sortBy, statusFilter]);

  const processedCities = useMemo(() => {
    let result = [...cities];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(c => c.name?.toLowerCase().includes(term));
    }

    switch (sortBy) {
      case 'visits-desc':
        result.sort((a, b) => b.visit_count - a.visit_count);
        break;
      case 'visits-asc':
        result.sort((a, b) => a.visit_count - b.visit_count);
        break;
      case 'users-desc':
        result.sort((a, b) => b.unique_users - a.unique_users);
        break;
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    return result;
  }, [cities, searchTerm, sortBy]);

  const processedActivities = useMemo(() => {
    let result = [...activities];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(a => a.name?.toLowerCase().includes(term));
    }

    switch (sortBy) {
      case 'count-desc':
        result.sort((a, b) => b.count - a.count);
        break;
      case 'count-asc':
        result.sort((a, b) => a.count - b.count);
        break;
      case 'expense-desc':
        result.sort((a, b) => Number(b.total_expense) - Number(a.total_expense));
        break;
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    return result;
  }, [activities, searchTerm, sortBy]);

  // ─── Clickable column header sort ──────────────────────────

  const SortableHeader = ({ label, ascKey, descKey, currentSort, onSort }) => {
    const isAsc = currentSort === ascKey;
    const isDesc = currentSort === descKey;
    return (
      <th
        className="sortable-th"
        onClick={() => onSort(isAsc ? descKey : ascKey)}
        title="Click to sort"
      >
        <span className="th-content">
          {label}
          <span className="sort-arrows">
            <ChevronUp size={12} className={isAsc ? 'sort-active' : 'sort-dim'} />
            <ChevronDown size={12} className={isDesc ? 'sort-active' : 'sort-dim'} />
          </span>
        </span>
      </th>
    );
  };

  // ─── Loading / Error / Empty state components ──────────────

  const LoadingState = () => (
    <div className="admin-state-box">
      <Loader2 className="spin" size={32} />
      <p>Loading data...</p>
    </div>
  );

  const ErrorState = ({ message, onRetry }) => (
    <div className="admin-state-box error">
      <AlertCircle size={32} />
      <p>Failed to load: {message}</p>
      <button className="admin-btn retry-btn" onClick={onRetry}>
        <RefreshCw size={14} /> Retry
      </button>
    </div>
  );

  const EmptyState = ({ message }) => (
    <div className="admin-state-box">
      <p style={{ color: 'var(--text-muted)' }}>{message || 'No data available yet.'}</p>
    </div>
  );

  // ─── Tab content renderers ────────────────────────────────

  const renderUsers = () => {
    if (loading.users) return <LoadingState />;
    if (errors.users) return <ErrorState message={errors.users} onRetry={() => fetchData('users', `${API_BASE}/users`, setUsers)} />;
    if (processedUsers.length === 0) return <EmptyState message={searchTerm ? 'No users match your search.' : 'No users registered yet.'} />;

    return (
      <div className="admin-list-container">
        <div className="table-meta">
          <span className="result-count">{processedUsers.length} user{processedUsers.length !== 1 ? 's' : ''}</span>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <SortableHeader label="Name" ascKey="name-asc" descKey="name-desc" currentSort={sortBy} onSort={setSortBy} />
              <th>Username</th>
              <th>Email</th>
              <th>Location</th>
              <SortableHeader label="Trips" ascKey="trips-asc" descKey="trips-desc" currentSort={sortBy} onSort={setSortBy} />
              <SortableHeader label="Joined" ascKey="oldest" descKey="newest" currentSort={sortBy} onSort={setSortBy} />
            </tr>
          </thead>
          <tbody>
            {processedUsers.map(u => (
              <tr key={u.id}>
                <td className="user-name-cell">
                  <div className="user-avatar-small">{(u.first_name?.[0] || '').toUpperCase()}</div>
                  {u.first_name} {u.last_name}
                </td>
                <td><span className="mono-text">@{u.username}</span></td>
                <td>{u.email}</td>
                <td>{[u.city, u.country].filter(Boolean).join(', ') || '—'}</td>
                <td>
                  <span className={`badge ${u.trip_count > 0 ? 'badge-active' : 'badge-inactive'}`}>
                    {u.trip_count}
                  </span>
                </td>
                <td>{new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderCities = () => {
    if (loading.cities) return <LoadingState />;
    if (errors.cities) return <ErrorState message={errors.cities} onRetry={() => fetchData('cities', `${API_BASE}/cities`, setCities)} />;
    if (processedCities.length === 0) return <EmptyState message={searchTerm ? 'No destinations match your search.' : 'No trip destinations recorded yet.'} />;

    return (
      <div className="admin-list-container">
        <div className="chart-wrapper" style={{ height: '300px', marginBottom: '20px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={processedCities.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-20} textAnchor="end" height={60} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="visit_count" name="Trips" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="table-meta">
          <span className="result-count">{processedCities.length} destination{processedCities.length !== 1 ? 's' : ''}</span>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <SortableHeader label="Destination" ascKey="name-asc" descKey="name-asc" currentSort={sortBy} onSort={setSortBy} />
              <SortableHeader label="Total Trips" ascKey="visits-asc" descKey="visits-desc" currentSort={sortBy} onSort={setSortBy} />
              <SortableHeader label="Unique Users" ascKey="users-desc" descKey="users-desc" currentSort={sortBy} onSort={setSortBy} />
              <th>First Visit</th>
              <th>Last Visit</th>
            </tr>
          </thead>
          <tbody>
            {processedCities.map((c, idx) => (
              <tr key={c.name}>
                <td className="rank-cell">{idx + 1}</td>
                <td><strong>{c.name}</strong></td>
                <td>{c.visit_count}</td>
                <td>{c.unique_users}</td>
                <td>{c.first_visit ? new Date(c.first_visit).toLocaleDateString() : '—'}</td>
                <td>{c.last_visit ? new Date(c.last_visit).toLocaleDateString() : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderActivities = () => {
    if (loading.activities) return <LoadingState />;
    if (errors.activities) return <ErrorState message={errors.activities} onRetry={() => fetchData('activities', `${API_BASE}/activities`, setActivities)} />;
    if (processedActivities.length === 0) return <EmptyState message={searchTerm ? 'No activities match your search.' : 'No day-plan activities recorded yet.'} />;

    return (
      <div className="admin-list-container">
        <div className="table-meta">
          <span className="result-count">{processedActivities.length} activit{processedActivities.length !== 1 ? 'ies' : 'y'}</span>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <SortableHeader label="Activity" ascKey="name-asc" descKey="name-asc" currentSort={sortBy} onSort={setSortBy} />
              <SortableHeader label="Times Used" ascKey="count-asc" descKey="count-desc" currentSort={sortBy} onSort={setSortBy} />
              <SortableHeader label="Total Expense" ascKey="expense-desc" descKey="expense-desc" currentSort={sortBy} onSort={setSortBy} />
            </tr>
          </thead>
          <tbody>
            {processedActivities.map((a, idx) => (
              <tr key={a.name}>
                <td className="rank-cell">{idx + 1}</td>
                <td>{a.name}</td>
                <td>{a.count} times</td>
                <td>₹{Number(a.total_expense).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderTrends = () => {
    if (loading.stats) return <LoadingState />;
    if (errors.stats) return <ErrorState message={errors.stats} onRetry={() => fetchData('stats', `${API_BASE}/stats`, setStats)} />;
    if (!stats) return <EmptyState message="No analytics data available." />;

    const hasStatusData = stats.statusBreakdown && stats.statusBreakdown.length > 0;
    const hasUserTrend = stats.userTrend && stats.userTrend.length > 0;
    const hasTripTrend = stats.tripTrend && stats.tripTrend.length > 0;
    const hasTopDest = stats.topDestinations && stats.topDestinations.length > 0;
    const hasActiveUsers = stats.activeUsers && stats.activeUsers.length > 0;

    return (
      <div className="admin-trends-grid">
        {/* Summary Cards */}
        <div className="trends-section">
          <h3>Key Metrics</h3>
          <ul className="trends-list">
            <li><span className="dot" style={{ background: '#8b5cf6' }}></span> Total Registered Users: <strong>{stats.totalUsers}</strong></li>
            <li><span className="dot" style={{ background: '#ec4899' }}></span> Total Trips Created: <strong>{stats.totalTrips}</strong></li>
            <li><span className="dot" style={{ background: '#10b981' }}></span> Popular Destinations: <strong>{cities.length}</strong></li>
            <li><span className="dot" style={{ background: '#f59e0b' }}></span> Activities Logged: <strong>{activities.length}</strong></li>
          </ul>
        </div>

        {/* Trip Status Pie Chart */}
        {hasStatusData && (
          <div className="trends-section chart-box">
            <h3>Trip Status Breakdown</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={stats.statusBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name} (${value})`}
                >
                  {stats.statusBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* User Registration Trend */}
        {hasUserTrend && (
          <div className="trends-section chart-box" style={{ gridColumn: '1 / -1' }}>
            <h3>User Registrations (Last 6 Months)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={stats.userTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="#ec4899" strokeWidth={3} dot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Trip Creation Trend */}
        {hasTripTrend && (
          <div className="trends-section chart-box" style={{ gridColumn: '1 / -1' }}>
            <h3>Trips Created (Last 6 Months)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.tripTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="trips" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top Destinations Bar */}
        {hasTopDest && (
          <div className="trends-section chart-box" style={{ gridColumn: '1 / -1' }}>
            <h3>Top Destinations</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.topDestinations} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} />
                <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="visits" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Most Active Users */}
        {hasActiveUsers && (
          <div className="trends-section" style={{ gridColumn: '1 / -1' }}>
            <h3>Most Active Users</h3>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>User</th>
                  <th>Trips</th>
                </tr>
              </thead>
              <tbody>
                {stats.activeUsers.map((u, i) => (
                  <tr key={i}>
                    <td className="rank-cell">{i + 1}</td>
                    <td>{u.name}</td>
                    <td><span className="badge badge-active">{u.trips}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty state for trends */}
        {!hasStatusData && !hasUserTrend && !hasTripTrend && !hasTopDest && (
          <div className="trends-section" style={{ gridColumn: '1 / -1' }}>
            <EmptyState message="Start creating trips and activities to see analytics here." />
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'users': return renderUsers();
      case 'cities': return renderCities();
      case 'activities': return renderActivities();
      case 'trends':
      default: return renderTrends();
    }
  };

  // ─── Refresh handler ──────────────────────────────────────

  const handleRefresh = () => {
    fetchData('users', `${API_BASE}/users`, setUsers);
    fetchData('cities', `${API_BASE}/cities`, setCities);
    fetchData('activities', `${API_BASE}/activities`, setActivities);
    fetchData('stats', `${API_BASE}/stats`, setStats);
  };

  return (
    <div className="admin-wrapper">
      {/* Dynamic Backgrounds from index.css */}
      <div className="bg-shape-yellow"></div>
      <div className="bg-shape-blue-square"></div>
      <div className="bg-shape-pink-blob"></div>

      {/* Header */}
      <header className="admin-header">
        <div className="admin-logo">Traveloop <span className="admin-badge">Admin</span></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="admin-btn" onClick={handleRefresh} title="Refresh all data">
            <RefreshCw size={16} className={Object.values(loading).some(Boolean) ? 'spin' : ''} /> Refresh
          </button>
          <div className="admin-avatar"><User size={20} /></div>
        </div>
      </header>

      <div className="admin-container">
        
        {/* Controls Toolbar */}
        <div className="admin-toolbar glass-panel">
          <div className="admin-search">
            <Search className="search-icon" size={18} />
            <input 
              type="text" 
              placeholder={
                activeTab === 'users' ? 'Search by name, email, username, city...' :
                activeTab === 'cities' ? 'Search destinations...' :
                activeTab === 'activities' ? 'Search activities...' :
                'Search...'
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="admin-filters">
            {/* Filter button (only for users tab) */}
            {activeTab === 'users' && (
              <div className="filter-dropdown-wrapper">
                <button 
                  className={`admin-btn ${statusFilter !== 'all' ? 'filter-active' : ''}`}
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                >
                  <Filter size={16} /> 
                  Filter
                  {statusFilter !== 'all' && <span className="filter-badge-dot" />}
                </button>
                {showFilterDropdown && (
                  <div className="filter-dropdown">
                    <button 
                      className={`filter-option ${statusFilter === 'all' ? 'active' : ''}`}
                      onClick={() => { setStatusFilter('all'); setShowFilterDropdown(false); }}
                    >
                      All Users
                    </button>
                    <button 
                      className={`filter-option ${statusFilter === 'has-trips' ? 'active' : ''}`}
                      onClick={() => { setStatusFilter('has-trips'); setShowFilterDropdown(false); }}
                    >
                      Has Trips
                    </button>
                    <button 
                      className={`filter-option ${statusFilter === 'no-trips' ? 'active' : ''}`}
                      onClick={() => { setStatusFilter('no-trips'); setShowFilterDropdown(false); }}
                    >
                      No Trips
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Sort dropdown */}
            <select className="admin-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="default">Sort by...</option>
              {activeTab === 'users' && (
                <>
                  <option value="name-asc">Name (A → Z)</option>
                  <option value="name-desc">Name (Z → A)</option>
                  <option value="trips-desc">Trips (High → Low)</option>
                  <option value="trips-asc">Trips (Low → High)</option>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </>
              )}
              {activeTab === 'cities' && (
                <>
                  <option value="visits-desc">Trips (High → Low)</option>
                  <option value="visits-asc">Trips (Low → High)</option>
                  <option value="users-desc">Users (Most)</option>
                  <option value="name-asc">Name (A → Z)</option>
                </>
              )}
              {activeTab === 'activities' && (
                <>
                  <option value="count-desc">Count (High → Low)</option>
                  <option value="count-asc">Count (Low → High)</option>
                  <option value="expense-desc">Expense (Highest)</option>
                  <option value="name-asc">Name (A → Z)</option>
                </>
              )}
            </select>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="admin-tabs">
          {[
            { id: 'trends', label: 'Analytics & Trends' },
            { id: 'users', label: 'Manage Users' },
            { id: 'cities', label: 'Popular Destinations' },
            { id: 'activities', label: 'Activities' },
          ].map(tab => (
            <button 
              key={tab.id} 
              className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main Content Layout */}
        <div className="admin-content-grid">
          
          {/* Left Column: Interactive Content */}
          <div className="admin-main-card glass-panel-white">
            {renderContent()}
          </div>

          {/* Right Column: Information Context */}
          <div className="admin-info-sidebar glass-panel-dark">
            <div className="info-block">
              <h4>Analytics & Trends</h4>
              <p>Real-time overview of your platform's growth — user registrations, trip creation trends, popular destinations, and activity analytics powered by live database data.</p>
            </div>
            
            <div className="info-block">
              <h4>Manage Users</h4>
              <p>View all registered users with their trip counts. Search, filter by activity status, and sort by name, trips, or join date.</p>
            </div>
            
            <div className="info-block">
              <h4>Popular Destinations</h4>
              <p>See which destinations your users are traveling to most, with trip counts and unique visitor metrics pulled from real trip data.</p>
            </div>
            
            <div className="info-block">
              <h4>Activities</h4>
              <p>Browse all day-plan activities logged by users, ranked by frequency and total expense across all trips.</p>
            </div>

            <div className="info-block sidebar-stat-block">
              <div className="sidebar-stat">
                <span className="sidebar-stat-num">{stats?.totalUsers ?? '—'}</span>
                <span className="sidebar-stat-label">Users</span>
              </div>
              <div className="sidebar-stat">
                <span className="sidebar-stat-num">{stats?.totalTrips ?? '—'}</span>
                <span className="sidebar-stat-label">Trips</span>
              </div>
              <div className="sidebar-stat">
                <span className="sidebar-stat-num">{cities.length}</span>
                <span className="sidebar-stat-label">Destinations</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
