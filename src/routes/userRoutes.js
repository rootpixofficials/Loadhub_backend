import express from 'express';
import { registerUser, requestLoginOtp, verifyLoginOtp } from '../controllers/userController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login/request-otp', requestLoginOtp);
router.post('/login/verify-otp', verifyLoginOtp);

export default router;
