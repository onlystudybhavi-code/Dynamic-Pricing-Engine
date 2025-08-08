const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); // 👈

const productRoutes = require('./routes/productRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use(express.static('public')); 

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

mongoose.connect('mongodb://localhost:27017/dynamic-pricing', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Your API routes
app.use('/api/products', productRoutes);
app.use('/api/analytics', analyticsRoutes);

// Your frontend routes 
const Product = require('./models/Product');
const PriceHistory = require('./models/PriceHistory');

// Homepage → list of products
app.get('/', async (req, res) => {
  const products = await Product.find();
  res.render('index', { products });
});

// Product details with history
app.get('/product/:id', async (req, res) => {
  const product = await Product.findById(req.params.id);
  const history = await PriceHistory.find({ productId: req.params.id }).sort({ timestamp: -1 });
  res.render('product', { product, history });
});

// Analytics view
app.get('/analytics', async (req, res) => {
  const response = await fetch('http://localhost:5000/api/analytics/summary');
  const summary = await response.json();

  const abResponse = await fetch('http://localhost:5000/api/analytics/ab-test');
  const ab = await abResponse.json();

  res.render('analytics', { summary, ab });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
