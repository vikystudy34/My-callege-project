const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// --- 1. MIDDLEWARE CONFIGURATION ---
app.use(express.json());

// Enhanced CORS to allow access from Mobile and Render Frontend
app.use(cors({
    origin: "*", 
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

// --- 2. DATABASE CONNECTION (MongoDB Atlas) ---
const mongoURI = "mongodb+srv://vicky_admin:Vicky12345@cluster0.ucrdwzw.mongodb.net/inventory_db?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(mongoURI)
    .then(() => console.log("✅ Database Connected: Inventory Management System"))
    .catch((err) => console.error("❌ DB Connection Error:", err));

// --- 3. DATA MODELS ---

// Product Schema for Inventory Items
const Product = mongoose.model('Product', new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    stock_quantity: { type: Number, required: true },
    updatedAt: { type: Date, default: Date.now }
}));

// Sale Schema for Transaction Records
const Sale = mongoose.model('Sale', new mongoose.Schema({
    productName: String,
    quantitySold: Number,
    totalAmount: Number,
    saleDate: { type: Date, default: Date.now }
}));

// User Schema for Authentication & Security
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

// Hash password before saving to the database
userSchema.pre('save', async function() {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
});

const User = mongoose.model('User', userSchema);

// --- 4. API ROUTES ---

// A. AUTHENTICATION ENDPOINTS

// User Registration Route
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "User already exists" });

        user = new User({ name, email, password });
        await user.save();
        res.status(201).json({ message: "Registration successful" });
    } catch (err) {
        res.status(500).json({ message: "Registration error", error: err.message });
    }
});

// User Login Route with JWT Generation
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid email or password" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

        const token = jwt.sign({ id: user._id }, "vicky_secret_key_123", { expiresIn: '24h' });

        res.json({
            token,
            user: { id: user._id, name: user.name, email: user.email }
        });
    } catch (err) {
        res.status(500).json({ message: "Login server error" });
    }
});

// B. INVENTORY MANAGEMENT ENDPOINTS

// Fetch all products
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find().sort({ updatedAt: -1 });
        res.json(products);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// Create new product entry
app.post('/api/add', async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (err) { res.status(400).json({ message: err.message }); }
});

// Update existing product by ID
app.put('/api/update/:id', async (req, res) => {
    try {
        const updated = await Product.findByIdAndUpdate(
            req.params.id, 
            { $set: req.body }, 
            { new: true }
        );
        if (!updated) return res.status(404).json({ message: "Product not found" });
        res.json(updated);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// Delete product by ID
app.delete('/api/delete/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: "Product deleted" });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// C. SALES ANALYTICS ENDPOINTS

// Fetch sales summary history
app.get('/api/sales-summary', async (req, res) => {
    try {
        const sales = await Sale.find().sort({ saleDate: -1 });
        res.json(sales);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// --- 5. SERVER INITIALIZATION ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));