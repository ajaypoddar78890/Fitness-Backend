# Seed Data - MongoDB Fitness App

## Overview
Restored seed data for `fitness_app` database after 2-month inactivity loss. Includes 6 users (1 superadmin + 5 regular users), 5 workout types, 27 exercises, 12 workouts, and nutrition/exercise logs.

## Quick Start

### Option 1: Node Script (Recommended)
```bash
cd fitness-app-nest-full
node scripts/seed.js --clear
```

**Flags:**
- `--clear` — drops all collections before inserting (fresh start)
- No flags — additive insert (appends to existing data)

**Output:**
```
[MongoDB] Connected
[Collections] Cleared
[users] inserted 6 documents
[workout_types] inserted 5 documents
[muscle_groups] inserted 13 documents
[exercises] inserted 27 documents
[workouts] inserted 12 documents
[exercise_logs] inserted 18 documents
[nutritions] inserted 12 documents

✅ Seed data loaded successfully
```

### Option 2: MongoDB Compass (GUI Import)
1. Open **MongoDB Compass**
2. Connect to `mongodb://localhost:27017/fitness_app`
3. For each collection:
   - Right-click collection → "Import Data"
   - Select `scripts/seed-data/0X_collection-name.json`
   - Ensure "Extended JSON" format is selected
   - Click Import

**Order matters** (foreign key refs):
1. `01_users.json`
2. `02_workout_types.json`
3. `03_muscle_groups.json`
4. `04_exercises.json`
5. `05_workouts.json`
6. `06_exercise_logs.json`
7. `07_nutritions.json`

## Data Summary

### Users (6 total)
| Email | Name | Role | Password |
|-------|------|------|----------|
| ajay@athpro.com | Ajay Poddar | superadmin | Test@1234 |
| priya@athpro.com | Priya Sharma | user | Test@1234 |
| rahul@athpro.com | Rahul Mehta | user | Test@1234 |
| sara@athpro.com | Sara Khan | user | Test@1234 |
| dev@athpro.com | Dev Patel | user | Test@1234 |
| ananya@athpro.com | Ananya Roy | user | Test@1234 |

All passwords hashed with bcryptjs (saltRounds: 10).
Superadmin encoded in `preferences.role: 'superadmin'`.

### Workout Types (5)
- Strength 💪
- Cardio 🏃
- Yoga 🧘
- HIIT ⚡
- Flexibility 🤸

### Exercise Library (27 exercises)
5 muscle groups under Strength:
- Chest (4): Bench Press, Push-ups, Chest Fly, Incline Press
- Back (4): Deadlift, Pull-ups, Lat Pulldown, Bent-over Row
- Legs (4): Squats, Lunges, Leg Press, Romanian Deadlift
- Shoulders (3): Overhead Press, Lateral Raise, Front Raise
- Arms (3): Bicep Curl, Tricep Dip, Hammer Curl
- And more across Cardio, Yoga, HIIT, Flexibility

### Workouts (12 total)
2 per user. Each has:
- Name, duration, calories, difficulty
- Structured sections with exercises
- Equipment items
- Example: "Full Body Strength" (60 min, 500 kcal, intermediate)

### Exercise Logs (18 total)
3 per user. Tracks:
- Exercise performed
- Date, sets, reps, weight (kg)
- Notes, personal records

### Nutritions (12 total)
2 per user. Contains:
- Food items with calories and macros (protein/carbs/fat)
- Example: Chicken Breast (165 cal, 31g protein)

## Re-export Process

To refresh JSON files from updated MongoDB data:
```bash
node scripts/export-seed-json.js
```

Outputs: `scripts/seed-data/*.json` (Extended JSON format for Compass)

## API Verification

After seeding:

1. **Login (Superadmin)**
   ```bash
   POST /auth/login
   { "email": "ajay@athpro.com", "password": "Test@1234" }
   ```
   Returns: JWT token for authenticated requests

2. **Get Exercises**
   ```bash
   GET /exercises
   ```
   Returns: Array of 27 exercise documents

3. **Get User Workouts**
   ```bash
   GET /workouts
   Authorization: Bearer <token>
   ```
   Returns: 2 workouts for logged-in user

4. **Create Exercise Log**
   ```bash
   POST /exercise-logs
   {
     "exerciseId": "...",
     "userId": "...",
     "date": "2025-05-28T08:00:00Z",
     "sets": 3,
     "reps": 10,
     "weightKg": 50
   }
   ```

## Troubleshooting

**Error: "Can't connect to MongoDB"**
- Ensure MongoDB is running: `mongod` (or via Docker/Atlas)
- Check `.env` has correct `MONGO_URI`

**Error: "Duplicate key error"**
- Email addresses or UIDs already exist
- Use `--clear` flag: `node scripts/seed.js --clear`

**Compass Import Failed**
- Ensure "Extended JSON" format is selected (not "Default")
- Import in correct order (users first, nutritions last)
- Check collection doesn't already exist or use `--clear` first

## Files

- `seed.js` — Main seed script (connects to MongoDB, inserts documents)
- `export-seed-json.js` — Exports live data to JSON files
- `seed-data/` — JSON files for manual Compass import
  - `01_users.json`
  - `02_workout_types.json`
  - `03_muscle_groups.json`
  - `04_exercises.json`
  - `05_workouts.json`
  - `06_exercise_logs.json`
  - `07_nutritions.json`
