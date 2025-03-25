import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const hashPassword = async (password) => await bcrypt.hash(password, 10);
export const comparePasswords = async (plain, hashed) => await bcrypt.compare(plain, hashed);

export const generateAccessToken = (payload) => {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
};

export const generateRefreshToken = (payload) => {
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token, secret) => {
    return jwt.verify(token, secret);
};

export const issueTokens = (user, jti) => {
    const payload = { id: user.idusers, email: user.email, jti };
    return {
        accessToken: generateAccessToken(payload),
        refreshToken: generateRefreshToken(payload)
    };
};



