import mongoose from 'mongoose';
import { CONNECTION_REQUEST_STATUS_MAPPING } from '../utils/constants';

const connectionRequestSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // reference To the user collection i.e link it to User Collection
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: [
          CONNECTION_REQUEST_STATUS_MAPPING.interested,
          CONNECTION_REQUEST_STATUS_MAPPING.ignore,
          CONNECTION_REQUEST_STATUS_MAPPING.reject,
          CONNECTION_REQUEST_STATUS_MAPPING.accept,
        ],
        message: `{VALUE} is not supported`,
      },
    },
  },
  {
    timestamps: true,
  }
);

connectionRequestSchema.index({ senderId: 1, receiverId: 1 });

connectionRequestSchema.pre('save', function (next) {
  const connectionRequest = this;

  if (connectionRequest.senderId.equals(connectionRequest.receiverId)) {
    throw new Error('Sender and Receiver id cannot be same');
  }

  next();
});

const ConnectionRequest = mongoose.model(
  'ConnectionRequest',
  connectionRequestSchema
);

export default ConnectionRequest;
