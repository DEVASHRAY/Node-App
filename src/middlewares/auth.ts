import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user';

const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      throw new Error('Token not found');
    }

    const decodedObj = await jwt.verify(
      token,
      process.env.JWT_SECRET_KEY as string
    );

    const { userId }: any = decodedObj;

    if (!userId) {
      throw new Error('Invalid Token');
    }

    const user = await User.findById(userId);

    if (!user) {
      throw new Error('User Not Found');
    }

    (req as any).user = user;
    next();
  } catch (err) {
    res.status(400).send(`${err}`);
  }
};

export default authMiddleware;
