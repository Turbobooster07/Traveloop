import React, { useState, useMemo } from 'react';
import { Search, Filter, ArrowDownUp, Layers, User } from 'lucide-react';
import { PieChart, Pie, Cell, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './admin.css';

// Mock Data
const usersData = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', trips: 12, role: 'User', status: 'Active' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', trips: 5, role: 'User', status: 'Active' },
  { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', trips: 8, role: 'User', status: 'Inactive' },
  { id: 4, name: 'Diana Prince', email: 'diana@example.com', trips: 24, role: 'Pro', status: 'Active' },
  { id: 5, name: 'Evan Wright', email: 'evan@example.com', trips: 2, role: 'User', status: 'Active' }
];

const citiesData = [
  { name: 'Paris', visits: 450, rating: 4.8 },
  { name: 'Tokyo', visits: 380, rating: 4.9 },
  { name: 'New York', visits: 310, rating: 4.5 },
  { name: 'London', visits: 290, rating: 4.6 },
  { name: 'Dubai', visits: 220, rating: 4.7 }
];

const activitiesData = [
  { name: 'Sightseeing', count: 1200 },
  { name: 'Hiking', count: 850 },
  { name: 'Food Tour', count: 760 },
  { name: 'Museums', count: 650 },
  { name: 'Shopping', count: 420 }
];

const trendsPieData = [
  { name: 'Leisure', value: 400 },
  { name: 'Business', value: 300 },
  { name: 'Adventure', value: 300 },
  { name: 'Family', value: 200 },
];
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const trendsLineData = [
  { name: 'Jan', users: 400 },
  { name: 'Feb', users: 300 },
  { name: 'Mar', users: 550 },
  { name: 'Apr', users: 450 },
  { name: 'May', users: 700 },
];

const trendsBarData = [
  { name: 'Q1', revenue: 4000 },
  { name: 'Q2', revenue: 3000 },
  { name: 'Q3', revenue: 2000 },
  { name: 'Q4', revenue: 2780 },
];

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('trends');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('default');
  
  // Filtered & Sorted Users
  const processedUsers = useMemo(() => {
    let result = usersData.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()));
    if (sortBy === 'trips-desc') result.sort((a, b) => b.trips - a.trips);
    if (sortBy === 'trips-asc') result.sort((a, b) => a.trips - b.trips);
    if (sortBy === 'name') result.sort((a, b) => a.name.localeCompare(b.name));
    return result;
  }, [searchTerm, sortBy]);

  // Filtered & Sorted Cities
  const processedCities = useMemo(() => {
    let result = citiesData.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
    if (sortBy === 'visits-desc') result.sort((a, b) => b.visits - a.visits);
    if (sortBy === 'visits-asc') result.sort((a, b) => a.visits - b.visits);
    return result;
  }, [searchTerm, sortBy]);

  // Filtered & Sorted Activities
  const processedActivities = useMemo(() => {
    let result = activitiesData.filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()));
    if (sortBy === 'count-desc') result.sort((a, b) => b.count - a.count);
    if (sortBy === 'count-asc') result.sort((a, b) => a.count - b.count);
    return result;
  }, [searchTerm, sortBy]);


  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return (
          <div className="admin-list-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Trips</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {processedUsers.map(u => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td><span className={`badge badge-${u.role.toLowerCase()}`}>{u.role}</span></td>
                    <td>{u.trips}</td>
                    <td><span className={`badge badge-${u.status.toLowerCase()}`}>{u.status}</span></td>
                  </tr>
                ))}
                {processedUsers.length === 0 && (
                  <tr><td colSpan="5" style={{textAlign:'center', padding:'20px'}}>No users found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        );
      case 'cities':
        return (
          <div className="admin-list-container">
            <div className="chart-wrapper" style={{ height: '300px', marginBottom: '20px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={processedCities}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="visits" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>City</th>
                  <th>Total Visits</th>
                  <th>Rating</th>
                </tr>
              </thead>
              <tbody>
                {processedCities.map(c => (
                  <tr key={c.name}>
                    <td>{c.name}</td>
                    <td>{c.visits}</td>
                    <td>{c.rating} ⭐</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'activities':
        return (
          <div className="admin-list-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Activity</th>
                  <th>Total Count</th>
                </tr>
              </thead>
              <tbody>
                {processedActivities.map(a => (
                  <tr key={a.name}>
                    <td>{a.name}</td>
                    <td>{a.count} times</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'trends':
      default:
        return (
          <div className="admin-trends-grid">
             {/* Bullet Points Area */}
             <div className="trends-section">
                <h3>Key Metrics</h3>
                <ul className="trends-list">
                  <li><span className="dot" style={{background: '#8b5cf6'}}></span> Monthly Active Users up by 15%</li>
                  <li><span className="dot" style={{background: '#ec4899'}}></span> Most booked destination: Paris</li>
                  <li><span className="dot" style={{background: '#10b981'}}></span> Retention rate stabilized at 82%</li>
                  <li><span className="dot" style={{background: '#f59e0b'}}></span> Revenue growth QOQ: +24%</li>
                </ul>
             </div>
             
             {/* Pie Chart */}
             <div className="trends-section chart-box">
               <ResponsiveContainer width="100%" height={200}>
                 <PieChart>
                   <Pie
                     data={trendsPieData}
                     cx="50%"
                     cy="50%"
                     innerRadius={60}
                     outerRadius={80}
                     fill="#8884d8"
                     paddingAngle={5}
                     dataKey="value"
                   >
                     {trendsPieData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                     ))}
                   </Pie>
                   <Tooltip />
                 </PieChart>
               </ResponsiveContainer>
             </div>

             {/* Line Chart */}
             <div className="trends-section chart-box" style={{ gridColumn: '1 / -1' }}>
               <ResponsiveContainer width="100%" height={200}>
                 <LineChart data={trendsLineData}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} />
                   <XAxis dataKey="name" />
                   <YAxis />
                   <Tooltip />
                   <Line type="monotone" dataKey="users" stroke="#ec4899" strokeWidth={3} dot={{r: 6}} />
                 </LineChart>
               </ResponsiveContainer>
             </div>

             {/* Bar Chart */}
             <div className="trends-section chart-box" style={{ gridColumn: '1 / -1' }}>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={trendsBarData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
             </div>
          </div>
        );
    }
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
        <div className="admin-avatar"><User size={20} /></div>
      </header>

      <div className="admin-container">
        
        {/* Controls Toolbar */}
        <div className="admin-toolbar glass-panel">
          <div className="admin-search">
            <Search className="search-icon" size={18} />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="admin-filters">
            <button className="admin-btn"><Layers size={16} /> Group by</button>
            <button className="admin-btn"><Filter size={16} /> Filter</button>
            <select className="admin-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="default">Sort by...</option>
              {activeTab === 'users' && (
                <>
                  <option value="name">Name (A-Z)</option>
                  <option value="trips-desc">Trips (High to Low)</option>
                  <option value="trips-asc">Trips (Low to High)</option>
                </>
              )}
              {activeTab === 'cities' && (
                <>
                  <option value="visits-desc">Visits (High to Low)</option>
                  <option value="visits-asc">Visits (Low to High)</option>
                </>
              )}
              {activeTab === 'activities' && (
                <>
                  <option value="count-desc">Count (High to Low)</option>
                  <option value="count-asc">Count (Low to High)</option>
                </>
              )}
            </select>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="admin-tabs">
          {[
            { id: 'users', label: 'Manage Users' },
            { id: 'cities', label: 'Popular cities' },
            { id: 'activities', label: 'Popular Activities' },
            { id: 'trends', label: 'User Trends and Analytics' }
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
              <h4>Manage User Section:</h4>
              <p>This Section is responsible for the managing the users and their actions. This section will the admin the access to view all the trips made by the user. Also other functionalities are welcome....</p>
            </div>
            
            <div className="info-block">
              <h4>Popular cities:</h4>
              <p>Lists all the popular cities where the users are visiting based on the current user trends.</p>
            </div>
            
            <div className="info-block">
              <h4>Popular Activities:</h4>
              <p>List all the popular activites that the users are doing based on the current user trend data.</p>
            </div>
            
            <div className="info-block">
              <h4>User trends and Analytics:</h4>
              <p>This section will major focus on the providing analysis accross various points and give useful information to the user.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
