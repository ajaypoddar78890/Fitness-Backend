require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/fitness_app';
const shouldClear = process.argv.includes('--clear');

function createUid() {
  return randomUUID().replace(/-/g, '');
}

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('[MongoDB] Connected');

    const db = mongoose.connection.db;

    // Pre-generate all ObjectIds
    const userIds = Array.from({ length: 6 }, () => new mongoose.Types.ObjectId());
    const [userAjay, userPriya, userRahul, userSara, userDev, userAnanya] = userIds;

    const workoutTypeIds = {
      strength: new mongoose.Types.ObjectId(),
      cardio: new mongoose.Types.ObjectId(),
      yoga: new mongoose.Types.ObjectId(),
      hiit: new mongoose.Types.ObjectId(),
      flexibility: new mongoose.Types.ObjectId(),
    };

    const muscleGroupIds = {
      // Strength
      chest: new mongoose.Types.ObjectId(),
      back: new mongoose.Types.ObjectId(),
      legs: new mongoose.Types.ObjectId(),
      shoulders: new mongoose.Types.ObjectId(),
      arms: new mongoose.Types.ObjectId(),
      // Cardio
      cardioFullBody: new mongoose.Types.ObjectId(),
      cardioLowerBody: new mongoose.Types.ObjectId(),
      // Yoga
      yogaCore: new mongoose.Types.ObjectId(),
      yogaHipFlexors: new mongoose.Types.ObjectId(),
      // HIIT
      hiitFullBody: new mongoose.Types.ObjectId(),
      hiitCore: new mongoose.Types.ObjectId(),
      // Flexibility
      flexibilityUpper: new mongoose.Types.ObjectId(),
      flexibilityLower: new mongoose.Types.ObjectId(),
    };

    // Exercise IDs
    const exerciseIds = {
      // Chest
      benchPress: new mongoose.Types.ObjectId(),
      pushups: new mongoose.Types.ObjectId(),
      chestFly: new mongoose.Types.ObjectId(),
      inclinePress: new mongoose.Types.ObjectId(),
      // Back
      deadlift: new mongoose.Types.ObjectId(),
      pullups: new mongoose.Types.ObjectId(),
      latPulldown: new mongoose.Types.ObjectId(),
      bentoverRow: new mongoose.Types.ObjectId(),
      // Legs
      squats: new mongoose.Types.ObjectId(),
      lunges: new mongoose.Types.ObjectId(),
      legPress: new mongoose.Types.ObjectId(),
      romanianDeadlift: new mongoose.Types.ObjectId(),
      // Shoulders
      overheadPress: new mongoose.Types.ObjectId(),
      lateralRaise: new mongoose.Types.ObjectId(),
      frontRaise: new mongoose.Types.ObjectId(),
      // Arms
      bicepCurl: new mongoose.Types.ObjectId(),
      tricepDip: new mongoose.Types.ObjectId(),
      hammerCurl: new mongoose.Types.ObjectId(),
      // Cardio/HIIT Full Body
      burpees: new mongoose.Types.ObjectId(),
      jumpRope: new mongoose.Types.ObjectId(),
      mountainClimbers: new mongoose.Types.ObjectId(),
      // Yoga Core/Hip
      plank: new mongoose.Types.ObjectId(),
      warriorPose: new mongoose.Types.ObjectId(),
      downwardDog: new mongoose.Types.ObjectId(),
      // Flexibility
      catCow: new mongoose.Types.ObjectId(),
      hipFlexorStretch: new mongoose.Types.ObjectId(),
      hamstringStretch: new mongoose.Types.ObjectId(),
    };

    if (shouldClear) {
      const collections = ['users', 'workout_types', 'muscle_groups', 'exercises', 'workouts', 'exercise_logs', 'nutritions'];
      for (const col of collections) {
        await db.collection(col).deleteMany({});
      }
      console.log('[Collections] Cleared');
    }

    // 1. Users
    const hashedPassword = await bcrypt.hash('Test@1234', 10);
    const usersData = [
      {
        _id: userAjay,
        email: 'ajay@athpro.com',
        password: hashedPassword,
        name: 'Ajay Poddar',
        isVerified: true,
        authProvider: 'email',
        lastLogin: new Date(),
        isActive: true,
        preferences: { role: 'superadmin' },
        profile: {
          age: 28,
          height: 180,
          weight: 78,
          gender: 'male',
          fitnessGoal: 'muscle_gain',
          activityLevel: 'very_active',
        },
        createdAt: new Date('2025-01-01T08:00:00Z'),
        updatedAt: new Date('2025-06-01T08:00:00Z'),
      },
      {
        _id: userPriya,
        email: 'priya@athpro.com',
        password: hashedPassword,
        name: 'Priya Sharma',
        isVerified: true,
        authProvider: 'email',
        lastLogin: new Date(),
        isActive: true,
        preferences: { role: 'user' },
        profile: {
          age: 26,
          height: 165,
          weight: 62,
          gender: 'female',
          fitnessGoal: 'weight_loss',
          activityLevel: 'moderately_active',
        },
        createdAt: new Date('2025-01-10T08:00:00Z'),
        updatedAt: new Date('2025-06-01T08:00:00Z'),
      },
      {
        _id: userRahul,
        email: 'rahul@athpro.com',
        password: hashedPassword,
        name: 'Rahul Mehta',
        isVerified: true,
        authProvider: 'email',
        lastLogin: new Date(),
        isActive: true,
        preferences: { role: 'user' },
        profile: {
          age: 30,
          height: 175,
          weight: 80,
          gender: 'male',
          fitnessGoal: 'muscle_gain',
          activityLevel: 'very_active',
        },
        createdAt: new Date('2025-01-15T08:00:00Z'),
        updatedAt: new Date('2025-06-01T08:00:00Z'),
      },
      {
        _id: userSara,
        email: 'sara@athpro.com',
        password: hashedPassword,
        name: 'Sara Khan',
        isVerified: true,
        authProvider: 'email',
        lastLogin: new Date(),
        isActive: true,
        preferences: { role: 'user' },
        profile: {
          age: 24,
          height: 168,
          weight: 65,
          gender: 'female',
          fitnessGoal: 'maintenance',
          activityLevel: 'lightly_active',
        },
        createdAt: new Date('2025-02-01T08:00:00Z'),
        updatedAt: new Date('2025-06-01T08:00:00Z'),
      },
      {
        _id: userDev,
        email: 'dev@athpro.com',
        password: hashedPassword,
        name: 'Dev Patel',
        isVerified: true,
        authProvider: 'email',
        lastLogin: new Date(),
        isActive: true,
        preferences: { role: 'user' },
        profile: {
          age: 29,
          height: 172,
          weight: 75,
          gender: 'male',
          fitnessGoal: 'endurance',
          activityLevel: 'very_active',
        },
        createdAt: new Date('2025-02-10T08:00:00Z'),
        updatedAt: new Date('2025-06-01T08:00:00Z'),
      },
      {
        _id: userAnanya,
        email: 'ananya@athpro.com',
        password: hashedPassword,
        name: 'Ananya Roy',
        isVerified: true,
        authProvider: 'email',
        lastLogin: new Date(),
        isActive: true,
        preferences: { role: 'user' },
        profile: {
          age: 27,
          height: 170,
          weight: 68,
          gender: 'female',
          fitnessGoal: 'muscle_gain',
          activityLevel: 'moderately_active',
        },
        createdAt: new Date('2025-02-15T08:00:00Z'),
        updatedAt: new Date('2025-06-01T08:00:00Z'),
      },
    ];
    await db.collection('users').insertMany(usersData);
    console.log(`[users] inserted ${usersData.length} documents`);

    // 2. Workout Types
    const workoutTypesData = [
      {
        _id: workoutTypeIds.strength,
        uid: createUid(),
        label: 'Strength',
        icon: '💪',
        createdAt: new Date('2025-01-01T08:00:00Z'),
        updatedAt: new Date('2025-06-01T08:00:00Z'),
      },
      {
        _id: workoutTypeIds.cardio,
        uid: createUid(),
        label: 'Cardio',
        icon: '🏃',
        createdAt: new Date('2025-01-01T08:00:00Z'),
        updatedAt: new Date('2025-06-01T08:00:00Z'),
      },
      {
        _id: workoutTypeIds.yoga,
        uid: createUid(),
        label: 'Yoga',
        icon: '🧘',
        createdAt: new Date('2025-01-01T08:00:00Z'),
        updatedAt: new Date('2025-06-01T08:00:00Z'),
      },
      {
        _id: workoutTypeIds.hiit,
        uid: createUid(),
        label: 'HIIT',
        icon: '⚡',
        createdAt: new Date('2025-01-01T08:00:00Z'),
        updatedAt: new Date('2025-06-01T08:00:00Z'),
      },
      {
        _id: workoutTypeIds.flexibility,
        uid: createUid(),
        label: 'Flexibility',
        icon: '🤸',
        createdAt: new Date('2025-01-01T08:00:00Z'),
        updatedAt: new Date('2025-06-01T08:00:00Z'),
      },
    ];
    await db.collection('workout_types').insertMany(workoutTypesData);
    console.log(`[workout_types] inserted ${workoutTypesData.length} documents`);

    // 3. Muscle Groups
    const muscleGroupsData = [
      // Strength
      { _id: muscleGroupIds.chest, uid: createUid(), workoutTypeId: workoutTypeIds.strength, label: 'Chest', createdAt: new Date('2025-01-01T08:00:00Z'), updatedAt: new Date('2025-06-01T08:00:00Z') },
      { _id: muscleGroupIds.back, uid: createUid(), workoutTypeId: workoutTypeIds.strength, label: 'Back', createdAt: new Date('2025-01-01T08:00:00Z'), updatedAt: new Date('2025-06-01T08:00:00Z') },
      { _id: muscleGroupIds.legs, uid: createUid(), workoutTypeId: workoutTypeIds.strength, label: 'Legs', createdAt: new Date('2025-01-01T08:00:00Z'), updatedAt: new Date('2025-06-01T08:00:00Z') },
      { _id: muscleGroupIds.shoulders, uid: createUid(), workoutTypeId: workoutTypeIds.strength, label: 'Shoulders', createdAt: new Date('2025-01-01T08:00:00Z'), updatedAt: new Date('2025-06-01T08:00:00Z') },
      { _id: muscleGroupIds.arms, uid: createUid(), workoutTypeId: workoutTypeIds.strength, label: 'Arms', createdAt: new Date('2025-01-01T08:00:00Z'), updatedAt: new Date('2025-06-01T08:00:00Z') },
      // Cardio
      { _id: muscleGroupIds.cardioFullBody, uid: createUid(), workoutTypeId: workoutTypeIds.cardio, label: 'Full Body', createdAt: new Date('2025-01-01T08:00:00Z'), updatedAt: new Date('2025-06-01T08:00:00Z') },
      { _id: muscleGroupIds.cardioLowerBody, uid: createUid(), workoutTypeId: workoutTypeIds.cardio, label: 'Lower Body', createdAt: new Date('2025-01-01T08:00:00Z'), updatedAt: new Date('2025-06-01T08:00:00Z') },
      // Yoga
      { _id: muscleGroupIds.yogaCore, uid: createUid(), workoutTypeId: workoutTypeIds.yoga, label: 'Core', createdAt: new Date('2025-01-01T08:00:00Z'), updatedAt: new Date('2025-06-01T08:00:00Z') },
      { _id: muscleGroupIds.yogaHipFlexors, uid: createUid(), workoutTypeId: workoutTypeIds.yoga, label: 'Hip Flexors', createdAt: new Date('2025-01-01T08:00:00Z'), updatedAt: new Date('2025-06-01T08:00:00Z') },
      // HIIT
      { _id: muscleGroupIds.hiitFullBody, uid: createUid(), workoutTypeId: workoutTypeIds.hiit, label: 'Full Body', createdAt: new Date('2025-01-01T08:00:00Z'), updatedAt: new Date('2025-06-01T08:00:00Z') },
      { _id: muscleGroupIds.hiitCore, uid: createUid(), workoutTypeId: workoutTypeIds.hiit, label: 'Core', createdAt: new Date('2025-01-01T08:00:00Z'), updatedAt: new Date('2025-06-01T08:00:00Z') },
      // Flexibility
      { _id: muscleGroupIds.flexibilityUpper, uid: createUid(), workoutTypeId: workoutTypeIds.flexibility, label: 'Upper Body', createdAt: new Date('2025-01-01T08:00:00Z'), updatedAt: new Date('2025-06-01T08:00:00Z') },
      { _id: muscleGroupIds.flexibilityLower, uid: createUid(), workoutTypeId: workoutTypeIds.flexibility, label: 'Lower Body', createdAt: new Date('2025-01-01T08:00:00Z'), updatedAt: new Date('2025-06-01T08:00:00Z') },
    ];
    await db.collection('muscle_groups').insertMany(muscleGroupsData);
    console.log(`[muscle_groups] inserted ${muscleGroupsData.length} documents`);

    // 4. Exercises
    const exercisesData = [
      // Chest
      { _id: exerciseIds.benchPress, uid: createUid(), muscleGroupId: muscleGroupIds.chest, workoutTypeId: workoutTypeIds.strength, name: 'Bench Press', imageUrl: '', summary: 'Primary chest exercise', equipment: 'barbell', difficulty: 'intermediate', instructions: 'Lie on bench, lower bar to chest, press up', techniqueSteps: ['Setup', 'Lower', 'Press'], durationSeconds: 45, createdAt: new Date('2025-01-01T08:00:00Z'), updatedAt: new Date('2025-06-01T08:00:00Z') },
      { _id: exerciseIds.pushups, uid: createUid(), muscleGroupId: muscleGroupIds.chest, workoutTypeId: workoutTypeIds.strength, name: 'Push-ups', imageUrl: '', summary: 'Bodyweight chest exercise', equipment: 'bodyweight', difficulty: 'beginner', instructions: 'Get in plank position, lower body, push back up', techniqueSteps: ['Position', 'Lower', 'Push'], durationSeconds: 30, createdAt: new Date('2025-01-01T08:00:00Z'), updatedAt: new Date('2025-06-01T08:00:00Z') },
      { _id: exerciseIds.chestFly, uid: createUid(), muscleGroupId: muscleGroupIds.chest, workoutTypeId: workoutTypeIds.strength, name: 'Chest Fly', imageUrl: '', summary: 'Isolation chest exercise', equipment: 'dumbbell', difficulty: 'intermediate', instructions: 'Lie on bench, bring dumbbells together in arc motion', techniqueSteps: ['Setup', 'Lower', 'Fly'], durationSeconds: 40, createdAt: new Date('2025-01-01T08:00:00Z'), updatedAt: new Date('2025-06-01T08:00:00Z') },
      { _id: exerciseIds.inclinePress, uid: createUid(), muscleGroupId: muscleGroupIds.chest, workoutTypeId: workoutTypeIds.strength, name: 'Incline Press', imageUrl: '', summary: 'Upper chest focus', equipment: 'barbell', difficulty: 'advanced', instructions: 'Press on incline bench', techniqueSteps: ['Setup', 'Lower', 'Press'], durationSeconds: 45, createdAt: new Date('2025-01-01T08:00:00Z'), updatedAt: new Date('2025-06-01T08:00:00Z') },
      // Back
      { _id: exerciseIds.deadlift, uid: createUid(), muscleGroupId: muscleGroupIds.back, workoutTypeId: workoutTypeIds.strength, name: 'Deadlift', imageUrl: '', summary: 'Main posterior chain exercise', equipment: 'barbell', difficulty: 'advanced', instructions: 'Stand with feet shoulder-width, grip bar, lift', techniqueSteps: ['Setup', 'Grip', 'Lift'], durationSeconds: 60, createdAt: new Date('2025-01-01T08:00:00Z'), updatedAt: new Date('2025-06-01T08:00:00Z') },
      { _id: exerciseIds.pullups, uid: createUid(), muscleGroupId: muscleGroupIds.back, workoutTypeId: workoutTypeIds.strength, name: 'Pull-ups', imageUrl: '', summary: 'Upper back bodyweight exercise', equipment: 'bodyweight', difficulty: 'intermediate', instructions: 'Hang on bar, pull body up', techniqueSteps: ['Grip', 'Pull', 'Lower'], durationSeconds: 30, createdAt: new Date('2025-01-01T08:00:00Z'), updatedAt: new Date('2025-06-01T08:00:00Z') },
      { _id: exerciseIds.latPulldown, uid: createUid(), muscleGroupId: muscleGroupIds.back, workoutTypeId: workoutTypeIds.strength, name: 'Lat Pulldown', imageUrl: '', summary: 'Machine lat exercise', equipment: 'machine', difficulty: 'beginner', instructions: 'Sit, pull handle down', techniqueSteps: ['Setup', 'Pull'], durationSeconds: 35, createdAt: new Date('2025-01-01T08:00:00Z'), updatedAt: new Date('2025-06-01T08:00:00Z') },
      { _id: exerciseIds.bentoverRow, uid: createUid(), muscleGroupId: muscleGroupIds.back, workoutTypeId: workoutTypeIds.strength, name: 'Bent-over Row', imageUrl: '', summary: 'Compound back builder', equipment: 'barbell', difficulty: 'intermediate', instructions: 'Bend at waist, row bar to chest', techniqueSteps: ['Setup', 'Hinge', 'Row'], durationSeconds: 45, createdAt: new Date('2025-01-01T08:00:00Z'), updatedAt: new Date('2025-06-01T08:00:00Z') },
      // Legs
      { _id: exerciseIds.squats, uid: createUid(), muscleGroupId: muscleGroupIds.legs, workoutTypeId: workoutTypeIds.strength, name: 'Squats', imageUrl: '', summary: 'Main leg compound', equipment: 'barbell', difficulty: 'beginner', instructions: 'Stand, lower hips back, rise', techniqueSteps: ['Setup', 'Lower', 'Rise'], durationSeconds: 50, createdAt: new Date('2025-01-01T08:00:00Z'), updatedAt: new Date('2025-06-01T08:00:00Z') },
      { _id: exerciseIds.lunges, uid: createUid(), muscleGroupId: muscleGroupIds.legs, workoutTypeId: workoutTypeIds.strength, name: 'Lunges', imageUrl: '', summary: 'Single leg exercise', equipment: 'bodyweight', difficulty: 'beginner', instructions: 'Step forward, lower hips, return', techniqueSteps: ['Step', 'Lower', 'Return'], durationSeconds: 35, createdAt: new Date('2025-01-01T08:00:00Z'), updatedAt: new Date('2025-06-01T08:00:00Z') },
      { _id: exerciseIds.legPress, uid: createUid(), muscleGroupId: muscleGroupIds.legs, workoutTypeId: workoutTypeIds.strength, name: 'Leg Press', imageUrl: '', summary: 'Machine leg compound', equipment: 'machine', difficulty: 'beginner', instructions: 'Push platform away', techniqueSteps: ['Setup', 'Lower', 'Press'], durationSeconds: 40, createdAt: new Date('2025-01-01T08:00:00Z'), updatedAt: new Date('2025-06-01T08:00:00Z') },
      { _id: exerciseIds.romanianDeadlift, uid: createUid(), muscleGroupId: muscleGroupIds.legs, workoutTypeId: workoutTypeIds.strength, name: 'Romanian Deadlift', imageUrl: '', summary: 'Hamstring focused', equipment: 'barbell', difficulty: 'intermediate', instructions: 'Hinge at hips, keep legs straight', techniqueSteps: ['Setup', 'Hinge', 'Lift'], durationSeconds: 45, createdAt: new Date('2025-01-01T08:00:00Z'), updatedAt: new Date('2025-06-01T08:00:00Z') },
      // Shoulders
      { _id: exerciseIds.overheadPress, uid: createUid(), muscleGroupId: muscleGroupIds.shoulders, workoutTypeId: workoutTypeIds.strength, name: 'Overhead Press', imageUrl: '', summary: 'Standing shoulder press', equipment: 'barbell', difficulty: 'intermediate', instructions: 'Press bar overhead', techniqueSteps: ['Setup', 'Press'], durationSeconds: 40, createdAt: new Date('2025-01-01T08:00:00Z'), updatedAt: new Date('2025-06-01T08:00:00Z') },
      { _id: exerciseIds.lateralRaise, uid: createUid(), muscleGroupId: muscleGroupIds.shoulders, workoutTypeId: workoutTypeIds.strength, name: 'Lateral Raise', imageUrl: '', summary: 'Side delt isolation', equipment: 'dumbbell', difficulty: 'beginner', instructions: 'Raise dumbbells to sides', techniqueSteps: ['Setup', 'Raise'], durationSeconds: 30, createdAt: new Date('2025-01-01T08:00:00Z'), updatedAt: new Date('2025-06-01T08:00:00Z') },
      { _id: exerciseIds.frontRaise, uid: createUid(), muscleGroupId: muscleGroupIds.shoulders, workoutTypeId: workoutTypeIds.strength, name: 'Front Raise', imageUrl: '', summary: 'Front delt exercise', equipment: 'dumbbell', difficulty: 'beginner', instructions: 'Raise dumbbells to front', techniqueSteps: ['Setup', 'Raise'], durationSeconds: 30, createdAt: new Date('2025-01-01T08:00:00Z'), updatedAt: new Date('2025-06-01T08:00:00Z') },
      // Arms
      { _id: exerciseIds.bicepCurl, uid: createUid(), muscleGroupId: muscleGroupIds.arms, workoutTypeId: workoutTypeIds.strength, name: 'Bicep Curl', imageUrl: '', summary: 'Bicep isolation', equipment: 'dumbbell', difficulty: 'beginner', instructions: 'Curl dumbbells up', techniqueSteps: ['Setup', 'Curl'], durationSeconds: 30, createdAt: new Date('2025-01-01T08:00:00Z'), updatedAt: new Date('2025-06-01T08:00:00Z') },
      { _id: exerciseIds.tricepDip, uid: createUid(), muscleGroupId: muscleGroupIds.arms, workoutTypeId: workoutTypeIds.strength, name: 'Tricep Dip', imageUrl: '', summary: 'Tricep bodyweight', equipment: 'bodyweight', difficulty: 'beginner', instructions: 'Lower and raise body on bars', techniqueSteps: ['Setup', 'Lower', 'Rise'], durationSeconds: 30, createdAt: new Date('2025-01-01T08:00:00Z'), updatedAt: new Date('2025-06-01T08:00:00Z') },
      { _id: exerciseIds.hammerCurl, uid: createUid(), muscleGroupId: muscleGroupIds.arms, workoutTypeId: workoutTypeIds.strength, name: 'Hammer Curl', imageUrl: '', summary: 'Brachialis exercise', equipment: 'dumbbell', difficulty: 'beginner', instructions: 'Curl with hammer grip', techniqueSteps: ['Setup', 'Curl'], durationSeconds: 30, createdAt: new Date('2025-01-01T08:00:00Z'), updatedAt: new Date('2025-06-01T08:00:00Z') },
      // Cardio/HIIT Full Body
      { _id: exerciseIds.burpees, uid: createUid(), muscleGroupId: muscleGroupIds.hiitFullBody, workoutTypeId: workoutTypeIds.hiit, name: 'Burpees', imageUrl: '', summary: 'Full body cardio blast', equipment: 'bodyweight', difficulty: 'intermediate', instructions: 'Squat, jump back, pushup, jump up', techniqueSteps: ['Squat', 'Jump Back', 'Pushup', 'Jump Up'], durationSeconds: 30, createdAt: new Date('2025-01-01T08:00:00Z'), updatedAt: new Date('2025-06-01T08:00:00Z') },
      { _id: exerciseIds.jumpRope, uid: createUid(), muscleGroupId: muscleGroupIds.cardioFullBody, workoutTypeId: workoutTypeIds.cardio, name: 'Jump Rope', imageUrl: '', summary: 'Cardio classic', equipment: 'bodyweight', difficulty: 'beginner', instructions: 'Jump while swinging rope', techniqueSteps: ['Setup', 'Jump'], durationSeconds: 300, createdAt: new Date('2025-01-01T08:00:00Z'), updatedAt: new Date('2025-06-01T08:00:00Z') },
      { _id: exerciseIds.mountainClimbers, uid: createUid(), muscleGroupId: muscleGroupIds.hiitFullBody, workoutTypeId: workoutTypeIds.hiit, name: 'Mountain Climbers', imageUrl: '', summary: 'HIIT core burner', equipment: 'bodyweight', difficulty: 'intermediate', instructions: 'Plank position, alternate knee drives', techniqueSteps: ['Plank', 'Drive'], durationSeconds: 30, createdAt: new Date('2025-01-01T08:00:00Z'), updatedAt: new Date('2025-06-01T08:00:00Z') },
      // Yoga Core/Hip
      { _id: exerciseIds.plank, uid: createUid(), muscleGroupId: muscleGroupIds.yogaCore, workoutTypeId: workoutTypeIds.yoga, name: 'Plank', imageUrl: '', summary: 'Core stability pose', equipment: 'bodyweight', difficulty: 'beginner', instructions: 'Hold plank position', techniqueSteps: ['Setup', 'Hold'], durationSeconds: 60, createdAt: new Date('2025-01-01T08:00:00Z'), updatedAt: new Date('2025-06-01T08:00:00Z') },
      { _id: exerciseIds.warriorPose, uid: createUid(), muscleGroupId: muscleGroupIds.yogaHipFlexors, workoutTypeId: workoutTypeIds.yoga, name: 'Warrior Pose', imageUrl: '', summary: 'Yoga standing pose', equipment: 'bodyweight', difficulty: 'beginner', instructions: 'Step forward, lower hips, reach up', techniqueSteps: ['Step', 'Lower', 'Reach'], durationSeconds: 45, createdAt: new Date('2025-01-01T08:00:00Z'), updatedAt: new Date('2025-06-01T08:00:00Z') },
      { _id: exerciseIds.downwardDog, uid: createUid(), muscleGroupId: muscleGroupIds.yogaHipFlexors, workoutTypeId: workoutTypeIds.yoga, name: 'Downward Dog', imageUrl: '', summary: 'Full body yoga stretch', equipment: 'bodyweight', difficulty: 'beginner', instructions: 'Form inverted V shape', techniqueSteps: ['Hands', 'Hips'], durationSeconds: 45, createdAt: new Date('2025-01-01T08:00:00Z'), updatedAt: new Date('2025-06-01T08:00:00Z') },
      // Flexibility
      { _id: exerciseIds.catCow, uid: createUid(), muscleGroupId: muscleGroupIds.flexibilityUpper, workoutTypeId: workoutTypeIds.flexibility, name: 'Cat-Cow', imageUrl: '', summary: 'Spine mobility stretch', equipment: 'bodyweight', difficulty: 'beginner', instructions: 'Alternate spinal flexion and extension', techniqueSteps: ['Cat', 'Cow'], durationSeconds: 45, createdAt: new Date('2025-01-01T08:00:00Z'), updatedAt: new Date('2025-06-01T08:00:00Z') },
      { _id: exerciseIds.hipFlexorStretch, uid: createUid(), muscleGroupId: muscleGroupIds.flexibilityLower, workoutTypeId: workoutTypeIds.flexibility, name: 'Hip Flexor Stretch', imageUrl: '', summary: 'Hip flexibility', equipment: 'bodyweight', difficulty: 'beginner', instructions: 'Step forward, sink hips', techniqueSteps: ['Step', 'Sink'], durationSeconds: 60, createdAt: new Date('2025-01-01T08:00:00Z'), updatedAt: new Date('2025-06-01T08:00:00Z') },
      { _id: exerciseIds.hamstringStretch, uid: createUid(), muscleGroupId: muscleGroupIds.flexibilityLower, workoutTypeId: workoutTypeIds.flexibility, name: 'Hamstring Stretch', imageUrl: '', summary: 'Posterior chain flexibility', equipment: 'bodyweight', difficulty: 'beginner', instructions: 'Bend forward, reach to toes', techniqueSteps: ['Bend', 'Reach'], durationSeconds: 60, createdAt: new Date('2025-01-01T08:00:00Z'), updatedAt: new Date('2025-06-01T08:00:00Z') },
    ];
    await db.collection('exercises').insertMany(exercisesData);
    console.log(`[exercises] inserted ${exercisesData.length} documents`);

    // 5. Workouts
    const workoutsData = [
      // Ajay
      {
        uid: createUid(),
        name: 'Full Body Strength',
        user: userAjay,
        imageUrl: '',
        description: 'Complete full body workout',
        duration: 60,
        caloriesKcal: 500,
        difficulty: 'intermediate',
        equipmentItems: [{ name: 'Barbell', icon: '🏋️' }],
        sections: [
          {
            title: 'Main Lifts',
            totalExercises: 3,
            totalMinutes: 40,
            items: [
              { type: 'exercise', exerciseId: exerciseIds.benchPress, title: 'Bench Press', reps: 8, durationLabel: '1 min rest' },
              { type: 'exercise', exerciseId: exerciseIds.squats, title: 'Squats', reps: 10, durationLabel: '1.5 min rest' },
              { type: 'exercise', exerciseId: exerciseIds.deadlift, title: 'Deadlift', reps: 5, durationLabel: '2 min rest' },
            ],
          },
          {
            title: 'Accessories',
            totalExercises: 2,
            totalMinutes: 20,
            items: [
              { type: 'exercise', exerciseId: exerciseIds.bicepCurl, title: 'Bicep Curl', reps: 12 },
              { type: 'exercise', exerciseId: exerciseIds.tricepDip, title: 'Tricep Dip', reps: 12 },
            ],
          },
        ],
        createdAt: new Date('2025-03-01T08:00:00Z'),
        updatedAt: new Date('2025-06-01T08:00:00Z'),
      },
      {
        uid: createUid(),
        name: 'HIIT Cardio Blast',
        user: userAjay,
        imageUrl: '',
        description: 'High intensity interval training',
        duration: 30,
        caloriesKcal: 350,
        difficulty: 'advanced',
        equipmentItems: [],
        sections: [
          {
            title: 'Warmup',
            totalExercises: 1,
            totalMinutes: 5,
            items: [{ type: 'rest', restSeconds: 300, durationLabel: 'Cardio warmup' }],
          },
          {
            title: 'Intervals',
            totalExercises: 3,
            totalMinutes: 20,
            items: [
              { type: 'exercise', exerciseId: exerciseIds.burpees, title: 'Burpees', durationLabel: '45 sec work' },
              { type: 'rest', restSeconds: 15, durationLabel: 'Rest' },
              { type: 'exercise', exerciseId: exerciseIds.mountainClimbers, title: 'Mountain Climbers', durationLabel: '45 sec work' },
              { type: 'rest', restSeconds: 15, durationLabel: 'Rest' },
              { type: 'exercise', exerciseId: exerciseIds.jumpRope, title: 'Jump Rope', durationLabel: '45 sec work' },
            ],
          },
        ],
        createdAt: new Date('2025-03-05T08:00:00Z'),
        updatedAt: new Date('2025-06-01T08:00:00Z'),
      },
      // Priya
      {
        uid: createUid(),
        name: 'Lower Body Focus',
        user: userPriya,
        imageUrl: '',
        description: 'Legs and glutes workout',
        duration: 45,
        caloriesKcal: 350,
        difficulty: 'intermediate',
        equipmentItems: [{ name: 'Dumbbells', icon: '🏋️' }],
        sections: [
          {
            title: 'Main Lifts',
            totalExercises: 3,
            items: [
              { type: 'exercise', exerciseId: exerciseIds.squats, title: 'Squats', reps: 10 },
              { type: 'exercise', exerciseId: exerciseIds.lunges, title: 'Lunges', reps: 12 },
              { type: 'exercise', exerciseId: exerciseIds.romanianDeadlift, title: 'Romanian Deadlift', reps: 8 },
            ],
          },
        ],
        createdAt: new Date('2025-03-10T08:00:00Z'),
        updatedAt: new Date('2025-06-01T08:00:00Z'),
      },
      {
        uid: createUid(),
        name: 'Yoga Flow',
        user: userPriya,
        imageUrl: '',
        description: 'Relaxing yoga session',
        duration: 50,
        caloriesKcal: 150,
        difficulty: 'beginner',
        equipmentItems: [],
        sections: [
          {
            title: 'Poses',
            totalExercises: 4,
            items: [
              { type: 'exercise', exerciseId: exerciseIds.downwardDog, title: 'Downward Dog', durationLabel: '1 min' },
              { type: 'exercise', exerciseId: exerciseIds.warriorPose, title: 'Warrior Pose', durationLabel: '1 min each side' },
              { type: 'exercise', exerciseId: exerciseIds.plank, title: 'Plank', durationLabel: '1 min' },
              { type: 'exercise', exerciseId: exerciseIds.catCow, title: 'Cat-Cow', durationLabel: '2 min' },
            ],
          },
        ],
        createdAt: new Date('2025-03-15T08:00:00Z'),
        updatedAt: new Date('2025-06-01T08:00:00Z'),
      },
      // Rahul
      {
        uid: createUid(),
        name: 'Back and Biceps',
        user: userRahul,
        imageUrl: '',
        description: 'Pull focus workout',
        duration: 50,
        caloriesKcal: 400,
        difficulty: 'intermediate',
        equipmentItems: [{ name: 'Barbell', icon: '🏋️' }, { name: 'Pull-up Bar', icon: '🤸' }],
        sections: [
          {
            title: 'Main Lifts',
            totalExercises: 4,
            items: [
              { type: 'exercise', exerciseId: exerciseIds.deadlift, title: 'Deadlift', reps: 6 },
              { type: 'exercise', exerciseId: exerciseIds.bentoverRow, title: 'Bent-over Row', reps: 8 },
              { type: 'exercise', exerciseId: exerciseIds.pullups, title: 'Pull-ups', reps: 10 },
              { type: 'exercise', exerciseId: exerciseIds.bicepCurl, title: 'Bicep Curl', reps: 12 },
            ],
          },
        ],
        createdAt: new Date('2025-03-20T08:00:00Z'),
        updatedAt: new Date('2025-06-01T08:00:00Z'),
      },
      {
        uid: createUid(),
        name: 'Chest Day',
        user: userRahul,
        imageUrl: '',
        description: 'Chest and shoulder workout',
        duration: 55,
        caloriesKcal: 450,
        difficulty: 'intermediate',
        equipmentItems: [{ name: 'Barbell', icon: '🏋️' }, { name: 'Dumbbells', icon: '🏋️' }],
        sections: [
          {
            title: 'Main Lifts',
            totalExercises: 5,
            items: [
              { type: 'exercise', exerciseId: exerciseIds.benchPress, title: 'Bench Press', reps: 8 },
              { type: 'exercise', exerciseId: exerciseIds.inclinePress, title: 'Incline Press', reps: 8 },
              { type: 'exercise', exerciseId: exerciseIds.chestFly, title: 'Chest Fly', reps: 10 },
              { type: 'exercise', exerciseId: exerciseIds.overheadPress, title: 'Overhead Press', reps: 8 },
              { type: 'exercise', exerciseId: exerciseIds.lateralRaise, title: 'Lateral Raise', reps: 12 },
            ],
          },
        ],
        createdAt: new Date('2025-03-25T08:00:00Z'),
        updatedAt: new Date('2025-06-01T08:00:00Z'),
      },
      // Sara
      {
        uid: createUid(),
        name: 'Cardio Endurance',
        user: userSara,
        imageUrl: '',
        description: 'Steady state cardio',
        duration: 40,
        caloriesKcal: 300,
        difficulty: 'beginner',
        equipmentItems: [],
        sections: [
          {
            title: 'Cardio',
            totalExercises: 2,
            items: [
              { type: 'exercise', exerciseId: exerciseIds.jumpRope, title: 'Jump Rope', durationLabel: '15 min' },
              { type: 'rest', restSeconds: 300, durationLabel: 'Recovery' },
            ],
          },
        ],
        createdAt: new Date('2025-04-01T08:00:00Z'),
        updatedAt: new Date('2025-06-01T08:00:00Z'),
      },
      {
        uid: createUid(),
        name: 'Flexibility Session',
        user: userSara,
        imageUrl: '',
        description: 'Stretching and mobility',
        duration: 35,
        caloriesKcal: 100,
        difficulty: 'beginner',
        equipmentItems: [],
        sections: [
          {
            title: 'Stretches',
            totalExercises: 3,
            items: [
              { type: 'exercise', exerciseId: exerciseIds.hipFlexorStretch, title: 'Hip Flexor Stretch', durationLabel: '2 min each side' },
              { type: 'exercise', exerciseId: exerciseIds.hamstringStretch, title: 'Hamstring Stretch', durationLabel: '2 min each leg' },
              { type: 'exercise', exerciseId: exerciseIds.catCow, title: 'Cat-Cow', durationLabel: '2 min' },
            ],
          },
        ],
        createdAt: new Date('2025-04-05T08:00:00Z'),
        updatedAt: new Date('2025-06-01T08:00:00Z'),
      },
      // Dev
      {
        uid: createUid(),
        name: 'Marathon Training',
        user: userDev,
        imageUrl: '',
        description: 'Long distance running',
        duration: 75,
        caloriesKcal: 600,
        difficulty: 'intermediate',
        equipmentItems: [],
        sections: [
          {
            title: 'Run',
            totalExercises: 1,
            items: [{ type: 'exercise', exerciseId: exerciseIds.jumpRope, title: 'Distance Run', durationLabel: '75 min steady pace' }],
          },
        ],
        createdAt: new Date('2025-04-10T08:00:00Z'),
        updatedAt: new Date('2025-06-01T08:00:00Z'),
      },
      {
        uid: createUid(),
        name: 'Speed Intervals',
        user: userDev,
        imageUrl: '',
        description: 'Speed and endurance training',
        duration: 45,
        caloriesKcal: 400,
        difficulty: 'advanced',
        equipmentItems: [],
        sections: [
          {
            title: 'Intervals',
            totalExercises: 2,
            items: [
              { type: 'exercise', exerciseId: exerciseIds.jumpRope, title: 'Sprint', durationLabel: '2 min hard' },
              { type: 'rest', restSeconds: 120, durationLabel: 'Recovery jog' },
            ],
          },
        ],
        createdAt: new Date('2025-04-15T08:00:00Z'),
        updatedAt: new Date('2025-06-01T08:00:00Z'),
      },
      // Ananya
      {
        uid: createUid(),
        name: 'Upper Body Strength',
        user: userAnanya,
        imageUrl: '',
        description: 'Arms, shoulders, back',
        duration: 50,
        caloriesKcal: 380,
        difficulty: 'intermediate',
        equipmentItems: [{ name: 'Dumbbells', icon: '🏋️' }, { name: 'Cable Machine', icon: '🤸' }],
        sections: [
          {
            title: 'Lifts',
            totalExercises: 5,
            items: [
              { type: 'exercise', exerciseId: exerciseIds.overheadPress, title: 'Overhead Press', reps: 8 },
              { type: 'exercise', exerciseId: exerciseIds.latPulldown, title: 'Lat Pulldown', reps: 10 },
              { type: 'exercise', exerciseId: exerciseIds.bicepCurl, title: 'Bicep Curl', reps: 12 },
              { type: 'exercise', exerciseId: exerciseIds.lateralRaise, title: 'Lateral Raise', reps: 12 },
              { type: 'exercise', exerciseId: exerciseIds.tricepDip, title: 'Tricep Dip', reps: 12 },
            ],
          },
        ],
        createdAt: new Date('2025-04-20T08:00:00Z'),
        updatedAt: new Date('2025-06-01T08:00:00Z'),
      },
      {
        uid: createUid(),
        name: 'Core and Balance',
        user: userAnanya,
        imageUrl: '',
        description: 'Core stability and yoga',
        duration: 45,
        caloriesKcal: 200,
        difficulty: 'beginner',
        equipmentItems: [],
        sections: [
          {
            title: 'Core Work',
            totalExercises: 3,
            items: [
              { type: 'exercise', exerciseId: exerciseIds.plank, title: 'Plank', durationLabel: '2 min' },
              { type: 'exercise', exerciseId: exerciseIds.downwardDog, title: 'Downward Dog', durationLabel: '1 min' },
              { type: 'exercise', exerciseId: exerciseIds.warriorPose, title: 'Warrior Pose', durationLabel: '2 min each side' },
            ],
          },
        ],
        createdAt: new Date('2025-04-25T08:00:00Z'),
        updatedAt: new Date('2025-06-01T08:00:00Z'),
      },
    ];
    await db.collection('workouts').insertMany(workoutsData);
    console.log(`[workouts] inserted ${workoutsData.length} documents`);

    // 6. Exercise Logs
    const exerciseLogsData = [
      // Ajay
      { uid: createUid(), exerciseId: exerciseIds.benchPress, userId: userAjay, date: new Date('2025-05-25T08:00:00Z'), sets: 4, reps: 8, weightKg: 100, notes: 'Good form', isPersonalRecord: false, createdAt: new Date('2025-05-25T08:00:00Z'), updatedAt: new Date('2025-05-25T08:00:00Z') },
      { uid: createUid(), exerciseId: exerciseIds.squats, userId: userAjay, date: new Date('2025-05-26T08:00:00Z'), sets: 4, reps: 10, weightKg: 120, notes: 'ATG squats', isPersonalRecord: true, createdAt: new Date('2025-05-26T08:00:00Z'), updatedAt: new Date('2025-05-26T08:00:00Z') },
      { uid: createUid(), exerciseId: exerciseIds.deadlift, userId: userAjay, date: new Date('2025-05-27T08:00:00Z'), sets: 3, reps: 5, weightKg: 140, notes: 'Strong session', isPersonalRecord: false, createdAt: new Date('2025-05-27T08:00:00Z'), updatedAt: new Date('2025-05-27T08:00:00Z') },
      // Priya
      { uid: createUid(), exerciseId: exerciseIds.lunges, userId: userPriya, date: new Date('2025-05-25T08:00:00Z'), sets: 3, reps: 12, weightKg: 25, notes: 'Felt easy', isPersonalRecord: false, createdAt: new Date('2025-05-25T08:00:00Z'), updatedAt: new Date('2025-05-25T08:00:00Z') },
      { uid: createUid(), exerciseId: exerciseIds.squats, userId: userPriya, date: new Date('2025-05-26T08:00:00Z'), sets: 3, reps: 10, weightKg: 70, notes: 'Steady progress', isPersonalRecord: false, createdAt: new Date('2025-05-26T08:00:00Z'), updatedAt: new Date('2025-05-26T08:00:00Z') },
      { uid: createUid(), exerciseId: exerciseIds.romanianDeadlift, userId: userPriya, date: new Date('2025-05-27T08:00:00Z'), sets: 3, reps: 8, weightKg: 65, notes: 'Hamstring focus', isPersonalRecord: false, createdAt: new Date('2025-05-27T08:00:00Z'), updatedAt: new Date('2025-05-27T08:00:00Z') },
      // Rahul
      { uid: createUid(), exerciseId: exerciseIds.deadlift, userId: userRahul, date: new Date('2025-05-25T08:00:00Z'), sets: 3, reps: 6, weightKg: 160, notes: 'Heavy day', isPersonalRecord: false, createdAt: new Date('2025-05-25T08:00:00Z'), updatedAt: new Date('2025-05-25T08:00:00Z') },
      { uid: createUid(), exerciseId: exerciseIds.pullups, userId: userRahul, date: new Date('2025-05-26T08:00:00Z'), sets: 4, reps: 8, weightKg: 0, notes: 'Bodyweight', isPersonalRecord: false, createdAt: new Date('2025-05-26T08:00:00Z'), updatedAt: new Date('2025-05-26T08:00:00Z') },
      { uid: createUid(), exerciseId: exerciseIds.bicepCurl, userId: userRahul, date: new Date('2025-05-27T08:00:00Z'), sets: 3, reps: 12, weightKg: 30, notes: 'Pump achieved', isPersonalRecord: false, createdAt: new Date('2025-05-27T08:00:00Z'), updatedAt: new Date('2025-05-27T08:00:00Z') },
      // Sara
      { uid: createUid(), exerciseId: exerciseIds.jumpRope, userId: userSara, date: new Date('2025-05-25T08:00:00Z'), sets: 3, reps: 100, weightKg: 0, notes: 'Cardio session', isPersonalRecord: false, createdAt: new Date('2025-05-25T08:00:00Z'), updatedAt: new Date('2025-05-25T08:00:00Z') },
      { uid: createUid(), exerciseId: exerciseIds.pushups, userId: userSara, date: new Date('2025-05-26T08:00:00Z'), sets: 3, reps: 15, weightKg: 0, notes: 'Bodyweight', isPersonalRecord: false, createdAt: new Date('2025-05-26T08:00:00Z'), updatedAt: new Date('2025-05-26T08:00:00Z') },
      { uid: createUid(), exerciseId: exerciseIds.plank, userId: userSara, date: new Date('2025-05-27T08:00:00Z'), sets: 3, reps: 1, weightKg: 0, notes: '2 minute hold', isPersonalRecord: false, createdAt: new Date('2025-05-27T08:00:00Z'), updatedAt: new Date('2025-05-27T08:00:00Z') },
      // Dev
      { uid: createUid(), exerciseId: exerciseIds.jumpRope, userId: userDev, date: new Date('2025-05-25T08:00:00Z'), sets: 1, reps: 3600, weightKg: 0, notes: 'Long run', isPersonalRecord: false, createdAt: new Date('2025-05-25T08:00:00Z'), updatedAt: new Date('2025-05-25T08:00:00Z') },
      { uid: createUid(), exerciseId: exerciseIds.burpees, userId: userDev, date: new Date('2025-05-26T08:00:00Z'), sets: 10, reps: 10, weightKg: 0, notes: 'HIIT intervals', isPersonalRecord: false, createdAt: new Date('2025-05-26T08:00:00Z'), updatedAt: new Date('2025-05-26T08:00:00Z') },
      { uid: createUid(), exerciseId: exerciseIds.mountainClimbers, userId: userDev, date: new Date('2025-05-27T08:00:00Z'), sets: 3, reps: 40, weightKg: 0, notes: 'Core work', isPersonalRecord: false, createdAt: new Date('2025-05-27T08:00:00Z'), updatedAt: new Date('2025-05-27T08:00:00Z') },
      // Ananya
      { uid: createUid(), exerciseId: exerciseIds.overheadPress, userId: userAnanya, date: new Date('2025-05-25T08:00:00Z'), sets: 3, reps: 8, weightKg: 45, notes: 'Strong', isPersonalRecord: false, createdAt: new Date('2025-05-25T08:00:00Z'), updatedAt: new Date('2025-05-25T08:00:00Z') },
      { uid: createUid(), exerciseId: exerciseIds.latPulldown, userId: userAnanya, date: new Date('2025-05-26T08:00:00Z'), sets: 3, reps: 10, weightKg: 70, notes: 'Great form', isPersonalRecord: false, createdAt: new Date('2025-05-26T08:00:00Z'), updatedAt: new Date('2025-05-26T08:00:00Z') },
      { uid: createUid(), exerciseId: exerciseIds.bicepCurl, userId: userAnanya, date: new Date('2025-05-27T08:00:00Z'), sets: 3, reps: 12, weightKg: 20, notes: 'Good burn', isPersonalRecord: false, createdAt: new Date('2025-05-27T08:00:00Z'), updatedAt: new Date('2025-05-27T08:00:00Z') },
    ];
    await db.collection('exercise_logs').insertMany(exerciseLogsData);
    console.log(`[exercise_logs] inserted ${exerciseLogsData.length} documents`);

    // 7. Nutritions
    const nutritionsData = [
      // Ajay
      { user: userAjay, items: [{ name: 'Chicken Breast', calories: 165, macros: { protein: 31, carbs: 0, fat: 3.6 } }, { name: 'Brown Rice', calories: 111, macros: { protein: 2.6, carbs: 23, fat: 0.9 } }, { name: 'Broccoli', calories: 34, macros: { protein: 2.8, carbs: 7, fat: 0.4 } }], date: new Date('2025-05-25'), createdAt: new Date('2025-05-25T08:00:00Z'), updatedAt: new Date('2025-05-25T08:00:00Z') },
      { user: userAjay, items: [{ name: 'Protein Shake', calories: 200, macros: { protein: 25, carbs: 10, fat: 3 } }, { name: 'Banana', calories: 89, macros: { protein: 1.1, carbs: 23, fat: 0.3 } }, { name: 'Peanut Butter', calories: 96, macros: { protein: 4, carbs: 3.5, fat: 8 } }], date: new Date('2025-05-26'), createdAt: new Date('2025-05-26T08:00:00Z'), updatedAt: new Date('2025-05-26T08:00:00Z') },
      // Priya
      { user: userPriya, items: [{ name: 'Salmon', calories: 208, macros: { protein: 20, carbs: 0, fat: 13 } }, { name: 'Sweet Potato', calories: 86, macros: { protein: 1.6, carbs: 20, fat: 0.1 } }, { name: 'Asparagus', calories: 20, macros: { protein: 2.2, carbs: 3.7, fat: 0.1 } }], date: new Date('2025-05-25'), createdAt: new Date('2025-05-25T08:00:00Z'), updatedAt: new Date('2025-05-25T08:00:00Z') },
      { user: userPriya, items: [{ name: 'Greek Yogurt', calories: 100, macros: { protein: 17, carbs: 7, fat: 0.4 } }, { name: 'Blueberries', calories: 57, macros: { protein: 0.7, carbs: 14, fat: 0.3 } }, { name: 'Granola', calories: 130, macros: { protein: 4, carbs: 19, fat: 5 } }], date: new Date('2025-05-26'), createdAt: new Date('2025-05-26T08:00:00Z'), updatedAt: new Date('2025-05-26T08:00:00Z') },
      // Rahul
      { user: userRahul, items: [{ name: 'Ground Beef', calories: 250, macros: { protein: 26, carbs: 0, fat: 15 } }, { name: 'White Rice', calories: 130, macros: { protein: 2.7, carbs: 28, fat: 0.3 } }, { name: 'Green Beans', calories: 31, macros: { protein: 2.2, carbs: 7, fat: 0.1 } }], date: new Date('2025-05-25'), createdAt: new Date('2025-05-25T08:00:00Z'), updatedAt: new Date('2025-05-25T08:00:00Z') },
      { user: userRahul, items: [{ name: 'Eggs', calories: 155, macros: { protein: 13, carbs: 1.1, fat: 11 } }, { name: 'Oats', calories: 150, macros: { protein: 5, carbs: 27, fat: 3 } }, { name: 'Honey', calories: 64, macros: { protein: 0.1, carbs: 17, fat: 0 } }], date: new Date('2025-05-26'), createdAt: new Date('2025-05-26T08:00:00Z'), updatedAt: new Date('2025-05-26T08:00:00Z') },
      // Sara
      { user: userSara, items: [{ name: 'Turkey Breast', calories: 135, macros: { protein: 26, carbs: 0, fat: 3 } }, { name: 'Quinoa', calories: 120, macros: { protein: 4.4, carbs: 21, fat: 2 } }, { name: 'Spinach', calories: 23, macros: { protein: 2.9, carbs: 3.6, fat: 0.4 } }], date: new Date('2025-05-25'), createdAt: new Date('2025-05-25T08:00:00Z'), updatedAt: new Date('2025-05-25T08:00:00Z') },
      { user: userSara, items: [{ name: 'Cottage Cheese', calories: 110, macros: { protein: 13, carbs: 4, fat: 5 } }, { name: 'Apple', calories: 52, macros: { protein: 0.3, carbs: 14, fat: 0.2 } }, { name: 'Almonds', calories: 164, macros: { protein: 6, carbs: 6, fat: 14 } }], date: new Date('2025-05-26'), createdAt: new Date('2025-05-26T08:00:00Z'), updatedAt: new Date('2025-05-26T08:00:00Z') },
      // Dev
      { user: userDev, items: [{ name: 'Tuna', calories: 132, macros: { protein: 29, carbs: 0, fat: 1.3 } }, { name: 'Sweet Potato', calories: 86, macros: { protein: 1.6, carbs: 20, fat: 0.1 } }, { name: 'Olive Oil', calories: 120, macros: { protein: 0, carbs: 0, fat: 14 } }], date: new Date('2025-05-25'), createdAt: new Date('2025-05-25T08:00:00Z'), updatedAt: new Date('2025-05-25T08:00:00Z') },
      { user: userDev, items: [{ name: 'Pasta', calories: 130, macros: { protein: 5, carbs: 25, fat: 1.1 } }, { name: 'Tomato Sauce', calories: 32, macros: { protein: 1.6, carbs: 7, fat: 0.2 } }, { name: 'Parmesan', calories: 110, macros: { protein: 10, carbs: 1, fat: 7 } }], date: new Date('2025-05-26'), createdAt: new Date('2025-05-26T08:00:00Z'), updatedAt: new Date('2025-05-26T08:00:00Z') },
      // Ananya
      { user: userAnanya, items: [{ name: 'Chicken Thighs', calories: 209, macros: { protein: 26, carbs: 0, fat: 11 } }, { name: 'Basmati Rice', calories: 130, macros: { protein: 2.7, carbs: 28, fat: 0.3 } }, { name: 'Carrots', calories: 41, macros: { protein: 0.9, carbs: 10, fat: 0.2 } }], date: new Date('2025-05-25'), createdAt: new Date('2025-05-25T08:00:00Z'), updatedAt: new Date('2025-05-25T08:00:00Z') },
      { user: userAnanya, items: [{ name: 'Protein Bar', calories: 200, macros: { protein: 20, carbs: 20, fat: 5 } }, { name: 'Orange', calories: 47, macros: { protein: 0.9, carbs: 12, fat: 0.3 } }, { name: 'Dark Chocolate', calories: 168, macros: { protein: 2, carbs: 15, fat: 12 } }], date: new Date('2025-05-26'), createdAt: new Date('2025-05-26T08:00:00Z'), updatedAt: new Date('2025-05-26T08:00:00Z') },
    ];
    await db.collection('nutritions').insertMany(nutritionsData);
    console.log(`[nutritions] inserted ${nutritionsData.length} documents`);

    console.log('\n✅ Seed data loaded successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
}

seed();
