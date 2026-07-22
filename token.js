import jwt from 'jsonwebtoken';

export const generateTokens = (user) => {
    const payload = { id: user.id, role: user.role };
    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET || 'access_secret', { expiresIn: '15m' });
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET || 'refresh_secret', { expiresIn: '7d' });
    return { accessToken, refreshToken };
};
