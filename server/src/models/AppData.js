import mongoose from 'mongoose';

const { Schema } = mongoose;

const AppDataSchema = new Schema(
  {
    key: { type: String, required: true, trim: true, unique: true, index: true },
    payload: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

export const AppData = mongoose.models.AppData || mongoose.model('AppData', AppDataSchema);
