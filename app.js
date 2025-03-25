import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';

import authRouter from './routes/auth.routes.js';
import usersRouter from './routes/users.routes.js';

const app = express();

app.use(logger('dev')); // log requests to the console
app.use(express.json()); // parse json bodies in the request
app.use(express.urlencoded({ extended: false })); // parse x-www-form-urlencoded bodies in the request
app.use(cookieParser()); // parse Cookie header and populate req.cookies with an object keyed by the cookie names
app.use(express.static('public')); // serve static files from the public folder

app.use('/auth', authRouter);
app.use('/users', usersRouter);

export default app;
