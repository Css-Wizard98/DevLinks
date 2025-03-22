import express from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';

import authRouter from './routes/auth.routes.js';
import usersRouter from './routes/users.routes.js';

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static('public'));

app.use('/auth', authRouter);
app.use('/users', usersRouter);

export default app;
