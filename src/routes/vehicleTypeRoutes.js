import express from 'express';
import { addVehicleType, getVehicleTypes } from '../controllers/vehicleTypeController.js';

const router = express.Router();

router.post('/', addVehicleType);
router.get('/', getVehicleTypes);

export default router;
