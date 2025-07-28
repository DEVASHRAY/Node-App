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
    (async () => {
      const indexes = await User.collection.getIndexes();
      console.log(indexes);
    })();
  })
  .catch((err: string) => {
    console.log(err);
  });

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hey');
});

app.post('/signup', async (req, res) => {
  const user = new User(req.body);

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
    const ALLOWED_UPDATES = [
      'gender',
      'age',
      'firstName',
      'lastName',
      'photoUrl',
    ];

    const invalidFields = Object.keys(req.body).filter(
      (item) => !ALLOWED_UPDATES.includes(item)
    );

    console.log('`sadasdas`', invalidFields);

    if (invalidFields.length > 0) {
      throw new Error(`Update not allowed for: ${invalidFields.join(', ')}`);
    }

    const user = await User.findByIdAndUpdate({ _id: userId }, req.body, {
      returnDocument: 'after',
      runValidators: true,
    });
    if (user) {
      res.send(user);
    } else {
      res.status(400).send('User Not Found');
    }
  } catch (err) {
    console.log('Error:', err);
    res
      .status(400)
      .send(err instanceof Error ? err.message : 'An error occurred');
  }
});
