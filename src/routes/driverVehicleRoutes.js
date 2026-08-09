import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { createDriverVehicle, getDriverVehicles, editDriverVehicle, removeDriverVehicle, updateActiveStatus } from '../controllers/driverVehicleController.js';

const router = express.Router();

// Setup multer storage for driver vehicles
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = 'uploads/driver_vehicles/';
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Add a new driver vehicle
router.post('/add', upload.any(), createDriverVehicle);

// Get all vehicles for a specific driver
router.get('/get/:driver_id', getDriverVehicles);

// Edit (Update) a driver's vehicle details
router.put('/edit/:id', upload.any(), editDriverVehicle);

// Delete a driver's vehicle
router.delete('/delete/:id', removeDriverVehicle);

// Update vehicle active/online status
router.put('/status/:id', updateActiveStatus);

export default router;
