import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { createDriverKyc, getDriverKyc, editDriverKyc } from '../controllers/driverKycController.js';

const router = express.Router();

// Setup multer storage for KYC documents
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = 'uploads/kyc/';
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

// Add KYC details for a driver
router.post('/add', upload.any(), createDriverKyc);

// Get KYC details for a specific driver
router.get('/get/:driver_id', getDriverKyc);

// Edit (Update) KYC details for a driver
router.put('/edit/:driver_id', upload.any(), editDriverKyc);

export default router;
