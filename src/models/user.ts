import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import validator from 'validator';
import becrypt from 'bcrypt';

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

userSchema.methods.getJWT = async function () {
  const user: any = this;

  const token = await jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET_KEY as string,
    { expiresIn: '1hr' }
  );

  return token;
};

userSchema.methods.validatePassword = async function (password: string) {
  const user: any = this;

  const storedPasswordfHash = user.password;

  const isPasswrodValid = await becrypt.compare(password, storedPasswordfHash);

  return isPasswrodValid;
};

const User = mongoose.model('User', userSchema);

export default User;
