/* eslint-disable no-console */
/**
 * Seeds an authentic training catalog for the flow:
 *   Training tab → Workout Types → Target Muscle → Workout Details → Exercise Detail
 *
 * IMPORTANT: this backend stores/queries reference fields (workoutTypeId,
 * muscleGroupId, exerciseId) as STRINGS — its mongoose does not cast to
 * ObjectId. So every ref below is stored as a hex string. Doc _id stays ObjectId.
 *
 * Idempotent: wipes+reinserts everything tagged seedTag:'training-catalog'.
 * Re-run, then RESTART the backend so it sees the new rows.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const { randomUUID } = require('crypto');

const TAG = 'training-catalog';
const uid = () => randomUUID().replace(/-/g, '');
const oid = () => new mongoose.Types.ObjectId();
const now = new Date();
const base = (extra = {}) => ({ uid: uid(), seedTag: TAG, createdAt: now, updatedAt: now, ...extra });

const IMG = {
  chest: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
  back: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
  shoulders: 'https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?w=800',
  arms: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800',
  legs: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=800',
  glutes: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800',
  core: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=800',
  mobility: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
  hero: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800',
  workout: 'https://images.unsplash.com/photo-1581009137042-c552e485697a?w=800',
};

const EQUIP_NAME = {
  barbell: 'Barbell', dumbbell: 'Dumbbells', cable: 'Cable Machine',
  machine: 'Machine', bodyweight: 'Bodyweight', kettlebell: 'Kettlebell',
};

async function main() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/fitness_app';
  await mongoose.connect(mongoUri);
  console.log(`Connected: ${mongoose.connection.name}`);
  const db = mongoose.connection.db;

  for (const c of ['workout_types', 'muscle_groups', 'exercises', 'workouts']) {
    const r = await db.collection(c).deleteMany({ seedTag: TAG });
    console.log(`  cleared ${r.deletedCount} from ${c}`);
  }

  // ── 1) Workout Types ──────────────────────────────────────────────
  const types = [
    { _id: oid(), label: 'Hypertrophy', icon: 'dumbbell', goal: 'hypertrophy', description: 'Maximum muscle growth through high-volume precision training.', levelLabel: 'INT-ADV', levels: ['intermediate', 'advanced'], bodyArea: 'Full Body', workoutCount: 24, equipment: 'gym', durationRangeLabel: '30-45M', accentColor: '#6366F1', gradient: ['#8B8FFF', '#4F46E5'], sortOrder: 1 },
    { _id: oid(), label: 'Metabolic HIIT', icon: 'zap', goal: 'fat_loss', description: 'Ignite your metabolism and torch fat with explosive intervals.', levelLabel: 'ALL LEVELS', levels: ['beginner', 'intermediate', 'advanced'], bodyArea: 'Core & Cardio', workoutCount: 18, equipment: 'minimal', durationRangeLabel: '15-30M', accentColor: '#EF4444', gradient: ['#F87171', '#DC2626'], sortOrder: 2 },
    { _id: oid(), label: 'Pure Strength', icon: 'award', goal: 'strength', description: 'Focus on compound movements to build raw, functional power.', levelLabel: 'ADVANCED', levels: ['advanced'], bodyArea: 'Posterior Chain', workoutCount: 12, equipment: 'gym', durationRangeLabel: '45-60M', accentColor: '#F59E0B', gradient: ['#FBBF24', '#D97706'], sortOrder: 3 },
    { _id: oid(), label: 'Structural Flow', icon: 'wind', goal: 'mobility', description: 'Restore joint health and improve movement efficiency.', levelLabel: 'BEGINNER', levels: ['beginner'], bodyArea: 'Active Recovery', workoutCount: 30, equipment: 'none', durationRangeLabel: '20-40M', accentColor: '#10B981', gradient: ['#34D399', '#059669'], sortOrder: 4 },
    { _id: oid(), label: 'Calisthenics', icon: 'activity', goal: 'mixed', description: 'Master your bodyweight with gymnastics-inspired strength work.', levelLabel: 'INT', levels: ['intermediate'], bodyArea: 'No Equipment', workoutCount: 15, equipment: 'bodyweight', durationRangeLabel: '25-40M', accentColor: '#8B5CF6', gradient: ['#A78BFA', '#7C3AED'], sortOrder: 5 },
    { _id: oid(), label: 'Endurance Engine', icon: 'trending-up', goal: 'endurance', description: 'Build a bigger aerobic base and sustain higher output longer.', levelLabel: 'ALL LEVELS', levels: ['beginner', 'intermediate', 'advanced'], bodyArea: 'Cardio', workoutCount: 16, equipment: 'minimal', durationRangeLabel: '30-50M', accentColor: '#3B82F6', gradient: ['#60A5FA', '#2563EB'], sortOrder: 6 },
  ];
  const typeBy = Object.fromEntries(types.map((t) => [t.label, t._id.toString()]));
  await db.collection('workout_types').insertMany(types.map((t) => base(t)));
  console.log(`  + ${types.length} workout_types`);

  // ── 2) Muscle Groups (per type, tailored) ─────────────────────────
  const muscleMeta = {
    Chest: { count: 42, role: 'main', region: 'upper', img: IMG.chest },
    Back: { count: 28, role: 'core', region: 'upper', img: IMG.back },
    Shoulders: { count: 24, role: 'stability', region: 'upper', img: IMG.shoulders },
    Biceps: { count: 18, role: 'main', region: 'upper', img: IMG.arms },
    Triceps: { count: 16, role: 'main', region: 'upper', img: IMG.arms },
    Quads: { count: 21, role: 'core', region: 'lower', img: IMG.legs },
    Hamstrings: { count: 22, role: 'core', region: 'lower', img: IMG.legs },
    Glutes: { count: 24, role: 'core', region: 'lower', img: IMG.glutes },
    Calves: { count: 18, role: 'stability', region: 'lower', img: IMG.legs },
    Core: { count: 45, role: 'core', region: 'core', img: IMG.core },
    'Full Body': { count: 35, role: 'mixed', region: 'full', img: IMG.hero, full: true },
  };
  const typeMuscles = {
    Hypertrophy: Object.keys(muscleMeta),
    'Pure Strength': ['Chest', 'Back', 'Shoulders', 'Quads', 'Hamstrings', 'Glutes', 'Full Body'],
    'Metabolic HIIT': ['Core', 'Quads', 'Glutes', 'Shoulders', 'Full Body'],
    'Structural Flow': ['Shoulders', 'Hamstrings', 'Glutes', 'Core', 'Full Body'],
    Calisthenics: ['Chest', 'Back', 'Core', 'Shoulders', 'Full Body'],
    'Endurance Engine': ['Quads', 'Hamstrings', 'Calves', 'Core', 'Full Body'],
  };

  const muscleId = {}; // `${typeLabel}:${label}` -> string id
  const muscleDocs = [];
  for (const [typeLabel, labels] of Object.entries(typeMuscles)) {
    labels.forEach((label, i) => {
      const meta = muscleMeta[label];
      const id = oid();
      muscleId[`${typeLabel}:${label}`] = id.toString();
      muscleDocs.push(base({
        _id: id, workoutTypeId: typeBy[typeLabel], label,
        imageUrl: meta.img, workoutCount: meta.count, roleTag: meta.role,
        region: meta.region, isFullBody: !!meta.full, sortOrder: i + 1,
      }));
    });
  }
  await db.collection('muscle_groups').insertMany(muscleDocs);
  console.log(`  + ${muscleDocs.length} muscle_groups across ${Object.keys(typeMuscles).length} types`);

  // ── 3) Exercises per Hypertrophy muscle ───────────────────────────
  const hyperId = typeBy['Hypertrophy'];
  const exerciseDocs = [];

  // presc tuple: [sets, reps, rest, tempo, rpe, calPerMin]
  const P = (s, r, rest, tempo, rpe, cal) => ({ setsLabel: s, repsLabel: r, restLabel: rest, tempo, rpe, caloriesPerMin: cal });

  const makeExercise = (muscleLabel, img, def) => {
    const id = oid();
    const force = def.force || 'push';
    const doc = base({
      _id: id,
      workoutTypeId: hyperId,
      muscleGroupId: muscleId[`Hypertrophy:${muscleLabel}`],
      name: def.name, imageUrl: img, mediaUrls: [img],
      summary: def.summary || `${def.name} — a key ${muscleLabel.toLowerCase()} builder targeting ${def.pm.join(' & ')}.`,
      equipment: def.eq, equipmentDetails: def.eqd || EQUIP_NAME[def.eq],
      difficulty: def.diff || 'intermediate',
      category: def.cat || 'strength', mechanic: def.mech || 'compound', force,
      primaryMuscles: def.pm, secondaryMuscles: def.sm || [],
      prescription: def.presc,
      videoUrl: '',
      techniqueSteps: def.tech || [
        `Set up in a stable position for the ${def.name.toLowerCase()}.`,
        `Move through a full range of motion under control, leading with the target muscle.`,
        `Pause briefly at peak contraction, then return slowly to the start.`,
      ],
      breathingCue: def.breath || 'Exhale on the effort (lifting) phase, inhale on the return.',
      safetyNotes: def.safety || ['Keep a braced core and neutral spine throughout.'],
      commonMistakes: def.mistakes || ['Using momentum instead of controlled tension.'],
      alternatives: def.alts || [],
    });
    exerciseDocs.push(doc);
    return { id: id.toString(), name: def.name, thumb: img, presc: def.presc };
  };

  // Universal warmup/cooldown (linked to Full Body)
  const warmCool = (def, img) => {
    const id = oid();
    exerciseDocs.push(base({
      _id: id, workoutTypeId: hyperId, muscleGroupId: muscleId['Hypertrophy:Full Body'],
      name: def.name, imageUrl: img, mediaUrls: [img], summary: def.summary,
      equipment: 'bodyweight', equipmentDetails: 'None', difficulty: 'beginner',
      category: 'mobility', mechanic: 'isolation', force: 'multi',
      primaryMuscles: def.pm, secondaryMuscles: [], prescription: def.presc, videoUrl: '',
      techniqueSteps: def.tech, breathingCue: 'Breathe steadily and stay relaxed.',
      safetyNotes: ['Stay within a comfortable, pain-free range.'], commonMistakes: [], alternatives: [],
    }));
    return { id: id.toString(), name: def.name, thumb: img, presc: def.presc };
  };

  const armCircles = warmCool({ name: 'Arm Circles', summary: 'Dynamic shoulder warm-up.', pm: ['Shoulders'], presc: P('2', '30s', '15s', 'Controlled', 3, 4), tech: ['Extend arms to your sides.', 'Make small forward circles, then larger.', 'Reverse direction.'] }, IMG.mobility);
  const stretch = warmCool({ name: 'Static Stretch', summary: 'Cool-down stretch and release.', pm: ['Full Body'], presc: P('1', '5m', '-', 'Hold', 2, 2), tech: ['Ease into the stretch.', 'Hold without bouncing.', 'Breathe and relax deeper.'] }, IMG.mobility);

  // Per-muscle exercise tables
  const E = {
    Chest: [
      { name: 'Dumbbell Flat Press', eq: 'dumbbell', mech: 'compound', pm: ['Pectoralis Major', 'Front Delts'], sm: ['Triceps'], presc: P('4', '10-12', '90s', '2-0-2', 8.5, 8), alts: ['Barbell Bench Press', 'Machine Chest Press'] },
      { name: 'Incline Dumbbell Press', eq: 'dumbbell', mech: 'compound', pm: ['Upper Chest', 'Front Delts'], sm: ['Triceps'], presc: P('3-4', '8-12', '90s', '2-0-2', 8, 8), alts: ['Incline Barbell Press'] },
      { name: 'Incline Chest Flies', eq: 'dumbbell', mech: 'isolation', pm: ['Upper Chest'], sm: ['Front Delts'], presc: P('3', '15', '60s', '3-1-1', 7, 6), alts: ['Cable Flies', 'Pec Deck'] },
      { name: 'Cable Crossover', eq: 'cable', mech: 'isolation', pm: ['Pectoralis Major'], sm: ['Front Delts'], presc: P('3', '12-15', '60s', '2-1-2', 7.5, 6), alts: ['Pec Deck'] },
    ],
    Back: [
      { name: 'Pull-Up', eq: 'bodyweight', mech: 'compound', force: 'pull', pm: ['Lats'], sm: ['Biceps', 'Rear Delts'], presc: P('4', 'AMRAP', '90s', '2-0-1', 9, 9), alts: ['Lat Pulldown'] },
      { name: 'Bent-Over Barbell Row', eq: 'barbell', mech: 'compound', force: 'pull', pm: ['Lats', 'Mid Traps'], sm: ['Biceps'], presc: P('4', '8-10', '90s', '2-0-1', 8.5, 8), alts: ['Dumbbell Row'] },
      { name: 'Lat Pulldown', eq: 'cable', mech: 'compound', force: 'pull', pm: ['Lats'], sm: ['Biceps'], presc: P('3', '10-12', '75s', '2-0-2', 8, 7), alts: ['Pull-Up'] },
      { name: 'Seated Cable Row', eq: 'cable', mech: 'compound', force: 'pull', pm: ['Mid Back'], sm: ['Biceps', 'Rear Delts'], presc: P('3', '12', '60s', '2-1-2', 7.5, 7), alts: ['Chest-Supported Row'] },
    ],
    Shoulders: [
      { name: 'Overhead Press', eq: 'barbell', mech: 'compound', pm: ['Front Delts', 'Side Delts'], sm: ['Triceps'], presc: P('4', '8-10', '90s', '2-0-1', 8.5, 8), alts: ['Dumbbell Shoulder Press'] },
      { name: 'Dumbbell Lateral Raise', eq: 'dumbbell', mech: 'isolation', pm: ['Side Delts'], presc: P('4', '15', '45s', '2-1-1', 7, 5), alts: ['Cable Lateral Raise'] },
      { name: 'Arnold Press', eq: 'dumbbell', mech: 'compound', pm: ['Front Delts', 'Side Delts'], sm: ['Triceps'], presc: P('3', '10-12', '75s', '2-0-2', 8, 7), alts: ['Overhead Press'] },
      { name: 'Face Pull', eq: 'cable', mech: 'isolation', force: 'pull', pm: ['Rear Delts'], sm: ['Mid Traps'], presc: P('3', '15-20', '45s', '2-1-2', 6.5, 5), alts: ['Reverse Pec Deck'] },
    ],
    Biceps: [
      { name: 'Barbell Curl', eq: 'barbell', mech: 'isolation', force: 'pull', pm: ['Biceps'], presc: P('4', '10-12', '60s', '2-0-2', 8, 5), alts: ['EZ-Bar Curl'] },
      { name: 'Dumbbell Hammer Curl', eq: 'dumbbell', mech: 'isolation', force: 'pull', pm: ['Biceps', 'Brachialis'], presc: P('3', '12', '60s', '2-0-2', 7.5, 5), alts: ['Rope Hammer Curl'] },
      { name: 'Incline Dumbbell Curl', eq: 'dumbbell', mech: 'isolation', force: 'pull', pm: ['Biceps'], presc: P('3', '12-15', '60s', '3-0-1', 7.5, 5), alts: ['Preacher Curl'] },
      { name: 'Cable Curl', eq: 'cable', mech: 'isolation', force: 'pull', pm: ['Biceps'], presc: P('3', '15', '45s', '2-1-1', 7.5, 5), alts: ['Barbell Curl'] },
    ],
    Triceps: [
      { name: 'Tricep Pushdown', eq: 'cable', mech: 'isolation', pm: ['Triceps'], presc: P('4', '12-15', '60s', '2-0-1', 7.5, 5), alts: ['Rope Pushdown'] },
      { name: 'Overhead Tricep Extension', eq: 'dumbbell', mech: 'isolation', pm: ['Triceps'], presc: P('3', '12', '60s', '3-0-1', 7.5, 5), alts: ['Cable Overhead Extension'] },
      { name: 'Close-Grip Bench Press', eq: 'barbell', mech: 'compound', pm: ['Triceps'], sm: ['Chest'], presc: P('4', '8-10', '90s', '2-0-1', 8.5, 7), alts: ['Dips'] },
      { name: 'Bench Dips', eq: 'bodyweight', mech: 'compound', pm: ['Triceps'], sm: ['Chest'], presc: P('3', 'AMRAP', '60s', '2-0-1', 8, 6), alts: ['Parallel Bar Dips'] },
    ],
    Quads: [
      { name: 'Barbell Back Squat', eq: 'barbell', mech: 'compound', pm: ['Quads', 'Glutes'], sm: ['Hamstrings'], presc: P('4', '8-10', '120s', '3-0-1', 8.5, 9), alts: ['Front Squat'] },
      { name: 'Leg Press', eq: 'machine', mech: 'compound', pm: ['Quads', 'Glutes'], presc: P('4', '12', '90s', '2-0-1', 8, 8), alts: ['Hack Squat'] },
      { name: 'Leg Extension', eq: 'machine', mech: 'isolation', pm: ['Quads'], presc: P('3', '15', '60s', '2-1-2', 7.5, 6), alts: ['Sissy Squat'] },
      { name: 'Walking Lunges', eq: 'dumbbell', mech: 'compound', pm: ['Quads', 'Glutes'], presc: P('3', '12 each', '75s', '2-0-1', 8, 8), alts: ['Split Squat'] },
    ],
    Hamstrings: [
      { name: 'Romanian Deadlift', eq: 'barbell', mech: 'compound', force: 'pull', pm: ['Hamstrings', 'Glutes'], sm: ['Lower Back'], presc: P('4', '8-10', '120s', '3-0-1', 8.5, 8), alts: ['Stiff-Leg Deadlift'] },
      { name: 'Lying Leg Curl', eq: 'machine', mech: 'isolation', force: 'pull', pm: ['Hamstrings'], presc: P('4', '12', '60s', '2-1-2', 7.5, 6), alts: ['Seated Leg Curl'] },
      { name: 'Good Morning', eq: 'barbell', mech: 'compound', force: 'pull', pm: ['Hamstrings'], sm: ['Lower Back', 'Glutes'], presc: P('3', '10', '90s', '3-0-1', 8, 7), alts: ['Romanian Deadlift'] },
      { name: 'Nordic Hamstring Curl', eq: 'bodyweight', mech: 'isolation', force: 'pull', pm: ['Hamstrings'], presc: P('3', '8', '75s', '3-0-1', 9, 6), alts: ['Lying Leg Curl'] },
    ],
    Glutes: [
      { name: 'Barbell Hip Thrust', eq: 'barbell', mech: 'compound', pm: ['Glutes'], sm: ['Hamstrings'], presc: P('4', '10-12', '90s', '2-1-1', 8.5, 8), alts: ['Glute Bridge'] },
      { name: 'Bulgarian Split Squat', eq: 'dumbbell', mech: 'compound', pm: ['Glutes', 'Quads'], presc: P('3', '10 each', '75s', '2-0-1', 8, 8), alts: ['Walking Lunges'] },
      { name: 'Glute Bridge', eq: 'bodyweight', mech: 'compound', pm: ['Glutes'], presc: P('3', '15', '45s', '2-1-1', 7, 6), alts: ['Hip Thrust'] },
      { name: 'Cable Glute Kickback', eq: 'cable', mech: 'isolation', pm: ['Glutes'], presc: P('3', '15 each', '45s', '2-1-1', 7, 5), alts: ['Donkey Kicks'] },
    ],
    Calves: [
      { name: 'Standing Calf Raise', eq: 'machine', mech: 'isolation', pm: ['Calves'], presc: P('4', '15-20', '45s', '2-1-2', 7.5, 5), alts: ['Smith Machine Calf Raise'] },
      { name: 'Seated Calf Raise', eq: 'machine', mech: 'isolation', pm: ['Calves'], presc: P('4', '15', '45s', '2-1-2', 7.5, 5), alts: ['Leg Press Calf Raise'] },
      { name: 'Single-Leg Calf Raise', eq: 'bodyweight', mech: 'isolation', pm: ['Calves'], presc: P('3', '20 each', '45s', '2-1-2', 7, 4), alts: ['Standing Calf Raise'] },
    ],
    Core: [
      { name: 'Plank', eq: 'bodyweight', mech: 'isolation', force: 'static', pm: ['Core'], presc: P('3', '45s', '45s', 'Hold', 7, 4), alts: ['Ab Wheel'] },
      { name: 'Hanging Leg Raise', eq: 'bodyweight', mech: 'compound', force: 'pull', pm: ['Lower Abs'], sm: ['Hip Flexors'], presc: P('3', '12-15', '60s', '2-0-1', 8, 6), alts: ['Captain Chair Raise'] },
      { name: 'Cable Crunch', eq: 'cable', mech: 'isolation', force: 'pull', pm: ['Abs'], presc: P('3', '15', '45s', '2-1-2', 7.5, 5), alts: ['Weighted Crunch'] },
      { name: 'Russian Twist', eq: 'bodyweight', mech: 'isolation', force: 'multi', pm: ['Obliques'], presc: P('3', '20', '45s', '1-1-1', 7, 5), alts: ['Cable Woodchopper'] },
    ],
    'Full Body': [
      { name: 'Burpee', eq: 'bodyweight', mech: 'compound', force: 'multi', pm: ['Full Body'], presc: P('4', '12', '45s', 'Expl.', 8.5, 12), alts: ['Squat Thrust'] },
      { name: 'Kettlebell Swing', eq: 'kettlebell', mech: 'compound', force: 'multi', pm: ['Glutes', 'Hamstrings'], sm: ['Core'], presc: P('4', '15', '45s', 'Expl.', 8, 10), alts: ['Dumbbell Swing'] },
      { name: 'Dumbbell Thruster', eq: 'dumbbell', mech: 'compound', force: 'push', pm: ['Quads', 'Shoulders'], sm: ['Core'], presc: P('4', '12', '60s', '2-0-1', 8.5, 11), alts: ['Barbell Thruster'] },
      { name: 'Mountain Climbers', eq: 'bodyweight', mech: 'compound', force: 'multi', pm: ['Core'], sm: ['Shoulders'], presc: P('3', '30s', '45s', 'Expl.', 8, 10), alts: ['High Knees'] },
    ],
  };

  const exByMuscle = {}; // muscleLabel -> [{id,name,thumb,presc}]
  for (const [muscleLabel, list] of Object.entries(E)) {
    const img = muscleMeta[muscleLabel].img;
    exByMuscle[muscleLabel] = list.map((def) => makeExercise(muscleLabel, img, def));
  }
  await db.collection('exercises').insertMany(exerciseDocs);
  console.log(`  + ${exerciseDocs.length} exercises across ${Object.keys(E).length} muscles`);

  // ── 4) One workout per Hypertrophy muscle ─────────────────────────
  const itemFromEx = (ex, extra = {}) => ({
    type: 'exercise', exerciseId: ex.id, title: ex.name, thumbnailUrl: ex.thumb, showInfoIcon: true,
    setsLabel: `${ex.presc.setsLabel} Sets`, repsLabel: `${ex.presc.repsLabel} Reps`,
    restLabel: (ex.presc.restLabel || '').toUpperCase(), tempo: ex.presc.tempo, rpe: ex.presc.rpe, ...extra,
  });
  const warmItem = (ex) => ({ type: 'exercise', exerciseId: ex.id, title: ex.name, thumbnailUrl: ex.thumb, showInfoIcon: true, setsLabel: `${ex.presc.setsLabel} Sets`, repsLabel: ex.presc.repsLabel, tempo: ex.presc.tempo });

  const equipmentForMuscle = (muscleLabel) => {
    const set = new Set(E[muscleLabel].map((d) => EQUIP_NAME[d.eq] || d.eq));
    const items = [...set].map((name) => ({ name, icon: 'box', quantityLabel: '1', optional: false }));
    items.push({ name: 'Mat', icon: 'square', quantityLabel: '1', optional: true });
    return items;
  };

  const workoutMeta = {
    Chest: { name: 'Apex Foundation 4.0', dur: 45, kcal: 520, sets: 24, rating: 4.9, ratingCount: 1200, times: 128, target: 'CHEST/TRI', pct: 80, lvl: 'ADVANCED' },
    Back: { name: 'Titan Back Builder', dur: 48, kcal: 500, sets: 22, rating: 4.8, ratingCount: 980, times: 110, target: 'BACK/BI', pct: 82, lvl: 'ADVANCED' },
    Shoulders: { name: 'Boulder Shoulders', dur: 40, kcal: 420, sets: 20, rating: 4.7, ratingCount: 760, times: 95, target: 'DELTS', pct: 78, lvl: 'INTERMEDIATE' },
    Biceps: { name: 'Peak Biceps Pump', dur: 35, kcal: 320, sets: 18, rating: 4.6, ratingCount: 540, times: 70, target: 'BICEPS', pct: 85, lvl: 'INTERMEDIATE' },
    Triceps: { name: 'Horseshoe Triceps', dur: 35, kcal: 330, sets: 18, rating: 4.7, ratingCount: 560, times: 72, target: 'TRICEPS', pct: 84, lvl: 'INTERMEDIATE' },
    Quads: { name: 'Quad Annihilation', dur: 50, kcal: 560, sets: 22, rating: 4.9, ratingCount: 890, times: 130, target: 'QUADS', pct: 80, lvl: 'ADVANCED' },
    Hamstrings: { name: 'Hamstring Forge', dur: 45, kcal: 500, sets: 20, rating: 4.7, ratingCount: 620, times: 88, target: 'HAMS', pct: 80, lvl: 'ADVANCED' },
    Glutes: { name: 'Glute Architect', dur: 45, kcal: 480, sets: 20, rating: 4.9, ratingCount: 1100, times: 160, target: 'GLUTES', pct: 82, lvl: 'INTERMEDIATE' },
    Calves: { name: 'Calf Constructor', dur: 25, kcal: 220, sets: 16, rating: 4.5, ratingCount: 380, times: 60, target: 'CALVES', pct: 90, lvl: 'BEGINNER' },
    Core: { name: 'Core Reactor', dur: 30, kcal: 300, sets: 15, rating: 4.8, ratingCount: 700, times: 200, target: 'CORE', pct: 88, lvl: 'INTERMEDIATE' },
    'Full Body': { name: 'Total Body Apex', dur: 40, kcal: 450, sets: 16, rating: 4.8, ratingCount: 820, times: 190, target: 'FULL BODY', pct: 75, lvl: 'INTERMEDIATE' },
  };

  const workoutDocs = [];
  for (const [muscleLabel, meta] of Object.entries(workoutMeta)) {
    const exs = exByMuscle[muscleLabel];
    workoutDocs.push(base({
      _id: oid(), name: meta.name, imageUrl: muscleMeta[muscleLabel].img,
      description: `A focused ${muscleLabel.toLowerCase()} hypertrophy session designed to maximize tension and volume across the ${muscleLabel.toLowerCase()}.`,
      duration: meta.dur, caloriesKcal: meta.kcal, difficulty: meta.lvl.toLowerCase(),
      goal: 'hypertrophy', levelLabel: meta.lvl, creatorType: 'ai_coach', creatorName: 'AI Coach',
      rating: meta.rating, ratingCount: meta.ratingCount, timesCompleted: meta.times, totalSets: meta.sets,
      targetMuscleLabel: meta.target, targetMusclePercent: meta.pct, isCatalog: true, popularity: meta.times,
      workoutTypeId: hyperId, muscleGroupId: muscleId[`Hypertrophy:${muscleLabel}`],
      equipmentItems: equipmentForMuscle(muscleLabel),
      sections: [
        { title: 'Warmup', totalExercises: 1, totalMinutes: 5, items: [warmItem(armCircles), { type: 'rest', title: 'Transition', durationLabel: '60s Rest', restSeconds: 60 }] },
        { title: 'Main Block', totalExercises: exs.length, totalMinutes: Math.max(20, meta.dur - 10), items: exs.map((ex, i) => itemFromEx(ex, i === 0 ? { note: `Lead the session strong — prioritize form on ${ex.name}.` } : {})) },
        { title: 'Cooldown', totalExercises: 1, totalMinutes: 5, items: [warmItem(stretch)] },
      ],
    }));
  }

  // Signature workouts for the other 5 types (linked to their Full Body)
  const fullBodyExs = exByMuscle['Full Body'];
  const signatureDefs = [
    { type: 'Metabolic HIIT', name: 'Inferno Intervals', goal: 'fat_loss', level: 'ALL LEVELS', rating: 4.8, ratingCount: 860, times: 210, sets: 16, dur: 24, kcal: 380, target: 'FULL BODY', pct: 90 },
    { type: 'Pure Strength', name: 'Iron Base 5x5', goal: 'strength', level: 'ADVANCED', rating: 4.9, ratingCount: 430, times: 76, sets: 20, dur: 55, kcal: 460, target: 'POSTERIOR', pct: 85 },
    { type: 'Structural Flow', name: 'Mobility Reset', goal: 'mobility', level: 'BEGINNER', rating: 4.7, ratingCount: 612, times: 340, sets: 8, dur: 28, kcal: 150, target: 'FULL BODY', pct: 70 },
    { type: 'Calisthenics', name: 'Bodyweight Mastery', goal: 'mixed', level: 'INT', rating: 4.8, ratingCount: 540, times: 188, sets: 14, dur: 35, kcal: 320, target: 'UPPER BODY', pct: 80 },
    { type: 'Endurance Engine', name: 'Aerobic Builder', goal: 'endurance', level: 'ALL LEVELS', rating: 4.6, ratingCount: 390, times: 142, sets: 12, dur: 40, kcal: 410, target: 'LEGS/CARDIO', pct: 75 },
  ];
  for (const d of signatureDefs) {
    workoutDocs.push(base({
      _id: oid(), name: d.name, imageUrl: IMG.workout,
      description: `A signature ${d.type} session blending intensity and control.`,
      duration: d.dur, caloriesKcal: d.kcal, difficulty: 'intermediate',
      goal: d.goal, levelLabel: d.level, creatorType: 'ai_coach', creatorName: 'AI Coach',
      rating: d.rating, ratingCount: d.ratingCount, timesCompleted: d.times, totalSets: d.sets,
      targetMuscleLabel: d.target, targetMusclePercent: d.pct, isCatalog: true, popularity: 70,
      workoutTypeId: typeBy[d.type], muscleGroupId: muscleId[`${d.type}:Full Body`],
      equipmentItems: [{ name: 'Bodyweight', icon: 'user', quantityLabel: 'None', optional: false }, { name: 'Mat', icon: 'square', quantityLabel: '1', optional: true }],
      sections: [
        { title: 'Warmup', totalExercises: 1, totalMinutes: 5, items: [warmItem(armCircles)] },
        { title: 'Main Block', totalExercises: fullBodyExs.length, totalMinutes: Math.max(12, d.dur - 10), items: fullBodyExs.map((ex) => itemFromEx(ex)) },
        { title: 'Cooldown', totalExercises: 1, totalMinutes: 5, items: [warmItem(stretch)] },
      ],
    }));
  }

  await db.collection('workouts').insertMany(workoutDocs);
  console.log(`  + ${workoutDocs.length} catalog workouts (11 per-muscle Hypertrophy + 5 signature)`);

  console.log('✅ Training catalog seeded.');
  await mongoose.disconnect();
}

main().catch(async (e) => {
  console.error('Seed failed:', e);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});
