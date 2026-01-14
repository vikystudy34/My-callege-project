import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Inventory.css';

/**
 * Enterprise Inventory Management System - React Frontend
 * Developed for University Project Submission
 */
function App() {
  // State variables for Data Management
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [view, setView] = useState('inventory');
  const [formData, setFormData] = useState({ name: '', category: '', price: '', stock: '' });

  // State variables for UI Components
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Function to fetch data from Node.js Backend API
  const fetchData = async () => {
    try {
      const prodRes = await axios.get('http://localhost:5000/api/products');
      const salesRes = await axios.get('http://localhost:5000/api/sales');
      setProducts(prodRes.data);
      setSales(salesRes.data);
    } catch (err) {
      console.error("Data Fetching Error:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Event Handler: Create New Product
  const handleAddProduct = (e) => {
    e.preventDefault();
    axios.post('http://localhost:5000/api/add', formData)
      .then(() => {
        alert("Transaction successful: Item added to database.");
        fetchData();
        setFormData({ name: '', category: '', price: '', stock: '' });
        setView('inventory');
      })
      .catch(err => console.error("API POST Error:", err));
  };

  // Event Handler: Remove Product
  const handleDelete = (id) => {
    if (window.confirm("Confirm Action: Permanently delete this record?")) {
      axios.delete(`http://localhost:5000/api/delete/${id}`)
        .then(() => fetchData())
        .catch(err => console.error("API DELETE Error:", err));
    }
  };

  // Statistical Logic for Dashboard Overview
  const totalItems = products.length;
  const totalStockVolume = products.reduce((acc, p) => acc + Number(p.stock_quantity), 0);
  const criticalStockCount = products.filter(p => p.stock_quantity < 5).length;

  return (
    <div className="container mt-4">
      
      {/* Sidebar Trigger Button */}
      <div className="menu-trigger">
        <button className="btn btn-dark shadow-sm" onClick={() => setIsSidebarOpen(true)}>
          ☰ MENU
        </button>
      </div>

      {/* Full-Height Sidebar Navigation */}
      {isSidebarOpen && (
        <>
          <div className="sidebar-backdrop" onClick={() => setIsSidebarOpen(false)}></div>
          <div className="sidebar-overlay fade-in">
            <button className="close-sidebar" onClick={() => setIsSidebarOpen(false)}>×</button>
            <div className="sidebar-header">NAVIGATE</div>
            <div className="sidebar-item" onClick={() => { setView('inventory'); setIsSidebarOpen(false); }}>📊 Dashboard Home</div>
            <div className="sidebar-item" onClick={() => { setView('add'); setIsSidebarOpen(false); }}>➕ Add New Product</div>
            <div className="sidebar-item" onClick={() => { setView('sales'); setIsSidebarOpen(false); }}>📑 Sales Records</div>
            <div className="sidebar-item" onClick={() => { setShowHelp(true); setIsSidebarOpen(false); }}>📧 Help & Support</div>
            <div className="mt-auto p-4 small text-muted">Version 1.0.5 Deployment</div>
          </div>
        </>
      )}

      {/* Support Center Modal */}
      {showHelp && (
        <div className="help-overlay" onClick={() => setShowHelp(false)}>
          <div className="help-modal shadow-lg fade-in" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-primary fw-bold mb-4">Technical Support</h2>
            <p className="text-muted mb-4">For documentation or system errors, contact developer:</p>
            <div className="p-3 bg-light rounded text-start mb-3">
              <strong>Email:</strong> vickykumar38054@gmail.com
            </div>
            <div className="p-3 bg-light rounded text-start mb-4">
              <strong>Phone:</strong> +91 9334681651
            </div>
            <button className="btn btn-primary w-100" onClick={() => setShowHelp(false)}>CLOSE</button>
          </div>
        </div>
      )}

      <h1 className="text-center main-title mb-5 fw-bold text-uppercase">Inventory Management</h1>

      {/* Statistical Overview Cards */}
      <div className="row mb-5">
        <div className="col-md-4">
          <div className="card custom-card p-4 text-center">
            <h6 className="text-muted">TOTAL SKUs</h6>
            <h2 className="fw-bold m-0">{totalItems}</h2>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card custom-card p-4 text-center border-top border-primary border-4">
            <h6 className="text-muted">TOTAL STOCK UNITS</h6>
            <h2 className="fw-bold m-0 text-primary">{totalStockVolume}</h2>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card custom-card p-4 text-center border-top border-danger border-4">
            <h6 className="text-muted text-danger">LOW STOCK ALERTS</h6>
            <h2 className="fw-bold m-0 text-danger">{criticalStockCount}</h2>
          </div>
        </div>
      </div>

      <hr className="mb-5 opacity-25" />

      {/* Primary Dynamic Content Area */}
      <div className="content-area">
        
        {/* INVENTORY TABLE VIEW */}
        {view === 'inventory' && (
          <div className="card custom-card shadow-sm fade-in overflow-hidden">
            <div className="bg-dark text-white p-3 fw-bold">Active Inventory Records</div>
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-uppercase small fw-bold">
                <tr>
                  <th>ID</th><th>Description</th><th>Category</th><th>Price</th><th>Stock</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} style={p.stock_quantity < 5 ? {backgroundColor: '#fff5f5'} : {}}>
                    <td className="fw-bold text-muted">#{p.id}</td>
                    <td>{p.name} {p.stock_quantity < 5 && <span className="badge bg-danger ms-2">LOW</span>}</td>
                    <td>{p.category}</td>
                    <td className="fw-bold">₹{p.price}</td>
                    <td>{p.stock_quantity}</td>
                    <td><button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(p.id)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ADD PRODUCT VIEW */}
        {view === 'add' && (
          <div className="card custom-card p-5 mx-auto fade-in shadow border-0" style={{ maxWidth: '650px' }}>
            <h3 className="text-success fw-bold mb-4">Register New Item</h3>
            <form onSubmit={handleAddProduct}>
              <div className="mb-3">
                <label className="fw-bold">Item Name</label>
                <input type="text" className="form-control" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="mb-3">
                <label className="fw-bold">Category</label>
                <input type="text" className="form-control" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="fw-bold">Price (₹)</label>
                  <input type="number" className="form-control" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="fw-bold">Initial Units</label>
                  <input type="number" className="form-control" required value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
                </div>
              </div>
              <button type="submit" className="btn btn-success w-100 py-3 mt-4 fw-bold">SAVE TO SYSTEM</button>
            </form>
          </div>
        )}

        {/* SALES HISTORY VIEW */}
        {view === 'sales' && (
          <div className="card custom-card shadow-sm fade-in overflow-hidden">
            <div className="bg-warning p-3 fw-bold">Audit Logs: Financial Transactions</div>
            <table className="table table-striped align-middle mb-0">
              <thead>
                <tr><th>Ref ID</th><th>Product</th><th>Quantity</th><th>Revenue</th><th>Date</th></tr>
              </thead>
              <tbody>
                {sales.length > 0 ? sales.map(s => (
                  <tr key={s.id}>
                    <td>#{s.id}</td><td>{s.product_name}</td><td>{s.quantity}</td>
                    <td className="text-success fw-bold">₹{s.total_price}</td>
                    <td className="text-muted small">{new Date(s.sale_date).toLocaleString()}</td>
                  </tr>
                )) : <tr><td colSpan="5" className="text-center p-5 text-muted">No sales data recorded.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;