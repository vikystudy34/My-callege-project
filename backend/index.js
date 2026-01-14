const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// 1. MySQL Connection Setup
const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'Vickypatel@120',
    database: 'inventory_db',
    port: 3306
});

// Connect to Database
db.connect((err) => {
    if (err) {
        console.error("❌ Database Connection Failed! Details:", err.message);
    } else {
        console.log("✅ MySQL Connected Successfully!");
    }
});

// 2. API Routes

// GET: Fetch all products
app.get('/api/products', (req, res) => {
    const sql = "SELECT * FROM products ORDER BY id DESC";
    db.query(sql, (err, data) => {
        if (err) return res.status(500).json({ error: err.message });
        return res.json(data);
    });
});

// POST: Add new product
app.post('/api/add', (req, res) => {
    const { name, category, price, stock_quantity } = req.body;
    const sql = "INSERT INTO products (name, category, price, stock_quantity) VALUES (?, ?, ?, ?)";
    db.query(sql, [name, category, price, stock_quantity], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        return res.json({ message: "Product Added Successfully!" });
    });
});

// DELETE: Remove product
app.delete('/api/delete/:id', (req, res) => {
    const id = req.params.id;
    const sql = "DELETE FROM products WHERE id = ?";
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        return res.json({ message: "Deleted Successfully" });
    });
});

// GET: Sales History
// Isse replace karke dekho (Testing ke liye)
app.get('/api/sales', (req, res) => {
    // Agar sales table nahi hai, toh ye empty array bhej dega fail hone ki jagah
    const sql = "SELECT * FROM sales ORDER BY sale_date DESC";
    db.query(sql, (err, data) => {
        if (err) {
            console.log("Sales table error:", err.message);
            return res.json([]); // Fail hone ke bajaye khali data bhejo
        }
        return res.json(data);
    });
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});