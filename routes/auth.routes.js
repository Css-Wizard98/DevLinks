import express from 'express';
import { login, register } from '../controllers/auth.controller.js';
import { validateRegister } from '../middlewares/validators/auth.validator.js';
const router = express.Router();

router.post('/login', login);
router.post('/register', validateRegister, register);

export default router;
