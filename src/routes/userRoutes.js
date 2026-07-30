import express from 'express';
import { registerUser, verifyRegisterOtp, requestLoginOtp, verifyLoginOtp } from '../controllers/userController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/register/verify-otp', verifyRegisterOtp);
router.post('/login/request-otp', requestLoginOtp);
router.post('/login/verify-otp', verifyLoginOtp);

export default router;
