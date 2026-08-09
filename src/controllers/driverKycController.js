import { addDriverKyc, getKycByDriverId, updateDriverKyc } from '../models/driverKycModel.js';

export const createDriverKyc = async (req, res) => {
    try {
        let { driver_id, aadhaar_number, pan_number, license_number, license_expiry } = req.body;

        if (!driver_id) {
            return res.status(400).json({ success: false, message: 'Driver ID is required' });
        }

        // Check if KYC already exists
        const existingKyc = await getKycByDriverId(driver_id);
        if (existingKyc) {
            return res.status(400).json({ success: false, message: 'KYC details already exist for this driver. Use the edit endpoint.' });
        }

        let aadhaar_image = null;
        let pan_image = null;
        let license_image = null;

        if (req.files && req.files.length > 0) {
            const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
            req.files.forEach(file => {
                if (file.fieldname === 'aadhaar_image') {
                    aadhaar_image = `${baseUrl}/uploads/kyc/${file.filename}`;
                } else if (file.fieldname === 'pan_image') {
                    pan_image = `${baseUrl}/uploads/kyc/${file.filename}`;
                } else if (file.fieldname === 'license_image') {
                    license_image = `${baseUrl}/uploads/kyc/${file.filename}`;
                }
            });
        }

        const newKyc = await addDriverKyc({
            driver_id, aadhaar_number, aadhaar_image, pan_number, 
            pan_image, license_number, license_expiry, license_image
        });

        res.status(201).json({
            success: true,
            message: 'KYC details added successfully',
            data: newKyc,
            debug_received_body: req.body
        });
    } catch (error) {
        console.error('Error in createDriverKyc:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const getDriverKyc = async (req, res) => {
    try {
        const { driver_id } = req.params;
        if (!driver_id) {
            return res.status(400).json({ success: false, message: 'Driver ID is required' });
        }

        const kycDetails = await getKycByDriverId(driver_id);
        
        if (!kycDetails) {
            return res.status(404).json({ success: false, message: 'No KYC details found for this driver' });
        }

        res.status(200).json({
            success: true,
            data: kycDetails
        });
    } catch (error) {
        console.error('Error in getDriverKyc:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const editDriverKyc = async (req, res) => {
    try {
        const { driver_id } = req.params;
        let { aadhaar_number, pan_number, license_number, license_expiry, status } = req.body;

        if (!driver_id) {
            return res.status(400).json({ success: false, message: 'Driver ID is required' });
        }

        const existingKyc = await getKycByDriverId(driver_id);
        if (!existingKyc) {
            return res.status(404).json({ success: false, message: 'KYC details not found for this driver' });
        }

        let aadhaar_image = null;
        let pan_image = null;
        let license_image = null;

        if (req.files && req.files.length > 0) {
            const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
            req.files.forEach(file => {
                if (file.fieldname === 'aadhaar_image') {
                    aadhaar_image = `${baseUrl}/uploads/kyc/${file.filename}`;
                } else if (file.fieldname === 'pan_image') {
                    pan_image = `${baseUrl}/uploads/kyc/${file.filename}`;
                } else if (file.fieldname === 'license_image') {
                    license_image = `${baseUrl}/uploads/kyc/${file.filename}`;
                }
            });
        }

        const updatedKyc = await updateDriverKyc(driver_id, {
            aadhaar_number, aadhaar_image, pan_number, 
            pan_image, license_number, license_expiry, license_image, status
        });

        res.status(200).json({
            success: true,
            message: 'KYC details updated successfully',
            data: updatedKyc,
            debug_received_body: req.body
        });
    } catch (error) {
        console.error('Error in editDriverKyc:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
