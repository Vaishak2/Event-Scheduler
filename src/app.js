// App.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const eventRoutes = require('./routes/eventRoutes');
const app = express();

require('dotenv').config();

// Connecting to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://vaishakvaishak3:mongo1234@cluster0.1nq9m.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0~', 
  { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Rate limiter middleware for the POST endpoint
const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: 'Too many requests from this IP, please try again after an hour',
});
// Use routes
app.use('/', eventRoutes); // Event routes

app.use('/api/events', apiLimiter);
// ___________________________________________________________________________
//Server Connection
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
