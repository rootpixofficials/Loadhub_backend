import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import homeRoutes from './routes/homeRoutes.js';
import userRoutes from './routes/userRoutes.js';
import vehicleTypeRoutes from './routes/vehicleTypeRoutes.js';
import tripRoutes from './routes/tripRoutes.js';
import driverVehicleRoutes from './routes/driverVehicleRoutes.js';
import driverKycRoutes from './routes/driverKycRoutes.js';
import { connectDB } from './config/db.js';
import { initUserTable } from './models/userModel.js';
import { initVehicleTypeTable } from './models/vehicleTypeModel.js';
import { initTripTable } from './models/tripModel.js';
import { initDriverVehicleTable } from './models/driverVehicleModel.js';
import { initDriverKycTable } from './models/driverKycModel.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MySQL Database
connectDB().then(() => {
    initUserTable();
    initVehicleTypeTable();
    initTripTable();
    initDriverVehicleTable();
    initDriverKycTable();
});

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the uploads directory
app.use('/uploads', express.static('uploads'));

// CORS Configuration
const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Routes
app.use('/api', homeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vehicle-types', vehicleTypeRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/driver/vehicle', driverVehicleRoutes);
app.use('/api/driver/kyc', driverKycRoutes);

// Basic route for testing
app.get('/', (req, res) => {
    res.send('Server is running. Use /api route to access the API.');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
