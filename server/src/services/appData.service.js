import { AppData } from '../models/AppData.js';

export async function seedDefaultAppData(defaultsByKey) {
  const keys = Object.keys(defaultsByKey);
  for (const key of keys) {
    await AppData.updateOne(
      { key },
      { $setOnInsert: { key, payload: defaultsByKey[key] } },
      { upsert: true }
    );
  }
}

export async function getOrCreateAppDataPayload(key, seedPayload) {
  const existing = await AppData.findOne({ key }).lean();
  if (existing) return existing.payload;

  try {
    const created = await AppData.create({ key, payload: seedPayload });
    return created.payload;
  } catch (err) {
    // Handle race condition when multiple requests try to seed the same key.
    if (err?.code === 11000) {
      const doc = await AppData.findOne({ key }).lean();
      return doc?.payload ?? seedPayload;
    }
    throw err;
  }
}
