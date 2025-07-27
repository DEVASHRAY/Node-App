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

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hey');
});

app.post('/signup', async (req, res) => {
  const { firstName, lastName, age, gender, emailId, password } = req.body;

  const user = new User({
    age,
    emailId,
    firstName,
    gender,
    lastName,
    password,
  });

  try {
    await user.save();
    res.status(201).send('User Created Successfully');
  } catch (err) {
    res.status(400).send('Error saving the user' + err);
  }
});

app.get('/feed', async (req, res) => {
  try {
    const feed = await User.find({});
    res.send(feed);
  } catch (err) {
    res.status(400).send('Something went wrong' + err);
  }
});

app.get('/user', async (req, res) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (err) {
    res.status(404).send(err);
  }
});

app.delete('/user/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findByIdAndDelete(userId);
  } catch (err) {
    res.status(404).send(err);
  }
});

app.patch('/user/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findByIdAndUpdate({ _id: userId }, req.body);
    if (user) {
      res.send(user);
    } else {
      res.status(404).send('User Not Found');
    }
  } catch (err) {
    res.status(404).send(err);
  }
});
