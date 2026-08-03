import express from 'express';
import { registerUser, verifyRegisterOtp, requestLoginOtp, verifyLoginOtp, updateProfile } from '../controllers/userController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/register/verify-otp', verifyRegisterOtp);
router.post('/login/request-otp', requestLoginOtp);
router.post('/login/verify-otp', verifyLoginOtp);
router.put('/profile/:id', updateProfile);

export default router;
