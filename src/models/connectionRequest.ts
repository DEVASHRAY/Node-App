import mongoose from 'mongoose';
import { CONNECTION_REQUEST_STATUS_MAPPING } from '../utils/constants';

const connectionRequestSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: [
          CONNECTION_REQUEST_STATUS_MAPPING.interested,
          CONNECTION_REQUEST_STATUS_MAPPING.ignored,
          CONNECTION_REQUEST_STATUS_MAPPING.accepted,
          CONNECTION_REQUEST_STATUS_MAPPING.rejected,
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
