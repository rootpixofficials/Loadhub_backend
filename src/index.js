import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import homeRoutes from './routes/homeRoutes.js';
import userRoutes from './routes/userRoutes.js';
import vehicleTypeRoutes from './routes/vehicleTypeRoutes.js';
import { connectDB } from './config/db.js';
import { initUserTable } from './models/userModel.js';
import { initVehicleTypeTable } from './models/vehicleTypeModel.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MySQL Database
connectDB().then(() => {
    initUserTable();
    initVehicleTypeTable();
});

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the uploads directory
app.use('/uploads', express.static('uploads'));

// CORS Configuration
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl requests)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
            'https://loadhub.in',
            'http://localhost:5173',
            'http://localhost:3000',
            'capacitor://localhost',
            'ionic://localhost'
        ];
        
        if (allowedOrigins.indexOf(origin) !== -1 || origin.startsWith('file://')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Routes
app.use('/api', homeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vehicle-types', vehicleTypeRoutes);

// Basic route for testing
app.get('/', (req, res) => {
    res.send('Server is running. Use /api route to access the API.');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
