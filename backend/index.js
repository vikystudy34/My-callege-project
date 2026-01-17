const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// --- MONGODB ATLAS CONNECTION ---
const mongoURI = "mongodb+srv://vicky_admin:Vicky12345@cluster0.ucrdwzw.mongodb.net/inventory_db?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(mongoURI)
    .then(() => console.log("✅ Database Connected: Vicky's Inventory System"))
    .catch((err) => console.error("❌ DB Connection Error:", err));

// --- SCHEMAS & MODELS ---

// 1. Product Schema (Maal kitna hai)
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    stock_quantity: { type: Number, required: true },
    updatedAt: { type: Date, default: Date.now }
});
const Product = mongoose.model('Product', productSchema);

// 2. Sales Schema (Kitna bika aur kitna paisa aaya)
const saleSchema = new mongoose.Schema({
    productName: String,
    quantitySold: Number,
    totalAmount: Number,
    saleDate: { type: Date, default: Date.now }
});
const Sale = mongoose.model('Sale', saleSchema);

// --- API ROUTES ---

// A. PRODUCT ROUTES

// 1. Get all products
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find().sort({ updatedAt: -1 });
        res.json(products);
    } catch (err) { res.status(500).json(err); }
});

// 2. Add a new product
app.post('/api/add', async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.status(201).json({ message: "Product Added Successfully!" });
    } catch (err) { res.status(400).json(err); }
});

// 3. Delete a product
app.delete('/api/delete/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: "Product Deleted!" });
    } catch (err) { res.status(500).json(err); }
});

// B. SALES ROUTES

// 4. Record a Sale (Logic: Item becho -> Stock kam karo -> Sale record karo)
app.post('/api/sell', async (req, res) => {
    const { productId, quantitySold } = req.body;
    try {
        const product = await Product.findById(productId);
        
        if (!product) return res.status(404).json({ message: "Product not found" });
        if (product.stock_quantity < quantitySold) {
            return res.status(400).json({ message: "Insufficient Stock!" });
        }

        // 1. Update Inventory (Stock kam karo)
        product.stock_quantity -= quantitySold;
        await product.save();

        // 2. Record Sale (History banao)
        const totalAmount = product.price * quantitySold;
        const newSale = new Sale({
            productName: product.name,
            quantitySold: quantitySold,
            totalAmount: totalAmount
        });
        await newSale.save();

        res.json({ message: "Sale Successful!", totalAmount });
    } catch (err) { res.status(500).json(err); }
});

// 5. Get Sales History (Summary ke liye)
app.get('/api/sales-summary', async (req, res) => {
    try {
        const sales = await Sale.find().sort({ saleDate: -1 });
        res.json(sales);
    } catch (err) { res.status(500).json(err); }
});

// --- SERVER SETUP ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server Running on http://localhost:${PORT}`);
});