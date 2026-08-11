import { createTrip, getAllTrips, getTripsByUserId, getMatchingVehicles as getMatchingVehiclesModel } from '../models/tripModel.js';

export const postTrip = async (req, res) => {
    try {
        const { 
            user_id, pickup_location, pickup_lat, pickup_lng, 
            drop_location, drop_lat, drop_lng, vehicle_type_id, 
            trip_type, approx_weight, driver_id, estimated_fare, price
        } = req.body;

        let goods_image = null;
        if (req.file) {
            const baseUrl = process.env.BASE_URL || 'https://api.loadhub.in';
            goods_image = `${baseUrl}/uploads/trips/${req.file.filename}`;
        }

        if (!pickup_location || !pickup_lat || !pickup_lng || !drop_location || !drop_lat || !drop_lng) {
            return res.status(400).json({ success: false, message: 'Pickup and Drop locations with coordinates are required' });
        }

        const newTrip = await createTrip({ 
            user_id, pickup_location, pickup_lat, pickup_lng, 
            drop_location, drop_lat, drop_lng, vehicle_type_id, 
            trip_type, approx_weight, goods_image, driver_id, estimated_fare, price
        });

        res.status(201).json({
            success: true,
            message: 'Trip posted successfully',
            data: newTrip
        });
    } catch (error) {
        console.error('Error in postTrip:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const getTrips = async (req, res) => {
    try {
        const trips = await getAllTrips();
        res.status(200).json({
            success: true,
            data: trips
        });
    } catch (error) {
        console.error('Error in getTrips:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const getUserTrips = async (req, res) => {
    try {
        const { user_id } = req.params;
        
        if (!user_id) {
            return res.status(400).json({ success: false, message: 'User ID is required' });
        }

        const trips = await getTripsByUserId(user_id);
        res.status(200).json({
            success: true,
            data: trips
        });
    } catch (error) {
        console.error('Error in getUserTrips:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const getMatchingVehicles = async (req, res) => {
    try {
        const { pickup_lat, pickup_lng, drop_lat, drop_lng, vehicle_type_id, radius_km } = req.body;

        if (!pickup_lat || !pickup_lng || !drop_lat || !drop_lng) {
            return res.status(400).json({ success: false, message: 'Pickup and Drop coordinates (lat and lng) are required' });
        }

        const radius = radius_km || 50;

        const vehicles = await getMatchingVehiclesModel(pickup_lat, pickup_lng, drop_lat, drop_lng, vehicle_type_id, radius);

        res.status(200).json({
            success: true,
            message: vehicles.length > 0 ? 'Matching vehicles found' : 'No matching vehicles found within radius',
            data: vehicles
        });
    } catch (error) {
        console.error('Error in getMatchingVehicles:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
