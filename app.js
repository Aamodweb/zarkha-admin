const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');
require('dotenv').config();
const cookieParser = require('cookie-parser');

const app = express();

// MongoDB connect

mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log('MongoDB connected successfully');
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
});

// Optional: Listen for connection errors later on
mongoose.connection.on('error', err => {
  console.error('MongoDB connection error (event):', err);
});



// Middleware
app.use(express.json()); // for JSON
app.use(express.urlencoded({ extended: true })); // for form data

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(session({
  secret: 'secret_key',
  resave: false,
  saveUninitialized: false
}));


app.use(cookieParser()); //Add this line

app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

app.use((req, res, next) => {
  res.locals.currentRoute = req.path;
  res.locals.BASE_URL = process.env.BASE_URL;
  res.locals.ASSET_URL = process.env.ASSET_URL;
  next();
});

// EJS setup
app.set('view engine', 'ejs');

// Routes
const authRoutes = require('./routes/authRoutes');
app.use('/', authRoutes);

// Start server
app.listen(3005, () => console.log('Server started on http://localhost:3005'));
