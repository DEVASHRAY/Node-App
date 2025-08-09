import express from 'express';
import ConnectionRequest from '../models/connectionRequest';
import {
  CONNECTION_REQUEST_STATUS_MAPPING,
  USER_SAFE_DATA,
} from '../utils/constants';
import User from '../models/user';

const userRouter = express.Router();

userRouter.get('/user/request/received', async (req, res) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const connectionRequestList = await ConnectionRequest.find({
      receiverId: user._id,
      status: CONNECTION_REQUEST_STATUS_MAPPING.interested,
    })
      .populate('senderId', USER_SAFE_DATA)
      .populate('receiverId', ['firstName']);

    res.status(200).json({
      message: 'Data fetched successfully',
      data: connectionRequestList,
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({
      message: 'Failed to fetch received connection requests',
      error: err.message,
    });
  }
});

userRouter.get('/user/connection', async (req, res) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const connectionList = await ConnectionRequest.find({
      $or: [
        {
          senderId: user._id,
          status: CONNECTION_REQUEST_STATUS_MAPPING.accept,
        },
        {
          receiverId: user._id,
          status: CONNECTION_REQUEST_STATUS_MAPPING.accept,
        },
      ],
    })
      .populate('senderId', USER_SAFE_DATA)
      .populate('receiverId', USER_SAFE_DATA);

    const normalizedConnections = connectionList.map((item) => {
      const isSender = item.senderId._id.toString() === user._id.toString();
      const otherUser: any = isSender ? item.receiverId : item.senderId;
      return {
        connectionId: item._id,
        connectedUserDetails: otherUser,
        connectedAt: item.updatedAt,
      };
    });

    res.status(200).json({
      message: 'Connections fetched successfully',
      data: normalizedConnections,
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({
      message: 'Failed to fetch connections',
      error: err.message,
    });
  }
});

userRouter.get('/user/feed', async (req, res) => {
  try {
    const { user } = req as any;
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const allConnectionRequestForUser = await ConnectionRequest.find({
      $or: [{ senderId: user._id }, { receiverId: user._id }],
    }).select('senderId receiverId status');

    const hideUsersFromFeed = new Set<string>();
    allConnectionRequestForUser.forEach((item) => {
      hideUsersFromFeed.add(item.senderId.toString());
      hideUsersFromFeed.add(item.receiverId.toString());
    });

    const feedUsers = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideUsersFromFeed) } },
        { _id: { $ne: user._id } },
      ],
    })
      .select(USER_SAFE_DATA)
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      message: 'Feed fetched successfully',
      data: feedUsers,
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({
      message: 'Unable to get feed',
      error: err.message,
    });
  }
});

export default userRouter;
