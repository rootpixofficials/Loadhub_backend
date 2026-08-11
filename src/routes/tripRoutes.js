import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { postTrip, getTrips, getUserTrips, getMatchingVehicles, updateTripStatusController } from '../controllers/tripController.js';

const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = 'uploads/trips/';
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

router.post('/', upload.single('goods_image'), postTrip);
router.get('/', getTrips);
router.get('/user/:user_id', getUserTrips);
router.post('/matching-vehicles', getMatchingVehicles);
router.put('/status/:id', updateTripStatusController);

export default router;
