const express = require('express');
const swaggerDocs = require('./swagger'); // Swagger docs
const connectDB = require('./config/db');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();

// Enable CORS
// app.use(cors()); 

// Initialize Swagger docs
swaggerDocs(app);

// Connect to the database
connectDB();

// Middleware for parsing JSON
app.use(cookieParser());
app.use(express.json());

// Routes
app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/blogs', require('./routes/blogRoutes'));
// app.use('/api/recommend', require('./routes/recommendRoutes'));

// Test Route
app.get('/test', (req, res) => {
    res.send('API working');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    // console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});
