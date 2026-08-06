import express from 'express';
import { registerUser, verifyRegisterOtp, requestLoginOtp, verifyLoginOtp, updateProfile, getProfile, deleteAccount, updateLocation } from '../controllers/userController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/register/verify-otp', verifyRegisterOtp);
router.post('/login/request-otp', requestLoginOtp);
router.post('/login/verify-otp', verifyLoginOtp);
router.get('/profile/:id', getProfile);
router.put('/profile/:id', updateProfile);
router.delete('/profile/:id', deleteAccount);

router.put('/location/:id', updateLocation);

export default router;
