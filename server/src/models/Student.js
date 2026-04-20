import mongoose from 'mongoose';

const { Schema } = mongoose;

const StudentSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true, maxlength: 120 },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
      unique: true,
      index: true,
    },
    studentId: { type: String, required: true, trim: true, maxlength: 40, unique: true, index: true },

    nic: { type: String, trim: true, maxlength: 40 },
    course: { type: String, trim: true, maxlength: 120 },

    whatsappNumber: { type: String, trim: true, maxlength: 30 },
    phoneNumber: { type: String, trim: true, maxlength: 30 },
    address: { type: String, trim: true, maxlength: 300 },

    guardianName: { type: String, trim: true, maxlength: 120 },
    guardianPhoneNumber: { type: String, trim: true, maxlength: 30 },

    // Academic hierarchy association (set when registering via a batch invite link)
    facultyId: { type: String, trim: true, maxlength: 64, index: true },
    programId: { type: String, trim: true, maxlength: 64, index: true },
    intakeId: { type: String, trim: true, maxlength: 64, index: true },

    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

export const Student = mongoose.models.Student || mongoose.model('Student', StudentSchema);
