import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  FitnessActivity,
  FitnessActivityDocument,
} from '../../schemas/fitness-activity.schema';
import {
  FitnessGoal,
  FitnessGoalDocument,
} from '../../schemas/fitness-goal.schema';
import { UsersService } from '../users/users.service';
import { CreateFitnessActivityDto, UpdateGoalsDto } from './dto/fitness-activity.dto';

const DEFAULT_GOALS = {
  stepsGoal: 10000,
  caloriesGoal: 600,
  workoutDurationGoal: 45,
};

/** Normalize any date to UTC midnight so one day == one document. */
function startOfDayUTC(input: string | Date): Date {
  const d = new Date(input);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

function isSameUTCDay(a: Date, b: Date): boolean {
  return startOfDayUTC(a).getTime() === startOfDayUTC(b).getTime();
}

/** Shape returned to the client for a single day (real or zero-filled). */
function emptyDay(userId: Types.ObjectId, date: Date) {
  return {
    userId,
    date,
    steps: 0,
    caloriesBurned: 0,
    distanceKm: 0,
    workoutDurationMinutes: 0,
    activeHours: [],
  };
}

@Injectable()
export class FitnessActivityService {
  constructor(
    @InjectModel(FitnessActivity.name)
    private readonly activityModel: Model<FitnessActivityDocument>,
    @InjectModel(FitnessGoal.name)
    private readonly goalModel: Model<FitnessGoalDocument>,
    private readonly usersService: UsersService,
  ) {}

  /** Resolve the Mongo User._id from the firebase/jwt `uid` on the token. */
  private async resolveUserId(uid: string): Promise<Types.ObjectId> {
    const user = await this.usersService.findByUid(uid);
    if (!user) {
      throw new NotFoundException('User not found for the provided token');
    }
    return user._id as Types.ObjectId;
  }

  /** Single day for the authenticated user. Returns zero-filled day when none exists. */
  async getByDate(uid: string, dateStr: string) {
    const userId = await this.resolveUserId(uid);
    const date = startOfDayUTC(dateStr);
    const doc = await this.activityModel
      .findOne({ userId, date })
      .lean()
      .exec();
    return doc ?? emptyDay(userId, date);
  }

  /**
   * Last 7 days (inclusive of `endDateStr`, defaults to today).
   * Always returns exactly 7 entries oldest→newest, zero-filling missing days,
   * plus daily averages and the current activity streak.
   */
  async getWeek(uid: string, endDateStr?: string) {
    const userId = await this.resolveUserId(uid);
    const end = startOfDayUTC(endDateStr ? new Date(endDateStr) : new Date());
    const start = addDays(end, -6);

    const docs = await this.activityModel
      .find({ userId, date: { $gte: start, $lte: end } })
      .lean()
      .exec();

    const byDay = new Map<number, any>();
    for (const d of docs) {
      byDay.set(startOfDayUTC(d.date).getTime(), d);
    }

    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = addDays(start, i);
      days.push(byDay.get(date.getTime()) ?? emptyDay(userId, date));
    }

    const totals = days.reduce(
      (acc, d) => {
        acc.steps += d.steps || 0;
        acc.caloriesBurned += d.caloriesBurned || 0;
        acc.distanceKm += d.distanceKm || 0;
        acc.workoutDurationMinutes += d.workoutDurationMinutes || 0;
        return acc;
      },
      { steps: 0, caloriesBurned: 0, distanceKm: 0, workoutDurationMinutes: 0 },
    );

    const dailyAverages = {
      steps: Math.round(totals.steps / 7),
      caloriesBurned: Math.round(totals.caloriesBurned / 7),
      distanceKm: +(totals.distanceKm / 7).toFixed(2),
      workoutDurationMinutes: Math.round(totals.workoutDurationMinutes / 7),
    };

    const streak = await this.calculateStreak(userId, end);

    return { days, dailyAverages, totals, streak };
  }

  /**
   * Consecutive active days ending at (or one day before) `end`.
   * A day counts as active when it has any steps or workout time logged.
   */
  private async calculateStreak(
    userId: Types.ObjectId,
    end: Date,
  ): Promise<number> {
    const lookbackStart = addDays(end, -179); // up to ~6 months back
    const docs = await this.activityModel
      .find({
        userId,
        date: { $gte: lookbackStart, $lte: end },
        $or: [
          { steps: { $gt: 0 } },
          { workoutDurationMinutes: { $gt: 0 } },
        ],
      })
      .select('date')
      .lean()
      .exec();

    const activeDays = new Set(
      docs.map((d) => startOfDayUTC(d.date).getTime()),
    );

    let streak = 0;
    // Allow the streak to count from today or yesterday so it doesn't reset
    // before today's activity has synced.
    let cursor = end;
    if (!activeDays.has(end.getTime())) {
      cursor = addDays(end, -1);
    }
    while (activeDays.has(cursor.getTime())) {
      streak++;
      cursor = addDays(cursor, -1);
    }
    return streak;
  }

  /** Upsert one activity record per user per day. */
  async create(uid: string, dto: CreateFitnessActivityDto) {
    const userId = await this.resolveUserId(uid);
    const date = startOfDayUTC(dto.date);

    const update: any = {
      $setOnInsert: { userId, date },
      $set: {},
    };
    if (dto.steps != null) update.$set.steps = dto.steps;
    if (dto.caloriesBurned != null) update.$set.caloriesBurned = dto.caloriesBurned;
    if (dto.distanceKm != null) update.$set.distanceKm = dto.distanceKm;
    if (dto.workoutDurationMinutes != null)
      update.$set.workoutDurationMinutes = dto.workoutDurationMinutes;
    if (dto.activeHours != null) update.$set.activeHours = dto.activeHours;

    const doc = await this.activityModel
      .findOneAndUpdate({ userId, date }, update, {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      })
      .lean()
      .exec();

    return doc;
  }

  // ── Daily goals (targets) ──────────────────────────────────────────

  /** Get the user's daily targets, returning sensible defaults if unset. */
  async getGoals(uid: string) {
    const userId = await this.resolveUserId(uid);
    const doc = await this.goalModel.findOne({ userId }).lean().exec();
    if (!doc) {
      return { userId, ...DEFAULT_GOALS };
    }
    return {
      userId,
      stepsGoal: doc.stepsGoal ?? DEFAULT_GOALS.stepsGoal,
      caloriesGoal: doc.caloriesGoal ?? DEFAULT_GOALS.caloriesGoal,
      workoutDurationGoal: doc.workoutDurationGoal ?? DEFAULT_GOALS.workoutDurationGoal,
    };
  }

  /** Create or update the user's daily targets (one doc per user). */
  async updateGoals(uid: string, dto: UpdateGoalsDto) {
    const userId = await this.resolveUserId(uid);

    const set: any = {};
    if (dto.stepsGoal != null) set.stepsGoal = dto.stepsGoal;
    if (dto.caloriesGoal != null) set.caloriesGoal = dto.caloriesGoal;
    if (dto.workoutDurationGoal != null) set.workoutDurationGoal = dto.workoutDurationGoal;

    const doc = await this.goalModel
      .findOneAndUpdate(
        { userId },
        { $set: set, $setOnInsert: { userId } },
        { new: true, upsert: true, setDefaultsOnInsert: true },
      )
      .lean()
      .exec();

    return {
      userId,
      stepsGoal: doc.stepsGoal,
      caloriesGoal: doc.caloriesGoal,
      workoutDurationGoal: doc.workoutDurationGoal,
    };
  }
}
