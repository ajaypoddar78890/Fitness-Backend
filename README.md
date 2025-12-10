# 🏋️‍♀️ Fitness App - Hybrid MongoDB + Firebase Architecture

## 🚀 Architecture Overview

This fitness app uses a **hybrid architecture** combining the best of both worlds:

### 📊 **MongoDB** (Primary Data Storage)
- User profiles and preferences
- Workout plans and templates
- Nutrition data and meal plans
- Exercise history and logs
- Achievement tracking

### 🔥 **Firebase** (Authentication + Real-time Features)
- User authentication (Email, Google, Apple SSO)
- Real-time step counting
- Live workout tracking
- Heart rate monitoring
- Instant notifications
- Social features (workout sharing)

---

## 🎯 API Endpoints

### 🔐 Authentication (Firebase + MongoDB)
```
POST /auth/register              # Register with Firebase + MongoDB
POST /auth/login                 # Traditional login
POST /auth/verify-firebase-token # Verify Firebase ID token
GET  /auth/profile               # Get user profile (Firebase protected)
```

### 📱 Real-time Fitness Tracking (Firebase)
```
POST /fitness-tracking/steps            # Update daily steps
GET  /fitness-tracking/steps/:date      # Get steps for date
POST /fitness-tracking/heart-rate       # Log heart rate
GET  /fitness-tracking/heart-rate/recent # Get recent heart rate data
POST /fitness-tracking/live-workout     # Update live workout progress
GET  /fitness-tracking/live-workout     # Get current live workout
POST /fitness-tracking/notifications    # Send notification
GET  /fitness-tracking/notifications    # Get unread notifications
```

### 💪 Workouts (MongoDB)
```
POST /workouts              # Create workout plan
GET  /workouts/user/:uid    # Get user's workouts
GET  /workouts/:id          # Get specific workout
PUT  /workouts/:id          # Update workout
DELETE /workouts/:id        # Delete workout
```

### 🥗 Nutrition (MongoDB)
```
POST /nutrition             # Log nutrition data
GET  /nutrition/user/:uid   # Get user's nutrition logs
PUT  /nutrition/:id         # Update nutrition log
DELETE /nutrition/:id       # Delete nutrition log
```

---

## 🚀 Quick Start

1. **MongoDB**: ✅ Already connected!
2. **Firebase**: Configure these environment variables:
   ```env
   FIREBASE_PROJECT_ID=your-firebase-project-id
   FIREBASE_CLIENT_EMAIL=your-service-account-email
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-key\n-----END PRIVATE KEY-----"
   ```
3. **Start server**: `npm run start:dev`

Your fitness app now combines MongoDB's powerful querying with Firebase's real-time features! 🎯
