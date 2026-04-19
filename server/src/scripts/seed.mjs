import dotenv from 'dotenv';
import mongoose from 'mongoose';

import { DEFAULT_LMS_DATA } from '../data/defaultLmsData.js';
import { AppData } from '../models/AppData.js';
import { seedDefaultAppData } from '../services/appData.service.js';

dotenv.config();

const args = process.argv.slice(2);
const shouldReset = args.includes('--reset');

await mongoose.connect(process.env.MONGODB_URI);

if (shouldReset) {
	await AppData.deleteMany({});
}

await seedDefaultAppData(DEFAULT_LMS_DATA);

// eslint-disable-next-line no-console
console.log(shouldReset ? 'Reset + seeded default LMS data' : 'Seeded default LMS data');
await mongoose.disconnect();
