import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect(
      'mongodb+srv://Devashray:Qwertyuiop%400611.@devtindercluster.xmq8ffu.mongodb.net/devTinder'
    );
    console.log('Database connection established');
  } catch (err) {
    console.log('Error Connecting Database', err);
  }
};

export default connectDB;
