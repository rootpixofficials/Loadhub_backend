import { createUser, getUserByMobile } from '../models/userModel.js';
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

        const newUser = await createUser({
            full_name,
            company_name,
            mobile_number,
            email,
            role
        });

        const tokens = generateTokens(newUser);

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: {
                user: newUser,
                tokens
            }
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
        const { mobile_number, otp } = req.body;
        
        if (!mobile_number || !otp) {
            return res.status(400).json({ success: false, message: 'Mobile number and OTP are required' });
        }

        const user = await getUserByMobile(mobile_number);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
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
