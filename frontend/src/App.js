import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Inventory.css';

function App() {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [view, setView] = useState('inventory');
  
  // Sidebar & Help States
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Form States
  const [formData, setFormData] = useState({ name: '', category: '', price: '', stock_quantity: '' });
  const [editId, setEditId] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', category: '', price: '', stock_quantity: '' });

  const fetchData = async () => {
    try {
      const prodRes = await axios.get('http://localhost:5000/api/products');
      const salesRes = await axios.get('http://localhost:5000/api/sales');
      setProducts(prodRes.data);
      setSales(salesRes.data);
    } catch (err) {
      console.error("Data Fetch Error:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ADD Product logic
  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.stock_quantity) {
      alert("⚠️ Error: Name, Price, and Quantity are mandatory!");
      return;
    }
    axios.post('http://localhost:5000/api/add', formData)
      .then(() => {
        alert("Product added successfully!");
        fetchData();
        setFormData({ name: '', category: '', price: '', stock_quantity: '' });
        setView('inventory');
      }).catch(err => console.error(err));
  };

  // SAVE (Update) logic
  const handleUpdate = (id) => {
    axios.put(`http://localhost:5000/api/update/${id}`, editFormData)
      .then(() => {
        alert("✅ Changes saved successfully!");
        setEditId(null);
        fetchData();
      })
      .catch(err => {
        console.error("Update Error:", err);
        alert("❌ Failed to save changes.");
      });
  };

  // Calculations
  const totalItems = products.length;
  const totalStockVolume = products.reduce((acc, p) => acc + Number(p.stock_quantity || 0), 0);
  const criticalStockCount = products.filter(p => p.stock_quantity < 5).length;

  return (
    <div className="container mt-4">
      {/* ☰ MENU BUTTON */}
      <div className="menu-trigger">
        <button className="btn btn-dark shadow-sm" onClick={() => setIsSidebarOpen(true)}>☰ MENU</button>
      </div>

      {/* SIDEBAR */}
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
          </div>
        </>
      )}

      {/* HELP MODAL */}
      {showHelp && (
        <div className="help-overlay" onClick={() => setShowHelp(false)}>
          <div className="help-modal shadow-lg fade-in" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-primary fw-bold mb-4">Technical Support</h2>
            <p className="p-3 bg-light rounded text-start"><strong>Email:</strong> vickykumar38054@gmail.com</p>
            <button className="btn btn-primary w-100 mt-3" onClick={() => setShowHelp(false)}>CLOSE</button>
          </div>
        </div>
      )}

      <h1 className="text-center main-title mb-5 fw-bold text-uppercase">Inventory Management</h1>

      {/* DASHBOARD CARDS */}
      <div className="row mb-5 text-center">
        <div className="col-md-4"><div className="card custom-card p-4 shadow-sm"><h6>TOTAL ITEMS</h6><h2>{totalItems}</h2></div></div>
        <div className="col-md-4"><div className="card custom-card p-4 shadow-sm border-top border-primary border-4"><h6>TOTAL STOCK</h6><h2 className="text-primary">{totalStockVolume}</h2></div></div>
        <div className="col-md-4"><div className="card custom-card p-4 shadow-sm border-top border-danger border-4"><h6>LOW STOCK</h6><h2 className="text-danger">{criticalStockCount}</h2></div></div>
      </div>

      {/* CONTENT AREA */}
      <div className="content-area">
        {view === 'inventory' && (
          <div className="card shadow-sm fade-in overflow-hidden">
            <div className="bg-dark text-white p-3 fw-bold">ACTIVE STOCK LIST</div>
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small fw-bold text-uppercase">
                <tr>
                  <th>ID</th><th>Description</th><th>Category</th><th>Price</th><th>Stock</th>
                  <th className="text-end" style={{paddingRight: '45px'}}>Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    {editId === p.id ? (
                      <>
                        <td>#{p.id}</td>
                        <td><input className="form-control" value={editFormData.name} onChange={e => setEditFormData({...editFormData, name: e.target.value})} /></td>
                        <td><input className="form-control" value={editFormData.category} onChange={e => setEditFormData({...editFormData, category: e.target.value})} /></td>
                        <td><input className="form-control" type="number" value={editFormData.price} onChange={e => setEditFormData({...editFormData, price: e.target.value})} /></td>
                        <td><input className="form-control" type="number" value={editFormData.stock_quantity} onChange={e => setEditFormData({...editFormData, stock_quantity: e.target.value})} /></td>
                        <td className="text-end" style={{paddingRight: '20px'}}>
                          <button className="btn btn-success btn-sm me-1 shadow-sm" onClick={() => handleUpdate(p.id)}>Save</button>
                          <button className="btn btn-secondary btn-sm shadow-sm" onClick={() => setEditId(null)}>X</button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>#{p.id}</td>
                        <td className="fw-bold">{p.name} {p.stock_quantity < 5 && <span className="badge bg-danger ms-2">LOW</span>}</td>
                        <td>{p.category}</td>
                        <td>₹{p.price}</td>
                        <td>{p.stock_quantity}</td>
                        <td className="text-end" style={{paddingRight: '20px'}}>
                          <button className="btn btn-warning btn-sm me-1 shadow-sm" onClick={() => { setEditId(p.id); setEditFormData(p); }}>Edit</button>
                          <button className="btn btn-outline-danger btn-sm shadow-sm" onClick={() => { if(window.confirm("Delete record?")) axios.delete(`http://localhost:5000/api/delete/${p.id}`).then(()=>fetchData()) }}>Delete</button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {view === 'add' && (
          <div className="card p-5 mx-auto fade-in shadow border-0" style={{ maxWidth: '600px' }}>
            <h3 className="text-success fw-bold mb-4">Register New Item</h3>
            <form onSubmit={handleAddProduct}>
              <div className="mb-3"><label className="fw-bold small">Item Name *</label><input type="text" className="form-control" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
              <div className="mb-3"><label className="fw-bold small">Category</label><input type="text" className="form-control" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} /></div>
              <div className="row">
                <div className="col-md-6 mb-3"><label className="fw-bold small">Price (₹) *</label><input type="number" className="form-control" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} /></div>
                <div className="col-md-6 mb-3"><label className="fw-bold small">Stock Quantity *</label><input type="number" className="form-control" value={formData.stock_quantity} onChange={e => setFormData({...formData, stock_quantity: e.target.value})} /></div>
              </div>
              <button type="submit" className="btn btn-success w-100 py-3 mt-4 fw-bold shadow">SAVE TO DATABASE</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;