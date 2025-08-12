import mongoose from 'mongoose';

const connectDB = async () => {
  console.log(
    'process.env.DB_CONNECTION_SECRET',
    process.env.DB_CONNECTION_SECRET
  );

  if (!process.env.DB_CONNECTION_SECRET) {
    throw new Error('DB KEY NOT FOUND');
  }
  try {
    await mongoose.connect(process.env.DB_CONNECTION_SECRET);
    console.log('Database connection established');
  } catch (err) {
    console.log('Error Connecting Database', err);
  }
};

export default connectDB;
