import dotenv from 'dotenv';
import mongoose from 'mongoose';

import { DEFAULT_LMS_DATA } from '../data/defaultLmsData.js';
import { seedDefaultAppData } from '../services/appData.service.js';

dotenv.config();

await mongoose.connect(process.env.MONGODB_URI);
await seedDefaultAppData(DEFAULT_LMS_DATA);

// eslint-disable-next-line no-console
console.log('Seeded default LMS data');
await mongoose.disconnect();
