import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

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

  useEffect(() => {
    if (trip?.id) {
      fetchPackingItems();
    }
  }, [trip]);

  const fetchPackingItems = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/packing/${trip.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.length === 0) {
          // Initialize with default items if empty
          const initialItems = [];
          Object.entries(defaultItems).forEach(([category, names]) => {
            names.forEach(name => {
              initialItems.push({ item_name: name, category, is_packed: false });
            });
          });
          
          // Save default items to backend
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
        setItems(items.map(item => 
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
        setItems([...items, ...saved]);
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
        setItems(items.filter(item => item.id !== itemId));
      }
    } catch (err) {
      console.error('Failed to delete item', err);
    }
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
      <nav className="dash-nav">
        <div className="dash-logo" onClick={() => navigate('/dashboard', { state: { user } })} style={{ cursor: 'pointer' }}>
          <h1>Traveloop</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => navigate('/my-trips', { state: { user } })} className="login-btn" style={{ padding: '8px 20px', background: 'var(--card-bg)', color: 'var(--text-muted)', border: '1px solid var(--border-medium)' }}>
            My Trips
          </button>
          <div className="dash-profile">
            {user.first_name.charAt(0)}{user.last_name.charAt(0)}
          </div>
        </div>
      </nav>

      <div className="dash-container" style={{ maxWidth: '800px' }}>
        <header style={{ marginBottom: '40px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '800', fontFamily: "'Outfit', sans-serif", color: 'var(--text-main)' }}>
            Packing List for {trip?.destination}
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Get ready for your adventure!</p>
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
