import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Inventory.css';

// Yahan maine tera backend link fix kar diya hai
const API_BASE_URL = "https://vicky-inventory-backend.onrender.com/api";

function App() {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [view, setView] = useState('inventory');
  const [formData, setFormData] = useState({ name: '', price: '', stock_quantity: '' });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  
  const [editId, setEditId] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', price: '', stock_quantity: '' });

  const fetchData = async () => {
    try {
      // Localhost ki jagah ab ye Render se data layega
      const res = await axios.get(`${API_BASE_URL}/products`);
      setProducts(res.data);
      const saleRes = await axios.get(`${API_BASE_URL}/sales-summary`);
      setSales(saleRes.data);
    } catch (err) { console.error("Data fetch nahi ho raha:", err); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAdd = (e) => {
    e.preventDefault();
    axios.post(`${API_BASE_URL}/add`, formData).then(() => {
      alert("Product Added!"); fetchData(); setView('inventory');
      setFormData({ name: '', price: '', stock_quantity: '' });
    });
  };

  const handleEditClick = (p) => {
    setEditId(p._id);
    setEditFormData({ name: p.name, price: p.price, stock_quantity: p.stock_quantity });
  };

  const handleUpdate = (id) => {
    axios.put(`${API_BASE_URL}/update/${id}`, editFormData).then(() => {
      alert("Updated Successfully!");
      setEditId(null);
      fetchData();
    }).catch(err => console.error(err));
  };

  const totalInventoryValue = products.reduce((acc, p) => acc + (p.price * p.stock_quantity), 0);
  const totalSalesRevenue = sales.reduce((acc, s) => acc + s.totalAmount, 0);

  return (
    <div className="container-fluid mt-4 px-4">
      <div className="d-flex align-items-center mb-5">
        <button className="btn btn-dark shadow-sm" onClick={() => setIsSidebarOpen(true)}>☰</button>
        <h2 className="fw-bold text-uppercase m-0 ms-4 text-primary">Vicky's Inventory</h2>
      </div>

      {isSidebarOpen && (
        <>
          <div className="sidebar-backdrop" onClick={() => setIsSidebarOpen(false)}></div>
          <div className="sidebar-overlay">
            <div className="sidebar-header p-3 bg-dark text-white d-flex justify-content-between">
               <span>MENU</span>
               <button className="btn text-white" onClick={() => setIsSidebarOpen(false)}>×</button>
            </div>
            <div className="sidebar-item p-3 border-bottom" onClick={() => {setView('inventory'); setIsSidebarOpen(false);}}>📊 Dashboard</div>
            <div className="sidebar-item p-3 border-bottom" onClick={() => {setView('add'); setIsSidebarOpen(false);}}>➕ Add Product</div>
            <div className="sidebar-item p-3 border-bottom" onClick={() => {setView('sales'); setIsSidebarOpen(false);}}>💰 Sales Summary</div>
            <div className="sidebar-item p-3 border-bottom" onClick={() => {setShowHelp(true); setIsSidebarOpen(false);}}>📞 Help Desk</div>
          </div>
        </>
      )}

      <div className="row mb-5 g-4 text-center">
        <div className="col-md-4"><div className="card p-4 shadow-sm border-0"><h6>TOTAL ITEMS</h6><h2>{products.length}</h2></div></div>
        <div className="col-md-4"><div className="card p-4 shadow-sm border-0 bg-primary text-white"><h6>STOCK VALUE</h6><h2>₹{totalInventoryValue.toLocaleString()}</h2></div></div>
        <div className="col-md-4"><div className="card p-4 shadow-sm border-0 bg-success text-white"><h6>TOTAL SALES</h6><h2>₹{totalSalesRevenue.toLocaleString()}</h2></div></div>
      </div>

      <div className="content-area">
        {view === 'inventory' && (
          <div className="card shadow-sm border-0">
            <div className="card-header bg-dark text-white fw-bold">CURRENT STOCK</div>
            <table className="table table-hover text-center align-middle mb-0">
              <thead className="table-light">
                <tr><th>Name</th><th>Price</th><th>Stock</th><th>Action</th></tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p._id} className={p.stock_quantity < 10 ? "table-danger" : ""}>
                    {editId === p._id ? (
                      <>
                        <td><input type="text" className="form-control form-control-sm" value={editFormData.name} onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} /></td>
                        <td><input type="number" className="form-control form-control-sm" value={editFormData.price} onChange={(e) => setEditFormData({...editFormData, price: e.target.value})} /></td>
                        <td><input type="number" className="form-control form-control-sm" value={editFormData.stock_quantity} onChange={(e) => setEditFormData({...editFormData, stock_quantity: e.target.value})} /></td>
                        <td>
                          <button className="btn btn-success btn-sm me-2" onClick={() => handleUpdate(p._id)}>Save</button>
                          <button className="btn btn-secondary btn-sm" onClick={() => setEditId(null)}>Cancel</button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="fw-bold">{p.name}</td>
                        <td>₹{p.price}</td>
                        <td>{p.stock_quantity}</td>
                        <td>
                          <button className="btn btn-warning btn-sm me-2" onClick={() => handleEditClick(p)}>Edit</button>
                          <button className="btn btn-outline-danger btn-sm" onClick={() => axios.delete(`${API_BASE_URL}/delete/${p._id}`).then(()=>fetchData())}>Delete</button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {view === 'sales' && (
          <div className="card shadow-sm border-0 fade-in">
            <div className="card-header bg-success text-white fw-bold">SALES REPORT</div>
            <table className="table table-hover text-center align-middle mb-0">
              <thead className="table-light">
                <tr><th>Date</th><th>Product</th><th>Qty Sold</th><th>Total Revenue</th></tr>
              </thead>
              <tbody>
                {sales.length > 0 ? sales.map(s => (
                  <tr key={s._id}>
                    <td>{new Date(s.saleDate).toLocaleDateString()}</td>
                    <td className="fw-bold">{s.productName}</td>
                    <td>{s.quantitySold}</td>
                    <td className="text-success fw-bold">₹{s.totalAmount}</td>
                  </tr>
                )) : <tr><td colSpan="4">No sales recorded yet!</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {view === 'add' && (
          <div className="card p-5 shadow border-0 mx-auto" style={{maxWidth: '500px'}}>
            <h3 className="text-success mb-4">New Entry</h3>
            <form onSubmit={handleAdd}>
              <input className="form-control mb-3" placeholder="Item Name" onChange={e => setFormData({...formData, name: e.target.value})} />
              <input className="form-control mb-3" type="number" placeholder="Price" onChange={e => setFormData({...formData, price: e.target.value})} />
              <input className="form-control mb-3" type="number" placeholder="Qty" onChange={e => setFormData({...formData, stock_quantity: e.target.value})} />
              <button className="btn btn-success w-100 py-3 fw-bold">SAVE ITEM</button>
            </form>
          </div>
        )}
      </div>

      {showHelp && (
        <div className="help-overlay" onClick={() => setShowHelp(false)}>
          <div className="help-modal p-4 bg-white rounded shadow-lg text-center">
            <h3>Support Desk</h3>
            <p>vikystudy34@gmail.com | 9334681651</p>
            <hr/>
            <p className="small">11am-1pm: Kaam chalu | 1pm-4pm: Sona mana hai | 4pm-6pm: Chai peelo</p>
            <button className="btn btn-primary w-100" onClick={() => setShowHelp(false)}>THIK HAI</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;