import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FirebaseService {
  private app: admin.app.App;
  private firestore: admin.firestore.Firestore;

  constructor(private configService: ConfigService) {
    // Initialize Firebase Admin SDK
    if (!admin.apps.length) {
      this.app = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: this.configService.get<string>('FIREBASE_PROJECT_ID'),
          clientEmail: this.configService.get<string>('FIREBASE_CLIENT_EMAIL'),
          privateKey: this.configService.get<string>('FIREBASE_PRIVATE_KEY')?.replace(/\\n/g, '\n'),
        }),
        projectId: this.configService.get<string>('FIREBASE_PROJECT_ID'),
      });
    } else {
      this.app = admin.app();
    }

    this.firestore = this.app.firestore();
  }

  // Authentication methods
  async verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
    return this.app.auth().verifyIdToken(idToken);
  }

  async getUserByUid(uid: string): Promise<admin.auth.UserRecord> {
    return this.app.auth().getUser(uid);
  }

  async createUser(email: string, password: string, displayName?: string): Promise<admin.auth.UserRecord> {
    return this.app.auth().createUser({
      email,
      password,
      displayName,
    });
  }

  // Real-time data methods for fitness tracking
  async updateUserSteps(userId: string, steps: number, date: string): Promise<void> {
    const userStepsRef = this.firestore.collection('userSteps').doc(userId);
    await userStepsRef.set({
      [`steps_${date}`]: steps,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
  }

  async getUserSteps(userId: string, date: string): Promise<number> {
    const userStepsRef = this.firestore.collection('userSteps').doc(userId);
    const doc = await userStepsRef.get();
    
    if (doc.exists) {
      const data = doc.data();
      return data?.[`steps_${date}`] || 0;
    }
    return 0;
  }

  async updateLiveWorkout(userId: string, workoutData: any): Promise<void> {
    const liveWorkoutRef = this.firestore.collection('liveWorkouts').doc(userId);
    await liveWorkoutRef.set({
      ...workoutData,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
  }

  async getLiveWorkout(userId: string): Promise<any> {
    const liveWorkoutRef = this.firestore.collection('liveWorkouts').doc(userId);
    const doc = await liveWorkoutRef.get();
    return doc.exists ? doc.data() : null;
  }

  async updateHeartRate(userId: string, heartRate: number): Promise<void> {
    const heartRateRef = this.firestore.collection('heartRateData').doc(userId);
    await heartRateRef.collection('readings').add({
      heartRate,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  async getRecentHeartRate(userId: string, limit: number = 10): Promise<any[]> {
    const heartRateRef = this.firestore.collection('heartRateData').doc(userId).collection('readings');
    const snapshot = await heartRateRef.orderBy('timestamp', 'desc').limit(limit).get();
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  // Real-time notifications
  async sendNotification(userId: string, title: string, body: string, data?: any): Promise<void> {
    const notificationRef = this.firestore.collection('notifications').doc(userId).collection('userNotifications');
    await notificationRef.add({
      title,
      body,
      data: data || {},
      read: false,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  async getUnreadNotifications(userId: string): Promise<any[]> {
    const notificationRef = this.firestore.collection('notifications').doc(userId).collection('userNotifications');
    const snapshot = await notificationRef.where('read', '==', false).orderBy('timestamp', 'desc').get();
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async markNotificationAsRead(userId: string, notificationId: string): Promise<void> {
    const notificationRef = this.firestore
      .collection('notifications')
      .doc(userId)
      .collection('userNotifications')
      .doc(notificationId);
    
    await notificationRef.update({ read: true });
  }

  // Real-time workout sharing
  async shareWorkoutProgress(userId: string, workoutId: string, progress: any): Promise<void> {
    const sharedWorkoutRef = this.firestore.collection('sharedWorkouts').doc(`${userId}_${workoutId}`);
    await sharedWorkoutRef.set({
      userId,
      workoutId,
      progress,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  async getSharedWorkouts(friendsList: string[]): Promise<any[]> {
    if (friendsList.length === 0) return [];

    const sharedWorkoutsRef = this.firestore.collection('sharedWorkouts');
    const snapshot = await sharedWorkoutsRef
      .where('userId', 'in', friendsList)
      .orderBy('timestamp', 'desc')
      .limit(20)
      .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}