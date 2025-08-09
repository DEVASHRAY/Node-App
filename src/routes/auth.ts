import bcrypt from 'bcrypt';
import express from 'express';
import User from '../models/user';
import { validateSignUpData } from '../utils/validation';
import authMiddleware from '../middlewares/auth';

const authRouter = express.Router();

authRouter.post('/signup', async (req, res) => {
  try {
    // Validation
    validateSignUpData(req.body);

    // Check if user already exists
    const existingUser = await User.findOne({ emailId: req.body.emailId });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(req.body.password, 10);

    // Create user
    const user: any = new User({ ...req.body, password: passwordHash });
    const savedUser = await user.save();

    const jwtToken = await user.getJWT();
    res.cookie('token', jwtToken, { httpOnly: true, secure: true });
    res.status(201).json({
      message: 'User created successfully',
      data: savedUser,
    });
  } catch (err: any) {
    if (err.name === 'ValidationError') {
      return res.status(422).json({ message: err.message });
    }
    console.error(err);
    res.status(500).json({ message: err });
  }
});

authRouter.post('/login', async (req, res) => {
  try {
    const user: any = await User.findOne({ emailId: req.body.emailId });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = await user.validatePassword(req.body.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const jwtToken = await user.getJWT();
    res.cookie('token', jwtToken);

    res.json({
      message: 'User logged in successfully',
      data: user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err });
  }
});

authRouter.post('/logout', authMiddleware, (req, res) => {
  try {
    res.cookie('token', null, {
      expires: new Date(0),
    });
    res.json({ message: 'User logged out successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err });
  }
});

export default authRouter;
