/* eslint-disable no-console */
/**
 * Seeds an authentic training catalog for the flow:
 *   Training tab → Workout Types → (Hypertrophy: Target Muscle) → Workout Details → Exercise Detail
 *
 * - Hypertrophy: a muscle picker; each muscle group has 10-15 real exercises,
 *   and its workout's Main Block lists all of them.
 * - Other types (Metabolic HIIT, Pure Strength, Structural Flow, Calisthenics,
 *   Endurance Engine): NO muscle picker — one workout each, with the type's own
 *   researched exercise set.
 *
 * Refs (workoutTypeId/muscleGroupId/exerciseId) are stored as STRINGS — this
 * backend's mongoose does not cast to ObjectId. Doc _id stays ObjectId.
 * Idempotent: wipes+reinserts seedTag:'training-catalog'. Restart not required.
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
  hiit: 'https://images.unsplash.com/photo-1434596922112-19c563067271?w=800',
  mobility: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
  cardio: 'https://images.unsplash.com/photo-1461938337379-4b537cdf0a51?w=800',
  hero: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800',
  workout: 'https://images.unsplash.com/photo-1581009137042-c552e485697a?w=800',
};

const EQUIP_NAME = {
  barbell: 'Barbell', dumbbell: 'Dumbbells', cable: 'Cable Machine', machine: 'Machine',
  bodyweight: 'Bodyweight', kettlebell: 'Kettlebell', cardio: 'Cardio Machine', band: 'Resistance Band',
};

// prescription tuple helper
const P = (s, r, rest, tempo, rpe, cal) => ({ setsLabel: s, repsLabel: r, restLabel: rest, tempo, rpe, caloriesPerMin: cal });
// exercise def helper: e(name, equip, mechanic, force, primary[], secondary[], prescription)
const e = (n, eq, me, f, pm, sm, p) => ({ name: n, eq, mech: me, force: f, pm, sm, presc: p });

const TECH = {
  compound: ['Set up with a stable base and a braced core.', 'Drive through the full range of motion under control.', 'Return to the start position keeping tension on the target muscle.'],
  isolation: ['Position yourself to isolate the target muscle.', 'Move through a full range, squeezing hard at peak contraction.', 'Lower slowly to a complete stretch.'],
  mobility: ['Ease gently into the position.', 'Move slowly through the available range.', 'Breathe steadily and relax a little deeper each rep.'],
  cardio: ['Establish a steady, repeatable rhythm.', 'Hold strong posture and controlled breathing.', 'Sustain or build the pace across the interval.'],
  plyometric: ['Load into an athletic, braced position.', 'Explode through the movement with full intent.', 'Land softly and absorb, then reset.'],
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

  // ── 2) Muscle Groups ──────────────────────────────────────────────
  const muscleMeta = {
    Chest: { count: 42, role: 'main', region: 'upper', img: IMG.chest },
    Back: { count: 38, role: 'core', region: 'upper', img: IMG.back },
    Shoulders: { count: 30, role: 'stability', region: 'upper', img: IMG.shoulders },
    Biceps: { count: 24, role: 'main', region: 'upper', img: IMG.arms },
    Triceps: { count: 24, role: 'main', region: 'upper', img: IMG.arms },
    Quads: { count: 28, role: 'core', region: 'lower', img: IMG.legs },
    Hamstrings: { count: 22, role: 'core', region: 'lower', img: IMG.legs },
    Glutes: { count: 24, role: 'core', region: 'lower', img: IMG.glutes },
    Calves: { count: 16, role: 'stability', region: 'lower', img: IMG.legs },
    Core: { count: 45, role: 'core', region: 'core', img: IMG.core },
    'Full Body': { count: 35, role: 'mixed', region: 'full', img: IMG.hero, full: true },
  };
  const typeMuscles = {
    Hypertrophy: Object.keys(muscleMeta),
    // Non-hypertrophy types only need a Full Body bucket to anchor their workout.
    'Pure Strength': ['Full Body'],
    'Metabolic HIIT': ['Full Body'],
    'Structural Flow': ['Full Body'],
    Calisthenics: ['Full Body'],
    'Endurance Engine': ['Full Body'],
  };
  const muscleId = {};
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
  console.log(`  + ${muscleDocs.length} muscle_groups`);

  // ── 3) Exercise factory ───────────────────────────────────────────
  const exerciseDocs = [];
  const makeEx = (typeId, mgId, img, def, category) => {
    const id = oid();
    const mech = def.mech || 'compound';
    const cat = category || def.cat || 'strength';
    exerciseDocs.push(base({
      _id: id, workoutTypeId: typeId, muscleGroupId: mgId,
      name: def.name, imageUrl: img, mediaUrls: [img],
      summary: def.summary || `${def.name} — targets ${def.pm.join(' & ')}.`,
      equipment: def.eq, equipmentDetails: EQUIP_NAME[def.eq] || def.eq,
      difficulty: def.diff || 'intermediate', category: cat, mechanic: mech, force: def.force || 'push',
      primaryMuscles: def.pm, secondaryMuscles: def.sm || [], prescription: def.presc, videoUrl: '',
      techniqueSteps: def.tech || TECH[cat] || TECH[mech] || TECH.compound,
      breathingCue: def.breath || (cat === 'mobility' ? 'Long, slow exhales to deepen each position.' : 'Exhale on the effort phase, inhale on the return.'),
      safetyNotes: def.safety || ['Keep a braced core and neutral spine throughout.'],
      commonMistakes: def.mistakes || ['Using momentum instead of controlled tension.'],
      alternatives: def.alts || [],
    }));
    return { id: id.toString(), name: def.name, thumb: img, presc: def.presc };
  };

  const hyperId = typeBy['Hypertrophy'];

  // Universal warmup / cooldown (Hypertrophy Full Body)
  const warm = makeEx(hyperId, muscleId['Hypertrophy:Full Body'], IMG.mobility,
    { name: 'Dynamic Warm-Up', eq: 'bodyweight', mech: 'isolation', force: 'multi', pm: ['Full Body'], presc: P('1', '5m', '-', 'Controlled', 3, 5), cat: 'mobility',
      tech: ['Move through arm circles, leg swings and bodyweight squats.', 'Gradually raise your heart rate and range of motion.', 'Prime the muscles you are about to train.'] }, 'mobility');
  const cool = makeEx(hyperId, muscleId['Hypertrophy:Full Body'], IMG.mobility,
    { name: 'Cooldown Stretch', eq: 'bodyweight', mech: 'isolation', force: 'static', pm: ['Full Body'], presc: P('1', '5m', '-', 'Hold', 2, 3), cat: 'mobility',
      tech: ['Ease into each stretch for the muscles trained.', 'Hold without bouncing.', 'Breathe and relax deeper each exhale.'] }, 'mobility');

  // ── Hypertrophy: 10-15 exercises per muscle ───────────────────────
  const HYP = {
    Chest: [
      e('Barbell Bench Press', 'barbell', 'compound', 'push', ['Pectoralis Major'], ['Front Delts', 'Triceps'], P('4', '6-10', '120s', '2-0-1', 8.5, 8)),
      e('Dumbbell Flat Press', 'dumbbell', 'compound', 'push', ['Pectoralis Major', 'Front Delts'], ['Triceps'], P('4', '10-12', '90s', '2-0-2', 8, 8)),
      e('Incline Barbell Press', 'barbell', 'compound', 'push', ['Upper Chest'], ['Front Delts', 'Triceps'], P('4', '8-10', '90s', '2-0-1', 8.5, 8)),
      e('Incline Dumbbell Press', 'dumbbell', 'compound', 'push', ['Upper Chest', 'Front Delts'], ['Triceps'], P('3-4', '8-12', '90s', '2-0-2', 8, 8)),
      e('Decline Bench Press', 'barbell', 'compound', 'push', ['Lower Chest'], ['Triceps'], P('3', '10-12', '90s', '2-0-1', 7.5, 7)),
      e('Flat Dumbbell Flyes', 'dumbbell', 'isolation', 'push', ['Pectoralis Major'], ['Front Delts'], P('3', '12-15', '60s', '3-1-1', 7, 6)),
      e('Incline Chest Flyes', 'dumbbell', 'isolation', 'push', ['Upper Chest'], ['Front Delts'], P('3', '15', '60s', '3-1-1', 7, 6)),
      e('Cable Crossover', 'cable', 'isolation', 'push', ['Pectoralis Major'], ['Front Delts'], P('3', '12-15', '60s', '2-1-2', 7.5, 6)),
      e('Pec Deck Machine', 'machine', 'isolation', 'push', ['Pectoralis Major'], [], P('3', '12-15', '60s', '2-1-2', 7.5, 6)),
      e('Machine Chest Press', 'machine', 'compound', 'push', ['Pectoralis Major'], ['Triceps'], P('3', '10-12', '75s', '2-0-1', 7.5, 7)),
      e('Push-Up', 'bodyweight', 'compound', 'push', ['Chest', 'Front Delts'], ['Triceps', 'Core'], P('3', 'AMRAP', '60s', '2-0-1', 8, 7)),
      e('Chest Dips', 'bodyweight', 'compound', 'push', ['Lower Chest'], ['Triceps'], P('3', 'AMRAP', '75s', '2-0-1', 8.5, 8)),
    ],
    Back: [
      e('Deadlift', 'barbell', 'compound', 'pull', ['Erectors', 'Lats'], ['Glutes', 'Traps'], P('4', '5-6', '180s', '2-0-1', 9, 10)),
      e('Pull-Up', 'bodyweight', 'compound', 'pull', ['Lats'], ['Biceps', 'Rear Delts'], P('4', 'AMRAP', '90s', '2-0-1', 9, 9)),
      e('Chin-Up', 'bodyweight', 'compound', 'pull', ['Lats'], ['Biceps'], P('3', 'AMRAP', '90s', '2-0-1', 8.5, 9)),
      e('Bent-Over Barbell Row', 'barbell', 'compound', 'pull', ['Lats', 'Mid Traps'], ['Biceps'], P('4', '8-10', '90s', '2-0-1', 8.5, 8)),
      e('Pendlay Row', 'barbell', 'compound', 'pull', ['Mid Back'], ['Lats', 'Biceps'], P('4', '6-8', '120s', '1-0-1', 8.5, 8)),
      e('Lat Pulldown', 'cable', 'compound', 'pull', ['Lats'], ['Biceps'], P('3', '10-12', '75s', '2-0-2', 8, 7)),
      e('Seated Cable Row', 'cable', 'compound', 'pull', ['Mid Back'], ['Biceps', 'Rear Delts'], P('3', '12', '60s', '2-1-2', 7.5, 7)),
      e('Single-Arm Dumbbell Row', 'dumbbell', 'compound', 'pull', ['Lats'], ['Biceps'], P('3', '10-12', '60s', '2-0-1', 8, 7)),
      e('T-Bar Row', 'barbell', 'compound', 'pull', ['Mid Back', 'Lats'], ['Biceps'], P('3', '10', '90s', '2-0-1', 8, 8)),
      e('Straight-Arm Pulldown', 'cable', 'isolation', 'pull', ['Lats'], [], P('3', '15', '45s', '2-1-2', 7, 5)),
      e('Chest-Supported Row', 'machine', 'compound', 'pull', ['Mid Back'], ['Rear Delts'], P('3', '12', '60s', '2-1-2', 7.5, 7)),
      e('Face Pull', 'cable', 'isolation', 'pull', ['Rear Delts', 'Mid Traps'], [], P('3', '15-20', '45s', '2-1-2', 6.5, 5)),
      e('Rack Pull', 'barbell', 'compound', 'pull', ['Erectors', 'Traps'], ['Lats'], P('3', '6-8', '120s', '2-0-1', 8.5, 8)),
    ],
    Shoulders: [
      e('Overhead Barbell Press', 'barbell', 'compound', 'push', ['Front Delts', 'Side Delts'], ['Triceps'], P('4', '6-10', '90s', '2-0-1', 8.5, 8)),
      e('Seated Dumbbell Press', 'dumbbell', 'compound', 'push', ['Front Delts', 'Side Delts'], ['Triceps'], P('4', '8-12', '90s', '2-0-1', 8, 8)),
      e('Arnold Press', 'dumbbell', 'compound', 'push', ['Front Delts', 'Side Delts'], ['Triceps'], P('3', '10-12', '75s', '2-0-2', 8, 7)),
      e('Dumbbell Lateral Raise', 'dumbbell', 'isolation', 'push', ['Side Delts'], [], P('4', '15', '45s', '2-1-1', 7, 5)),
      e('Cable Lateral Raise', 'cable', 'isolation', 'push', ['Side Delts'], [], P('3', '15', '45s', '2-1-1', 7, 5)),
      e('Front Raise', 'dumbbell', 'isolation', 'push', ['Front Delts'], [], P('3', '12-15', '45s', '2-1-1', 6.5, 5)),
      e('Rear Delt Flye', 'dumbbell', 'isolation', 'pull', ['Rear Delts'], [], P('3', '15', '45s', '2-1-1', 6.5, 5)),
      e('Face Pull', 'cable', 'isolation', 'pull', ['Rear Delts'], ['Mid Traps'], P('3', '15-20', '45s', '2-1-2', 6.5, 5)),
      e('Upright Row', 'barbell', 'compound', 'pull', ['Side Delts', 'Traps'], ['Biceps'], P('3', '12', '60s', '2-0-1', 7.5, 6)),
      e('Barbell Shrug', 'barbell', 'isolation', 'pull', ['Traps'], [], P('4', '12-15', '60s', '2-1-1', 7.5, 5)),
      e('Machine Shoulder Press', 'machine', 'compound', 'push', ['Front Delts'], ['Triceps'], P('3', '10-12', '75s', '2-0-1', 7.5, 7)),
      e('Landmine Press', 'barbell', 'compound', 'push', ['Front Delts'], ['Upper Chest', 'Triceps'], P('3', '10', '75s', '2-0-1', 7.5, 7)),
    ],
    Biceps: [
      e('Barbell Curl', 'barbell', 'isolation', 'pull', ['Biceps'], [], P('4', '8-12', '60s', '2-0-2', 8, 5)),
      e('EZ-Bar Curl', 'barbell', 'isolation', 'pull', ['Biceps'], [], P('3', '10-12', '60s', '2-0-2', 8, 5)),
      e('Dumbbell Curl', 'dumbbell', 'isolation', 'pull', ['Biceps'], [], P('3', '10-12', '60s', '2-0-2', 7.5, 5)),
      e('Incline Dumbbell Curl', 'dumbbell', 'isolation', 'pull', ['Biceps (Long Head)'], [], P('3', '12-15', '60s', '3-0-1', 7.5, 5)),
      e('Hammer Curl', 'dumbbell', 'isolation', 'pull', ['Biceps', 'Brachialis'], [], P('3', '12', '60s', '2-0-2', 7.5, 5)),
      e('Concentration Curl', 'dumbbell', 'isolation', 'pull', ['Biceps (Peak)'], [], P('3', '12-15', '45s', '3-1-1', 7, 4)),
      e('Preacher Curl', 'machine', 'isolation', 'pull', ['Biceps (Short Head)'], [], P('3', '10-12', '60s', '3-0-1', 8, 5)),
      e('Cable Curl', 'cable', 'isolation', 'pull', ['Biceps'], [], P('3', '12-15', '45s', '2-1-1', 7.5, 5)),
      e('Spider Curl', 'dumbbell', 'isolation', 'pull', ['Biceps'], [], P('3', '12', '45s', '3-0-1', 7.5, 4)),
      e('Reverse Curl', 'barbell', 'isolation', 'pull', ['Brachialis', 'Forearms'], [], P('3', '12-15', '45s', '2-0-2', 7, 4)),
      e('Zottman Curl', 'dumbbell', 'isolation', 'pull', ['Biceps', 'Forearms'], [], P('3', '10-12', '60s', '2-0-2', 7.5, 5)),
      e('Cable Rope Hammer Curl', 'cable', 'isolation', 'pull', ['Biceps', 'Brachialis'], [], P('3', '15', '45s', '2-1-1', 7, 4)),
    ],
    Triceps: [
      e('Close-Grip Bench Press', 'barbell', 'compound', 'push', ['Triceps'], ['Chest'], P('4', '8-10', '90s', '2-0-1', 8.5, 7)),
      e('Tricep Pushdown', 'cable', 'isolation', 'push', ['Triceps'], [], P('4', '12-15', '60s', '2-0-1', 7.5, 5)),
      e('Rope Pushdown', 'cable', 'isolation', 'push', ['Triceps (Lateral)'], [], P('3', '15', '45s', '2-1-1', 7.5, 5)),
      e('Overhead Dumbbell Extension', 'dumbbell', 'isolation', 'push', ['Triceps (Long Head)'], [], P('3', '12', '60s', '3-0-1', 7.5, 5)),
      e('Skull Crushers', 'barbell', 'isolation', 'push', ['Triceps'], [], P('3', '10-12', '60s', '3-0-1', 8, 5)),
      e('Bench Dips', 'bodyweight', 'compound', 'push', ['Triceps'], ['Chest'], P('3', 'AMRAP', '60s', '2-0-1', 8, 6)),
      e('Parallel Bar Dips', 'bodyweight', 'compound', 'push', ['Triceps'], ['Lower Chest'], P('3', 'AMRAP', '75s', '2-0-1', 8.5, 7)),
      e('Cable Overhead Extension', 'cable', 'isolation', 'push', ['Triceps (Long Head)'], [], P('3', '12-15', '45s', '2-1-1', 7.5, 5)),
      e('Diamond Push-Up', 'bodyweight', 'compound', 'push', ['Triceps'], ['Chest'], P('3', 'AMRAP', '60s', '2-0-1', 8, 6)),
      e('Single-Arm Cable Kickback', 'cable', 'isolation', 'push', ['Triceps'], [], P('3', '15', '45s', '2-1-1', 7, 4)),
      e('JM Press', 'barbell', 'compound', 'push', ['Triceps'], [], P('3', '8-10', '75s', '2-0-1', 8, 6)),
      e('Machine Tricep Dip', 'machine', 'compound', 'push', ['Triceps'], [], P('3', '12', '60s', '2-0-1', 7.5, 6)),
    ],
    Quads: [
      e('Barbell Back Squat', 'barbell', 'compound', 'push', ['Quads', 'Glutes'], ['Hamstrings'], P('4', '6-10', '150s', '3-0-1', 8.5, 9)),
      e('Front Squat', 'barbell', 'compound', 'push', ['Quads'], ['Glutes', 'Core'], P('4', '6-8', '150s', '3-0-1', 8.5, 9)),
      e('Hack Squat', 'machine', 'compound', 'push', ['Quads'], ['Glutes'], P('4', '10-12', '90s', '2-0-1', 8, 8)),
      e('Leg Press', 'machine', 'compound', 'push', ['Quads', 'Glutes'], [], P('4', '12', '90s', '2-0-1', 8, 8)),
      e('Leg Extension', 'machine', 'isolation', 'push', ['Quads'], [], P('3', '15', '60s', '2-1-2', 7.5, 6)),
      e('Walking Lunges', 'dumbbell', 'compound', 'push', ['Quads', 'Glutes'], [], P('3', '12 each', '75s', '2-0-1', 8, 8)),
      e('Bulgarian Split Squat', 'dumbbell', 'compound', 'push', ['Quads', 'Glutes'], [], P('3', '10 each', '75s', '2-0-1', 8.5, 8)),
      e('Goblet Squat', 'dumbbell', 'compound', 'push', ['Quads'], ['Glutes'], P('3', '12-15', '60s', '2-0-1', 7.5, 7)),
      e('Sissy Squat', 'bodyweight', 'isolation', 'push', ['Quads'], [], P('3', '12', '60s', '3-0-1', 7.5, 6)),
      e('Dumbbell Step-Up', 'dumbbell', 'compound', 'push', ['Quads', 'Glutes'], [], P('3', '12 each', '60s', '2-0-1', 7.5, 7)),
      e('Smith Machine Squat', 'machine', 'compound', 'push', ['Quads'], ['Glutes'], P('3', '10-12', '90s', '2-0-1', 8, 8)),
    ],
    Hamstrings: [
      e('Romanian Deadlift', 'barbell', 'compound', 'pull', ['Hamstrings', 'Glutes'], ['Lower Back'], P('4', '8-10', '120s', '3-0-1', 8.5, 8)),
      e('Stiff-Leg Deadlift', 'barbell', 'compound', 'pull', ['Hamstrings'], ['Glutes'], P('3', '8-10', '120s', '3-0-1', 8.5, 8)),
      e('Lying Leg Curl', 'machine', 'isolation', 'pull', ['Hamstrings'], [], P('4', '12', '60s', '2-1-2', 7.5, 6)),
      e('Seated Leg Curl', 'machine', 'isolation', 'pull', ['Hamstrings'], [], P('3', '15', '60s', '2-1-2', 7, 6)),
      e('Good Morning', 'barbell', 'compound', 'pull', ['Hamstrings'], ['Lower Back', 'Glutes'], P('3', '10', '90s', '3-0-1', 8, 7)),
      e('Nordic Hamstring Curl', 'bodyweight', 'isolation', 'pull', ['Hamstrings'], [], P('3', '8', '75s', '3-0-1', 9, 6)),
      e('Glute-Ham Raise', 'machine', 'compound', 'pull', ['Hamstrings', 'Glutes'], [], P('3', '10', '75s', '2-0-1', 8.5, 7)),
      e('Single-Leg RDL', 'dumbbell', 'compound', 'pull', ['Hamstrings', 'Glutes'], ['Core'], P('3', '10 each', '60s', '3-0-1', 8, 7)),
      e('Cable Pull-Through', 'cable', 'compound', 'pull', ['Hamstrings', 'Glutes'], [], P('3', '12-15', '60s', '2-1-1', 7.5, 6)),
      e('Kettlebell Swing', 'kettlebell', 'compound', 'multi', ['Hamstrings', 'Glutes'], ['Core'], P('3', '15', '45s', 'Expl.', 8, 9)),
    ],
    Glutes: [
      e('Barbell Hip Thrust', 'barbell', 'compound', 'push', ['Glutes'], ['Hamstrings'], P('4', '10-12', '90s', '2-1-1', 8.5, 8)),
      e('Sumo Deadlift', 'barbell', 'compound', 'pull', ['Glutes', 'Adductors'], ['Hamstrings'], P('4', '6-8', '150s', '2-0-1', 8.5, 9)),
      e('Bulgarian Split Squat', 'dumbbell', 'compound', 'push', ['Glutes', 'Quads'], [], P('3', '10 each', '75s', '2-0-1', 8, 8)),
      e('Glute Bridge', 'bodyweight', 'compound', 'push', ['Glutes'], ['Hamstrings'], P('3', '15', '45s', '2-1-1', 7, 6)),
      e('Cable Glute Kickback', 'cable', 'isolation', 'push', ['Glutes'], [], P('3', '15 each', '45s', '2-1-1', 7, 5)),
      e('Curtsy Lunge', 'dumbbell', 'compound', 'push', ['Glutes (Medius)'], ['Quads'], P('3', '12 each', '60s', '2-0-1', 7.5, 7)),
      e('Step-Up', 'dumbbell', 'compound', 'push', ['Glutes', 'Quads'], [], P('3', '12 each', '60s', '2-0-1', 7.5, 7)),
      e('Frog Pump', 'bodyweight', 'isolation', 'push', ['Glutes'], [], P('3', '20', '45s', '2-1-1', 6.5, 5)),
      e('Banded Lateral Walk', 'band', 'isolation', 'push', ['Glutes (Medius)'], [], P('3', '15 each', '45s', '2-0-1', 6.5, 5)),
      e('Hip Abduction Machine', 'machine', 'isolation', 'push', ['Glutes (Medius)'], [], P('3', '15-20', '45s', '2-1-2', 7, 5)),
    ],
    Calves: [
      e('Standing Calf Raise', 'machine', 'isolation', 'push', ['Gastrocnemius'], [], P('4', '15-20', '45s', '2-1-2', 7.5, 5)),
      e('Seated Calf Raise', 'machine', 'isolation', 'push', ['Soleus'], [], P('4', '15', '45s', '2-1-2', 7.5, 5)),
      e('Single-Leg Calf Raise', 'bodyweight', 'isolation', 'push', ['Gastrocnemius'], [], P('3', '20 each', '45s', '2-1-2', 7, 4)),
      e('Leg Press Calf Raise', 'machine', 'isolation', 'push', ['Gastrocnemius'], [], P('4', '15', '45s', '2-1-2', 7.5, 5)),
      e('Donkey Calf Raise', 'machine', 'isolation', 'push', ['Gastrocnemius'], [], P('3', '15', '45s', '2-1-2', 7.5, 5)),
      e('Smith Machine Calf Raise', 'machine', 'isolation', 'push', ['Gastrocnemius'], [], P('3', '15-20', '45s', '2-1-2', 7.5, 5)),
      e('Jump Rope', 'bodyweight', 'plyometric', 'multi', ['Calves'], [], P('3', '60s', '30s', 'Expl.', 7, 11)),
      e('Box Jump', 'bodyweight', 'plyometric', 'push', ['Calves', 'Quads'], [], P('3', '10', '60s', 'Expl.', 8, 10)),
      e('Tibialis Raise', 'bodyweight', 'isolation', 'pull', ['Tibialis Anterior'], [], P('3', '15-20', '45s', '2-1-2', 6.5, 4)),
      e('Weighted Stair Calf Raise', 'dumbbell', 'isolation', 'push', ['Gastrocnemius'], [], P('3', '15 each', '45s', '2-1-2', 7.5, 5)),
    ],
    Core: [
      e('Plank', 'bodyweight', 'isolation', 'static', ['Core'], [], P('3', '45-60s', '45s', 'Hold', 7, 4)),
      e('Hanging Leg Raise', 'bodyweight', 'compound', 'pull', ['Lower Abs'], ['Hip Flexors'], P('3', '12-15', '60s', '2-0-1', 8, 6)),
      e('Cable Crunch', 'cable', 'isolation', 'pull', ['Abs'], [], P('3', '15', '45s', '2-1-2', 7.5, 5)),
      e('Russian Twist', 'bodyweight', 'isolation', 'multi', ['Obliques'], [], P('3', '20', '45s', '1-1-1', 7, 5)),
      e('Ab Wheel Rollout', 'bodyweight', 'compound', 'push', ['Core'], ['Lats'], P('3', '10-12', '60s', '3-0-1', 8.5, 6)),
      e('Bicycle Crunch', 'bodyweight', 'isolation', 'multi', ['Abs', 'Obliques'], [], P('3', '20 each', '45s', '1-1-1', 7, 5)),
      e('Hollow Body Hold', 'bodyweight', 'isolation', 'static', ['Core'], [], P('3', '30s', '45s', 'Hold', 7.5, 4)),
      e('Dead Bug', 'bodyweight', 'isolation', 'multi', ['Core'], [], P('3', '12 each', '30s', '2-0-2', 6, 4)),
      e('Side Plank', 'bodyweight', 'isolation', 'static', ['Obliques'], [], P('3', '30s each', '30s', 'Hold', 7, 4)),
      e('Cable Woodchopper', 'cable', 'compound', 'multi', ['Obliques'], ['Core'], P('3', '12 each', '45s', '2-1-1', 7.5, 6)),
      e('Hanging Knee Raise', 'bodyweight', 'compound', 'pull', ['Lower Abs'], [], P('3', '15', '45s', '2-0-1', 7.5, 5)),
      e('V-Up', 'bodyweight', 'compound', 'multi', ['Abs'], [], P('3', '15', '45s', '1-1-1', 7.5, 5)),
    ],
    'Full Body': [
      e('Burpee', 'bodyweight', 'compound', 'multi', ['Full Body'], [], P('4', '12', '45s', 'Expl.', 8.5, 12)),
      e('Kettlebell Swing', 'kettlebell', 'compound', 'multi', ['Glutes', 'Hamstrings'], ['Core'], P('4', '15', '45s', 'Expl.', 8, 10)),
      e('Dumbbell Thruster', 'dumbbell', 'compound', 'push', ['Quads', 'Shoulders'], ['Core'], P('4', '12', '60s', '2-0-1', 8.5, 11)),
      e('Clean and Press', 'barbell', 'compound', 'multi', ['Full Body'], [], P('4', '8', '90s', 'Expl.', 8.5, 11)),
      e('Mountain Climbers', 'bodyweight', 'compound', 'multi', ['Core', 'Shoulders'], [], P('3', '30s', '30s', 'Expl.', 8, 10)),
      e('Turkish Get-Up', 'kettlebell', 'compound', 'multi', ['Full Body'], ['Core'], P('3', '5 each', '60s', 'Controlled', 7.5, 8)),
      e('Man Maker', 'dumbbell', 'compound', 'multi', ['Full Body'], [], P('3', '10', '75s', 'Expl.', 8.5, 12)),
      e('Devil Press', 'dumbbell', 'compound', 'multi', ['Full Body'], [], P('3', '10', '75s', 'Expl.', 8.5, 12)),
      e('Wall Ball', 'bodyweight', 'compound', 'multi', ['Quads', 'Shoulders'], [], P('3', '15', '45s', 'Expl.', 8, 10)),
      e('Bear Crawl', 'bodyweight', 'compound', 'multi', ['Core', 'Shoulders'], [], P('3', '40s', '45s', 'Controlled', 7.5, 9)),
    ],
  };

  const exByMuscle = {};
  for (const [muscleLabel, list] of Object.entries(HYP)) {
    const img = muscleMeta[muscleLabel].img;
    exByMuscle[muscleLabel] = list.map((def) => makeEx(hyperId, muscleId[`Hypertrophy:${muscleLabel}`], img, def, 'strength'));
  }

  // ── Other types: their own exercise libraries ─────────────────────
  const TYPE_EX = {
    'Metabolic HIIT': { img: IMG.hiit, cat: 'plyometric', list: [
      e('Burpees', 'bodyweight', 'compound', 'multi', ['Full Body'], [], P('4', '40s', '20s', 'Expl.', 9, 13)),
      e('Jump Squats', 'bodyweight', 'plyometric', 'push', ['Quads', 'Glutes'], [], P('4', '40s', '20s', 'Expl.', 8.5, 12)),
      e('Mountain Climbers', 'bodyweight', 'compound', 'multi', ['Core'], ['Shoulders'], P('4', '40s', '20s', 'Expl.', 8, 11)),
      e('High Knees', 'bodyweight', 'cardio', 'multi', ['Quads', 'Calves'], [], P('4', '40s', '20s', 'Expl.', 8, 12)),
      e('Jumping Jacks', 'bodyweight', 'cardio', 'multi', ['Full Body'], [], P('3', '45s', '15s', 'Expl.', 7, 10)),
      e('Box Jumps', 'bodyweight', 'plyometric', 'push', ['Quads', 'Glutes'], ['Calves'], P('4', '30s', '30s', 'Expl.', 8.5, 11)),
      e('Kettlebell Swings', 'kettlebell', 'compound', 'multi', ['Glutes', 'Hamstrings'], ['Core'], P('4', '40s', '20s', 'Expl.', 8, 11)),
      e('Dumbbell Thrusters', 'dumbbell', 'compound', 'push', ['Quads', 'Shoulders'], ['Core'], P('4', '40s', '20s', 'Expl.', 8.5, 12)),
      e('Skater Jumps', 'bodyweight', 'plyometric', 'multi', ['Glutes', 'Quads'], [], P('3', '40s', '20s', 'Expl.', 8, 11)),
      e('Plank Jacks', 'bodyweight', 'compound', 'multi', ['Core'], ['Shoulders'], P('3', '40s', '20s', 'Expl.', 7.5, 9)),
      e('Tuck Jumps', 'bodyweight', 'plyometric', 'push', ['Quads'], ['Calves'], P('3', '30s', '30s', 'Expl.', 8.5, 11)),
      e('Bicycle Crunch', 'bodyweight', 'isolation', 'multi', ['Abs', 'Obliques'], [], P('3', '45s', '15s', '1-1-1', 7, 8)),
      e('Jump Lunges', 'bodyweight', 'plyometric', 'push', ['Quads', 'Glutes'], [], P('3', '40s', '20s', 'Expl.', 8.5, 12)),
      e('Battle Rope Slams', 'cardio', 'compound', 'multi', ['Shoulders', 'Core'], [], P('4', '30s', '30s', 'Expl.', 8.5, 13)),
    ] },
    'Pure Strength': { img: IMG.workout, cat: 'strength', list: [
      e('Barbell Back Squat', 'barbell', 'compound', 'push', ['Quads', 'Glutes'], ['Hamstrings'], P('5', '5', '180s', '2-0-1', 9, 9)),
      e('Conventional Deadlift', 'barbell', 'compound', 'pull', ['Erectors', 'Glutes'], ['Lats', 'Traps'], P('5', '3-5', '210s', '2-0-1', 9.5, 10)),
      e('Barbell Bench Press', 'barbell', 'compound', 'push', ['Chest'], ['Triceps', 'Front Delts'], P('5', '5', '180s', '2-1-1', 9, 8)),
      e('Overhead Press', 'barbell', 'compound', 'push', ['Shoulders'], ['Triceps'], P('4', '5', '150s', '2-0-1', 8.5, 8)),
      e('Barbell Row', 'barbell', 'compound', 'pull', ['Mid Back', 'Lats'], ['Biceps'], P('4', '5-6', '150s', '2-0-1', 8.5, 8)),
      e('Front Squat', 'barbell', 'compound', 'push', ['Quads'], ['Core'], P('4', '4-6', '180s', '2-0-1', 8.5, 9)),
      e('Romanian Deadlift', 'barbell', 'compound', 'pull', ['Hamstrings', 'Glutes'], [], P('4', '6-8', '150s', '3-0-1', 8.5, 8)),
      e('Weighted Pull-Up', 'bodyweight', 'compound', 'pull', ['Lats'], ['Biceps'], P('4', '5', '150s', '2-0-1', 9, 9)),
      e('Power Clean', 'barbell', 'compound', 'multi', ['Full Body'], [], P('5', '3', '180s', 'Expl.', 8.5, 11)),
      e('Floor Press', 'barbell', 'compound', 'push', ['Chest', 'Triceps'], [], P('4', '5', '150s', '2-1-1', 8.5, 8)),
      e('Pendlay Row', 'barbell', 'compound', 'pull', ['Mid Back'], ['Lats'], P('4', '5', '150s', '1-0-1', 8.5, 8)),
      e("Farmer's Carry", 'dumbbell', 'compound', 'static', ['Forearms', 'Traps'], ['Core'], P('4', '40m', '90s', 'Carry', 8, 8)),
      e('Box Squat', 'barbell', 'compound', 'push', ['Quads', 'Glutes'], [], P('4', '5', '180s', '2-1-1', 8.5, 9)),
    ] },
    'Structural Flow': { img: IMG.mobility, cat: 'mobility', list: [
      e('Cat-Cow', 'bodyweight', 'isolation', 'multi', ['Spine'], [], P('2', '10', '15s', 'Flow', 2, 3)),
      e("World's Greatest Stretch", 'bodyweight', 'isolation', 'multi', ['Hips', 'T-Spine'], [], P('2', '6 each', '20s', 'Flow', 3, 4)),
      e('Downward Dog', 'bodyweight', 'isolation', 'static', ['Hamstrings', 'Shoulders'], [], P('2', '30s', '15s', 'Hold', 3, 3)),
      e('Cobra Stretch', 'bodyweight', 'isolation', 'static', ['Abs', 'Hip Flexors'], [], P('2', '30s', '15s', 'Hold', 2, 2)),
      e('Hip Flexor Stretch', 'bodyweight', 'isolation', 'static', ['Hip Flexors'], [], P('2', '30s each', '15s', 'Hold', 3, 3)),
      e('Thoracic Rotation', 'bodyweight', 'isolation', 'multi', ['T-Spine'], [], P('2', '8 each', '15s', 'Flow', 2, 3)),
      e('90/90 Hip Switch', 'bodyweight', 'isolation', 'multi', ['Hips'], [], P('2', '10', '20s', 'Flow', 3, 3)),
      e('Deep Squat Hold', 'bodyweight', 'isolation', 'static', ['Hips', 'Ankles'], [], P('2', '45s', '20s', 'Hold', 4, 4)),
      e('Pigeon Pose', 'bodyweight', 'isolation', 'static', ['Glutes', 'Hips'], [], P('2', '45s each', '15s', 'Hold', 3, 3)),
      e('Shoulder Dislocates', 'band', 'isolation', 'multi', ['Shoulders'], [], P('2', '12', '15s', 'Flow', 2, 3)),
      e('Bird Dog', 'bodyweight', 'isolation', 'multi', ['Core', 'Glutes'], [], P('3', '10 each', '20s', '2-1-2', 4, 4)),
      e("Child's Pose", 'bodyweight', 'isolation', 'static', ['Lats', 'Spine'], [], P('2', '45s', '15s', 'Hold', 1, 2)),
      e('Couch Stretch', 'bodyweight', 'isolation', 'static', ['Quads', 'Hip Flexors'], [], P('2', '45s each', '15s', 'Hold', 4, 3)),
      e('Supine Spinal Twist', 'bodyweight', 'isolation', 'static', ['Spine', 'Glutes'], [], P('2', '30s each', '15s', 'Hold', 2, 2)),
    ] },
    Calisthenics: { img: IMG.workout, cat: 'strength', list: [
      e('Push-Up', 'bodyweight', 'compound', 'push', ['Chest', 'Triceps'], ['Core'], P('4', '15-20', '60s', '2-0-1', 8, 7)),
      e('Pull-Up', 'bodyweight', 'compound', 'pull', ['Lats'], ['Biceps'], P('4', 'AMRAP', '90s', '2-0-1', 9, 9)),
      e('Chin-Up', 'bodyweight', 'compound', 'pull', ['Lats', 'Biceps'], [], P('3', 'AMRAP', '90s', '2-0-1', 8.5, 9)),
      e('Parallel Bar Dips', 'bodyweight', 'compound', 'push', ['Chest', 'Triceps'], [], P('4', 'AMRAP', '75s', '2-0-1', 8.5, 8)),
      e('Pistol Squat', 'bodyweight', 'compound', 'push', ['Quads', 'Glutes'], ['Core'], P('3', '6 each', '90s', '3-0-1', 9, 8)),
      e('Hanging Leg Raise', 'bodyweight', 'compound', 'pull', ['Lower Abs'], [], P('3', '12-15', '60s', '2-0-1', 8, 6)),
      e('Pike Push-Up', 'bodyweight', 'compound', 'push', ['Shoulders'], ['Triceps'], P('3', '10-12', '75s', '2-0-1', 8, 7)),
      e('Australian Row', 'bodyweight', 'compound', 'pull', ['Mid Back'], ['Biceps'], P('3', '12-15', '60s', '2-0-1', 7.5, 7)),
      e('Plank', 'bodyweight', 'isolation', 'static', ['Core'], [], P('3', '60s', '45s', 'Hold', 7, 4)),
      e('L-Sit Hold', 'bodyweight', 'isolation', 'static', ['Core', 'Hip Flexors'], [], P('3', '20s', '60s', 'Hold', 8.5, 5)),
      e('Handstand Hold', 'bodyweight', 'isolation', 'static', ['Shoulders'], ['Core'], P('3', '30s', '60s', 'Hold', 8, 6)),
      e('Bulgarian Split Squat', 'bodyweight', 'compound', 'push', ['Quads', 'Glutes'], [], P('3', '12 each', '60s', '2-0-1', 8, 8)),
      e('Diamond Push-Up', 'bodyweight', 'compound', 'push', ['Triceps'], ['Chest'], P('3', '12-15', '60s', '2-0-1', 8, 6)),
      e('Nordic Curl', 'bodyweight', 'isolation', 'pull', ['Hamstrings'], [], P('3', '6-8', '75s', '3-0-1', 9, 6)),
    ] },
    'Endurance Engine': { img: IMG.cardio, cat: 'cardio', list: [
      e('Steady-State Run', 'cardio', 'cardio', 'multi', ['Legs', 'Heart'], [], P('1', '20m', '-', 'Steady', 6, 12)),
      e('Rowing Intervals', 'cardio', 'cardio', 'multi', ['Full Body'], [], P('5', '500m', '90s', 'Hard', 8, 13)),
      e('Cycling', 'cardio', 'cardio', 'push', ['Quads', 'Calves'], [], P('1', '25m', '-', 'Steady', 6, 11)),
      e('Incline Treadmill Walk', 'cardio', 'cardio', 'push', ['Glutes', 'Calves'], [], P('1', '20m', '-', 'Steady', 5, 8)),
      e('Jump Rope', 'bodyweight', 'cardio', 'multi', ['Calves', 'Shoulders'], [], P('5', '2m', '45s', 'Steady', 7, 12)),
      e('Stair Climber', 'cardio', 'cardio', 'push', ['Quads', 'Glutes'], [], P('1', '15m', '-', 'Steady', 6, 11)),
      e('Tempo Run', 'cardio', 'cardio', 'multi', ['Legs', 'Heart'], [], P('1', '15m', '-', 'Tempo', 7.5, 13)),
      e('Elliptical', 'cardio', 'cardio', 'multi', ['Full Body'], [], P('1', '20m', '-', 'Steady', 5.5, 10)),
      e('Bear Crawl', 'bodyweight', 'compound', 'multi', ['Core', 'Shoulders'], [], P('4', '40s', '40s', 'Steady', 7, 9)),
      e('Sled Push', 'cardio', 'compound', 'push', ['Quads', 'Glutes'], ['Core'], P('5', '20m', '90s', 'Hard', 8.5, 13)),
      e('Shadow Boxing', 'bodyweight', 'cardio', 'multi', ['Shoulders', 'Core'], [], P('4', '3m', '60s', 'Steady', 7, 11)),
      e('Ruck March', 'cardio', 'cardio', 'push', ['Legs', 'Back'], [], P('1', '30m', '-', 'Steady', 6, 10)),
    ] },
  };

  const exByType = {};
  for (const [typeLabel, cfg] of Object.entries(TYPE_EX)) {
    const tId = typeBy[typeLabel];
    const mg = muscleId[`${typeLabel}:Full Body`];
    exByType[typeLabel] = cfg.list.map((def) => makeEx(tId, mg, cfg.img, def, cfg.cat));
  }

  await db.collection('exercises').insertMany(exerciseDocs);
  console.log(`  + ${exerciseDocs.length} exercises`);

  // ── 4) Workouts ───────────────────────────────────────────────────
  const sumSets = (exs) => exs.reduce((n, x) => n + (parseInt(x.presc.setsLabel, 10) || 3), 0);
  const itemFromEx = (ex, extra = {}) => ({
    type: 'exercise', exerciseId: ex.id, title: ex.name, thumbnailUrl: ex.thumb, showInfoIcon: true,
    setsLabel: `${ex.presc.setsLabel} Sets`, repsLabel: `${ex.presc.repsLabel}`,
    restLabel: (ex.presc.restLabel || '').toUpperCase(), tempo: ex.presc.tempo, rpe: ex.presc.rpe, ...extra,
  });
  const warmItem = (ex) => ({ type: 'exercise', exerciseId: ex.id, title: ex.name, thumbnailUrl: ex.thumb, showInfoIcon: true, setsLabel: `${ex.presc.setsLabel} Set`, repsLabel: ex.presc.repsLabel, tempo: ex.presc.tempo });
  const equipFrom = (defs) => {
    const set = new Set(defs.map((d) => EQUIP_NAME[d.eq] || d.eq));
    return [...set].slice(0, 5).map((name) => ({ name, icon: 'box', quantityLabel: '1', optional: name === 'Resistance Band' }));
  };

  const workoutDocs = [];

  // Hypertrophy: one workout per muscle, Main Block = all that muscle's exercises
  const hMeta = {
    Chest: ['Apex Foundation 4.0', 'CHEST/TRI', 80, 4.9, 1200, 128, 'ADVANCED'],
    Back: ['Titan Back Builder', 'BACK/BI', 82, 4.8, 980, 110, 'ADVANCED'],
    Shoulders: ['Boulder Shoulders', 'DELTS', 78, 4.7, 760, 95, 'INTERMEDIATE'],
    Biceps: ['Peak Biceps Pump', 'BICEPS', 85, 4.6, 540, 70, 'INTERMEDIATE'],
    Triceps: ['Horseshoe Triceps', 'TRICEPS', 84, 4.7, 560, 72, 'INTERMEDIATE'],
    Quads: ['Quad Annihilation', 'QUADS', 80, 4.9, 890, 130, 'ADVANCED'],
    Hamstrings: ['Hamstring Forge', 'HAMS', 80, 4.7, 620, 88, 'ADVANCED'],
    Glutes: ['Glute Architect', 'GLUTES', 82, 4.9, 1100, 160, 'INTERMEDIATE'],
    Calves: ['Calf Constructor', 'CALVES', 90, 4.5, 380, 60, 'BEGINNER'],
    Core: ['Core Reactor', 'CORE', 88, 4.8, 700, 200, 'INTERMEDIATE'],
    'Full Body': ['Total Body Apex', 'FULL BODY', 75, 4.8, 820, 190, 'INTERMEDIATE'],
  };
  for (const [muscleLabel, m] of Object.entries(hMeta)) {
    const exs = exByMuscle[muscleLabel];
    const [name, target, pct, rating, rc, times, lvl] = m;
    const dur = 30 + Math.round(exs.length * 3.5);
    workoutDocs.push(base({
      _id: oid(), name, imageUrl: muscleMeta[muscleLabel].img,
      description: `A complete ${muscleLabel.toLowerCase()} hypertrophy session — ${exs.length} movements engineered to fully develop the ${muscleLabel.toLowerCase()}.`,
      duration: dur, caloriesKcal: dur * 9, difficulty: lvl.toLowerCase(),
      goal: 'hypertrophy', levelLabel: lvl, creatorType: 'ai_coach', creatorName: 'AI Coach',
      rating, ratingCount: rc, timesCompleted: times, totalSets: sumSets(exs),
      targetMuscleLabel: target, targetMusclePercent: pct, isCatalog: true, popularity: times,
      workoutTypeId: hyperId, muscleGroupId: muscleId[`Hypertrophy:${muscleLabel}`],
      equipmentItems: equipFrom(HYP[muscleLabel]),
      sections: [
        { title: 'Warmup', totalExercises: 1, totalMinutes: 5, items: [warmItem(warm)] },
        { title: 'Main Block', totalExercises: exs.length, totalMinutes: dur - 10, items: exs.map((ex, i) => itemFromEx(ex, i === 0 ? { note: `Open strong — prioritize clean form on ${ex.name}.` } : {})) },
        { title: 'Cooldown', totalExercises: 1, totalMinutes: 5, items: [warmItem(cool)] },
      ],
    }));
  }

  // Other types: one workout each, Main Block = all the type's exercises
  const tMeta = {
    'Metabolic HIIT': ['Inferno Intervals', 'fat_loss', 'ALL LEVELS', 'FULL BODY', 90, 4.8, 860, 210],
    'Pure Strength': ['Iron Base Protocol', 'strength', 'ADVANCED', 'POSTERIOR', 85, 4.9, 430, 76],
    'Structural Flow': ['Mobility Reset', 'mobility', 'BEGINNER', 'FULL BODY', 70, 4.7, 612, 340],
    Calisthenics: ['Bodyweight Mastery', 'mixed', 'INT', 'UPPER BODY', 80, 4.8, 540, 188],
    'Endurance Engine': ['Aerobic Builder', 'endurance', 'ALL LEVELS', 'LEGS/CARDIO', 75, 4.6, 390, 142],
  };
  for (const [typeLabel, t] of Object.entries(tMeta)) {
    const exs = exByType[typeLabel];
    const [name, goal, lvl, target, pct, rating, rc, times] = t;
    const dur = 20 + Math.round(exs.length * 2.5);
    workoutDocs.push(base({
      _id: oid(), name, imageUrl: TYPE_EX[typeLabel].img,
      description: `${types.find((x) => x.label === typeLabel).description} A full ${exs.length}-movement ${typeLabel} session.`,
      duration: dur, caloriesKcal: dur * (goal === 'mobility' ? 4 : 9), difficulty: lvl === 'ALL LEVELS' ? 'intermediate' : lvl.toLowerCase().replace('int', 'intermediate'),
      goal, levelLabel: lvl, creatorType: 'ai_coach', creatorName: 'AI Coach',
      rating, ratingCount: rc, timesCompleted: times, totalSets: sumSets(exs),
      targetMuscleLabel: target, targetMusclePercent: pct, isCatalog: true, popularity: times,
      workoutTypeId: typeBy[typeLabel], muscleGroupId: muscleId[`${typeLabel}:Full Body`],
      equipmentItems: equipFrom(TYPE_EX[typeLabel].list),
      sections: [
        { title: 'Warmup', totalExercises: 1, totalMinutes: 5, items: [warmItem(warm)] },
        { title: 'Main Block', totalExercises: exs.length, totalMinutes: dur - 8, items: exs.map((ex) => itemFromEx(ex)) },
        { title: 'Cooldown', totalExercises: 1, totalMinutes: 5, items: [warmItem(cool)] },
      ],
    }));
  }

  await db.collection('workouts').insertMany(workoutDocs);
  console.log(`  + ${workoutDocs.length} workouts (11 Hypertrophy muscles + 5 type sessions)`);

  console.log('✅ Training catalog seeded.');
  await mongoose.disconnect();
}

main().catch(async (e) => {
  console.error('Seed failed:', e);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});
