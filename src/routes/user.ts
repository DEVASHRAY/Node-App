import express from 'express';
import ConnectionRequest from '../models/connectionRequest';
import {
  CONNECTION_REQUEST_STATUS_MAPPING,
  USER_SAFE_DATA,
} from '../utils/constants';

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

export default userRouter;
