import mongoose from 'mongoose';

const { Schema } = mongoose;

const ScheduleSchema = new Schema(
  {
    branchId:   { type: String, required: true, trim: true, maxlength: 64, index: true },
    intakeId:   { type: String, required: true, trim: true, maxlength: 64, index: true },
    batchId:    { type: String, required: true, trim: true, maxlength: 64, index: true },

    subject:    { type: String, required: true, trim: true, maxlength: 200 },
    date:       { type: String, required: true, trim: true, maxlength: 20 },  // YYYY-MM-DD
    startTime:  { type: String, required: true, trim: true, maxlength: 10 },  // HH:MM
    endTime:    { type: String, required: true, trim: true, maxlength: 10 },  // HH:MM
    room:       { type: String, required: true, trim: true, maxlength: 200 },
    notes:      { type: String, trim: true, maxlength: 1000, default: '' },

    lecturerName: { type: String, trim: true, maxlength: 120, default: '' },
    lecturerId:   { type: String, trim: true, maxlength: 64, default: '' },

    addedBy:     { type: String, required: true, trim: true, maxlength: 64 }, // admin id
    addedByName: { type: String, required: true, trim: true, maxlength: 120 },
    addedByRole: { type: String, trim: true, maxlength: 30, default: 'staff' },
  },
  { timestamps: true }
);

ScheduleSchema.index({ branchId: 1, intakeId: 1, batchId: 1, date: 1 });

export const Schedule = mongoose.models.Schedule || mongoose.model('Schedule', ScheduleSchema);
