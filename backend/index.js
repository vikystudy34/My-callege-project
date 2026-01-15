const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// MySQL Connection Setup
const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'Vickypatel@120',
    database: 'inventory_db',
    port: 3306
});

db.connect((err) => {
    if (err) {
        console.error("❌ Database Connection Failed:", err.message);
    } else {
        console.log("✅ MySQL Connected Successfully!");
    }
});

// --- ROUTES ---

// 1. Get All Products
app.get('/api/products', (req, res) => {
    const sql = "SELECT * FROM products ORDER BY id DESC";
    db.query(sql, (err, data) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(data);
    });
});

// 2. Add New Product
app.post('/api/add', (req, res) => {
    const { name, category, price, stock_quantity } = req.body;
    if (!name || !price || !stock_quantity) {
        return res.status(400).json({ error: "All fields are required" });
    }
    const sql = "INSERT INTO products (name, category, price, stock_quantity) VALUES (?, ?, ?, ?)";
    db.query(sql, [name, category, price, stock_quantity], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Product Added Successfully!" });
    });
});

// 3. Update Product (Edit/Save Functionality)
app.put('/api/update/:id', (req, res) => {
    const { id } = req.params;
    const { name, category, price, stock_quantity } = req.body;
    const sql = "UPDATE products SET name=?, category=?, price=?, stock_quantity=? WHERE id=?";
    db.query(sql, [name, category, price, stock_quantity, id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Product Updated Successfully!" });
    });
});

// 4. Delete Product
app.delete('/api/delete/:id', (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM products WHERE id = ?";
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Product Deleted!" });
    });
});

// 5. Get Sales Records
app.get('/api/sales', (req, res) => {
    const sql = "SELECT * FROM sales ORDER BY sale_date DESC";
    db.query(sql, (err, data) => {
        if (err) return res.json([]);
        res.json(data);
    });
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});