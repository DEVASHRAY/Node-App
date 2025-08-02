import express from 'express';
import mongoose from 'mongoose';
import ConnectionRequest from '../models/connectionRequest';
import { CONNECTION_REQUEST_STATUS_MAPPING } from '../utils/constants';
import User from '../models/user';

const requestRouter = express.Router();

requestRouter.post('/request/send/:status/:receiverId', async (req, res) => {
  try {
    const user = (req as any).user;

    const senderId = user._id;
    const receiverId = req.params.receiverId;

    // Validate if the receiverId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({
        message: 'Invalid receiver ID format',
      });
    }

    const status =
      CONNECTION_REQUEST_STATUS_MAPPING[
        req.params.status as keyof typeof CONNECTION_REQUEST_STATUS_MAPPING
      ];

    const allowedStatus = [
      CONNECTION_REQUEST_STATUS_MAPPING.ignore,
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

requestRouter.post(
  '/request/review/:status/:connectionId',
  async (req, res) => {
    try {
      const user = (req as any).user;

      const allowedStatus = [
        CONNECTION_REQUEST_STATUS_MAPPING.reject,
        CONNECTION_REQUEST_STATUS_MAPPING.accept,
      ];

      const statusToBeUpdated =
        CONNECTION_REQUEST_STATUS_MAPPING[
          req.params.status as keyof typeof CONNECTION_REQUEST_STATUS_MAPPING
        ];

      if (!allowedStatus.includes(statusToBeUpdated)) {
        return res.status(400).json({
          message: `Invalid Status. Only "approved" or "rejected" is supported`,
        });
      }

      // Validate if the connectionId is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(req.params.connectionId)) {
        return res.status(400).json({
          message: 'Invalid connection ID format',
        });
      }

      const connectionRequestDoc = await ConnectionRequest.findOne({
        _id: new mongoose.Types.ObjectId(req.params.connectionId),
        receiverId: user._id,
        status: CONNECTION_REQUEST_STATUS_MAPPING.interested,
      });

      if (!connectionRequestDoc) {
        return res.status(404).json({
          message: `No 'interested' connection request found for ID ${req.params.connectionId} that belongs to the current user.`,
        });
      }

      connectionRequestDoc.status = statusToBeUpdated;

      const updatedDoc = await connectionRequestDoc.save();

      res.json({
        message: 'Connection status Updated Successfully',
        data: updatedDoc,
      });
    } catch (err: any) {
      res.status(400).send(err.message);
    }
  }
);

export default requestRouter;
