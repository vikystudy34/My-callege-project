const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 1. MySQL Connection Setup
const db = mysql.createConnection({
    host: '127.0.0.1', // localhost ki jagah ye try kar
    user: 'root',
    password: 'Vickypatel@120',
    database: 'inventory_db',
    port: 3306
});

// 2. connect to database
db.connect((err) => {
    if (err) {
        console.log("Database Connection Failed!", err);
    } else {
        console.log("MySQL Connected Successfully! ✅");
    }
});

// 3. Basic Route Setup
app.get('/api/test', (req, res) => {
    res.send("Backend Server is Working!");
});

// Get all products from Database
app.get('/api/products', (req, res) => {
    const sql = "SELECT * FROM products";
    db.query(sql, (err, data) => {
        if (err) {
            console.error("SQL Error:", err); // Ye terminal mein error dikhayega
            return res.status(500).json({ error: err.message });
        }
        console.log("Data fetched from DB:", data);
        return res.json(data);
    });
});

// Naya product add karne ke liye
app.post('/api/add', (req, res) => {
    const { name, category, price, stock } = req.body;
    const sql = "INSERT INTO products (name, category, price, stock_quantity) VALUES (?, ?, ?, ?)";
    
    db.query(sql, [name, category, price, stock], (err, result) => {
        if (err) {
            console.error("Insert Error:", err);
            return res.status(500).json({ error: err.message });
        }
        return res.json({ message: "Product Added Successfully!", id: result.insertId });
    });
});

app.delete('/api/delete/:id', (req, res) => {
    const id = req.params.id;
    const sql = "DELETE FROM products WHERE id = ?";
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json(err);
        return res.json({ message: "Deleted Successfully" });
    });
});

// 4. server Start 
app.listen(5000, () => {
    console.log("Server is running on port 5000");
});