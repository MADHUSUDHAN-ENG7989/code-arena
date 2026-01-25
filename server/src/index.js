require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { connectDB } = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const questionRoutes = require('./routes/questions');
const submissionRoutes = require('./routes/submissions');
const challengeRoutes = require('./routes/challenges');
const adminRoutes = require('./routes/admin');

const http = require('http');
const { initSocket } = require('./services/socketService');

const helmet = require('helmet');
const compression = require('compression');
const path = require('path');

// ... (imports)

const app = express();
const server = http.createServer(app);

// Security & Optimization Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            connectSrc: ["'self'", "http://localhost:5000", "ws://localhost:5000", "https://your-production-url.com"], // Adjust as needed
            imgSrc: ["'self'", "data:", "https:", "blob:"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // React/Vite needs this sometimes, refine for strict security
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        },
    },
    crossOriginEmbedderPolicy: false
}));
app.use(compression());

// Connect to database
// Database connection handled in startServer

// Init Socket.io
initSocket(server);

// Middleware
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);

        // Allow any localhost port for development
        if (origin.startsWith('http://localhost:')) {
            return callback(null, true);
        }

        // Allow specific client URL in production (e.g. Vercel)
        if (process.env.CLIENT_URL && origin === process.env.CLIENT_URL) {
            return callback(null, true);
        }

        // Allow same origin (if backend serves frontend)
        if (process.env.NODE_ENV === 'production') {
            return callback(null, true);
        }

        callback(null, true);
    },
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/social', require('./routes/social'));
app.use('/api/notifications', require('./routes/notification'));

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
    // Serve any static files
    app.use(express.static(path.join(__dirname, '../../client/dist')));

    // Handle React routing, return all requests to React app
    app.get(/(.*)/, (req, res) => {
        // Skip API routes
        if (req.path.startsWith('/api')) {
            return res.status(404).json({ message: 'API route not found' });
        }
        res.sendFile(path.resolve(__dirname, '../../client', 'dist', 'index.html'));
    });
}

// Health check

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();
        server.listen(PORT, '0.0.0.0', () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
