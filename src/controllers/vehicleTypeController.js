import { createVehicleType, getAllVehicleTypes } from '../models/vehicleTypeModel.js';

export const addVehicleType = async (req, res) => {
    try {
        const { name, capacity, description, image_url } = req.body;

        if (!name || !capacity) {
            return res.status(400).json({ success: false, message: 'Name and capacity are required' });
        }

        const newVehicleType = await createVehicleType({ name, capacity, description, image_url });

        res.status(201).json({
            success: true,
            message: 'Vehicle type added successfully',
            data: newVehicleType
        });
    } catch (error) {
        console.error('Error in addVehicleType:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const getVehicleTypes = async (req, res) => {
    try {
        const vehicleTypes = await getAllVehicleTypes();

        res.status(200).json({
            success: true,
            data: vehicleTypes
        });
    } catch (error) {
        console.error('Error in getVehicleTypes:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
