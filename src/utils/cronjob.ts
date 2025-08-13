import cron from 'node-cron';
import { endOfDay, startOfDay, subDays } from 'date-fns';
import ConnectionRequest from '../models/connectionRequest';
import { CONNECTION_REQUEST_STATUS_MAPPING } from './constants';

cron.schedule('* 8 * * *', async () => {
  try {
    const yesterday = subDays(new Date(), 1);

    const yesterdayStart = startOfDay(yesterday);
    const yesterdayEnd = endOfDay(yesterday);

    const pendingRequest = await ConnectionRequest.find({
      status: CONNECTION_REQUEST_STATUS_MAPPING.interested,
      createdAt: {
        $gte: yesterdayStart, // "Greater than or equal to" the start of yesterday
        $lt: yesterdayEnd, // "Less than" the end of yesterday
      },
    }).populate('receiverId');

    const listOfEmails = [
      ...new Set(pendingRequest.map((req: any) => req.receiverId.emailId)),
    ];

    // Send Emails
    console.log('listOfEmails', listOfEmails);

    // You can use listOfEmails here as needed, e.g., send notifications
  } catch (err) {
    console.log(err);
  }
});
