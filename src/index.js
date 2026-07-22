import 'dotenv/config';
import express from 'express';
import homeRoutes from './routes/homeRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { connectDB } from './config/db.js';
import { initUserTable } from './models/userModel.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MySQL Database
connectDB().then(() => {
    initUserTable();
});

// Middleware to parse JSON bodies
app.use(express.json());

// Routes
app.use('/api', homeRoutes);
app.use('/api/users', userRoutes);

// Basic route for testing
app.get('/', (req, res) => {
    res.send('Server is running. Use /api route to access the API.');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
