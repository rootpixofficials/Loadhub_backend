import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { createDriverVehicle, getDriverVehicles, editDriverVehicle, removeDriverVehicle } from '../controllers/driverVehicleController.js';

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

router.post('/', upload.any(), createDriverVehicle);
router.get('/driver/:driver_id', getDriverVehicles);
router.put('/:id', upload.any(), editDriverVehicle);
router.delete('/:id', removeDriverVehicle);

export default router;
