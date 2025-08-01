import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import express from 'express';
import connectDB from './config/database';
import authMiddleware from './middlewares/auth';
import User from './models/user';
import authRouter from './routes/auth';
import profileRouter from './routes/profile';
import requestRouter from './routes/request';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use('/', authRouter);

app.use(authMiddleware);
app.use('/', profileRouter);
app.use('/', requestRouter);

connectDB()
  .then(() => {
    app.listen(3000, () => {
      console.log('server started at http://localhost:3000');
    });
    (async () => {
      const indexes = await User.collection.getIndexes();
      console.log(indexes);
    })();
  })
  .catch((err: string) => {
    console.log(err);
  });
