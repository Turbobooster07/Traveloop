import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import Navbar from '../components/Navbar';
import './Billing.css';

const Billing = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [user, setUser] = useState(() => {
    if (location.state?.user) return location.state.user;
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [itineraryBudget, setItineraryBudget] = useState(0);
  const [tripStatus, setTripStatus] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    fetchTrips();
  }, [user, navigate]);

  const fetchTrips = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/trips/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setTrips(data);
        if (data.length > 0) {
          const firstTrip = data[0];
          setSelectedTripId(firstTrip.id);
          setTripStatus(firstTrip.status);
        }
      }
    } catch (err) {
      console.error("Failed to fetch trips", err);
    }
  };

  const fetchExpenses = useCallback(async (tripId) => {
    setLoading(true);
    try {
      // Fetch expenses
      const expRes = await fetch(`http://localhost:5000/api/billing/expenses/${tripId}`);
      if (expRes.ok) {
        const data = await expRes.json();
        setExpenses(data.length > 0 ? data : [{ category: '', description: '', quantity_details: '', unit_cost: 0, total_amount: 0, isNew: true }]);
      }

      // Fetch itinerary budget
      const budRes = await fetch(`http://localhost:5000/api/billing/itinerary-budget/${tripId}`);
      if (budRes.ok) {
        const data = await budRes.json();
        setItineraryBudget(data.total_budget || 0);
      }
    } catch (err) {
      console.error("Failed to fetch expenses", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedTripId) {
      fetchExpenses(selectedTripId);
      const selectedTrip = trips.find(t => t.id == selectedTripId);
      if (selectedTrip) setTripStatus(selectedTrip.status);
    }
  }, [selectedTripId, fetchExpenses, trips]);

  const handleInputChange = (index, field, value) => {
    const updatedExpenses = [...expenses];
    updatedExpenses[index][field] = value;
    
    // Auto-calculate total
    if (field === 'unit_cost' || field === 'quantity_details') {
      const qty = parseFloat(updatedExpenses[index].quantity_details) || 0;
      const unit = parseFloat(updatedExpenses[index].unit_cost) || 0;
      updatedExpenses[index].total_amount = qty * unit;
    }
    
    setExpenses(updatedExpenses);
    debounceSave(index);
  };

  const timerRef = React.useRef(null);
  const debounceSave = (index) => {
    setSaveStatus('Typing...');
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      saveExpense(index);
    }, 1000);
  };

  const saveExpense = async (index) => {
    const item = expenses[index];
    if (!item.category && !item.description) return;

    setSaveStatus('Saving...');
    try {
      const method = item.id ? 'PUT' : 'POST';
      const url = item.id 
        ? `http://localhost:5000/api/billing/expenses/${item.id}` 
        : `http://localhost:5000/api/billing/expenses`;
      
      const body = {
        ...item,
        user_id: user.id,
        trip_id: selectedTripId
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        const savedItem = await response.json();
        const updatedExpenses = [...expenses];
        updatedExpenses[index] = savedItem;
        setExpenses(updatedExpenses);
        setSaveStatus('All changes saved');
        setTimeout(() => setSaveStatus(''), 2000);
      }
    } catch (err) {
      setSaveStatus('Error saving');
    }
  };

  const addRow = () => {
    setExpenses([...expenses, { category: '', description: '', quantity_details: '', unit_cost: 0, total_amount: 0, isNew: true }]);
  };

  const deleteRow = async (index) => {
    const item = expenses[index];
    if (item.id) {
      try {
        await fetch(`http://localhost:5000/api/billing/expenses/${item.id}`, { method: 'DELETE' });
      } catch (err) {
        console.error("Delete failed", err);
      }
    }
    const updatedExpenses = expenses.filter((_, i) => i !== index);
    setExpenses(updatedExpenses.length > 0 ? updatedExpenses : [{ category: '', description: '', quantity_details: '', unit_cost: 0, total_amount: 0, isNew: true }]);
  };

  const totalSpent = expenses.reduce((sum, item) => sum + (parseFloat(item.total_amount) || 0), 0);
  const remainingBudget = itineraryBudget - totalSpent;

  const handleMarkAsPaid = async () => {
    if (tripStatus === 'Paid') return;
    
    try {
      // For simplicity, we'll update the trip status to 'Paid'
      // Ideally, you'd have a separate field for payment status
      const response = await fetch(`http://localhost:5000/api/trips/${selectedTripId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Paid' })
      });

      if (response.ok) {
        setTripStatus('Paid');
        // Update local trips list to keep it in sync
        setTrips(trips.map(t => t.id == selectedTripId ? { ...t, status: 'Paid' } : t));
        alert('Trip expenses marked as Paid!');
      }
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const generatePDF = (type) => {
    try {
      const doc = new jsPDF();
      const trip = trips.find(t => t.id == selectedTripId);
      
      if (!trip) {
        alert("Please select a trip first.");
        return;
      }

      // Branded Header
      doc.setFontSize(22);
      doc.setTextColor(139, 92, 246); // Accent Purple
      doc.text('TRAVELOOP', 14, 20);
      
      doc.setFontSize(16);
      doc.setTextColor(40, 40, 40);
      doc.text(type === 'invoice' ? 'Expense Invoice' : 'Expense Report', 14, 32);
      
      // Trip Details
      doc.setFontSize(11);
      doc.setTextColor(80, 80, 80);
      doc.text(`Trip: ${trip.destination || 'Unnamed Trip'}`, 14, 45);
      doc.text(`User: ${user?.first_name || ''} ${user?.last_name || ''}`, 14, 52);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 59);
      doc.text(`Status: ${tripStatus || 'Planned'}`, 140, 45);
      
      // Summary Box (Visual placeholder)
      doc.setDrawColor(230, 230, 230);
      doc.rect(14, 65, 182, 30);
      
      doc.setFontSize(12);
      doc.setTextColor(40, 40, 40);
      doc.text(`Planned Budget: INR ${(itineraryBudget || 0).toLocaleString()}`, 20, 75);
      doc.text(`Total Spent: INR ${(totalSpent || 0).toLocaleString()}`, 20, 82);
      doc.text(`Remaining Balance: INR ${(remainingBudget || 0).toLocaleString()}`, 20, 89);

      // Table Generation
      const tableData = expenses
        .filter(e => e.category || e.description)
        .map(e => [
          e.category || '', 
          e.description || '', 
          e.quantity_details || '', 
          `INR ${parseFloat(e.unit_cost || 0).toLocaleString()}`, 
          `INR ${parseFloat(e.total_amount || 0).toLocaleString()}`
        ]);

      if (tableData.length === 0) {
        doc.text("No expense data recorded for this trip.", 14, 110);
      } else {
        doc.autoTable({
          startY: 105,
          head: [['Category', 'Description', 'Qty/Details', 'Unit Cost', 'Final Amount']],
          body: tableData,
          theme: 'striped',
          headStyles: { fillColor: [139, 92, 246] },
          margin: { left: 14, right: 14 }
        });
      }

      // Final Footer
      const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : 120;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`Grand Total: INR ${(totalSpent || 0).toLocaleString()}`, 140, finalY + 20);

      const fileName = `${type}_${(trip?.destination || 'trip').replace(/\s+/g, '_')}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error("PDF Generation error:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  return (
    <div className="dash-wrapper">
      <div className="bg-shape-yellow"></div>
      <div className="bg-shape-blue-square"></div>
      <div className="bg-shape-pink-blob"></div>
      <div className="bg-shape-purple-circle"></div>
      <div className="bg-shape-green-blob"></div>

      <Navbar user={user} />

      <div className="dash-container">
        <div className="billing-header">
          <h1>Trip Expense Calculator</h1>
          <p>Track your actual spending against your planned budget.</p>
        </div>

        <div className="trip-selector">
          <label>Select Trip:</label>
          <select value={selectedTripId} onChange={(e) => setSelectedTripId(e.target.value)}>
            {trips.map(trip => (
              <option key={trip.id} value={trip.id}>{trip.destination}</option>
            ))}
          </select>
          {saveStatus && (
            <div className="save-status" style={{marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--accent-green-text)', fontWeight: '600'}}>
              {saveStatus === 'Saving...' && <span className="spin">⏳</span>}
              {saveStatus === 'All changes saved' && <span>✅</span>}
              {saveStatus}
            </div>
          )}
        </div>

        <div className="summary-bar">
          <div className="summary-card">
            <h4>Planned Budget</h4>
            <div className="value">INR {itineraryBudget.toLocaleString()}</div>
          </div>
          <div className="summary-card">
            <h4>Actual Spent</h4>
            <div className="value" style={{ color: totalSpent > itineraryBudget ? '#ef4444' : 'var(--accent-purple)' }}>
              INR {totalSpent.toLocaleString()}
            </div>
          </div>
          <div className="summary-card">
            <h4>Remaining</h4>
            <div className="value" style={{ color: remainingBudget < 0 ? '#ef4444' : '#10b981' }}>
              INR {remainingBudget.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="expense-sheet-card">
          <table className="expense-table">
            <thead>
              <tr>
                <th style={{ width: '15%' }}>Category</th>
                <th style={{ width: '35%' }}>Description</th>
                <th style={{ width: '15%' }}>Qty / Details</th>
                <th style={{ width: '15%' }}>Unit Cost</th>
                <th style={{ width: '15%' }}>Final Amount</th>
                <th style={{ width: '5%' }}></th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((item, index) => (
                <tr key={item.id || index}>
                  <td>
                    <input 
                      className="expense-input"
                      placeholder="e.g. Food"
                      value={item.category}
                      onChange={(e) => handleInputChange(index, 'category', e.target.value)}
                    />
                  </td>
                  <td>
                    <input 
                      className="expense-input"
                      placeholder="Item details..."
                      value={item.description}
                      onChange={(e) => handleInputChange(index, 'description', e.target.value)}
                    />
                  </td>
                  <td>
                    <input 
                      className="expense-input"
                      placeholder="1"
                      value={item.quantity_details}
                      onChange={(e) => handleInputChange(index, 'quantity_details', e.target.value)}
                    />
                  </td>
                  <td>
                    <input 
                      className="expense-input"
                      type="number"
                      placeholder="0.00"
                      value={item.unit_cost}
                      onChange={(e) => handleInputChange(index, 'unit_cost', e.target.value)}
                    />
                  </td>
                  <td>
                    <div className="expense-input" style={{ fontWeight: 'bold' }}>
                      INR {(parseFloat(item.total_amount) || 0).toLocaleString()}
                    </div>
                  </td>
                  <td>
                    <button className="delete-row-btn" onClick={() => deleteRow(index)} title="Delete row">
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="add-row-btn" onClick={addRow}>
            <span>+</span> Add Item
          </button>
        </div>

        <div className="expense-footer-actions">
          <div className="export-buttons">
            <button className="export-btn" onClick={() => generatePDF('invoice')}>
              📥 Download Invoice
            </button>
            <button className="export-btn" onClick={() => generatePDF('report')}>
              📄 Export as PDF
            </button>
          </div>
          <button 
            className={`mark-paid-btn ${tripStatus === 'Paid' ? 'is-paid' : ''}`}
            onClick={handleMarkAsPaid}
          >
            {tripStatus === 'Paid' ? '✓ Paid' : 'Mark as Paid'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Billing;
