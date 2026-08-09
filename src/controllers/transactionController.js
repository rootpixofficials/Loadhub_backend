import { upsertTransaction, getDriverEarnings } from '../models/transactionModel.js';

export const upsert = async (req, res) => {
    try {
        const { trip_id, payment_type, amount, status } = req.body;

        if (!trip_id) {
            return res.status(400).json({ success: false, message: 'trip_id is required' });
        }

        const transaction = await upsertTransaction({ trip_id, payment_type, amount, status });

        res.status(200).json({
            success: true,
            message: 'Transaction recorded successfully',
            data: transaction
        });
    } catch (error) {
        console.error('Error in upsert transaction:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const getEarningsDashboard = async (req, res) => {
    try {
        const { driver_id } = req.params;

        if (!driver_id) {
            return res.status(400).json({ success: false, message: 'driver_id is required' });
        }

        const dashboardData = await getDriverEarnings(driver_id);

        res.status(200).json({
            success: true,
            data: dashboardData
        });
    } catch (error) {
        console.error('Error in getEarningsDashboard:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
