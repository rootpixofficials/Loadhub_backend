import { addDriverVehicle, getVehiclesByDriverId, updateDriverVehicle, deleteDriverVehicle, updateVehicleActiveStatus, updateVehicleLocation } from '../models/driverVehicleModel.js';

export const createDriverVehicle = async (req, res) => {
    try {
        let { driver_id, vehicle_type_id, registration_number, vehicle_model, insurance_valid_until, per_km_rate, location, latitude, longitude, status } = req.body;

        if (!driver_id || !vehicle_type_id || !registration_number || !vehicle_model) {
            return res.status(400).json({ success: false, message: 'Driver ID, Vehicle Type ID, Registration Number, and Vehicle Model are required' });
        }

        let insurance_certificate = null;
        let rc_certificate = null;

        if (req.files && req.files.length > 0) {
            const baseUrl = process.env.BASE_URL || 'https://api.loadhub.in';
            req.files.forEach(file => {
                if (file.fieldname === 'insurance_certificate') {
                    insurance_certificate = `${baseUrl}/uploads/driver_vehicles/${file.filename}`;
                } else if (file.fieldname === 'rc_certificate') {
                    rc_certificate = `${baseUrl}/uploads/driver_vehicles/${file.filename}`;
                }
            });
        }

        const newVehicle = await addDriverVehicle({
            driver_id, vehicle_type_id, registration_number, 
            vehicle_model, insurance_valid_until, insurance_certificate, rc_certificate,
            per_km_rate, location, latitude, longitude, status
        });

        res.status(201).json({
            success: true,
            message: 'Vehicle added successfully',
            data: newVehicle,
            debug_received_body: req.body
        });
    } catch (error) {
        console.error('Error in createDriverVehicle:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const getDriverVehicles = async (req, res) => {
    try {
        const { driver_id } = req.params;
        if (!driver_id) {
            return res.status(400).json({ success: false, message: 'Driver ID is required' });
        }

        const vehicles = await getVehiclesByDriverId(driver_id);
        res.status(200).json({
            success: true,
            data: vehicles
        });
    } catch (error) {
        console.error('Error in getDriverVehicles:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const editDriverVehicle = async (req, res) => {
    try {
        const { id } = req.params;
        let { vehicle_type_id, registration_number, vehicle_model, insurance_valid_until, status, per_km_rate, location, latitude, longitude } = req.body;

        if (!id) {
            return res.status(400).json({ success: false, message: 'Vehicle ID is required' });
        }

        let insurance_certificate = null;
        let rc_certificate = null;

        if (req.files && req.files.length > 0) {
            const baseUrl = process.env.BASE_URL || 'https://api.loadhub.in';
            req.files.forEach(file => {
                if (file.fieldname === 'insurance_certificate') {
                    insurance_certificate = `${baseUrl}/uploads/driver_vehicles/${file.filename}`;
                } else if (file.fieldname === 'rc_certificate') {
                    rc_certificate = `${baseUrl}/uploads/driver_vehicles/${file.filename}`;
                }
            });
        }

        const updatedVehicle = await updateDriverVehicle(id, {
            vehicle_type_id, registration_number, vehicle_model, 
            insurance_valid_until, insurance_certificate, rc_certificate, status, per_km_rate,
            location, latitude, longitude
        });

        res.status(200).json({
            success: true,
            message: 'Vehicle updated successfully',
            data: updatedVehicle,
            debug_received_body: req.body
        });
    } catch (error) {
        console.error('Error in editDriverVehicle:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const removeDriverVehicle = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ success: false, message: 'Vehicle ID is required' });
        }

        await deleteDriverVehicle(id);

        res.status(200).json({
            success: true,
            message: 'Vehicle deleted successfully'
        });
    } catch (error) {
        console.error('Error in removeDriverVehicle:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const updateActiveStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_active } = req.body;

        if (!id) {
            return res.status(400).json({ success: false, message: 'Vehicle ID is required' });
        }

        if (is_active === undefined) {
            return res.status(400).json({ success: false, message: 'is_active field is required' });
        }

        const updatedVehicle = await updateVehicleActiveStatus(id, is_active);

        res.status(200).json({
            success: true,
            message: `Vehicle status updated to ${is_active}`,
            data: updatedVehicle
        });
    } catch (error) {
        console.error('Error in updateActiveStatus:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const updateLocation = async (req, res) => {
    try {
        const { id } = req.params;
        const { latitude, longitude, location } = req.body;

        if (!id) {
            return res.status(400).json({ success: false, message: 'Vehicle ID is required' });
        }

        if (latitude === undefined || longitude === undefined) {
            return res.status(400).json({ success: false, message: 'latitude and longitude are required' });
        }

        const updatedVehicle = await updateVehicleLocation(id, latitude, longitude, location);

        res.status(200).json({
            success: true,
            message: 'Vehicle location updated successfully',
            data: updatedVehicle
        });
    } catch (error) {
        console.error('Error in updateLocation:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
