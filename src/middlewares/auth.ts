import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import User from '../models/user';
import { JWT_SECRET_KEY } from '../constants';

const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.cookies;

    console.log('JWT TOKEN :', token);

    if (!token) {
      return res.status(401).json({
        message: 'Authentication token is missing',
      });
    }

    // Decode token to check expiration without verification
    const decodedWithoutVerification = jwt.decode(token);
    console.log('Decoded token payload:', decodedWithoutVerification);

    if (
      decodedWithoutVerification &&
      typeof decodedWithoutVerification === 'object' &&
      'exp' in decodedWithoutVerification &&
      decodedWithoutVerification.exp
    ) {
      const expTime = new Date(decodedWithoutVerification.exp * 1000);
      const now = new Date();
      const diffInMinutes = (expTime.getTime() - now.getTime()) / (1000 * 60);

      console.log('Current time:', now.toISOString());
      console.log('Token expiration time:', expTime.toISOString());
      console.log('Time until expiration (minutes):', diffInMinutes);
      console.log('Token expired?', diffInMinutes < 0 ? 'YES' : 'NO');
    }

    let decodedObj: JwtPayload | string;
    try {
      decodedObj = jwt.verify(token, JWT_SECRET_KEY as string);
      console.log('Token verification successful');
    } catch (err) {
      console.log('Token verification failed:', err);
      return res.status(403).json({
        message: 'Invalid or expired authentication token',
      });
    }

    const { userId } = decodedObj as JwtPayload;

    if (!userId) {
      return res.status(403).json({
        message: 'Invalid authentication payload',
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    (req as any).user = user;
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Internal Server Error',
    });
  }
};

export default authMiddleware;
