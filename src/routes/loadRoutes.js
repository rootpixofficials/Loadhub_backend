import express from 'express';
import { postLoad, getLoads } from '../controllers/loadController.js';

const router = express.Router();

router.post('/', postLoad);
router.get('/', getLoads);

export default router;
