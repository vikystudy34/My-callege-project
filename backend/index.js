const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// --- MONGODB CONNECTION ---
const mongoURI = "mongodb+srv://vicky_admin:Vicky12345@cluster0.ucrdwzw.mongodb.net/inventory_db?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(mongoURI)
    .then(() => console.log("✅ Database Connected: Vicky's Inventory"))
    .catch((err) => console.error("❌ DB Connection Error:", err));

// --- MODELS ---
const Product = mongoose.model('Product', new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    stock_quantity: { type: Number, required: true },
    updatedAt: { type: Date, default: Date.now }
}));

const Sale = mongoose.model('Sale', new mongoose.Schema({
    productName: String,
    quantitySold: Number,
    totalAmount: Number,
    saleDate: { type: Date, default: Date.now }
}));

// --- ROUTES ---

// 1. Get All Products
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find().sort({ updatedAt: -1 });
        res.json(products);
    } catch (err) { res.status(500).json(err); }
});

// 2. Add Product
app.post('/api/add', async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.status(201).json({ message: "Added!" });
    } catch (err) { res.status(400).json(err); }
});

// 3. Update Product (Fix: Edit Logic)
app.put('/api/update/:id', async (req, res) => {
    try {
        // Sirf wahi data update hoga jo body mein hai
        const updated = await Product.findByIdAndUpdate(
            req.params.id, 
            { $set: req.body }, 
            { new: true }
        );
        if (!updated) return res.status(404).json({ message: "Not found" });
        res.json(updated);
    } catch (err) { 
        console.error("Update Error:", err);
        res.status(500).json({ error: err.message }); 
    }
});

// 4. Delete Product
app.delete('/api/delete/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted!" });
    } catch (err) { res.status(500).json(err); }
});

// 5. Sales Summary
app.get('/api/sales-summary', async (req, res) => {
    try {
        const sales = await Sale.find().sort({ saleDate: -1 });
        res.json(sales);
    } catch (err) { res.status(500).json(err); }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server on http://localhost:${PORT}`));