import 'dotenv/config';
import express from 'express';
import homeRoutes from './routes/homeRoutes.js';
import { connectDB } from './config/db.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to PostgreSQL Database
connectDB();

// Middleware to parse JSON bodies
app.use(express.json());

// Routes
app.use('/api', homeRoutes);

// Basic route for testing
app.get('/', (req, res) => {
    res.send('Server is running. Use /api route to access the API.');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
