/* eslint-disable no-console */
/**
 * Dev-only seed for the `user_fitness_activities` collection.
 *
 * Seeds the last 7 days of realistic activity for ONE user so the Activity
 * Details screen (rings, charts, streak, peak hour, recovery) has data to show.
 *
 * Usage:
 *   node scripts/seed-fitness-activity.js                         # defaults to email below
 *   node scripts/seed-fitness-activity.js --email someone@x.com
 *   node scripts/seed-fitness-activity.js --uid <firebase/jwt-uid>
 *   node scripts/seed-fitness-activity.js --clear --email a@b.com # wipe this user's days first
 *
 * It looks the user up in the `users` collection (by email or uid), grabs the
 * real _id, and writes one upserted document per day. No app code is touched.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const { randomUUID } = require('crypto');

const DEFAULT_EMAIL = 'ajay.poddar15fea@gmail.com';

function parseArgs(argv) {
  const args = { clear: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--email') args.email = argv[++i];
    else if (a === '--uid') args.uid = argv[++i];
    else if (a === '--clear') args.clear = true;
  }
  if (!args.email && !args.uid) args.email = DEFAULT_EMAIL;
  return args;
}

const createUid = () => randomUUID().replace(/-/g, '');

const startOfDayUTC = (d) =>
  new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));

const addDays = (d, n) => {
  const r = new Date(d);
  r.setUTCDate(r.getUTCDate() + n);
  return r;
};

const rand = (min, max) => Math.round(min + Math.random() * (max - min));

/** Build a believable active-hours distribution peaking in the evening. */
function buildActiveHours() {
  const hours = [7, 8, 12, 13, 17, 18, 19, 20];
  return hours.map((hour) => ({
    hour,
    // Evening hours (17-20) get heavier weighting -> peak hour lands there.
    activityCount: hour >= 17 && hour <= 20 ? rand(20, 60) : rand(2, 18),
  }));
}

async function main() {
  const { email, uid, clear } = parseArgs(process.argv);
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/fitness_app';

  await mongoose.connect(mongoUri);
  console.log(`Connected to database: ${mongoose.connection.name}`);

  const users = mongoose.connection.collection('users');
  const query = email ? { email: String(email).toLowerCase().trim() } : { uid };
  const user = await users.findOne(query);

  if (!user) {
    console.error(
      `❌ No user found for ${email ? `email "${email}"` : `uid "${uid}"`}.` +
        ` Register/login that account first, or pass --email / --uid.`,
    );
    await mongoose.disconnect();
    process.exit(1);
  }

  console.log(`👤 Seeding for user: ${user.email} (_id=${user._id})`);

  const activities = mongoose.connection.collection('user_fitness_activities');

  if (clear) {
    const del = await activities.deleteMany({ userId: user._id });
    console.log(`🧹 Cleared ${del.deletedCount} existing day(s) for this user.`);
  }

  const today = startOfDayUTC(new Date());
  const now = new Date();
  let upserts = 0;

  for (let i = 6; i >= 0; i--) {
    const date = addDays(today, -i);

    const steps = rand(4000, 13000);
    const caloriesBurned = rand(180, 520);
    const distanceKm = +(steps * 0.00075).toFixed(2); // ~0.75m per step
    const workoutDurationMinutes = rand(0, 75);

    await activities.updateOne(
      { userId: user._id, date },
      {
        $set: {
          steps,
          caloriesBurned,
          distanceKm,
          workoutDurationMinutes,
          activeHours: buildActiveHours(),
          updatedAt: now,
        },
        $setOnInsert: {
          userId: user._id,
          date,
          uid: createUid(),
          createdAt: now,
        },
      },
      { upsert: true },
    );
    upserts++;
    console.log(
      `  ${date.toISOString().slice(0, 10)}  steps=${steps}  kcal=${caloriesBurned}  ` +
        `dist=${distanceKm}km  dur=${workoutDurationMinutes}min`,
    );
  }

  console.log(`✅ Seeded ${upserts} day(s) into user_fitness_activities.`);
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error('Seed failed:', err);
  try {
    await mongoose.disconnect();
  } catch (e) {}
  process.exit(1);
});
