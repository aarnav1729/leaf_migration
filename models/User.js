// models/User.js

const mongoose = require('mongoose');

// Define the User Schema
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      required: [true, 'Username is required'],
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
    },
    email: {
      type: String,
      unique: true,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please fill a valid email address',
      ],
    },
    contactNumber: {
      type: String,
      unique: true,
      required: [true, 'Contact Number is required'],
      trim: true,
      match: [
        /^\d{10}$/,
        'Contact Number must be exactly 10 digits',
      ],
    },
    role: {
      type: String,
      enum: ['vendor', 'factory'],
      required: [true, 'Role is required'],
      lowercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved'],
      default: 'pending',
      lowercase: true,
      trim: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Optional: Pre-save Hook to Hash Passwords (If you decide to handle hashing here)
// Note: For migration purposes, hashing is handled in the migration script.
// Uncomment the following block if you want to enable hashing within the model.

// const bcrypt = require('bcrypt');

// userSchema.pre('save', async function (next) {
//   if (!this.isModified('password')) {
//     return next();
//   }
//   try {
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
//     next();
//   } catch (error) {
//     next(error);
//   }
// });

// Export the User Model
module.exports = mongoose.model('User', userSchema);