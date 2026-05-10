import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Billing.css';

const Billing = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [user, setUser] = useState(() => {
    if (location.state?.user) return location.state.user;
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentHistory, setPaymentHistory] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    fetchBillingData();
  }, [user, navigate]);

  const fetchBillingData = async () => {
    setLoading(true);
    try {
      const invResponse = await fetch(`http://localhost:5000/api/billing/invoices/${user.id}`);
      if (invResponse.ok) {
        const data = await invResponse.json();
        setInvoices(data);
        
        // Fetch payments for the first invoice if it exists for the demo
        if (data.length > 0) {
          fetchPayments(data[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to fetch billing data", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async (invoiceId) => {
    try {
      const payResponse = await fetch(`http://localhost:5000/api/billing/payments/${invoiceId}`);
      if (payResponse.ok) {
        const data = await payResponse.json();
        setPaymentHistory(data);
      }
    } catch (err) {
      console.error("Failed to fetch payments", err);
    }
  };

  const handlePayNow = async (invoice) => {
    // Simple mock payment
    try {
      const response = await fetch('http://localhost:5000/api/billing/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoice_id: invoice.id,
          amount: invoice.amount,
          payment_method: 'Credit Card',
          transaction_id: 'TXN' + Math.random().toString(36).substr(2, 9).toUpperCase()
        })
      });

      if (response.ok) {
        alert('Payment successful!');
        fetchBillingData();
      } else {
        const errData = await response.json();
        alert(`Payment failed: ${errData.error || 'Unknown error'}`);
      }
    } catch (err) {
      alert('Payment failed. Please check your connection and try again.');
    }
  };

  const getInitials = (first, last) => {
    return `${first?.charAt(0) || ''}${last?.charAt(0) || ''}`;
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const getStatusClass = (status) => {
    if (!status) return 'status-pending';
    switch (status.toLowerCase()) {
      case 'paid': return 'status-paid';
      case 'pending': return 'status-pending';
      case 'overdue': return 'status-overdue';
      default: return 'status-pending';
    }
  };

  return (
    <div className="dash-wrapper">
      <div className="bg-shape-yellow"></div>
      <div className="bg-shape-blue-square"></div>
      <div className="bg-shape-pink-blob"></div>
      <div className="bg-shape-purple-circle"></div>
      <div className="bg-shape-green-blob"></div>

      {/* Navbar - Same as Dashboard */}
      <nav className="dash-nav">
        <div className="dash-logo" onClick={() => navigate('/dashboard', { state: { user } })} style={{ cursor: 'pointer' }}>
          <h1>Traveloop</h1>
        </div>
        <div className="dash-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => navigate('/dashboard', { state: { user } })}
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
            ← Back to Dashboard
          </button>
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
            My Trips
          </button>
          <button onClick={handleLogout} className="dash-btn-chip" style={{ background: 'transparent', border: '1px solid var(--border-medium)' }}>
            Logout
          </button>
          <div className="dash-profile" onClick={() => navigate('/profile', { state: { user } })} title="View Profile">
            {getInitials(user.first_name, user.last_name)}
          </div>
        </div>
      </nav>

      <div className="dash-container">
        <div className="billing-header">
          <h1>Billing & Payments</h1>
          <p>Manage your invoices and track your travel spending.</p>
        </div>

        {loading ? (
          <div className="empty-state">Loading your billing details...</div>
        ) : (
          <div className="billing-grid">
            <div className="billing-main">
              <div className="billing-card">
                <h3>📄 Your Invoices</h3>
                {invoices.length > 0 ? (
                  <div className="invoice-list">
                    {invoices.map(invoice => (
                      <div key={invoice.id} className="invoice-item">
                        <div className="invoice-info">
                          <h4>{invoice.trip_name || 'General Trip Expense'}</h4>
                          <p>Due Date: {new Date(invoice.due_date).toLocaleDateString()}</p>
                          <p>{invoice.description}</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <span className="invoice-amount">${parseFloat(invoice.amount).toFixed(2)}</span>
                          <span className={`invoice-status ${getStatusClass(invoice.status)}`}>
                            {invoice.status}
                          </span>
                          {invoice.status.toLowerCase() !== 'paid' && (
                            <button 
                              onClick={() => handlePayNow(invoice)}
                              style={{
                                marginLeft: '20px',
                                padding: '8px 16px',
                                background: 'var(--text-main)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                fontWeight: '600',
                                cursor: 'pointer'
                              }}
                            >
                              Pay Now
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <p>No invoices found. Your travel billing will appear here.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="billing-sidebar">
              <div className="billing-card">
                <h3>💳 Payment History</h3>
                {paymentHistory.length > 0 ? (
                  <div className="payment-history">
                    {paymentHistory.map(payment => (
                      <div key={payment.id} className="payment-item">
                        <div className="payment-item-info">
                          <h5>{payment.payment_method}</h5>
                          <p>{new Date(payment.payment_date).toLocaleDateString()}</p>
                          <p style={{fontSize: '10px'}}>{payment.transaction_id}</p>
                        </div>
                        <span className="payment-item-amount">+${parseFloat(payment.amount).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <p>No payment records yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Billing;
