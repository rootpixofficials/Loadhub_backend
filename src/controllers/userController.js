import { createUser, getUserByMobile, createTempUser, getTempUserByMobile, deleteTempUser } from '../models/userModel.js';
import { generateTokens } from '../../token.js';

export const registerUser = async (req, res) => {
    try {
        const { full_name, company_name, mobile_number, email, role } = req.body;

        if (!full_name || !mobile_number) {
            return res.status(400).json({ success: false, message: 'Full name and mobile number are required' });
        }

        // Check if user already exists
        const existingUser = await getUserByMobile(mobile_number);
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User with this mobile number already exists' });
        }

        const otp = '1234'; // Mocked OTP for testing
        await createTempUser({
            full_name,
            company_name,
            mobile_number,
            email,
            role
        }, otp);

        res.status(200).json({
            success: true,
            message: 'OTP sent successfully for registration (temporary OTP is 1234)'
        });
    } catch (error) {
        console.error('Error in registerUser:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const requestLoginOtp = async (req, res) => {
    try {
        const { mobile_number } = req.body;
        if (!mobile_number) {
            return res.status(400).json({ success: false, message: 'Mobile number is required' });
        }
        
        const user = await getUserByMobile(mobile_number);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // In a real app, you would generate a random OTP, save it to DB/Redis, and send via SMS.
        // For now, we simulate success and hardcode '1234' on verification.
        res.status(200).json({ 
            success: true, 
            message: 'OTP sent successfully (temporary OTP is 1234)' 
        });
    } catch (error) {
        console.error('Error in requestLoginOtp:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const verifyLoginOtp = async (req, res) => {
    try {
        const { mobile_number, otp, role } = req.body;
        
        if (!mobile_number || !otp || !role) {
            return res.status(400).json({ success: false, message: 'Mobile number, OTP, and role are required' });
        }

        const user = await getUserByMobile(mobile_number);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.role !== role) {
            return res.status(403).json({ success: false, message: 'Access denied: role mismatch' });
        }

        // Hardcoded temporary OTP check
        if (otp !== '1234') {
            return res.status(401).json({ success: false, message: 'Invalid OTP' });
        }

        const tokens = generateTokens(user);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user,
                tokens
            }
        });
    } catch (error) {
        console.error('Error in verifyLoginOtp:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const verifyRegisterOtp = async (req, res) => {
    try {
        const { mobile_number, otp } = req.body;
        
        if (!mobile_number || !otp) {
            return res.status(400).json({ success: false, message: 'Mobile number and OTP are required' });
        }

        const tempUser = await getTempUserByMobile(mobile_number);
        if (!tempUser) {
            return res.status(404).json({ success: false, message: 'Registration request not found or expired' });
        }

        if (tempUser.otp !== otp) {
            return res.status(401).json({ success: false, message: 'Invalid OTP' });
        }

        // Depending on MySQL driver, JSON columns might be returned as string or object
        const userData = typeof tempUser.user_data === 'string' ? JSON.parse(tempUser.user_data) : tempUser.user_data;

        // Verify again just in case
        const existingUser = await getUserByMobile(mobile_number);
        if (existingUser) {
            await deleteTempUser(mobile_number);
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const newUser = await createUser(userData);
        
        // Clean up temp table
        await deleteTempUser(mobile_number);

        const tokens = generateTokens(newUser);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: newUser,
                tokens
            }
        });
    } catch (error) {
        console.error('Error in verifyRegisterOtp:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

