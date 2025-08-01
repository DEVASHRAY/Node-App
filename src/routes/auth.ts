import becrypt from 'bcrypt';
import express from 'express';
import User from '../models/user';
import { validateSignUpData } from '../utils/validation';
import jwt from 'jsonwebtoken';
import authMiddleware from '../middlewares/auth';

const authRouter = express.Router();

authRouter.post('/signup', async (req, res) => {
  try {
    validateSignUpData(req.body);

    const passwordHash = await becrypt.hash(req.body.password, 10);

    const user = new User({ ...req.body, password: passwordHash });

    await user.save();
    res.status(201).send('User Created Successfully');
  } catch (err) {
    res.status(400).send('Error saving the user' + err);
  }
});

authRouter.post('/login', async (req, res) => {
  try {
    const user: any = await User.findOne({ emailId: req.body.emailId });

    if (!user) {
      throw new Error('User Not found');
    }

    const isPasswordValid = await user.validatePassword(req.body.password);

    if (isPasswordValid) {
      const jwtToken = await user.getJWT();

      res.cookie('token', jwtToken, { httpOnly: true, secure: true });
      res.send('User Login Successfully');
    } else {
      throw new Error('Invalid Password');
    }
  } catch (err) {
    res.status(400).send('Unable to login' + err);
  }
});

authRouter.get('/logout', async (req, res) => {
  try {
    res.cookie('token', null, {
      expires: new Date(Date.now()),
    });
    res.send('User Logged out successfully');
  } catch (err) {
    res.status(400).send(err);
  }
});

export default authRouter;
