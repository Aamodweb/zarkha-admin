const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');
const { exec } = require('child_process');
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

app.post('/webhook', (req, res) => {
  console.log('GitHub webhook received! Starting deployment...');

  // Immediately respond to GitHub to avoid 502
  res.status(200).send('Deployment started');

  // Then run the script AFTER response
  exec('/var/www/zarkha/admin/deploy.sh', (error, stdout, stderr) => {
    if (error) {
      console.error('Deploy script error:', error);
      return;
    }
    console.log('Deploy script output:', stdout);
    if (stderr) console.error(stderr);
  });
});

// Start server
app.listen(3005, () => console.log('Server started on http://127.0.0.1:3005'));
