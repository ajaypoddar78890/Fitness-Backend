import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { randomUUID } from 'crypto';
import { Conversation, ConversationDocument } from '../../schemas/conversation.schema';
import { OpenaiService } from '../../services/openai.service';

/**
 * The fixed onboarding questionnaire. Order matters — we advance through it
 * one entry per user answer. Each question maps the selected option onto a
 * single field of the user profile.
 *
 *  - `field`      : which userProfile key this question fills.
 *  - `options`    : the allowed raw values the frontend renders as buttons.
 *  - `transform`  : converts the raw option into the value stored on the profile
 *                   (numbers / arrays where the schema needs them).
 */
interface TrainerQuestion {
  key: string;
  field: 'goal' | 'level' | 'daysPerWeek' | 'timePerSession' | 'equipment';
  question: string;
  options: string[];
  transform: (option: string) => any;
}

const QUESTIONS: TrainerQuestion[] = [
  {
    key: 'goal',
    field: 'goal',
    question: "What's your main fitness goal?",
    options: ['build_muscle', 'lose_fat', 'get_stronger', 'endurance'],
    transform: (o) => o,
  },
  {
    key: 'level',
    field: 'level',
    question: "What's your fitness level?",
    options: ['beginner', 'intermediate', 'advanced'],
    transform: (o) => o,
  },
  {
    key: 'daysPerWeek',
    field: 'daysPerWeek',
    question: 'How many days per week can you train?',
    options: ['2-3', '4-5', '6+'],
    // Store a representative number the workout generator can reason about.
    transform: (o) => ({ '2-3': 3, '4-5': 5, '6+': 6 }[o] ?? 3),
  },
  {
    key: 'timePerSession',
    field: 'timePerSession',
    question: 'How long per session?',
    options: ['30', '45-60', '90+'],
    transform: (o) => ({ '30': 30, '45-60': 60, '90+': 90 }[o] ?? 45),
  },
  {
    key: 'equipment',
    field: 'equipment',
    question: 'What equipment do you have?',
    options: ['home', 'full_gym', 'both', 'bodyweight'],
    // Stored as an array to match the SavedWorkout schema.
    transform: (o) => [o],
  },
];

/** In-memory mirror of a conversation, keyed by userId for fast access. */
interface ConversationState {
  conversationId: string;
  stage: 'asking_questions' | 'complete';
  questionIndex: number; // how many questions have been answered (0..5)
  userProfile: Record<string, any>;
}

@Injectable()
export class AiTrainerService {
  private readonly logger = new Logger(AiTrainerService.name);

  // Cache conversation state in memory so we don't hit Mongo on every turn.
  // Mongo remains the source of truth and is updated alongside the cache.
  private conversations: Map<string, ConversationState> = new Map();

  constructor(
    @InjectModel(Conversation.name) private conversationModel: Model<ConversationDocument>,
    private readonly openai: OpenaiService,
  ) {}

  /**
   * Begin a new conversation for a user and return the first question.
   * Any previous in-progress conversation for the same user is replaced.
   */
  async startConversation(userId: string, message: string) {
    const conversationId = randomUUID().replace(/-/g, '');
    const state: ConversationState = {
      conversationId,
      stage: 'asking_questions',
      questionIndex: 0,
      userProfile: {},
    };
    this.conversations.set(userId, state);

    const first = QUESTIONS[0];

    await this.conversationModel.create({
      userId,
      conversationId,
      stage: 'asking_questions',
      userProfile: {},
      messages: [
        { role: 'user', content: message || 'Generate', timestamp: new Date() },
        { role: 'assistant', content: first.question, timestamp: new Date() },
      ],
    });

    return {
      conversationId,
      stage: state.stage,
      question: first.question,
      options: first.options,
    };
  }

  /**
   * Record the user's answer to the current question, then either ask the next
   * question or — once all 5 are answered — generate the workout.
   */
  async respondToQuestion(userId: string, selectedOption: string) {
    const state = await this.getOrRestoreState(userId);
    if (!state) {
      throw new BadRequestException('No active conversation. Call /ai-trainer/start first.');
    }
    if (state.stage === 'complete') {
      throw new BadRequestException('This conversation is already complete.');
    }

    // The question being answered is always the first unanswered one. Driving
    // off the profile (instead of a separate counter) keeps things correct even
    // if the server restarted mid-chat or an answer is resent.
    const currentQuestion = this.firstUnanswered(state.userProfile);
    if (!currentQuestion) {
      throw new BadRequestException('No question is pending for this conversation.');
    }

    // Extract the structured value for the field this question fills.
    const value = this.extractUserInfo(currentQuestion, selectedOption);
    state.userProfile[currentQuestion.field] = value;
    state.questionIndex = QUESTIONS.filter(
      (q) => state.userProfile[q.field] !== undefined && state.userProfile[q.field] !== null,
    ).length;

    const messages = [
      { role: 'user', content: selectedOption, timestamp: new Date() },
    ];

    // More questions to ask?
    const next = this.firstUnanswered(state.userProfile);
    if (next) {
      messages.push({ role: 'assistant', content: next.question, timestamp: new Date() });
      await this.persist(userId, state, messages);

      return {
        stage: state.stage,
        question: next.question,
        options: next.options,
      };
    }

    // Profile complete → generate the workout.
    state.stage = 'complete';
    const preferences = this.buildPreferences(state.userProfile);
    const workout = await this.generateWorkoutInSchemaFormat(preferences);

    messages.push({
      role: 'assistant',
      content: 'Here is your personalized workout.',
      timestamp: new Date(),
    });
    await this.persist(userId, state, messages);

    return {
      stage: state.stage,
      workout,
    };
  }

  /**
   * Call GPT-5.4 to produce a workout that already matches the SavedWorkout
   * schema, then validate it before returning. No transformation is applied
   * downstream — what we return is saveable as-is.
   */
  async generateWorkoutInSchemaFormat(preferences: Record<string, any>) {
    const systemPrompt = 'You are a professional fitness trainer.';
    const userPrompt = this.buildWorkoutPrompt(preferences);

    const workout = await this.openai.chatJson<any>(systemPrompt, userPrompt, {
      temperature: 0.7,
      // A multi-day plan with form tips is large; a small cap truncates the JSON.
      maxTokens: 4000,
    });

    this.validateWorkoutSchema(workout);

    // Attach the preferences snapshot so the frontend can save it unchanged.
    workout.userPreferences = preferences;
    return workout;
  }

  // --- Private helpers -----------------------------------------------------

  /**
   * Map a selected option onto the structured value for a given question. The
   * options are constrained enums coming from buttons, so a deterministic map
   * is both correct and avoids a wasted AI round-trip.
   */
  private extractUserInfo(question: TrainerQuestion, answer: string): any {
    if (!question.options.includes(answer)) {
      throw new BadRequestException(
        `Invalid option "${answer}". Expected one of: ${question.options.join(', ')}`,
      );
    }
    return question.transform(answer);
  }

  /** The first question whose field isn't filled yet, or undefined when done. */
  private firstUnanswered(profile: Record<string, any>): TrainerQuestion | undefined {
    return QUESTIONS.find(
      (q) => profile[q.field] === undefined || profile[q.field] === null,
    );
  }

  /** True once all 5 questioned fields are present. */
  private isProfileComplete(profile: Record<string, any>): boolean {
    return !this.firstUnanswered(profile);
  }

  /** Shape the in-memory profile into the SavedWorkout `userPreferences` block. */
  private buildPreferences(profile: Record<string, any>) {
    return {
      goal: profile.goal,
      fitnessLevel: profile.level,
      daysPerWeek: profile.daysPerWeek,
      equipment: Array.isArray(profile.equipment) ? profile.equipment : [profile.equipment],
      injuries: profile.injuries && profile.injuries.length ? profile.injuries : ['none'],
      timePerSession: profile.timePerSession,
    };
  }

  private buildWorkoutPrompt(p: Record<string, any>): string {
    const equipment = Array.isArray(p.equipment) ? p.equipment.join(', ') : p.equipment;
    const injuries = Array.isArray(p.injuries) ? p.injuries.join(', ') : p.injuries;
    return `User Profile:
- Goal: ${p.goal}
- Level: ${p.fitnessLevel}
- Days/Week: ${p.daysPerWeek}
- Equipment: ${equipment}
- Injuries: ${injuries}
- Time/Session: ${p.timePerSession} mins

Generate a workout plan matching this MongoDB schema EXACTLY. "workoutPlan" is an
ARRAY with exactly ${p.daysPerWeek} day object(s) (one per training day). Keep each
day to 4-6 exercises and keep tips concise so the JSON stays complete:

{
  "name": "string",
  "description": "string",
  "workoutPlan": [
    {
      "day": 1,
      "name": "string",
      "focus": "string",
      "exercises": [
        {
          "name": "string",
          "sets": 4,
          "reps": 10,
          "weight": "string (e.g., 80kg)",
          "rest": 60,
          "formTips": ["tip1", "tip2"],
          "commonMistakes": ["mistake1", "mistake2"]
        }
      ]
    }
  ]
}

Return ONLY valid JSON. No markdown, no explanation.`;
  }

  /**
   * Guard the AI output against the schema we persist. Throws a 500 with a
   * user-safe message if anything required is missing or the wrong type.
   */
  private validateWorkoutSchema(workout: any): void {
    const fail = (reason: string) => {
      this.logger.error(`AI workout failed validation: ${reason}`);
      throw new InternalServerErrorException('The AI produced an invalid workout. Please try again.');
    };

    if (!workout || typeof workout !== 'object') fail('not an object');
    if (typeof workout.name !== 'string' || !workout.name.trim()) fail('missing name');

    // Accept either a single day object or an array of days; normalise to array.
    if (!Array.isArray(workout.workoutPlan)) {
      workout.workoutPlan = workout.workoutPlan ? [workout.workoutPlan] : [];
    }
    const days: any[] = workout.workoutPlan;
    if (days.length === 0) fail('missing workoutPlan');

    days.forEach((plan: any, d: number) => {
      if (!plan || typeof plan !== 'object') fail(`day[${d}] not an object`);
      if (typeof plan.name !== 'string' || !plan.name.trim()) fail(`day[${d}] missing name`);
      if (!Array.isArray(plan.exercises) || plan.exercises.length === 0) {
        fail(`day[${d}] missing exercises`);
      }

      plan.exercises.forEach((ex: any, i: number) => {
        if (typeof ex.name !== 'string' || !ex.name.trim()) fail(`day[${d}] exercise[${i}] missing name`);
        if (typeof ex.sets !== 'number') fail(`day[${d}] exercise[${i}] missing sets`);
        if (typeof ex.reps !== 'number') fail(`day[${d}] exercise[${i}] missing reps`);
        // Normalise optional array fields so the document always saves cleanly.
        ex.formTips = Array.isArray(ex.formTips) ? ex.formTips : [];
        ex.commonMistakes = Array.isArray(ex.commonMistakes) ? ex.commonMistakes : [];
      });

      if (typeof plan.day !== 'number') plan.day = d + 1;
    });

    if (typeof workout.description !== 'string') workout.description = '';
  }

  /** Load state from the in-memory cache, falling back to Mongo on a cold cache. */
  private async getOrRestoreState(userId: string): Promise<ConversationState | null> {
    const cached = this.conversations.get(userId);
    if (cached) return cached;

    const doc = await this.conversationModel
      .findOne({ userId })
      .sort({ createdAt: -1 })
      .exec();
    if (!doc) return null;

    const answered = QUESTIONS.filter(
      (q) => (doc.userProfile as any)?.[q.field] !== undefined && (doc.userProfile as any)?.[q.field] !== null,
    ).length;

    const state: ConversationState = {
      conversationId: doc.conversationId,
      stage: doc.stage as 'asking_questions' | 'complete',
      questionIndex: answered,
      userProfile: { ...(doc.userProfile as any) },
    };
    this.conversations.set(userId, state);
    return state;
  }

  /** Persist the latest state + appended messages to Mongo. */
  private async persist(userId: string, state: ConversationState, messages: any[]) {
    await this.conversationModel
      .updateOne(
        { conversationId: state.conversationId },
        {
          $set: { stage: state.stage, userProfile: state.userProfile },
          $push: { messages: { $each: messages } },
        },
      )
      .exec();
  }
}
