import express from 'express';
import User from '../models/user';

const profileRouter = express.Router();

profileRouter.get('/profile/view', async (req, res) => {
  try {
    const user = (req as any).user;

    if (!user) {
      throw new Error('User not found');
    }

    res.json({
      data: user,
    });
  } catch (err) {
    res.status(400).send('Err' + err);
  }
});

profileRouter.patch('/profile/edit', async (req, res) => {
  try {
    const ALLOWED_EDITABLE_FIELDS = [
      'firstName',
      'lastName',
      'age',
      'gender',
      'photoUrl',
    ];

    if (
      !Object.keys(req.body).every((key) =>
        ALLOWED_EDITABLE_FIELDS.includes(key)
      )
    ) {
      throw new Error('Invalid Payload. Few Fields cannot be edited');
    }

    const loggedInUser = (req as any).user;

    Object.keys(req.body).forEach((key) => {
      loggedInUser[key] = req.body[key];
    });

    const updatedUser = await loggedInUser.save();

    res.json({
      message: 'User updated succesfully',
      data: updatedUser,
    });
  } catch (err) {
    res.status(400).send(`${err}`);
  }
});

profileRouter;

export default profileRouter;
