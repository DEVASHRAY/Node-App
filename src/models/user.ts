import mongoose from 'mongoose';
import validator from 'validator';
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 4,
      maxLength: 30,
    },
    lastName: {
      type: String,
    },
    emailId: {
      type: String,
      required: true,
      unique: true,
      lowercase: true, // <----- Use this
      trim: true, // <----- Use this
      validate(value: string) {
        if (!validator.isEmail(value)) {
          throw new Error(value);
        }
      },
    },
    password: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      lowercase: true,
    },
    gender: {
      type: String,
      min: 18,
      validate(value: string) {
        if (!['male', 'female', 'others'].includes(value.toLowerCase())) {
          throw new Error('Gender is not valid');
        }
      },
    },
    photoUrl: {
      type: String,
      default: 'https://www.example.com/profile_pic.png', // <----- Use this
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);

export default User;
