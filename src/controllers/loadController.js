import { createLoad, getAllLoads, getLoadsByUserId, getMatchingVehiclesForLoad } from '../models/loadModel.js';

export const postLoad = async (req, res) => {
    try {
        let { 
            user_id, pickup_location, pickup_lat, pickup_lng, 
            drop_location, drop_lat, drop_lng, vehicle_type_id, 
            load_type, approx_weight, driver_id, estimated_fare, goods_image 
        } = req.body;

        if (req.files && req.files.length > 0) {
            const file = req.files[0];
            const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
            goods_image = `${baseUrl}/uploads/loads/${file.filename}`;
        } else if (req.file) {
            const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
            goods_image = `${baseUrl}/uploads/loads/${req.file.filename}`;
        }

        if (!pickup_location || !pickup_lat || !pickup_lng) {
            return res.status(400).json({ 
                success: false, 
                message: 'Pickup location details are required',
                received_keys: Object.keys(req.body),
                received_body: req.body 
            });
        }
        if (!drop_location || !drop_lat || !drop_lng) {
            return res.status(400).json({ 
                success: false, 
                message: 'Drop location details are required',
                received_keys: Object.keys(req.body),
                received_body: req.body 
            });
        }

        const newLoad = await createLoad({ 
            user_id, pickup_location, pickup_lat, pickup_lng, 
            drop_location, drop_lat, drop_lng, vehicle_type_id, 
            load_type, approx_weight, goods_image, driver_id, estimated_fare 
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

export const getUserLoads = async (req, res) => {
    try {
        const { user_id } = req.params;

        if (!user_id) {
            return res.status(400).json({ success: false, message: 'User ID is required' });
        }

        const loads = await getLoadsByUserId(user_id);

        res.status(200).json({
            success: true,
            data: loads
        });
    } catch (error) {
        console.error('Error in getUserLoads:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const getMatchingVehicles = async (req, res) => {
    try {
        const { load_id } = req.params;
        const radius = req.query.radius ? parseFloat(req.query.radius) : 50; // Default 50km

        if (!load_id) {
            return res.status(400).json({ success: false, message: 'Load ID is required' });
        }

        const vehicles = await getMatchingVehiclesForLoad(load_id, radius);

        res.status(200).json({
            success: true,
            message: 'Matching vehicles found',
            data: vehicles
        });
    } catch (error) {
        console.error('Error in getMatchingVehicles:', error);
        res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
};
