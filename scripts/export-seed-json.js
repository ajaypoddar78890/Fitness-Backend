require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/fitness_app';
const outputDir = path.join(__dirname, 'seed-data');

async function exportCollections() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('[MongoDB] Connected');

    const db = mongoose.connection.db;

    // Collections to export
    const collections = [
      '01_users',
      '02_workout_types',
      '03_muscle_groups',
      '04_exercises',
      '05_workouts',
      '06_exercise_logs',
      '07_nutritions',
    ];

    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    for (const collName of collections) {
      const actualName = collName.substring(3); // Remove numbering for actual collection name
      const documents = await db.collection(actualName).find({}).toArray();

      // Convert ObjectIds to MongoDB Extended JSON format for Compass
      const exported = documents.map(doc => convertToExtendedJson(doc));

      const filePath = path.join(outputDir, `${collName}.json`);
      fs.writeFileSync(filePath, JSON.stringify(exported, null, 2));
      console.log(`[${actualName}] exported ${documents.length} documents to ${collName}.json`);
    }

    console.log('\n✅ All collections exported to seed-data/');
    process.exit(0);
  } catch (error) {
    console.error('❌ Export failed:', error.message);
    process.exit(1);
  }
}

function convertToExtendedJson(obj) {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (obj instanceof mongoose.Types.ObjectId) {
    return { $oid: obj.toString() };
  }

  if (obj instanceof Date) {
    return { $date: obj.toISOString() };
  }

  if (Array.isArray(obj)) {
    return obj.map(convertToExtendedJson);
  }

  if (typeof obj === 'object') {
    const converted = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        converted[key] = convertToExtendedJson(obj[key]);
      }
    }
    return converted;
  }

  return obj;
}

exportCollections();
