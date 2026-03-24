/* eslint-disable no-console */
require('dotenv').config();
const mongoose = require('mongoose');
const { randomUUID } = require('crypto');

function createUid() {
  return randomUUID().replace(/-/g, '');
}

async function backfillCollection(collectionName) {
  const collection = mongoose.connection.collection(collectionName);
  const now = new Date();

  const cursor = collection.find({ $or: [{ uid: { $exists: false } }, { uid: null }, { uid: '' }] });
  let updatedUidCount = 0;

  while (await cursor.hasNext()) {
    const doc = await cursor.next();
    await collection.updateOne(
      { _id: doc._id },
      {
        $set: {
          uid: createUid(),
          updatedAt: doc.updatedAt || now,
          createdAt: doc.createdAt || now,
        },
      },
    );
    updatedUidCount += 1;
  }

  const updatedTimestampResult = await collection.updateMany(
    {
      $or: [{ updatedAt: { $exists: false } }, { createdAt: { $exists: false } }],
    },
    {
      $set: {
        updatedAt: now,
        createdAt: now,
      },
    },
  );

  console.log(
    `[${collectionName}] added uid for ${updatedUidCount} docs; timestamp backfill matched ${updatedTimestampResult.matchedCount}`,
  );
}

async function main() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/fitness_app';
  await mongoose.connect(mongoUri);
  console.log(`Connected to database: ${mongoose.connection.name}`);

  await backfillCollection('workout_types');
  await backfillCollection('muscle_groups');
  await backfillCollection('exercises');
  await backfillCollection('exercise_logs');
  await backfillCollection('workouts');

  await mongoose.disconnect();
  console.log('Backfill completed successfully.');
}

main().catch(async (error) => {
  console.error('Backfill failed:', error);
  try {
    await mongoose.disconnect();
  } catch (disconnectError) {
    console.error('Disconnect failed:', disconnectError);
  }
  process.exit(1);
});
