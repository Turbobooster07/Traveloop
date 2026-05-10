import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Community = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('Latest');
  
  // New post state
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostTags, setNewPostTags] = useState('');
  const [newPostImage, setNewPostImage] = useState(null);
  const [posting, setPosting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPostImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    fetchPosts();
  }, [user]);

  const fetchPosts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/community/posts');
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      }
    } catch (err) {
      console.error("Failed to fetch posts", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    setPosting(true);
    try {
      const response = await fetch('http://localhost:5000/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          content: newPostContent,
          tags: newPostTags,
          image_url: newPostImage
        })
      });

      if (response.ok) {
        setNewPostContent('');
        setNewPostTags('');
        setNewPostImage(null);
        setShowModal(false);
        fetchPosts(); // Refresh feed
      }
    } catch (err) {
      console.error("Failed to create post", err);
    } finally {
      setPosting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const getInitials = (first, last) => {
    return `${first?.charAt(0) || ''}${last?.charAt(0) || ''}`;
  };

  const filteredPosts = posts
    .filter(post => 
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${post.first_name} ${post.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'Latest') return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === 'Popular') return b.id % 5 - a.id % 5; // Mocking popularity
      return 0;
    });

  if (loading) return <div className="dash-wrapper" style={{ justifyContent: 'center', alignItems: 'center', height: '100vh' }}><h3>Loading Community...</h3></div>;

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
              fontWeight: '700',
              color: 'var(--text-main)',
              cursor: 'pointer',
              fontFamily: 'inherit'
            }}
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
              <img src={user.profile_pic} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            ) : getInitials(user.first_name, user.last_name)}
          </div>
        </div>
      </nav>

      <div className="community-container">
        {/* Search and Filter Section */}
        <div className="community-controls">
          <div className="search-bar-wrapper">
            <input 
              type="text" 
              placeholder="Search community posts..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="community-search-input"
            />
          </div>
          <div className="control-buttons">
            <button className="control-btn">Group By</button>
            <button className="control-btn">Filter</button>
            <div className="dropdown">
              <button className="control-btn">Sort By: {sortBy}</button>
              <div className="dropdown-content">
                <button onClick={() => setSortBy('Latest')}>Latest</button>
                <button onClick={() => setSortBy('Popular')}>Popular</button>
              </div>
            </div>
          </div>
        </div>

        <div className="community-content">
          <h2 className="community-title">Community tab</h2>

          {/* Modal for Creating Post */}
          {showModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h3>Share Your Story</h3>
                  <button className="close-modal" onClick={() => setShowModal(false)}>&times;</button>
                </div>
                <form onSubmit={handleSubmitPost} className="create-post-form">
                  <textarea 
                    placeholder="Share your travel experience, activity story, or trip review..." 
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    className="create-post-textarea"
                    autoFocus
                    required
                  />
                  <div className="create-post-footer">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <input 
                          type="text" 
                          placeholder="Tags (e.g. Bali, Beach)" 
                          value={newPostTags}
                          onChange={(e) => setNewPostTags(e.target.value)}
                          className="create-post-tags-input"
                          style={{ flex: 1 }}
                        />
                        <label className="image-upload-label" style={{ 
                          cursor: 'pointer', 
                          padding: '10px', 
                          background: 'var(--card-bg)', 
                          border: '1px solid var(--border-medium)', 
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          color: 'var(--text-muted)'
                        }}>
                          📷 Add Image
                          <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                        </label>
                      </div>
                      
                      {newPostImage && (
                        <div className="image-preview-container" style={{ position: 'relative', width: 'fit-content' }}>
                          <img src={newPostImage} alt="Preview" style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '12px', border: '1px solid var(--border-medium)' }} />
                          <button 
                            type="button" 
                            onClick={() => setNewPostImage(null)}
                            style={{ 
                              position: 'absolute', 
                              top: '-10px', 
                              right: '-10px', 
                              background: '#ff4d4d', 
                              color: 'white', 
                              border: 'none', 
                              borderRadius: '50%', 
                              width: '24px', 
                              height: '24px', 
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            &times;
                          </button>
                        </div>
                      )}
                      
                      <button type="submit" className="post-submit-btn" disabled={posting} style={{ width: '100%', marginTop: '5px' }}>
                        {posting ? 'Posting...' : 'Post Story'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="community-feed">
            {filteredPosts.map(post => (
              <div key={post.id} className="post-card">
                <div className="post-avatar-col">
                  <div className="post-avatar">
                    <img src={post.profile_pic || `https://ui-avatars.com/api/?name=${post.first_name}+${post.last_name}&background=ffc8dd&color=96426b&size=100`} alt="Avatar" />
                  </div>
                </div>
                <div className="post-content-col">
                  <div className="post-header">
                    <span className="post-username">{post.first_name} {post.last_name}</span>
                    <span className="post-tag">@{post.first_name.toLowerCase()}</span>
                  </div>
                  <div className="post-body">
                    <p>{post.content}</p>
                    {post.image_url && (
                      <div className="post-image-wrapper" style={{ marginTop: '15px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-medium)' }}>
                        <img src={post.image_url} alt="Post content" style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '400px', objectFit: 'cover' }} />
                      </div>
                    )}
                    {post.tags && (
                      <div className="post-tags" style={{ marginTop: '15px' }}>
                        {post.tags.split(',').map((tag, i) => (
                          <span key={i} className="tag-chip">#{tag.trim()}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="post-footer">
                    <span className="post-date">{new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
            {filteredPosts.length === 0 && (
              <p style={{ textAlign: 'center', marginTop: '40px', color: 'var(--text-muted)' }}>No posts found matching your search.</p>
            )}
          </div>
        </div>
      </div>

      {/* Floating Plus Button */}
      <button className="community-fab" onClick={() => setShowModal(true)} title="Add Post">+</button>
    </div>
  );
};

export default Community;
