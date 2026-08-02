import { createLoad, getAllLoads } from '../models/loadModel.js';

export const postLoad = async (req, res) => {
    try {
        const { 
            user_id, pickup_location, pickup_lat, pickup_lng, 
            drop_location, drop_lat, drop_lng, vehicle_type_id, 
            load_type, approx_weight, driver_id, estimated_fare 
        } = req.body;

        if (!pickup_location || !pickup_lat || !pickup_lng) {
            return res.status(400).json({ success: false, message: 'Pickup location details are required' });
        }
        if (!drop_location || !drop_lat || !drop_lng) {
            return res.status(400).json({ success: false, message: 'Drop location details are required' });
        }

        const newLoad = await createLoad({ 
            user_id, pickup_location, pickup_lat, pickup_lng, 
            drop_location, drop_lat, drop_lng, vehicle_type_id, 
            load_type, approx_weight, driver_id, estimated_fare 
        });

        res.status(201).json({
            success: true,
            message: 'Load posted successfully',
            data: newLoad
        });
    } catch (error) {
        console.error('Error in postLoad:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const getLoads = async (req, res) => {
    try {
        const loads = await getAllLoads();

        res.status(200).json({
            success: true,
            data: loads
        });
    } catch (error) {
        console.error('Error in getLoads:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
