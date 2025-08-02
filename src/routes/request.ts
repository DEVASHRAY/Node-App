import express from 'express';
import ConnectionRequest from '../models/connectionRequest';
import { CONNECTION_REQUEST_STATUS_MAPPING } from '../utils/constants';
import User from '../models/user';

const requestRouter = express.Router();

requestRouter.post('/request/send/:status/:receiverId', async (req, res) => {
  try {
    const user = (req as any).user;

    const senderId = user._id;
    const receiverId = req.params.receiverId;

    const status =
      CONNECTION_REQUEST_STATUS_MAPPING[
        req.params.status as keyof typeof CONNECTION_REQUEST_STATUS_MAPPING
      ];

    const allowedStatus = [
      CONNECTION_REQUEST_STATUS_MAPPING.ignored,
      CONNECTION_REQUEST_STATUS_MAPPING.interested,
    ];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        message: 'Invalid Status Received',
        status: req.params.status,
      });
    }

    const isReceiverIdExist = await User.findById(receiverId);

    if (!isReceiverIdExist) {
      return res
        .status(400)
        .json({ message: 'Invalid Receiver Id', receiverId });
    }

    const isExistingtConnectionRequestExist = await ConnectionRequest.findOne({
      $or: [
        {
          senderId,
          receiverId,
        },
        {
          senderId: receiverId,
          receiverId: senderId,
        },
      ],
    });

    if (isExistingtConnectionRequestExist) {
      return res.status(400).json({
        message: 'Connection already exist',
        connectionStatus: isExistingtConnectionRequestExist.status,
      });
    }

    const connectionRequest = new ConnectionRequest({
      senderId,
      receiverId,
      status,
    });

    const data = await connectionRequest.save();

    res.json({
      message: 'Connection request ' + status,
      data,
    });
  } catch (err: any) {
    return res.status(400).json({
      message: 'Error: ' + err.message,
    });
  }
});

export default requestRouter;
