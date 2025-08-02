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

    const connectionRequestList = await ConnectionRequest.find({
      receiverId: user._id,
      status: CONNECTION_REQUEST_STATUS_MAPPING.interested,
    })
      .populate('senderId', USER_SAFE_DATA)
      .populate('receiverId', ['firstName']);

    res.json({
      message: 'Data Fetched Successfully',
      data: connectionRequestList,
    });
  } catch (err: any) {
    res.status(400).json({
      message: 'Failed to fetch received connection requests',
      error: err.message,
    });
  }
});

userRouter.get('/user/connection', async (req, res) => {
  try {
    const user = (req as any).user;

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

    // Normalize response to return only the other user
    const normalizedConnections = connectionList.map((item) => {
      const isSender = item.senderId._id.toString() === user._id.toString();
      const OtherUserDetailsDoc: any = isSender
        ? item.receiverId
        : item.senderId;

      return {
        connectionId: item._id,
        connectedUserDetails: OtherUserDetailsDoc,
        connectedAt: item.updatedAt,
      };
    });

    res.json({
      message: 'Connection fetched successfully',
      data: normalizedConnections,
    });
  } catch (err: any) {
    res.status(400).json({
      message: 'Failed to fetch connections',
      error: err.message,
    });
  }
});

userRouter.get('/user/feed', async (req, res) => {
  try {
    const { user } = req as any;

    const params = req.query as any;

    const page = +params.page || 1;
    const limit = +params.limit || 10;

    const allConnectionRequestForUser = await ConnectionRequest.find({
      $or: [
        {
          senderId: user._id,
        },
        {
          receiverId: user._id,
        },
      ],
    }).select('senderId receiverId status');

    const hideUsersFromFeed = new Set();

    allConnectionRequestForUser.forEach((item) => {
      hideUsersFromFeed.add(item.senderId.toString());
      hideUsersFromFeed.add(item.receiverId.toString());
    });

    const feedUsers = await User.find({
      $and: [
        {
          _id: { $nin: Array.from(hideUsersFromFeed) },
        },
        {
          _id: { $ne: user._id },
        },
      ],
    })
      .select(USER_SAFE_DATA)
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      data: feedUsers,
    });
  } catch (err: any) {
    res.status(400).json({
      message: 'Unable to get feed',
      error: err.message,
    });
  }
});

export default userRouter;
