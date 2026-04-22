import mongoose from 'mongoose';

const { Schema } = mongoose;

const AdminSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
      unique: true,
      index: true,
    },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      trim: true,
      enum: ['superadmin', 'staff'],
      default: 'staff',
    },
  },
  { timestamps: true }
);

export const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);
