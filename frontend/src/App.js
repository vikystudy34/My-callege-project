import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Inventory.css';

const API_BASE_URL = "https://vicky-inventory-system.onrender.com/api";

function App() {
  // --- AUTHENTICATION & NAVIGATION STATES ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [authView, setAuthView] = useState('login');
  const [authData, setAuthData] = useState({ name: '', email: '', password: '' });

  // --- INVENTORY & SEARCH STATES ---
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState('inventory');
  const [formData, setFormData] = useState({ name: '', price: '', stock_quantity: '' });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', price: '', stock_quantity: '' });

  // Check persistent login session on component mount
  // --- Updated useEffect to prevent "undefined" error ---
  useEffect(() => {
    const savedUser = localStorage.getItem('vicky_user');

    // Check if savedUser exists and is NOT the string "undefined"
    if (savedUser && savedUser !== "undefined") {
      try {
        setUser(JSON.parse(savedUser));
        setIsLoggedIn(true);
        fetchData();
      } catch (error) {
        console.error("Error parsing local storage user:", error);
        localStorage.removeItem('vicky_user'); // Clear corrupt data
      }
    }
  }, []);

  // Fetch initial data from Backend API
  const fetchData = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/products`);
      setProducts(res.data);
      const saleRes = await axios.get(`${API_BASE_URL}/sales-summary`);
      setSales(saleRes.data);
    } catch (err) { console.error("API Fetch Error:", err); }
  };

  // --- AUTHENTICATION HANDLERS ---
  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/auth/signup`, authData);
      alert("Registration Successful! Please Login.");
      setAuthView('login');
    } catch (err) { alert(err.response?.data?.message || "Signup Failed"); }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: authData.email,
        password: authData.password
      });
      localStorage.setItem('vicky_token', res.data.token);
      localStorage.setItem('vicky_user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      setIsLoggedIn(true);
      fetchData();
    } catch (err) { alert(err.response?.data?.message || "Login Failed"); }
  };

  const handleLogout = () => {
    localStorage.removeItem('vicky_token');
    localStorage.removeItem('vicky_user');
    setIsLoggedIn(false);
    setUser(null);
  };

  // --- INVENTORY MANAGEMENT HANDLERS ---
  const handleAdd = (e) => {
    e.preventDefault();
    axios.post(`${API_BASE_URL}/add`, formData).then(() => {
      alert("Product Added Successfully!"); fetchData(); setView('inventory');
      setFormData({ name: '', price: '', stock_quantity: '' });
    });
  };

  const handleUpdate = (id) => {
    axios.put(`${API_BASE_URL}/update/${id}`, editFormData)
      .then(() => { alert("Update Successful!"); setEditId(null); fetchData(); })
      .catch(err => alert("Update Failed"));
  };

  // --- FILTER LOGIC FOR SEARCH ---
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Authentication View Rendering
  if (!isLoggedIn) {
    return (
      <div className="container d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="card p-4 shadow-lg border-0" style={{ width: '400px', borderRadius: '15px' }}>
          <h2 className="text-center text-primary fw-bold mb-4">
            {authView === 'login' ? "Admin Login" : "Staff Registration"}
          </h2>
          <form onSubmit={authView === 'login' ? handleLogin : handleSignup}>
            {authView === 'signup' && (
              <div className="mb-3">
                <label className="form-label small fw-bold">Full Name</label>
                <input type="text" className="form-control" required
                  onChange={(e) => setAuthData({ ...authData, name: e.target.value })} />
              </div>
            )}
            <div className="mb-3">
              <label className="form-label small fw-bold">Email Address</label>
              <input type="email" className="form-control" required
                onChange={(e) => setAuthData({ ...authData, email: e.target.value })} />
            </div>
            <div className="mb-4">
              <label className="form-label small fw-bold">Password</label>
              <input type="password" className="form-control" required
                onChange={(e) => setAuthData({ ...authData, password: e.target.value })} />
            </div>
            <button className="btn btn-primary w-100 py-2 fw-bold shadow-sm">
              {authView === 'login' ? "SIGN IN" : "REGISTER NOW"}
            </button>
          </form>
          <div className="text-center mt-3">
            <span className="text-muted small" style={{ cursor: 'pointer', textDecoration: 'underline' }}
              onClick={() => setAuthView(authView === 'login' ? 'signup' : 'login')}>
              {authView === 'login' ? "New User? Register Here" : "Already Registered? Login"}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard Calculation Constants
  const totalInventoryValue = products.reduce((acc, p) => acc + (p.price * p.stock_quantity), 0);
  const totalSalesRevenue = sales.reduce((acc, s) => acc + s.totalAmount, 0);

  return (
    <div className="container-fluid mt-4 px-4">
      {/* Header Navigation Section */}
      <div className="d-flex align-items-center justify-content-between mb-5">
        <div className="d-flex align-items-center">
          <button className="btn btn-dark shadow-sm" onClick={() => setIsSidebarOpen(true)}>☰</button>
          <h2 className="fw-bold text-uppercase m-0 ms-4 text-primary">Inventory Management</h2>
        </div>
        <div className="d-flex align-items-center">
          <span className="me-3 fw-bold border-end pe-3 text-secondary text-uppercase">{user?.name}</span>
          <button className="btn btn-outline-danger btn-sm fw-bold shadow-sm" onClick={handleLogout}>LOGOUT</button>
        </div>
      </div>

      {/* Navigation Sidebar */}
      {isSidebarOpen && (
        <>
          <div className="sidebar-backdrop" onClick={() => setIsSidebarOpen(false)}></div>
          <div className="sidebar-overlay shadow-lg">
            <div className="sidebar-header p-3 bg-dark text-white d-flex justify-content-between align-items-center">
              <span className="fw-bold">MENU PANEL</span>
              <button className="btn text-white fs-4" onClick={() => setIsSidebarOpen(false)}>×</button>
            </div>
            <div className="sidebar-item p-3 border-bottom" onClick={() => { setView('inventory'); setIsSidebarOpen(false); }}>📊 Stock Dashboard</div>
            <div className="sidebar-item p-3 border-bottom" onClick={() => { setView('add'); setIsSidebarOpen(false); }}>➕ New Entry</div>
            <div className="sidebar-item p-3 border-bottom" onClick={() => { setView('sales'); setIsSidebarOpen(false); }}>💰 Sales Analysis</div>
            <div className="sidebar-item p-3 border-bottom text-info" onClick={() => { setShowHelp(true); setIsSidebarOpen(false); }}>📞 Help & Support</div>
          </div>
        </>
      )}

      {/* Dynamic Statistics Cards */}
      <div className="row mb-4 g-4 text-center">
        <div className="col-md-4"><div className="card p-4 shadow-sm border-0"><h6>TOTAL PRODUCTS</h6><h2>{products.length}</h2></div></div>
        <div className="col-md-4"><div className="card p-4 shadow-sm border-0 bg-primary text-white"><h6>INVENTORY VALUE</h6><h2>₹{totalInventoryValue.toLocaleString()}</h2></div></div>
        <div className="col-md-4"><div className="card p-4 shadow-sm border-0 bg-success text-white"><h6>REVENUE GENERATED</h6><h2>₹{totalSalesRevenue.toLocaleString()}</h2></div></div>
      </div>

      {/* Critical Stock Alert Notification */}
      {products.some(p => p.stock_quantity < 5) && (
        <div className="alert alert-danger py-2 mb-4 shadow-sm">
          <strong>⚠️ LOW STOCK WARNING:</strong> Some products require immediate restocking (under 5 units).
        </div>
      )}

      <div className="content-area">
        {/* Main Stock Table View */}
        {view === 'inventory' && (
          <div className="card shadow-sm border-0">
            <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
              <span>INVENTORY RECORDS</span>
              <input
                type="text"
                className="form-control form-control-sm w-25"
                placeholder="Search by Name..."
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="table-responsive">
              <table className="table table-hover text-center align-middle mb-0">
                <thead className="table-light">
                  <tr><th>Product Name</th><th>Unit Price</th><th>Quantity</th><th>Management</th></tr>
                </thead>
                <tbody>
                  {filteredProducts.map(p => (
                    <tr key={p._id} className={p.stock_quantity < 5 ? "table-danger" : ""}>
                      {editId === p._id ? (
                        <>
                          <td><input type="text" className="form-control" value={editFormData.name} onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })} /></td>
                          <td><input type="number" className="form-control" value={editFormData.price} onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })} /></td>
                          <td><input type="number" className="form-control" value={editFormData.stock_quantity} onChange={(e) => setEditFormData({ ...editFormData, stock_quantity: e.target.value })} /></td>
                          <td><button className="btn btn-success btn-sm me-1" onClick={() => handleUpdate(p._id)}>Update</button>
                            <button className="btn btn-secondary btn-sm" onClick={() => setEditId(null)}>Cancel</button></td>
                        </>
                      ) : (
                        <>
                          <td className="fw-bold">{p.name}</td>
                          <td>₹{p.price}</td>
                          <td><span className={`badge ${p.stock_quantity < 5 ? 'bg-danger' : 'bg-info'}`}>{p.stock_quantity}</span></td>
                          <td>
                            <button className="btn btn-warning btn-sm me-2" onClick={() => { setEditId(p._id); setEditFormData(p); }}>Edit</button>
                            <button className="btn btn-outline-danger btn-sm" onClick={() => { if (window.confirm("Confirm deletion?")) axios.delete(`${API_BASE_URL}/delete/${p._id}`).then(() => fetchData()) }}>Delete</button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add Product View */}
        {view === 'add' && (
          <div className="card p-5 shadow border-0 mx-auto" style={{ maxWidth: '500px' }}>
            <h3 className="text-success mb-4 text-center fw-bold">Register New Item</h3>
            <form onSubmit={handleAdd}>
              <div className="mb-3"><input className="form-control py-2" placeholder="Product Name" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /></div>
              <div className="mb-3"><input className="form-control py-2" type="number" placeholder="Price (INR)" required value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} /></div>
              <div className="mb-4"><input className="form-control py-2" type="number" placeholder="Opening Stock" required value={formData.stock_quantity} onChange={e => setFormData({ ...formData, stock_quantity: e.target.value })} /></div>
              <button className="btn btn-success w-100 py-3 fw-bold shadow-sm">COMMIT DATA</button>
            </form>
          </div>
        )}

        {/* Sales Summary View */}
        {view === 'sales' && (
          <div className="card shadow-sm border-0">
            <div className="card-header bg-success text-white fw-bold">SALES ANALYTICS REPORT</div>
            <table className="table table-hover text-center align-middle mb-0">
              <thead className="table-light">
                <tr><th>Date of Sale</th><th>Product</th><th>Quantity</th><th>Total Revenue</th></tr>
              </thead>
              <tbody>
                {sales.map(s => (
                  <tr key={s._id}>
                    <td>{new Date(s.saleDate).toLocaleDateString()}</td>
                    <td className="fw-bold">{s.productName}</td>
                    <td>{s.quantitySold}</td>
                    <td className="text-success fw-bold">₹{s.totalAmount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Professional Support Modal */}
      {showHelp && (
        <div className="help-overlay" onClick={() => setShowHelp(false)}>
          <div className="help-modal p-4 bg-white rounded shadow-lg text-center" onClick={e => e.stopPropagation()}>
            <h3 className="fw-bold text-primary">System Support</h3>
            <p className="mb-1 text-muted">For technical inquiries, contact the administrator:</p>
            <hr />
            <p className="mb-1"><strong>Email:</strong> admin_support@inventory.com</p>
            <p><strong>Support ID:</strong> #9334681651</p>
            <p className="small text-muted mt-3">Inventory Management System - v1.0.0</p>
            <button className="btn btn-primary w-100 mt-3 fw-bold" onClick={() => setShowHelp(false)}>CLOSE</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;