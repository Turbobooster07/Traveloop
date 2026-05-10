import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './community.css';

const API = 'http://localhost:5000/api/community';

const Community = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [filterTag, setFilterTag] = useState('');

  // New post state
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostTags, setNewPostTags] = useState('');
  const [posting, setPosting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Comments state — { [postId]: { open, comments[], loading, text } }
  const [commentState, setCommentState] = useState({});

  useEffect(() => {
    if (!user) { navigate('/'); return; }
    fetchPosts();
  }, [user]);

  const fetchPosts = async () => {
    try {
      const response = await fetch(`${API}/posts`);
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      }
    } catch (err) {
      console.error('Failed to fetch posts', err);
    } finally {
      setLoading(false);
    }
  };

  // ─── Create Post ────────────────────────────────────────────

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;
    setPosting(true);
    try {
      const response = await fetch(`${API}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, content: newPostContent, tags: newPostTags })
      });
      if (response.ok) {
        setNewPostContent('');
        setNewPostTags('');
        setShowModal(false);
        fetchPosts();
      }
    } catch (err) {
      console.error('Failed to create post', err);
    } finally {
      setPosting(false);
    }
  };

  // ─── Delete Post ────────────────────────────────────────────

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await fetch(`${API}/posts/${postId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id })
      });
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch (err) {
      console.error('Failed to delete post', err);
    }
  };

  // ─── Like / Unlike ─────────────────────────────────────────

  const handleToggleLike = async (postId, isLiked) => {
    try {
      const res = await fetch(`${API}/posts/${postId}/like`, {
        method: isLiked ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id })
      });
      if (res.ok) {
        const data = await res.json();
        setPosts(prev => prev.map(p => {
          if (p.id !== postId) return p;
          const liked_by = isLiked
            ? (p.liked_by || []).filter(id => id !== user.id)
            : [...(p.liked_by || []), user.id];
          return { ...p, like_count: data.like_count, liked_by };
        }));
      }
    } catch (err) {
      console.error('Like toggle failed', err);
    }
  };

  // ─── Comments ──────────────────────────────────────────────

  const toggleComments = async (postId) => {
    const current = commentState[postId];
    if (current?.open) {
      setCommentState(prev => ({ ...prev, [postId]: { ...prev[postId], open: false } }));
      return;
    }
    // Open and fetch
    setCommentState(prev => ({
      ...prev,
      [postId]: { open: true, comments: prev[postId]?.comments || [], loading: true, text: '' }
    }));
    try {
      const res = await fetch(`${API}/posts/${postId}/comments`);
      const data = await res.json();
      setCommentState(prev => ({
        ...prev,
        [postId]: { ...prev[postId], comments: data, loading: false }
      }));
    } catch (err) {
      setCommentState(prev => ({
        ...prev,
        [postId]: { ...prev[postId], loading: false }
      }));
    }
  };

  const handleCommentTextChange = (postId, text) => {
    setCommentState(prev => ({
      ...prev,
      [postId]: { ...prev[postId], text }
    }));
  };

  const handleSubmitComment = async (postId) => {
    const text = commentState[postId]?.text?.trim();
    if (!text) return;
    try {
      const res = await fetch(`${API}/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, content: text })
      });
      if (res.ok) {
        const newComment = await res.json();
        setCommentState(prev => ({
          ...prev,
          [postId]: {
            ...prev[postId],
            comments: [...(prev[postId]?.comments || []), newComment],
            text: ''
          }
        }));
        // Update comment count in posts
        setPosts(prev => prev.map(p =>
          p.id === postId ? { ...p, comment_count: (p.comment_count || 0) + 1 } : p
        ));
      }
    } catch (err) {
      console.error('Failed to add comment', err);
    }
  };

  const handleDeleteComment = async (commentId, postId) => {
    try {
      await fetch(`${API}/comments/${commentId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id })
      });
      setCommentState(prev => ({
        ...prev,
        [postId]: {
          ...prev[postId],
          comments: prev[postId].comments.filter(c => c.id !== commentId)
        }
      }));
      setPosts(prev => prev.map(p =>
        p.id === postId ? { ...p, comment_count: Math.max(0, (p.comment_count || 1) - 1) } : p
      ));
    } catch (err) {
      console.error('Failed to delete comment', err);
    }
  };

  // ─── Filtering & Sorting ──────────────────────────────────

  // Gather all unique tags
  const allTags = [...new Set(
    posts.flatMap(p => (p.tags || '').split(',').map(t => t.trim()).filter(Boolean))
  )];

  const filteredPosts = posts
    .filter(post => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q ||
        post.content.toLowerCase().includes(q) ||
        post.tags?.toLowerCase().includes(q) ||
        `${post.first_name} ${post.last_name}`.toLowerCase().includes(q);
      const matchesTag = !filterTag ||
        (post.tags || '').split(',').map(t => t.trim().toLowerCase()).includes(filterTag.toLowerCase());
      return matchesSearch && matchesTag;
    })
    .sort((a, b) => {
      if (sortBy === 'popular') return (b.like_count || 0) - (a.like_count || 0);
      if (sortBy === 'commented') return (b.comment_count || 0) - (a.comment_count || 0);
      return new Date(b.created_at) - new Date(a.created_at); // latest
    });

  // ─── Helpers ──────────────────────────────────────────────

  const handleLogout = () => { localStorage.removeItem('user'); navigate('/'); };

  const getInitials = (first, last) => `${first?.charAt(0) || ''}${last?.charAt(0) || ''}`;

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // ─── Loading State ────────────────────────────────────────

  if (loading) {
    return (
      <div className="dash-wrapper">
        <div className="bg-shape-yellow"></div>
        <div className="bg-shape-blue-square"></div>
        <div className="bg-shape-pink-blob"></div>
        <div className="community-loading">
          <div className="community-spinner"></div>
          <p>Loading Community...</p>
        </div>
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────

  return (
    <div className="dash-wrapper">
      <div className="bg-shape-yellow"></div>
      <div className="bg-shape-blue-square"></div>
      <div className="bg-shape-pink-blob"></div>
      <div className="bg-shape-purple-circle"></div>
      <div className="bg-shape-green-blob"></div>

      {/* Navbar */}
      <nav className="dash-nav">
        <div className="dash-logo" onClick={() => navigate('/dashboard', { state: { user } })} style={{ cursor: 'pointer' }}>
          <h1>Traveloop</h1>
        </div>
        <div className="dash-actions" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <button onClick={() => navigate('/my-trips', { state: { user } })} className="nav-link-btn">🗺️ My Trips</button>
          <button className="nav-link-btn nav-link-active">👥 Community</button>
          <button onClick={() => navigate('/notes', { state: { user } })} className="nav-link-btn">📔 Trip Notes</button>
          <button onClick={handleLogout} className="dash-btn-chip" style={{ background: 'transparent', border: '1px solid var(--border-medium)' }}>Logout</button>
          <div className="dash-profile" onClick={() => navigate('/profile')} title="View Profile">
            {user.profile_pic ? (
              <img src={user.profile_pic} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            ) : getInitials(user.first_name, user.last_name)}
          </div>
        </div>
      </nav>

      <div className="community-page">
        {/* Community Header */}
        <div className="community-hero">
          <h2>Travel Community</h2>
          <p>Share stories, get inspired, and connect with fellow travelers</p>
        </div>

        {/* Toolbar */}
        <div className="community-toolbar">
          <div className="community-search-wrap">
            <svg className="search-icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              type="text"
              placeholder="Search posts, tags, people..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="community-search-input"
            />
          </div>
          <div className="community-toolbar-actions">
            {/* Tag filter */}
            <select
              className="community-select"
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
            >
              <option value="">All Tags</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
            {/* Sort */}
            <select
              className="community-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="latest">Latest</option>
              <option value="popular">Most Liked</option>
              <option value="commented">Most Commented</option>
            </select>
          </div>
        </div>

        {/* Feed */}
        <div className="community-layout">
          <div className="community-feed">
            {/* Compose prompt */}
            <div className="compose-prompt" onClick={() => setShowModal(true)}>
              <div className="compose-avatar">
                {user.profile_pic ? (
                  <img src={user.profile_pic} alt="" />
                ) : (
                  <span>{getInitials(user.first_name, user.last_name)}</span>
                )}
              </div>
              <div className="compose-placeholder">What's on your mind, {user.first_name}?</div>
              <button className="compose-btn">Post</button>
            </div>

            {/* Posts */}
            {filteredPosts.map(post => {
              const isLiked = (post.liked_by || []).includes(user.id);
              const isOwner = post.user_id === user.id;
              const cs = commentState[post.id] || {};

              return (
                <div key={post.id} className="post-card">
                  {/* Post Header */}
                  <div className="post-top">
                    <div className="post-avatar">
                      <img src={post.profile_pic || `https://ui-avatars.com/api/?name=${post.first_name}+${post.last_name}&background=8b5cf6&color=fff&bold=true&size=100`} alt="" />
                    </div>
                    <div className="post-meta">
                      <span className="post-author">{post.first_name} {post.last_name}</span>
                      <span className="post-handle">@{post.username || post.first_name?.toLowerCase()}</span>
                      <span className="post-dot">·</span>
                      <span className="post-time">{timeAgo(post.created_at)}</span>
                    </div>
                    {isOwner && (
                      <button className="post-delete-btn" onClick={() => handleDeletePost(post.id)} title="Delete post">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/><path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                      </button>
                    )}
                  </div>

                  {/* Post Body */}
                  <div className="post-body">
                    <p style={{ color: '#111827' }}>{post.content}</p>
                    {post.tags && (
                      <div className="post-tags" style={{ marginTop: '15px' }}>
                        {post.tags.split(',').map((tag, i) => (
                          <span
                            key={i}
                            className="tag-chip"
                            onClick={() => setFilterTag(tag.trim())}
                          >
                            #{tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="post-actions">
                    <button
                      className={`action-btn like-btn ${isLiked ? 'liked' : ''}`}
                      onClick={() => handleToggleLike(post.id, isLiked)}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill={isLiked ? '#ef4444' : 'none'} stroke={isLiked ? '#ef4444' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                      </svg>
                      <span>{post.like_count || 0}</span>
                    </button>
                    <button
                      className={`action-btn comment-btn ${cs.open ? 'active' : ''}`}
                      onClick={() => toggleComments(post.id)}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                      </svg>
                      <span>{post.comment_count || 0}</span>
                    </button>
                  </div>

                  {/* Comments Section */}
                  {cs.open && (
                    <div className="comments-section">
                      {cs.loading ? (
                        <div className="comments-loading">Loading comments...</div>
                      ) : (
                        <>
                          {(cs.comments || []).length === 0 && (
                            <div className="comments-empty">No comments yet. Be the first!</div>
                          )}
                          {(cs.comments || []).map(c => (
                            <div key={c.id} className="comment-item">
                              <div className="comment-avatar">
                                <img src={c.profile_pic || `https://ui-avatars.com/api/?name=${c.first_name}+${c.last_name}&background=ec4899&color=fff&size=60`} alt="" />
                              </div>
                              <div className="comment-body">
                                <div className="comment-header">
                                  <span className="comment-author">{c.first_name} {c.last_name}</span>
                                  <span className="comment-time">{timeAgo(c.created_at)}</span>
                                  {c.user_id === user.id && (
                                    <button className="comment-delete" onClick={() => handleDeleteComment(c.id, post.id)} title="Delete">×</button>
                                  )}
                                </div>
                                <p className="comment-text">{c.content}</p>
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                      {/* Comment input */}
                      <div className="comment-input-row">
                        <div className="comment-input-avatar">
                          {user.profile_pic ? (
                            <img src={user.profile_pic} alt="" />
                          ) : (
                            <span>{getInitials(user.first_name, user.last_name)}</span>
                          )}
                        </div>
                        <input
                          type="text"
                          className="comment-input"
                          placeholder="Write a comment..."
                          value={cs.text || ''}
                          onChange={(e) => handleCommentTextChange(post.id, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSubmitComment(post.id);
                            }
                          }}
                        />
                        <button
                          className="comment-send-btn"
                          onClick={() => handleSubmitComment(post.id)}
                          disabled={!(cs.text || '').trim()}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {filteredPosts.length === 0 && (
              <div className="community-empty">
                <div className="empty-icon">📭</div>
                <h3>No posts found</h3>
                <p>{searchQuery || filterTag ? 'Try adjusting your search or filter.' : 'Be the first to share a story!'}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="community-sidebar">
            <div className="sidebar-card">
              <h4>Trending Tags</h4>
              <div className="sidebar-tags">
                {allTags.slice(0, 12).map(tag => (
                  <button
                    key={tag}
                    className={`sidebar-tag ${filterTag === tag ? 'active' : ''}`}
                    onClick={() => setFilterTag(filterTag === tag ? '' : tag)}
                  >
                    #{tag}
                  </button>
                ))}
                {allTags.length === 0 && <p className="sidebar-empty">No tags yet</p>}
              </div>
            </div>
            <div className="sidebar-card">
              <h4>Community Stats</h4>
              <div className="sidebar-stats">
                <div className="sidebar-stat">
                  <span className="stat-num">{posts.length}</span>
                  <span className="stat-label">Posts</span>
                </div>
                <div className="sidebar-stat">
                  <span className="stat-num">{posts.reduce((s, p) => s + (p.like_count || 0), 0)}</span>
                  <span className="stat-label">Likes</span>
                </div>
                <div className="sidebar-stat">
                  <span className="stat-num">{posts.reduce((s, p) => s + (p.comment_count || 0), 0)}</span>
                  <span className="stat-label">Comments</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Create Post Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Share Your Story</h3>
              <button className="close-modal" onClick={() => setShowModal(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <form onSubmit={handleSubmitPost} className="create-post-form">
              <div className="modal-compose-row">
                <div className="compose-avatar-lg">
                  {user.profile_pic ? (
                    <img src={user.profile_pic} alt="" />
                  ) : (
                    <span>{getInitials(user.first_name, user.last_name)}</span>
                  )}
                </div>
                <div className="compose-info">
                  <span className="compose-name">{user.first_name} {user.last_name}</span>
                  <span className="compose-public">Public post</span>
                </div>
              </div>
              <textarea
                placeholder="What's your latest travel adventure? Share tips, reviews, or a fun story..."
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="create-post-textarea"
                autoFocus
                required
                rows={5}
              />
              <div className="create-post-footer">
                <input
                  type="text"
                  placeholder="Tags (e.g. Bali, Beach, Foodie)"
                  value={newPostTags}
                  onChange={(e) => setNewPostTags(e.target.value)}
                  className="create-post-tags-input"
                />
                <button type="submit" className="post-submit-btn" disabled={posting || !newPostContent.trim()}>
                  {posting ? (
                    <><span className="btn-spinner"></span> Posting...</>
                  ) : (
                    <>Post Story</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FAB */}
      <button className="community-fab" onClick={() => setShowModal(true)} title="Create Post">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </button>
    </div>
  );
};

export default Community;
