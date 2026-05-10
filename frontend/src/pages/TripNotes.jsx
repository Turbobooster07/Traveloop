import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

const TripNotes = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : (location.state?.user || null);
  });

  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState('All'); // All, By Day, By Stop
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  // Form State
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteDay, setNoteDay] = useState('');
  const [noteStop, setNoteStop] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    fetchTrips();
  }, [user]);

  useEffect(() => {
    if (selectedTripId) {
      fetchNotes(selectedTripId);
    }
  }, [selectedTripId]);

  const fetchTrips = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/trips/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setTrips(data);
        if (data.length > 0) {
          setSelectedTripId(data[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to fetch trips", err);
    }
  };

  const fetchNotes = async (tripId) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/notes/${tripId}`);
      if (response.ok) {
        const data = await response.json();
        setNotes(data);
      }
    } catch (err) {
      console.error("Failed to fetch notes", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrUpdateNote = async (e) => {
    e.preventDefault();
    const payload = {
      trip_id: selectedTripId,
      title: noteTitle,
      content: noteContent,
      day_number: noteDay || null,
      stop_name: noteStop || '',
      note_date: new Date().toISOString().split('T')[0] // Placeholder for now
    };

    try {
      let response;
      if (editingNote) {
        response = await fetch(`http://localhost:5000/api/notes/${editingNote.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        response = await fetch('http://localhost:5000/api/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (response.ok) {
        setShowModal(false);
        resetForm();
        fetchNotes(selectedTripId);
      }
    } catch (err) {
      console.error("Failed to save note", err);
    }
  };

  const handleDeleteNote = async (id) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;
    try {
      const response = await fetch(`http://localhost:5000/api/notes/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        fetchNotes(selectedTripId);
      }
    } catch (err) {
      console.error("Failed to delete note", err);
    }
  };

  const openEditModal = (note) => {
    setEditingNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setNoteDay(note.day_number || '');
    setNoteStop(note.stop_name || '');
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingNote(null);
    setNoteTitle('');
    setNoteContent('');
    setNoteDay('');
    setNoteStop('');
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          note.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterTab === 'By Day') return matchesSearch && note.day_number;
    if (filterTab === 'By Stop') return matchesSearch && note.stop_name;
    return matchesSearch;
  });

  return (
    <div className="dash-wrapper">
      {/* Background Shapes */}
      <div className="bg-shape-yellow"></div>
      <div className="bg-shape-blue-square"></div>
      <div className="bg-shape-pink-blob"></div>
      <div className="bg-shape-purple-circle"></div>

      {/* Header Section */}
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
              fontWeight: '700',
              color: 'var(--text-main)',
              cursor: 'pointer',
              fontFamily: 'inherit'
            }}
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

      <div className="community-container">
        {/* Search and Utility Section */}
        <div className="community-controls">
          <div className="search-bar-wrapper">
            <input 
              type="text" 
              placeholder="Search trip notes..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="community-search-input"
            />
          </div>
          <div className="control-buttons">
            <button className="control-btn">Group By</button>
            <button className="control-btn">Filter</button>
            <button className="control-btn">Sort By</button>
          </div>
        </div>

        <div className="community-content">
          <h2 className="community-title" style={{ color: '#000' }}>Trip Notes</h2>

          <div className="notes-utility-row" style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '30px' }}>
            <div className="trip-selector-wrapper" style={{ flex: 1 }}>
              <select 
                className="community-search-input" 
                style={{ width: '100%', padding: '12px 20px', background: 'rgba(0,0,0,0.05)', color: '#000', border: '1px solid rgba(0,0,0,0.1)' }}
                value={selectedTripId}
                onChange={(e) => setSelectedTripId(e.target.value)}
              >
                {trips.map(trip => (
                  <option key={trip.id} value={trip.id} style={{ background: '#fff', color: '#000' }}>
                    Trip: {trip.destination}
                  </option>
                ))}
              </select>
            </div>
            <button className="post-submit-btn" onClick={() => { resetForm(); setShowModal(true); }}>
              + Add Note
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="filter-tabs" style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
            {['All', 'By Day', 'By Stop'].map(tab => (
              <button 
                key={tab}
                className={`control-btn ${filterTab === tab ? 'active' : ''}`}
                style={filterTab === tab ? { background: 'var(--accent-purple)', borderColor: 'var(--accent-purple)', color: '#fff' } : {}}
                onClick={() => setFilterTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Notes Feed */}
          <div className="community-feed">
            {loading ? (
              <p>Loading notes...</p>
            ) : filteredNotes.length > 0 ? (
              filteredNotes.map(note => (
                <div key={note.id} className="post-card" style={{ padding: '24px', display: 'block' }}>
                  <div className="note-card-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <h4 style={{ margin: 0, fontSize: '18px', color: '#000', fontWeight: '700' }}>{note.title}</h4>
                    <div className="note-actions" style={{ display: 'flex', gap: '12px' }}>
                      <button onClick={() => openEditModal(note)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>✏️</button>
                      <button onClick={() => handleDeleteNote(note.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>🗑️</button>
                    </div>
                  </div>
                  <div className="note-card-content" style={{ color: '#000', fontWeight: '500', marginBottom: '16px', lineHeight: '1.6' }}>
                    {note.content.split('\n').map((line, i) => <p key={i} style={{ margin: '0 0 8px 0' }}>{line}</p>)}
                  </div>
                  <div className="note-card-footer" style={{ fontSize: '13px', color: 'var(--accent-purple)', fontWeight: '600' }}>
                    {note.day_number && `Day ${note.day_number}`} {note.stop_name && `• ${note.stop_name}`} • {new Date(note.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))
            ) : (
              <p className="subtitle">No notes found. Start journaling your adventure!</p>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Note Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingNote ? 'Edit Note' : 'Add New Note'}</h3>
              <button className="close-modal" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleAddOrUpdateNote} className="create-post-form">
              <input 
                type="text"
                placeholder="Note Title (e.g. Hotel check-in)"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                className="create-post-tags-input"
                style={{ borderRadius: '12px', marginBottom: '10px' }}
                required
              />
              <textarea 
                placeholder="Write your details here..." 
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                className="create-post-textarea"
                style={{ minHeight: '150px' }}
                required
              />
              <div style={{ display: 'flex', gap: '15px' }}>
                <input 
                  type="number"
                  placeholder="Day #"
                  value={noteDay}
                  onChange={(e) => setNoteDay(e.target.value)}
                  className="create-post-tags-input"
                  style={{ borderRadius: '12px', flex: 1 }}
                />
                <input 
                  type="text"
                  placeholder="Stop/Location"
                  value={noteStop}
                  onChange={(e) => setNoteStop(e.target.value)}
                  className="create-post-tags-input"
                  style={{ borderRadius: '12px', flex: 2 }}
                />
              </div>
              <button type="submit" className="post-submit-btn" style={{ marginTop: '10px' }}>
                {editingNote ? 'Update Note' : 'Save Note'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripNotes;
