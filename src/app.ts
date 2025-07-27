import express from 'express';
import connectDB from './config/database';
import mongoose from 'mongoose';
import User from './models/user';

const app = express();

// Connect to database
connectDB()
  .then(() => {
    app.listen(3000, () => {
      console.log('server started at http://localhost:3000');
    });
  })
  .catch((err: string) => {
    console.log(err);
  });

app.get('/', (req, res) => {
  res.send('Hey');
});

app.post('/signup', async (req, res) => {
  const user = new User({
    firstName: 'Test User',
    lastName: 'Last Name',
    emailId: 'test@gmail.com',
    password: '123',
  });

  try {
    await user.save();
    res.status(201).send('User Created Successfully');
  } catch (err) {
    res.status(400).send('Error saving the user' + err);
  }
});
