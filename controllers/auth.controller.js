import db from '../config/db.js';
import jwt from 'jsonwebtoken';
import { comparePasswords, hashPassword, issueTokens } from '../utils/jwt.js';
import { v4 as uuidv4 } from 'uuid';

const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const [user, _] = await db.execute(`
              SELECT * FROM users
              WHERE email = ?
            `, [email])
        if (user.length) {
            const isValidPassword = await comparePasswords(password, user[0].password);
            if (isValidPassword) {
                const jti = uuidv4();
                console.log('jti', jti)
                const { accessToken, refreshToken } = issueTokens(user[0], jti);
                console.log('user[0].idusers-1', user[0].idusers)
                await db.execute(`
                   UPDATE users 
                    SET refresh_token_id = ?, refresh_token_expires_at = ? 
                    WHERE idusers = ?
                `, [jti, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), user[0].idusers]);
                console.log('user[0].idusers-2', user[0].idusers)
                res.cookie('refreshToken', refreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV !== 'development',
                    maxAge: 7 * 24 * 60 * 60 * 1000,
                });
                return res.status(200).json({ access_token: accessToken });
            } else {
                return res.status(400).json({ error: 'Invalid password' })
            }
        } else {
            return res.status(400).json({ error: 'Email not found' });
        }
    } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });

    }
}

const register = async (req, res) => {
    const { email, password } = req.body;
    const hashed = await hashPassword(password);

    try {
        const [user, _] = await db.execute(`
               SELECT email FROM users WHERE email = ?
            `, [email]);
        if (user.length > 0) {
            return res.status(400).json({ error: 'User with this email already exists' });
        } else {
            await db.execute(`
                    INSERT INTO users (email,password)
                    VALUES (?,?)
                `, [email, hashed]);
            return res.status(201).json({ message: 'User created successfully' });
        }
    } catch (error) {
        console.log('error', error)
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Email already exists' });
        }
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

const logout = async (req, res) => {
    res.clearCookie('refreshToken');
    return res.status(200).json({ message: 'Logged out successfully' });
}

const refresh = async (req, res) => {
    const refreshToken = req.cookies?.refreshToken;
    if(!refreshToken){
        return res.status(401).json({error: 'Unauthorized'});
    }
    try{
        console.log(':::Decoding the refresh token:::')
        const decoded = jwt.decode(refreshToken);
        console.log('decoded', decoded)
        if(!decoded){
            return res.status(401).json({error: 'Unauthorized'});
        }
        console.log(':::Fetching the user from the database:::')
        const [user, _] = await db.execute(`
            SELECT * FROM users WHERE idusers = ?
        `, [decoded.id]);
        console.log('userhjbaskjhasdkjhadsjkhads', user)
        if(!user.length){
            return res.status(401).json({error: 'Unauthorized'});
        }else{
            const userData = user[0];
            console.log('userData', userData)
            console.log(':::Comparing the refresh token with the user\'s refresh token:::')
            const isValid = userData.refresh_token_id === decoded.jti;
            console.log('isValid', isValid)
            if(!isValid){
                return res.status(401).json({error: 'Unauthorized'});
            }
            const jti = uuidv4();
            const {accessToken,refreshToken} = issueTokens(userData, jti);
            await db.execute(`
                UPDATE users 
                SET refresh_token_id = ?, refresh_token_expires_at = ?
                WHERE idusers = ?
            `, [jti, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), userData.idusers]);
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
            })
            return res.status(200).json({access_token: accessToken});   
        }
    }catch(error){
        return res.status(500).json({error: 'Internal Server Error'});
    }

}

export { login, register, logout, refresh };