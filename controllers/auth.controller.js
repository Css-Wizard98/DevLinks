import db from '../config/db.js';
import { hashPassword } from '../utils/jwt.js';

const login = async (req, res) => {
    const { email, password } = req.body;
}

const register = async (req, res) => {
    console.log('req.body', req.body)
    const { email, password } = req.body;
    const hashed = await hashPassword(password);

    try {
        const [user] = await db.execute(`
               SELECT email FROM users WHERE email = ?
            `, [email]);
        if (user.length > 0) {
            return res.status(400).json({ error: 'User with this email already exists' });
        } else {
            await db.execute(`
                    INSERT INTO users (email,password)
                    VALUES (?,?)
                `, [email, hashed]);
            return res.status(201).json({ message: 'User created successfully'});
        }
    } catch (error) {
        console.log('error', error)
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Email already exists' });
        }
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

export { login, register };