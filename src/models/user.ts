import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcrypt';
import { JWT_SECRET_KEY } from '../constants';

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
      lowercase: true,
      trim: true,
      validate(value: string) {
        if (!validator.isEmail(value)) {
          throw new Error(`Invalid email: ${value}`);
        }
      },
    },
    password: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      min: 18,
    },
    gender: {
      type: String,
      validate(value: string) {
        if (!['male', 'female'].includes(value.toLowerCase())) {
          throw new Error('Gender is not valid');
        }
      },
    },
    photoUrl: {
      type: String,
      default: function () {
        const defaults: Record<string, string> = {
          male: 'https://static.vecteezy.com/system/resources/previews/024/183/502/non_2x/male-avatar-portrait-of-a-young-man-with-a-beard-illustration-of-male-character-in-modern-color-style-vector.jpg',
          female:
            'https://t4.ftcdn.net/jpg/08/23/95/89/360_F_823958944_1c9covIC7Tl7eyJtWoTiXc0L4vP6f43q.jpg',
        };
        const gender =
          typeof (this as any).gender === 'string'
            ? (this as any).gender.toLowerCase()
            : '';
        return defaults[gender] || 'https://www.example.com/profile_pic.png';
      },
    },
  },
  {
    timestamps: true,
  }
);

// Automatically update photoUrl when gender changes
userSchema.pre('save', function (next) {
  if (this.isModified('gender')) {
    const defaults: Record<string, string> = {
      male: 'https://static.vecteezy.com/system/resources/previews/024/183/502/non_2x/male-avatar-portrait-of-a-young-man-with-a-beard-illustration-of-male-character-in-modern-color-style-vector.jpg',
      female:
        'https://t4.ftcdn.net/jpg/08/23/95/89/360_F_823958944_1c9covIC7Tl7eyJtWoTiXc0L4vP6f43q.jpg',
    };
    const gender =
      typeof this.gender === 'string' ? this.gender.toLowerCase() : '';
    this.photoUrl =
      defaults[gender] || 'https://www.example.com/profile_pic.png';
  }
  next();
});

// Generate JWT
userSchema.methods.getJWT = async function () {
  const user: any = this;

  return jwt.sign({ userId: user._id }, JWT_SECRET_KEY as string, {
    expiresIn: '1h',
  });
};

// Validate password
userSchema.methods.validatePassword = async function (password: string) {
  const user: any = this;
  return bcrypt.compare(password, user.password);
};

const User = mongoose.model('User', userSchema);

export default User;
