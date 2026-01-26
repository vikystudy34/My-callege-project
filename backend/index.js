const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = "vicky_secret_key_123"; // Use environment variable in production

// --- 1. MIDDLEWARE SETUP ---
// Professional English Comments for College Submission
app.use(express.json());

// CORS Configuration: Essential for Mobile and External API Access
app.use(cors({
    origin: "*", 
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

// --- 2. DATABASE CONNECTION ---
mongoose.connect('mongodb://localhost:27017/inventoryDB') // Update with Mongo Atlas URI for Render
    .then(() => console.log("✅ Database Connected Successfully"))
    .catch(err => console.log("❌ DB Connection Error:", err));

// --- 3. SCHEMAS & MODELS ---

// User Schema for Authentication
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

// Password Hashing Middleware
userSchema.pre('save', async function() {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
});

const User = mongoose.model('User', userSchema);

// Product Schema
const productSchema = new mongoose.Schema({
    name: String,
    price: Number,
    stock_quantity: Number
});
const Product = mongoose.model('Product', productSchema);

// Sales Schema
const saleSchema = new mongoose.Schema({
    productName: String,
    quantitySold: Number,
    totalAmount: Number,
    saleDate: { type: Date, default: Date.now }
});
const Sale = mongoose.model('Sale', saleSchema);

// --- 4. AUTHENTICATION ROUTES ---

// Admin/Staff Registration
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "User already exists" });

        user = new User({ name, email, password });
        await user.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server error during registration", error: err.message });
    }
});

// Admin/Staff Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid Credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid Credentials" });

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
    } catch (err) {
        res.status(500).json({ message: "Login error", error: err.message });
    }
});

// --- 5. INVENTORY & SALES ROUTES ---

// Get all products
app.get('/api/products', async (req, res) => {
    const products = await Product.find();
    res.json(products);
});

// Add new product
app.post('/api/add', async (req, res) => {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.json(newProduct);
});

// Update product
app.put('/api/update/:id', async (req, res) => {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedProduct);
});

// Delete product
app.delete('/api/delete/:id', async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
});

// Get sales summary
app.get('/api/sales-summary', async (req, res) => {
    const sales = await Sale.find().sort({ saleDate: -1 });
    res.json(sales);
});

// --- 6. SERVER INITIALIZATION ---
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});