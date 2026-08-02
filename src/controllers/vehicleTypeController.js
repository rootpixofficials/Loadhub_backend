import { createVehicleType, getAllVehicleTypes } from '../models/vehicleTypeModel.js';

export const addVehicleType = async (req, res) => {
    try {
        const { name, capacity, description } = req.body;

        if (!name || !capacity) {
            return res.status(400).json({ success: false, message: 'Name and capacity are required' });
        }

        let vehicle_type_image = null;
        if (req.file) {
            const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
            vehicle_type_image = `${baseUrl}/uploads/vehicles/${req.file.filename}`;
        }

        const newVehicleType = await createVehicleType({ name, capacity, description, vehicle_type_image });

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
