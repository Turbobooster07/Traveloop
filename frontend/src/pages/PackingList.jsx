import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';

const categories = ['Documents', 'Clothing', 'Electronics'];

const defaultItems = {
  Documents: ['Passport', 'Visa', 'Travel Insurance', 'Flight Tickets', 'ID Card', 'Hotel Reservations'],
  Clothing: ['Shirts/T-shirts', 'Pants/Jeans', 'Underwear', 'Socks', 'Jacket/Sweater', 'Comfortable Shoes', 'Swimwear'],
  Electronics: ['Phone Charger', 'Power Bank', 'Laptop/Tablet', 'Camera', 'Universal Adapter', 'Headphones']
};

const PackingList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.user;
  const trip = location.state?.trip;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState({ name: '', category: 'Documents' });
  const [shareFeedback, setShareFeedback] = useState('');
  
  // Guard to prevent double-initialization (e.g. in React Strict Mode)
  const isInitializing = useRef(false);

  useEffect(() => {
    if (trip?.id) {
      fetchPackingItems();
    }
  }, [trip]);

  const fetchPackingItems = async () => {
    if (isInitializing.current) return;
    
    try {
      const res = await fetch(`http://localhost:5000/api/packing/${trip.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.length === 0 && !isInitializing.current) {
          isInitializing.current = true;
          // Initialize with default items if empty
          const initialItems = [];
          Object.entries(defaultItems).forEach(([category, names]) => {
            names.forEach(name => {
              initialItems.push({ item_name: name, category, is_packed: false });
            });
          });
          
          const saveRes = await fetch(`http://localhost:5000/api/packing/${trip.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: initialItems })
          });
          
          if (saveRes.ok) {
            const savedItems = await saveRes.json();
            setItems(savedItems);
          }
        } else {
          setItems(data);
        }
      }
    } catch (err) {
      console.error('Failed to fetch packing items', err);
    } finally {
      setLoading(false);
    }
  };

  const togglePacked = async (itemId, currentStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/packing/item/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_packed: !currentStatus })
      });
      if (res.ok) {
        setItems(prev => prev.map(item => 
          item.id === itemId ? { ...item, is_packed: !currentStatus } : item
        ));
      }
    } catch (err) {
      console.error('Failed to toggle packed status', err);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.name.trim()) return;

    try {
      const res = await fetch(`http://localhost:5000/api/packing/${trip.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: [{ item_name: newItem.name, category: newItem.category }] })
      });
      if (res.ok) {
        const saved = await res.json();
        setItems(prev => [...prev, ...saved]);
        setNewItem({ ...newItem, name: '' });
      }
    } catch (err) {
      console.error('Failed to add item', err);
    }
  };

  const deleteItem = async (itemId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/packing/item/${itemId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setItems(prev => prev.filter(item => item.id !== itemId));
      }
    } catch (err) {
      console.error('Failed to delete item', err);
    }
  };

  const handleResetAll = async () => {
    if (!window.confirm('Are you sure you want to uncheck all items?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/packing/reset/${trip.id}`, {
        method: 'PATCH'
      });
      if (res.ok) {
        const updatedItems = await res.json();
        // Fully replace state with backend response to prevent any client-side duplication
        setItems(updatedItems);
      }
    } catch (err) {
      console.error('Failed to reset items', err);
    }
  };

  const handleShare = () => {
    const packedCount = items.filter(i => i.is_packed).length;
    const totalCount = items.length;
    const shareText = `My Packing List for ${trip.destination} (${packedCount}/${totalCount} packed):\n\n` + 
      categories.map(cat => {
        const catItems = items.filter(i => i.category === cat);
        if (catItems.length === 0) return '';
        return `${cat}:\n` + catItems.map(i => `${i.is_packed ? '[x]' : '[ ]'} ${i.item_name}`).join('\n');
      }).join('\n\n');

    navigator.clipboard.writeText(shareText).then(() => {
      setShareFeedback('List copied to clipboard!');
      setTimeout(() => setShareFeedback(''), 3000);
    });
  };

  if (!user) {
    return (
      <div className="login-container">
        <div className="login-card" style={{ textAlign: 'center' }}>
          <h2>Unauthorized</h2>
          <p className="subtitle">Please log in.</p>
          <button onClick={() => navigate('/')} className="login-btn">Go to Login</button>
        </div>
      </div>
    );
  }

  const groupedItems = categories.reduce((acc, cat) => {
    acc[cat] = items.filter(item => item.category === cat);
    return acc;
  }, {});

  return (
    <div className="dash-wrapper">
      <Navbar user={user} />

      <div className="dash-container" style={{ maxWidth: '800px' }}>
        <header style={{ marginBottom: '40px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '800', fontFamily: "'Outfit', sans-serif", color: 'var(--text-main)' }}>
            Packing List for {trip?.destination}
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Get ready for your adventure!</p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '20px' }}>
            <button 
              onClick={handleShare}
              style={{ padding: '8px 16px', borderRadius: '10px', border: '1px solid var(--border-medium)', background: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer', color: 'var(--text-main)' }}
            >
              Share List
            </button>
            <button 
              onClick={handleResetAll}
              style={{ padding: '8px 16px', borderRadius: '10px', border: '1px solid #ff4d4d', background: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer', color: '#ff4d4d' }}
            >
              Reset All
            </button>
          </div>
          {shareFeedback && <p style={{ color: 'var(--accent-green-text, #047857)', fontSize: '13px', marginTop: '10px', fontWeight: '600' }}>{shareFeedback}</p>}
        </header>

        <form onSubmit={handleAddItem} style={{ 
          display: 'flex', gap: '12px', marginBottom: '40px', 
          background: 'var(--card-bg)', padding: '20px', borderRadius: '16px',
          border: '1px solid var(--border-medium)', boxShadow: 'var(--shadow-soft)'
        }}>
          <input 
            type="text" 
            placeholder="Add new item..." 
            value={newItem.name}
            onChange={e => setNewItem({...newItem, name: e.target.value})}
            style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border-medium)', outline: 'none' }}
          />
          <select 
            value={newItem.category}
            onChange={e => setNewItem({...newItem, category: e.target.value})}
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-medium)', background: '#fff' }}
          >
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <button type="submit" style={{ padding: '12px 24px', background: 'var(--cta-gradient)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
            Add
          </button>
        </form>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {categories.map(category => (
            <div key={category} style={{ background: 'var(--card-bg)', borderRadius: '24px', padding: '24px', border: '1px solid var(--border-medium)', boxShadow: 'var(--shadow-soft)' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '20px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                {category}
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                {groupedItems[category]?.map(item => (
                  <div key={item.id} style={{ 
                    display: 'flex', alignItems: 'center', gap: '12px', 
                    padding: '12px', borderRadius: '12px', background: item.is_packed ? 'var(--accent-purple-bg)' : '#fff',
                    border: '1px solid', borderColor: item.is_packed ? 'var(--accent-purple)' : 'var(--border-light)',
                    transition: 'all 0.2s'
                  }}>
                    <input 
                      type="checkbox" 
                      checked={item.is_packed} 
                      onChange={() => togglePacked(item.id, item.is_packed)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <span style={{ 
                      flex: 1, fontSize: '15px', color: item.is_packed ? 'var(--accent-purple-text)' : 'var(--text-main)',
                      textDecoration: item.is_packed ? 'line-through' : 'none',
                      fontWeight: item.is_packed ? '500' : '600'
                    }}>
                      {item.item_name}
                    </span>
                    <button onClick={() => deleteItem(item.id)} style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '14px', opacity: 0.6 }}>
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PackingList;
