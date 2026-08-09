import express from 'express';
import { upsert, getEarningsDashboard } from '../controllers/transactionController.js';

const router = express.Router();

// Upsert a transaction
router.post('/', upsert);

// Get Earnings Dashboard
router.get('/earnings/:driver_id', getEarningsDashboard);

export default router;
